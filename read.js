/* Quick-read page: renders content.js as plain sections, with the same
   live previews as the desktop running inline while they are on screen.
   Favourites are shown open; the other themes are folded. */

'use strict';

(function () {
  const t = (k) => I18N.t(k);
  const badge = (ext) => `<span class="file-ext" data-ext="${ext}">${ext === 'web' || ext === 'ai' ? ext : '.' + ext}</span>`;
  const tags = (p) => `<div class="tags">${p.featured ? '<span class="tag star">★</span>' : ''}${p.tech.map((x) => `<span class="tag">${escapeHTML(x)}</span>`).join('')}</div>`;
  const links = (p) => {
    const out = [];
    if (p.link) out.push(`<a class="ext-link" href="${escapeHTML(p.link)}" target="_blank" rel="noopener">${t('preview.github')}</a>`);
    if (typeof PREVIEW_LIVE !== 'undefined' && PREVIEW_LIVE[p.name]) out.push(`<a class="ext-link" href="${escapeHTML(PREVIEW_LIVE[p.name])}" target="_blank" rel="noopener">${t('preview.live')}</a>`);
    if (p.name === 'Navigate') out.push(`<a class="ext-link" href="desktop.html#navigate">${t('read.run')}</a>`);
    return out.length ? `<div class="pv-links">${out.join('')}</div>` : '';
  };
  const hasPreview = (p) => typeof PREVIEWS !== 'undefined' && typeof PREVIEWS[p.name] === 'function';

  const cardFor = (p) => `
    <article class="pv-card${hasPreview(p) ? '' : ' no-stage'}" data-name="${escapeHTML(p.name)}" id="${projectSlug(p)}">
      ${hasPreview(p) ? '<div class="stage pv-stage" aria-label="' + escapeHTML(p.name) + '"></div>' : ''}
      <div class="pv-body">
        <div class="pv-top">${badge(p.ext)}<span class="read-name">${escapeHTML(p.name)}</span><a class="pv-anchor" href="#${projectSlug(p)}" title="${escapeHTML(p.name)}">#</a></div>
        <p class="read-blurb">${escapeHTML(I18N.field(p, 'blurb'))}</p>
        ${tags(p)}
        ${links(p)}
        ${hasPreview(p) && previewNote(p.name) ? `<p class="pv-note">${escapeHTML(previewNote(p.name))}</p>` : ''}
      </div>
    </article>`;

  // ---- previews run only while on screen
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
          stage.innerHTML = `<div class="empty"><strong>${t('preview.crashed')}</strong></div>`;
          running.set(stage, () => {});
        }
      } else if (!entry.isIntersecting && running.has(stage)) {
        try { running.get(stage)(); } catch (e) { /* ignore */ }
        running.delete(stage);
        stage.innerHTML = '';
      }
    });
  }, { rootMargin: '120px 0px', threshold: 0.05 });

  function stopAll() {
    running.forEach((stop, stage) => { try { stop(); } catch (e) { /* ignore */ } io.unobserve(stage); });
    running.clear();
  }

  function render() {
    stopAll();
    const xp = document.getElementById('xp-root');
    if (xp) xp.innerHTML = renderExperienceHTML(currentExperience(), { collapsible: true, openFirst: false });

    const root = document.getElementById('projects-root');
    const order = Object.keys(CATEGORIES).filter((k) => k !== 'all');
    const favs = PROJECTS.filter((p) => p.featured);
    root.innerHTML = `<h3 class="read-cat">${t('read.favs')}</h3><div class="pv-grid">${favs.map(cardFor).join('')}</div>` +
      `<h3 class="read-cat">${t('read.more')}</h3>` +
      order.map((cat) => {
        const items = PROJECTS.filter((p) => p.cat === cat && !p.featured);
        if (!items.length) return '';
        return `<details class="fold"><summary><span>${escapeHTML(categoryLabel(cat))}</span><span class="dim">${items.length}</span></summary><div class="pv-grid">${items.map(cardFor).join('')}</div></details>`;
      }).join('');

    document.querySelectorAll('.pv-stage').forEach((s) => io.observe(s));
  }

  render();
  document.addEventListener('langchange', () => { render(); revealHash(); });

  // #<project-slug> opens the fold it lives in and scrolls to the card
  function revealHash() {
    const p = projectBySlug(location.hash.slice(1));
    if (!p) return;
    const card = document.getElementById(projectSlug(p));
    if (!card) return;
    const fold = card.closest('details.fold');
    if (fold) fold.open = true;
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 1600);
    setTimeout(() => card.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
  }
  window.addEventListener('hashchange', revealHash);
  setTimeout(revealHash, 300);

  I18N.apply();
  document.getElementById('lang-toggle').addEventListener('click', () => I18N.toggle());
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
