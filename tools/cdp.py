"""
Tiny headless-Chrome driver over the DevTools protocol. No dependencies.
Used by check.py (smoke tests) and build.py (renders content.js to static text).
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

CHROME = next((c for c in ('google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser') if shutil.which(c)), None)


class Browser:
    def __init__(self, root, http_port=8765, cdp_port=9333, window='1366,800'):
        if not CHROME:
            sys.exit('no Chrome/Chromium binary found on PATH')
        self.root = root
        self.base = f'http://127.0.0.1:{http_port}/'
        self.http = subprocess.Popen([sys.executable, '-m', 'http.server', str(http_port), '--bind', '127.0.0.1'], cwd=root,
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        profile = os.path.join('/tmp', f'portfolio-cdp-{cdp_port}')
        shutil.rmtree(profile, ignore_errors=True)
        self.chrome = subprocess.Popen([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
                                        f'--remote-debugging-port={cdp_port}', f'--window-size={window}',
                                        f'--user-data-dir={profile}', 'about:blank'],
                                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(50):
            try:
                targets = json.load(urllib.request.urlopen(f'http://127.0.0.1:{cdp_port}/json'))
                break
            except Exception:
                time.sleep(0.2)
        else:
            self.close()
            sys.exit('Chrome did not start')
        page = next(t for t in targets if t['type'] == 'page')
        path = page['webSocketDebuggerUrl'].split(f':{cdp_port}', 1)[1]
        self.sock = socket.create_connection(('127.0.0.1', cdp_port))
        self.sock.settimeout(15)
        key = base64.b64encode(os.urandom(16)).decode()
        self.sock.send(f'GET {path} HTTP/1.1\r\nHost: 127.0.0.1:{cdp_port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n'
                       f'Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n'.encode())
        self.buf = b''
        while b'\r\n\r\n' not in self.buf:
            self.buf += self.sock.recv(4096)
        self.buf = self.buf.split(b'\r\n\r\n', 1)[1]
        self.events = []
        self.mid = 0
        self.call('Runtime.enable')
        self.call('Log.enable')
        self.call('Page.enable')

    # ---- websocket framing
    def _send(self, obj):
        data = json.dumps(obj).encode()
        n = len(data)
        if n < 126:
            hdr = bytes([0x81, 0x80 | n])
        elif n < 65536:
            hdr = bytes([0x81, 0x80 | 126]) + struct.pack('>H', n)
        else:
            hdr = bytes([0x81, 0x80 | 127]) + struct.pack('>Q', n)
        mask = os.urandom(4)
        self.sock.send(hdr + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

    def _readn(self, n):
        while len(self.buf) < n:
            chunk = self.sock.recv(1 << 16)
            if not chunk:
                raise SystemExit('socket closed')
            self.buf += chunk
        out, self.buf = self.buf[:n], self.buf[n:]
        return out

    def _recv(self):
        frag = b''
        while True:
            h = self._readn(2)
            fin, n = h[0] & 0x80, h[1] & 0x7F
            if n == 126:
                n = struct.unpack('>H', self._readn(2))[0]
            elif n == 127:
                n = struct.unpack('>Q', self._readn(8))[0]
            frag += self._readn(n)
            if fin:
                return json.loads(frag)

    # ---- protocol helpers
    def call(self, method, **params):
        self.mid += 1
        self._send({'id': self.mid, 'method': method, 'params': params})
        while True:
            m = self._recv()
            if m.get('id') == self.mid:
                return m.get('result', m)
            self.events.append(m)

    def ev(self, expr):
        r = self.call('Runtime.evaluate', expression=expr, returnByValue=True, awaitPromise=True)
        if 'exceptionDetails' in r:
            raise RuntimeError(r['exceptionDetails'].get('exception', {}).get('description', 'evaluate failed')[:300])
        return r.get('result', {}).get('value')

    def sleep(self, t):
        self.sock.settimeout(0.1)
        end = time.time() + t
        while time.time() < end:
            try:
                self.events.append(self._recv())
            except socket.timeout:
                pass
        self.sock.settimeout(15)

    def goto(self, path, wait=1.0):
        self.call('Page.navigate', url=self.base + path)
        self.sleep(wait)

    def key(self, k, code, vk):
        self.call('Input.dispatchKeyEvent', type='keyDown', key=k, code=code, windowsVirtualKeyCode=vk, text=k if len(k) == 1 else '')
        self.call('Input.dispatchKeyEvent', type='keyUp', key=k, code=code, windowsVirtualKeyCode=vk)

    def shot(self, path):
        r = self.call('Page.captureScreenshot', format='png')
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, 'wb').write(base64.b64decode(r['data']))

    def mobile(self, on):
        if on:
            self.call('Emulation.setDeviceMetricsOverride', width=390, height=844, deviceScaleFactor=1, mobile=True)
        else:
            self.call('Emulation.clearDeviceMetricsOverride')

    def errors_since(self, n):
        out = []
        for e in self.events[n:]:
            if e.get('method') == 'Runtime.exceptionThrown':
                out.append(e['params']['exceptionDetails'].get('exception', {}).get('description', '?')[:200])
            elif e.get('method') == 'Log.entryAdded' and e['params']['entry'].get('level') == 'error':
                text = e['params']['entry'].get('text', '')
                if 'fonts.g' not in text and 'githubassets' not in text and 'cdn.jsdelivr' not in text and 'goatcounter' not in text and 'zgo.at' not in text:
                    out.append(text[:200])
        return out

    def close(self):
        for p in (getattr(self, 'chrome', None), getattr(self, 'http', None)):
            if p:
                p.terminate()
