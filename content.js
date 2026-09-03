/* ============================================================
   All the portfolio content in one place: projects and work experience.
   Loaded by desktop.html and read.html.
   ============================================================ */

'use strict';

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
// `ext` is the little file-type badge: c, cpp, py, sh, js, web, yml, ai.
// `link` is optional — Epitech repos are private, so most rows have none.
const PROJECTS = [
  { name: '42sh', ext: 'c', cat: 'systems', tech: ['C', 'POSIX'], featured: true,
    blurb: 'A Unix shell in C: pipes, redirections, builtins and the usual quoting headaches.' },
  { name: 'Obsidian console', ext: 'c', cat: 'devops', tech: ['C', 'security audit'], featured: true, link: `${GITHUB}/corewar`,
    blurb: 'Security audit of a nuclear-reactor console CLI in C: white-box and black-box review, vulnerability report and patches.' },
  { name: 'My World', ext: 'c', cat: 'graphics', tech: ['C', 'CSFML'], featured: true,
    blurb: 'An isometric 3D world editor: terrain, elevation and hand-rolled projection maths.' },
  { name: 'Amazed', ext: 'c', cat: 'algo', tech: ['C', 'BFS'], featured: true,
    blurb: 'Maze solver that finds the shortest path with breadth-first search on very large grids.' },

  { name: 'My printf', ext: 'c', cat: 'systems', tech: ['C'],
    blurb: 'printf rebuilt from scratch: parsing format strings and handling every conversion by hand.' },
  { name: 'Robot Factory', ext: 'c', cat: 'systems', tech: ['C'],
    blurb: 'An assembler for a made-up robot instruction set, turning source files into binary.' },
  { name: 'Count Islands', ext: 'c', cat: 'algo', tech: ['C', 'flood fill'],
    blurb: 'Flood-fill over a 2D map to count and label every island.' },
  { name: 'Navigate', ext: 'py', cat: 'algo', tech: ['pathfinding'], link: `${GITHUB}/navigate`,
    blurb: 'A local GPS navigation system.' },
  { name: 'Star', ext: 'c', cat: 'graphics', tech: ['C', 'CSFML'],
    blurb: 'A starfield animation: pixels, vectors and frame timing.' },
  { name: 'Bug Break', ext: 'cpp', cat: 'graphics', tech: ['C++', 'Unreal Engine 5'], link: `${GITHUB}/gamejam`,
    blurb: 'Game-jam horror comedy: find the bugged office props, hide from the spider, reach the coffee machine.' },
  { name: 'Music visualizer', ext: 'js', cat: 'tools', tech: ['JavaScript', 'web'], link: `${GITHUB}/music-visualizer`,
    blurb: 'A web page that draws instruments and audio effects as waves and sines.' },
  { name: 'MAX Finder', ext: 'web', cat: 'tools', tech: ['SNCF open data', 'PWA'], link: `${GITHUB}/max-trip-chain`,
    blurb: 'Find every SNCF train with a free MAX JEUNE / SENIOR seat in one search, and chain them into a tour.' },
  { name: 'Cuddle', ext: 'ai', cat: 'algo', tech: ['AI'],
    blurb: 'An AI bot project: decision-making and heuristics.' },
  { name: 'Organized', ext: 'sh', cat: 'systems', tech: ['Bash'],
    blurb: 'A Bash script that sorts a messy directory into folders by file type.' },
  { name: 'Setting Up', ext: 'sh', cat: 'systems', tech: ['Linux', 'Bash'],
    blurb: 'Day one: setting up a Linux development environment from scratch.' },
  { name: 'Fourier workshop', ext: 'py', cat: 'maths', tech: ['Python', 'Jupyter'], link: `${GITHUB}/Fourier-workshop`,
    blurb: 'A live notebook showing how an FFT works and what it is good for.' },
  { name: '110 Borwein', ext: 'py', cat: 'maths', tech: ['Python'],
    blurb: 'Numerical integration of Borwein integrals, where a neat pattern suddenly breaks.' },
  { name: '109 Titration', ext: 'py', cat: 'maths', tech: ['Python'],
    blurb: 'Finding the equivalence point of a titration curve with numerical derivatives.' },
  { name: '108 Trigo', ext: 'py', cat: 'maths', tech: ['Python'],
    blurb: 'Trig functions on matrices, computed from their power series.' },
  { name: '107 Transfer', ext: 'py', cat: 'maths', tech: ['Python'],
    blurb: 'Transfer functions of chained systems, from polynomial coefficients.' },
  { name: '106 Bombyx', ext: 'py', cat: 'maths', tech: ['Python'],
    blurb: 'Modelling a silkworm population with the logistic map, plus bifurcation diagrams.' },
  { name: 'Chocolatine', ext: 'yml', cat: 'devops', tech: ['GitHub Actions'], link: `${GITHUB}/painauchocolat`,
    blurb: 'A CI pipeline with GitHub Actions: build, test and mirror on every push.' },
  { name: 'Hack Juice', ext: 'web', cat: 'devops', tech: ['web security'],
    blurb: 'Breaking into OWASP Juice Shop: XSS, injection and broken auth.' },
];


// Work experience. Shown in the desktop's experience.md window and on the
// quick-read page. Edit here, both views update.
const EXPERIENCE = {
  role: 'Web & SEO engineer',
  company: 'Remoters',
  url: 'https://www.remoters.io',
  dates: 'August 2026 – now',
  langs: 'French and English',
  about: 'Remoters is a marketplace that connects people moving abroad with vetted local home finders. The site runs on Webflow behind Cloudflare: about 5,500 indexed URLs, 40 CMS collections, two locales.',
  sections: [
    { title: 'Technical SEO clean-up', bullets: [
      'Sitemap trimmed from 6,439 to 5,506 URLs: questionnaires, redirecting and utility pages out, with an edge filter for what the CMS refuses to hide.',
      'robots.txt rewritten, AI crawlers unblocked, noindex response headers at the edge for the zombie sections.',
      '471 redirects rebuilt from a Search Console 404 export, tested one by one before shipping. IndexNow key served.',
    ] },
    { title: 'English locale', bullets: [
      'Seven transverse pages translated and slugged under /en, with bilingual header and footer components.',
      'About 10,900 English alt texts and per-locale JSON-LD written through the API.',
      'Found and fixed the pages where the EN locale silently served French content.',
    ] },
    { title: 'Structured data', bullets: [
      'Organization, Breadcrumb, Service, FAQ and Article graphs on the static pages and templates.',
      'A Cloudflare Worker that injects per-page schema on more than 2,600 template pages the CMS could not express itself.',
      'Blog Article schema repaired at the edge by replacing the broken block on every post.',
    ] },
    { title: 'Reviews page rebuild', bullets: [
      'Two client-side widgets replaced by 1,157 server-rendered Google and Trustpilot reviews with filters, dates and anonymised authors.',
      'Assembled at the edge by a Worker because the CMS was near its item cap; ranking rule disclosed as French consumer law requires.',
      'Same page delivered in English on its own locale.',
    ] },
    { title: 'Redesign support', bullets: [
      'New shared header and footer components, a language switcher, a mobile menu and a harmonisation stylesheet across the nine redesigned pages.',
      'Homepage city-search modal covering 310 cities with rent and buy routing in both locales.',
      'Width, hero and FAQ passes on the new homepage from client feedback rounds.',
    ] },
    { title: 'Content hygiene at scale', bullets: [
      '11,649 CMS images given French alt text through the API, in batches sized to what the API tolerates.',
      '131 duplicate CMS items mapped with their reference graph before any decision was taken.',
      'A responsive audit of 5,774 URLs done by measurement, without a browser.',
    ] },
    { title: 'Infrastructure planning', bullets: [
      'Migration guide for moving a CMS collection and static pages from Webflow to AWS S3 and CloudFront, behind the same Cloudflare.',
      'An AWS primer written for the team, from accounts to costs.',
    ] },
  ],
  tools: ['Webflow Data API v2', 'Webflow MCP', 'Cloudflare Workers', 'HTMLRewriter', 'Cloudflare rulesets & bulk redirects', 'Cloudflare GraphQL analytics', 'Python', 'Bash & curl', 'JSON-LD / schema.org', 'IndexNow', 'Google Search Console', 'AWS S3 + CloudFront', 'headless Chrome', 'Claude Code'],
  skills: ['technical SEO', 'internationalisation', 'structured data', 'edge computing', 'API automation at scale', 'data cleaning', 'accessibility', 'GDPR-aware publishing', 'auditing without a browser', 'client communication', 'decision logs'],
};

// Shared renderer for the experience block (used by both pages).
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderExperienceHTML(xp) {
  const tags = (list, cls) => list.map((t) => `<span class="tag${cls ? ' ' + cls : ''}">${escapeHTML(t)}</span>`).join('');
  const cards = xp.sections.map((sec) => `
    <article class="xp-card">
      <h4>${escapeHTML(sec.title)}</h4>
      <ul>${sec.bullets.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}</ul>
    </article>`).join('');
  return `
    <header class="xp-head">
      <div class="xp-role">${escapeHTML(xp.role)} <span class="dim">at</span> <a href="${escapeHTML(xp.url)}" target="_blank" rel="noopener">${escapeHTML(xp.company)}</a></div>
      <div class="xp-meta">${escapeHTML(xp.dates)} · ${escapeHTML(xp.langs)}</div>
      <p class="xp-about">${escapeHTML(xp.about)}</p>
    </header>
    <h3 class="xp-h">What I did</h3>
    <div class="xp-grid">${cards}</div>
    <h3 class="xp-h">Tools used</h3>
    <div class="tags xp-tags">${tags(xp.tools)}</div>
    <h3 class="xp-h">Skills</h3>
    <div class="tags xp-tags">${tags(xp.skills, 'skill')}</div>`;
}
