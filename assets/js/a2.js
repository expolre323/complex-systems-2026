/* ============================================================================
   IBEX-01 · 作业 02 · 页面渲染与交互
   数据：assets/js/a2-data.js（CSE.a2）｜ 交互基座：fx.js（主题 / 入场 / 快捷键）
   ========================================================================== */
(function () {
  'use strict';
  const D = (window.CSE && window.CSE.a2) || null;
  if (!D) { console.warn('CSE.a2 未加载'); return; }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* 行内格式：**加粗** */
  const fmt = (v) => esc(v).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ');

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

  /* ===================================================== 表4-1 / 4-5 对照 */
  function renderOutline() {
    const col = (o, title, en, badge) => `<div class="ol-col">
      <div class="ol-col__h"><b>${esc(title)}</b><span>${esc(en)}</span><em>${esc(badge)}</em></div>
      <ul class="ol-list">${o.map((c) => `<li>
        <i>${esc(c.no)}</i><div><b>${esc(c.t)}</b>${c.subs.length ? `<p>${c.subs.map(esc).join(' · ')}</p>` : ''}</div>
      </li>`).join('')}</ul></div>`;

    $('#outlineCmp').innerHTML =
      col(D.outline.brs, '业务需求规格说明（BRS）', 'TABLE 4-1', '8 章') +
      col(D.outline.strs, '相关方需求规格说明（StRS）', 'TABLE 4-5', '8 章');

    $('#outlineDiff').innerHTML = `<div class="table-wrap ol-diff">
      <table class="tbl">
        <thead><tr><th style="width:96px">维度</th><th>BRS（表 4-1）</th><th>StRS（表 4-5）</th></tr></thead>
        <tbody>${D.outline.diff.map((r) => `<tr>
          <td class="tid">${esc(r.k)}</td><td>${esc(r.brs)}</td><td>${esc(r.strs)}</td>
        </tr>`).join('')}</tbody>
      </table></div>`;
  }

  /* ========================================================== 02 文档阅读器 */
  const DOCS = { brs: D.brs, strs: D.strsDoc };
  let curDoc = 'brs';
  let curItem = 0;

  function docToc() {
    const doc = DOCS[curDoc];
    $('#docToc').innerHTML = doc.items.map((it, i) => {
      const lv1 = !it.no.includes('.');
      return `<a href="#${esc(it.id)}" data-i="${i}" class="${lv1 ? 'lv1' : 'lv2'} ${i === curItem ? 'on' : ''}">
        <span class="n">${esc(it.no)}</span><span>${esc(it.t)}</span></a>`;
    }).join('');
    $$('#docToc a').forEach((a) => {
      a.addEventListener('click', (e) => { e.preventDefault(); goItem(+a.dataset.i); });
    });
  }

  function renderBlock(b) {
    switch (b.t) {
      case 'p': return `<p class="blk">${fmt(b.v)}</p>`;
      case 'ul': return `<ul class="blk-ul blk">${b.v.map((x) => `<li>${fmt(x)}</li>`).join('')}</ul>`;
      case 'kv': return `<dl class="blk-kv blk">${b.v.map((kv) => `<dt>${esc(kv[0])}</dt><dd>${fmt(kv[1])}</dd>`).join('')}</dl>`;
      case 'note': return `<div class="blk-note blk">${fmt(b.v)}</div>`;
      case 'defs': return `<dl class="blk-defs blk">${b.v.map((kv) => `<div><dt>${esc(kv[0])}</dt><dd>${fmt(kv[1])}</dd></div>`).join('')}</dl>`;
      case 'flow': return `<div class="blk-flow blk">${b.v.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`;
      case 'table': return `<div class="blk-tbl blk"><table><thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      default: return '';
    }
  }

  function goItem(i) {
    const doc = DOCS[curDoc];
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
    $$('#docArt [data-nav]').forEach((b) => b.addEventListener('click', () => goItem(curItem + Number(b.dataset.nav))));
    $$('#docToc a').forEach((a) => a.classList.toggle('on', +a.dataset.i === curItem));
    const art = $('#docArt');
    if (art) art.scrollTop = 0;
  }

  function renderDoc() {
    const doc = DOCS[curDoc];
    $('#docMeta').innerHTML = `<b>${esc(doc.head.id)}</b><span class="doc__ver">${esc(doc.head.basis)} · ${esc(D.meta.version)}</span>`;
    $('#docSideH').innerHTML = `<span class="mono">${esc(curDoc === 'brs' ? 'BRS' : 'StRS')}</span>
      <b>${esc(doc.head.name)}</b><i>${esc(doc.head.owner)}</i>`;
    $$('#docTabs button').forEach((b) => b.classList.toggle('on', b.dataset.doc === curDoc));
    docToc();
    goItem(curItem);
  }

  function initDoc() {
    $$('#docTabs button').forEach((b) => {
      b.addEventListener('click', () => {
        if (b.dataset.doc === curDoc) return;
        curDoc = b.dataset.doc;
        curItem = 0;
        renderDoc();
      });
    });
    renderDoc();
  }

  /* ==================================================== 03 业务 / 任务需求 */
  function renderBiz() {
    $('#pains').innerHTML = D.biz.pains.map((p) => `
      <article class="pain">
        <div class="pain__k">${esc(p.k)} / PROBLEM</div>
        <h4>${esc(p.t)}</h4>
        <p>${fmt(p.v)}</p>
        <div class="pain__m">现状 · <b>${esc(p.m)}</b></div>
      </article>`).join('');

    $('#brq').innerHTML = D.biz.brq.map((b) => `
      <div class="brq__i">
        <div class="id">${esc(b.id)}</div>
        <h5>${esc(b.t)}</h5>
        <p>${fmt(b.d)}</p>
        <span class="src">验证：${esc(b.v)} · 主张者：${esc(b.src)}</span>
      </div>`).join('');

    $('#trBody').innerHTML = D.biz.trs.map((t) => `
      <tr>
        <td class="tid">${esc(t.id)}</td>
        <td><b>${esc(t.t)}</b></td>
        <td>${fmt(t.d)}</td>
        <td class="num">${esc(t.m)}</td>
        <td><span class="tagv">${esc(t.v)}</span></td>
        <td class="num">${esc(t.src)}</td>
      </tr>`).join('');

    $('#smart').innerHTML = D.biz.smart.map((s) => `
      <div class="smart__i">
        <div class="smart__k">${esc(s.k)}</div>
        <b>${esc(s.t)}</b>
        <p>${fmt(s.v)}</p>
      </div>`).join('');
  }

  /* ============================================================= 04 ConOps */
  let curStage = 0;
  function renderCon() {
    const c = D.conops;
    $('#conTabs').innerHTML = c.stages.map((s, i) => `
      <button type="button" class="con__tab ${i === curStage ? 'on' : ''}" data-i="${i}">
        <span class="mono">${esc(s.id)}</span>${esc(s.name)}<em class="mono" style="font-style:normal;opacity:.7">${esc(s.span)}</em>
      </button>`).join('');
    $$('#conTabs button').forEach((b) => b.addEventListener('click', () => { curStage = +b.dataset.i; renderCon(); }));

    const s = c.stages[curStage];
    $('#conDesc').textContent = s.desc;
    const head = `<div class="con__row head"><div>角色</div><div>该阶段的动作</div><div>依赖的平台输出</div></div>`;
    const rows = s.rows.map((r) => `<div class="con__row swap">
      <div>${esc(r[0])}</div><div>${esc(r[1])}</div><div>${esc(r[2])}</div></div>`).join('');
    $('#conGrid').innerHTML = head + rows;

    $('#conKv').innerHTML = `<div class="panel"><h4 class="panel__h">需要 · 目的 · 目标 · 使命</h4>
      <dl class="blk-kv blk">
        <dt>需要</dt><dd>${esc(c.need)}</dd>
        <dt>目的</dt><dd>${esc(c.purpose)}</dd>
        <dt>使命</dt><dd>${esc(c.mission)}</dd>
      </dl>
      <ul class="blk-ul blk" style="margin-top:14px">${c.goals.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></div>`;

    $('#conRoles').innerHTML = `<div class="panel"><h4 class="panel__h">角色与职责</h4>
      <dl class="blk-kv blk">${c.roles.map((r) => `<dt>${esc(r.k)}</dt><dd><b>${esc(r.v)}</b> — ${esc(r.d)}</dd>`).join('')}</dl></div>`;

    $('#conAssume').innerHTML = `<div class="panel panel--warn"><h4 class="panel__h">运行假设（都曾是导致失败的假设）</h4>
      <ul class="blk-ul blk">${c.assumptions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>`;

    $('#conWhatIf').innerHTML = `<div class="table-wrap"><table class="tbl">
      <thead><tr><th style="width:230px">如果……</th><th>组织与系统应</th><th style="width:90px">依据</th></tr></thead>
      <tbody>${c.whatif.map((w) => `<tr><td>${esc(w.c)}</td><td>${esc(w.r)}</td><td class="num">${esc(w.k)}</td></tr>`).join('')}</tbody>
    </table></div>`;
  }

  /* ============================================================= 05 OpsCon */
  const GROUP_COLOR = { A: 'var(--accent)', B: 'var(--info)', C: 'var(--accent-2)', D: 'var(--warn)' };

  function renderSM() {
    const o = D.opscon;
    const byId = {};
    o.nodes.forEach((n) => { byId[n.id] = n; });

    const marker = `<defs>
      <marker id="arw" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 1 L7 4 L0 7 z" fill="var(--line-3)"/></marker>
      <marker id="arwD" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 1 L7 4 L0 7 z" fill="var(--warn)"/></marker>
    </defs>`;

    /* 只画主流程（向右）与降级路径；反向转移写在各状态说明里 */
    const DRAWN = ['M1>M2', 'M2>M3', 'M3>M4', 'M3>M5', 'M3>M6', 'M5>M7',
      'M3>DL', 'M3>DN', 'M4>DG', 'M5>DP'];
    let edges = '';

    function seg(p1, p2, cls, label, lx, ly) {
      const [x1, y1] = p1, [x2, y2] = p2;
      let d;
      if (Math.abs(y1 - y2) < 2) {
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
      } else if (Math.abs(x1 - x2) < 2) {
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
      } else {
        const cx = (x1 + x2) / 2;
        d = `M ${x1} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`;
      }
      const mk = cls.includes('deg') ? 'arwD' : 'arw';
      return `<path class="sm__edge ${cls}" d="${d}" marker-end="url(#${mk})"/>` +
        (label ? `<text class="sm__el" x="${lx}" y="${ly}" text-anchor="middle">${esc(label)}</text>` : '');
    }

    o.edges.forEach((e) => {
      const a = byId[e.f], b = byId[e.t];
      if (!a || !b) return;
      if (DRAWN.indexOf(e.f + '>' + e.t) < 0) return;
      if (e.k === 'deg') {
        const p1 = [a.x + a.w / 2, a.y + a.h];
        const p2 = [b.x + b.w / 2, b.y];
        edges += seg(p1, p2, 'sm__edge--deg', e.l, p2[0], p2[1] - 9);
      } else if (Math.abs(a.y - b.y) < 2) {
        edges += seg([a.x + a.w, a.y + a.h / 2], [b.x - 4, b.y + b.h / 2], '', e.l, (a.x + a.w + b.x) / 2, a.y + a.h / 2 - 8);
      } else {
        const vert = Math.abs(a.x - b.x) < 2;
        const lx = vert ? a.x + a.w / 2 - 30 : a.x + a.w / 2 + 26;
        edges += seg([a.x + a.w / 2, a.y + a.h], [b.x + b.w / 2, b.y - 4], '', e.l, lx, a.y + a.h + 18);
      }
    });

    /* M7 回收 → M1 运输 的回环走顶部通道 */
    const m1 = byId.M1, m7 = byId.M7;
    const ry = 44, lx = m7.x + m7.w / 2, rx = m1.x + m1.w / 2;
    edges += `<path class="sm__edge" d="M ${lx} ${m7.y} L ${lx} ${ry} L ${rx} ${ry} L ${rx} ${m1.y - 4}" marker-end="url(#arw)" fill="none"/>`;
    edges += `<text class="sm__el" x="${(lx + rx) / 2}" y="${ry - 5}" text-anchor="middle">入库 · 换电 · 数据卸载</text>`;

    const nodes = o.nodes.map((n) => `<g class="sm__node ${n.k === 'deg' ? 'dg' : ''}" data-id="${esc(n.id)}" tabindex="0" role="button" aria-label="${esc(n.t)}">
      <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="6"/>
      <text x="${n.x + n.w / 2}" y="${n.y + (n.k === 'deg' ? 24 : 25)}" text-anchor="middle">${esc(n.t)}</text>
      <text class="en" x="${n.x + n.w / 2}" y="${n.y + (n.k === 'deg' ? 34 : 36)}" text-anchor="middle">${esc(n.en)}</text>
    </g>`).join('');

    $('#smSvg').innerHTML = marker +
      `<text class="sm__el" x="44" y="26">MAIN FLOW →</text>` +
      `<text class="sm__el" x="44" y="254">DEGRADED MODES（虚线）</text>` +
      `<line x1="40" y1="240" x2="676" y2="240" stroke="var(--line)" stroke-dasharray="2 4"/>` +
      edges + nodes;

    $$('#smSvg .sm__node').forEach((g) => {
      const pick = () => showMode(g.dataset.id);
      g.addEventListener('click', pick);
      g.addEventListener('mouseenter', pick);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    showMode('M3');
  }

  function showMode(id) {
    const m = D.opscon.modes.find((x) => x.id === id);
    if (!m) return;
    $$('#smSvg .sm__node').forEach((g) => g.classList.toggle('on', g.dataset.id === id));
    $('#smDetail').innerHTML = `
      <div>
        <h5><span class="tid">${esc(m.id)}</span>${esc(m.t)}<span class="mono dim">${esc(m.en)}</span></h5>
        <p>${esc(m.act)}</p>
      </div>
      <div>
        <dt>进入条件</dt><dd>${esc(m.enter)}</dd>
        <dt>退出条件</dt><dd>${esc(m.exit)}</dd>
      </div>
      <div>
        <dt>关联</dt><dd class="rel">${esc(m.rel)}</dd>
        <dt>提示</dt><dd>悬停其他状态可切换 · 点击锁定</dd>
      </div>`;
  }

  function renderOps() {
    const o = D.opscon;
    renderSM();

    $('#opsModes').innerHTML = o.modes.map((m) => `
      <div class="mode-c">
        <div class="id">${esc(m.id)}</div>
        <h5>${esc(m.t)}</h5>
        <p>${esc(m.act)}</p>
      </div>`).join('');

    $('#scenList').innerHTML = o.scenarios.map((s, i) => `
      <button type="button" class="${i === 0 ? 'on' : ''}" data-i="${i}">
        <span class="sid">${esc(s.id)}</span><span>${esc(s.t)}</span>
      </button>`).join('');
    $$('#scenList button').forEach((b) => b.addEventListener('click', () => {
      $$('#scenList button').forEach((x) => x.classList.toggle('on', x === b));
      renderScen(+b.dataset.i);
    }));
    renderScen(0);

    $('#opsWhatIf').innerHTML = `<div class="table-wrap"><table class="tbl">
      <thead><tr><th style="width:250px">What-if</th><th>平台应做的动作</th><th>为什么这样规定</th></tr></thead>
      <tbody>${o.whatif.map((w) => `<tr><td>${esc(w.c)}</td><td>${esc(w.e)}</td><td>${esc(w.why)}</td></tr>`).join('')}</tbody>
    </table></div>`;
  }

  function renderScen(i) {
    const s = D.opscon.scenarios[i];
    $('#scenBody').innerHTML = `
      <h4>${esc(s.t)}</h4>
      <div class="meta">${esc(s.id)} · 支撑 ${esc(s.o)}</div>
      <p style="font-size:12.5px;color:var(--fg-3);margin-bottom:14px">前置条件：${esc(s.pre)}</p>
      <ol>${s.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
      <p class="ok">成功判据：${esc(s.ok)}</p>
      <p class="ifc">涉及接口：${esc(s.iface)}</p>`;
  }

  /* =========================================================== 06 相关方 */
  const SW = 660, SH = 420, PAD = { l: 74, r: 26, t: 30, b: 56 };
  const xOf = (v) => PAD.l + (v / 100) * (SW - PAD.l - PAD.r);
  const yOf = (v) => SH - PAD.b - (v / 100) * (SH - PAD.t - PAD.b);
  const TX = 65, TY = 60;                 // 象限阈值
  const priOf = (pw, it) => (pw >= TX && it >= TY) ? 'P1' : (pw >= TX ? 'P2' : (it >= TY ? 'P3' : 'P4'));
  const PRI_NAME = { P1: '关键 · 深度参与', P2: '保持满意', P3: '保持知情', P4: '监测' };

  let curStk = 'A3';

  function allStake() {
    const out = [];
    D.stake.groups.forEach((g) => g.items.forEach((it) => out.push(Object.assign({ g: g.id }, it))));
    return out;
  }

  function renderQuad() {
    const list = allStake();
    let s = '';
    /* 象限底色 + 标签 */
    const xm = xOf(TX), ym = yOf(TY);
    s += `<rect x="${PAD.l}" y="${PAD.t}" width="${xm - PAD.l}" height="${ym - PAD.t}" fill="var(--fg)" opacity=".014"/>
          <rect x="${xm}" y="${PAD.t}" width="${xOf(100) - xm}" height="${ym - PAD.t}" fill="var(--warn)" opacity=".035"/>
          <rect x="${PAD.l}" y="${ym}" width="${xm - PAD.l}" height="${yOf(0) - ym}" fill="var(--fg)" opacity=".03"/>
          <rect x="${xm}" y="${ym}" width="${xOf(100) - xm}" height="${yOf(0) - ym}" fill="var(--fg)" opacity=".014"/>`;

    /* 网格 */
    for (let v = 0; v <= 100; v += 25) {
      s += `<line x1="${xOf(v)}" y1="${PAD.t}" x2="${xOf(v)}" y2="${yOf(0)}" stroke="var(--line)" stroke-width=".6"/>
            <line x1="${PAD.l}" y1="${yOf(v)}" x2="${xOf(100)}" y2="${yOf(v)}" stroke="var(--line)" stroke-width=".6"/>`;
    }
    /* 轴 */
    s += `<line x1="${PAD.l}" y1="${yOf(0)}" x2="${xOf(100)}" y2="${yOf(0)}" stroke="var(--line-3)" stroke-width="1"/>
          <line x1="${PAD.l}" y1="${PAD.t}" x2="${PAD.l}" y2="${yOf(0)}" stroke="var(--line-3)" stroke-width="1"/>
          <line x1="${xm}" y1="${PAD.t}" x2="${xm}" y2="${yOf(0)}" stroke="var(--accent-line)" stroke-dasharray="4 4" stroke-width=".9"/>
          <line x1="${PAD.l}" y1="${ym}" x2="${xOf(100)}" y2="${ym}" stroke="var(--accent-line)" stroke-dasharray="4 4" stroke-width=".9"/>`;

    s += `<text x="${xOf(100)}" y="${yOf(0) + 26}" text-anchor="end" font-size="9.5" fill="var(--fg-3)" font-family="var(--mono)" letter-spacing="1.5">影响力 INFLUENCE →</text>
          <text x="${PAD.l - 14}" y="${PAD.t + 4}" text-anchor="end" font-size="9.5" fill="var(--fg-3)" font-family="var(--mono)" letter-spacing="1.5">利益 ↑</text>`;

    /* 象限名 */
    const q = [
      [PAD.l + 10, PAD.t + 16, '低影响 · 高利益', '保持知情', 'start'],
      [xOf(100) - 10, PAD.t + 16, '高影响 · 高利益', '关键 · 深度参与', 'end'],
      [PAD.l + 10, yOf(0) - 10, '低影响 · 低利益', '监测', 'start'],
      [xOf(100) - 10, yOf(0) - 10, '高影响 · 低利益', '保持满意', 'end']
    ];
    q.forEach((t) => {
      s += `<text x="${t[0]}" y="${t[1]}" text-anchor="${t[4]}" font-size="8.5" font-family="var(--mono)" letter-spacing="1" fill="var(--fg-3)" opacity=".85">${t[2]}</text>
            <text x="${t[0]}" y="${t[1] + 13}" text-anchor="${t[4]}" font-size="9" fill="var(--fg-2)" opacity=".6">${t[3]}</text>`;
    });

    /* 点 */
    list.forEach((it) => {
      const x = xOf(it.pw), y = yOf(it.it), col = GROUP_COLOR[it.g];
      s += `<g class="quad__pt" data-id="${esc(it.id)}" tabindex="0" role="button" aria-label="${esc(it.id)} ${esc(it.n)}">
        <circle cx="${x}" cy="${y}" r="14" fill="${col}" opacity="0"/>
        <circle cx="${x}" cy="${y}" r="6" fill="${col}" stroke="var(--bg)" stroke-width="1.6"/>
        <text x="${x + 9}" y="${y + 3.4}" font-size="8.5" font-family="var(--mono)" fill="var(--fg-3)">${esc(it.id)}</text>
      </g>`;
    });
    $('#quadSvg').innerHTML = s;

    $$('#quadSvg .quad__pt').forEach((g) => {
      const pick = () => showStk(g.dataset.id);
      g.addEventListener('click', pick);
      g.addEventListener('mouseenter', pick);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      g.style.cursor = 'pointer';
    });
    showStk(curStk);
  }

  function showStk(id) {
    const it = allStake().find((x) => x.id === id);
    if (!it) return;
    curStk = id;
    $$('#quadSvg .quad__pt').forEach((g) => {
      const on = g.dataset.id === id;
      g.classList.toggle('on', on);
      const c = g.querySelectorAll('circle');
      if (c[1]) c[1].setAttribute('r', on ? '8.5' : '6');
      if (c[1]) c[1].setAttribute('stroke-width', on ? '2.5' : '1.6');
    });
    $$('#mxBody tr').forEach((tr) => tr.classList.toggle('on', tr.dataset.id === id));

    const att = { 2: '+2 支持', 1: '+1 倾向', 0: '0 中立', '-1': '−1 抵触', '-2': '−2 反对' }[it.att];
    const pri = priOf(it.pw, it.it);
    const gname = { A: '直接相关方', B: '交互 / 使能系统', C: '施加影响', D: '被影响' }[it.g];
    $('#qDetail').innerHTML = `
      <div class="qd__tag">${esc(it.id)} · ${esc(gname)} · ${pri} ${esc(PRI_NAME[pri])}</div>
      <h4>${esc(it.n)}</h4>
      <div class="en">${esc(it.en)}</div>
      <p>${esc(it.fo)}</p>
      <dl>
        <dt>态度</dt><dd>${esc(att)}</dd>
        <dt>影响力</dt><dd>${bar(it.pw, 'pw')} ${it.pw}</dd>
        <dt>利益</dt><dd>${bar(it.it, 'it')} ${it.it}</dd>
        <dt>权利</dt><dd>${esc(it.ri)}</dd>
        <dt>资源</dt><dd>${esc(it.re)}</dd>
        <dt>约束</dt><dd>${esc(it.co)}</dd>
      </dl>
      <div class="qd__need">核心诉求：${esc(it.need)}</div>`;
  }

  function bar(v, cls) {
    const n = Math.round(v / 20);
    return `<span class="lvl lvl--${cls}">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'a' : ''}"></i>`).join('')}</span>`;
  }

  function renderStake() {
    renderQuad();

    /* 四象限分组卡 */
    const buckets = { P1: [], P2: [], P3: [], P4: [] };
    allStake().forEach((s) => buckets[priOf(s.pw, s.it)].push(s));
    const desc = {
      P1: '权责直接绑定，任何决策都要先问它们。管理策略：共同决策、早期介入、指标共同签署。',
      P2: '能拦住项目但不直接受益。管理策略：定期通报、把约束前置到设计输入，别等到评审才沟通。',
      P3: '受益明确但话语权有限。管理策略：让他们看得见进展，用他们的现场反馈修正需求。',
      P4: '既不决定也不受益，但可能演化为风险。管理策略：监测 + 预案，尤其伦理与舆论类。'
    };
    $('#qGroups').innerHTML = ['P1', 'P2', 'P3', 'P4'].map((k) => `
      <div class="qg__c ${k === 'P1' ? 'qg__c--p1' : ''}">
        <div class="qg__h"><b>${esc(PRI_NAME[k])}</b><span>${k} · ${buckets[k].length}</span></div>
        <ul>${buckets[k].map((s) => `<li><em>${esc(s.id)}</em>${esc(s.n)}</li>`).join('')}</ul>
        <p>${esc(desc[k])}</p>
      </div>`).join('');

    /* 表4-3 矩阵 */
    const rows = allStake().map((s) => {
      const pri = priOf(s.pw, s.it);
      const a = s.att > 0 ? 'att--p' + s.att : 'att--' + (s.att < 0 ? 'm' + Math.abs(s.att) : '0');
      const atxt = s.att > 0 ? '+' + s.att : (s.att < 0 ? '−' + Math.abs(s.att) : '0');
      return `<tr data-id="${esc(s.id)}">
        <td class="tid">${esc(s.id)}</td>
        <td class="nm">${esc(s.n)}</td>
        <td style="min-width:210px">${esc(s.fo)}</td>
        <td><span class="att ${a}">${atxt}</span></td>
        <td>${bar(s.pw, 'pw')}</td>
        <td>${bar(s.it, 'it')}</td>
        <td style="min-width:120px">${esc(s.ri)}</td>
        <td style="min-width:100px">${esc(s.re)}</td>
        <td style="min-width:120px">${esc(s.co)}</td>
        <td><span class="pri pri--${pri.toLowerCase()}">${pri}</span></td>
      </tr>`;
    }).join('');

    $('#mxBody').innerHTML = rows;
    $$('#mxBody tr').forEach((tr) => {
      tr.addEventListener('click', () => showStk(tr.dataset.id));
      tr.addEventListener('mouseenter', () => showStk(tr.dataset.id));
    });
    showStk(curStk);
  }

  /* ========================================================= 07 需求条目 */
  let fCat = 'ALL', fPri = 'ALL', fQ = '';

  function renderReqs() {
    const R = D.reqs;
    $('#reqCats').innerHTML = `<button type="button" class="fbtn on" data-cat="ALL">全部 ${R.items.length}</button>` +
      R.cats.map((c) => `<button type="button" class="fbtn" data-cat="${esc(c.id)}">${esc(c.n)} ${R.items.filter((i) => i.c === c.id).length}</button>`).join('');
    $$('#reqCats .fbtn').forEach((b) => b.addEventListener('click', () => {
      fCat = b.dataset.cat;
      $$('#reqCats .fbtn').forEach((x) => x.classList.toggle('on', x === b));
      filterReqs();
    }));

    $$('#reqPris .fbtn').forEach((b) => b.addEventListener('click', () => {
      fPri = b.dataset.pri;
      $$('#reqPris .fbtn').forEach((x) => x.classList.toggle('on', x === b));
      filterReqs();
    }));

    $('#reqQ').addEventListener('input', (e) => { fQ = norm(e.target.value); filterReqs(); });

    $('#reqBody').innerHTML = R.items.map((r) => {
      const pc = r.p === '必须' ? 'must' : (r.p === '应该' ? 'should' : 'may');
      const cn = (R.cats.find((c) => c.id === r.c) || {}).n || r.c;
      return `<tr data-cat="${esc(r.c)}" data-pri="${esc(r.p)}" data-txt="${esc(norm(r.id + r.s + cn + r.tr))}">
        <td class="tid">${esc(r.id)}</td>
        <td class="num">${esc(cn)}</td>
        <td class="st">${fmt(r.s)}</td>
        <td><span class="tagp tagp--${pc}">${esc(r.p)}</span></td>
        <td><span class="tagv">${esc(r.v)}</span></td>
        <td class="num">${esc(r.src)}</td>
        <td>${esc(r.tr)}</td>
      </tr>`;
    }).join('');

    filterReqs();

    $('#needs').innerHTML = R.needs.map((n) => `
      <div class="need">
        <div class="need__from">来自 ${esc(n.from)}</div>
        <q>${esc(n.need.replace(/[「」]/g, ''))}</q>
        <p class="need__ana">${esc(n.ana)}</p>
        <div class="need__to"><em>转成需求</em>${esc(n.to)}</div>
      </div>`).join('');

    $('#conflicts').innerHTML = R.conflicts.map((c) => `
      <div class="conf__i">
        <div class="conf__a"><b>冲突点</b>${esc(c.p)}</div>
        <div class="conf__a"><b>${esc(c.a)}</b><span class="vs">VS</span> ${esc(c.b)}</div>
        <div class="conf__s"><b>协商结果</b><p>${esc(c.s)}</p></div>
      </div>`).join('');
  }

  function filterReqs() {
    let n = 0;
    $$('#reqBody tr').forEach((tr) => {
      const okC = fCat === 'ALL' || tr.dataset.cat === fCat;
      const okP = fPri === 'ALL' || tr.dataset.pri === fPri;
      const okQ = !fQ || tr.dataset.txt.indexOf(fQ) > -1;
      const show = okC && okP && okQ;
      tr.style.display = show ? '' : 'none';
      if (show) n++;
    });
    const total = D.reqs.items.length;
    const must = D.reqs.items.filter((i) => i.p === '必须').length;
    $('#reqStat').textContent = `显示 ${n} / ${total} 条 · 必须级 ${must} 条 · 应该级 ${D.reqs.items.filter((i) => i.p === '应该').length} 条`;
    $('#reqEmpty').style.display = n ? 'none' : 'block';
  }

  /* ============================================================ 08 追溯 */
  function renderTrace() {
    $('#tmBody').innerHTML = D.trace.rows.map((r) => `
      <tr>
        <td class="tid">${esc(r.tr)}</td>
        <td class="num">${esc(r.brq)}</td>
        <td class="num">${esc(r.moe)}</td>
        <td><div class="reqlist">${r.reqs.map((x) => `<span>${esc(x)}</span>`).join('')}</div></td>
        <td><div class="syslist">${r.sys.map((x) => `<span>${esc(x)}</span>`).join('<span style="opacity:.3">/</span>')}</div></td>
      </tr>`).join('');
  }

  /* ============================================================== 参考 */
  function renderRefs() {
    $('#refsList').innerHTML = D.refs.map((r) => `
      <li class="ref"><span class="ref__id">${esc(r.id)}</span>
        <div><p>${esc(r.t)}</p><em>${esc(r.tag)}</em></div></li>`).join('');
    $('#disclaimer').textContent = D.disclaimer;
  }

  /* ============================================================ 页面骨架 */
  const SECS = [
    ['method', '01', '读法'], ['docs', '02', '两份文档'], ['biz', '03', '需求'],
    ['conops', '04', 'ConOps'], ['opscon', '05', 'OpsCon'], ['stake', '06', '相关方'],
    ['reqs', '07', '需求条目'], ['trace', '08', '追溯'], ['vv', '09', '验证与确认']
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

      /* 只在 01–08 区间显示悬浮条 */
      const first = els[0], last = els[els.length - 1];
      const started = first && first.getBoundingClientRect().top < 0;
      const ended = last && last.getBoundingClientRect().bottom < 180;
      if (rail) rail.classList.toggle('on', !!started && !ended);
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

  function initHero() {
    const st = [
      { v: '02', k: '两份规格说明', u: 'BRS · StRS' },
      { v: String(D.stake.groups.reduce((a, g) => a + g.items.length, 0)), k: '相关方', u: 'STAKEHOLDERS' },
      { v: String(D.reqs.items.length), k: '需求条目', u: 'REQUIREMENTS' },
      { v: String(D.opscon.scenarios.length), k: '运行场景', u: 'SCENARIOS' }
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
    FX.key('/', '搜索需求条目', () => {
      const box = $('#reqQ');
      if (box) { box.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => box.focus(), 320); }
    });
    const hint = $('#keyHint');
    if (hint) hint.addEventListener('click', () => FX.openPanel());
  }

  /* ---------------------------------------------------------------- 启动 */
  renderMethod();
  renderOutline();
  initDoc();
  renderBiz();
  renderCon();
  renderOps();
  renderStake();
  renderReqs();
  renderTrace();
  renderRefs();
  initHero();
  initRail();
  initKeys();

  if (window.FX) {
    FX.reveal('.card, .pain, .brq__i, .mode-c, .need, .conf__i, .qg__c, .panel, .a2-lead__i, .figure');
    FX.spotlight('.card, .pain, .brq__i, .mode-c, .need, .qg__c, .panel');
    FX.runCounters();
  }
})();
