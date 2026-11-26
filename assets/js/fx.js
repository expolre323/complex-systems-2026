/* ============================================================================
   IBEX-01 · 交互层（两个页面共用）
   主题（默认浅色）· 数字滚动 · 指针光斑 · 分段入场 · 快捷键 · 页面转场
   无依赖，加载顺序：data.js → fx.js → app.js / home.js
   ========================================================================== */
window.FX = (function () {
  'use strict';

  const KEY = 'cse-theme-v2';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const $ = (s, r = document) => r.querySelector(s);

  /* ------------------------------------------------------------------ 主题 */
  function setTheme(t, persist) {
    root.setAttribute('data-theme', t);
    const btn = $('#themeBtn');
    if (btn) {
      btn.setAttribute('aria-pressed', String(t === 'light'));
      btn.setAttribute('title', t === 'dark' ? '切换到浅色（T）' : '切换到深色（T）');
    }
    if (persist) { try { localStorage.setItem(KEY, t); } catch (e) {} }
  }

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  setTheme(saved === 'dark' ? 'dark' : 'light', false);

  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.classList.add('theme-anim');
    setTheme(next, true);
    setTimeout(() => root.classList.remove('theme-anim'), 520);
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#themeBtn')) toggleTheme();
  });

  /* -------------------------------------------------------------- 数字滚动 */
  function countUp(el, opts) {
    const raw = String(el.textContent).trim();
    const m = raw.match(/^(\D*)(\d+)(\D*)$/);
    if (!m) return;
    const pad = m[2].length > 1 && m[2][0] === '0';
    const target = +m[2];
    const dur = (opts && opts.dur) || 1100;
    const t0 = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 4);
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const v = Math.round(target * ease(p));
      el.textContent = m[1] + (pad ? String(v).padStart(m[2].length, '0') : v) + m[3];
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    }
    requestAnimationFrame(tick);
  }

  function runCounters(scope) {
    if (reduce) return;
    const list = $$('.stat b', scope || document);
    list.forEach((el, i) => setTimeout(() => countUp(el), 120 + i * 60));
  }

  /* -------------------------------------------------------------- 指针光斑 */
  function spotlight(selector) {
    if (window.matchMedia('(hover: none)').matches) return;
    $$(selector).forEach((el) => {
      if (el.querySelector(':scope > .spot__layer')) return;
      el.classList.add('spot');
      const layer = document.createElement('span');
      layer.className = 'spot__layer';
      layer.setAttribute('aria-hidden', 'true');
      el.insertBefore(layer, el.firstChild);
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* -------------------------------------------------------------- 分段入场 */
  function reveal(selector) {
    const targets = $$(selector).filter((t) => !t.classList.contains('rv'));
    if (!targets.length) return;

    const vh = window.innerHeight || 800;
    const shown = [];
    targets.forEach((t, idx) => {
      t.classList.add('rv');
      t.style.setProperty('--i', String(Math.min(idx % 7, 6)));
      const r = t.getBoundingClientRect();
      if (r.top < vh * 0.98 && r.bottom > -100) shown.push(t);
    });

    /* 首屏内的元素用定时器兜底显示：不依赖 IO / rAF 是否被调度 */
    setTimeout(() => shown.forEach((t) => t.classList.add('in')), 60);
    if (reduce) { targets.forEach((t) => t.classList.add('in')); return; }

    const sweep = () => {
      const h = window.innerHeight || 800;
      targets.forEach((t) => {
        if (t.classList.contains('in')) return;
        const r = t.getBoundingClientRect();
        if (r.top < h * 0.94 && r.bottom > -80) t.classList.add('in');
      });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -6% 0px' });
      targets.forEach((t) => io.observe(t));
    }
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('load', sweep);
    [160, 600, 1400, 3000].forEach((ms) => setTimeout(sweep, ms));
    /* 最终兜底：任何情况下内容都不会停留在隐藏状态 */
    setTimeout(() => targets.forEach((t) => t.classList.add('in')), 7000);
  }

  /* ---------------------------------------------------------------- 快捷键 */
  const keys = [];
  function key(k, desc, fn) { keys.push({ k, desc, fn }); }

  let panel = null;
  function buildPanel() {
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'keyPanel';
      panel.innerHTML = '<div class="kp__mask" data-kp-close></div><div class="kp__box" role="dialog" aria-modal="true" aria-label="快捷键">'
        + '<h4>键盘快捷键<span>SHORTCUTS</span></h4><div class="kp__list"></div>'
        + '<p class="kp__foot">按 <span class="kbd">?</span> 或 <span class="kbd">Esc</span> 关闭</p></div>';
      document.body.appendChild(panel);
      panel.addEventListener('click', (e) => { if (e.target.closest('[data-kp-close]')) closePanel(); });
    }
    const list = panel.querySelector('.kp__list');
    const items = [{ k: 'T', desc: '切换深浅主题' }, { k: '?', desc: '显示 / 关闭本面板' }].concat(
      keys.filter((x) => x.desc).map((x) => ({ k: x.k === '?' ? '?' : x.k.toUpperCase(), desc: x.desc }))
    );
    list.innerHTML = items.map((it) => `<div><span>${it.desc}</span><span class="kbd">${it.k}</span></div>`).join('');
  }
  function openPanel() { buildPanel(); panel.classList.add('on'); }
  function closePanel() { if (panel) panel.classList.remove('on'); }

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

    if (e.key === 'Escape') { closePanel(); return; }
    if (typing) return;

    if (e.key === 't' || e.key === 'T') { e.preventDefault(); toggleTheme(); return; }
    if (e.key === '?') { e.preventDefault(); (panel && panel.classList.contains('on')) ? closePanel() : openPanel(); return; }

    const hit = keys.find((x) => x.k === e.key);
    if (hit) { e.preventDefault(); hit.fn(); }
  });

  /* -------------------------------------------------------------- 页面转场 */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target && a.target !== '_self') return;
    const href = a.getAttribute('href') || '';
    if (!/\.html(\?|#|$)/.test(href) || href.indexOf('://') > -1) return;
    if (reduce) return;
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(() => { window.location.href = href; }, 170);
  });

  /* ------------------------------------------------------------------ 启动 */
  function boot() {
    runCounters();
    spotlight('.card, .syscard, .panel, .seq__row, .figure, .sos, .cfg, .mod, .qc');
    reveal('.rv-target');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return { setTheme, toggleTheme, countUp, runCounters, spotlight, reveal, key, openPanel };
})();
