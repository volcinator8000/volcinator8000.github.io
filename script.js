/* ============================================================
   Khalil's desktop — everything lives in this one file.
   Sections: data · boot · windows · clock · projects · terminal
   ============================================================ */

'use strict';

/* ---------- data ---------- */

// PROJECTS, CATEGORIES, EXPERIENCE and GITHUB come from content.js

/* ---------- helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const isMobile = () => window.innerWidth <= 768;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- boot ---------- */

const BOOT_LINES = [
  ['[  OK  ] ', 'Kernel: Linux x86_64'],
  ['[  OK  ] ', 'User: volcinator8000 (Khalil Almwakeh)'],
  ['[  OK  ] ', 'Mounting /home/khalil'],
  ['[  OK  ] ', 'Loading portfolio.service'],
  ['', 'Welcome.'],
];

let bootDone = false;

function finishBoot() {
  if (bootDone) return;
  bootDone = true;

  const boot = $('#boot-screen');
  const desktop = $('#desktop');
  desktop.hidden = false;
  boot.classList.add('fade');
  setTimeout(() => boot.remove(), 450);

  document.removeEventListener('keydown', finishBoot);

  // Give the visitor something to read right away (desktop only —
  // on a phone a full-screen window would hide the icons).
  if (!isMobile()) {
    setTimeout(() => openWindow('about-window'), 250);
  }
}

function runBoot() {
  const out = $('#boot-text');
  const boot = $('#boot-screen');
  let fromLanding = false;
  try { fromLanding = sessionStorage.getItem('fromLanding') === '1'; sessionStorage.removeItem('fromLanding'); } catch (e) { /* ignore */ }
  if (fromLanding) { finishBoot(); return; }
  const step = reducedMotion ? 0 : 180;

  boot.addEventListener('click', finishBoot);
  document.addEventListener('keydown', finishBoot);

  BOOT_LINES.forEach(([tag, text], i) => {
    setTimeout(() => {
      if (bootDone) return;
      const line = document.createElement('div');
      if (tag) {
        const t = document.createElement('span');
        t.className = 'ok';
        t.textContent = tag;
        line.appendChild(t);
      }
      line.appendChild(document.createTextNode(text));
      if (!tag) line.className = 'dim';
      out.appendChild(line);
    }, step * i);
  });

  setTimeout(finishBoot, step * BOOT_LINES.length + 400);
}

/* ---------- windows ---------- */

let zIndexCounter = 100;
let cascade = 0;
const openOrder = []; // most recently focused last

function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  if (!win.classList.contains('open')) {
    win.classList.add('open');
    placeWindow(win);
    requestAnimationFrame(() => win.classList.add('active'));
  }
  focusWindow(win);

  if (id === 'terminal-window') {
    setTimeout(() => $('#shell-input').focus(), 50);
  }
  if (id === 'python-window') {
    setTimeout(() => { setupPython(); drawMap(); }, 50);
  }
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win || !win.classList.contains('open')) return;

  win.classList.remove('active', 'focused');
  if (id === 'preview-window') stopPreview();
  const idx = openOrder.indexOf(win);
  if (idx > -1) openOrder.splice(idx, 1);

  setTimeout(() => {
    win.classList.remove('open');
    updateTaskbar();
  }, reducedMotion ? 0 : 180);

  // hand focus to whatever is underneath
  const next = openOrder[openOrder.length - 1];
  if (next) focusWindow(next);
  else updateTaskbar();
}

function focusWindow(win) {
  if (!win) return;
  zIndexCounter += 1;
  win.style.zIndex = zIndexCounter;

  const idx = openOrder.indexOf(win);
  if (idx > -1) openOrder.splice(idx, 1);
  openOrder.push(win);

  $$('.window').forEach((w) => w.classList.toggle('focused', w === win));
  updateTaskbar();
}

function placeWindow(win) {
  if (isMobile()) {
    win.style.left = '';
    win.style.top = '';
    return;
  }

  const barH = $('#top-bar').offsetHeight;
  const w = win.offsetWidth;
  const h = win.offsetHeight;
  const offset = (cascade % 5) * 32;
  cascade += 1;

  let left = (window.innerWidth - w) / 2 + 40 + offset;
  let top = barH + (window.innerHeight - barH - h) / 2 + offset - 20;

  left = Math.max(16, Math.min(left, window.innerWidth - w - 16));
  top = Math.max(barH + 8, Math.min(top, window.innerHeight - h - 16));

  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
}

function keepOnScreen(win) {
  if (!win.classList.contains('open')) return;
  if (isMobile()) {
    win.style.left = '';
    win.style.top = '';
    return;
  }
  const barH = $('#top-bar').offsetHeight;
  const rect = win.getBoundingClientRect();
  const left = Math.max(16, Math.min(rect.left, window.innerWidth - rect.width - 16));
  const top = Math.max(barH + 8, Math.min(rect.top, window.innerHeight - rect.height - 16));
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
}

function enableDragging() {
  $$('.title-bar').forEach((bar) => {
    bar.addEventListener('pointerdown', (e) => {
      if (isMobile() || e.target.closest('button')) return;

      const win = bar.parentElement;
      focusWindow(win);

      const rect = win.getBoundingClientRect();
      const shiftX = e.clientX - rect.left;
      const shiftY = e.clientY - rect.top;
      const barH = $('#top-bar').offsetHeight;

      win.classList.add('dragging');
      bar.setPointerCapture(e.pointerId);

      const onMove = (ev) => {
        const left = Math.max(-rect.width + 80, Math.min(ev.clientX - shiftX, window.innerWidth - 80));
        const top = Math.max(barH, Math.min(ev.clientY - shiftY, window.innerHeight - 40));
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
      };

      const stop = () => {
        bar.removeEventListener('pointermove', onMove);
        bar.removeEventListener('pointerup', stop);
        bar.removeEventListener('pointercancel', stop);
        win.classList.remove('dragging');
      };

      bar.addEventListener('pointermove', onMove);
      bar.addEventListener('pointerup', stop);
      bar.addEventListener('pointercancel', stop);
    });
  });
}

function updateTaskbar() {
  const bar = $('#taskbar');
  const hint = $('#bar-hint');
  const open = $$('.window.open');

  $$('.task-btn', bar).forEach((b) => b.remove());
  hint.hidden = open.length > 0;

  open.forEach((win) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'task-btn' + (win.classList.contains('focused') ? ' focused' : '');
    btn.textContent = win.dataset.title || win.id;
    btn.addEventListener('click', () => openWindow(win.id));
    bar.appendChild(btn);
  });
}

/* ---------- clock ---------- */

function tickClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  $('#clock').textContent = `${hh}:${mm}`;
}

/* ---------- projects ---------- */

let activeFilter = 'all';

function renderFilters() {
  const box = $('#filters');
  box.innerHTML = '';
  Object.entries(CATEGORIES).forEach(([key, label]) => {
    const n = key === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.cat === key).length;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.setAttribute('role', 'tab');
    chip.setAttribute('aria-selected', String(key === activeFilter));
    chip.textContent = `${label} ${n}`;
    chip.addEventListener('click', () => {
      activeFilter = key;
      renderFilters();
      renderProjects();
    });
    box.appendChild(chip);
  });
}

function renderProjects() {
  const list = $('#project-list');
  list.innerHTML = '';

  const shown = PROJECTS.filter((p) => activeFilter === 'all' || p.cat === activeFilter);
  $('#project-count').textContent = `${shown.length} item${shown.length === 1 ? '' : 's'}`;

  shown.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'project' + (p.featured && activeFilter === 'all' ? ' featured' : '');
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    el.addEventListener('click', () => openPreview(p));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPreview(p); }
    });

    const icon = fileBadge(p.ext);

    const body = document.createElement('div');
    body.className = 'project-body';

    const name = document.createElement('div');
    name.className = 'project-name';
    name.textContent = p.name;
    if (hasPreview(p)) {
      const play = document.createElement('span');
      play.className = 'play';
      play.textContent = p.name === 'Navigate' ? 'run' : 'preview';
      name.appendChild(play);
    }
    if (p.link) {
      const ext = document.createElement('a');
      ext.className = 'ext';
      ext.href = p.link;
      ext.target = '_blank';
      ext.rel = 'noopener';
      ext.textContent = 'github ↗';
      ext.addEventListener('click', (e) => e.stopPropagation());
      name.appendChild(ext);
    }

    const blurb = document.createElement('p');
    blurb.className = 'project-blurb';
    blurb.textContent = p.blurb;

    const tags = document.createElement('div');
    tags.className = 'tags';
    if (p.featured) {
      const s = document.createElement('span');
      s.className = 'tag star';
      s.textContent = '★ favourite';
      tags.appendChild(s);
    }
    p.tech.forEach((t) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = t;
      tags.appendChild(tag);
    });

    body.append(name, blurb, tags);
    el.append(icon, body);
    list.appendChild(el);
  });
}

function fileBadge(ext) {
  const b = document.createElement('span');
  b.className = 'file-ext';
  b.dataset.ext = ext;
  b.textContent = ext === 'web' || ext === 'ai' ? ext : `.${ext}`;
  return b;
}

/* ---------- experience window (rendered from content.js) ---------- */

function renderExperience() {
  const root = $('#xp-root');
  if (!root || typeof EXPERIENCE === 'undefined') return;
  root.innerHTML = renderExperienceHTML(EXPERIENCE);
}

/* ---------- project preview window ---------- */

let previewCleanup = null;

function hasPreview(p) {
  return p.name === 'Navigate' || typeof PREVIEWS[p.name] === 'function';
}

function openPreview(p) {
  if (p.name === 'Navigate') { openWindow('python-window'); return; }

  stopPreview();
  $('#preview-title').textContent = `~/projects/${p.name.toLowerCase().replace(/\s+/g, '-')}`;
  const iconSlot = $('#preview-icon');
  iconSlot.innerHTML = '';
  iconSlot.appendChild(fileBadge(p.ext));
  $('#preview-name').textContent = p.name;
  $('#preview-blurb').textContent = p.blurb;

  const tags = $('#preview-tags');
  tags.innerHTML = '';
  p.tech.forEach((t) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = t;
    tags.appendChild(tag);
  });

  const link = $('#preview-link');
  link.hidden = !p.link;
  if (p.link) link.href = p.link;

  const live = $('#preview-live');
  const liveUrl = PREVIEW_LIVE[p.name];
  live.hidden = !liveUrl;
  if (liveUrl) live.href = liveUrl;

  const stage = $('#preview-stage');
  stage.innerHTML = '';
  $('#preview-note').textContent = PREVIEW_NOTES[p.name] || '';

  openWindow('preview-window');

  const run = PREVIEWS[p.name];
  if (run) {
    // wait a frame so the stage has its final size before canvases measure it
    requestAnimationFrame(() => {
      if (!$('#preview-window').classList.contains('open')) return;
      try {
        previewCleanup = run(stage) || null;
      } catch (err) {
        console.error('preview failed', p.name, err);
        emptyStage(stage, 'preview crashed', [String(err.message || err)]);
      }
    });
  } else {
    emptyStage(stage, 'no preview yet', [
      p.link ? 'the code is on GitHub, link above' : 'this one lives in a private Epitech repo',
    ]);
    $('#preview-note').textContent = '';
  }
}

function stopPreview() {
  if (previewCleanup) {
    try { previewCleanup(); } catch (e) { /* ignore */ }
    previewCleanup = null;
  }
  $('#preview-stage').innerHTML = '';
}

/* ---------- navigate.py: real Python through Pyodide ---------- */

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
let pyodideReady = null;   // promise
let pyNetwork = null;
let pyLastRoute = null;

function loadPyodideOnce() {
  if (pyodideReady) return pyodideReady;
  pyodideReady = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PYODIDE_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('could not download the Python runtime'));
    document.head.appendChild(script);
    setTimeout(() => reject(new Error('timed out downloading the Python runtime')), 60000);
  })
    .then(() => window.loadPyodide())
    .then(async (py) => {
      const src = await fetch('navigate.py').then((r) => { if (!r.ok) throw new Error('navigate.py not found'); return r.text(); });
      $('#py-code').textContent = src;
      py.runPython(src);
      return py;
    });
  return pyodideReady;
}

function pyStatus(text, cls = 'dim') {
  const el = $('#py-status');
  el.textContent = text;
  el.className = cls;
}

function pyPrint(text, cls) {
  const out = $('#py-out');
  const span = document.createElement('span');
  if (cls) span.className = cls;
  span.textContent = text + '\n';
  out.appendChild(span);
  out.scrollTop = out.scrollHeight;
}

async function setupPython() {
  if (pyNetwork) return;
  if (!$('#python-window').dataset.started) {
    $('#python-window').dataset.started = '1';
  } else {
    return; // already loading
  }

  pyStatus('loading Python runtime, about 10 MB, first time only…', 'yellow');
  pyPrint('loading pyodide…', 'y');
  try {
    const py = await loadPyodideOnce();
    pyNetwork = JSON.parse(py.runPython('network()'));
    pyPrint(`Python ${py.runPython('import sys; sys.version.split()[0]')} ready. navigate.py loaded.`, 'g');
    pyPrint('');

    const from = $('#py-from'), to = $('#py-to');
    Object.keys(pyNetwork.stations).forEach((name) => {
      from.add(new Option(name, name));
      to.add(new Option(name, name));
    });
    from.value = 'Gare Nord';
    to.value = 'Aéroport';
    from.disabled = to.disabled = false;
    $('#py-run').disabled = false;
    pyStatus('ready', 'green');
    drawMap();
    runRoute();
  } catch (err) {
    pyStatus('failed: ' + err.message, 'red');
    pyPrint('error: ' + err.message, 'r');
    pyPrint('you can still read the source with "view source", or run it locally: python3 navigate.py "Gare Nord" Parc', 'd');
    pyodideReady = null; // so reopening the window retries the download
    delete $('#python-window').dataset.started;
  }
}

async function runRoute() {
  const py = await pyodideReady;
  const a = $('#py-from').value, b = $('#py-to').value;
  py.globals.set('_a', a);
  py.globals.set('_b', b);
  pyPrint(`$ python3 navigate.py "${a}" "${b}"`, 'y');
  const text = py.runPython('describe(_a, _b)');
  pyLastRoute = JSON.parse(py.runPython('route(_a, _b)'));
  pyPrint(text, pyLastRoute.error ? 'r' : undefined);
  pyPrint('');
  drawMap();
}

function drawMap() {
  const canvas = $('#py-map');
  if (!pyNetwork || !canvas.clientWidth) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#11111b'; ctx.fillRect(0, 0, w, h);

  const pad = 34;
  const P = (name) => { const [x, y] = pyNetwork.stations[name]; return [pad + (x / 100) * (w - pad * 2), pad + (y / 100) * (h - pad * 2)]; };
  const path = pyLastRoute && !pyLastRoute.error ? pyLastRoute.path : [];
  const onPath = (a, b) => { const i = path.indexOf(a), j = path.indexOf(b); return i > -1 && j > -1 && Math.abs(i - j) === 1; };

  // lines
  Object.values(pyNetwork.lines).forEach((line) => {
    for (let i = 0; i < line.stops.length - 1; i++) {
      const hot = onPath(line.stops[i], line.stops[i + 1]);
      ctx.strokeStyle = line.colour; ctx.globalAlpha = path.length ? (hot ? 1 : 0.22) : 0.8; ctx.lineWidth = hot ? 6 : 3;
      ctx.beginPath(); ctx.moveTo(...P(line.stops[i])); ctx.lineTo(...P(line.stops[i + 1])); ctx.stroke();
    }
  });
  ctx.globalAlpha = 1;
  // stations
  ctx.font = '11px JetBrains Mono, monospace';
  Object.keys(pyNetwork.stations).forEach((name) => {
    const [x, y] = P(name);
    const hot = path.includes(name);
    ctx.fillStyle = hot ? '#f9e2af' : '#cdd6f4'; ctx.strokeStyle = '#11111b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, hot ? 6 : 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const tw = ctx.measureText(name).width;
    const lx = Math.min(w - tw - 4, Math.max(4, x - tw / 2));
    ctx.fillStyle = 'rgba(17,17,27,0.8)'; ctx.fillRect(lx - 2, y - 20, tw + 4, 13);
    ctx.fillStyle = hot ? '#f9e2af' : '#a6adc8';
    ctx.fillText(name, lx, y - 10);
  });
  // legend
  let lx = 8, ly = h - 10;
  Object.entries(pyNetwork.lines).forEach(([k, line]) => {
    ctx.fillStyle = line.colour; ctx.fillRect(lx, ly - 8, 10, 10); ctx.fillStyle = '#a6adc8'; ctx.fillText(k, lx + 14, ly); lx += 44;
  });
}

function setupPythonUI() {
  $('#py-run').addEventListener('click', runRoute);
  $('#py-from').addEventListener('change', runRoute);
  $('#py-to').addEventListener('change', runRoute);
  $('#py-source').addEventListener('click', (btn) => {
    const b = $('#py-source');
    const show = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(show));
    $('#py-code').hidden = !show;
    $('#py-out').hidden = show;
    if (show && !$('#py-code').textContent) {
      fetch('navigate.py').then((r) => r.text()).then((t) => { $('#py-code').textContent = t; });
    }
  });
  window.addEventListener('resize', drawMap);
}

/* ---------- terminal ---------- */

const cmdHistory = [];
let historyPos = 0;

function print(text, cls = 'out') {
  const out = $('#shell-output');
  const div = document.createElement('div');
  div.className = cls;
  div.textContent = text;
  out.appendChild(div);
  $('#shell').scrollTop = $('#shell').scrollHeight;
}

const COMMANDS = {
  help: () => print(
    [
      'available commands:',
      '  help        this list',
      '  whoami      who is this?',
      '  ls          list files',
      '  cat <file>  read a file (readme.txt, experience.md)',
      '  projects    list projects (projects <category> to filter)',
      '  neofetch    system info',
      '  open <win>  readme | projects | terminal',
      '  github      open my GitHub',
      '  python3 navigate.py   run my Python navigator (real Python)',
      '  date        current time',
      '  echo <txt>  say it back',
      '  clear       clear the screen',
      '  exit        close this window',
    ].join('\n')
  ),

  whoami: () => print('Khalil Almwakeh (volcinator8000). Epitech, 2nd year. C / Linux / Python / Bash. Currently web & SEO engineering at Remoters.'),

  ls: () => print('readme.txt  experience.md  projects/  navigate.py  script.js  style.css  .bashrc  .secrets  (nice try)'),

  cat: (args) => {
    const f = args[0];
    if (!f) return print('cat: missing file operand', 'err');
    if (f === 'readme.txt') {
      openWindow('about-window');
      return print('opening readme.txt in vim...');
    }
    if (f === 'experience.md') {
      openWindow('experience-window');
      return print('opening experience.md…');
    }
    if (f === '.secrets') return print('cat: .secrets: Permission denied', 'err');
    if (f === '.bashrc') return print('alias please="sudo"\nexport EDITOR=vim\nPS1="\\u@\\h:\\w$ "');
    return print(`cat: ${f}: No such file or directory`, 'err');
  },

  projects: (args) => {
    const cat = args[0];
    if (cat && !CATEGORIES[cat]) {
      return print(`unknown category. try: ${Object.keys(CATEGORIES).filter((k) => k !== 'all').join(', ')}`, 'err');
    }
    const shown = PROJECTS.filter((p) => !cat || p.cat === cat);
    print(shown.map((p) => `${(p.ext === 'web' || p.ext === 'ai' ? p.ext : '.' + p.ext).padEnd(5)} ${p.name.padEnd(18)} ${p.blurb}`).join('\n'));
    activeFilter = cat || 'all';
    renderFilters();
    renderProjects();
    openWindow('projects-window');
  },

  neofetch: () => print(
    [
      '       /\\         khalil@arch',
      '      /  \\        ----------',
      '     /\\   \\       OS: Arch Linux x86_64',
      '    /      \\      Shell: 42sh (my own)',
      '   /   ,,   \\     Editor: vim',
      '  /   |  |  -\\    Langs: C, Python, Bash',
      " /_-''    ''-_\\   Status: building systems and simulations",
    ].join('\n')
  ),

  open: (args) => {
    const map = { readme: 'about-window', projects: 'projects-window', terminal: 'terminal-window', navigate: 'python-window', experience: 'experience-window' };
    const id = map[args[0]];
    if (!id) return print('open: readme | projects | terminal | navigate | experience', 'err');
    openWindow(id);
    print(`opening ${args[0]}...`);
  },

  github: () => {
    window.open(GITHUB, '_blank', 'noopener');
    print(`opening ${GITHUB}`);
  },

  date: () => print(new Date().toString()),

  echo: (args) => print(args.join(' ')),

  clear: () => { $('#shell-output').innerHTML = ''; },

  exit: () => { closeWindow('terminal-window'); },

  // easter eggs
  sudo: () => print('volcinator8000 is not in the sudoers file. This incident will be reported.', 'err'),
  rm: (args) => (args.join(' ').includes('-rf') ? print("I'm going to pretend you didn't type that.") : print('rm: nothing removed (this is a portfolio, not a filesystem)')),
  vim: () => print('you are now stuck in vim. type :q to leave (just kidding, type anything)'),
  ':q': () => print('phew.'),
  python: (args) => {
    if (args[0] === 'navigate.py') { openWindow('python-window'); return print('running navigate.py in the browser…'); }
    print('>>> import this\nThe Zen of Python, by Tim Peters\n\nBeautiful is better than ugly.\n...\n(try: python3 navigate.py)');
  },
  python3: (args) => COMMANDS.python(args),
  hello: () => print('hi! type help to see what you can do.'),
  hi: () => COMMANDS.hello(),
  pwd: () => print('/home/khalil'),
  uname: () => print('Linux arch 6.x x86_64 GNU/Linux'),
};

function runCommand(raw) {
  const line = raw.trim();
  print(`volcinator8000@arch:~$ ${line}`, 'cmd');
  if (!line) return;

  cmdHistory.push(line);
  historyPos = cmdHistory.length;

  const [cmd, ...args] = line.split(/\s+/);
  const fn = COMMANDS[cmd.toLowerCase()];
  if (fn) fn(args);
  else print(`${cmd}: command not found (try 'help')`, 'err');
}

function setupTerminal() {
  const form = $('#shell-form');
  const input = $('#shell-input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCommand(input.value);
    input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyPos > 0) input.value = cmdHistory[--historyPos];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      historyPos = Math.min(cmdHistory.length, historyPos + 1);
      input.value = cmdHistory[historyPos] || '';
    }
  });

  // clicking anywhere in the terminal focuses the input
  $('#shell').addEventListener('click', () => input.focus());

  print("welcome. type 'help' to see what this can do.");
}

/* ---------- wiring ---------- */

document.addEventListener('DOMContentLoaded', () => {
  // open / close buttons anywhere in the page
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) openWindow(opener.dataset.open);
    const closer = e.target.closest('[data-close]');
    if (closer) closeWindow(closer.dataset.close);
  });

  // clicking a window brings it to the front
  $$('.window').forEach((win) => {
    win.addEventListener('pointerdown', () => focusWindow(win));
  });

  // Esc closes the focused window
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openOrder.length) {
      closeWindow(openOrder[openOrder.length - 1].id);
    }
  });

  window.addEventListener('resize', () => $$('.window.open').forEach(keepOnScreen));

  enableDragging();
  renderFilters();
  renderProjects();
  setupTerminal();
  setupPythonUI();
  renderExperience();
  tickClock();
  setInterval(tickClock, 15000);
  runBoot();
});
