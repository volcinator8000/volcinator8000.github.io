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
  maths: 'Maths & data',
  graphics: 'Graphics & Games',
  devops: 'DevOps & Security',
  tools: 'Tools & Web',
};

const CATEGORIES_FR = {
  all: 'Tout',
  systems: 'Systèmes & C',
  algo: 'Algorithmes',
  maths: 'Maths & données',
  graphics: 'Graphisme & jeux',
  devops: 'DevOps & sécurité',
  tools: 'Outils & web',
};

// category label in the current language
function categoryLabel(key) {
  return (typeof I18N !== 'undefined' && I18N.lang === 'fr' ? CATEGORIES_FR : CATEGORIES)[key];
}

// Edit this list to add / reorder projects. `featured` pins a project at the top.
// `ext` is the little file-type badge: c, cpp, py, sh, js, web, yml, ai.
// `link` is optional — Epitech repos are private, so most rows have none.
const PROJECTS = [
  { name: '42sh', ext: 'c', cat: 'systems', tech: ['C', 'POSIX'], featured: true,
    blurb: 'A Unix shell in C: pipes, redirections, builtins and the usual quoting headaches.',
    blurb_fr: 'Un shell Unix en C : pipes, redirections, builtins et les habituels casse-têtes de quoting.' },
  { name: 'Obsidian console', ext: 'c', cat: 'devops', tech: ['C', 'security audit'], featured: true, link: `${GITHUB}/corewar`,
    blurb: 'Security audit of a nuclear-reactor console CLI in C: white-box and black-box review, vulnerability report and patches.',
    blurb_fr: 'Audit de sécurité d\'une console de réacteur nucléaire en C : revue boîte blanche et boîte noire, rapport de vulnérabilités et correctifs.' },
  { name: 'My World', ext: 'c', cat: 'graphics', tech: ['C', 'CSFML'], featured: true,
    blurb: 'An isometric 3D world editor: terrain, elevation and hand-rolled projection maths.',
    blurb_fr: 'Un éditeur de monde 3D isométrique : terrain, relief et maths de projection faites à la main.' },
  { name: 'Amazed', ext: 'c', cat: 'algo', tech: ['C', 'BFS'], featured: true,
    blurb: 'Maze solver that finds the shortest path with breadth-first search on very large grids.',
    blurb_fr: 'Résolveur de labyrinthe qui trouve le plus court chemin par parcours en largeur sur de très grandes grilles.' },

  { name: 'My printf', ext: 'c', cat: 'systems', tech: ['C'],
    blurb: 'printf rebuilt from scratch: parsing format strings and handling every conversion by hand.',
    blurb_fr: 'printf réécrit de zéro : analyse des chaînes de format et gestion de chaque conversion à la main.' },
  { name: 'Robot Factory', ext: 'c', cat: 'systems', tech: ['C'],
    blurb: 'An assembler for a made-up robot instruction set, turning source files into binary.',
    blurb_fr: 'Un assembleur pour un jeu d\'instructions robot inventé, qui transforme des sources en binaire.' },
  { name: 'Count Islands', ext: 'c', cat: 'algo', tech: ['C', 'flood fill'],
    blurb: 'Flood-fill over a 2D map to count and label every island.',
    blurb_fr: 'Remplissage par diffusion sur une carte 2D pour compter et étiqueter chaque île.' },
  { name: 'Navigate', ext: 'py', cat: 'algo', tech: ['pathfinding'], link: `${GITHUB}/navigate`,
    blurb: 'A local GPS navigation system.',
    blurb_fr: 'Un système de navigation GPS local.' },
  { name: 'Star', ext: 'c', cat: 'graphics', tech: ['C', 'CSFML'],
    blurb: 'A starfield animation: pixels, vectors and frame timing.',
    blurb_fr: 'Une animation de champ d\'étoiles : pixels, vecteurs et gestion du temps par image.' },
  { name: 'Bug Break', ext: 'cpp', cat: 'graphics', tech: ['C++', 'Unreal Engine 5'], link: `${GITHUB}/gamejam`,
    blurb: 'Game-jam horror comedy: find the bugged office props, hide from the spider, reach the coffee machine.',
    blurb_fr: 'Comédie horrifique de game jam : trouver les objets de bureau « buggés », se cacher de l\'araignée, atteindre la machine à café.' },
  { name: 'Music visualizer', ext: 'js', cat: 'tools', tech: ['JavaScript', 'web'], link: `${GITHUB}/music-visualizer`,
    blurb: 'A web page that draws instruments and audio effects as waves and sines.',
    blurb_fr: 'Une page web qui dessine instruments et effets audio sous forme d\'ondes et de sinus.' },
  { name: 'MAX Finder', ext: 'web', cat: 'tools', tech: ['SNCF open data', 'PWA'], link: `${GITHUB}/max-trip-chain`,
    blurb: 'Find every SNCF train with a free MAX JEUNE / SENIOR seat in one search, and chain them into a tour.',
    blurb_fr: 'Trouver en une recherche tous les trains SNCF avec une place MAX JEUNE / SENIOR libre, et les enchaîner en itinéraire.' },
  { name: 'Cuddle', ext: 'ai', cat: 'algo', tech: ['AI'],
    blurb: 'An AI bot project: decision-making and heuristics.',
    blurb_fr: 'Un projet de bot IA : prise de décision et heuristiques.' },
  { name: 'Organized', ext: 'sh', cat: 'systems', tech: ['Bash'],
    blurb: 'A Bash script that sorts a messy directory into folders by file type.',
    blurb_fr: 'Un script Bash qui range un dossier en désordre dans des sous-dossiers par type de fichier.' },
  { name: 'Setting Up', ext: 'sh', cat: 'systems', tech: ['Linux', 'Bash'],
    blurb: 'Day one: setting up a Linux development environment from scratch.',
    blurb_fr: 'Premier jour : mettre en place un environnement de développement Linux de zéro.' },
  { name: 'Tardis', ext: 'py', cat: 'maths', tech: ['Python', 'scikit-learn', 'XGBoost', 'Streamlit'], link: `${GITHUB}/Tardis`,
    blurb: "Predicting SNCF train delays: cleaning and EDA notebooks, three trained models, and a Streamlit dashboard that predicts a journey's arrival delay.",
    blurb_fr: "Prédire les retards de trains SNCF : notebooks de nettoyage et d'exploration, trois modèles entraînés, et un tableau de bord Streamlit qui prédit le retard à l'arrivée d'un trajet." },
  { name: 'Fourier workshop', ext: 'py', cat: 'maths', tech: ['Python', 'Jupyter'], link: `${GITHUB}/Fourier-workshop`,
    blurb: 'A live notebook showing how an FFT works and what it is good for.',
    blurb_fr: 'Un notebook interactif qui montre comment fonctionne une FFT et à quoi elle sert.' },
  { name: '110 Borwein', ext: 'py', cat: 'maths', tech: ['Python'],
    blurb: 'Numerical integration of Borwein integrals, where a neat pattern suddenly breaks.',
    blurb_fr: 'Intégration numérique des intégrales de Borwein, où un joli motif se casse d\'un coup.' },
  { name: '109 Titration', ext: 'py', cat: 'maths', tech: ['Python'],
    blurb: 'Finding the equivalence point of a titration curve with numerical derivatives.',
    blurb_fr: 'Trouver le point d\'équivalence d\'une courbe de titrage par dérivation numérique.' },
  { name: '108 Trigo', ext: 'py', cat: 'maths', tech: ['Python'],
    blurb: 'Trig functions on matrices, computed from their power series.',
    blurb_fr: 'Fonctions trigonométriques sur des matrices, calculées à partir de leurs séries entières.' },
  { name: '107 Transfer', ext: 'py', cat: 'maths', tech: ['Python'],
    blurb: 'Transfer functions of chained systems, from polynomial coefficients.',
    blurb_fr: 'Fonctions de transfert de systèmes en chaîne, à partir de coefficients de polynômes.' },
  { name: '106 Bombyx', ext: 'py', cat: 'maths', tech: ['Python'],
    blurb: 'Modelling a silkworm population with the logistic map, plus bifurcation diagrams.',
    blurb_fr: 'Modéliser une population de vers à soie avec l\'application logistique, plus des diagrammes de bifurcation.' },
  { name: 'Chocolatine', ext: 'yml', cat: 'devops', tech: ['GitHub Actions'], link: `${GITHUB}/painauchocolat`,
    blurb: 'A CI pipeline with GitHub Actions: build, test and mirror on every push.',
    blurb_fr: 'Un pipeline CI avec GitHub Actions : build, tests et miroir à chaque push.' },
  { name: 'Hack Juice', ext: 'web', cat: 'devops', tech: ['web security'],
    blurb: 'Breaking into OWASP Juice Shop: XSS, injection and broken auth.',
    blurb_fr: 'S\'introduire dans OWASP Juice Shop : XSS, injections et authentification cassée.' },
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

const EXPERIENCE_FR = {
  role: 'Ingénieur web & SEO',
  company: 'Remoters',
  url: 'https://www.remoters.io',
  dates: "Août 2026 – aujourd'hui",
  langs: 'français et anglais',
  about: "Remoters est une marketplace qui met en relation des personnes s'installant à l'étranger avec des chasseurs immobiliers locaux vérifiés. Le site tourne sur Webflow derrière Cloudflare : environ 5 500 URL indexées, 40 collections CMS, deux langues.",
  sections: [
    { title: 'Nettoyage SEO technique', bullets: [
      'Sitemap ramené de 6 439 à 5 506 URL : questionnaires, pages redirigées et pages utilitaires sorties, avec un filtre en edge pour ce que le CMS refuse de cacher.',
      'robots.txt réécrit, robots IA débloqués, en-têtes noindex en edge pour les sections zombies.',
      "471 redirections reconstruites à partir d'un export 404 de la Search Console, testées une par une avant mise en ligne. Clé IndexNow servie.",
    ] },
    { title: 'Version anglaise', bullets: [
      'Sept pages transverses traduites et slugguées sous /en, avec des composants header et footer bilingues.',
      "Environ 10 900 textes alternatifs anglais et du JSON-LD par langue écrits via l'API.",
      'Pages où la version anglaise servait silencieusement du contenu français trouvées et corrigées.',
    ] },
    { title: 'Données structurées', bullets: [
      'Graphes Organization, Breadcrumb, Service, FAQ et Article sur les pages statiques et les templates.',
      'Un Worker Cloudflare qui injecte un schéma par page sur plus de 2 600 pages de template que le CMS ne pouvait pas exprimer.',
      'Schéma Article du blog réparé en edge en remplaçant le bloc cassé sur chaque article.',
    ] },
    { title: 'Refonte de la page avis', bullets: [
      'Deux widgets côté client remplacés par 1 157 avis Google et Trustpilot rendus côté serveur, avec filtres, dates et auteurs anonymisés.',
      "Assemblée en edge par un Worker parce que le CMS approchait de son plafond d'éléments ; critère de classement affiché comme l'exige le droit de la consommation.",
      'Même page livrée en anglais sur sa propre locale.',
    ] },
    { title: 'Accompagnement de la refonte', bullets: [
      "Nouveaux composants header et footer partagés, sélecteur de langue, menu mobile et feuille d'harmonisation sur les neuf pages refaites.",
      "Modale de recherche de ville sur l'accueil : 310 villes, routage location et achat dans les deux langues.",
      'Passes de largeur, hero et FAQ sur le nouvel accueil au fil des retours client.',
    ] },
    { title: 'Hygiène de contenu à grande échelle', bullets: [
      "11 649 images du CMS dotées d'un texte alternatif français via l'API, par lots calibrés sur ce que l'API tolère.",
      '131 doublons CMS cartographiés avec leur graphe de références avant toute décision.',
      'Un audit responsive de 5 774 URL fait par mesure, sans navigateur.',
    ] },
    { title: "Planification d'infrastructure", bullets: [
      "Guide de migration d'une collection CMS et de pages statiques de Webflow vers AWS S3 et CloudFront, derrière le même Cloudflare.",
      "Un guide AWS écrit pour l'équipe, des comptes jusqu'aux coûts.",
    ] },
  ],
  tools: ['Webflow Data API v2', 'Webflow MCP', 'Cloudflare Workers', 'HTMLRewriter', 'Cloudflare rulesets & bulk redirects', 'Cloudflare GraphQL analytics', 'Python', 'Bash & curl', 'JSON-LD / schema.org', 'IndexNow', 'Google Search Console', 'AWS S3 + CloudFront', 'headless Chrome', 'Claude Code'],
  skills: ['SEO technique', 'internationalisation', 'données structurées', 'edge computing', "automatisation d'API à grande échelle", 'nettoyage de données', 'accessibilité', 'publication conforme RGPD', 'audit sans navigateur', 'communication client', 'journal de décisions'],
};

function currentExperience() {
  return typeof I18N !== 'undefined' && I18N.lang === 'fr' ? EXPERIENCE_FR : EXPERIENCE;
}

// URL-safe slug for deep links: 'My printf' -> 'my-printf'
function projectSlug(p) {
  return String(p.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function projectBySlug(slug) {
  return PROJECTS.find((p) => projectSlug(p) === slug) || null;
}

// Shared renderer for the experience block (used by both pages).
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderExperienceHTML(xp, opts) {
  opts = opts || {};
  const T = (k) => (typeof I18N !== 'undefined' ? I18N.t(k) : ({ 'xp.did': 'What I did', 'xp.tools': 'Tools used', 'xp.skills': 'Skills', 'xp.at': 'at' })[k]);
  const tags = (list, cls) => list.map((t) => `<span class="tag${cls ? ' ' + cls : ''}">${escapeHTML(t)}</span>`).join('');
  const cards = xp.sections.map((sec, i) => opts.collapsible
    ? `<details class="xp-card xp-fold"${i === 0 && opts.openFirst ? ' open' : ''}>
        <summary><span class="xp-fold-title">${escapeHTML(sec.title)}</span><span class="xp-peek">${escapeHTML(sec.bullets[0])}</span></summary>
        <ul>${sec.bullets.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}</ul>
      </details>`
    : `<article class="xp-card">
        <h4>${escapeHTML(sec.title)}</h4>
        <ul>${sec.bullets.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}</ul>
      </article>`).join('');
  return `
    <header class="xp-head">
      <div class="xp-role">${escapeHTML(xp.role)} <span class="dim">${T('xp.at')}</span> <a href="${escapeHTML(xp.url)}" target="_blank" rel="noopener">${escapeHTML(xp.company)}</a></div>
      <div class="xp-meta">${escapeHTML(xp.dates)} · ${escapeHTML(xp.langs)}</div>
      <p class="xp-about">${escapeHTML(xp.about)}</p>
    </header>
    <h3 class="xp-h">${T('xp.did')}</h3>
    <div class="xp-grid${opts.collapsible ? ' xp-grid-folds' : ''}">${cards}</div>
    <h3 class="xp-h">${T('xp.tools')}</h3>
    <div class="tags xp-tags">${tags(xp.tools)}</div>
    <h3 class="xp-h">${T('xp.skills')}</h3>
    <div class="tags xp-tags">${tags(xp.skills, 'skill')}</div>`;
}
