/* ============================================================
   Khalil's desktop — everything lives in this one file.
   Sections: data · boot · windows · clock · projects · terminal
   ============================================================ */

'use strict';

/* ---------- data ---------- */

const GITHUB = 'https://github.com/volcinator8000';

const CATEGORIES = {
  all: 'All',
  systems: 'Systems & C',
  algo: 'Algorithms',
  maths: 'Maths',
  graphics: 'Graphics & Games',
  devops: 'DevOps & Security',
  tools: 'Tools & Web',
};

// Edit this list to add / reorder projects. `featured` pins a project at the top.
// `link` is optional — Epitech repos are private, so most rows have none.
const PROJECTS = [
  { name: '42sh', icon: '🐚', cat: 'systems', tech: ['C', 'POSIX'], featured: true,
    blurb: 'A Unix shell in C: pipes, redirections, builtins and the usual quoting headaches.' },
  { name: 'Corewar', icon: '⚔️', cat: 'systems', tech: ['C'], featured: true, link: `${GITHUB}/corewar`,
    blurb: 'A virtual machine and assembler where tiny programs fight for control of memory.' },
  { name: 'My World', icon: '🌍', cat: 'graphics', tech: ['C', 'CSFML'], featured: true,
    blurb: 'An isometric 3D world editor: terrain, elevation and hand-rolled projection maths.' },
  { name: 'Amazed', icon: '🌀', cat: 'algo', tech: ['C', 'BFS'], featured: true,
    blurb: 'Maze solver that finds the shortest path with breadth-first search on very large grids.' },

  { name: 'My printf', icon: '🖨️', cat: 'systems', tech: ['C'],
    blurb: 'printf rebuilt from scratch: parsing format strings and handling every conversion by hand.' },
  { name: 'Robot Factory', icon: '🏭', cat: 'systems', tech: ['C'],
    blurb: 'An assembler for a made-up robot instruction set, turning source files into binary.' },
  { name: 'Count Islands', icon: '🏝️', cat: 'algo', tech: ['C', 'flood fill'],
    blurb: 'Flood-fill over a 2D map to count and label every island.' },
  { name: 'Navigate', icon: '🧭', cat: 'algo', tech: ['pathfinding'], link: `${GITHUB}/navigate`,
    blurb: 'A local GPS navigation system.' },
  { name: 'Star', icon: '⭐', cat: 'graphics', tech: ['C', 'CSFML'],
    blurb: 'A starfield animation: pixels, vectors and frame timing.' },
  { name: 'Game jam', icon: '🎮', cat: 'graphics', tech: ['C++'], link: `${GITHUB}/gamejam`,
    blurb: 'A C++ game built for a game jam.' },
  { name: 'Music visualizer', icon: '🎵', cat: 'tools', tech: ['JavaScript', 'web'], link: `${GITHUB}/music-visualizer`,
    blurb: 'A web page that draws instruments and audio effects as waves and sines.' },
  { name: 'MAX trip chain', icon: '🚄', cat: 'tools', tech: ['SNCF open data'], link: `${GITHUB}/max-trip-chain`,
    blurb: 'Open-source finder for reservable MAX JEUNE / SENIOR train seats.' },
  { name: 'Cuddle', icon: '🤖', cat: 'algo', tech: ['AI'],
    blurb: 'An AI bot project: decision-making and heuristics.' },
  { name: 'Organized', icon: '🗂️', cat: 'systems', tech: ['Bash'],
    blurb: 'A Bash script that sorts a messy directory into folders by file type.' },
  { name: 'Setting Up', icon: '🛠️', cat: 'systems', tech: ['Linux', 'Bash'],
    blurb: 'Day one: setting up a Linux development environment from scratch.' },
  { name: 'Fourier workshop', icon: '🌊', cat: 'maths', tech: ['Python', 'Jupyter'], link: `${GITHUB}/Fourier-workshop`,
    blurb: 'A live notebook showing how an FFT works and what it is good for.' },
  { name: '110 Borwein', icon: '📐', cat: 'maths', tech: ['Python'],
    blurb: 'Numerical integration of Borwein integrals, where a neat pattern suddenly breaks.' },
  { name: '109 Titration', icon: '🧪', cat: 'maths', tech: ['Python'],
    blurb: 'Finding the equivalence point of a titration curve with numerical derivatives.' },
  { name: '108 Trigo', icon: '📊', cat: 'maths', tech: ['Python'],
    blurb: 'Trig functions on matrices, computed from their power series.' },
  { name: '107 Transfer', icon: '🔁', cat: 'maths', tech: ['Python'],
    blurb: 'Transfer functions of chained systems, from polynomial coefficients.' },
  { name: '106 Bombyx', icon: '🦋', cat: 'maths', tech: ['Python'],
    blurb: 'Modelling a silkworm population with the logistic map, plus bifurcation diagrams.' },
  { name: 'Chocolatine', icon: '🥐', cat: 'devops', tech: ['GitHub Actions'], link: `${GITHUB}/painauchocolat`,
    blurb: 'A CI pipeline with GitHub Actions: build, test and mirror on every push.' },
  { name: 'Hack Juice', icon: '🔐', cat: 'devops', tech: ['web security'],
    blurb: 'Breaking into OWASP Juice Shop: XSS, injection and broken auth.' },
];

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
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win || !win.classList.contains('open')) return;

  win.classList.remove('active', 'focused');
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
    const el = document.createElement(p.link ? 'a' : 'div');
    el.className = 'project' + (p.featured && activeFilter === 'all' ? ' featured' : '');
    if (p.link) {
      el.href = p.link;
      el.target = '_blank';
      el.rel = 'noopener';
    }

    const icon = document.createElement('span');
    icon.className = 'project-icon';
    icon.textContent = p.icon;

    const body = document.createElement('div');
    body.className = 'project-body';

    const name = document.createElement('div');
    name.className = 'project-name';
    name.textContent = p.name;
    if (p.link) {
      const ext = document.createElement('span');
      ext.className = 'ext';
      ext.textContent = 'github ↗';
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
      '  cat <file>  read a file (try readme.txt)',
      '  projects    list projects (projects <category> to filter)',
      '  neofetch    system info',
      '  open <win>  readme | projects | terminal',
      '  github      open my GitHub',
      '  date        current time',
      '  echo <txt>  say it back',
      '  clear       clear the screen',
      '  exit        close this window',
    ].join('\n')
  ),

  whoami: () => print('Khalil Almwakeh (volcinator8000). Epitech, 1st year. C / Linux / Python / Bash.'),

  ls: () => print('readme.txt  projects/  script.js  style.css  .bashrc  .secrets  (nice try)'),

  cat: (args) => {
    const f = args[0];
    if (!f) return print('cat: missing file operand', 'err');
    if (f === 'readme.txt') {
      openWindow('about-window');
      return print('opening readme.txt in vim...');
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
    print(shown.map((p) => `${p.icon}  ${p.name.padEnd(18)} ${p.blurb}`).join('\n'));
    activeFilter = cat || 'all';
    renderFilters();
    renderProjects();
    openWindow('projects-window');
  },

  neofetch: () => print(
    [
      '   ,--.        khalil@epitech',
      '  /  o \\       ----------------',
      " |  ,--'       OS: Arch Linux x86_64",
      ' |  |          Shell: 42sh (my own)',
      '  \\  `--.      Editor: vim',
      "   `----'      Langs: C, Python, Bash",
      '               Status: building systems and simulations',
    ].join('\n')
  ),

  open: (args) => {
    const map = { readme: 'about-window', projects: 'projects-window', terminal: 'terminal-window' };
    const id = map[args[0]];
    if (!id) return print('open: readme | projects | terminal', 'err');
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
  python: () => print('Python 3.12.0\n>>> import this\nThe Zen of Python, by Tim Peters\n\nBeautiful is better than ugly.\n...'),
  python3: () => COMMANDS.python(),
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
  tickClock();
  setInterval(tickClock, 15000);
  runBoot();
});
