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
      'readme.work.v': 'Remoters, web & SEO (since July 2026)',
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
      'preview.copy': 'copy link',
      'browser.newtab': 'open in a real tab',
      'browser.empty': 'no tab open. click a web app on the desktop.',
      'browser.open': 'open in the browser',
      'preview.copied': 'link copied',
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


      // secrets (easter eggs)
      'eggs.title': 'secrets',
      'eggs.intro': 'Nine things are hidden in this desktop. Find them all and something happens.',
      'eggs.stuck': 'Stuck? Each secret has three hints. The third one tells you exactly what to do.',
      'eggs.locked': '???',
      'eggs.hint': 'hint',
      'eggs.more': 'another hint',
      'eggs.answer': 'show me the answer',
      'eggs.confirm': 'sure? click again',
      'eggs.found': 'found',
      'eggs.all': 'you found everything',
      'eggs.unlocked': 'unlocked: snake, a new icon on the desktop',
      'eggs.credits': ['YOU FOUND EVERYTHING', '', 'nine secrets, one visitor with patience', '', 'this desktop was built by', 'Khalil Almwakeh', '', 'with C on the mind,', 'a Linux terminal,', 'and too many late nights', '', 'thank you for looking around', '', 'unlocked: snake', 'a new icon just appeared on the desktop', '', 'press any key to continue'],
      'egg.sudo.name': 'sudo',
      'egg.sudo.h1': 'Every system says no to someone.',
      'egg.sudo.h2': 'In the terminal, ask to do something as the administrator.',
      'egg.sudo.h3': 'Open the terminal (the $ icon on the left), type sudo and press Enter.',
      'egg.rmrf.name': 'rm -rf /',
      'egg.rmrf.h1': 'The most famous command you should never run.',
      'egg.rmrf.h2': 'Ask the terminal to delete everything, by force.',
      'egg.rmrf.h3': 'In the terminal, type rm -rf / and press Enter. Nothing is really deleted.',
      'egg.vim.name': 'escaped vim',
      'egg.vim.h1': 'A trap every beginner falls into. Getting out is the achievement.',
      'egg.vim.h2': 'Open the text editor nobody knows how to quit, then quit it.',
      'egg.vim.h3': 'In the terminal, type vim and press Enter, then type :q and press Enter.',
      'egg.cow.name': 'cowsay',
      'egg.cow.h1': 'A farm animal with opinions.',
      'egg.cow.h2': 'There is a classic command that makes a cow say things.',
      'egg.cow.h3': 'In the terminal, type cowsay hello and press Enter.',
      'egg.matrix.name': 'matrix',
      'egg.matrix.h1': 'Red pill or blue pill?',
      'egg.matrix.h2': 'Ask the terminal to show you the code raining down.',
      'egg.matrix.h3': 'In the terminal, type matrix and press Enter.',
      'egg.sl.name': 'sl',
      'egg.sl.h1': 'A typo with a locomotive.',
      'egg.sl.h2': 'Swap the two letters of the command that lists files.',
      'egg.sl.h3': 'In the terminal, type sl and press Enter.',
      'egg.konami.name': 'konami code',
      'egg.konami.h1': 'The oldest cheat code in gaming.',
      'egg.konami.h2': 'Up, up, down, down… on your keyboard, anywhere on the desktop.',
      'egg.konami.h3': 'Press ↑ ↑ ↓ ↓ ← → ← → B A on the keyboard, or type konami in the terminal.',
      'egg.clock.name': 'the clock',
      'egg.clock.h1': 'Time flies when you tap it.',
      'egg.clock.h2': 'Something in the top bar reacts if you insist.',
      'egg.clock.h3': 'Click the clock in the top-right corner three times quickly.',
      'egg.arch.name': 'the mountain',
      'egg.arch.h1': 'There is a mountain in my readme.',
      'egg.arch.h2': 'The drawing in readme.txt is more than decoration.',
      'egg.arch.h3': 'Open readme.txt and click the logo drawing on the left.',
      'snake.title': 'snake',
      'snake.help': 'arrow keys or WASD, swipe on a phone · space pauses',
      'snake.score': 'score',
      'snake.best': 'best',
      'snake.over': 'game over · press any key or tap to restart',
      'snake.start': 'press a key or tap to start',

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
      'read.g.now.v': 'Web & SEO engineering at <a href="https://www.remoters.io" target="_blank" rel="noopener">Remoters</a>, since July 2026',
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
      'read.contact.p': 'Write to me on <a href="https://www.linkedin.com/in/khalil-almwakeh-1432b436a/" target="_blank" rel="noopener">LinkedIn</a>, or on GitHub: <a href="https://github.com/volcinator8000" target="_blank" rel="noopener">github.com/volcinator8000</a>, where an issue on any repo reaches me.',
      'read.print': 'Print / save as PDF',
      'read.open.desktop': 'Open the desktop version',
      'read.foot': 'Built by hand: HTML, CSS and JavaScript, no framework. <a href="https://github.com/volcinator8000/volcinator8000.github.io" target="_blank" rel="noopener">Source on GitHub</a>.',
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
      'readme.work.v': 'Remoters, web & SEO (depuis juillet 2026)',
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
      'preview.copy': 'copier le lien',
      'browser.newtab': 'ouvrir dans un vrai onglet',
      'browser.empty': "aucun onglet ouvert. cliquez une application web sur le bureau.",
      'browser.open': 'ouvrir dans le navigateur',
      'preview.copied': 'lien copié',
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


      'eggs.title': 'secrets',
      'eggs.intro': 'Neuf choses sont cachées dans ce bureau. Trouvez-les toutes et il se passe quelque chose.',
      'eggs.stuck': "Bloqué ? Chaque secret a trois indices. Le troisième dit exactement quoi faire.",
      'eggs.locked': '???',
      'eggs.hint': 'indice',
      'eggs.more': 'un autre indice',
      'eggs.answer': 'montre-moi la réponse',
      'eggs.confirm': 'sûr ? cliquez encore',
      'eggs.found': 'trouvé',
      'eggs.all': 'vous avez tout trouvé',
      'eggs.unlocked': 'débloqué : snake, une nouvelle icône sur le bureau',
      'eggs.credits': ['VOUS AVEZ TOUT TROUVÉ', '', 'neuf secrets, un visiteur patient', '', 'ce bureau a été construit par', 'Khalil Almwakeh', '', 'avec du C en tête,', 'un terminal Linux,', 'et trop de nuits blanches', '', "merci d'avoir fouillé", '', 'débloqué : snake', 'une nouvelle icône vient d\'apparaître sur le bureau', '', 'appuyez sur une touche pour continuer'],
      'egg.sudo.name': 'sudo',
      'egg.sudo.h1': 'Tout système dit non à quelqu\'un.',
      'egg.sudo.h2': "Dans le terminal, demandez à faire quelque chose en tant qu'administrateur.",
      'egg.sudo.h3': 'Ouvrez le terminal (l\'icône $ à gauche), tapez sudo et appuyez sur Entrée.',
      'egg.rmrf.name': 'rm -rf /',
      'egg.rmrf.h1': 'La commande la plus célèbre à ne jamais lancer.',
      'egg.rmrf.h2': 'Demandez au terminal de tout supprimer, de force.',
      'egg.rmrf.h3': "Dans le terminal, tapez rm -rf / et appuyez sur Entrée. Rien n'est vraiment supprimé.",
      'egg.vim.name': 'sorti de vim',
      'egg.vim.h1': "Un piège pour tous les débutants. En sortir, c'est l'exploit.",
      'egg.vim.h2': "Ouvrez l'éditeur de texte dont personne ne sait sortir, puis sortez-en.",
      'egg.vim.h3': 'Dans le terminal, tapez vim et Entrée, puis tapez :q et Entrée.',
      'egg.cow.name': 'cowsay',
      'egg.cow.h1': 'Un animal de la ferme qui a des choses à dire.',
      'egg.cow.h2': 'Il existe une commande classique qui fait parler une vache.',
      'egg.cow.h3': 'Dans le terminal, tapez cowsay bonjour et appuyez sur Entrée.',
      'egg.matrix.name': 'matrix',
      'egg.matrix.h1': 'Pilule rouge ou pilule bleue ?',
      'egg.matrix.h2': 'Demandez au terminal de vous montrer le code qui pleut.',
      'egg.matrix.h3': 'Dans le terminal, tapez matrix et appuyez sur Entrée.',
      'egg.sl.name': 'sl',
      'egg.sl.h1': 'Une faute de frappe avec une locomotive.',
      'egg.sl.h2': 'Inversez les deux lettres de la commande qui liste les fichiers.',
      'egg.sl.h3': 'Dans le terminal, tapez sl et appuyez sur Entrée.',
      'egg.konami.name': 'code konami',
      'egg.konami.h1': 'Le plus vieux code de triche du jeu vidéo.',
      'egg.konami.h2': 'Haut, haut, bas, bas… au clavier, n\'importe où sur le bureau.',
      'egg.konami.h3': 'Appuyez sur ↑ ↑ ↓ ↓ ← → ← → B A au clavier, ou tapez konami dans le terminal.',
      'egg.clock.name': "l'horloge",
      'egg.clock.h1': 'Le temps passe vite quand on le tapote.',
      'egg.clock.h2': 'Quelque chose dans la barre du haut réagit si vous insistez.',
      'egg.clock.h3': "Cliquez trois fois rapidement sur l'horloge en haut à droite.",
      'egg.arch.name': 'la montagne',
      'egg.arch.h1': 'Il y a une montagne dans mon readme.',
      'egg.arch.h2': "Le dessin dans readme.txt n'est pas qu'une décoration.",
      'egg.arch.h3': 'Ouvrez readme.txt et cliquez sur le dessin du logo à gauche.',
      'snake.title': 'snake',
      'snake.help': 'flèches ou ZQSD, glissez le doigt sur téléphone · espace met en pause',
      'snake.score': 'score',
      'snake.best': 'record',
      'snake.over': 'perdu · une touche ou un tap pour recommencer',
      'snake.start': 'une touche ou un tap pour commencer',

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
      'read.g.now.v': 'Ingénierie web & SEO chez <a href="https://www.remoters.io" target="_blank" rel="noopener">Remoters</a>, depuis juillet 2026',
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
      'read.contact.p': 'Écrivez-moi sur <a href="https://www.linkedin.com/in/khalil-almwakeh-1432b436a/" target="_blank" rel="noopener">LinkedIn</a>, ou sur GitHub : <a href="https://github.com/volcinator8000" target="_blank" rel="noopener">github.com/volcinator8000</a>, où une issue sur n\'importe quel dépôt me parvient.',
      'read.print': 'Imprimer / enregistrer en PDF',
      'read.open.desktop': 'Ouvrir la version bureau',
      'read.foot': 'Fait à la main : HTML, CSS et JavaScript, sans framework. <a href="https://github.com/volcinator8000/volcinator8000.github.io" target="_blank" rel="noopener">Code source sur GitHub</a>.',
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
    if (window.trackEvent) window.trackEvent('lang-' + lang);
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
