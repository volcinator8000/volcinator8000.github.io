# khalil-almwakeh.github.io

My portfolio. Plain HTML, CSS and JavaScript, no build step, hosted on GitHub Pages.

Live: https://khalil-almwakeh.github.io

## The four pages

| File | What it is |
|---|---|
| `index.html` | The landing: a CRT terminal that boots, types a login, then offers two ways in. |
| `desktop.html` | The "full experience": a small Linux-style desktop with draggable windows, a fake shell, live project previews and a real Python file running through Pyodide. |
| `read.html` | The "quick read": everything on one page, with the same previews running inline as you scroll. Prints cleanly. |
| `404.html` | Served by GitHub Pages for unknown URLs, same terminal style. |

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

Every page was verified with headless Chrome driven over the DevTools protocol (`google-chrome-stable --headless=new --remote-debugging-port=…`). The checks that matter after an edit:

- the landing types, the menu appears, keyboard selection and Enter work;
- the desktop boots, windows open and close, the terminal answers, previews run and stop;
- the quick read renders in both languages with no horizontal overflow at 390 px;
- the console shows no exceptions.
