/* ============================================================
   Two languages, one file. UI strings live here; project blurbs and
   the experience block carry their French in content.js.
   - I18N.lang        current language ('en' | 'fr')
   - I18N.t(key)      string (or array) for the current language
   - I18N.set(lang)   switch, remember, re-apply, fire 'langchange'
   - I18N.apply()     fill every [data-i18n] / [data-i18n-html] /
                      [data-i18n-attr="attr:key,attr:key"] element
   Default: remembered choice, else the browser language.
   ============================================================ */

'use strict';

const I18N = (function () {
  const DICT = {
    en: {
      // landing
      'landing.lines': ['KHALIL ALMWAKEH (TM) PERSONAL TERMINAL', 'COPYRIGHT 2026 VOLCINATOR8000. ALL RIGHTS RESERVED.', '-EPITECH, YEAR 2-  -C / LINUX / PYTHON / BASH-', '', '> LOGIN: visitor', '> PASSWORD: ', '> AUTHENTICATING ', '> ACCESS GRANTED. WELCOME, VISITOR.', '', '> TWO WAYS TO LOOK AROUND. PICK ONE:'],
      'landing.c1.label': '[1] FULL EXPERIENCE',
      'landing.c1.desc': 'Boot a small Linux desktop. Windows to drag, a terminal to type in, project demos that actually run.',
      'landing.c1.meta': 'A couple of minutes. Works on a phone too.',
      'landing.c2.label': '[2] QUICK READ',
      'landing.c2.desc': 'Everything on one page. Scroll, done. No windows, no boot screen, nothing to click except links.',
      'landing.c2.meta': 'One minute. Prints fine.',
      'landing.hint': '↑↓ or 1 / 2 to select · Enter to confirm',
      'landing.sound.on': 'SOUND: ON',
      'landing.sound.off': 'SOUND: OFF',
      'lang.other': 'FR',
      'lang.other.title': 'Version française',

      // desktop
      'bar.hint': 'click an icon to open it',
      'bar.read': 'quick read',
      'bar.sound.on': 'sound: on',
      'bar.sound.off': 'sound: off',
      'readme.name': 'Name',
      'readme.role': 'Role',
      'readme.role.v': 'Epitech student, 2nd year',
      'readme.work': 'Work',
      'readme.work.v': 'Remoters, web & SEO engineering (2026)',
      'readme.stack': 'Stack',
      'readme.doing': 'Doing',
      'readme.doing.v': 'building systems and simulations',
      'readme.intro': "Hi, I'm Khalil. I spend most of my time in C and a Linux terminal, building things that simulate other things.",
      'readme.tip': 'Try: <button type="button" class="link-btn" data-open="projects-window">open projects/</button>, <button type="button" class="link-btn" data-open="python-window">run navigate.py</button> or <button type="button" class="link-btn" data-open="terminal-window">type <code>help</code> in the terminal</button>.',
      'projects.items': 'items',
      'projects.item': 'item',
      'card.preview': 'preview',
      'card.run': 'run',
      'preview.none': 'no preview yet',
      'preview.none.link': 'the code is on GitHub, link above',
      'preview.none.private': 'this one lives in a private Epitech repo',
      'preview.crashed': 'preview crashed',
      'preview.github': 'github ↗',
      'preview.live': 'live site ↗',
      'py.from': 'from',
      'py.to': 'to',
      'py.run': 'find route',
      'py.source': 'view source',
      'py.status.idle': 'python runtime not loaded yet',
      'py.status.loading': 'loading Python runtime, about 10 MB, first time only…',
      'py.status.ready': 'ready',
      'py.status.failed': 'failed: ',
      'py.note': 'A real Python file, <code>navigate.py</code>, running in your browser through Pyodide. It does the Dijkstra search; the page only draws the result.',
      'xp.did': 'What I did',
      'xp.tools': 'Tools used',
      'xp.skills': 'Skills',
      'xp.at': 'at',

      // quick read
      'read.title': 'Khalil Almwakeh — quick read',
      'read.start': '← start',
      'read.full': 'full experience →',
      'read.nav.about': 'About',
      'read.nav.xp': 'Experience',
      'read.nav.projects': 'Projects',
      'read.nav.contact': 'Contact',
      'read.sub': 'Systems-minded student who likes C, Linux and things that simulate other things.',
      'read.g.school': 'School',
      'read.g.school.v': 'Epitech, 2nd year',
      'read.g.stack': 'Stack',
      'read.g.now': 'Currently',
      'read.g.now.v': 'Web & SEO engineering at <a href="https://www.remoters.io" target="_blank" rel="noopener">Remoters</a>',
      'read.g.langs': 'Languages',
      'read.g.langs.v': 'French, English',
      'read.g.code': 'Code',
      'read.g.os': 'Daily driver',
      'read.g.os.v': 'Arch Linux, vim',
      'read.about.h': 'About',
      'read.about.p1': "Hi, I'm Khalil. I spend most of my time in C and a Linux terminal, building things that simulate other things: shells, maze solvers, isometric worlds, population models. In my second year at Epitech, and doing web and SEO engineering for Remoters on the side.",
      'read.about.p2': 'Prefer to poke at things? The <a href="desktop.html">full experience</a> is a little desktop with a terminal and running previews of most projects, including a real Python file that runs in the browser.',
      'read.xp.h': 'Experience',
      'read.xp.hint': 'Open a card to see the details.',
      'read.projects.h': 'Projects',
      'read.projects.p': 'Four favourites first, running right here. The rest is folded by theme: open a theme to see its projects and their previews.',
      'read.favs': 'Favourites',
      'read.more': 'More projects',
      'read.run': 'run it in the browser ↗',
      'read.contact.h': 'Contact',
      'read.contact.p': 'The quickest way to reach me is GitHub: <a href="https://github.com/volcinator8000" target="_blank" rel="noopener">github.com/volcinator8000</a>. Open an issue on any repo and I will see it.',
      'read.print': 'Print / save as PDF',
      'read.open.desktop': 'Open the desktop version',
      'read.foot': 'Built by hand: HTML, CSS and JavaScript, no framework. <a href="https://github.com/volcinator8000/khalil-almwakeh.github.io" target="_blank" rel="noopener">Source on GitHub</a>.',
    },

    fr: {
      'landing.lines': ['KHALIL ALMWAKEH (TM) TERMINAL PERSONNEL', 'COPYRIGHT 2026 VOLCINATOR8000. TOUS DROITS RÉSERVÉS.', '-EPITECH, 2E ANNÉE-  -C / LINUX / PYTHON / BASH-', '', '> LOGIN: visiteur', '> MOT DE PASSE: ', '> AUTHENTIFICATION ', '> ACCÈS AUTORISÉ. BIENVENUE, VISITEUR.', '', '> DEUX FAÇONS DE VISITER. CHOISISSEZ :'],
      'landing.c1.label': '[1] EXPÉRIENCE COMPLÈTE',
      'landing.c1.desc': 'Démarrez un petit bureau Linux. Des fenêtres à déplacer, un terminal où taper, des démos de projets qui tournent vraiment.',
      'landing.c1.meta': 'Quelques minutes. Marche aussi sur téléphone.',
      'landing.c2.label': '[2] LECTURE RAPIDE',
      'landing.c2.desc': "Tout sur une page. On fait défiler, c'est fini. Pas de fenêtres, pas d'écran de démarrage, rien à cliquer sauf des liens.",
      'landing.c2.meta': "Une minute. S'imprime bien.",
      'landing.hint': '↑↓ ou 1 / 2 pour choisir · Entrée pour valider',
      'landing.sound.on': 'SON : ON',
      'landing.sound.off': 'SON : OFF',
      'lang.other': 'EN',
      'lang.other.title': 'English version',

      'bar.hint': "cliquez sur une icône pour l'ouvrir",
      'bar.read': 'lecture rapide',
      'bar.sound.on': 'son : on',
      'bar.sound.off': 'son : off',
      'readme.name': 'Nom',
      'readme.role': 'Rôle',
      'readme.role.v': 'Étudiant Epitech, 2e année',
      'readme.work': 'Travail',
      'readme.work.v': 'Remoters, ingénierie web & SEO (2026)',
      'readme.stack': 'Stack',
      'readme.doing': 'En cours',
      'readme.doing.v': 'systèmes et simulations',
      'readme.intro': "Salut, moi c'est Khalil. Je passe le plus clair de mon temps en C et dans un terminal Linux, à construire des choses qui en simulent d'autres.",
      'readme.tip': 'Essayez : <button type="button" class="link-btn" data-open="projects-window">ouvrir projects/</button>, <button type="button" class="link-btn" data-open="python-window">lancer navigate.py</button> ou <button type="button" class="link-btn" data-open="terminal-window">taper <code>help</code> dans le terminal</button>.',
      'projects.items': 'projets',
      'projects.item': 'projet',
      'card.preview': 'aperçu',
      'card.run': 'lancer',
      'preview.none': "pas encore d'aperçu",
      'preview.none.link': 'le code est sur GitHub, lien ci-dessus',
      'preview.none.private': 'celui-ci vit dans un dépôt Epitech privé',
      'preview.crashed': 'aperçu planté',
      'preview.github': 'github ↗',
      'preview.live': 'site en ligne ↗',
      'py.from': 'de',
      'py.to': 'à',
      'py.run': "trouver l'itinéraire",
      'py.source': 'voir le code',
      'py.status.idle': 'runtime Python pas encore chargé',
      'py.status.loading': 'chargement du runtime Python, environ 10 Mo, une seule fois…',
      'py.status.ready': 'prêt',
      'py.status.failed': 'échec : ',
      'py.note': "Un vrai fichier Python, <code>navigate.py</code>, qui tourne dans votre navigateur via Pyodide. C'est lui qui fait la recherche de Dijkstra ; la page ne fait que dessiner le résultat.",
      'xp.did': "Ce que j'ai fait",
      'xp.tools': 'Outils utilisés',
      'xp.skills': 'Compétences',
      'xp.at': 'chez',

      'read.title': 'Khalil Almwakeh — lecture rapide',
      'read.start': '← accueil',
      'read.full': 'expérience complète →',
      'read.nav.about': 'À propos',
      'read.nav.xp': 'Expérience',
      'read.nav.projects': 'Projets',
      'read.nav.contact': 'Contact',
      'read.sub': "Étudiant orienté systèmes, qui aime le C, Linux et les programmes qui en simulent d'autres.",
      'read.g.school': 'École',
      'read.g.school.v': 'Epitech, 2e année',
      'read.g.stack': 'Stack',
      'read.g.now': 'En ce moment',
      'read.g.now.v': 'Ingénierie web & SEO chez <a href="https://www.remoters.io" target="_blank" rel="noopener">Remoters</a>',
      'read.g.langs': 'Langues',
      'read.g.langs.v': 'français, anglais',
      'read.g.code': 'Code',
      'read.g.os': 'Au quotidien',
      'read.g.os.v': 'Arch Linux, vim',
      'read.about.h': 'À propos',
      'read.about.p1': "Salut, moi c'est Khalil. Je passe le plus clair de mon temps en C et dans un terminal Linux, à construire des choses qui en simulent d'autres : des shells, des résolveurs de labyrinthe, des mondes isométriques, des modèles de population. En deuxième année à Epitech, et en parallèle de l'ingénierie web et SEO pour Remoters.",
      'read.about.p2': "Vous préférez toucher aux choses ? L'<a href=\"desktop.html\">expérience complète</a> est un petit bureau avec un terminal et des aperçus qui tournent pour la plupart des projets, dont un vrai fichier Python exécuté dans le navigateur.",
      'read.xp.h': 'Expérience',
      'read.xp.hint': 'Ouvrez une carte pour voir le détail.',
      'read.projects.h': 'Projets',
      'read.projects.p': "Quatre favoris d'abord, qui tournent ici même. Le reste est replié par thème : ouvrez un thème pour voir ses projets et leurs aperçus.",
      'read.favs': 'Favoris',
      'read.more': 'Autres projets',
      'read.run': 'lancer dans le navigateur ↗',
      'read.contact.h': 'Contact',
      'read.contact.p': 'Le plus simple pour me joindre, c\'est GitHub : <a href="https://github.com/volcinator8000" target="_blank" rel="noopener">github.com/volcinator8000</a>. Ouvrez une issue sur n\'importe quel dépôt et je la verrai.',
      'read.print': 'Imprimer / enregistrer en PDF',
      'read.open.desktop': 'Ouvrir la version bureau',
      'read.foot': 'Fait à la main : HTML, CSS et JavaScript, sans framework. <a href="https://github.com/volcinator8000/khalil-almwakeh.github.io" target="_blank" rel="noopener">Code source sur GitHub</a>.',
    },
  };

  let lang = 'en';
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'fr' || saved === 'en') lang = saved;
    else if ((navigator.language || '').toLowerCase().startsWith('fr')) lang = 'fr';
  } catch (e) { /* ignore */ }

  function t(key) {
    const d = DICT[lang] || DICT.en;
    return key in d ? d[key] : (key in DICT.en ? DICT.en[key] : key);
  }

  function apply(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':');
        el.setAttribute(attr.trim(), t(key.trim()));
      });
    });
    document.documentElement.lang = lang;
    if (t('read.title') && document.body.classList.contains('read')) document.title = t('read.title');
  }

  function set(l) {
    lang = l === 'fr' ? 'fr' : 'en';
    try { localStorage.setItem('lang', lang); } catch (e) { /* ignore */ }
    apply();
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  // pick a localized field from a content object: obj.blurb_fr when in French, else obj.blurb
  function field(obj, name) {
    if (!obj) return '';
    if (lang === 'fr' && obj[name + '_fr']) return obj[name + '_fr'];
    return obj[name];
  }

  return {
    get lang() { return lang; },
    t, apply, set, field,
    toggle() { set(lang === 'fr' ? 'en' : 'fr'); },
  };
})();
