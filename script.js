/* ============================================================
   Khalil's desktop — everything lives in this one file.
   Sections: data · boot · windows · clock · projects · terminal
   ============================================================ */

'use strict';

/* ---------- data ---------- */

// PROJECTS, CATEGORIES, EXPERIENCE and GITHUB come from content.js

/* ---------- easter eggs ---------- */

// id -> hint keys live in i18n.js ('egg.<id>.name' / 'egg.<id>.h1..h3')
// progress lives in sessionStorage on purpose: a new tab starts the hunt from zero
const EGG_IDS = ['sudo', 'rmrf', 'vim', 'cow', 'matrix', 'sl', 'konami', 'clock', 'arch'];
let eggsFound = new Set();
try { eggsFound = new Set(JSON.parse(sessionStorage.getItem('eggsFound') || '[]').filter((id) => EGG_IDS.includes(id))); } catch (e) { /* ignore */ }

function findEgg(id) {
  if (!EGG_IDS.includes(id) || eggsFound.has(id)) return;
  eggsFound.add(id);
  try { sessionStorage.setItem('eggsFound', JSON.stringify([...eggsFound])); } catch (e) { /* ignore */ }
  SFX.granted();
  toast(`${t('eggs.found')}: ${t('egg.' + id + '.name')}  (${eggsFound.size}/${EGG_IDS.length})`);
  renderEggs();
  if (eggsFound.size === EGG_IDS.length) setTimeout(celebrate, 900);
}

function resetEggs() {
  eggsFound = new Set();
  try { sessionStorage.removeItem('eggsFound'); sessionStorage.removeItem('eggsDone'); } catch (e) { /* ignore */ }
  document.body.classList.remove('all-eggs');
  hintLevel = {};
  try { sessionStorage.removeItem('eggHints'); } catch (e) { /* ignore */ }
  $('#snake-icon').hidden = true;
  renderEggs();
}

let hintLevel = {};
let confirmAnswer = null, confirmTimer = 0;
try { hintLevel = JSON.parse(sessionStorage.getItem('eggHints') || '{}'); } catch (e) { hintLevel = {}; }

function renderEggs() {
  const box = $('#eggs');
  if (!box) return;
  const n = eggsFound.size, total = EGG_IDS.length;
  $('#eggs-count').textContent = `${n}/${total}`;
  $('#eggs-title').textContent = t('eggs.title');
  $('#eggs-sub').textContent = n === total ? t('eggs.all') + ' · ' + t('eggs.unlocked') : t('eggs.intro');
  $('#eggs-stuck').textContent = n === total ? '' : t('eggs.stuck');
  const list = $('#eggs-list');
  list.innerHTML = '';
  EGG_IDS.forEach((id) => {
    const li = document.createElement('li');
    const found = eggsFound.has(id);
    const level = Math.min(3, hintLevel[id] || 0);
    li.className = found ? 'found' : '';

    const row = document.createElement('div');
    row.className = 'eggs-row';
    const name = document.createElement('span');
    name.className = 'eggs-name';
    name.textContent = found ? `✓ ${t('egg.' + id + '.name')}` : t('eggs.locked');
    row.appendChild(name);
    if (!found && level < 3) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eggs-hint-btn' + (confirmAnswer === id ? ' confirm' : '');
      btn.textContent = level === 0 ? t('eggs.hint')
        : level === 1 ? `${t('eggs.more')} (${level}/3)`
        : confirmAnswer === id ? t('eggs.confirm') : t('eggs.answer');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // the answer needs a second click
        if (level === 2 && confirmAnswer !== id) {
          confirmAnswer = id;
          clearTimeout(confirmTimer);
          confirmTimer = setTimeout(() => { confirmAnswer = null; renderEggs(); }, 5000);
          SFX.blip();
          renderEggs();
          return;
        }
        confirmAnswer = null;
        clearTimeout(confirmTimer);
        hintLevel[id] = level + 1;
        try { sessionStorage.setItem('eggHints', JSON.stringify(hintLevel)); } catch (err) { /* ignore */ }
        SFX.blip();
        renderEggs();
      });
      row.appendChild(btn);
    }
    li.appendChild(row);

    if (!found && level > 0) {
      const hints = document.createElement('div');
      hints.className = 'eggs-hints';
      for (let k = 1; k <= level; k++) {
        const h = document.createElement('div');
        h.className = `h${k}`;
        h.textContent = `${k}. ${t(`egg.${id}.h${k}`)}`;
        hints.appendChild(h);
      }
      li.appendChild(hints);
    }
    list.appendChild(li);
  });
  box.classList.toggle('complete', n === total);
}

function toast(text) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
}

// the reward: a starfield warp with rolling credits and a chiptune, then snake unlocks for good
function unlockSnake() {
  const icon = $('#snake-icon');
  if (icon) icon.hidden = false;
}

function celebrate() {
  try { sessionStorage.setItem('eggsDone', '1'); } catch (e) { /* ignore */ }
  document.body.classList.add('all-eggs');
  if ($('#celebrate')) return;
  const wrap = document.createElement('div');
  wrap.id = 'celebrate';
  wrap.innerHTML = '<canvas></canvas><div class="celebrate-text credits"><div class="credits-roll"></div></div>';
  document.body.appendChild(wrap);
  const roll = wrap.querySelector('.credits-roll');
  t('eggs.credits').forEach((line, i) => {
    const div = document.createElement('div');
    div.className = i === 0 ? 'big' : line === '' ? 'gap' : 'dim';
    div.textContent = line || '\u00a0';
    if (line === 'Khalil Almwakeh') div.className = 'big';
    roll.appendChild(div);
  });
  SFX.powerOn();
  setTimeout(() => SFX.jingle(), 500);

  const canvas = wrap.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const stars = Array.from({ length: 400 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 0.9 + 0.1 }));
  const colours = ['#f38ba8', '#fab387', '#f9e2af', '#a6e3a1', '#94e2d5', '#89b4fa', '#cba6f7', '#f5c2e7'];
  let last = performance.now(), start = last, raf = 0, ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    cancelAnimationFrame(raf);
    wrap.classList.add('fade');
    setTimeout(() => wrap.remove(), 700);
    unlockSnake();
    toast(t('eggs.unlocked'));
    document.removeEventListener('keydown', finish, true);
  };
  const frame = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const age = (now - start) / 1000;
    const w = innerWidth, h = innerHeight, f = Math.min(w, h) * 0.9;
    ctx.fillStyle = 'rgba(17,17,27,0.45)'; ctx.fillRect(0, 0, w, h);
    const speed = 0.25 + Math.min(1.2, age * 0.3);
    stars.forEach((st, i) => {
      const pz = st.z; st.z -= dt * speed;
      if (st.z <= 0.02) { st.x = Math.random() * 2 - 1; st.y = Math.random() * 2 - 1; st.z = 1; return; }
      ctx.strokeStyle = colours[i % colours.length]; ctx.globalAlpha = 1 - st.z; ctx.lineWidth = Math.max(0.5, 3 * (1 - st.z));
      ctx.beginPath(); ctx.moveTo(w / 2 + (st.x / pz) * f, h / 2 + (st.y / pz) * f); ctx.lineTo(w / 2 + (st.x / st.z) * f, h / 2 + (st.y / st.z) * f); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    if (age < 15) raf = requestAnimationFrame(frame); else finish();
  };
  raf = requestAnimationFrame(frame);
  wrap.addEventListener('click', finish);
  setTimeout(() => document.addEventListener('keydown', finish, true), 1500);
}

/* ---------- snake ---------- */

const snake = { timer: 0, running: false, dir: [1, 0], next: [1, 0], body: [], food: null, score: 0, best: 0, over: false, started: false };
try { snake.best = +localStorage.getItem('snakeBest') || 0; } catch (e) { /* ignore */ }

function snakeReset() {
  snake.body = [[8, 10], [7, 10], [6, 10]];
  snake.dir = [1, 0]; snake.next = [1, 0]; snake.score = 0; snake.over = false; snake.started = false;
  snakePlaceFood();
  snakeDraw();
  $('#snake-score').textContent = '0';
  $('#snake-best').textContent = String(snake.best);
}

function snakePlaceFood() {
  const N = 20;
  do { snake.food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; }
  while (snake.body.some(([x, y]) => x === snake.food[0] && y === snake.food[1]));
}

function snakeStep() {
  if (snake.over || !snake.started) return;
  snake.dir = snake.next;
  const N = 20;
  const head = [(snake.body[0][0] + snake.dir[0] + N) % N, (snake.body[0][1] + snake.dir[1] + N) % N];
  if (snake.body.some(([x, y]) => x === head[0] && y === head[1])) {
    snake.over = true; SFX.error();
    if (snake.score > snake.best) { snake.best = snake.score; try { localStorage.setItem('snakeBest', String(snake.best)); } catch (e) { /* ignore */ } $('#snake-best').textContent = String(snake.best); }
    snakeDraw();
    return;
  }
  snake.body.unshift(head);
  if (head[0] === snake.food[0] && head[1] === snake.food[1]) {
    snake.score += 1; $('#snake-score').textContent = String(snake.score); SFX.eat(); snakePlaceFood();
  } else snake.body.pop();
  snakeDraw();
}

function snakeDraw() {
  const canvas = $('#snake-canvas');
  if (!canvas || !canvas.clientWidth) return;
  const dpr = window.devicePixelRatio || 1, size = canvas.clientWidth, N = 20, cell = size / N;
  canvas.width = size * dpr; canvas.height = size * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#11111b'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(205,214,244,0.05)';
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) ctx.fillRect(i * cell, j * cell, cell, cell);
  ctx.fillStyle = '#f38ba8'; ctx.beginPath(); ctx.arc(snake.food[0] * cell + cell / 2, snake.food[1] * cell + cell / 2, cell * 0.35, 0, Math.PI * 2); ctx.fill();
  snake.body.forEach(([x, y], i) => {
    ctx.fillStyle = i === 0 ? '#a6e3a1' : `rgba(166,227,161,${Math.max(0.35, 1 - i / snake.body.length)})`;
    ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
  });
  if (!snake.started || snake.over) {
    ctx.fillStyle = 'rgba(17,17,27,0.7)'; ctx.fillRect(0, size / 2 - 22, size, 44);
    ctx.fillStyle = '#cdd6f4'; ctx.font = '13px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText(t(snake.over ? 'snake.over' : 'snake.start'), size / 2, size / 2 + 5);
    ctx.textAlign = 'left';
  }
}

function snakeTurn(dx, dy) {
  if (snake.over) { snakeReset(); }
  if (dx === -snake.dir[0] && dy === -snake.dir[1] && snake.body.length > 1) return;
  snake.next = [dx, dy];
  snake.started = true;
}

function setupSnake() {
  const canvas = $('#snake-canvas');
  if (!canvas) return;
  const keys = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], z: [0, -1], q: [-1, 0] };
  document.addEventListener('keydown', (e) => {
    if (!$('#snake-window').classList.contains('open') || !$('#snake-window').classList.contains('focused')) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    const k = keys[e.key] || keys[e.key.toLowerCase()];
    if (k) { e.preventDefault(); snakeTurn(...k); }
    else if (e.key === ' ') { e.preventDefault(); snake.started = !snake.started; snakeDraw(); }
  });
  let touch = null;
  canvas.addEventListener('pointerdown', (e) => { touch = [e.clientX, e.clientY]; canvas.focus(); if (snake.over) snakeReset(); });
  canvas.addEventListener('pointerup', (e) => {
    if (!touch) return;
    const dx = e.clientX - touch[0], dy = e.clientY - touch[1]; touch = null;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) { if (!snake.started) { snake.started = true; } return; }
    if (Math.abs(dx) > Math.abs(dy)) snakeTurn(Math.sign(dx), 0); else snakeTurn(0, Math.sign(dy));
  });
  snakeReset();
  snake.timer = setInterval(snakeStep, 120);
  window.addEventListener('resize', snakeDraw);
}

// konami code anywhere on the desktop
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPos = 0;
function watchKonami(e) {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  konamiPos = key === KONAMI[konamiPos] ? konamiPos + 1 : (key === KONAMI[0] ? 1 : 0);
  if (konamiPos === KONAMI.length) { konamiPos = 0; findEgg('konami'); }
}

/* ---------- i18n shortcuts ---------- */

const t = (k) => (typeof I18N !== 'undefined' ? I18N.t(k) : k);
const L = (obj, f) => (typeof I18N !== 'undefined' ? I18N.field(obj, f) : obj[f]);

/* ---------- sound hooks (sound.js) ---------- */

const SFX = new Proxy({}, { get: (_, name) => (...args) => { try { if (typeof Sound !== 'undefined' && Sound[name]) return Sound[name](...args); } catch (e) { /* ignore */ } } });

function setupSoundToggle() {
  const btn = $('#sound-toggle');
  if (!btn || typeof Sound === 'undefined') return;
  const paint = () => { btn.textContent = t(Sound.enabled ? 'bar.sound.on' : 'bar.sound.off'); btn.setAttribute('aria-pressed', String(Sound.enabled)); };
  document.addEventListener('langchange', paint);
  btn.addEventListener('click', () => { Sound.setEnabled(!Sound.enabled); paint(); if (Sound.enabled) Sound.tryUnlock().then(() => SFX.blip()); });
  paint();
  Sound.tryUnlock(); // works right away when the visitor clicked their way here from the landing
}

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

  // #navigate, #projects, #experience, #terminal deep-link straight to a window;
  // #<project-slug> opens that project's preview
  const hash = location.hash.slice(1).toLowerCase();
  const wanted = { navigate: 'python-window', projects: 'projects-window', experience: 'experience-window', terminal: 'terminal-window', readme: 'about-window' }[hash];
  if (wanted) { setTimeout(() => openWindow(wanted), 250); return; }
  const linked = hash && projectBySlug(hash);
  if (linked) { setTimeout(() => { openWindow('projects-window'); openPreview(linked); }, 250); return; }

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
  if (fromLanding || location.hash) { finishBoot(); return; }
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
      if (tag) SFX.step(i * 2); else SFX.granted();
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

  if (win.classList.contains('minimized')) {
    win.classList.remove('minimized');
    SFX.open();
  } else if (!win.classList.contains('open')) {
    win.classList.add('open');
    placeWindow(win);
    requestAnimationFrame(() => win.classList.add('active'));
    SFX.open();
  }
  focusWindow(win);

  if (id === 'terminal-window') {
    setTimeout(() => $('#shell-input').focus(), 50);
  }
  if (id === 'python-window') {
    setTimeout(() => { setupPython(); drawMap(); }, 50);
  }
  if (id === 'snake-window') {
    setTimeout(() => { snakeDraw(); $('#snake-canvas').focus(); }, 60);
  }
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (!win || !win.classList.contains('open')) return;
  win.classList.add('minimized');
  win.classList.remove('focused');
  SFX.close();
  const idx = openOrder.indexOf(win);
  if (idx > -1) openOrder.splice(idx, 1);
  const next = openOrder[openOrder.length - 1];
  if (next) focusWindow(next); else updateTaskbar();
}

function toggleMaximize(win) {
  if (isMobile()) return;
  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    const r = win.dataset.restore ? JSON.parse(win.dataset.restore) : null;
    if (r) { win.style.left = r.left; win.style.top = r.top; win.style.width = r.width; win.style.height = r.height; }
  } else {
    win.dataset.restore = JSON.stringify({ left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height });
    win.classList.add('maximized');
  }
  SFX.blip();
  window.dispatchEvent(new Event('resize'));
}

function enableResizing() {
  $$('.resize-handle').forEach((handle) => {
    handle.addEventListener('pointerdown', (e) => {
      if (isMobile()) return;
      const win = handle.parentElement;
      if (win.classList.contains('maximized')) return;
      e.preventDefault();
      focusWindow(win);
      const rect = win.getBoundingClientRect();
      const startX = e.clientX, startY = e.clientY, w0 = rect.width, h0 = rect.height;
      handle.setPointerCapture(e.pointerId);
      win.classList.add('dragging');
      const onMove = (ev) => {
        win.style.width = `${Math.max(320, Math.min(window.innerWidth - rect.left - 8, w0 + ev.clientX - startX))}px`;
        win.style.height = `${Math.max(200, Math.min(window.innerHeight - rect.top - 8, h0 + ev.clientY - startY))}px`;
      };
      const stop = () => {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', stop);
        handle.removeEventListener('pointercancel', stop);
        win.classList.remove('dragging');
        window.dispatchEvent(new Event('resize'));
      };
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
    });
  });
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win || !win.classList.contains('open')) return;

  win.classList.remove('active', 'focused', 'minimized', 'maximized');
  if (id === 'browser-window') { browserTabs.splice(0).forEach((tb) => { tb.frame.src = 'about:blank'; tb.frame.remove(); }); browserActive = null; }
  SFX.close();
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
  if (!win.classList.contains('open') || win.classList.contains('maximized')) return;
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
    btn.className = 'task-btn' + (win.classList.contains('focused') ? ' focused' : '') + (win.classList.contains('minimized') ? ' minimized' : '');
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
    chip.textContent = `${categoryLabel(key)} ${n}`;
    chip.addEventListener('click', () => {
      SFX.blip();
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
  $('#project-count').textContent = `${shown.length} ${t(shown.length === 1 ? 'projects.item' : 'projects.items')}`;

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
      play.textContent = t(p.name === 'Navigate' ? 'card.run' : (typeof APPS !== 'undefined' && APPS.some((a) => a.project === p.name)) ? 'browser.open' : 'card.preview');
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
    blurb.textContent = L(p, 'blurb');

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
  root.innerHTML = renderExperienceHTML(currentExperience());
}

/* ---------- browser app: tabs, one iframe per tab ---------- */

const browserTabs = []; // { id, title, url, frame }
let browserActive = null;

function renderAppIcons() {
  const box = $('#app-icons');
  if (!box || typeof APPS === 'undefined') return;
  box.innerHTML = '';
  APPS.forEach((app) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon';
    btn.innerHTML = `<div class="icon-img app-icon-img" aria-hidden="true">${escapeHTML(app.label)}</div><span>${escapeHTML(app.id)}</span>`;
    btn.addEventListener('click', () => openApp(app));
    box.appendChild(btn);
  });
}

function openApp(app) {
  openBrowser(app.url, app.title, app.id);
}

function openBrowser(url, title, id) {
  id = id || url;
  let tab = browserTabs.find((t) => t.id === id);
  if (!tab) {
    const frame = document.createElement('iframe');
    frame.src = url;
    frame.title = title;
    frame.setAttribute('allow', 'autoplay');
    frame.loading = 'eager';
    $('#browser-frames').appendChild(frame);
    tab = { id, title, url, frame };
    browserTabs.push(tab);
  }
  browserActive = tab;
  renderBrowser();
  openWindow('browser-window');
}

function closeBrowserTab(id) {
  const i = browserTabs.findIndex((t) => t.id === id);
  if (i < 0) return;
  const [tab] = browserTabs.splice(i, 1);
  tab.frame.src = 'about:blank';
  tab.frame.remove();
  if (browserActive === tab) browserActive = browserTabs[Math.max(0, i - 1)] || null;
  renderBrowser();
  if (!browserTabs.length) closeWindow('browser-window');
}

function renderBrowser() {
  const tabs = $('#browser-tabs');
  if (!tabs) return;
  tabs.innerHTML = '';
  browserTabs.forEach((t) => {
    const el = document.createElement('div');
    el.className = 'browser-tab' + (t === browserActive ? ' active' : '');
    el.setAttribute('role', 'tab');
    el.setAttribute('aria-selected', String(t === browserActive));
    const name = document.createElement('span');
    name.textContent = t.title;
    const x = document.createElement('button');
    x.type = 'button'; x.className = 'tab-close'; x.textContent = '×'; x.setAttribute('aria-label', 'close tab');
    x.addEventListener('click', (e) => { e.stopPropagation(); closeBrowserTab(t.id); SFX.close(); });
    el.append(name, x);
    el.addEventListener('click', () => { browserActive = t; renderBrowser(); SFX.blip(); });
    tabs.appendChild(el);
    t.frame.hidden = t !== browserActive;
  });
  let empty = $('#browser-frames .browser-empty');
  if (!browserTabs.length) {
    if (!empty) { empty = document.createElement('div'); empty.className = 'browser-empty'; $('#browser-frames').appendChild(empty); }
    empty.textContent = t('browser.empty');
  } else if (empty) empty.remove();
  $('#browser-url').textContent = browserActive ? browserActive.url : '';
  $('#browser-title').textContent = browserActive ? `browser — ${browserActive.title}` : 'browser';
  $('#browser-ext').href = browserActive ? browserActive.url : '#';
  updateTaskbar();
}

function setupBrowser() {
  if (!$('#browser-window')) return;
  renderAppIcons();
  $('#browser-reload').addEventListener('click', () => { if (browserActive) { const u = browserActive.url; browserActive.frame.src = 'about:blank'; setTimeout(() => { browserActive.frame.src = u; }, 30); SFX.blip(); } });
  renderBrowser();
  document.addEventListener('langchange', renderBrowser);
}

/* ---------- project preview window ---------- */

let previewCleanup = null;
let previewProject = null;

function hasPreview(p) {
  return p.name === 'Navigate' || typeof PREVIEWS[p.name] === 'function';
}

function openPreview(p) {
  if (p.name === 'Navigate') { openWindow('python-window'); return; }
  const app = typeof APPS !== 'undefined' && APPS.find((a) => a.project === p.name);
  if (app) { openApp(app); return; }

  stopPreview();
  previewProject = p;
  try { history.replaceState(null, '', '#' + projectSlug(p)); } catch (e) { /* ignore */ }
  $('#preview-title').textContent = `~/projects/${p.name.toLowerCase().replace(/\s+/g, '-')}`;
  const iconSlot = $('#preview-icon');
  iconSlot.innerHTML = '';
  iconSlot.appendChild(fileBadge(p.ext));
  $('#preview-name').textContent = p.name;
  $('#preview-blurb').textContent = L(p, 'blurb');

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
  link.textContent = t('preview.github');
  if (p.link) link.href = p.link;

  const live = $('#preview-live');
  const liveUrl = PREVIEW_LIVE[p.name];
  live.hidden = !liveUrl;
  live.textContent = t('preview.live');
  if (liveUrl) live.href = liveUrl;

  const stage = $('#preview-stage');
  stage.innerHTML = '';
  $('#preview-note').textContent = previewNote(p.name);

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
        emptyStage(stage, t('preview.crashed'), [String(err.message || err)]);
      }
    });
  } else {
    emptyStage(stage, t('preview.none'), [t(p.link ? 'preview.none.link' : 'preview.none.private')]);
    $('#preview-note').textContent = '';
  }
}

function stopPreview() {
  if (previewCleanup) {
    try { previewCleanup(); } catch (e) { /* ignore */ }
    previewCleanup = null;
  }
  previewProject = null;
  $('#preview-stage').innerHTML = '';
  if (location.hash && projectBySlug(location.hash.slice(1))) { try { history.replaceState(null, '', location.pathname); } catch (e) { /* ignore */ } }
}

function copyPreviewLink() {
  if (!previewProject) return;
  const url = `${location.origin}${location.pathname}#${projectSlug(previewProject)}`;
  const done = () => { toast(t('preview.copied')); SFX.blip(); };
  const fallback = () => {
    // no clipboard permission: try the old selection trick, else just show the link
    const tmp = document.createElement('textarea');
    tmp.value = url; tmp.setAttribute('readonly', ''); tmp.style.position = 'fixed'; tmp.style.opacity = '0';
    document.body.appendChild(tmp); tmp.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    tmp.remove();
    if (ok) done(); else toast(url);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, fallback);
  else fallback();
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

  pyStatus(t('py.status.loading'), 'yellow');
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
    pyStatus(t('py.status.ready'), 'green');
    SFX.granted();
    drawMap();
    runRoute();
  } catch (err) {
    pyStatus(t('py.status.failed') + err.message, 'red');
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
  SFX.confirm();
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
let vimOpen = false;
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
      '  linkedin    open my LinkedIn',
      '  python3 navigate.py   run my Python navigator (real Python)',
      '  date        current time',
      '  echo <txt>  say it back',
      '  clear       clear the screen',
      '  exit        close this window',
      '  keys        keyboard shortcuts',
      '  eggs        the easter-egg hunt',
      '  … and a few commands that are not listed.',
    ].join('\n')
  ),

  whoami: () => print('Khalil Almwakeh (volcinator8000). Epitech, 2nd year. C / Linux / Python / Bash. Currently web & SEO engineering at Remoters.'),

  ls: (args) => print(args[0] === '-a' ? '.  ..  .bashrc  .secrets  readme.txt  experience.md  projects/  navigate.py  script.js  style.css' : 'readme.txt  experience.md  projects/  navigate.py  script.js  style.css'),

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
    if (f === '.secrets') return print(`# ${t('eggs.title')}\n` + EGG_IDS.map((id) => `- ${eggsFound.has(id) ? '[x] ' + t('egg.' + id + '.name') : '[ ] ' + t('egg.' + id + '.h1')}`).join('\n'));
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
    const map = { readme: 'about-window', projects: 'projects-window', terminal: 'terminal-window', navigate: 'python-window', experience: 'experience-window', browser: 'browser-window' };
    const app = typeof APPS !== 'undefined' && APPS.find((a) => a.id === args[0]);
    if (app) { openApp(app); return print(`opening ${app.title} in the browser…`); }
    const id = map[args[0]];
    if (!id) return print('open: readme | projects | terminal | navigate | experience | browser | ' + (typeof APPS !== 'undefined' ? APPS.map((a) => a.id).join(' | ') : ''), 'err');
    openWindow(id);
    print(`opening ${args[0]}...`);
  },

  linkedin: () => {
    window.open('https://www.linkedin.com/in/khalil-almwakeh-1432b436a/', '_blank', 'noopener');
    print('opening linkedin');
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
  sudo: () => { print('volcinator8000 is not in the sudoers file. This incident will be reported.', 'err'); findEgg('sudo'); },
  rm: (args) => { if (args.join(' ').includes('-rf')) { print("I'm going to pretend you didn't type that."); findEgg('rmrf'); } else print('rm: nothing removed (this is a portfolio, not a filesystem)'); },
  vim: () => { print('you are now stuck in vim. type :q to leave'); vimOpen = true; },
  ':q': () => { print(vimOpen ? 'phew. you escaped vim.' : 'not in vim.'); if (vimOpen) findEgg('vim'); vimOpen = false; },
  ':wq': () => COMMANDS[':q'](),
  sl: () => {
    print([
      '      ====        ________                ___________',
      '  _D _|  |_______/        \\__I_I_____===__|_________|',
      '   |(_)---  |   H\\________/ |   |        =|___ ___|',
      '   /     |  |   H  |  |     |   |         ||_| |_||',
      '  |      |  |   H  |__--------------------| [___] |',
      '  | ________|___H__/__|_____/[][]~\\_______|       |',
      '  |/ |   |-----------I_____I [][] []  D   |=======|__',
      '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__',
      ' |/-=|___|=    ||    ||    ||    |_____/~\\___/',
      '  \\_/      \\_O=====O=====O=====O_/      \\_/',
      '',
      "you typed sl instead of ls. the train has left.",
    ].join('\n'));
    findEgg('sl');
  },
  cowsay: (args) => {
    const msg = args.join(' ') || 'moo';
    const line = '-'.repeat(msg.length + 2);
    print(` ${line}\n< ${msg} >\n ${line}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`);
    findEgg('cow');
  },
  matrix: () => { matrixRain(); findEgg('matrix'); },
  konami: () => { print('↑ ↑ ↓ ↓ ← → ← → B A'); findEgg('konami'); },
  snake: () => { if ($('#snake-icon').hidden) return print('snake: locked. find the nine secrets first (type eggs).', 'err'); openWindow('snake-window'); },
  eggs: (args) => {
    if (args[0] === 'reset') { resetEggs(); return print('eggs reset.'); }
    $('#eggs').classList.add('open');
    print(`${eggsFound.size}/${EGG_IDS.length} ${t('eggs.found')}. ${t('eggs.stuck')}`);
  },
  keys: () => print(
    [
      'keyboard shortcuts:',
      '  Esc            close the focused window',
      '  Alt+1 … Alt+5  open readme / projects / terminal / experience / navigate.py',
      '  Alt+Q          close every window',
      '  Tab            complete a command or file name in the terminal',
      '  ↑ / ↓          walk the terminal history',
      '  m              toggle sound (outside the terminal)',
    ].join('\n')
  ),
  shortcuts: () => COMMANDS.keys(),
  fortune: () => print(['segfaults build character.', 'it works on my machine.', 'there are 10 kinds of people…', 'a maze is just a graph with attitude.', 'rm -rf is not a backup strategy.'][Math.floor(Math.random() * 5)]),
  uptime: () => print(`up ${Math.round((performance.now() / 1000))}s, load average: ${(Math.random() * 0.5).toFixed(2)}, 1 user (you)`),
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

function matrixRain() {
  const win = $('#terminal-window');
  if (win.querySelector('canvas.matrix')) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'matrix';
  canvas.style.top = `${win.querySelector('.title-bar').offsetHeight}px`;
  win.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const w = canvas.width = win.clientWidth, h = canvas.height = win.clientHeight - win.querySelector('.title-bar').offsetHeight;
  const cols = Math.floor(w / 14), drops = Array.from({ length: cols }, () => Math.random() * -40);
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF';
  const start = performance.now();
  let raf = 0;
  const frame = (now) => {
    ctx.fillStyle = 'rgba(17,17,27,0.12)'; ctx.fillRect(0, 0, w, h);
    ctx.font = '13px monospace';
    drops.forEach((y, i) => {
      ctx.fillStyle = Math.random() < 0.08 ? '#cdd6f4' : '#a6e3a1';
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14);
      drops[i] = y * 14 > h && Math.random() > 0.975 ? 0 : y + 0.5;
    });
    if (now - start < 4500) raf = requestAnimationFrame(frame);
    else { canvas.style.opacity = '0'; setTimeout(() => canvas.remove(), 500); print('wake up, neo.'); }
  };
  raf = requestAnimationFrame(frame);
  canvas.addEventListener('click', () => { cancelAnimationFrame(raf); canvas.remove(); });
}

function completeCommand(input) {
  const value = input.value;
  const parts = value.split(/\s+/);
  const files = ['readme.txt', 'experience.md', 'navigate.py', 'projects/', '.bashrc', '.secrets'];
  const windows = ['readme', 'projects', 'terminal', 'navigate', 'experience'];
  let pool, prefix;
  if (parts.length <= 1) { pool = Object.keys(COMMANDS).filter((k) => /^[a-z]/.test(k)); prefix = parts[0] || ''; }
  else if (parts[0] === 'cat') { pool = files; prefix = parts[parts.length - 1]; }
  else if (parts[0] === 'open') { pool = windows.concat(typeof APPS !== 'undefined' ? APPS.map((a) => a.id) : []); prefix = parts[parts.length - 1]; }
  else if (parts[0] === 'projects') { pool = Object.keys(CATEGORIES).filter((k) => k !== 'all'); prefix = parts[parts.length - 1]; }
  else return;
  const hits = pool.filter((k) => k.startsWith(prefix));
  if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(' ') + (hits[0].endsWith('/') ? '' : ' '); }
  else if (hits.length > 1) {
    let common = hits[0];
    hits.forEach((h) => { while (!h.startsWith(common)) common = common.slice(0, -1); });
    parts[parts.length - 1] = common; input.value = parts.join(' ');
    print(hits.join('  '), 'out');
  }
}

function runCommand(raw) {
  const line = raw.trim();
  if (line.length > 200) {
    print(`volcinator8000@arch:~$ ${line.slice(0, 60)}… (${line.length} characters)`, 'cmd');
    print('i think you need to either check your keyboard, or seek a therapist', 'err');
    SFX.error();
    return;
  }
  print(`volcinator8000@arch:~$ ${line}`, 'cmd');
  if (!line) return;

  cmdHistory.push(line);
  historyPos = cmdHistory.length;

  const [cmd, ...args] = line.split(/\s+/);
  const fn = COMMANDS[cmd.toLowerCase()];
  if (fn) { SFX.confirm(); fn(args); }
  else { SFX.error(); print(`${cmd}: command not found (try 'help')`, 'err'); }
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
    if (e.key.length === 1 || e.key === 'Backspace') SFX.tick();
    if (e.key === 'Tab') { e.preventDefault(); completeCommand(input); return; }
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
  if (typeof I18N !== 'undefined') {
    I18N.apply();
    const lt = $('#lang-toggle');
    if (lt) lt.addEventListener('click', () => { I18N.toggle(); SFX.blip(); });
    document.addEventListener('langchange', () => {
      renderFilters();
      renderProjects();
      renderExperience();
      if (previewProject && $('#preview-window').classList.contains('open')) openPreview(previewProject);
    });
  }

  // open / close buttons anywhere in the page
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) openWindow(opener.dataset.open);
    if (e.target.closest('.icon') && !opener) SFX.blip(); // the github link icon
    const closer = e.target.closest('[data-close]');
    if (closer) closeWindow(closer.dataset.close);
    const minner = e.target.closest('[data-min]');
    if (minner) minimizeWindow(minner.dataset.min);
  });

  // clicking a window brings it to the front
  $$('.window').forEach((win) => {
    win.addEventListener('pointerdown', () => focusWindow(win));
  });

  // keyboard: Esc closes, Alt+1..5 open, Alt+Q closes all, m toggles sound
  const ALT_WINDOWS = ['about-window', 'projects-window', 'terminal-window', 'experience-window', 'python-window', 'snake-window'];
  document.addEventListener('keydown', (e) => {
    watchKonami(e);
    if (e.key === 'Escape' && openOrder.length) { closeWindow(openOrder[openOrder.length - 1].id); return; }
    if (e.altKey && /^[1-6]$/.test(e.key)) { e.preventDefault(); if (e.key !== '6' || !$('#snake-icon').hidden) openWindow(ALT_WINDOWS[+e.key - 1]); return; }
    if (e.altKey && e.key.toLowerCase() === 'q') { e.preventDefault(); [...openOrder].forEach((w) => closeWindow(w.id)); return; }
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (!typing && e.key === 'm' && !e.altKey && !e.ctrlKey && !e.metaKey) { $('#sound-toggle')?.click(); }
  });

  // clock: three clicks in a row
  let clockClicks = 0, clockTimer = 0;
  $('#clock').addEventListener('click', () => {
    clockClicks += 1; clearTimeout(clockTimer); clockTimer = setTimeout(() => { clockClicks = 0; }, 1500);
    if (clockClicks >= 3) { clockClicks = 0; findEgg('clock'); toast(`uptime ${Math.round(performance.now() / 1000)}s`); }
  });
  // the Arch logo in the readme
  const art = $('.fetch-art');
  if (art) { art.style.cursor = 'pointer'; art.addEventListener('click', () => { art.classList.add('glow'); findEgg('arch'); }); }

  // easter-egg widget
  const eggs = $('#eggs');
  if (eggs) {
    $('#eggs-head').addEventListener('click', () => { eggs.classList.toggle('open'); SFX.blip(); });
    renderEggs();
    document.addEventListener('langchange', renderEggs);
    try { if (sessionStorage.getItem('eggsDone') === '1') { document.body.classList.add('all-eggs'); unlockSnake(); } } catch (e) { /* ignore */ }
  }
  setupSnake();
  setupBrowser();
  $('#preview-copy')?.addEventListener('click', copyPreviewLink);
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1).toLowerCase(); const p = projectBySlug(h); if (p && previewProject !== p) { openWindow('projects-window'); openPreview(p); return; } const w = { navigate: 'python-window', projects: 'projects-window', experience: 'experience-window', terminal: 'terminal-window', readme: 'about-window' }[h]; if (w) openWindow(w); });

  window.addEventListener('resize', () => $$('.window.open').forEach(keepOnScreen));

  enableDragging();
  enableResizing();
  $$('.title-bar').forEach((bar) => bar.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) toggleMaximize(bar.parentElement); }));
  renderFilters();
  renderProjects();
  setupTerminal();
  setupPythonUI();
  renderExperience();
  setupSoundToggle();
  tickClock();
  setInterval(tickClock, 15000);
  runBoot();
});
