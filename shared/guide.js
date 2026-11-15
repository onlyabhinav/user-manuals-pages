/* ==========================================================================
   Product Guides — shared runtime
   Provides: tabs + hash routing, theme toggle, search, and reusable
   components (parts map, troubleshooter, checklist). See GUIDE_FORMAT.md.
   Usage in a guide:   Guide.init({ id: 'fridge' });  then call components.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad2 = n => String(n).padStart(2, '0');

  /* ---------- Storage (namespaced per guide, never throws) ---------- */
  const store = {
    ns: '',
    get(k, d, global) {
      try { const v = localStorage.getItem((global ? 'guides:' : this.ns) + k); return v == null ? d : JSON.parse(v); }
      catch { return d; }
    },
    set(k, v, global) {
      try { localStorage.setItem((global ? 'guides:' : this.ns) + k, JSON.stringify(v)); } catch { /* ignore */ }
    }
  };

  const searchExtra = [];   // entries registered by components
  let searchIndex = null;

  /* ---------- Navigation ---------- */
  function viewOf(el) { return el && el.closest('section.view'); }

  function go(view, anchor, opts = {}) {
    const section = document.getElementById(view);
    if (!section || !section.classList.contains('view')) return;
    $$('nav.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === view)));
    $$('section.view').forEach(s => s.classList.toggle('active', s === section));
    const target = anchor && document.getElementById(anchor);
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: opts.instant ? 'auto' : 'smooth', block: 'start' });
        if (!opts.noFlash) { target.classList.remove('flash'); void target.offsetWidth; target.classList.add('flash'); }
      });
    } else if (!opts.keepScroll) {
      window.scrollTo({ top: 0 });
    }
    const hash = '#' + view + (anchor ? '/' + anchor : '');
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  function routeFromHash(instant) {
    const [view, anchor] = decodeURIComponent(location.hash.slice(1)).split('/');
    if (view && document.getElementById(view)) go(view, anchor, { instant, noFlash: instant });
  }

  function setupNav() {
    $$('nav.tabs button').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-go]');
      if (!t) return;
      e.preventDefault();
      go(t.dataset.go, t.dataset.anchor);
    });
    window.addEventListener('hashchange', () => routeFromHash(false));
    routeFromHash(true);
  }

  /* ---------- Theme (shared across all guides) ---------- */
  function setupTheme() {
    const saved = store.get('theme', null, true);
    if (saved) document.documentElement.dataset.theme = saved;
    const btn = $('#themeBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      store.set('theme', next, true);
    });
  }

  /* ---------- Search ---------- */
  let autoId = 0;
  function buildIndex() {
    const items = [];
    $$('section.view [data-topic]').forEach(el => {
      if (!el.id) el.id = 'topic-' + (++autoId);
      const view = viewOf(el);
      const heading = el.querySelector('h2,h3');
      const title = el.dataset.topic || (heading ? heading.textContent.trim() : '');
      if (!title) return;
      items.push({
        title, view: view.id, anchor: el.id,
        where: tabLabel(view.id),
        hay: (title + ' ' + (el.dataset.keywords || '') + ' ' + el.textContent).toLowerCase(),
        titleLc: title.toLowerCase()
      });
    });
    searchExtra.forEach(x => items.push({
      ...x, where: x.where || tabLabel(x.view),
      hay: (x.title + ' ' + (x.text || '')).toLowerCase(), titleLc: x.title.toLowerCase()
    }));
    return items;
  }
  function tabLabel(view) {
    const b = $(`nav.tabs button[data-view="${view}"]`);
    if (!b) return view;
    const c = b.cloneNode(true);
    c.querySelectorAll('.ti').forEach(x => x.remove());
    return c.textContent.trim();
  }
  function runSearch(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    searchIndex = searchIndex || buildIndex();
    return searchIndex
      .filter(it => words.every(w => it.hay.includes(w)))
      .map(it => ({ it, score: words.reduce((s, w) => s + (it.titleLc.includes(w) ? 3 : 1), 0) + (it.action ? 1 : 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(x => x.it);
  }
  function setupSearch() {
    const input = $('#searchInput'), list = $('#searchResults');
    if (!input || !list) return;
    let results = [], active = -1;
    const close = () => { list.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); active = -1; };
    const pick = i => {
      const r = results[i]; if (!r) return;
      close(); input.blur();
      if (r.action) r.action(); else go(r.view, r.anchor);
    };
    const render = () => {
      const q = input.value.trim();
      if (!q) return close();
      results = runSearch(q);
      list.innerHTML = results.length
        ? results.map((r, i) => `<li role="option"><button type="button" data-i="${i}" class="${i === active ? 'active' : ''}"><span class="r-title">${r.title}</span><span class="r-where">${r.where}</span></button></li>`).join('')
        : `<li class="empty">No matches. Try simpler words, like “cold” or “noise”.</li>`;
      list.classList.add('open'); input.setAttribute('aria-expanded', 'true');
    };
    input.addEventListener('input', () => { active = -1; render(); });
    input.addEventListener('focus', render);
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { active = Math.min(active + 1, results.length - 1); render(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { active = Math.max(active - 1, 0); render(); e.preventDefault(); }
      else if (e.key === 'Enter') { pick(active < 0 ? 0 : active); e.preventDefault(); }
      else if (e.key === 'Escape') { close(); input.blur(); }
    });
    list.addEventListener('mousedown', e => e.preventDefault());   // keep focus while clicking
    list.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) pick(+b.dataset.i); });
    document.addEventListener('click', e => { if (!e.target.closest('.search')) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); input.focus(); }
    });
  }

  /* ---------- Component: parts map ----------
     parts: [{ n, name, x, y, desc, go?: 'view', anchor?: 'id' }]
     opts:  { svgGroup, list, title, desc }  (elements)                        */
  function partsMap(parts, opts) {
    const NS = 'http://www.w3.org/2000/svg';
    const { svgGroup, list, title, desc } = opts;
    function select(n) {
      const p = parts.find(x => x.n === n);
      title.textContent = `${pad2(n)} · ${p.name}`;
      desc.innerHTML = p.desc + (p.go ? ` <a href="#${p.go}/${p.anchor || ''}" data-go="${p.go}" data-anchor="${p.anchor || ''}">How-to →</a>` : '');
      $$('.hot', svgGroup).forEach(h => h.classList.toggle('sel', +h.dataset.n === n));
      $$('button', list).forEach(b => b.classList.toggle('sel', +b.dataset.n === n));
    }
    parts.forEach(p => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'hot'); g.dataset.n = p.n;
      g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', p.name);
      g.innerHTML = `<circle cx="${p.x}" cy="${p.y}" r="11"/><text x="${p.x}" y="${p.y + 4}" text-anchor="middle">${p.n}</text>`;
      g.addEventListener('click', () => select(p.n));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p.n); } });
      svgGroup.appendChild(g);
      const li = document.createElement('li');
      li.innerHTML = `<button type="button" data-n="${p.n}"><span class="n">${pad2(p.n)}</span><span>${p.name}</span></button>`;
      li.firstChild.addEventListener('click', () => select(p.n));
      list.appendChild(li);
    });
    return { select };
  }

  /* ---------- Component: troubleshooter ----------
     symptoms: [{ id, icon, title, summary, checks: [{ cause, fix }], keywords? }]
     opts: { escalate: 'html shown when all checks are ticked', view: 'fix' }   */
  function troubleshooter(el, symptoms, opts = {}) {
    const key = 'ts:' + (el.id || 'main');
    const done = store.get(key, {});
    const view = viewOf(el).id;
    el.innerHTML = `<div class="symptoms" role="list"></div><div class="ts-detail" style="margin-top:20px"><div class="placeholder">Choose what you’re noticing above</div></div>`;
    const grid = $('.symptoms', el), detail = $('.ts-detail', el);

    grid.innerHTML = symptoms.map(s =>
      `<button type="button" class="sym" role="listitem" data-id="${s.id}"><span class="e" aria-hidden="true">${s.icon}</span><b>${s.title}</b><span class="s">${s.summary}</span></button>`).join('');
    grid.addEventListener('click', e => { const b = e.target.closest('.sym'); if (b) select(b.dataset.id, true); });

    function select(id, scroll) {
      const s = symptoms.find(x => x.id === id); if (!s) return;
      $$('.sym', grid).forEach(b => b.classList.toggle('sel', b.dataset.id === id));
      const d = done[id] || [], all = s.checks.length, n = s.checks.filter((_, i) => d.includes(i)).length;
      detail.innerHTML = `
        <div class="card" id="${el.id || 'ts'}-${id}">
          <div class="ts-head"><h3>${s.icon} ${s.title}${all > 1 ? ' — check these in order' : ''}</h3><span class="chip">${n} of ${all} checked</span></div>
          <ul class="checks">${s.checks.map((c, i) => `
            <li><label class="check ${d.includes(i) ? 'done' : ''}"><input type="checkbox" data-i="${i}" ${d.includes(i) ? 'checked' : ''}>
            <span><span class="cause">${c.cause}</span><span class="fix">→ ${c.fix}</span></span></label></li>`).join('')}</ul>
          ${n === all && opts.escalate ? `<div class="callout note"><span aria-hidden="true">📞</span><span>${opts.escalate}</span></div>` : ''}
        </div>`;
      $$('input', detail).forEach(cb => cb.addEventListener('change', () => {
        const set = new Set(done[id] || []); const i = +cb.dataset.i;
        cb.checked ? set.add(i) : set.delete(i);
        done[id] = [...set]; store.set(key, done); select(id, false);
      }));
      if (scroll) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    symptoms.forEach(s => searchExtra.push({
      title: s.title, view, where: tabLabel(view) + ' · troubleshooter',
      text: s.summary + ' ' + (s.keywords || '') + ' ' + s.checks.map(c => c.cause + ' ' + c.fix).join(' ').replace(/<[^>]+>/g, ''),
      action: () => { go(view, null, { keepScroll: true }); select(s.id, true); }
    }));
    searchIndex = null;
    return { select };
  }

  /* ---------- Component: checklist ----------
     steps: [{ title, html }]   Progress is saved per guide.                    */
  function checklist(el, steps) {
    const key = 'cl:' + (el.id || 'main');
    const done = new Set(store.get(key, []));
    el.innerHTML = `<div class="progress-row"><span class="muted">Progress</span><span class="pt"></span></div>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${steps.length}"><div></div></div>
      <div class="cl-steps"></div>`;
    const wrap = $('.cl-steps', el);
    function firstOpen() { for (let i = 0; i < steps.length; i++) if (!done.has(i)) return i; return -1; }
    function render() {
      const open = firstOpen();
      wrap.innerHTML = steps.map((s, i) => `
        <div class="cl-step ${done.has(i) ? 'done' : ''}" id="${el.id || 'cl'}-${i + 1}">
          <button type="button" class="num" data-i="${i}" aria-pressed="${done.has(i)}" aria-label="Mark step ${i + 1} ${done.has(i) ? 'not done' : 'done'}">${done.has(i) ? '✓' : i + 1}</button>
          <details ${i === open ? 'open' : ''}><summary>${s.title}</summary>
            <div class="body">${s.html}
              <button type="button" class="chip accent mark" data-i="${i}">${done.has(i) ? '↺ Mark as not done' : '✓ Mark step done'}</button>
            </div></details>
        </div>`).join('');
      $('.pt', el).textContent = `${done.size} of ${steps.length}`;
      $('.progress', el).setAttribute('aria-valuenow', done.size);
      $('.progress > div', el).style.width = (done.size / steps.length * 100) + '%';
    }
    wrap.addEventListener('click', e => {
      const b = e.target.closest('[data-i]'); if (!b || b.tagName === 'INPUT') return;
      const i = +b.dataset.i; done.has(i) ? done.delete(i) : done.add(i);
      store.set(key, [...done]); render(); onRender();
    });
    let onRender = () => {};
    render();
    return { onRender(fn) { onRender = fn; fn(); } };
  }

  /* ---------- Init ---------- */
  function init(cfg = {}) {
    store.ns = (cfg.id || 'guide') + ':';
    setupTheme();
    setupSearch();
    setupNav();
  }

  window.Guide = { init, go, store, partsMap, troubleshooter, checklist, $, $$,
    addSearch(entry) { searchExtra.push(entry); searchIndex = null; } };
})();
