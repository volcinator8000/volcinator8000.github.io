/* Quick-read page: renders content.js as plain sections, with the same
   live previews as the desktop running inline while they are on screen. */

'use strict';

(function () {
  const badge = (ext) => `<span class="file-ext" data-ext="${ext}">${ext === 'web' || ext === 'ai' ? ext : '.' + ext}</span>`;
  const tags = (p) => `<div class="tags">${p.featured ? '<span class="tag star">★ favourite</span>' : ''}${p.tech.map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>`;
  const links = (p) => {
    const out = [];
    if (p.link) out.push(`<a class="ext-link" href="${escapeHTML(p.link)}" target="_blank" rel="noopener">github ↗</a>`);
    if (typeof PREVIEW_LIVE !== 'undefined' && PREVIEW_LIVE[p.name]) out.push(`<a class="ext-link" href="${escapeHTML(PREVIEW_LIVE[p.name])}" target="_blank" rel="noopener">live site ↗</a>`);
    if (p.name === 'Navigate') out.push(`<a class="ext-link" href="desktop.html#navigate">run it in the browser ↗</a>`);
    return out.length ? `<div class="pv-links">${out.join('')}</div>` : '';
  };
  const hasPreview = (p) => typeof PREVIEWS !== 'undefined' && typeof PREVIEWS[p.name] === 'function';

  // experience
  const xp = document.getElementById('xp-root');
  if (xp) xp.innerHTML = renderExperienceHTML(EXPERIENCE);

  // projects: one card per project, preview on top when there is one
  const root = document.getElementById('projects-root');
  const order = Object.keys(CATEGORIES).filter((k) => k !== 'all');
  const cardFor = (p) => `
    <article class="pv-card${hasPreview(p) ? '' : ' no-stage'}" data-name="${escapeHTML(p.name)}">
      ${hasPreview(p) ? '<div class="stage pv-stage" aria-label="Preview of ' + escapeHTML(p.name) + '"></div>' : ''}
      <div class="pv-body">
        <div class="pv-top">${badge(p.ext)}<span class="read-name">${escapeHTML(p.name)}</span></div>
        <p class="read-blurb">${escapeHTML(p.blurb)}</p>
        ${tags(p)}
        ${links(p)}
        ${hasPreview(p) && PREVIEW_NOTES[p.name] ? `<p class="pv-note">${escapeHTML(PREVIEW_NOTES[p.name])}</p>` : ''}
      </div>
    </article>`;

  const favs = PROJECTS.filter((p) => p.featured);
  root.innerHTML = `<h3 class="read-cat">Favourites</h3><div class="pv-grid">${favs.map(cardFor).join('')}</div>` +
    order.map((cat) => {
      const items = PROJECTS.filter((p) => p.cat === cat && !p.featured);
      if (!items.length) return '';
      return `<h3 class="read-cat">${escapeHTML(CATEGORIES[cat])} <span class="dim">${items.length}</span></h3><div class="pv-grid">${items.map(cardFor).join('')}</div>`;
    }).join('');

  // run a preview only while its card is on screen
  const running = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const stage = entry.target;
      const name = stage.parentElement.dataset.name;
      if (entry.isIntersecting && !running.has(stage)) {
        try {
          running.set(stage, PREVIEWS[name](stage) || (() => {}));
        } catch (err) {
          console.error('preview failed', name, err);
          stage.innerHTML = '<div class="empty"><strong>preview crashed</strong></div>';
          running.set(stage, () => {});
        }
      } else if (!entry.isIntersecting && running.has(stage)) {
        try { running.get(stage)(); } catch (e) { /* ignore */ }
        running.delete(stage);
        stage.innerHTML = '';
      }
    });
  }, { rootMargin: '120px 0px', threshold: 0.05 });
  document.querySelectorAll('.pv-stage').forEach((s) => io.observe(s));

  document.getElementById('print-btn').addEventListener('click', () => window.print());

  // highlight the section in view in the sticky nav
  const navLinks = Array.from(document.querySelectorAll('.read-nav-mid a'));
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
  const onScroll = () => {
    const y = window.scrollY + 120;
    let active = 0;
    sections.forEach((s, i) => { if (s && s.offsetTop <= y) active = i; });
    navLinks.forEach((a, i) => a.classList.toggle('active', i === active));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
