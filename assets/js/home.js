/* ============================================================================
   首页 · 三次作业的三个入口
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
  const ROAD = D.roadmap || [];

  $('#footMeta').textContent = 'UPDATED ' + META.updated + ' · ' + META.version;

  /* ---------------------------------------------------------------- 入口卡 */
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const card = (r, i) => `
    <a class="gate" href="${esc(r.href)}" aria-label="进入作业 ${esc(r.no)} ${esc(r.name)}">
      <div class="gate__top">
        <span class="gate__no">${esc(r.no)}</span>
        <span class="gate__tag mono">${esc(r.en)}</span>
      </div>
      <p class="gate__q">${esc(r.q || '')}</p>
      <h2 class="gate__h">${esc(r.name)}</h2>
      <ul class="gate__keys">
        ${(r.keys || []).map((k) => `<li>${esc(k)}</li>`).join('')}
      </ul>
      <div class="gate__foot">
        <span class="mono dim">${esc(r.date)}</span>
        <span class="gate__go">进入作业 ${esc(r.no)}${arrow}</span>
      </div>
      <i class="gate__idx mono" aria-hidden="true">${String.fromCharCode(65 + i)}</i>
    </a>`;

  $('#gateList').innerHTML = ROAD.map(card).join('');

  /* ---------------------------------------------------------- 键盘直达 */
  if (window.FX) {
    ROAD.forEach((r, i) => {
      FX.key(String(i + 1), `进入作业 ${r.no} ${r.name}`, () => {
        if (r.href) window.location.href = r.href;
      });
    });
  }

  /* ------------------------------------------------------------- 滚动条 */
  const bar = $('#scrollbar');
  const menuBtn = $('#menuBtn');
  let last = -1;
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? h.scrollTop / max : 0;
    const v = +(p * 100).toFixed(2);
    if (v !== last) { bar.style.width = v + '%'; last = v; }
    const about = document.getElementById('about');
    const onAbout = about && about.getBoundingClientRect().top <= 160;
    $$('#nav a[href="#about"]').forEach((a) => a.classList.toggle('is-on', !!onAbout));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const on = $('#nav').classList.toggle('on');
      menuBtn.setAttribute('aria-expanded', String(on));
    });
    $$('#nav a').forEach((a) => a.addEventListener('click', () => {
      $('#nav').classList.remove('on');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------------------------------------------------------------- 淡入 */
  if (window.FX) FX.reveal('.gate, .about');
})();
