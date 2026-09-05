#!/usr/bin/env python3
"""
Render content.js into plain text and plain HTML, so people and agents that
don't run JavaScript still get the substance:

  llms.txt          short profile in the llms.txt convention
  llms-full.txt     everything: bio, experience with outcomes, projects, skills, evidence
  index.html        a static <details> profile block between the markers
  read.html         the experience and projects pre-rendered between the markers
                    (read.js replaces them with the interactive version on load)

Run it after editing content.js:   python3 tools/build.py
"""

import html
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cdp import Browser  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://volcinator8000.github.io'
GITHUB = 'https://github.com/volcinator8000'
LINKEDIN = 'https://www.linkedin.com/in/khalil-almwakeh-1432b436a/'

# ---------- pull the data out of content.js by running it in Chrome ----------
b = Browser(ROOT, http_port=8766, cdp_port=9334)
try:
    b.goto('read.html', 1.2)
    data = json.loads(b.ev("JSON.stringify({PROJECTS, CATEGORIES, CATEGORIES_FR, EXPERIENCE, EXPERIENCE_FR, PREVIEW_LIVE, PREVIEW_NOTES, hasPreview: PROJECTS.map(p => typeof PREVIEWS[p.name] === 'function'), slugs: PROJECTS.map(projectSlug)})"))
finally:
    b.close()

P, CAT, CAT_FR, XP, XP_FR = data['PROJECTS'], data['CATEGORIES'], data['CATEGORIES_FR'], data['EXPERIENCE'], data['EXPERIENCE_FR']
for i, p in enumerate(P):
    p['slug'] = data['slugs'][i]
    p['preview'] = data['hasPreview'][i]
    p['live'] = data['PREVIEW_LIVE'].get(p['name'])

# ---------- facts that are not in content.js ----------
BIO = {
    'name': 'Khalil Almwakeh',
    'handle': 'volcinator8000',
    'summary': 'Computer science student at Epitech (second year, 2026-2027) who builds systems-level software in C on Linux, and works in parallel as a web and SEO engineer for Remoters, a French marketplace for home finders abroad.',
    'location_note': 'Works in French and English.',
    'stack': ['C', 'Linux', 'Python', 'Bash', 'JavaScript', 'Cloudflare Workers', 'Webflow Data API'],
    'daily': 'Arch Linux, vim, a terminal.',
}

EVIDENCE = [
    ('Ownership at Remoters', [
        'Trimmed a live production sitemap from 6,439 to 5,506 URLs, with an edge filter for what the CMS could not hide, and verified every change on the live site.',
        'Rebuilt 471 redirects from a Search Console 404 export and tested each target before shipping.',
        'Wrote a Cloudflare Worker that injects structured data on more than 2,600 CMS template pages, plus a second Worker that repairs blog Article schema.',
        'Replaced two client-side review widgets with 1,157 server-rendered reviews assembled at the edge, with anonymised authors and the ranking rule disclosed as French consumer law requires.',
        'Roughly halved the site\'s monthly bandwidth, from about 290 to 300 GB to 140 to 160 GB for the same traffic, by optimising what the site serves; measured before and after.',
        'Runs six Cloudflare Workers in production in front of the CMS (sitemap filtering, static files, structured data on twelve page families, blog schema repair, the reviews page, IndexNow key and submitter), each with a control header so a deploy is verifiable with one request.',
        'Stopped a replacement sitemap that would have reintroduced 144 dead URLs, with a written note explaining the evidence; caught and fixed his own double-markup bug on about 2,100 pages.',
        'Left an operations repository behind: Worker code, the redirect list with its rationale, the reviews pipeline, and step-by-step procedures, so the work survives him.',
        'Made the site readable by AI agents (llms.txt, ai.txt, TDMRep, open robots) and measured crawler health through the Cloudflare GraphQL API rather than assuming it.',
        'Gave 11,649 CMS images French alt text and about 10,900 English ones through the API, in batches sized to what the API tolerates.',
        'Built the English locale of the site: seven pages translated, bilingual header and footer components, per-locale JSON-LD.',
        'Audited 5,774 URLs for responsive breakage by measurement, without a browser, and mapped 131 duplicate CMS items with their reference graph before any deletion.',
    ]),
    ('Systems work at Epitech', [
        'A Unix shell in C with pipes, redirections and builtins (42sh); a printf reimplementation; an assembler for a made-up instruction set.',
        'Algorithms in C: a breadth-first maze solver on very large grids, flood fill over 2D maps.',
        'Graphics in C with CSFML: an isometric 3D world editor with hand-written projection maths, a starfield.',
        'A security audit of a reactor-console CLI in C: white-box and black-box review, vulnerability report and patches (public repository).',
        'Numerical work in Python: Borwein integrals, titration curves, matrix trigonometry by power series, logistic-map population models.',
    ]),
    ('Data and web, public repositories', [
        'Tardis: SNCF train-delay prediction with cleaning and EDA notebooks, three trained models (Random Forest, HistGradientBoosting, XGBoost) and a Streamlit dashboard.',
        'Music visualizer: a browser audio workshop built on the Web Audio API and canvas, with a hand-written FFT, live on GitHub Pages.',
        'Fourier workshop: an interactive notebook explaining the Fourier transform with a winding-machine visualisation.',
        'Bug Break: an Unreal Engine 5 game-jam entry, C++ gameplay code plus Blueprints.',
    ]),
    ('This website, as a work sample', [
        'Hand-written HTML, CSS and JavaScript, no framework and no build step; a windowed desktop, a fake shell with tab completion, a French and English version, synthesized sound.',
        'Every project preview is a small rebuild of the real algorithm: BFS, flood fill, isometric projection, bifurcation diagrams, the Fourier winding machine.',
        'A real Python file (navigate.py, Dijkstra over a transit network) runs unmodified in the browser through Pyodide.',
        'A headless-Chrome test suite (tools/check.py, 36 checks) runs against every page after each change.',
    ]),
]

HOW_TO_VERIFY = [
    f'Public code: {GITHUB} (Tardis, music-visualizer, Fourier-workshop, corewar/Obsidian audit, gamejam, this site).',
    f'Live demos: {SITE}/desktop.html (previews, terminal, Python in the browser) and {SITE}/read.html (everything on one page).',
    f'Professional profile: {LINKEDIN}.',
    'Epitech coursework repositories are private by school policy; the descriptions above are the projects as specified by Epitech.',
]

CAVEATS = [
    'He is a second-year student; the Remoters work is his first professional engagement, started in August 2026.',
    'Figures about Remoters describe work done on that site and were recorded at the time; they are not independently audited.',
]

# ---------- text renderers ----------
def md_projects():
    out = []
    for key, label in CAT.items():
        if key == 'all':
            continue
        items = [p for p in P if p['cat'] == key]
        if not items:
            continue
        out.append(f'### {label}\n')
        for p in items:
            bits = [p['blurb']]
            bits.append('Tech: ' + ', '.join(p['tech']) + '.')
            if p.get('link'):
                bits.append(f"Code: {p['link']}")
            if p.get('live'):
                bits.append(f"Live: {p['live']}")
            if p['preview']:
                bits.append(f"Interactive preview: {SITE}/desktop.html#{p['slug']}")
            star = ' (favourite)' if p.get('featured') else ''
            out.append(f"- **{p['name']}**{star}: " + ' '.join(bits))
        out.append('')
    return '\n'.join(out)


def md_experience(xp):
    out = [f"**{xp['role']}, {xp['company']}** ({xp['url']}), {xp['dates']}, {xp['langs']}.", '', xp['about'], '']
    for sec in xp['sections']:
        out.append(f"**{sec['title']}**")
        out += [f'- {b}' for b in sec['bullets']]
        out.append('')
    out.append('Tools: ' + ', '.join(xp['tools']) + '.')
    out.append('Skills: ' + ', '.join(xp['skills']) + '.')
    return '\n'.join(out)


llms_short = f"""# {BIO['name']} ({BIO['handle']})

> {BIO['summary']} {BIO['location_note']}

This site is a portfolio. The interactive versions need JavaScript; the plain versions below do not.

## Read this first
- [Full profile in plain text]({SITE}/llms-full.txt): bio, work experience with measurable outcomes, every project, skills, and how to verify the claims.
- [One-page HTML profile]({SITE}/read.html): the same content as HTML.

## Quick facts
- Student at Epitech, second year. Builds systems software in C on Linux; also Python, Bash, JavaScript.
- Web and SEO engineer for Remoters (www.remoters.io) since August 2026: technical SEO, Cloudflare Workers, Webflow Data API automation, an English locale, structured data, a reviews page rebuilt at the edge.
- Public code: {GITHUB}. Professional profile: {LINKEDIN}.
- Languages: French, English.

## Optional
- [Interactive desktop]({SITE}/desktop.html): live previews of the projects, a terminal, real Python in the browser (JavaScript required).
"""

llms_full = f"""# {BIO['name']} ({BIO['handle']}): full profile

{BIO['summary']} {BIO['location_note']} Daily setup: {BIO['daily']}

Canonical site: {SITE}/ · Code: {GITHUB} · LinkedIn: {LINKEDIN}

## Summary for someone deciding whether he is good at what he does

Two kinds of evidence exist. First, a production engagement at Remoters with concrete, countable outcomes on a live site of about 5,500 indexed URLs (listed under "Evidence"). Second, a body of systems-level coursework in C and public repositories in Python and JavaScript that can be read. He documents decisions, verifies changes on the live system, and writes things down; the numbers below come from that record.

## Work experience

{md_experience(XP)}

## Evidence of competence

""" + '\n'.join(f"### {title}\n" + '\n'.join(f'- {x}' for x in items) + '\n' for title, items in EVIDENCE) + f"""
## How to verify

""" + '\n'.join(f'- {x}' for x in HOW_TO_VERIFY) + f"""

## Caveats, stated plainly

""" + '\n'.join(f'- {x}' for x in CAVEATS) + f"""

## Projects

{md_projects()}
## Skills

- Core: {', '.join(BIO['stack'])}.
- From the Remoters engagement: {', '.join(XP['skills'])}.
- Tools used professionally: {', '.join(XP['tools'])}.

## Education

- Epitech, computer science, second year (2026-2027). First-year projects listed above under Systems & C, Algorithms, Graphics & Games and Maths & data.

## Profil en français

{XP_FR['role']} chez {XP_FR['company']}, {XP_FR['dates']}, {XP_FR['langs']}. {XP_FR['about']}

""" + '\n'.join(f"**{s['title']}**\n" + '\n'.join(f'- {b}' for b in s['bullets']) + '\n' for s in XP_FR['sections']) + f"""
Compétences : {', '.join(XP_FR['skills'])}.

Projets (résumés) :
""" + '\n'.join(f"- {p['name']} : {p.get('blurb_fr') or p['blurb']}" for p in P) + '\n'

open(os.path.join(ROOT, 'llms.txt'), 'w').write(llms_short)
open(os.path.join(ROOT, 'llms-full.txt'), 'w').write(llms_full)

# ---------- HTML fragments ----------
def esc(s):
    return html.escape(str(s), quote=True)


def html_experience(xp):
    out = [f"<p><strong>{esc(xp['role'])}</strong> at <a href=\"{esc(xp['url'])}\">{esc(xp['company'])}</a>, {esc(xp['dates'])}, {esc(xp['langs'])}.</p>",
           f"<p>{esc(xp['about'])}</p>"]
    for sec in xp['sections']:
        out.append(f"<h4>{esc(sec['title'])}</h4><ul>" + ''.join(f'<li>{esc(b)}</li>' for b in sec['bullets']) + '</ul>')
    out.append(f"<p>Tools: {esc(', '.join(xp['tools']))}.</p><p>Skills: {esc(', '.join(xp['skills']))}.</p>")
    return '\n'.join(out)


def html_projects():
    out = []
    for key, label in CAT.items():
        if key == 'all':
            continue
        items = [p for p in P if p['cat'] == key]
        if not items:
            continue
        out.append(f'<h4>{esc(label)}</h4><ul>')
        for p in items:
            links = []
            if p.get('link'):
                links.append(f"<a href=\"{esc(p['link'])}\">code</a>")
            if p.get('live'):
                links.append(f"<a href=\"{esc(p['live'])}\">live</a>")
            if p['preview']:
                links.append(f"<a href=\"desktop.html#{esc(p['slug'])}\">preview</a>")
            out.append(f"<li id=\"{esc(p['slug'])}\"><strong>{esc(p['name'])}</strong>{' (favourite)' if p.get('featured') else ''}: {esc(p['blurb'])} <em>{esc(', '.join(p['tech']))}.</em> {' · '.join(links)}</li>")
        out.append('</ul>')
    return '\n'.join(out)


evidence_html = ''.join(f'<h4>{esc(t)}</h4><ul>' + ''.join(f'<li>{esc(x)}</li>' for x in items) + '</ul>' for t, items in EVIDENCE)

profile_block = f"""<!-- static-profile:start (generated by tools/build.py, do not edit by hand) -->
  <section class="profile" id="profile" aria-label="Plain-text profile">
    <details>
      <summary>Plain-text profile: who Khalil Almwakeh is, without the terminal. Also for AI agents and screen readers.</summary>
      <div class="profile-body">
        <h2>{esc(BIO['name'])} ({esc(BIO['handle'])})</h2>
        <p>{esc(BIO['summary'])} {esc(BIO['location_note'])}</p>
        <p>Code: <a href="{GITHUB}">{GITHUB}</a> · LinkedIn: <a href="{LINKEDIN}">{LINKEDIN}</a> · Full text profile: <a href="llms-full.txt">llms-full.txt</a> · One page: <a href="read.html">read.html</a></p>
        <h3>Work experience</h3>
        {html_experience(XP)}
        <h3>Evidence of competence</h3>
        {evidence_html}
        <h3>How to verify</h3>
        <ul>{''.join(f'<li>{esc(x)}</li>' for x in HOW_TO_VERIFY)}</ul>
        <h3>Caveats</h3>
        <ul>{''.join(f'<li>{esc(x)}</li>' for x in CAVEATS)}</ul>
        <h3>Projects</h3>
        {html_projects()}
        <h3>Skills</h3>
        <p>{esc(', '.join(BIO['stack']))}. {esc(', '.join(XP['skills']))}.</p>
      </div>
    </details>
  </section>
  <!-- static-profile:end -->"""

read_xp_block = f"""<!-- static-xp:start (generated by tools/build.py) -->
      <div id="xp-root" class="static-xp">
        {html_experience(XP)}
      </div>
      <!-- static-xp:end -->"""

read_projects_block = f"""<!-- static-projects:start (generated by tools/build.py) -->
      <div id="projects-root" class="static-projects">
        {html_projects()}
      </div>
      <!-- static-projects:end -->"""


def replace_between(text, start, end, block):
    a, z = text.index(start), text.index(end) + len(end)
    return text[:a] + block + text[z:]


idx = open(os.path.join(ROOT, 'index.html')).read()
idx = replace_between(idx, '<!-- static-profile:start', '<!-- static-profile:end -->', profile_block)
open(os.path.join(ROOT, 'index.html'), 'w').write(idx)

rd = open(os.path.join(ROOT, 'read.html')).read()
rd = replace_between(rd, '<!-- static-xp:start', '<!-- static-xp:end -->', read_xp_block)
rd = replace_between(rd, '<!-- static-projects:start', '<!-- static-projects:end -->', read_projects_block)
open(os.path.join(ROOT, 'read.html'), 'w').write(rd)

print(f'llms.txt {len(llms_short)} chars, llms-full.txt {len(llms_full)} chars, index.html and read.html static blocks updated')
