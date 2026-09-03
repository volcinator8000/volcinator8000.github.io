/* Quick-read page: renders content.js as plain sections. */

'use strict';

(function () {
  const badge = (ext) => `<span class="file-ext" data-ext="${ext}">${ext === 'web' || ext === 'ai' ? ext : '.' + ext}</span>`;

  // experience
  const xp = document.getElementById('xp-root');
  if (xp) xp.innerHTML = renderExperienceHTML(EXPERIENCE);

  // projects grouped by category, favourites first inside each group
  const root = document.getElementById('projects-root');
  const order = Object.keys(CATEGORIES).filter((k) => k !== 'all');
  root.innerHTML = order.map((cat) => {
    const items = PROJECTS.filter((p) => p.cat === cat).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    if (!items.length) return '';
    const rows = items.map((p) => `
      <li class="read-item">
        ${badge(p.ext)}
        <div>
          <div class="read-name">
            ${p.link ? `<a href="${escapeHTML(p.link)}" target="_blank" rel="noopener">${escapeHTML(p.name)}</a><span class="ext">github</span>` : escapeHTML(p.name)}
          </div>
          <p class="read-blurb">${escapeHTML(p.blurb)}</p>
          <div class="tags">${p.featured ? '<span class="tag star">★ favourite</span>' : ''}${p.tech.map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>
        </div>
      </li>`).join('');
    return `<h3 class="read-cat">${escapeHTML(CATEGORIES[cat])}</h3><ul class="read-list">${rows}</ul>`;
  }).join('');
})();
