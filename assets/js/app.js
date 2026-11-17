/* ============================================================================
   IBEX-01 · 渲染与交互
   无依赖，纯原生。所有内容来自 assets/js/data.js
   ========================================================================== */
(function () {
  'use strict';
  const D = window.CSE;
  if (!D) return;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* 扁平化：系统 → 子系统 → 模块 */
  const SYS_MAP = {};
  const SUB_MAP = {};
  const MOD_LIST = [];
  D.systems.forEach((s) => {
    SYS_MAP[s.id] = s;
    s.subs.forEach((sb) => {
      SUB_MAP[sb.id] = Object.assign({ sys: s.id, sysName: s.name }, sb);
      sb.mods.forEach((m) => {
        MOD_LIST.push(Object.assign({}, m, {
          sys: s.id, sysName: s.name, group: s.group,
          sub: sb.id, subName: sb.name
        }));
      });
    });
  });
  const GRP_MAP = {};
  D.groups.forEach((g) => { GRP_MAP[g.id] = g; });

  /* ------------------------------------------------------------------ 基础 */
  const meta = D.meta;
  const deadlineEl = $('#deadline');
  if (deadlineEl && meta.deadline) deadlineEl.textContent = meta.deadline;
  $('#footMeta').textContent = 'UPDATED ' + meta.updated + ' · ' + meta.version;
  $('#stats').innerHTML = meta.stats.map((s) => (
    `<div class="stat"><b>${esc(s.v)}</b><span>${esc(s.k)}</span><i>${esc(s.u)}</i></div>`
  )).join('');

  const SEC_IDS = ['mission', 'sos', 'vehicle', 'systems', 'subsystems', 'modules'];

  $('#chevrons').innerHTML = D.layers.map((l) => (
    `<a class="chev" href="#${SEC_IDS[+l.no - 1]}">
      <span class="chev__no">${l.no} / 06</span>
      <span class="chev__zh">${esc(l.zh)}</span>
      <span class="chev__en">${esc(l.en)}</span>
    </a>`
  )).join('');

  /* 悬浮层级跳转条 */
  const rail = $('#rail');
  if (rail) {
    rail.innerHTML = '<span class="rail__h">LAYER</span>' + D.layers.map((l, i) => (
      `<a class="rail__i" href="#${SEC_IDS[i]}" data-sec="${SEC_IDS[i]}" title="${esc(l.zh)} · ${esc(l.q || '')}">
        <em>${esc(l.no)}</em><span>${esc(l.zh)}</span><i></i>
      </a>`
    )).join('');
  }

  /* ------------------------------------------------------- 首屏六层堆叠 */
  (function renderStack() {
    const svg = $('#stackSvg');
    if (!svg) return;
    const cx = 140, hw = 104, hh = 36, gap = 48, topY = 96, th = 9;
    const pts = (arr) => arr.map((p) => p.join(',')).join(' ');
    const note = $('#stackNote');
    const NOTE0 = note ? note.textContent : '';

    let out = `<defs>
      <radialGradient id="stackGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity=".16"/>
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="${cx}" cy="${topY + 5 * gap + 20}" rx="176" ry="42" fill="url(#stackGlow)"/>`;

    /* 自下而上绘制：上层压住下层 */
    D.layers.slice().reverse().forEach((l) => {
      const i = +l.no - 1;
      const y = topY + i * gap;
      const top = [[cx - hw, y], [cx, y - hh], [cx + hw, y], [cx, y + hh]];
      const left = [[cx - hw, y], [cx, y + hh], [cx, y + hh + th], [cx - hw, y + th]];
      const right = [[cx, y + hh], [cx + hw, y], [cx + hw, y + th], [cx, y + hh + th]];
      out += `<a class="plate ${i === 0 ? 'is-top' : ''}" href="#${SEC_IDS[i]}" data-i="${i}"
          aria-label="${esc(l.no)} ${esc(l.zh)}：${esc(l.q || '')}">
        <g class="plate__g">
          <polygon class="plate__l" points="${pts(left)}"/>
          <polygon class="plate__r" points="${pts(right)}"/>
          <polygon class="plate__top" points="${pts(top)}"/>
          <text class="plate__engrave" x="${cx}" y="${y + 6}" text-anchor="middle">${esc(l.no)}</text>
        </g>
        <line class="plate__tick" x1="${cx + hw}" y1="${y}" x2="272" y2="${y}"/>
        <rect x="270" y="${y - 18}" width="170" height="44" fill="transparent"/>
        <text class="plate__no" x="278" y="${y + 4}">${esc(l.no)}</text>
        <text class="plate__zh" x="300" y="${y + 4}">${esc(l.zh)}</text>
        <text class="plate__en" x="300" y="${y + 17}">${esc(l.en)}</text>
      </a>`;
    });
    out += `<text class="plate__hint" x="${cx}" y="398" text-anchor="middle">SIX LAYERS · ONE PLATFORM</text>`;
    svg.innerHTML = out;

    const plates = $$('#stackSvg .plate');
    plates.forEach((g) => {
      const i = +g.dataset.i;
      const l = D.layers[i];
      g.addEventListener('mouseenter', () => {
        g.classList.add('is-hot');
        if (note) note.textContent = l.q || '';
      });
      g.addEventListener('mouseleave', () => {
        g.classList.remove('is-hot');
        if (note) note.textContent = NOTE0;
      });
    });
    /* 键盘可达：整层聚焦即高亮 */
    $$('#stackSvg .plate').forEach((a) => {
      a.addEventListener('focus', () => a.classList.add('is-hot'));
      a.addEventListener('blur', () => a.classList.remove('is-hot'));
    });
  })();

  /* ------------------------------------------------------------------ 任务 */
  const M = D.mission;
  $('#mTitle').textContent = M.primary.name;
  $('#mStatement').textContent = M.primary.statement;
  $('#mKV').innerHTML = [
    ['谁 WHO', M.primary.who],
    ['何时 WHEN', M.primary.when],
    ['何地 WHERE', M.primary.where],
    ['为何 WHY', M.primary.why]
  ].map(([k, v]) => `<div><dt>${esc(k.split(' ')[0])}</dt><dd>${esc(v)}</dd></div>`).join('');

  $('#supports').innerHTML = M.supports.map((s) => (
    `<article class="sup">
      <div class="sup__id">${esc(s.id)}</div>
      <h4>${esc(s.name)}</h4>
      <p>${esc(s.note)}</p>
    </article>`
  )).join('');

  $('#moeBody').innerHTML = M.moe.map((m) => (
    `<tr>
      <td class="id">${esc(m.id)}</td>
      <td><span class="badge badge--${m.layer}">${m.layer}</span> &nbsp;<b>${esc(m.name)}</b></td>
      <td class="cell-tar">${esc(m.target)}</td>
      <td>${esc(m.why)}</td>
    </tr>`
  )).join('');

  /* 三个任务的六层矩阵 */
  const layerNames = ['任务', '体系', '整机', '系统', '子系统', '模块'];
  let scenHtml = `<div class="scen__row scen__head">
    <div class="scen__cell">任务语境</div>
    ${layerNames.map((n) => `<div class="scen__cell">${n}</div>`).join('')}
  </div>`;
  scenHtml += D.scenarios.map((s) => (
    `<div class="scen__row">
      <div class="scen__cell scen__tag"><b>${esc(s.tag)}</b><span>${esc(s.name)}</span><i>${esc(s.terrain)}</i></div>
      ${s.row.map((c, i) => `<div class="scen__cell" data-l="${layerNames[i]}">${esc(c)}</div>`).join('')}
    </div>`
  )).join('');
  $('#scen').innerHTML = scenHtml;

  /* 场景表：按任务语境 / 按层级 两种视角切换 */
  (function scenView() {
    const scenEl = $('#scen');
    const seg = $('#scenSeg');

    function byScene() {
      scenEl.className = 'scen';
      let h = `<div class="scen__row scen__head">
        <div class="scen__cell">任务语境</div>
        ${layerNames.map((n) => `<div class="scen__cell">${n}</div>`).join('')}
      </div>`;
      h += D.scenarios.map((s) => (
        `<div class="scen__row">
          <div class="scen__cell scen__tag"><b>${esc(s.tag)}</b><span>${esc(s.name)}</span><i>${esc(s.terrain)}</i></div>
          ${s.row.map((c, i) => `<div class="scen__cell" data-l="${layerNames[i]}">${esc(c)}</div>`).join('')}
        </div>`
      )).join('');
      scenEl.innerHTML = h;
    }

    function byLayer() {
      scenEl.className = 'scen scen--t';
      let h = `<div class="scen__row scen__head">
        <div class="scen__cell">层级</div>
        ${D.scenarios.map((s) => `<div class="scen__cell">${esc(s.tag)} ${esc(s.name)}</div>`).join('')}
      </div>`;
      h += layerNames.map((ln, i) => (
        `<div class="scen__row">
          <div class="scen__cell scen__tag"><b>${String(i + 1).padStart(2, '0')}</b><span>${ln}</span><i>${esc(D.layers[i].en)}</i></div>
          ${D.scenarios.map((s) => `<div class="scen__cell" data-l="${esc(s.tag)}">${esc(s.row[i])}</div>`).join('')}
        </div>`
      )).join('');
      scenEl.innerHTML = h;
    }

    byScene();
    if (seg) {
      seg.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        $$('#scenSeg button').forEach((x) => x.classList.toggle('on', x === b));
        if (b.dataset.mode === 'layer') byLayer(); else byScene();
      });
    }
  })();

  /* ------------------------------------------------------------------ 体系 */
  $('#sosDef').textContent = D.sos.definition;
  $('#sosFeatures').innerHTML = D.sos.features.map((f) => (
    `<li><b>${esc(f.k)}</b><span>${esc(f.v)}</span></li>`
  )).join('');

  const sosShort = {
    'SoS-01': ['指挥控制', '指挥控制'],
    'SoS-02': ['有人分队', '有人作战分队'],
    'SoS-03': ['无人机', '无人空中系统'],
    'SoS-04': ['通信导航', '通信导航体系'],
    'SoS-05': ['火力打击', '火力打击体系'],
    'SoS-06': ['综合保障', '综合保障体系'],
    'SoS-07': ['训练仿真', '训练与仿真体系']
  };
  (function sosNodes() {
    const cx = 230, cy = 210, r = 138;
    const g = $('#sosNodes');
    g.innerHTML = D.sos.members.map((m, i) => {
      const a = (-90 + i * (360 / 7)) * Math.PI / 180;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      const anchor = x > 260 ? 'start' : x < 200 ? 'end' : 'middle';
      const dy = y < 200 ? -13 : 18;
      const label = (sosShort[m.id] || [m.name, m.name])[0];
      return `<g>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5"/>
        <text x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}">${esc(label)}</text>
      </g>`;
    }).join('');
  })();

  $('#sosMembers').innerHTML = D.sos.members.map((m) => (
    `<article class="sos">
      <div class="sos__top"><span class="sos__id">${esc(m.id)}</span><h4>${esc(m.name)}</h4></div>
      <p>${esc(m.role)}</p>
      <div class="sos__ex">
        <div><em>给</em><span>${esc(m.give)}</span></div>
        <div><em>取</em><span>${esc(m.take)}</span></div>
      </div>
    </article>`
  )).join('');

  $('#ifaceBody').innerHTML = D.sos.ifaces.map((f) => (
    `<tr>
      <td class="id">${esc(f.id)}</td>
      <td><b>${esc(f.name)}</b> <span class="mono dim">${esc(f.en)}</span></td>
      <td>${esc(f.dir)}</td>
      <td>${esc(f.content)}</td>
      <td class="mono" style="font-size:11.5px">${esc(f.limit)}</td>
    </tr>`
  )).join('');

  $('#emerge').innerHTML = D.sos.emergence.map((e) => (
    `<li><div><b>${esc(e.k)}</b><i>${esc(e.why)}</i></div><span>${esc(e.v)}</span></li>`
  )).join('');
  $('#boundary').innerHTML = D.sos.boundary.map((b) => `<li>${esc(b)}</li>`).join('');

  /* ------------------------------------------------------------------ 整机 */
  $('#axisRows').innerHTML = D.vehicle.designSpace.map((a) => (
    `<div class="axis__item"><b>${esc(a.axis)}</b><span>${esc(a.opts)}</span></div>`
  )).join('');

  $('#cfgs').innerHTML = D.vehicle.configs.map((c) => (
    `<article class="cfg ${c.chosen ? 'is-chosen' : ''}">
      <div class="cfg__top"><span class="cfg__id">${esc(c.id)}</span>${c.chosen ? '<span class="cfg__pick">选定</span>' : ''}</div>
      <h4>${esc(c.name)}</h4>
      <p class="cfg__en">${esc(c.en)}</p>
      <p class="cfg__m">${esc(c.merit)}</p>
      <p class="cfg__l">局限：${esc(c.limit)}</p>
      <span class="cfg__fit">${esc(c.fit)}</span>
    </article>`
  )).join('');

  /* 决策矩阵 */
  const crit = D.vehicle.criteria.map((c) => ({ k: c.k, w: c.w }));
  const cfgs = D.vehicle.configs;
  function renderMatrix() {
    const sumW = crit.reduce((s, c) => s + c.w, 0) || 1;

    const head = `<div class="mx-row mx-row--head">
      <span>评价准则</span><span>权重</span><span>五方案评分 A–E</span><span>最优</span>
    </div>`;

    const rows = crit.map((c, ci) => {
      const scores = cfgs.map((cf) => cf.scores[ci]);
      const best = Math.max.apply(null, scores);
      const bestIdx = scores.indexOf(best);
      return `<div class="mx-row">
        <span class="mx-k">${esc(c.k)}</span>
        <span class="mx-w">
          <input type="range" min="0" max="40" value="${c.w}" data-ci="${ci}" aria-label="${esc(c.k)}权重">
          <b>${Math.round(c.w / sumW * 100)}%</b>
        </span>
        <span class="mx-scores">${scores.map((s) => `<span class="${s === 5 ? 'on' : s >= 4 ? 'hi' : ''}">${s}</span>`).join('')}</span>
        <span class="mono dim" style="text-align:right">${cfgs[bestIdx].id}</span>
      </div>`;
    }).join('');

    const totals = cfgs.map((cf) => cf.scores.reduce((s, v, i) => s + v * crit[i].w, 0) / sumW);
    const maxTotal = Math.max.apply(null, totals);
    const win = totals.indexOf(maxTotal);

    const res = `<div class="res">
      <div class="res__head"><span>NO</span><span>方案 / 加权总分</span><span style="text-align:right">得分</span></div>
      ${cfgs.map((cf, i) => `<div class="res__row ${i === win ? 'is-win' : ''}">
        <span class="res__id">${cf.id}</span>
        <span class="res__name">${esc(cf.name)}${cf.chosen ? '<span class="pick">原选</span>' : ''}
          <span class="res__bar" style="flex:1;max-width:180px"><i style="width:${(totals[i] / 5 * 100).toFixed(1)}%"></i></span>
        </span>
        <span class="res__val">${totals[i].toFixed(2)}</span>
      </div>`).join('')}
    </div>`;

    $('#matrix').innerHTML = head + rows;
    $('#matrixFoot').innerHTML = res;

    const chosenIdx = cfgs.findIndex((c) => c.chosen);
    const lead = (totals[chosenIdx] - Math.max.apply(null, totals.filter((_, i) => i !== chosenIdx))).toFixed(2);
    $('#matrixFoot').insertAdjacentHTML('beforeend',
      `<p style="margin-top:12px">当前权重下最优为 <b>${cfgs[win].id} ${esc(cfgs[win].name)}</b>（${maxTotal.toFixed(2)} 分）；
       ${win === chosenIdx
        ? `与本文选定方案一致，领先次优 ${lead} 分。`
        : `与本文选定方案（${cfgs[chosenIdx].id}）不一致——这说明结论对权重敏感，需要回到任务层重新确认优先级。`}</p>`);

    $$('#matrix input[type=range]').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        crit[+e.target.dataset.ci].w = +e.target.value;
        const pos = document.activeElement === e.target;
        const pv = $('#matrixPresets');
        if (pv) $$('.preset', pv).forEach((x) => x.classList.remove('on'));
        renderMatrix();
        if (pos) {
          const again = $(`#matrix input[data-ci="${e.target.dataset.ci}"]`);
          if (again) again.focus();
        }
      });
    });
  }
  renderMatrix();

  /* 权重预设：给不同优先级立场各一组起点 */
  const PRESETS = [
    { id: 'mission', name: '任务优先 · 默认', w: [25, 15, 15, 15, 15, 15] },
    { id: 'mobility', name: '机动优先', w: [34, 12, 12, 20, 12, 10] },
    { id: 'load', name: '载荷优先', w: [18, 20, 30, 12, 10, 10] },
    { id: 'sustain', name: '保障优先', w: [16, 16, 14, 14, 24, 16] }
  ];
  const presetsEl = $('#matrixPresets');
  if (presetsEl) {
    presetsEl.innerHTML = '<span>权重预设</span>'
      + PRESETS.map((p, i) => `<button class="preset ${i === 0 ? 'on' : ''}" type="button" data-p="${p.id}">${esc(p.name)}</button>`).join('')
      + '<button class="preset" type="button" data-p="reset">↺ 复原</button>';
    presetsEl.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const p = PRESETS.filter((x) => x.id === b.dataset.p)[0];
      $$('.preset', presetsEl).forEach((x) => x.classList.toggle('on', x === b));
      crit.forEach((c, i) => { c.w = p ? p.w[i] : D.vehicle.criteria[i].w; });
      if (!p) $$('.preset', presetsEl)[0].classList.add('on');
      renderMatrix();
    });
  }

  $('#modes').innerHTML = D.vehicle.modes.map((m) => (
    `<article class="mod" data-no="${esc(m.id)}">
      <h4>${esc(m.name)}</h4>
      <p>${esc(m.desc)}</p>
      <i>${esc(m.use)}</i>
    </article>`
  )).join('');

  $('#specs').innerHTML = D.vehicle.specs.map((s) => (
    `<div class="spec"><b>${esc(s.v)}</b><span>${esc(s.k)}</span><i>${esc(s.note)}</i></div>`
  )).join('');

  /* ------------------------------------------------------------------ 系统 */
  $('#sysbar').innerHTML = D.groups.map((g) => (
    `<span class="sysbar__i"><i class="dot-${g.id}"></i>${esc(g.name)} <b>${D.systems.filter((s) => s.group === g.id).length}</b></span>`
  )).join('');

  $('#sysGrid').innerHTML = D.systems.map((s) => {
    const g = GRP_MAP[s.group];
    return `<article class="syscard" data-sys="${s.id}">
      <div class="syscard__top">
        <span class="syscard__id">${esc(s.id)}</span>
        <span class="syscard__grp">${esc(g ? g.name : '')}</span>
      </div>
      <h3>${esc(s.name)}</h3>
      <p class="syscard__en">${esc(s.en)}</p>
      <p class="syscard__role">${esc(s.role)}</p>
      <ul class="syscard__metrics">${s.metrics.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
      <div class="syscard__foot">
        <span>${s.subs.length} 子系统 · ${s.subs.reduce((n, sb) => n + sb.mods.length, 0)} 模块</span>
        <a class="syscard__go" href="#subsystems" data-jump="${esc(s.subs[0].id)}">展开<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      </div>
    </article>`;
  }).join('');

  /* -------------------------------------------------------------- 子系统 */
  $('#acc').innerHTML = D.systems.map((s, i) => `
    <div class="acc__item ${i === 0 ? 'is-open' : ''}" data-sys="${s.id}">
      <button class="acc__btn" type="button" aria-expanded="${i === 0}">
        <span class="acc__sys">${esc(s.id)}</span>
        <span class="acc__name">${esc(s.name)}</span>
        <span class="acc__meta">${s.subs.length} SUBS · ${s.subs.reduce((n, sb) => n + sb.mods.length, 0)} MODS</span>
        <svg class="acc__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9.5l6 6 6-6"/></svg>
      </button>
      <div class="acc__body">
        <div class="subs">
          ${s.subs.map((sb) => `<div class="subi">
            <div class="subi__id">${esc(sb.id)}</div>
            <h5>${esc(sb.name)}</h5>
            <p>${esc(sb.role)}</p>
            <span class="subi__n">${sb.mods.length} 模块</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  $$('.acc__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.acc__item');
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
    });
  });

  $$('[data-jump]').forEach((a) => {
    a.addEventListener('click', () => {
      const id = a.dataset.jump;
      const item = $(`.acc__item[data-sys="${id.slice(0, 3)}"]`);
      if (item && !item.classList.contains('is-open')) item.classList.add('is-open');
    });
  });

  /* ------------------------------------------------------------------ 模块 */
  const chips = [{ id: 'all', name: '全部' }].concat(D.groups.map((g) => ({ id: g.id, name: g.name })));
  $('#modChips').innerHTML = chips.map((c, i) => (
    `<button class="chip ${i === 0 ? 'on' : ''}" type="button" data-g="${c.id}">${esc(c.name)}</button>`
  )).join('');

  let state = { g: 'all', q: '' };
  let currentIds = [];
  let currentMod = '';

  function renderMods() {
    const q = state.q.trim().toLowerCase();
    const list = MOD_LIST.filter((m) => {
      if (state.g !== 'all' && m.group !== state.g) return false;
      if (!q) return true;
      return (m.id + m.name + m.spec + m.subName + m.sysName + m.type).toLowerCase().indexOf(q) > -1;
    });
    currentIds = list.map((m) => m.id);
    $('#modBody').innerHTML = list.map((m) => (
      `<tr data-mod="${esc(m.id)}">
        <td class="mid">${esc(m.id)}</td>
        <td class="mname">${esc(m.name)}</td>
        <td class="dim">${esc(m.sub)} ${esc(m.subName)}</td>
        <td><span class="badge">${esc(m.type)}</span></td>
        <td>${esc(m.spec)}</td>
      </tr>`
    )).join('');
    $('#modMeta').textContent = `${list.length} / ${MOD_LIST.length} 模块`;
    $('#modEmpty').classList.toggle('on', list.length === 0);
    $$('#modBody tr').forEach((tr) => tr.addEventListener('click', () => openModule(tr.dataset.mod)));
  }

  const searchBox = $('#modSearch');
  searchBox.addEventListener('input', (e) => {
    state.q = e.target.value;
    searchBox.closest('.search').classList.toggle('has-val', !!state.q);
    renderMods();
  });
  $('#modClear').addEventListener('click', () => {
    state.q = '';
    searchBox.value = '';
    searchBox.closest('.search').classList.remove('has-val');
    renderMods();
  });
  $$('#modChips .chip').forEach((c) => {
    c.addEventListener('click', () => {
      state.g = c.dataset.g;
      $$('#modChips .chip').forEach((x) => x.classList.toggle('on', x === c));
      renderMods();
    });
  });
  renderMods();

  /* 随机抽一个模块：用抽样证明“每个模块都能上溯” */
  const rndBtn = $('#modRandom');
  if (rndBtn) {
    rndBtn.addEventListener('click', () => {
      const ids = currentIds.length ? currentIds : MOD_LIST.map((m) => m.id);
      if (!ids.length) return;
      const id = ids[Math.floor(Math.random() * ids.length)];
      const tr = $(`#modBody tr[data-mod="${id}"]`);
      if (tr) {
        tr.scrollIntoView({ block: 'center', behavior: 'smooth' });
        tr.classList.add('is-pick');
        setTimeout(() => tr.classList.remove('is-pick'), 1600);
      }
      setTimeout(() => openModule(id), 220);
    });
  }

  /* ------------------------------------------------------------------ 追溯 */
  $('#chainList').innerHTML = D.chains.map((c, i) => (
    `<button class="tr-it ${i === 0 ? 'is-on' : ''}" type="button" data-ch="${esc(c.id)}">
      <span>${esc(c.id)}</span><b>${esc(c.title)}</b>
    </button>`
  )).join('');

  const layerKey = ['MISSION', 'SOS', 'VEHICLE', 'SYSTEM', 'SUBSYS', 'MODULE'];
  function renderChain(id) {
    const c = D.chains.filter((x) => x.id === id)[0] || D.chains[0];
    const body = $('#chainBody');
    body.innerHTML = `
      <p class="chain__sub">TRACE ${esc(c.id)} · 6 HOPS</p>
      <h3 class="chain__h">${esc(c.title)}</h3>
      <div class="hops">
        ${c.hops.map((h, i) => `<div class="hop">
          <div class="hop__l">${layerKey[i]}<i></i></div>
          <div class="hop__c">
            <div class="hop__t">${esc(h.t)}</div>
            <p class="hop__n">${esc(h.n)}</p>
          </div>
        </div>`).join('')}
      </div>`;
    body.classList.remove('is-swap');
    void body.offsetWidth;
    body.classList.add('is-swap');
  }
  renderChain(D.chains[0].id);
  $$('#chainList .tr-it').forEach((b) => {
    b.addEventListener('click', () => {
      $$('#chainList .tr-it').forEach((x) => x.classList.toggle('is-on', x === b));
      renderChain(b.dataset.ch);
    });
  });

  /* ------------------------------------------------------------------ 预算 */
  const maxKg = Math.max.apply(null, D.budget.mass.rows.map((r) => r.kg));
  $('#massBars').innerHTML = D.budget.mass.rows.map((r) => (
    `<div class="bar__row">
      <div class="bar__top"><span>${esc(r.name)}</span><b>${r.kg} kg</b></div>
      <div class="bar"><i style="width:${(r.kg / maxKg * 100).toFixed(1)}%"></i></div>
    </div>`
  )).join('');
  const massSum = D.budget.mass.rows.reduce((s, r) => s + r.kg, 0);
  $('#massSum').textContent = massSum + ' kg';

  const maxKw = Math.max.apply(null, D.budget.power.rows.map((r) => r.kw));
  $('#powerBars').innerHTML = D.budget.power.rows.map((r) => (
    `<div class="bar__row">
      <div class="bar__top"><span>${esc(r.mode)}</span><b>${r.kw} kW</b></div>
      <div class="bar"><i style="width:${(r.kw / maxKw * 100).toFixed(1)}%"></i></div>
    </div>`
  )).join('');

  $('#infoList').innerHTML = D.budget.info.rows.map((r) => (
    `<li><b>${esc(r.link)}</b><em>${esc(r.rate)}</em><span>${esc(r.note)}</span></li>`
  )).join('');

  $('#closeNote').innerHTML = '<b>闭合说明：</b>' + esc(D.budget.closeNote);

  /* ------------------------------------------------------------------ 参考 */
  $('#refsList').innerHTML = D.refs.map((r) => (
    `<li class="ref"><span class="ref__id">${esc(r.id)}</span><div><p>${esc(r.txt)}</p><em>${esc(r.tag)}</em></div></li>`
  )).join('');
  $('#disclaimer').textContent = D.disclaimer;

  /* ------------------------------------------------------------ 抽屉：模块 */
  const drawer = $('#drawer');
  const drawerBody = $('#drawerBody');
  const groupToSos = { plat: 'SoS-02', intel: 'SoS-01', task: 'SoS-05', sust: 'SoS-06' };
  const groupToMission = { plat: 'M-01', intel: 'M-01', task: 'M-05', sust: 'M-03' };
  const groupNote = {
    plat: '伴随有人分队行动，机动能力直接决定它能不能“跟得上”。',
    intel: '把节点状态与战场态势送进指挥控制体系，是它被看见的方式。',
    task: '目标线索移交给火力体系，是否打击由指挥链决定。',
    sust: '靠综合保障体系维持 8 h 在位率，维修与补能都在这一层闭环。'
  };

  function openModule(id) {
    const m = MOD_LIST.filter((x) => x.id === id)[0];
    if (!m) return;
    currentMod = id;
    const s = SYS_MAP[m.sys];
    const sb = SUB_MAP[m.sub];
    const sosId = groupToSos[m.group];
    const sos = D.sos.members.filter((x) => x.id === sosId)[0];
    const mis = D.mission.supports.concat([{ id: 'M-01', name: D.mission.primary.name }])
      .filter((x) => x.id === groupToMission[m.group])[0];
    const g = GRP_MAP[m.group];

    drawerBody.innerHTML = `
      <p class="dw__k">MODULE DETAIL</p>
      <h3 class="dw__t" id="drawerTitle">${esc(m.name)}</h3>
      <p class="dw__id">${esc(m.id)} · ${esc(m.type)} · ${esc(g ? g.name : '')}</p>
      <dl style="margin-top:20px">
        <div class="dw__row"><dt>关键规格</dt><dd>${esc(m.spec)}</dd></div>
        <div class="dw__row"><dt>所属子系统</dt><dd>${esc(sb.id)} ${esc(sb.name)}</dd></div>
        <div class="dw__row"><dt>子系统职责</dt><dd>${esc(sb.role)}</dd></div>
        <div class="dw__row"><dt>所属系统</dt><dd>${esc(s.id)} ${esc(s.name)}</dd></div>
      </dl>
      <p class="dw__k" style="display:block;margin-top:26px">六层追溯 / WHY IT EXISTS</p>
      <div class="dw__hops">
        <div class="dw__hop"><em>01 MISSION</em><b>${esc(mis.id)} ${esc(mis.name)}</b><p>${esc(groupNote[m.group])}</p></div>
        <div class="dw__hop"><em>02 SOS</em><b>${esc(sos.id)} ${esc(sos.name)}</b><p>${esc(sos.role)}</p></div>
        <div class="dw__hop"><em>03 VEHICLE</em><b>IBEX-01 四轮腿平台</b><p>四轮腿独立驱动，1800 kg 全重 / 400 kg 载荷，8 h 在位。</p></div>
        <div class="dw__hop"><em>04 SYSTEM</em><b>${esc(s.id)} ${esc(s.name)}</b><p>${esc(s.role)}</p></div>
        <div class="dw__hop"><em>05 SUB-SYSTEM</em><b>${esc(sb.id)} ${esc(sb.name)}</b><p>${esc(sb.role)}</p></div>
        <div class="dw__hop"><em>06 MODULE</em><b>${esc(m.name)}</b><p>${esc(m.spec)}</p></div>
      </div>
      <div class="dw__nav">
        <button type="button" data-nav="-1">← 上一个模块</button>
        <button type="button" data-nav="1">下一个模块 →</button>
      </div>`;
    drawer.classList.add('on');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const panel = $('.drawer__panel');
    if (panel) panel.scrollTop = 0;
  }
  function closeDrawer() {
    drawer.classList.remove('on');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  $$('[data-close]').forEach((b) => b.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  /* 抽屉内翻页：顺着当前筛选结果走 */
  function stepModule(dir) {
    if (!currentMod) return;
    const list = currentIds.length ? currentIds : MOD_LIST.map((x) => x.id);
    const i = list.indexOf(currentMod);
    if (i < 0) return;
    openModule(list[(i + dir + list.length) % list.length]);
  }
  drawerBody.addEventListener('click', (e) => {
    const b = e.target.closest('[data-nav]');
    if (b) stepModule(+b.dataset.nav);
  });
  document.addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('on')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); stepModule(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepModule(-1); }
  });

  /* ---------------------------------------------------------- 快捷键 / 导航 */
  if (window.FX) {
    D.layers.forEach((l, i) => {
      FX.key(String(i + 1), `跳到第 ${i + 1} 层 · ${l.zh}`, () => {
        const el = document.getElementById(SEC_IDS[i]);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    FX.key('/', '搜索模块', () => {
      const box = $('#modSearch');
      if (!box) return;
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => box.focus(), 300);
    });
    FX.key('r', '随机抽一个模块', () => { if (rndBtn) rndBtn.click(); });
    const hint = $('#keyHint');
    if (hint) hint.addEventListener('click', () => FX.openPanel());
  }

  const menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => {
    const nav = $('#layernav');
    const on = nav.classList.toggle('on');
    menuBtn.setAttribute('aria-expanded', on);
  });
  $$('#layernav a').forEach((a) => a.addEventListener('click', () => {
    $('#layernav').classList.remove('on');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  /* 进度条与当前层高亮 */
  const bar = $('#scrollbar');
  const navLinks = $$('#layernav a');
  const railLinks = $$('#rail a');
  const secs = SEC_IDS.map((id) => document.getElementById(id));
  const firstSec = document.getElementById('mission');
  function onScroll() {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.width = (p * 100).toFixed(2) + '%';

    let active = '';
    secs.forEach((s) => {
      if (s && s.getBoundingClientRect().top <= 140) active = s.id;
    });
    navLinks.forEach((a) => a.classList.toggle('is-on', a.dataset.sec === active));
    railLinks.forEach((a) => {
      const on = a.dataset.sec === active;
      a.classList.toggle('is-on', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });

    /* 层级跳转条：只在六层正文区间内浮出，离开后自动收起 */
    if (rail) {
      const lastSec = document.getElementById('modules');
      const started = !!firstSec && firstSec.getBoundingClientRect().top < 0;
      const ended = !!lastSec && lastSec.getBoundingClientRect().bottom < 140;
      rail.classList.toggle('on', started && !ended);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 逐段淡入（带兜底扫描：任何情况下内容都不会停留在隐藏状态） */
  if (window.FX) FX.reveal('.card, .sup, .syscard, .mod, .sos, .cfg, .panel, .figure, .acc__item, .spec, .qc');
})();
