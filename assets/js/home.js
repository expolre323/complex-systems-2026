/* ============================================================================
   首页 · 课程作业序列的渲染与交互
   数据来源：assets/js/data.js 中的 CSE.meta / CSE.roadmap
   ========================================================================== */
(function () {
  'use strict';
  const D = window.CSE;
  if (!D) return;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const META = D.meta;
  const ROAD = D.roadmap;

  /* ------------------------------------------------------------------ 基础 */
  const stats = [
    { v: String(ROAD.length).padStart(2, '0'), k: '课程作业', u: 'ASSIGNMENTS' },
    { v: String(ROAD.filter((r) => r.status === 'published').length).padStart(2, '0'), k: '已发布', u: 'PUBLISHED' },
    { v: '06', k: '系统层级', u: 'LAYERS' },
    { v: '11', k: '一级系统', u: 'SYSTEMS' },
    { v: '188', k: '末端模块', u: 'MODULES' }
  ];
  $('#stats').innerHTML = stats.map((s) => (
    `<div class="stat"><b>${esc(s.v)}</b><span>${esc(s.k)}</span><i>${esc(s.u)}</i></div>`
  )).join('');

  $('#footMeta').textContent = 'UPDATED ' + META.updated + ' · ' + META.version;

  /* ------------------------------------------------------------------ 序列 */
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const inner = (r) => `
    <div class="seq__no">${esc(r.no)}</div>
    <div class="seq__main">
      <h3>${esc(r.name)}<span class="seq__en">${esc(r.en)}</span></h3>
      <p class="seq__note">${esc(r.note)}</p>
      ${r.gain ? `<p class="seq__gain"><em>产 出</em>${esc(r.gain)}</p>` : ''}
    </div>
    <div class="seq__side">
      <span class="st ${r.status === 'published' ? 'st--live' : 'st--plan'}">${r.status === 'published' ? '已发布' : '预留位'}</span>
      <span class="seq__date">${esc(r.date)}</span>
      ${r.status === 'published' && r.href ? `<span class="seq__go">进入作业${arrow}</span>` : ''}
    </div>`;

  $('#seqList').innerHTML = ROAD.map((r) => {
    const live = r.status === 'published' && r.href;
    const tag = live ? 'a' : 'div';
    const attr = live ? ` href="${esc(r.href)}"` : ' aria-disabled="true"';
    return `<li class="seq__i ${r.status === 'published' ? 'is-live' : 'is-plan'}" data-no="${esc(r.no)}">
      <${tag} class="seq__row"${attr}>${inner(r)}</${tag}>
    </li>`;
  }).join('');

  const pub = ROAD.filter((r) => r.status === 'published').length;
  $('#progT').textContent = pub + ' / ' + ROAD.length;
  $('#progBar').style.width = (pub / ROAD.length * 100).toFixed(1) + '%';

  /* ------------------------------------------------------------ 进度环 */
  (function renderRing() {
    const svg = $('#ringSvg');
    if (!svg) return;
    const c = 160, r = 112, n = ROAD.length;
    const circ = 2 * Math.PI * r;
    const live = ROAD.filter((x) => x.status === 'published' && x.href).length;
    const dash = circ * (1 - live / n);

    let out = `<defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--accent-2)"/><stop offset="100%" stop-color="var(--accent)"/>
    </linearGradient></defs>`;
    out += `<circle class="ring__track" cx="${c}" cy="${c}" r="${r}"/>`;
    out += `<circle class="ring__inner" cx="${c}" cy="${c}" r="${r - 34}"/>`;
    out += `<circle class="ring__prog" id="ringProg" cx="${c}" cy="${c}" r="${r}"
      stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${dash.toFixed(1)}"
      transform="rotate(-90 ${c} ${c})"/>`;
    out += `<text class="ring__c3" id="ringLabel" x="${c}" y="${c - 26}" text-anchor="middle">${esc(ROAD[0].name)}</text>`;
    out += `<text class="ring__c1" x="${c}" y="${c + 4}" text-anchor="middle">${String(pub).padStart(2, '0')}<tspan font-size="15" fill="var(--fg-3)"> / ${String(n).padStart(2, '0')}</tspan></text>`;
    out += `<text class="ring__c2" x="${c}" y="${c + 26}" text-anchor="middle">PUBLISHED</text>`;

    ROAD.forEach((item, i) => {
      const a = (-90 + i * (360 / n)) * Math.PI / 180;
      const x = c + r * Math.cos(a), y = c + r * Math.sin(a);
      const on = item.status === 'published' && item.href;
      out += `<g class="ring__node ${on ? 'is-live' : 'is-dim'}" data-i="${i}" ${on ? `data-href="${esc(item.href)}"` : ''}
        role="button" tabindex="0" aria-label="${esc(item.no)} ${esc(item.name)}${on ? '，已发布' : '，预留位'}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16"/>
        <text x="${x.toFixed(1)}" y="${(y + 3.6).toFixed(1)}" text-anchor="middle">${esc(item.no)}</text>
      </g>`;
    });
    svg.innerHTML = out;

    const label = $('#ringLabel');
    const base = ROAD[0].name;
    $$('#ringSvg .ring__node').forEach((g) => {
      const item = ROAD[+g.dataset.i];
      const go = () => {
        if (label) label.textContent = item.name;
        if (g.dataset.href) window.location.href = g.dataset.href;
      };
      g.addEventListener('mouseenter', () => { if (label) label.textContent = item.name; });
      g.addEventListener('mouseleave', () => { if (label) label.textContent = base; });
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  })();

  /* ---------------------------------------------------------- 快捷键 */
  if (window.FX) {
    ROAD.forEach((r, i) => {
      FX.key(String(i + 1), `${esc(r.no)} ${r.name}`, () => {
        const li = $('#seqList').children[i];
        if (li) li.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const a = li && li.querySelector('a');
        if (a && r.status === 'published' && r.href) setTimeout(() => { window.location.href = r.href; }, 260);
      });
    });
  }

  /* ------------------------------------------------------------- 进度 */
  const bar = $('#scrollbar');
  const menuBtn = $('#menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const on = $('#nav').classList.toggle('on');
      menuBtn.setAttribute('aria-expanded', on);
    });
    $$('#nav a').forEach((a) => a.addEventListener('click', () => {
      $('#nav').classList.remove('on');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  const navLinks = $$('#nav a');
  const secs = ['seq', 'inherit', 'about'].map((id) => document.getElementById(id));
  function onScroll() {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.width = (p * 100).toFixed(2) + '%';
    let active = '';
    secs.forEach((s) => { if (s && s.getBoundingClientRect().top <= 140) active = s.id; });
    navLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + active));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------- 淡入 */
  if (window.FX) FX.reveal('.seq__i, .card, .about');
})();
