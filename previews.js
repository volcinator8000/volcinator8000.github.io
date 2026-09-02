/* ============================================================
   Project previews. Each entry is  name -> (stage) => cleanup
   `stage` is an empty div inside the preview window.
   Return a function that stops timers / animation frames.
   ============================================================ */

'use strict';

const PREVIEWS = {};

// live sites that can be embedded
const PREVIEW_LIVE = {
  'Music visualizer': 'https://volcinator8000.github.io/music-visualizer/',
  'MAX Finder': 'https://davd-gzl.github.io/MAX-Finder/',
};

// one-line note shown under the stage
const PREVIEW_NOTES = {
  'Amazed': 'Rebuilt in JavaScript: a maze is generated, then breadth-first search floods it until it reaches the exit.',
  'Count Islands': 'Rebuilt in JavaScript: flood fill labels each connected patch of land with a colour.',
  'Star': 'Rebuilt in JavaScript: the same starfield idea as the CSFML original.',
  'My World': 'Rebuilt in JavaScript: an isometric heightmap with the projection maths done by hand.',
  '106 Bombyx': 'Rebuilt in JavaScript: the logistic map x → r·x·(1−x), one column per growth rate r.',
  '110 Borwein': 'Rebuilt in JavaScript: the Borwein integrand for each n, integrated numerically.',
  '109 Titration': 'Rebuilt in JavaScript: a strong acid / strong base curve; the derivative peak marks the equivalence point.',
  '108 Trigo': 'Rebuilt in JavaScript: exp of a matrix from its power series; cos and sin work the same way with alternating signs.',
  '107 Transfer': 'Rebuilt in JavaScript: two transfer functions from polynomial coefficients, and the chained system.',
  'Fourier workshop': 'Rebuilt in JavaScript from sim.py: two cosines, the winding machine, and the magnitude as the frequency sweeps.',
  'Obsidian console': 'A replay of the audit findings in the repo, not the real binary.',
  '42sh': 'A live lexer in JavaScript: type a command line and see how a shell splits it before running it.',
  'My printf': 'A live printf in JavaScript: edit the format string, the arguments stay fixed.',
  'Organized': 'Rebuilt in JavaScript: files sorted into folders by extension, the idea behind the script.',
  'Chocolatine': 'A generic CI pipeline animation; the real workflow runs on GitHub Actions.',
  'Music visualizer': 'This is the real site, embedded. Click inside to play; sound comes from the embed.',
  'MAX Finder': 'This is the real app, embedded from its live site.',
  'Bug Break': 'An Unreal Engine project cannot run here; this is the gameplay loop from the README.',
};

/* ---------- helpers ---------- */

const PV_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const PV = {
  base: '#1e1e2e', crust: '#11111b', surface: '#313244', surface1: '#45475a', text: '#cdd6f4', sub: '#a6adc8',
  overlay: '#6c7086', green: '#a6e3a1', blue: '#89b4fa', yellow: '#f9e2af', peach: '#fab387', red: '#f38ba8',
  mauve: '#cba6f7', teal: '#94e2d5', pink: '#f5c2e7', sky: '#89dceb',
};

function makeCanvas(stage) {
  const canvas = document.createElement('canvas');
  stage.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const box = { canvas, ctx, w: 0, h: 0 };
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    box.w = stage.clientWidth || 600;
    box.h = stage.clientHeight || 260;
    canvas.width = Math.round(box.w * dpr);
    canvas.height = Math.round(box.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  box.stop = () => ro.disconnect();
  return box;
}

// run draw(t, dt) every frame; with reduced motion draw once
function animate(draw) {
  let raf = 0;
  let last = performance.now();
  const start = last;
  const frame = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    draw(Math.max(0, (now - start) / 1000), dt);
    if (!PV_REDUCED) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

function caption(stage, text) {
  const c = document.createElement('div');
  c.className = 'caption';
  c.textContent = text;
  stage.appendChild(c);
  return c;
}

function emptyStage(stage, title, lines) {
  const box = document.createElement('div');
  box.className = 'empty';
  const t = document.createElement('strong');
  t.textContent = title;
  box.appendChild(t);
  lines.forEach((l) => {
    const p = document.createElement('div');
    p.textContent = l;
    box.appendChild(p);
  });
  stage.appendChild(box);
  return () => {};
}

function iframeStage(stage, url) {
  const f = document.createElement('iframe');
  f.src = url;
  f.loading = 'lazy';
  f.title = 'live preview';
  f.setAttribute('allow', 'autoplay');
  stage.appendChild(f);
  return () => { f.src = 'about:blank'; f.remove(); };
}

// terminal-style playback. steps: [text, cls, delayMs]
function termPlayback(stage, steps, loop = true) {
  const box = document.createElement('div');
  box.className = 'term';
  stage.appendChild(box);
  let i = 0;
  let timer = 0;
  let alive = true;
  const next = () => {
    if (!alive) return;
    if (i >= steps.length) {
      if (!loop) return;
      timer = setTimeout(() => { box.innerHTML = ''; i = 0; next(); }, 4000);
      return;
    }
    const [text, cls, delay] = steps[i++];
    const div = document.createElement('div');
    div.className = cls || 'o';
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    timer = setTimeout(next, PV_REDUCED ? 0 : (delay ?? 350));
  };
  next();
  return () => { alive = false; clearTimeout(timer); };
}

const rnd = (a, b) => a + Math.random() * (b - a);
const rndi = (a, b) => Math.floor(rnd(a, b));

/* ---------- Amazed: maze + BFS ---------- */
PREVIEWS['Amazed'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const box = ctx.canvas.parentElement;
  const cell = 14;
  let cols, rows, walls, frontier, seen, parent, path, phase, tick;

  function build() {
    cols = Math.max(11, Math.floor(box.clientWidth / cell)) | 1;
    rows = Math.max(9, Math.floor(box.clientHeight / cell)) | 1;
    walls = Array.from({ length: rows }, () => Array(cols).fill(true));
    // recursive backtracker on odd cells
    const stack = [[1, 1]];
    walls[1][1] = false;
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const opts = [[2, 0], [-2, 0], [0, 2], [0, -2]]
        .map(([dx, dy]) => [x + dx, y + dy, x + dx / 2, y + dy / 2])
        .filter(([nx, ny]) => nx > 0 && ny > 0 && nx < cols - 1 && ny < rows - 1 && walls[ny][nx]);
      if (!opts.length) { stack.pop(); continue; }
      const [nx, ny, mx, my] = opts[rndi(0, opts.length)];
      walls[my][mx] = false; walls[ny][nx] = false;
      stack.push([nx, ny]);
    }
    frontier = [[1, 1]];
    seen = new Set(['1,1']);
    parent = new Map();
    path = [];
    phase = 'search';
    tick = 0;
  }
  build();
  const goal = () => [cols - 2, rows - 2];

  function stepBFS() {
    const nextF = [];
    for (const [x, y] of frontier) {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
        if (walls[ny]?.[nx] === false && !seen.has(k)) {
          seen.add(k); parent.set(k, `${x},${y}`); nextF.push([nx, ny]);
          if (nx === goal()[0] && ny === goal()[1]) {
            let cur = k;
            while (cur) { path.push(cur.split(',').map(Number)); cur = parent.get(cur); }
            phase = 'done'; tick = 0;
            return;
          }
        }
      }
    }
    frontier = nextF;
    if (!frontier.length) { phase = 'done'; tick = 0; }
  }

  const cancel = animate((t, dt) => {
    if (phase === 'search') { stepBFS(); }
    else if (phase === 'done' && ++tick > 150) build();

    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h);
    const ox = (w - cols * cell) / 2, oy = (h - rows * cell) / 2;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (walls[y][x]) { ctx.fillStyle = PV.surface; ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell); }
      else if (seen.has(`${x},${y}`)) { ctx.fillStyle = 'rgba(137,180,250,0.22)'; ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell); }
    }
    ctx.fillStyle = PV.blue;
    for (const [x, y] of frontier) ctx.fillRect(ox + x * cell + 3, oy + y * cell + 3, cell - 6, cell - 6);
    ctx.fillStyle = PV.green;
    for (const [x, y] of path) ctx.fillRect(ox + x * cell + 2, oy + y * cell + 2, cell - 4, cell - 4);
    ctx.fillStyle = PV.yellow; ctx.fillRect(ox + cell + 2, oy + cell + 2, cell - 4, cell - 4);
    ctx.fillStyle = PV.red; const [gx, gy] = goal(); ctx.fillRect(ox + gx * cell + 2, oy + gy * cell + 2, cell - 4, cell - 4);
  });
  const cap = caption(stage, 'BFS frontier in blue, shortest path in green');
  return () => { cancel(); stop(); };
};

/* ---------- Count Islands: flood fill ---------- */
PREVIEWS['Count Islands'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const cell = 12;
  const colours = [PV.green, PV.blue, PV.yellow, PV.peach, PV.mauve, PV.teal, PV.pink, PV.red, PV.sky];
  let cols, rows, land, label, queue, count, phase, tick;

  function build() {
    cols = Math.max(20, Math.floor(ctx.canvas.clientWidth / cell));
    rows = Math.max(12, Math.floor(ctx.canvas.clientHeight / cell));
    land = Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() < 0.42));
    for (let k = 0; k < 3; k++) { // smooth into blobs
      land = land.map((row, y) => row.map((v, x) => {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (land[y + dy]?.[x + dx]) n++;
        return n >= 5;
      }));
    }
    label = Array.from({ length: rows }, () => Array(cols).fill(0));
    queue = []; count = 0; phase = 'scan'; tick = 0;
  }
  build();
  let sx = 0, sy = 0;

  function step() {
    if (queue.length) { // flood a few cells per frame
      for (let k = 0; k < 6 && queue.length; k++) {
        const [x, y] = queue.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (land[ny]?.[nx] && !label[ny][nx]) { label[ny][nx] = count; queue.push([nx, ny]); }
        }
      }
      return;
    }
    while (sy < rows) { // find next unlabelled land cell
      if (land[sy][sx] && !label[sy][sx]) { count++; label[sy][sx] = count; queue.push([sx, sy]); return advance(); }
      advance();
    }
    phase = 'done';
  }
  function advance() { sx++; if (sx >= cols) { sx = 0; sy++; } }

  const cancel = animate(() => {
    if (phase === 'scan') step(); else if (++tick > 180) { build(); sx = 0; sy = 0; }
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h);
    const ox = (w - cols * cell) / 2, oy = (h - rows * cell) / 2;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (!land[y][x]) continue;
      ctx.fillStyle = label[y][x] ? colours[(label[y][x] - 1) % colours.length] : PV.surface1;
      ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
    }
    cap.textContent = `islands found: ${count}${phase === 'done' ? '  ✓' : ''}`;
  });
  const cap = caption(stage, 'islands found: 0');
  return () => { cancel(); stop(); };
};

/* ---------- Star: starfield ---------- */
PREVIEWS['Star'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const stars = Array.from({ length: 260 }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(0.05, 1) }));
  const cancel = animate((t, dt) => {
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = 'rgba(17,17,27,0.5)'; ctx.fillRect(0, 0, w, h);
    const f = Math.min(w, h) * 0.9;
    for (const s of stars) {
      const pz = s.z;
      s.z -= dt * 0.35;
      if (s.z <= 0.02) { s.x = rnd(-1, 1); s.y = rnd(-1, 1); s.z = 1; continue; }
      const x1 = w / 2 + (s.x / pz) * f, y1 = h / 2 + (s.y / pz) * f;
      const x2 = w / 2 + (s.x / s.z) * f, y2 = h / 2 + (s.y / s.z) * f;
      const a = 1 - s.z;
      ctx.strokeStyle = `rgba(205,214,244,${a})`; ctx.lineWidth = Math.max(0.5, 2.5 * a);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
  });
  return () => { cancel(); stop(); };
};

/* ---------- My World: isometric heightmap ---------- */
PREVIEWS['My World'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const N = 18;
  const seed = Array.from({ length: N + 1 }, () => Array.from({ length: N + 1 }, () => Math.random()));
  const height = (x, y, t) => {
    const base = Math.sin(x * 0.7 + t * 0.6) * Math.cos(y * 0.6 - t * 0.4) * 0.5 + seed[y][x] * 0.35;
    return Math.max(0, base + 0.25);
  };
  const cancel = animate((t) => {
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h);
    const tile = Math.min(w / (N * 1.05), h / (N * 0.62));
    const cx = w / 2, cy = h * 0.22, amp = tile * 2.2;
    const proj = (x, y, z) => [cx + (x - y) * tile * 0.5, cy + (x + y) * tile * 0.25 - z * amp];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const pts = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]].map(([px, py]) => proj(px, py, height(px, py, t)));
      const z = height(x, y, t);
      const col = z < 0.25 ? PV.blue : z < 0.55 ? PV.green : z < 0.8 ? PV.yellow : PV.text;
      ctx.fillStyle = col; ctx.globalAlpha = 0.35 + z * 0.5;
      ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach((p) => ctx.lineTo(...p)); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = PV.crust; ctx.lineWidth = 0.6; ctx.stroke();
    }
  });
  return () => { cancel(); stop(); };
};

/* ---------- 106 Bombyx: bifurcation diagram ---------- */
PREVIEWS['106 Bombyx'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  let col = 0, w = 0, h = 0;
  const reset = () => { w = ctx.canvas.clientWidth; h = ctx.canvas.clientHeight; col = 0; ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h); };
  reset();
  const cancel = animate(() => {
    if (w !== ctx.canvas.clientWidth) reset();
    if (col > w) { if (!PV_REDUCED) return; }
    const per = PV_REDUCED ? w : 4;
    for (let k = 0; k < per && col <= w; k++, col++) {
      const r = 2.4 + (col / w) * 1.6;
      let x = 0.5;
      for (let i = 0; i < 100; i++) x = r * x * (1 - x);
      ctx.fillStyle = 'rgba(166,227,161,0.35)';
      for (let i = 0; i < 120; i++) { x = r * x * (1 - x); ctx.fillRect(col, h - 8 - x * (h - 30), 1, 1); }
    }
    ctx.fillStyle = PV.overlay; ctx.font = '11px monospace';
    ctx.fillText('r = 2.4', 6, h - 4); ctx.fillText('r = 4', w - 40, h - 4);
    ctx.fillText('population x', 6, 14);
  });
  return () => { cancel(); stop(); };
};

/* ---------- 110 Borwein ---------- */
PREVIEWS['110 Borwein'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const sinc = (x) => (x === 0 ? 1 : Math.sin(x) / x);
  const f = (x, n) => { let p = 1; for (let k = 0; k <= n; k++) p *= sinc(x / (2 * k + 1)); return p; };
  const integral = (n) => { // Simpson on [0, L]
    const L = 400, N = 40000, dx = L / N; let s = f(0, n) + f(L, n);
    for (let i = 1; i < N; i++) s += f(i * dx, n) * (i % 2 ? 4 : 2);
    return (s * dx) / 3;
  };
  const values = Array.from({ length: 8 }, (_, n) => integral(n));
  const cancel = animate((t) => {
    const n = Math.floor(t / 1.6) % 8;
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h);
    const x0 = 30, y0 = h * 0.7, sx = (w - 60) / 24, sy = h * 0.5;
    ctx.strokeStyle = PV.surface1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(w - 20, y0); ctx.moveTo(x0, 20); ctx.lineTo(x0, h - 20); ctx.stroke();
    ctx.strokeStyle = PV.blue; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 600; i++) { const x = (i / 600) * 24; const y = y0 - f(x, n) * sy; i ? ctx.lineTo(x0 + x * sx, y) : ctx.moveTo(x0 + x * sx, y); }
    ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(137,180,250,0.15)'; ctx.lineTo(x0 + 24 * sx, y0); ctx.lineTo(x0, y0); ctx.fill();
    ctx.fillStyle = PV.text; ctx.font = '13px monospace';
    const factors = Array.from({ length: n + 1 }, (_, k) => `sinc(x/${2 * k + 1})`).join(' · ');
    ctx.fillText(`f(x) = ${factors}`, x0, 22);
    ctx.fillStyle = n === 7 ? PV.red : PV.green;
    ctx.fillText(`∫ f(x) dx ≈ ${values[n].toFixed(4)}   (π/2 = 1.5708)${n === 7 ? '   breaks here, by 2.3e-11' : ''}`, x0, 40);
  });
  return () => { cancel(); stop(); };
};

/* ---------- 109 Titration ---------- */
PREVIEWS['109 Titration'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const Ca = 0.1, Va = 25, Cb = 0.1;
  const pH = (v) => {
    const acid = Ca * Va - Cb * v, tot = Va + v;
    if (acid > 1e-9) return -Math.log10(acid / tot);
    if (acid < -1e-9) return 14 + Math.log10(-acid / tot);
    return 7;
  };
  const deriv = (v) => (pH(v + 0.05) - pH(v - 0.05)) / 0.1;
  let peakD = 0, peakV = 0;
  for (let i = 0; i <= 2000; i++) { const v = (i / 2000) * 50, d = deriv(v); if (d > peakD) { peakD = d; peakV = v; } }
  const cancel = animate((t) => {
    const progress = PV_REDUCED ? 1 : Math.min(1, (t % 6) / 4);
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h);
    const x0 = 36, y0 = h - 24, W = w - 56, H = h - 44;
    ctx.strokeStyle = PV.surface1; ctx.beginPath(); ctx.moveTo(x0, 20); ctx.lineTo(x0, y0); ctx.lineTo(x0 + W, y0); ctx.stroke();
    ctx.fillStyle = PV.overlay; ctx.font = '11px monospace';
    ctx.fillText('pH', 8, 30); ctx.fillText('volume of base (mL)', x0 + W - 130, h - 8);
    const eqV = peakV;
    ctx.strokeStyle = PV.blue; ctx.lineWidth = 2; ctx.beginPath();
    const steps = 400;
    for (let i = 0; i <= steps * progress; i++) {
      const v = (i / steps) * 50, y = pH(v);
      const px = x0 + (v / 50) * W, py = y0 - (y / 14) * H;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = PV.peach; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i <= steps * progress; i++) {
      const v = (i / steps) * 50;
      const px = x0 + (v / 50) * W, py = y0 - Math.min(1, deriv(v) / peakD) * H * 0.9;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    if (progress * 50 >= eqV) {
      const px = x0 + (eqV / 50) * W;
      ctx.setLineDash([4, 4]); ctx.strokeStyle = PV.green; ctx.beginPath(); ctx.moveTo(px, 20); ctx.lineTo(px, y0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = PV.green; ctx.fillText(`equivalence ≈ ${eqV.toFixed(1)} mL`, px + 6, 32);
    }
    ctx.fillStyle = PV.blue; ctx.fillText('pH', x0 + 8, 20 + 10); ctx.fillStyle = PV.peach; ctx.fillText('dpH/dV', x0 + 36, 20 + 10);
  });
  return () => { cancel(); stop(); };
};

/* ---------- 108 Trigo: exp of a matrix via power series ---------- */
PREVIEWS['108 Trigo'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const mul = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
  const I = [[1, 0], [0, 1]];
  // exp(A) = Σ A^k / k!   — cos(A) and sin(A) are the same idea with alternating signs
  function expSeries(A, terms) {
    let sum = [[0, 0], [0, 0]], P = I, fact = 1;
    for (let k = 0; k < terms; k++) {
      sum = sum.map((r, i) => r.map((v, j) => v + P[i][j] / fact));
      P = mul(P, A); fact *= k + 1;
    }
    return sum;
  }
  const cancel = animate((t) => {
    const theta = (t * 0.7) % (Math.PI * 2);
    const terms = 1 + Math.floor(((t % 7) / 7) * 12); // 1..12 terms
    const A = [[0, -theta], [theta, 0]];
    const E = expSeries(A, terms);
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h);
    const cx = w * 0.3, cy = h / 2, r = Math.min(w * 0.22, h * 0.36);
    ctx.strokeStyle = PV.surface1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    const exact = [Math.cos(theta) * r, Math.sin(theta) * r];
    const approx = [E[0][0] * r, E[1][0] * r];
    ctx.strokeStyle = PV.overlay; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + exact[0], cy - exact[1]); ctx.stroke();
    ctx.strokeStyle = PV.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + approx[0], cy - approx[1]); ctx.stroke(); ctx.lineWidth = 1;
    ctx.font = '12px monospace';
    const fmt = (M) => M.map((row) => '[ ' + row.map((v) => (v >= 0 ? ' ' : '') + v.toFixed(3)).join('  ') + ' ]');
    const tx = w * 0.56; let ty = 30;
    ctx.fillStyle = PV.sub; ctx.fillText(`A = θ·[[0,-1],[1,0]]   θ = ${theta.toFixed(2)}`, tx, ty); ty += 22;
    ctx.fillStyle = PV.yellow; ctx.fillText(`exp(A) = Σ Aᵏ/k!   with ${terms} term${terms > 1 ? 's' : ''}`, tx, ty); ty += 22;
    ctx.fillStyle = PV.text; ctx.fillText('exp(A) =', tx, ty); fmt(E).forEach((l) => { ctx.fillText(l, tx + 70, ty); ty += 16; }); ty += 6;
    ctx.fillStyle = PV.sub; ctx.fillText('exact  =', tx, ty); fmt([[Math.cos(theta), -Math.sin(theta)], [Math.sin(theta), Math.cos(theta)]]).forEach((l) => { ctx.fillText(l, tx + 70, ty); ty += 16; }); ty += 6;
    const err = Math.hypot(approx[0] - exact[0], approx[1] - exact[1]) / r;
    ctx.fillStyle = err < 0.01 ? PV.green : PV.peach; ctx.fillText(`error: ${err.toExponential(1)}`, tx, ty);
    ctx.fillStyle = PV.overlay; ctx.fillText('grey: exact rotation by θ', 16, h - 26);
    ctx.fillStyle = PV.green; ctx.fillText('green: exp(A) from the series (more terms = closer)', 16, h - 10);
  });
  return () => { cancel(); stop(); };
};

/* ---------- 107 Transfer ---------- */
PREVIEWS['107 Transfer'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const poly = (c, x) => c.reduce((s, a, i) => s + a * x ** i, 0);
  const h1 = (x) => poly([1, 2], x) / poly([1, 0.5, 1], x);
  const h2 = (x) => poly([2, 0, 1], x) / poly([1, 3, 0, 1], x);
  const cancel = animate((t) => {
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h);
    const x0 = 30, y0 = h * 0.6, W = w - 50, sy = h * 0.35;
    ctx.strokeStyle = PV.surface1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + W, y0); ctx.moveTo(x0, 16); ctx.lineTo(x0, h - 16); ctx.stroke();
    const progress = PV_REDUCED ? 1 : Math.min(1, (t % 5) / 3);
    const plot = (fn, col, width) => {
      ctx.strokeStyle = col; ctx.lineWidth = width; ctx.beginPath();
      for (let i = 0; i <= 500 * progress; i++) { const x = (i / 500) * 6; const y = y0 - fn(x) * sy; i ? ctx.lineTo(x0 + (x / 6) * W, y) : ctx.moveTo(x0 + (x / 6) * W, y); }
      ctx.stroke(); ctx.lineWidth = 1;
    };
    plot(h1, PV.blue, 1.5); plot(h2, PV.peach, 1.5); plot((x) => h1(x) * h2(x), PV.green, 2.5);
    ctx.font = '12px monospace';
    ctx.fillStyle = PV.blue; ctx.fillText('h1(x) = (1 + 2x) / (1 + 0.5x + x²)', x0 + 8, 20);
    ctx.fillStyle = PV.peach; ctx.fillText('h2(x) = (2 + x²) / (1 + 3x + x³)', x0 + 8, 36);
    ctx.fillStyle = PV.green; ctx.fillText('h(x) = h1(x) · h2(x)   (systems in series)', x0 + 8, 52);
  });
  return () => { cancel(); stop(); };
};

/* ---------- Fourier workshop: winding machine ---------- */
PREVIEWS['Fourier workshop'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const f1 = 3, f2 = 5, T = 4, N = 600;
  const sig = (t) => Math.cos(2 * Math.PI * f1 * t) + Math.cos(2 * Math.PI * f2 * t);
  const mags = [];
  const cancel = animate((t) => {
    const fSweep = PV_REDUCED ? 10 : (t * 1.2) % 10;
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h);
    // top: signal
    const sx0 = 14, sw = w * 0.55, sy = h * 0.27, sa = h * 0.08;
    ctx.strokeStyle = PV.mauve; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= N; i++) { const tt = (i / N) * T; const x = sx0 + (i / N) * sw, y = sy - sig(tt) * sa; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.font = '11px monospace'; ctx.fillStyle = PV.sub; ctx.fillText(`signal = cos(2π·${f1}t) + cos(2π·${f2}t)`, sx0, 14);
    // right: winding machine
    const cx = w * 0.8, cy = h * 0.42, r = Math.min(w * 0.16, h * 0.3);
    ctx.strokeStyle = PV.surface1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    let mx = 0, my = 0;
    ctx.strokeStyle = PV.yellow; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const tt = (i / N) * T, a = -2 * Math.PI * fSweep * tt, v = sig(tt);
      const x = cx + Math.cos(a) * v * r * 0.45, y = cy + Math.sin(a) * v * r * 0.45;
      mx += x; my += y; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke(); mx /= N + 1; my /= N + 1;
    ctx.fillStyle = PV.red; ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PV.sub; ctx.fillText(`winding at ${fSweep.toFixed(2)} Hz`, cx - r, cy + r + 16);
    // bottom: magnitude vs frequency
    const mag = Math.hypot(mx - cx, my - cy) / (r * 0.45);
    const idx = Math.round(fSweep * 50); mags[idx] = mag;
    const bx0 = 14, bw = w * 0.55, by = h - 16, bh = h * 0.42;
    ctx.strokeStyle = PV.surface1; ctx.beginPath(); ctx.moveTo(bx0, by); ctx.lineTo(bx0 + bw, by); ctx.stroke();
    ctx.strokeStyle = PV.green; ctx.lineWidth = 2; ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 500; i++) { if (mags[i] == null) continue; const x = bx0 + (i / 500) * bw, y = by - Math.min(1, mags[i]) * bh; started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true; }
    ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = PV.sub; ctx.fillText('|centre of mass| vs frequency  (peaks at 3 and 5 Hz)', bx0, by - bh - 6);
    [f1, f2].forEach((f) => { ctx.fillStyle = PV.overlay; ctx.fillText(`${f}`, bx0 + (f / 10) * bw - 3, by + 12); });
    ctx.fillStyle = PV.red; ctx.fillRect(bx0 + (fSweep / 10) * bw - 1, by - bh, 2, bh);
  });
  return () => { cancel(); stop(); };
};

/* ---------- Obsidian console: audit replay ---------- */
PREVIEWS['Obsidian console'] = (stage) => termPlayback(stage, [
  ['$ strings obsidian | grep -E \'^[a-zA-Z0-9_-]{4,20}$\'', 'c', 700],
  ['init_reactor', 'o', 80], ['check_reactor_status', 'o', 80], ['admin123', 'y', 80], ['activate_emergency_protocols', 'o', 900],
  ['$ ./obsidian', 'c', 600],
  ['obsidian> activate_emergency_protocols', 'c', 500],
  ['password: ********', 'o', 500],
  ['[!] Emergency protocols activated.', 'r', 1200],
  ['', 'o', 100],
  ['Vulnerability #1 — Hardcoded emergency password', 'y', 300],
  ['  Severity: Critical   Type: CWE-798 (hardcoded credentials)', 'o', 200],
  ['  The admin password sits in plaintext inside the binary; `strings` is enough to read it.', 'o', 900],
  ['', 'o', 100],
  ['Patches shipped:', 'g', 250],
  ['  activate_emergency_protocol.patch', 'o', 150], ['  load_fuel_rods.patch', 'o', 150],
  ['  run_diagnostic.patch', 'o', 150], ['  set_reactor_power.patch', 'o', 2500],
]);

/* ---------- 42sh: live lexer ---------- */
PREVIEWS['42sh'] = (stage) => {
  const ui = document.createElement('div'); ui.className = 'overlay-ui';
  const input = document.createElement('input'); input.type = 'text'; input.spellcheck = false;
  input.value = 'cat notes.txt | grep -i "todo list" >> out.txt 2>&1 && echo done';
  input.setAttribute('aria-label', 'command line to parse');
  ui.appendChild(input); stage.appendChild(ui);
  const term = document.createElement('div'); term.className = 'term'; term.style.paddingTop = '44px'; stage.appendChild(term);

  function lex(line) {
    const tokens = []; let i = 0;
    const isOp = (s) => ['||', '&&', '>>', '2>&1', '|', ';', '<', '>'].find((op) => s.startsWith(op));
    while (i < line.length) {
      if (/\s/.test(line[i])) { i++; continue; }
      const op = isOp(line.slice(i));
      if (op) { tokens.push({ t: op === '|' ? 'PIPE' : op === ';' ? 'SEMI' : op === '&&' || op === '||' ? 'LOGIC' : 'REDIR', v: op }); i += op.length; continue; }
      let word = '', quoted = false;
      while (i < line.length && (quoted || !/[\s|;<>&]/.test(line[i]))) {
        const ch = line[i];
        if (ch === '"' || ch === "'") { quoted = !quoted; i++; continue; }
        if (ch === '\\' && i + 1 < line.length) { word += line[i + 1]; i += 2; continue; }
        word += ch; i++;
      }
      tokens.push({ t: 'WORD', v: word, q: quoted });
    }
    return tokens;
  }

  function render() {
    const tokens = lex(input.value);
    term.innerHTML = '';
    const add = (text, cls) => { const d = document.createElement('div'); d.className = cls; d.textContent = text; term.appendChild(d); };
    add('tokens:', 'd');
    add(tokens.map((k) => `${k.t}(${k.v})`).join('  '), 'y');
    add('', 'o');
    let cmdN = 0, pipeN = 0;
    const lists = []; let cur = { pipes: [[]] };
    for (const k of tokens) {
      if (k.t === 'LOGIC' || k.t === 'SEMI') { lists.push(cur); lists.push({ op: k.v }); cur = { pipes: [[]] }; }
      else if (k.t === 'PIPE') cur.pipes.push([]);
      else cur.pipes[cur.pipes.length - 1].push(k);
    }
    lists.push(cur);
    add('parse tree:', 'd');
    for (const l of lists) {
      if (l.op) { add(`  ${l.op === '&&' ? 'AND then' : l.op === '||' ? 'OR else' : 'then'}`, 'c'); continue; }
      const pipes = l.pipes.filter((p) => p.length);
      if (pipes.length > 1) { add(`  pipeline (${pipes.length} processes, ${pipes.length - 1} pipe${pipes.length > 2 ? 's' : ''})`, 'g'); pipeN++; }
      pipes.forEach((p, i) => {
        const argv = [], redirs = [];
        for (let j = 0; j < p.length; j++) {
          if (p[j].t === 'REDIR') { redirs.push(p[j].v + (p[j].v === '2>&1' ? '' : ' ' + (p[j + 1]?.v ?? '?'))); if (p[j].v !== '2>&1') j++; }
          else argv.push(p[j].v);
        }
        cmdN++;
        add(`  ${pipes.length > 1 ? `  [${i}] ` : ''}exec ${argv.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(' ')}${redirs.length ? '   redirect: ' + redirs.join(', ') : ''}`, 'o');
      });
    }
    add('', 'o');
    add(`${cmdN} command${cmdN !== 1 ? 's' : ''} to fork, ${pipeN} pipeline${pipeN !== 1 ? 's' : ''}`, 'd');
  }
  input.addEventListener('input', render);
  render();
  return () => {};
};

/* ---------- My printf: live formatter ---------- */
PREVIEWS['My printf'] = (stage) => {
  const ARGS = ['khalil', 42, -7, 3.14159, 255, 'K'];
  const ui = document.createElement('div'); ui.className = 'overlay-ui';
  const input = document.createElement('input'); input.type = 'text'; input.spellcheck = false;
  input.value = '[%-8s] [%5d] [%+d] [%08.3f] [%#x] [%c] [%%]';
  input.setAttribute('aria-label', 'format string');
  ui.appendChild(input); stage.appendChild(ui);
  const term = document.createElement('div'); term.className = 'term'; term.style.paddingTop = '44px'; stage.appendChild(term);

  function myPrintf(fmt, args) {
    let out = '', ai = 0;
    const re = /%([-+ 0#]*)(\d+)?(?:\.(\d+))?([diuxXocsfe%])/g;
    let last = 0, m;
    while ((m = re.exec(fmt))) {
      out += fmt.slice(last, m.index); last = re.lastIndex;
      const [, flags, width, prec, conv] = m;
      if (conv === '%') { out += '%'; continue; }
      const arg = args[ai++];
      let body = '', sign = '';
      const num = Number(arg);
      switch (conv) {
        case 'd': case 'i': body = String(Math.abs(Math.trunc(num))); if (num < 0) sign = '-'; else if (flags.includes('+')) sign = '+'; else if (flags.includes(' ')) sign = ' '; break;
        case 'u': body = String(Math.trunc(num) >>> 0); break;
        case 'x': body = (Math.trunc(num) >>> 0).toString(16); if (flags.includes('#')) sign = '0x'; break;
        case 'X': body = (Math.trunc(num) >>> 0).toString(16).toUpperCase(); if (flags.includes('#')) sign = '0X'; break;
        case 'o': body = (Math.trunc(num) >>> 0).toString(8); if (flags.includes('#')) sign = '0'; break;
        case 'c': body = String(arg)[0] ?? ''; break;
        case 's': body = String(arg); if (prec != null) body = body.slice(0, +prec); break;
        case 'f': body = Math.abs(num).toFixed(prec != null ? +prec : 6); if (num < 0) sign = '-'; else if (flags.includes('+')) sign = '+'; break;
        case 'e': body = Math.abs(num).toExponential(prec != null ? +prec : 6).replace(/e([+-])(\d)$/, 'e$10$2'); if (num < 0) sign = '-'; else if (flags.includes('+')) sign = '+'; break;
      }
      if (prec != null && 'diuxXo'.includes(conv)) body = body.padStart(+prec, '0');
      let s = sign + body;
      const w = width ? +width : 0;
      if (s.length < w) {
        if (flags.includes('-')) s = s.padEnd(w);
        else if (flags.includes('0') && conv !== 's' && conv !== 'c' && prec == null) s = sign + body.padStart(w - sign.length, '0');
        else s = s.padStart(w);
      }
      out += s;
    }
    return out + fmt.slice(last);
  }

  function render() {
    term.innerHTML = '';
    const add = (text, cls) => { const d = document.createElement('div'); d.className = cls; d.textContent = text; term.appendChild(d); };
    add('my_printf(fmt, "khalil", 42, -7, 3.14159, 255, \'K\');', 'd');
    add('', 'o');
    add('output:', 'd');
    add(myPrintf(input.value, ARGS), 'g');
    add('', 'o');
    add('supported: %d %i %u %x %X %o %c %s %f %e %%   flags - + 0 space #   width and .precision', 'd');
  }
  input.addEventListener('input', render);
  render();
  return () => {};
};

/* ---------- Organized: files into folders ---------- */
PREVIEWS['Organized'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const kinds = { images: ['jpg', 'png', 'gif'], docs: ['pdf', 'txt', 'md'], code: ['c', 'py', 'sh'], music: ['mp3', 'wav'] };
  const folders = Object.keys(kinds);
  const names = ['photo', 'notes', 'main', 'song', 'cat', 'report', 'utils', 'beat', 'logo', 'todo', 'lib', 'intro', 'meme', 'readme', 'server', 'loop'];
  let files, t0;
  const reset = () => {
    files = names.map((n, i) => { const folder = folders[i % folders.length]; const ext = kinds[folder][i % kinds[folder].length]; return { name: `${n}.${ext}`, folder, i }; });
    t0 = null;
  };
  reset();
  const cancel = animate((t) => {
    if (t0 == null) t0 = t;
    const local = t - t0;
    if (local > 9) reset();
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h);
    ctx.font = '12px monospace';
    ctx.fillStyle = PV.overlay; ctx.fillText('~/Downloads (messy)', 16, 18);
    const fx = 16, fy = 36, fh = Math.min(14, (h - 50) / files.length);
    const gx = w * 0.55, gw = w * 0.4, gh = (h - 50) / folders.length;
    folders.forEach((f, i) => {
      const y = 30 + i * gh;
      ctx.strokeStyle = PV.surface1; ctx.strokeRect(gx, y, gw, gh - 8);
      ctx.fillStyle = PV.yellow; ctx.fillText(`📁 ${f}/`, gx + 8, y + 14);
    });
    files.forEach((f, i) => {
      const start = 1 + i * 0.35, p = PV_REDUCED ? 1 : Math.max(0, Math.min(1, (local - start) / 0.6));
      const e = p * p * (3 - 2 * p);
      const fi = folders.indexOf(f.folder);
      const nInFolder = files.filter((o) => o.folder === f.folder && o.i < f.i).length;
      const tx = gx + 14 + (nInFolder % 2) * (gw / 2), ty = 30 + fi * gh + 30 + Math.floor(nInFolder / 2) * 13;
      const x = fx + (tx - fx) * e, y = fy + i * fh + (ty - (fy + i * fh)) * e;
      ctx.fillStyle = p >= 1 ? PV.green : PV.text; ctx.fillText(f.name, x, y);
    });
    ctx.fillStyle = PV.sub; ctx.fillText(local < 1 ? '$ ./organized.sh ~/Downloads' : `sorted ${files.filter((f, i) => local >= 1 + i * 0.35 + 0.6).length}/${files.length} files by extension`, 16, h - 10);
  });
  return () => { cancel(); stop(); };
};

/* ---------- Chocolatine: CI pipeline ---------- */
PREVIEWS['Chocolatine'] = (stage) => {
  const { ctx, stop } = makeCanvas(stage);
  const steps = ['push', 'checkout', 'check_coding_style', 'check_program_compilation', 'run_tests', 'push_to_mirror'];
  const cancel = animate((t) => {
    const local = PV_REDUCED ? 99 : t % 11;
    const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight;
    ctx.fillStyle = PV.crust; ctx.fillRect(0, 0, w, h);
    ctx.font = '12px monospace';
    ctx.fillStyle = PV.overlay; ctx.fillText('.github/workflows/chocolatine.yml   on: push', 16, 20);
    const x0 = 24, y0 = 46, rowH = Math.min(30, (h - 60) / steps.length);
    steps.forEach((s, i) => {
      const y = y0 + i * rowH, startAt = i * 1.4, doneAt = startAt + 1.2;
      const state = local >= doneAt ? 'ok' : local >= startAt ? 'run' : 'wait';
      ctx.strokeStyle = PV.surface1; if (i) { ctx.beginPath(); ctx.moveTo(x0 + 7, y - rowH + 14); ctx.lineTo(x0 + 7, y - 2); ctx.stroke(); }
      ctx.fillStyle = state === 'ok' ? PV.green : state === 'run' ? PV.yellow : PV.surface1;
      ctx.beginPath(); ctx.arc(x0 + 7, y + 6, 6, 0, Math.PI * 2); ctx.fill();
      if (state === 'run') { ctx.strokeStyle = PV.yellow; ctx.beginPath(); ctx.arc(x0 + 7, y + 6, 10, local * 6, local * 6 + 2); ctx.stroke(); }
      ctx.fillStyle = state === 'wait' ? PV.overlay : PV.text; ctx.fillText(s, x0 + 24, y + 10);
      if (state === 'ok') { ctx.fillStyle = PV.green; ctx.fillText('✓', x0 + 24 + s.length * 7.3 + 8, y + 10); }
    });
    const all = local >= (steps.length - 1) * 1.4 + 1.2;
    ctx.fillStyle = all ? PV.green : PV.sub; ctx.fillText(all ? 'workflow passed, repository mirrored' : 'running…', 16, h - 10);
  });
  return () => { cancel(); stop(); };
};

/* ---------- Bug Break: README summary ---------- */
PREVIEWS['Bug Break'] = (stage) => emptyStage(stage, 'Unreal Engine 5.4, C++ + Blueprints', [
  'You just wanted a coffee. The office had other plans.',
  '',
  'Some office props are secretly bugs. Find them all to unlock the next room.',
  'A spider hunts you (WANDER / CHASE / SEARCH state machine). Hide in closets or under desks.',
  'Reach the coffee machine to win. Get caught and you wake up without coffee.',
]);

/* ---------- live sites ---------- */
PREVIEWS['Music visualizer'] = (stage) => iframeStage(stage, PREVIEW_LIVE['Music visualizer']);
PREVIEWS['MAX Finder'] = (stage) => iframeStage(stage, PREVIEW_LIVE['MAX Finder']);
