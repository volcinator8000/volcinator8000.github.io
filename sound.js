/* ============================================================
   Tiny synthesized sound kit shared by the landing and the desktop.
   No audio files: everything is oscillators and noise through the
   Web Audio API. Browsers refuse to play anything before the visitor
   has clicked or pressed a key, so `Sound.tryUnlock()` is called at
   load (works when the browser already trusts the site) and again on
   the first gesture.
   Preference key `crtSound` in localStorage: 'on' | 'off'.
   ============================================================ */

'use strict';

const Sound = (function () {
  let enabled = true;
  try { enabled = localStorage.getItem('crtSound') !== 'off'; } catch (e) { /* ignore */ }

  let ctx = null;
  let unlocked = false;
  let hum = null;
  const listeners = [];

  function context() {
    if (!enabled || !unlocked) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Try to get a running context now. Resolves true when audio is allowed.
  function tryUnlock() {
    if (!enabled) return Promise.resolve(false);
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return Promise.resolve(false);
    if (!ctx) ctx = new AC();
    const p = ctx.state === 'running' ? Promise.resolve() : ctx.resume();
    return p.then(() => {
      if (ctx.state === 'running') { const was = unlocked; unlocked = true; if (!was) listeners.forEach((f) => f()); return true; }
      return false;
    }).catch(() => false);
  }

  function onUnlock(fn) { if (unlocked) fn(); else listeners.push(fn); }

  function tone(freq, dur, type = 'square', gain = 0.05, when = 0) {
    const c = context(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    const t = c.currentTime + when;
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function sweep(f0, f1, dur, type = 'square', gain = 0.05) {
    const c = context(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    const t = c.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, gain = 0.04) {
    const c = context(); if (!c) return;
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const n = c.createBufferSource(), g = c.createGain();
    n.buffer = buf; g.gain.value = gain;
    n.connect(g).connect(c.destination); n.start();
  }

  let lastTick = 0;
  const api = {
    get enabled() { return enabled; },
    get unlocked() { return unlocked; },
    tryUnlock,
    onUnlock,

    setEnabled(on) {
      enabled = on;
      try { localStorage.setItem('crtSound', on ? 'on' : 'off'); } catch (e) { /* ignore */ }
      if (!on) api.hum(false);
    },

    // key click while text types itself or the visitor types
    tick() {
      const now = performance.now();
      if (now - lastTick < 28) return;
      lastTick = now;
      tone(1400 + Math.random() * 500, 0.02, 'square', 0.03);
    },
    blip() { tone(880, 0.06, 'square', 0.05); },                                       // selection moved, chip clicked
    confirm() { tone(660, 0.08, 'square', 0.06); tone(990, 0.12, 'square', 0.06, 0.09); }, // enter / run
    granted() { tone(523, 0.1, 'square', 0.05); tone(659, 0.1, 'square', 0.05, 0.11); tone(784, 0.18, 'square', 0.06, 0.22); },
    error() { tone(180, 0.18, 'sawtooth', 0.05); tone(150, 0.2, 'sawtooth', 0.04, 0.12); },
    open() { sweep(300, 900, 0.14, 'triangle', 0.06); },                                // window opens
    close() { sweep(700, 220, 0.14, 'triangle', 0.05); },                               // window closes
    step(k) { tone(300 + k * 40, 0.03, 'square', 0.03); },                              // progress bar notch
    powerOn() { sweep(80, 1200, 0.5, 'sine', 0.08); noise(0.3, 0.04); },                // tube warming up

    hum(on) {
      if (!on) { if (hum) { try { hum.stop(); } catch (e) { /* ignore */ } hum = null; } return; }
      const c = context(); if (!c || hum) return;
      const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = 50;
      f.type = 'lowpass'; f.frequency.value = 120;
      g.gain.value = 0.012;
      o.connect(f).connect(g).connect(c.destination); o.start();
      hum = o;
    },
  };

  // first gesture anywhere unlocks audio
  const unlockOnGesture = () => { tryUnlock().then((ok) => { if (ok) { document.removeEventListener('pointerdown', unlockOnGesture, true); document.removeEventListener('keydown', unlockOnGesture, true); } }); };
  document.addEventListener('pointerdown', unlockOnGesture, true);
  document.addEventListener('keydown', unlockOnGesture, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) api.hum(false); });

  return api;
})();
