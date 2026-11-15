# Product Guide Format

Every product guide on this site follows this format, so the guides look and work the same way. The reference guide is [`fridge_guide/`](fridge_guide/index.html). When this document doesn't cover something, copy what the fridge guide does.

---

## 1. Site layout

```
/index.html               ← master homepage (lists every guide from guides.json)
├── guides.json           ← list of guides, read by the homepage
├── .nojekyll             ← serve files as-is on GitHub Pages
├── GUIDE_FORMAT.md       ← this file
├── shared/
│   ├── guide.css         ← shared look: tokens, layout, components
│   └── guide.js          ← shared behaviour: tabs, search, theme, components
└── <product>_guide/      ← one folder per product
    ├── index.html        ← the guide page (static content)
    ├── data.js           ← content data + component setup (calls Guide.init)
    └── *.css / *.js      ← optional product-only widgets (e.g. panel.js)
```

**Rules**

- Folder name: lowercase `snake_case` ending in `_guide`, e.g. `washer_guide`, `ac_guide`, `tv_living_room_guide`.
- One guide = one `index.html`. Don't split a guide into several pages. Use tabs instead.
- Link shared files with relative paths (`../shared/guide.css`). Never use absolute `/shared/...` paths: they break when the site is served from `username.github.io/repo/`.
- Never edit `shared/` for one product. Product-only styles and widgets go in the guide's own folder. Only change `shared/` to improve **all** guides, then check every guide.
- No build step and no frameworks. Use plain HTML, CSS and JS. Don't load anything from a CDN.
- Don't copy illustrations or photos from the manual. Draw simple SVGs yourself, or use none.

---

## 2. Registering a guide

The homepage (`/index.html`) builds its list of guides from `guides.json`, sorted by title and filterable by title, product, manual code and `keywords`. You don't need to edit `index.html` for a new guide, only add an entry to `guides.json`:

```json
{
  "id": "fridge",
  "folder": "fridge_guide/",
  "title": "Fridge Guide",
  "product": "Top-freezer refrigerator (RT**D* family)",
  "icon": "❄",
  "manual": "DA68-03374J-05",
  "updated": "2026-11-15",
  "keywords": "refrigerator freezer"
}
```

`keywords` is optional. `folder` must end with `/`. Also update the static fallback list in `index.html`, which shows if `guides.json` can't be loaded (for example when the page is opened straight from disk).

Put the same details in the guide's `<head>` (see the skeleton) so each page also describes itself.

---

## 3. Page skeleton

Start every new guide from this skeleton. Keep the header, tabs, footer and script order exactly as shown.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Washer Guide</title>                         <!-- "<Product> Guide", 2–3 words -->
<meta name="description" content="One sentence about what the guide covers.">
<meta name="guide:title" content="Washer Guide">
<meta name="guide:product" content="Front-load washing machine (WW90T*)">
<meta name="guide:icon" content="🧺">
<meta name="guide:manual" content="MANUAL-CODE">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧺</text></svg>">
<link rel="stylesheet" href="../shared/guide.css">
</head>
<body>
<header class="top">
  <div class="top-inner">
    <a class="back" href="../" title="All guides" aria-label="All guides">←</a>
    <div class="brand"><div class="brand-icon" aria-hidden="true">🧺</div><span class="brand-text">Washer Guide</span></div>
    <div class="search">
      <label class="search-box"><span aria-hidden="true">🔍</span>
        <input id="searchInput" type="search" placeholder="Search: …" aria-label="Search this guide" autocomplete="off" aria-controls="searchResults" aria-expanded="false">
      </label>
      <ul class="search-results" id="searchResults" role="listbox"></ul>
    </div>
    <button class="icon-btn" id="themeBtn" type="button" title="Light / dark" aria-label="Toggle light or dark theme">◐</button>
  </div>
  <nav class="tabs" role="tablist" aria-label="Guide sections">
    <button role="tab" type="button" data-view="home" aria-selected="true"><span class="ti" aria-hidden="true">🏠</span>Home</button>
    <!-- …more tabs, see section 4… -->
  </nav>
</header>

<main>
  <section class="view active" id="home" role="tabpanel"> … </section>
  <section class="view" id="controls" role="tabpanel"> … </section>
  …
</main>

<footer class="foot">
  Unofficial easy guide based on owner’s manual MANUAL-CODE. Features vary by model.
  Always follow the safety warnings in your printed manual.
  <br><a href="../">← All guides</a>
</footer>

<script src="../shared/guide.js"></script>
<script src="data.js"></script>          <!-- calls Guide.init({ id: 'washer' }) first -->
<!-- optional product widgets after data.js -->
</body>
</html>
```

---

## 4. Tabs (sections)

Use **4 to 6 tabs**, in this order. Use these exact names and icons when a tab applies. Leave out tabs that don't apply, but don't reorder them.

| # | Tab id     | Label    | Icon | What goes in it |
|---|------------|----------|------|-----------------|
| 1 | `home`     | Home     | 🏠 | Hero, key facts, common-task cards, parts map |
| 2 | `controls` | Controls | 🎛️ | How to operate it: panel/buttons, modes, app (use **Use** as the label if the product has no panel) |
| 3 | `fix`      | Fix it   | 🛠️ | Troubleshooter, “is this normal?”, power cut, error codes |
| 4 | `setup`    | Setup    | 📦 | Installation checklist, space and room requirements |
| 5 | `care`     | Care     | 🧽 | Removing parts, cleaning, replacing parts, saving energy |
| 6 | `safety`   | Safety   | 🛡️ | Grouped safety essentials, disposal, warranty & service |

- The tab `id` is used in links (`#fix`, `#care/cleaning`), so don't rename it.
- On phones the tabs become a bottom bar automatically. Keep labels to **one short word** so all of them fit.
- Product-specific extras go inside the closest tab, not in a new tab. For example, the ice maker goes in Controls.

### Home tab must contain

1. **Hero** (`.hero` › `.hero-main`): a chip naming the product type, the heading “What do you need help with?”, one sentence, and one primary button to the most useful interactive part.
2. **Facts** (`.facts` › `.card.fact`): 2 or 3 numbers people look up (defaults, capacity) and a wide helpline card.
3. **Common tasks** (`.grid.cols-3` › `button.card.task`): exactly **6** cards. Each card has an icon, a title phrased as a task (“Change the temperature”, not “Temperature”), and a one-line hint. Each card uses `data-go` (and optionally `data-anchor`) to open where the answer is.
4. **Parts map** (optional but recommended): an SVG with numbered hotspots. See section 6.

---

## 5. Writing style

The guide is a rewrite of the manual, not a copy.

- **Plain words, short sentences.** Aim for words a 12-year-old knows. “Unplug the fridge”, not “Disconnect the appliance from the mains supply”.
- **Talk to the reader**, using “you”, and use imperative verbs for actions (“Hold Fridge for 3 seconds”).
- **One action per step.** Number steps with `<ol class="steps-list">` when order matters. Use bullets when it doesn't.
- **Button and label names in bold**, exactly as printed on the product: `<b>Freezer Convert</b>`.
- **Units:** put a space before units (`3 °C`, `50 mm`, `90 kg`) and use real minus signs in temperatures (`-19 °C`). Durations are written “3 seconds” in sentences and “3 s” in chips.
- **Headings are tasks or questions:** “Remove a shelf”, “Is this noise normal?”.
- **Keep every fact from the manual accurate.** If the manual says “applicable models only”, mark it with `*` or the words “some models only”. Don't invent features, numbers or advice that isn't in the manual.
- **Say “normal” clearly** when something isn't a fault. This saves people from paying for a service visit.
- **Keep each piece of information in one place.** Link to it from elsewhere with `data-go` instead of copying it.

### Manual notices → callouts

Map the manual's notice labels to callouts. Each callout has an icon span and a text span, with an optional `<strong>` heading:

| Manual label | Class | Icon | Use for |
|---|---|---|---|
| WARNING | `.callout.warning` | ⛔ | Risk of serious injury, fire, shock, death |
| CAUTION | `.callout.caution` | ⚠ | Risk of minor injury or damage |
| NOTE | `.callout.note` | ℹ | Useful information |
| (tip) | `.callout.tip` | ✓ | Optional good practice |

```html
<div class="callout warning"><span aria-hidden="true">⛔</span><span><strong>Before you switch</strong>Take out frozen food.</span></div>
```

Put a callout **right next to the step it applies to**, not in a pile at the end.

---

## 6. Components

All components are in `shared/`. Use these instead of making new ones.

### Static (HTML + CSS only)

| Component | Markup |
|---|---|
| Card | `<div class="card">…</div>` |
| Grid | `<div class="grid cols-2">` (wide cards) or `cols-3` (small cards) |
| Chip / label | `<span class="chip">` or `<span class="chip accent">`. Put “how to trigger” on feature cards, e.g. `Hold Fridge 3 s` |
| Numbered steps | `<ol class="steps-list"><li>…</li></ol>` |
| Do / don't | `<ul class="do">` (green ✓) and `<ul class="dont">` (red ✕) |
| Accordion | `<details class="acc"><summary>🔊 Title</summary><div class="acc-body">…</div></details>` |
| Table | Wrap it: `<div class="table-wrap"><table>…</table></div>`. Use `class="num"` on number cells |
| Select field | `<label class="field">Label<select>…</select></label>` |
| Button | `<a class="btn">` or `<button class="btn">`, plus `.ghost` for secondary |
| Icon tones | `.tone-blue`, `.tone-sky`, `.tone-red`, `.tone-amber`, `.tone-green` on `.task .ico` |

### Navigation links

Any element with `data-go="<tab>"` (and optionally `data-anchor="<element id>"`) opens that tab and scrolls to and highlights the element. Inside text, also set `href` so it works as a normal link:

```html
<a href="#controls/convert" data-go="controls" data-anchor="convert">Freezer Convert →</a>
```

URLs work as deep links: `fridge_guide/#care/cleaning`.

### Search

Search is automatic. Add `data-topic` to every card, heading or accordion people might look for. Add `data-keywords` with the words people would actually type (synonyms, everyday words):

```html
<div class="card" id="vacation" data-topic="Vacation mode" data-keywords="holiday trip away travel">
```

The troubleshooter adds its symptoms to search on its own. Aim for every user task to be findable by at least one obvious word.

### Interactive (call from `data.js`)

```js
Guide.init({ id: 'washer' });               // always first; id = storage namespace
```

**Parts map**: an SVG with an empty `<g id="hots">`, plus `#partsList`, `#partTitle` and `#partDesc` (copy the markup from the fridge Home tab):

```js
Guide.partsMap([
  { n: 1, name: 'Detergent drawer', x: 40, y: 30, desc: 'Pull out to fill.', go: 'care', anchor: 'care-drawer' },
], { svgGroup: $('#hots'), list: $('#partsList'), title: $('#partTitle'), desc: $('#partDesc') });
```

The `x`/`y` values are positions in the SVG's `viewBox`. `go`/`anchor` add a “How-to →” link.

**Troubleshooter** goes at the top of the Fix it tab: `<div id="ts"></div>`. Order symptoms by how common they are, and order the checks in each symptom from easiest to hardest. `fix` may contain simple HTML (`<b>`, links).

```js
Guide.troubleshooter($('#ts'), [
  { id: 'warm', icon: '🌡️', title: 'Not cold enough', summary: 'Warm, or not running',
    keywords: 'warm not cooling', checks: [
      { cause: 'Power cord isn’t plugged in properly', fix: 'Push the plug firmly into the socket.' } ] },
], { escalate: '<strong>Still a problem?</strong>Call the helpline: <a href="tel:…">…</a>' });
```

**Checklist**: Setup tab, `<div class="card"><div id="setupChecklist"></div></div>`. Step titles are short actions. The `html` can use any static component.

```js
const cl = Guide.checklist($('#setupChecklist'), [
  { title: 'Pick a good spot', html: '<ul class="do"><li>Level floor</li></ul>' },
]);
cl.onRender(() => { /* re-wire anything inside the steps; runs after each re-render */ });
```

**Storage**: `Guide.store.get(key, default)` and `Guide.store.set(key, value)` are saved per guide and never throw. Use them only for conveniences (progress, last model picked). The page must work without them.

### Product widgets (like the fridge panel simulator)

A widget that is unique to one product (a control-panel simulator, a cycle picker, a remote-control map) lives in the guide folder as `<name>.js` plus `<name>.css`. Widgets must:

- use the shared tokens (`var(--accent)` etc.), or keep their own palette scoped to their root element,
- explain each action in a “What just happened” card with the same callout styles,
- shorten long real-world waits for the demo, and **say so** (“10 seconds, 5 in this demo”),
- work with mouse, touch and keyboard (Enter/Space = tap).

---

## 7. Look & feel

- Use only the tokens in `shared/guide.css` (`--bg`, `--surface`, `--text`, `--muted`, `--line`, `--accent`, `--accent-2`, `--warn`, `--danger`, `--ok`, and their `-soft` variants). Don't hard-code colours, so light and dark themes keep working.
- Icons are emoji, one per card or summary. Don't use icon fonts or images.
- Body text is 16 px. Use `.small` for secondary text and `.muted` for hints. Never go below 12 px.
- Keep cards short. When a card needs scrolling, split it, or move the details into an accordion.

---

## 8. Accessibility

- Buttons are `<button type="button">`. Links that go to another page are `<a href>`.
- Decorative emoji get `aria-hidden="true"`.
- Every SVG has `role="img"` and an `aria-label`.
- Don't rely on colour alone: callouts have an icon and a heading, and done states have a ✓.
- Everything has to work with the keyboard (`/` focuses search).

---

## 9. Checklist before publishing

- [ ] Folder named `<product>_guide/`, entry added to `guides.json`, `guide:*` meta tags filled in
- [ ] Header back link, search, theme toggle and footer present and unchanged
- [ ] Tabs are in the standard order, 4–6 of them, one-word labels
- [ ] Home has the hero, facts, exactly 6 task cards, and every `data-go` target exists
- [ ] Every WARNING/CAUTION from the manual that applies to a step appears next to that step
- [ ] Numbers checked against the manual (temperatures, sizes, times); “some models only” marked
- [ ] `data-topic`/`data-keywords` on searchable items. Try 5 everyday searches
- [ ] Tested at phone width (375 px): no sideways scrolling, bottom tab bar fits
- [ ] Tested in dark mode
- [ ] No console errors when served over HTTP the way GitHub Pages serves it (`python -m http.server 8765` in the repo root, then open `http://localhost:8765/<product>_guide/`)
