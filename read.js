/* Quick-read page: renders content.js as plain sections. */

'use strict';

(function () {
  const badge = (ext) => `<span class="file-ext" data-ext="${ext}">${ext === 'web' || ext === 'ai' ? ext : '.' + ext}</span>`;
  const tags = (p) => `<div class="tags">${p.tech.map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>`;
  const name = (p) => p.link
    ? `<a href="${escapeHTML(p.link)}" target="_blank" rel="noopener">${escapeHTML(p.name)}</a><span class="ext">github</span>`
    : escapeHTML(p.name);

  // experience
  const xp = document.getElementById('xp-root');
  if (xp) xp.innerHTML = renderExperienceHTML(EXPERIENCE);

  // favourites first, as cards
  const fav = document.getElementById('fav-root');
  fav.innerHTML = PROJECTS.filter((p) => p.featured).map((p) => `
    <article class="fav-card">
      <div class="fav-top">${badge(p.ext)}<span class="read-name">${name(p)}</span></div>
      <p class="read-blurb">${escapeHTML(p.blurb)}</p>
      ${tags(p)}
    </article>`).join('');

  // the rest grouped by category
  const root = document.getElementById('projects-root');
  const order = Object.keys(CATEGORIES).filter((k) => k !== 'all');
  root.innerHTML = order.map((cat) => {
    const items = PROJECTS.filter((p) => p.cat === cat && !p.featured);
    if (!items.length) return '';
    const rows = items.map((p) => `
      <li class="read-item">
        ${badge(p.ext)}
        <div>
          <div class="read-name">${name(p)}</div>
          <p class="read-blurb">${escapeHTML(p.blurb)}</p>
          ${tags(p)}
        </div>
      </li>`).join('');
    return `<h3 class="read-cat">${escapeHTML(CATEGORIES[cat])} <span class="dim">${items.length}</span></h3><ul class="read-list">${rows}</ul>`;
  }).join('');

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
