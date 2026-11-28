/* ============================================================================
   IBEX-01 · 作业 04 · 页面渲染与交互
   数据：assets/js/a4-data.js（CSE.a4）｜ 交互基座：fx.js（主题 / 入场 / 快捷键）
   ========================================================================== */
(function () {
  'use strict';
  const D = (window.CSE && window.CSE.a4) || null;
  if (!D) { console.warn('CSE.a4 未加载'); return; }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (v) => esc(v).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  /* ============================================================ 01 方法论 */
  function renderMethod() {
    const S = D.spine;
    $('#spineBox').innerHTML = `
      <p class="a4spine__chain">空间 <i>→</i> 子空间 <i>→</i> 轨迹 <i>→</i> 越界</p>
      <p class="a4spine__c">${fmt(S.claim)}</p>
      <div class="a4spine__row">${S.items.map((it, i) => `
        <article class="a4spine__i">
          <div class="a4spine__n"><span class="mono">${String(i + 1).padStart(2, '0')}</span>${esc(it.en)}</div>
          <b>${esc(it.k)}</b>
          <p class="a4spine__v">${esc(it.v)}</p>
          <p class="a4spine__d">${fmt(it.d)}</p>
        </article>`).join('<div class="a4spine__ar" aria-hidden="true">→</div>')}
      </div>
      <p class="subnote">${fmt(S.note)}</p>`;

    $('#methodCards').innerHTML = D.method.map((m) => `
      <article class="a2-lead__i">
        <div class="a2-lead__n">${esc(m.no)} / ${esc(m.en)}</div>
        <h4>${esc(m.t)}</h4>
        <p>${fmt(m.p)}</p>
        <span class="out">产出：${esc(m.out)}</span>
      </article>`).join('');
  }

  /* ============================================================ 02 概念 */
  function renderConcept() {
    const C = D.concept, d = C.def;
    $('#defBox').innerHTML = `
      <div class="scn-def__src"><span class="mono">${esc(d.src)}</span></div>
      <blockquote class="scn-def__q">${fmt(d.txt)}</blockquote>
      <div class="scn-def__two">
        <div><span class="mono">读法</span><p>${fmt(d.mine)}</p></div>
        <div><span class="mono">与自动驾驶的唯一差别</span><p>${fmt(d.diff)}</p></div>
      </div>`;

    const F = C.formal;
    $('#formBox').innerHTML = `
      <div class="a4form__eq"><code>${esc(F.f)}</code>
        <span class="a4form__sub">${esc(F.sub)}</span></div>
      <div class="a4form__g">${F.items.map((it) => `
        <article class="a4form__i">
          <div class="a4form__h"><span class="mono">${esc(it.no)}</span><b>${esc(it.t)}</b></div>
          <p>${fmt(it.d)}</p>
        </article>`).join('')}</div>
      <p class="subnote">${fmt(F.note)}</p>`;

    $('#termsBody').innerHTML = C.terms.map((t) => `
      <tr>
        <td class="tid">${esc(t.id)}</td>
        <td><b>${esc(t.t)}</b><span class="en2">${esc(t.en)}</span></td>
        <td>${esc(t.d)}</td>
        <td class="here2">${esc(t.here)}</td>
      </tr>`).join('');
    $('#termsNote').innerHTML = fmt(C.termsNote);

    $('#grainBox').innerHTML = C.grain.map((g) => `
      <article class="grain__i">
        <div class="grain__h"><span class="mono">${esc(g.no)}</span><b>${esc(g.t)}</b><i>${esc(g.en)}</i></div>
        <p>${fmt(g.d)}</p>
        <p class="grain__eg">${esc(g.eg)}</p>
        <span class="grain__u">用途：${esc(g.use)}</span>
      </article>`).join('');
    $('#grainNote').innerHTML = fmt(C.grainNote);

    $('#srcBox').innerHTML = C.sources.map((s) => `
      <article class="srcs__i">
        <h4>${esc(s.k)}</h4>
        <p class="srcs__t">${esc(s.t)}</p>
        <p class="srcs__g"><em>给</em>${esc(s.give)}</p>
        <p class="srcs__m"><em>缺</em>${esc(s.miss)}</p>
      </article>`).join('');
    $('#srcNote').innerHTML = fmt(C.sourcesNote);

    $('#collBody').innerHTML = C.collect.map((c) => `
      <tr><td class="tid">${esc(c.k)}</td><td>${esc(c.good)}</td><td class="dim2">${esc(c.bad)}</td><td>${esc(c.here)}</td></tr>`).join('');
    $('#collNote').innerHTML = fmt(C.collectNote);
  }

  /* ============================================================ 03 分层 */
  function renderLayers() {
    const L = D.layers;
    $('#mapBody').innerHTML = L.map.map((m) => `
      <tr><td class="dim2">${esc(m.iso)}</td><td><b>${esc(m.mine)}</b></td><td>${esc(m.why)}</td></tr>`).join('');

    $('#critBox').innerHTML = L.criterion.items.map((c) => `
      <div class="checks2__i crit"><b><em class="mono">${esc(c.id)}</em>${esc(c.t)}</b><p>${fmt(c.d)}</p></div>`).join('');
    $('#critNote').innerHTML = `
      <p class="l7__h"><span class="mono">S7</span>正交性检验发现的一处缺口</p>
      <p>${fmt(L.criterion.layer7)}</p>
      <p class="l7__b">${fmt(L.criterion.layer7b)}</p>`;

    $('#layerBox').innerHTML = L.items.map((ly) => `
      <article class="lyr" id="${esc(ly.id)}">
        <header class="lyr__h">
          <span class="lyr__id mono">${esc(ly.id)}</span>
          <span class="lyr__t">${esc(ly.t)}<i>${esc(ly.en)}</i></span>
          <span class="lyr__q">${esc(ly.q)}</span>
          <span class="lyr__n mono">${ly.rows.length} 项</span>
        </header>
        <div class="table-wrap"><table class="tbl tbl--lyr">
          <thead><tr><th class="c-e2">要素</th><th class="c-v3">取值 / 分级</th><th>影响路径</th><th class="c-r2">需求落点</th></tr></thead>
          <tbody>${ly.rows.map((r) => `
            <tr><td><b>${esc(r.k)}</b></td><td class="dim2">${fmt(r.v)}</td><td>${fmt(r.e)}</td><td class="mono rq">${esc(r.r)}</td></tr>`).join('')}
          </tbody>
        </table></div>
      </article>`).join('');

    $('#coupleBox').innerHTML = L.couple.map((c, i) => `
      <article class="couple">
        <div class="couple__h"><span class="couple__f">${esc(c.from)}</span>
          <svg viewBox="0 0 24 12" aria-hidden="true"><path d="M1 6h20M17 1l4 5-4 5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
          <span class="couple__t">${esc(c.to)}</span></div>
        <span class="couple__ty couple__ty--${esc(c.ty)}">${esc(c.ty)}</span>
        <p class="couple__w">${esc(c.how)}</p>
        <p class="couple__e">${esc(c.eg)}</p>
      </article>`).join('');
    $('#coupleNote').innerHTML = fmt(L.coupleNote);

    $('#ckindBox').innerHTML = L.coupleKind.map((k) => `
      <article class="ckind__i">
        <span class="ckind__t">${esc(k.ty)}</span>
        <p>${fmt(k.d)}</p>
      </article>`).join('');
    $('#ckindNote').innerHTML = fmt(L.coupleKindNote);
  }

  /* ============================================================ 04 ODC */
  function renderODC() {
    const O = D.odc;
    $('#voteBox').innerHTML = O.votes.map((v) => `
      <article class="vote">
        <div class="vote__h"><span class="mono">${esc(v.id)}</span><b>${esc(v.t)}</b><i>${esc(v.en)}</i></div>
        <p>${esc(v.q)}</p>
        <span class="vote__o">${esc(v.out)}</span>
      </article>`).join('');

    const cell = (t) => `<td>${esc(t)}</td>`;
    $('#oddBody').innerHTML = O.odd.rows.map((r) => `
      <tr><td><b>${esc(r[0])}</b></td><td class="mono ok">${esc(r[1])}</td><td class="dim2">${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('');
    $('#sysBody').innerHTML = O.sys.rows.map((r) => `
      <tr><td><b>${esc(r[0])}</b></td><td class="ok">${esc(r[1])}</td><td class="warn">${esc(r[2])}</td><td class="bad">${esc(r[3])}</td></tr>`).join('');
    $('#humBody').innerHTML = O.hum.rows.map((r) => `
      <tr><td><b>${esc(r[0])}</b></td><td class="ok">${esc(r[1])}</td><td class="bad">${esc(r[2])}</td></tr>`).join('');
    $('#othBody').innerHTML = O.oth.rows.map((r) => `
      <tr><td><b>${esc(r[0])}</b></td><td class="ok">${esc(r[1])}</td><td class="warn">${esc(r[2])}</td></tr>`).join('');

    const P = O.compose;
    $('#composeBox').innerHTML = `
      <div class="compose__h">${esc(P.t)}</div>
      <div class="compose__r">${P.rules.map((r) => `
        <article class="compose__i">
          <div class="compose__n"><span class="mono">${esc(r.no)}</span><b>${esc(r.t)}</b></div>
          <p>${fmt(r.d)}</p>
        </article>`).join('')}</div>
      <div class="compose__w">${fmt(P.warn)}</div>
      <p class="compose__e">${fmt(P.eg)}</p>`;

    const C = O.case;
    $('#caseBox').innerHTML = `
      <div class="odc-case__h">${esc(C.t)}</div>
      <div class="odc-case__two">
        <div class="odc-case__i odc-case__i--ok">
          <span class="odc-case__b">A · 进入</span>
          <p class="odc-case__c">${esc(C.a.cond)}</p>
          <p class="odc-case__v">${esc(C.a.votes)}</p>
          <p class="odc-case__o">${esc(C.a.out)}</p>
        </div>
        <div class="odc-case__i odc-case__i--no">
          <span class="odc-case__b">B · 不进入</span>
          <p class="odc-case__c">${esc(C.b.cond)}</p>
          <p class="odc-case__v">${esc(C.b.votes)}</p>
          <p class="odc-case__o">${esc(C.b.out)}</p>
        </div>
      </div>
      <p class="odc-case__why">${fmt(C.why)}</p>`;
  }

  /* ============================================================ 05 场景 */
  function renderScene() {
    const S = D.scene;
    $('#sceneTitle').textContent = S.title;
    $('#sceneWhy').innerHTML = fmt(S.why);

    $('#pickBox').innerHTML = S.pickRule.map((r) => `
      <article class="pick__i">
        <div class="pick__h"><span class="mono">${esc(r.no)}</span><b>${esc(r.t)}</b></div>
        <p>${fmt(r.d)}</p>
      </article>`).join('');
    $('#pickNote').innerHTML = fmt(S.pickNote);

    $('#paramBody').innerHTML = S.params.map((p) => `
      <tr><td><b>${esc(p.k)}</b></td><td class="mono dom">${esc(p.dom)}</td><td class="mono val">${esc(p.v)}</td><td class="why2">${fmt(p.why)}</td></tr>`).join('');

    $('#tlBox').innerHTML = S.phases.map((p) => `
      <article class="tl__i">
        <div class="tl__g"><b>${esc(p.id)}</b><span>${esc(p.t)}</span></div>
        <div class="tl__b">
          <h4>${esc(p.name)}</h4>
          <dl class="tl__dl">
            <div><dt>场景</dt><dd>${fmt(p.env)}</dd></div>
            <div><dt>系统</dt><dd>${fmt(p.sys)}</dd></div>
            <div><dt>控制</dt><dd>${fmt(p.act)}</dd></div>
          </dl>
          ${p.uca.length ? `<div class="tl__u">${p.uca.map((u) => `<span class="ucatag">${esc(u)}</span>`).join('')}</div>` : '<div class="tl__u"><span class="ucatag ucatag--none">无控制动作生效</span></div>'}
          <p class="tl__j"><em>判据</em>${fmt(p.judge)}</p>
        </div>
      </article>`).join('');
    $('#sceneNote').innerHTML = fmt(S.note);
  }

  /* ============================================================ 06 风险 */
  function renderRisk() {
    const R = D.risk;
    $('#riskClaim').innerHTML = fmt(R.claim);

    $('#riskSteps').innerHTML = `<div class="rsteps__h mono">分析五步</div><ol>` +
      R.method.map((m) => `<li>${fmt(m)}</li>`).join('') + `</ol>`;

    $('#scaleBox').innerHTML = ['sev', 'exp', 'ctl'].map((k) => `
      <div class="scale">
        <div class="scale__h mono">${k === 'sev' ? 'S 严重度' : k === 'exp' ? 'E 暴露度' : 'C 可控性'}</div>
        ${R.scales[k].map((s) => `<div class="scale__r"><b>${esc(s.id)}</b><span>${esc(s.t)}</span><em>${esc(s.d)}</em></div>`).join('')}
      </div>`).join('');
    $('#riskRule').innerHTML = fmt(R.rule);

    $('#clsBox').innerHTML = R.classes.map((c) => `
      <article class="cls3__i cls3__i--${esc(c.id)}">
        <div class="cls3__h"><span class="cls3__b mono">${esc(c.id)}</span><b>${esc(c.t)}</b><i>${esc(c.en)}</i><span class="cls3__n mono">${c.n}</span></div>
        <p class="cls3__d">${esc(c.d)}</p>
        <p class="cls3__f">${fmt(c.fix)}</p>
      </article>`).join('');
    $('#clsNote').innerHTML = fmt(R.classesNote);

    const lvCls = { '高': 'lv--h', '中': 'lv--m', '低': 'lv--l' };
    $('#rsBody').innerHTML = R.rows.map((r) => `
      <tr>
        <td class="tid">${esc(r.id)}</td>
        <td class="ph mono">${esc(r.ph)}</td>
        <td><b>${fmt(r.name)}</b><span class="rs-elem">要素　${esc(r.elem)}</span><span class="rs-cons">后果　${fmt(r.cons)}</span></td>
        <td class="mono ctr">${esc(r.h)}</td>
        <td class="mono ctr">${esc(r.uca)}</td>
        <td class="mono ctr">${esc(r.k)}</td>
        <td class="mono ctr sec2">${esc(r.s)}·${esc(r.e)}·${esc(r.c)}</td>
        <td class="ctr"><span class="lv ${lvCls[r.lv] || ''}">${esc(r.lv)}</span><span class="rcls rcls--${esc(r.cls)}">${esc(r.cls)}</span></td>
        <td class="fix2">${fmt(r.fix)}</td>
      </tr>`).join('');

    const M = R.matrix;
    let html = '<thead><tr><th class="mx4__c0">S \\ E</th>' + M.cols.map((c) => `<th>${esc(c)}</th>`).join('') + '</tr></thead><tbody>';
    M.rows.forEach((row, i) => {
      html += `<tr><th class="mx4__rh">${esc(row)}</th>`;
      M.cells[i].forEach((cell, j) => {
        const base = M.base[i][j];
        const cls = base === '高' ? 'mx--h' : base === '中' ? 'mx--m' : 'mx--l';
        html += `<td class="mx4__cell ${cls}">${cell.length ? cell.map((x) => `<span>${esc(x)}</span>`).join('') : '<i>—</i>'}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';
    $('#mxBox').innerHTML = html;
    $('#mxNote').innerHTML = fmt(R.matrixNote);

    const MM = R.metricMap;
    $('#metricHead').innerHTML = MM.head.map((h, i) => `<th${i === 0 ? ' class="c-e2"' : i === 1 ? ' class="c-m1"' : ''}>${esc(h)}</th>`).join('');
    $('#metricBody').innerHTML = MM.rows.map((r) => `
      <tr><td><b>${esc(r[0])}</b></td><td class="mono mm">${esc(r[1])}</td><td>${fmt(r[2])}</td></tr>`).join('');
    $('#metricNote').innerHTML = fmt(MM.note);

  }

  /* ============================================================ 07 用法 */
  function renderUse() {
    const U = D.use;
    $('#useClaim').innerHTML = fmt(U.claim);

    $('#lifeBody').innerHTML = U.rows.map((r, i) => `
      <tr>
        <td class="tid"><span class="ph2">${String(i + 1).padStart(2, '0')}</span>${esc(r.ph)}</td>
        <td>${fmt(r.act)}</td>
        <td class="mono dim2">${esc(r.slice)}</td>
        <td>${esc(r.out)}</td>
        <td class="mono dim2">${esc(r.at)}</td>
      </tr>`).join('');
    $('#useNote').innerHTML = fmt(U.useNote);

    const SY = U.symmetry;
    $('#symBox').innerHTML = `
      <div class="sym__p sym__p--l">
        <div class="sym__h"><span class="mono">LEFT</span>${esc(SY.left.h)}</div>
        <ul>${SY.left.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <p class="sym__r">${fmt(SY.left.rule)}</p>
      </div>
      <div class="sym__m" aria-hidden="true">
        <span class="sym__line"></span>
        <span class="sym__v">同一库</span>
      </div>
      <div class="sym__p sym__p--r">
        <div class="sym__h"><span class="mono">RIGHT</span>${esc(SY.right.h)}</div>
        <ul>${SY.right.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <p class="sym__r">${fmt(SY.right.rule)}</p>
      </div>`;
    $('#symNote').innerHTML = fmt(SY.rule);

    const RG = U.registry;
    $('#regHead').innerHTML = RG.head.map((h, i) => `<th${i === 0 ? ' class="c-id"' : i === 2 ? ' class="c-g2"' : ''}>${esc(h)}</th>`).join('');
    $('#regBody').innerHTML = RG.rows.map((r) => `
      <tr><td><b>${esc(r[0])}</b></td><td class="mono">${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('');
    $('#regNote').innerHTML = fmt(RG.note);

    $('#chainBox').innerHTML = U.chain.map((c, i) => `
      <div class="chain8__i">
        <span class="chain8__k">${esc(c.k)}</span>
        <b>${esc(c.v)}</b>
        <span class="chain8__t">${esc(c.tag)}</span>
      </div>`).join('');
    $('#chainNote').innerHTML = fmt(U.chainNote);

    $('#checkBox').innerHTML = U.checks.map((c) => `
      <div class="checks2__i"><b>${esc(c.k)}</b><p>${fmt(c.v)}</p></div>`).join('');

    $('#refList').innerHTML = D.refs.map((r) => `
      <li class="ref"><span class="ref__id mono">${esc(r.id)}</span>
        <div><p>${esc(r.t)}</p><em>${esc(r.tag)}</em></div></li>`).join('');
    $('#disclaimer').textContent = '本页为课程作业。IBEX-01 为小组设定的假想平台，全部参数、场景与风险评分均为教学推演，不代表任何实际装备的性能或使用方式。';
  }

  /* ============================================================ 骨架 */
  const SECS = [
    ['method', '01', '读法'], ['concept', '02', '概念'], ['layers', '03', '分层'],
    ['odc', '04', '条件'], ['scene', '05', '场景'], ['risk', '06', '风险'], ['use', '07', '用法']
  ];

  function initStats() {
    const n = D.layers.items.reduce((a, b) => a + b.rows.length, 0);
    const odc = D.odc.odd.rows.length + D.odc.sys.rows.length + D.odc.hum.rows.length + D.odc.oth.rows.length;
    const st = [
      { v: String(D.layers.items.length), k: '场景层', u: 'SCENE LAYERS' },
      { v: String(n), k: '场景要素', u: 'FACTORS' },
      { v: String(odc), k: 'ODC 判据', u: 'DESIGN CONDITIONS' },
      { v: String(D.risk.rows.length), k: '风险场景', u: 'RISK SCENARIOS' },
      { v: D.risk.classes.map((c) => c.n).join(':'), k: '风险分类 不足·误用·故障', u: 'PI / MIS / FLT', cls: 'iswide' },
      { v: String(D.use.rows.length), k: '生命周期阶段', u: 'LIFE CYCLE' }
    ];
    $('#stats').innerHTML = st.map((s) => `<div class="stat"><b${s.cls ? ` class="${s.cls}"` : ''}>${esc(s.v)}</b><span>${esc(s.k)}</span><i>${esc(s.u)}</i></div>`).join('');
  }

  function initRail() {
    const rail = $('#rail');
    if (!rail) return;
    rail.innerHTML = '<div class="rail__h">SECTION</div>' + SECS.map((s) =>
      `<a class="rail__i" href="#${s[0]}"><em>${s[1]}</em><span>${s[2]}</span><i></i></a>`).join('');

    const bar = $('#scrollbar');
    const links = $$('#nav a');
    const railLinks = $$('#rail .rail__i');
    const els = SECS.map((s) => document.getElementById(s[0]));

    function onScroll() {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      if (bar) bar.style.width = (p * 100).toFixed(2) + '%';

      let active = '';
      els.forEach((el) => { if (el && el.getBoundingClientRect().top <= 160) active = el.id; });
      links.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + active));
      railLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + active));

      const first = els[0], last = els[els.length - 1];
      const started = first && first.getBoundingClientRect().top < 0;
      const ended = last && last.getBoundingClientRect().bottom < 180;
      rail.classList.toggle('on', !!started && !ended);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const menuBtn = $('#menuBtn');
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
  }

  function initKeys() {
    if (!window.FX) return;
    SECS.forEach((s, i) => {
      FX.key(String(i + 1), `跳到「${s[2]}」`, () => {
        const el = document.getElementById(s[0]);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ================================================================== 启动 */
  function boot() {
    renderMethod();
    renderConcept();
    renderLayers();
    renderODC();
    renderScene();
    renderRisk();
    renderUse();
    initStats(); initRail(); initKeys();
    $('#footMeta').textContent = D.meta.version;
    if (window.FX && FX.reveal) FX.reveal('.card, .lyr, .grain__i, .srcs__i, .vote, .couple, .tl__i, .chain8__i, .checks2__i, .a2-lead__i, .a4spine__i, .a4form__i, .compose__i, .pick__i, .cls3__i, .ckind__i, .sym__p');
    if (window.FX && FX.spotlight) FX.spotlight('.card');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
