#!/usr/bin/env python3
"""
Smoke-test every page in headless Chrome, no dependencies beyond Python and Chrome.

    python3 tools/check.py            # run all checks
    python3 tools/check.py --shots    # also save screenshots to tools/shots/

It serves the repo folder on a local port, drives Chrome over the DevTools
protocol with a tiny hand-rolled websocket client, and prints PASS / FAIL
per check. Exit code 1 if anything failed.
"""

import base64
import json
import os
import shutil
import socket
import struct
import subprocess
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT_HTTP = 8765
PORT_CDP = 9333
CHROME = next((c for c in ('google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser') if shutil.which(c)), None)
SHOTS = '--shots' in sys.argv
SHOT_DIR = os.path.join(ROOT, 'tools', 'shots')

if not CHROME:
    sys.exit('no Chrome/Chromium binary found on PATH')

# ---------- servers ----------
http_proc = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT_HTTP), '--bind', '127.0.0.1'], cwd=ROOT,
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
profile = os.path.join('/tmp', 'portfolio-check-profile')
shutil.rmtree(profile, ignore_errors=True)
chrome_proc = subprocess.Popen([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
                                f'--remote-debugging-port={PORT_CDP}', '--window-size=1366,800',
                                f'--user-data-dir={profile}', 'about:blank'],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
BASE = f'http://127.0.0.1:{PORT_HTTP}/'

for _ in range(50):
    try:
        targets = json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT_CDP}/json'))
        break
    except Exception:
        time.sleep(0.2)
else:
    sys.exit('Chrome did not start')

# ---------- minimal websocket client ----------
page = next(t for t in targets if t['type'] == 'page')
path = page['webSocketDebuggerUrl'].split(f':{PORT_CDP}', 1)[1]
sock = socket.create_connection(('127.0.0.1', PORT_CDP))
sock.settimeout(15)
key = base64.b64encode(os.urandom(16)).decode()
sock.send(f'GET {path} HTTP/1.1\r\nHost: 127.0.0.1:{PORT_CDP}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n'
          f'Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n'.encode())
buf = b''
while b'\r\n\r\n' not in buf:
    buf += sock.recv(4096)
buf = buf.split(b'\r\n\r\n', 1)[1]


def send(obj):
    data = json.dumps(obj).encode()
    n = len(data)
    hdr = bytes([0x81]) + (bytes([0x80 | n]) if n < 126 else bytes([0x80 | 126]) + struct.pack('>H', n) if n < 65536 else bytes([0x80 | 127]) + struct.pack('>Q', n))
    mask = os.urandom(4)
    sock.send(hdr + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))


def readn(n):
    global buf
    while len(buf) < n:
        chunk = sock.recv(1 << 16)
        if not chunk:
            raise SystemExit('socket closed')
        buf += chunk
    out, buf = buf[:n], buf[n:]
    return out


def recv():
    frag = b''
    while True:
        h = readn(2)
        fin, n = h[0] & 0x80, h[1] & 0x7F
        if n == 126:
            n = struct.unpack('>H', readn(2))[0]
        elif n == 127:
            n = struct.unpack('>Q', readn(8))[0]
        frag += readn(n)
        if fin:
            return json.loads(frag)


events, mid = [], 0


def call(method, **params):
    global mid
    mid += 1
    send({'id': mid, 'method': method, 'params': params})
    while True:
        m = recv()
        if m.get('id') == mid:
            return m.get('result', m)
        events.append(m)


def ev(expr):
    r = call('Runtime.evaluate', expression=expr, returnByValue=True, awaitPromise=True)
    if 'exceptionDetails' in r:
        raise RuntimeError(r['exceptionDetails'].get('exception', {}).get('description', 'evaluate failed')[:300])
    return r.get('result', {}).get('value')


def sleep(t):
    sock.settimeout(0.1)
    end = time.time() + t
    while time.time() < end:
        try:
            events.append(recv())
        except socket.timeout:
            pass
    sock.settimeout(15)


def key_press(k, code, vk):
    call('Input.dispatchKeyEvent', type='keyDown', key=k, code=code, windowsVirtualKeyCode=vk, text=k if len(k) == 1 else '')
    call('Input.dispatchKeyEvent', type='keyUp', key=k, code=code, windowsVirtualKeyCode=vk)


def shot(name):
    if not SHOTS:
        return
    os.makedirs(SHOT_DIR, exist_ok=True)
    r = call('Page.captureScreenshot', format='png')
    open(os.path.join(SHOT_DIR, name), 'wb').write(base64.b64decode(r['data']))


def mobile(on):
    if on:
        call('Emulation.setDeviceMetricsOverride', width=390, height=844, deviceScaleFactor=1, mobile=True)
    else:
        call('Emulation.clearDeviceMetricsOverride')


def errors_since(n):
    out = []
    for e in events[n:]:
        if e.get('method') == 'Runtime.exceptionThrown':
            out.append(e['params']['exceptionDetails'].get('exception', {}).get('description', '?')[:200])
        elif e.get('method') == 'Log.entryAdded' and e['params']['entry'].get('level') == 'error':
            text = e['params']['entry'].get('text', '')
            if 'fonts.g' not in text and 'githubassets' not in text and 'cdn.jsdelivr' not in text:
                out.append(text[:200])
    return out


call('Runtime.enable')
call('Log.enable')
call('Page.enable')

# ---------- checks ----------
results = []


def check(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + (f'  ({detail})' if detail and not cond else ''))


try:
    # landing
    mark = len(events)
    mobile(False)
    call('Page.navigate', url=BASE + 'index.html')
    sleep(0.8)
    check('landing: menu hidden during the intro', ev("document.getElementById('choices').hidden"))
    sleep(3.2)
    check('landing: intro finished and menu shown', ev("!document.getElementById('choices').hidden && document.getElementById('hdr').textContent.endsWith(':')"))
    key_press('ArrowDown', 'ArrowDown', 40)
    sleep(0.2)
    check('landing: arrow selects the second choice', ev("document.querySelector('.choice.sel').dataset.choice === 'read'"))
    check('landing: JSON-LD person present', ev("!!document.querySelector('script[type=\"application/ld+json\"]')"))
    check('landing: no console errors', not errors_since(mark), '; '.join(errors_since(mark)))
    shot('landing.png')

    # desktop
    mark = len(events)
    call('Page.navigate', url=BASE + 'desktop.html')
    sleep(0.4)
    key_press('a', 'KeyA', 65)
    sleep(0.9)
    check('desktop: boot skipped and readme open', ev("[...document.querySelectorAll('.window.open')].map(w=>w.id).includes('about-window')"))
    ev("openWindow('projects-window')")
    sleep(0.4)
    check('desktop: projects rendered', ev("document.querySelectorAll('.project').length") >= 20)
    ev("document.querySelectorAll('.chip')[3].click()")
    check('desktop: filter chip works', ev("document.querySelectorAll('.project').length") < 20)
    ev("openPreview(PROJECTS.find(p=>p.name==='Amazed'))")
    sleep(0.8)
    check('desktop: preview runs a canvas', ev("!!document.querySelector('#preview-stage canvas')"))
    ev("closeWindow('preview-window'); openWindow('terminal-window'); runCommand('help'); runCommand('nope')")
    sleep(0.3)
    check('desktop: terminal answers', ev("document.querySelector('#shell-output').textContent.includes('command not found')"))
    ev("toggleMaximize(document.getElementById('terminal-window'))")
    sleep(0.2)
    check('desktop: maximise fills the screen', ev("Math.round(document.getElementById('terminal-window').getBoundingClientRect().width)") >= ev("innerWidth") - 30)
    ev("toggleMaximize(document.getElementById('terminal-window')); minimizeWindow('terminal-window')")
    sleep(0.3)
    check('desktop: minimise hides but keeps taskbar button', ev("getComputedStyle(document.getElementById('terminal-window')).display === 'none' && !!document.querySelector('.task-btn.minimized')"))
    ev("openWindow('terminal-window')")
    check('desktop: taskbar restores a minimised window', ev("getComputedStyle(document.getElementById('terminal-window')).display !== 'none'"))
    ev("openWindow('experience-window')")
    sleep(0.3)
    check('desktop: experience rendered from content.js', ev("document.querySelectorAll('#xp-root .xp-card').length") >= 5)
    ev("I18N.set('fr')")
    sleep(0.2)
    check('desktop: French switch', ev("document.getElementById('bar-hint').textContent").startswith('cliquez'))
    ev("I18N.set('en')")
    check('desktop: no console errors', not errors_since(mark), '; '.join(errors_since(mark)))
    shot('desktop.png')

    # quick read
    mark = len(events)
    call('Page.navigate', url=BASE + 'read.html')
    sleep(1.2)
    check('read: experience folds rendered', ev("document.querySelectorAll('.xp-fold').length") >= 5)
    check('read: favourites with previews', ev("document.querySelectorAll('.pv-card').length") >= 20)
    ev("document.querySelector('#projects').scrollIntoView()")
    sleep(1.2)
    check('read: previews start when scrolled into view', ev("document.querySelectorAll('.pv-stage canvas, .pv-stage .term, .pv-stage iframe').length") >= 2)
    ev("I18N.set('fr')")
    sleep(0.3)
    check('read: French switch', ev("document.title").endswith('lecture rapide'))
    ev("I18N.set('en')")
    check('read: no console errors', not errors_since(mark), '; '.join(errors_since(mark)))
    shot('read.png')

    # deep links
    mark = len(events)
    call('Page.navigate', url=BASE + 'desktop.html#amazed')
    sleep(1.4)
    check('deep link: desktop.html#amazed opens the preview', ev("document.getElementById('preview-window').classList.contains('open') && document.getElementById('preview-name').textContent === 'Amazed'"))
    ev("document.getElementById('preview-copy').click()")
    sleep(0.3)
    check('deep link: copy button shows a toast', ev("document.getElementById('toast')?.classList.contains('show')"))
    call('Page.navigate', url=BASE + 'read.html#organized')
    sleep(1.6)
    check('deep link: read.html#organized opens its fold', ev("document.getElementById('organized').closest('details.fold').open"))
    call('Page.navigate', url=BASE + 'index.html#amazed')
    sleep(1.6)
    check('deep link: landing forwards #amazed to the desktop', ev("location.pathname.endsWith('desktop.html') && document.getElementById('preview-name').textContent === 'Amazed'"))
    call('Page.navigate', url=BASE + '404.html')
    sleep(0.6)
    check('deep link: 404 page renders', ev("document.querySelectorAll('.choice').length") == 2)
    check('deep link: no console errors', not errors_since(mark), '; '.join(errors_since(mark)))

    # phone widths
    mark = len(events)
    mobile(True)
    for name in ('index.html', 'desktop.html', 'read.html'):
        call('Page.navigate', url=BASE + name)
        sleep(1.4 if name != 'index.html' else 3.8)
        check(f'phone: {name} has no horizontal overflow', ev("document.documentElement.scrollWidth <= innerWidth"))
        shot('phone-' + name.replace('.html', '.png'))
    check('phone: no console errors', not errors_since(mark), '; '.join(errors_since(mark)))
    mobile(False)

    # static files
    for f in ('robots.txt', 'sitemap.xml', 'og.png', '404.html', 'navigate.py'):
        code = urllib.request.urlopen(BASE + f).getcode()
        check(f'static: {f} served', code == 200)
except Exception as exc:  # noqa: BLE001
    check('suite ran to the end', False, str(exc))
finally:
    chrome_proc.terminate()
    http_proc.terminate()

failed = [n for n, ok in results if not ok]
print(f'\n{len(results) - len(failed)}/{len(results)} passed' + (f', failed: {", ".join(failed)}' if failed else ''))
sys.exit(1 if failed else 0)
