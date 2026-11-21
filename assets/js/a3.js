/* ============================================================================
   IBEX-01 · 作业 03 · 页面渲染与交互
   数据：assets/js/a3-data.js（CSE.a3）｜ 交互基座：fx.js（主题 / 入场 / 快捷键）
   ========================================================================== */
(function () {
  'use strict';
  const D = (window.CSE && window.CSE.a3) || null;
  if (!D) { console.warn('CSE.a3 未加载'); return; }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (v) => esc(v).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  /* ============================================================ 01 方法论 */
  function renderMethod() {
    $('#methodCards').innerHTML = D.method.map((m) => `
      <article class="a2-lead__i">
        <div class="a2-lead__n">${esc(m.no)} / ${esc(m.en)}</div>
        <h4>${esc(m.t)}</h4>
        <p>${fmt(m.p)}</p>
        <span class="out">产出：${esc(m.out)}</span>
      </article>`).join('');
  }

  /* ============================================================ 02 规格书 */
  let curItem = 0;

  function renderToc() {
    const doc = D.syrsDoc;
    $('#docSideH').innerHTML = `<span class="mono">${esc(doc.head.id)}</span>
      <b>${esc(doc.head.name)}</b><i>${esc(doc.head.en)}</i>`;
    $('#docToc').innerHTML = doc.items.map((it, i) => `
      <a href="#${esc(it.id)}" data-i="${i}" class="${i === curItem ? 'on' : ''}">
        <span class="n">${esc(it.no)}</span><span>${esc(it.t)}</span></a>`).join('');
    $$('#docToc a').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goItem(+a.dataset.i); }));
  }

  function renderBlock(b) {
    switch (b.t) {
      case 'p': return `<p class="blk">${fmt(b.v)}</p>`;
      case 'ul': return `<ul class="blk-ul blk">${b.v.map((x) => `<li>${fmt(x)}</li>`).join('')}</ul>`;
      case 'kv': return `<dl class="blk-kv blk">${b.v.map((kv) => `<dt>${esc(kv[0])}</dt><dd>${fmt(kv[1])}</dd>`).join('')}</dl>`;
      case 'note': return `<div class="blk-note blk">${fmt(b.v)}</div>`;
      case 'defs': return `<dl class="blk-defs blk">${b.v.map((kv) => `<div><dt>${esc(kv[0])}</dt><dd>${fmt(kv[1])}</dd></div>`).join('')}</dl>`;
      case 'table': return `<div class="blk-tbl blk"><table><thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      default: return '';
    }
  }

  function goItem(i) {
    const doc = D.syrsDoc;
    curItem = Math.max(0, Math.min(doc.items.length - 1, i));
    const it = doc.items[curItem];
    $('#docArt').innerHTML = `
      <h3><span class="no">${esc(it.no)}</span>${esc(it.t)}<i>${esc(it.en)}</i></h3>
      ${it.blocks.map(renderBlock).join('')}
      <div class="doc__nav">
        <button type="button" data-nav="-1" ${curItem === 0 ? 'disabled' : ''}>← 上一节</button>
        <span>${curItem + 1} / ${doc.items.length}</span>
        <button type="button" data-nav="1" ${curItem === doc.items.length - 1 ? 'disabled' : ''}>下一节 →</button>
      </div>`;
    $$('#docArt [data-nav]').forEach((b) => b.addEventListener('click', () => goItem(curItem + (+b.dataset.nav))));
    $$('#docToc a').forEach((a, k) => a.classList.toggle('on', k === curItem));
    $('#docMeta').innerHTML = `<b>${esc(doc.head.id)}</b><span class="doc__ver">${esc(D.meta.version)}</span>`;
    $('#docArt').scrollTop = 0;
  }

  function renderAcct() {
    $('#acctBody').innerHTML = D.syr.acct.map((r) => `
      <tr><td class="tid">${esc(r.k)}</td><td class="num">${esc(r.v)}</td><td>${esc(r.d)}</td></tr>`).join('');
  }

  let syrCat = 'ALL';
  function renderSyrFilters() {
    const items = D.syr.items;
    const chips = [{ id: 'ALL', n: '全部', en: 'ALL', c: items.length }]
      .concat(D.syr.cats.map((c) => ({ id: c.id, n: c.n, en: c.en, c: items.filter((i) => i.c === c.id).length })));
    $('#syrFilters').innerHTML = chips.map((c) => `
      <button type="button" data-cat="${esc(c.id)}" class="${c.id === syrCat ? 'on' : ''}">
        ${esc(c.n)}<em>${c.c}</em></button>`).join('');
    $$('#syrFilters button').forEach((b) => b.addEventListener('click', () => {
      syrCat = b.dataset.cat;
      renderSyrFilters(); renderSyr();
    }));
  }

  function renderSyr() {
    const rows = D.syr.items.filter((r) => syrCat === 'ALL' || r.c === syrCat);
    $('#syrBody').innerHTML = rows.map((r) => {
      const isNew = /^无来源/.test(r.src);
      return `<tr>
        <td class="tid">${esc(r.id)}</td>
        <td>${fmt(r.s)}</td>
        <td><span class="alloc">${esc(r.a)}</span></td>
        <td><span class="src${isNew ? ' new' : ''}">${esc(r.src)}</span></td>
        <td><span class="v-tag">${esc(r.v)}</span></td>
      </tr>`;
    }).join('');
  }

  /* -------------------------------------------------- 基线时间线·算术·改写 */
  function renderBase() {
    const steps = [
      { k: 'B0', t: 'StRS 40 条', s: '作业 02 · 相关方基线' },
      { k: 'B1', t: 'SyRS 41 条', s: '本次 · 转换后冻结' },
      { k: '×', t: '架构 + STPA', s: '20 UCA · 不产生基线' },
      { k: 'B2', t: 'SyRS 53 条', s: '回填 12 条 · 只增不改' }
    ];
    $('#baseLine').innerHTML = steps.map((x, i) => `
      <div class="base__i${i === 3 ? ' is-end' : ''}${x.k === '×' ? ' is-mid' : ''}">
        <em class="mono">${esc(x.k)}</em>
        <b>${esc(x.t)}</b>
        <span>${esc(x.s)}</span>
      </div>`).join('');
  }

  function renderBal() {
    const b = D.syr.balance;
    $('#balStrip').innerHTML = `
      <div class="bal__row">
        <span class="bal__c is-end"><b>${esc(b.lhs.v)}</b><i>${esc(b.lhs.k)}</i><em>${esc(b.lhs.s)}</em></span>
        ${b.ops.map((o) => `
          <span class="bal__op"><b>${esc(o.op)}${esc(o.v)}</b><i>${esc(o.k)}</i><em>${esc(o.s)}</em></span>`).join('')}
        <span class="bal__eq mono">=</span>
        <span class="bal__c is-end"><b>${esc(b.rhs.v)}</b><i>${esc(b.rhs.k)}</i><em>${esc(b.rhs.s)}</em></span>
      </div>
      <p class="bal__n">${fmt(b.note)}</p>`;
  }

  function renderRewrites() {
    $('#rwGrid').innerHTML = D.syr.rewrites.map((r) => `
      <article class="rw__i">
        <div class="rw__h"><span class="mono">${esc(r.id)}</span><i>${esc(r.bad_at)}</i></div>
        <p class="rw__bad"><em>初稿</em>${esc(r.bad)}</p>
        <p class="rw__good"><em>改后</em>${esc(r.good)}</p>
        <p class="rw__why">${esc(r.why)}</p>
      </article>`).join('');
  }

  function renderSyrHint() {
    const p = D.syr.items.reduce((m, x) => { m[x.p] = (m[x.p] || 0) + 1; return m; }, {});
    const pct = Math.round((p['必须'] / D.syr.items.length) * 100);
    $('#syrHint').innerHTML = `优先级：必须 ${p['必须']} · 应该 ${p['应该']} · 可能 ${p['可能']}（必须占 ${pct}%）。` +
      '<b>按 MoSCoW 的经验口径，Must 不宜超过六成</b>——本页偏高，说明部分「应该」被写成了「必须」；基线内先登记，待下一轮与相关方逐条确认，不在中途改动。';
  }

  /* ============================================================== 03 架构 */
  function renderViews() {
    $('#views').innerHTML = D.arch.views.map((v) => `
      <article class="card">
        <div class="card__no mono">${esc(v.no)} / ${esc(v.en)}</div>
        <h4>${esc(v.t)}</h4>
        <p>${esc(v.q)}</p>
        <span class="out">${esc(v.out)}</span>
        <span class="here">本页：${esc(v.here)}</span>
      </article>`).join('');
  }

  function renderCA() {
    $('#caBody').innerHTML = D.arch.ca.map((r) => `
      <tr>
        <td class="tid">${esc(r.id)}</td>
        <td><span class="alloc">${esc(r.from)} → ${esc(r.to)}</span></td>
        <td>${esc(r.act)}</td>
        <td><span class="src">${esc(r.fb)}</span></td>
        <td><span class="tid">${esc(r.ref)}</span></td>
      </tr>`).join('');
  }

  function renderAlloc() {
    $('#allocBody').innerHTML = D.arch.alloc.map((r) => `
      <tr>
        <td class="tid">${esc(r.sys)}</td>
        <td>${esc(r.n)}</td>
        <td class="num">${esc(r.syr)}</td>
        <td><span class="src">${esc(r.ca)}</span></td>
        <td><span class="src">${esc(r.ifc)}</span></td>
      </tr>`).join('');

    $('#ifaceList').innerHTML = D.arch.ifaces.map((f) => `
      <li><b><em>${esc(f.id)}</em>${esc(f.n)}接口</b>
        <span>${esc(f.c)}</span>
        <span>${esc(f.lim)}</span></li>`).join('');
  }

  /* ============================================================== 04 STPA */
  function renderSteps() {
    $('#stpaSteps').innerHTML = D.stpa.steps.map((s) => `
      <div class="step">
        <div class="step__n">${esc(s.no)}</div>
        <h4>${esc(s.t)}</h4>
        <p>${esc(s.p)}</p>
        <div class="step__o">${esc(s.out)}</div>
      </div>`).join('');
  }

  function renderTrip() {
    $('#lossList').innerHTML = D.stpa.losses.map((l) => `
      <li><span class="k">${esc(l.id)}</span><div><b>${esc(l.t)}</b><span>${esc(l.d)}</span></div></li>`).join('');
    $('#hazList').innerHTML = D.stpa.hazards.map((h) => `
      <li><span class="k">${esc(h.id)}</span><div><b>${esc(h.t)}</b><span>${esc(h.d)}</span><em>→ ${esc(h.l)}</em></div></li>`).join('');
    $('#scList').innerHTML = D.stpa.scs.map((s) => `
      <li><span class="k">${esc(s.id)}</span><div><b>${esc(s.t)}</b><em>约束 ${esc(s.h)}</em></div></li>`).join('');
  }

  const TYPES = [
    { id: 'ALL', n: '全部' },
    { id: 'N', n: '未提供' },
    { id: 'P', n: '提供了' },
    { id: 'T', n: '时机 / 顺序' },
    { id: 'D', n: '持续 / 停止' }
  ];
  const TYPE_NAME = { N: '未提供', P: '提供了', T: '时机错误', D: '持续过久' };
  let ucaType = 'ALL';

  function renderUcaFilters() {
    $('#ucaFilters').innerHTML = TYPES.map((t) => {
      const n = t.id === 'ALL' ? D.stpa.uca.length : D.stpa.uca.filter((u) => u.t === t.id).length;
      return `<button type="button" data-t="${esc(t.id)}" class="${t.id === ucaType ? 'on' : ''}">${esc(t.n)}<em>${n}</em></button>`;
    }).join('');
    $$('#ucaFilters button').forEach((b) => b.addEventListener('click', () => {
      ucaType = b.dataset.t;
      renderUcaFilters(); renderUca();
    }));
  }

  function renderUca() {
    const rows = D.stpa.uca.filter((u) => ucaType === 'ALL' || u.t === ucaType);
    $('#ucaBody').innerHTML = rows.map((u) => `
      <tr>
        <td class="tid">${esc(u.id)}</td>
        <td><span class="tid">${esc(u.ca)}</span></td>
        <td><span class="type type--${esc(u.t)}">${esc(TYPE_NAME[u.t])}</span></td>
        <td>${esc(u.ctx)}<br><span class="src">${esc(u.note)}</span></td>
        <td><span class="tid">${esc(u.hz)}</span></td>
      </tr>`).join('');
  }

  function renderCauses() {
    const fams = [
      { k: 'ALG', t: '控制器算法不完备', en: 'ALGORITHM', d: '决策规则漏了维度、状态机缺一档、序列可并发' },
      { k: 'FB', t: '反馈缺失 / 延迟 / 自证', en: 'FEEDBACK', d: '读的是指令而非结果、更新率不匹配、只取瞬时值' },
      { k: 'ACT', t: '执行器失效', en: 'ACTUATOR', d: '制动器掉电保持、功率分配绕过健康位' },
      { k: 'PROC', t: '被控过程扰动', en: 'PROCESS', d: '地形、通信环境、外部输入造成的行为偏移' }
    ];
    $('#causeGrid').innerHTML = fams.map((f) => {
      const list = D.stpa.causes.filter((c) => c.k === f.k);
      return `<div class="cause">
        <div class="cause__h"><b>${esc(f.t)}</b><em>${esc(f.en)}</em><i>${list.length} 条</i></div>
        <ul>${list.map((c) => `<li><span class="k">${esc(c.id)}</span>
          <b>${esc(c.uca)}</b> · ${esc(c.t)}
          <span class="fix">${esc(c.fix)}</span></li>`).join('')}</ul>
      </div>`;
    }).join('');
  }

  /* ============================================================== 05 安全 */
  const UCA_BY_ID = {};
  D.stpa.uca.forEach((u) => { UCA_BY_ID[u.id] = u; });
  const REL_CLS = { '新增': 'rel--new', '细化': 'rel--refine', '继承': 'rel--inherit' };
  const COV = {};   /* UCA → [SR] */
  D.sr.items.forEach((s) => s.cov.forEach((u) => { (COV[u] = COV[u] || []).push(s.id); }));

  function srHazards(s) {
    const set = [];
    s.cov.forEach((u) => {
      const h = UCA_BY_ID[u];
      if (!h) return;
      h.hz.split(',').forEach((k) => { k = k.trim(); if (k && set.indexOf(k) < 0) set.push(k); });
    });
    return set.sort().join(' · ');
  }

  function renderSR() {
    $('#srBody').innerHTML = D.sr.items.map((r) => `
      <tr>
        <td class="tid">${esc(r.id)}</td>
        <td>${esc(r.s)}</td>
        <td><span class="uca-ref">${r.cov.map(esc).join(' · ')}</span></td>
        <td><span class="tid">${esc(srHazards(r))}</span></td>
        <td><span class="rel ${REL_CLS[r.rel] || 'rel--inherit'}">${esc(r.rel)}</span>${r.src && r.src !== '—' ? `<span class="rel-src">${esc(r.src)}</span>` : ''}</td>
        <td><span class="src">${esc(r.at)}</span></td>
      </tr>`).join('');

    $('#mechGrid').innerHTML = D.sr.mech.map((m) => `
      <article class="card">
        <div class="no">${esc(m.no)}</div>
        <h4>${esc(m.t)}</h4>
        <p>${fmt(m.p)}</p>
      </article>`).join('');

    $('#mechRiskBody').innerHTML = D.sr.mech.map((m) => `
      <tr>
        <td class="tid">${esc(m.no)}<br><span class="src">${esc(m.t)}</span></td>
        <td>${esc(m.f)}</td>
        <td>${esc(m.b)}</td>
      </tr>`).join('');

    $('#degradeBody').innerHTML = D.sr.degrade.map((d) => `
      <tr>
        <td class="tid">${esc(d.mode)}</td>
        <td>${esc(d.cond)}</td>
        <td>${esc(d.cap)}</td>
        <td><span class="src">${esc(d.exit)}</span></td>
      </tr>`).join('');
  }

  /* ---------------------------------------------------------- 覆盖矩阵 */
  function renderCov() {
    const srs = D.sr.items, ucas = D.stpa.uca;
    const head = `<div class="cov__grid" id="covGrid">
      <span class="cov__c0 mono">UCA \\ SR</span>
      ${srs.map((s) => `<button type="button" class="cov__ch" data-sr="${esc(s.id)}" title="${esc(s.id)}">${esc(s.id.slice(3))}</button>`).join('')}
      ${ucas.map((u) => `
        <button type="button" class="cov__rh" data-uca="${esc(u.id)}" title="${esc(u.id)} · ${esc(u.ctx)}">
          <em>${esc(u.id.slice(4))}</em><i>${esc(u.t)}</i>
        </button>
        ${srs.map((s) => `<span class="cov__cell${s.cov.indexOf(u.id) > -1 ? ' on' : ''}" data-uca="${esc(u.id)}" data-sr="${esc(s.id)}"></span>`).join('')}
      `).join('')}
    </div>`;

    const single = ucas.filter((u) => (COV[u.id] || []).length === 1).length;
    const dbl = ucas.filter((u) => (COV[u.id] || []).length === 2).length;
    let heavy = srs[0], hmax = 0;
    srs.forEach((s) => { if (s.cov.length > hmax) { hmax = s.cov.length; heavy = s; } });

    $('#covBox').innerHTML = `${head}
      <div class="cov__foot">
        <span><b>${ucas.length}/${ucas.length}</b> 覆盖</span>
        <span><b>${single}</b> 单点覆盖</span>
        <span><b>${dbl}</b> 双覆盖</span>
        <span><b>${heavy.id}</b> 最重 · 管 ${hmax} 条</span>
      </div>`;

    const hint = $('#covHint');
    const dft = `<b>怎么读：</b>一格 = 这条 SR 管辖这条 UCA。最重的 ${heavy.id} 一条管 ${hmax} 条——它必须逐行验证，否则一次「表看起来对」就放过 ${hmax} 种失效。`;
    hint.innerHTML = dft;

    $('#covBox').addEventListener('click', (e) => {
      const t = e.target.closest('[data-uca],[data-sr]');
      if (!t) { return; }
      const u = t.dataset.uca, s = t.dataset.sr;
      $$('#covBox .cov__cell').forEach((c) => {
        c.classList.toggle('hl-r', !!u && c.dataset.uca === u);
        c.classList.toggle('hl-c', !!s && c.dataset.sr === s);
      });
      if (u) {
        const list = COV[u] || [];
        hint.innerHTML = `<b>${esc(u)}</b>（${esc(UCA_BY_ID[u].ctx)}）→ 由 ${list.map(esc).join('、') || '无人管辖'} 管辖${list.length === 1 ? '，<b>单点覆盖</b>' : ''}。`;
      } else {
        const sr = srs.find((x) => x.id === s);
        hint.innerHTML = `<b>${esc(s)}</b>（${esc(sr.rel)}）管辖 ${sr.cov.map(esc).join('、')}，共 ${sr.cov.length} 条。`;
      }
    });

    $('#mergeList').innerHTML = D.sr.merge.map((m) => `<li>${fmt(m)}</li>`).join('');
  }

  /* ============================================================== 06 追溯 */
  let chainIdx = 0;

  function renderChainPick() {
    $('#chainPick').innerHTML = D.trace.chain.map((c, i) => `
      <button type="button" data-i="${i}" class="${i === chainIdx ? 'on' : ''}">${esc(c.stR)}</button>`).join('');
    $$('#chainPick button').forEach((b) => b.addEventListener('click', () => {
      chainIdx = +b.dataset.i;
      renderChainPick(); renderChain();
    }));
  }

  function renderChain() {
    const c = D.trace.chain[chainIdx];
    const nodes = [
      { k: 'STAKEHOLDER', t: '相关方需求', v: c.stR, s: '作业 02 · StRS' },
      { k: 'SYSTEM', t: '系统需求', v: c.syR, s: '本次 · SyRS' },
      { k: 'ALLOCATION', t: '承担系统', v: c.sys, s: '作业 01 · S 编号' },
      { k: 'CONTROL', t: '控制动作', v: c.ca, s: '本次 · 控制结构' },
      { k: 'UNSAFE', t: '不安全行为', v: c.uca, s: '本次 · STPA' },
      { k: 'SAFETY', t: '安全需求', v: c.sr, s: '本次 · SR 集' }
    ];
    $('#chainView').innerHTML = nodes.map((n, i) => `
      <div class="chain__n${i === nodes.length - 1 ? ' is-end' : ''}">
        <em>${esc(n.k)}</em><b>${esc(n.v)}</b><span>${esc(n.t)} · ${esc(n.s)}</span>
      </div>`).join('');
    $('#chainNote').innerHTML = `<b>读法：</b>${esc(c.stR)} 在 ${esc(c.syR)} 中被转成系统口径，落到 ${esc(c.sys)}；
      其控制关系是 ${esc(c.ca)}，一旦该动作在特定语境下失效即构成 ${esc(c.uca)}，
      最终由 ${esc(c.sr)} 在架构上兜住。链条上任一环改名或删除，其余五环必须同步——这就是不重排编号的意义。
      <span class="chain__why"><b>这条链的争点：</b>${fmt(c.note || '')}</span>`;
  }

  function renderImpact() {
    $('#impactBody').innerHTML = D.trace.impact.map((r) => `
      <tr>
        <td class="tid">${esc(r.chg)}</td>
        <td><span class="src">${esc(r.syr)}</span></td>
        <td>${esc(r.redo)}</td>
        <td><span class="rel ${/^是/.test(r.stpa) ? 'rel--new' : 'rel--inherit'}">${esc(r.stpa)}</span></td>
      </tr>`).join('');
  }

  function renderChecks() {
    $('#checkGrid').innerHTML = D.trace.checks.map((c, i) => `
      <article class="card">
        <div class="card__no mono">0${i + 1}</div>
        <h4>${esc(c.t)}</h4>
        <p>${esc(c.d)}</p>
      </article>`).join('');
  }

  function renderRefs() {
    $('#refsList').innerHTML = D.refs.map((r) => `
      <li class="ref"><span class="ref__id">${esc(r.id)}</span>
        <div><p>${esc(r.t)}</p><em>${esc(r.tag)}</em></div></li>`).join('');
    $('#disclaimer').textContent = D.disclaimer;
  }

  /* ============================================================ 页面骨架 */
  const SECS = [
    ['method', '01', '读法'], ['syrs', '02', '规格书'], ['arch', '03', '架构'],
    ['stpa', '04', 'STPA'], ['safety', '05', '安全'], ['trace', '06', '追溯']
  ];

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

  function initStats() {
    const st = [
      { v: String(D.syr.items.length), k: '系统需求 SyR', u: 'SYSTEM REQUIREMENTS' },
      { v: String(D.arch.ca.length), k: '控制动作 CA', u: 'CONTROL ACTIONS' },
      { v: String(D.stpa.uca.length), k: '不安全控制行为', u: 'UCA' },
      { v: String(D.sr.items.length), k: '安全需求 SR', u: 'SAFETY REQUIREMENTS' },
      { v: '53', k: '基线条目', u: 'SyRS B2 = 41 + 12' }
    ];
    $('#stats').innerHTML = st.map((s) => `<div class="stat"><b>${esc(s.v)}</b><span>${esc(s.k)}</span><i>${esc(s.u)}</i></div>`).join('');
  }

  function initKeys() {
    if (!window.FX) return;
    SECS.forEach((s, i) => {
      FX.key(String(i + 1), `跳到「${s[2]}」`, () => {
        const el = document.getElementById(s[0]);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    FX.key('←', '上一条需求章节', () => goItem(curItem - 1));
    FX.key('→', '下一条需求章节', () => goItem(curItem + 1));
  }

  /* ================================================================== 启动 */
  function boot() {
    renderMethod();
    renderBase();
    renderToc(); goItem(0);
    renderAcct(); renderBal(); renderRewrites();
    renderSyrFilters(); renderSyr(); renderSyrHint();
    renderViews(); renderCA(); renderAlloc();
    renderSteps(); renderTrip();
    renderUcaFilters(); renderUca(); renderCauses();
    renderSR(); renderCov();
    renderChainPick(); renderChain(); renderImpact(); renderChecks();
    renderRefs();
    initStats(); initRail(); initKeys();
    if (window.FX && FX.reveal) FX.reveal('.card, .step, .trip__col, .cause, .chain__n, .doc, .csc, .saf, .base, .bal, .rw__i, .cov, .merge');
    if (window.FX && FX.spotlight) FX.spotlight('.card');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
