# volcinator8000.github.io

My portfolio. Plain HTML, CSS and JavaScript, no build step, hosted on GitHub Pages.

Live: https://volcinator8000.github.io

## The four pages

| File | What it is |
|---|---|
| `index.html` | The landing: a CRT terminal that boots, types a login, then offers two ways in. |
| `desktop.html` | The "full experience": a small Linux-style desktop with draggable windows, a fake shell, live project previews and a real Python file running through Pyodide. |
| `read.html` | The "quick read": everything on one page, with the same previews running inline as you scroll. Prints cleanly. |
| `404.html` | Served by GitHub Pages for unknown URLs, same terminal style. |
| `tools/check.py` | Headless-Chrome smoke test of all of the above. |

## Where the content lives

Everything a visitor reads is in **one file, `content.js`**:

- `PROJECTS`: one object per project. `name`, `ext` (the little file-type badge), `cat` (category key), `tech` tags, `blurb` and `blurb_fr`, optional `link` and `featured`.
- `CATEGORIES` / `CATEGORIES_FR`: the filter chips and the quick-read themes.
- `EXPERIENCE` / `EXPERIENCE_FR`: the work-experience block, rendered by `renderExperienceHTML`.

UI strings for both languages are in `i18n.js`. Preview notes are in `previews.js` next to the previews themselves.

To add a project: add an entry to `PROJECTS`, and optionally a preview in `previews.js` under the same `name`.

## The other files

| File | Role |
|---|---|
| `script.js` | The desktop: boot, window manager, taskbar, terminal, previews window, Pyodide runner, easter eggs. |
| `previews.js` | One small self-contained preview per project: canvas rebuilds, live tools, embedded sites. Each is `name -> (stage) => cleanup`. |
| `navigate.py` | Real Python. Dijkstra over a small transit network; the desktop loads Pyodide on demand and runs this file unmodified. |
| `sound.js` | Synthesized sound effects (no audio files) shared by the landing and the desktop. |
| `i18n.js` | FR / EN strings, language toggle, browser-language default. |
| `read.js`, `read.css` | The quick-read page. |
| `landing.css` | The CRT look. |
| `style.css` | The desktop and everything it shares with the quick read. |

## Working on it locally

Serve the folder over HTTP (Pyodide and the fetch of `navigate.py` don't work from `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

There is no build step and no dependency to install. External resources: two Google Fonts (JetBrains Mono, VT323) and the Pyodide runtime from jsDelivr, loaded only when the Python window opens.

## Checking a change

`tools/check.py` smoke-tests every page in headless Chrome. It needs only Python 3 and a Chrome or Chromium binary on the PATH, no packages:

```bash
python3 tools/check.py           # PASS / FAIL per check, exit code 1 on failure
python3 tools/check.py --shots   # also saves screenshots to tools/shots/
```

It serves the folder on port 8765, drives Chrome over the DevTools protocol and checks that:

- the landing types its intro, hides the menu until it's done, and answers the keyboard;
- the desktop boots, windows open, minimise, maximise and close, the terminal answers, previews run, the language switch works;
- the quick read renders the experience folds and starts previews as they scroll into view;
- nothing overflows horizontally at 390 px on any page;
- `robots.txt`, `sitemap.xml`, `og.png`, `404.html` and `navigate.py` are served;
- the console shows no exceptions.

## Analytics (off by default)

`analytics.js` can count page views with GoatCounter, a free, open-source, cookie-less counter that needs no consent banner. It loads nothing until you create an account at goatcounter.com and put your code in the `GOATCOUNTER` constant at the top of the file. Do Not Track and Global Privacy Control are respected, hashes and query strings are never sent, and two events are counted: which door was chosen on the landing and language switches.

## SEO bits

Every page carries a canonical link, Open Graph and Twitter tags pointing at `og.png`, and a JSON-LD `Person` block (name, GitHub, LinkedIn, school, employer). `sitemap.xml` lists the three pages and `robots.txt` points to it. The `<html lang>` attribute follows the language toggle.
