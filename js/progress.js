/* Progress view: what's been practiced, how it's going, and what needs work.
   Everything comes from the saved state that app.js keeps (no account, no server). */
(function () {
  const T = window.Theory, R = window.Render;
  const DAY_MS = 864e5;
  const MODES = [
    { id: 'spell', label: 'Spell it', sub: 'symbol → notes' },
    { id: 'name', label: 'Name it', sub: 'notes → symbol' },
    { id: 'hear', label: 'Hear it', sub: 'ear training' },
    { id: 'prog', label: 'Progressions', sub: 'numerals → changes' },
  ];
  // family names that don't fit a phone row
  const PHONE_NAME = { altered: 'Altered Dom.', dim: 'Diminished' };

  /** Local calendar date as YYYY-MM-DD (practice days follow the clock on the wall, not UTC). */
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const daysAgo = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); return new Date(d - n * DAY_MS); };
  const pct = (r, n) => (n ? Math.round((r / n) * 100) : null);
  const fmtPct = (p) => (p == null ? '—' : p + '%');

  /** Days in a row with practice, ending today (or yesterday, so the streak isn't lost before today's session). */
  function dayStreak(days) {
    let i = days[dayKey()] ? 0 : 1, n = 0;
    while (days[dayKey(daysAgo(i))]) { n++; i++; }
    return n;
  }

  function sumWindow(days, from, to) {
    let n = 0, r = 0;
    for (let i = from; i < to; i++) { const d = days[dayKey(daysAgo(i))]; if (d) { n += d[0]; r += d[1]; } }
    return { n, r };
  }

  function chart(days) {
    const N = 28;
    const cols = [];
    let max = 0;
    for (let i = N - 1; i >= 0; i--) {
      const dt = daysAgo(i), d = days[dayKey(dt)] || [0, 0];
      max = Math.max(max, d[0]);
      cols.push({ dt, n: d[0], r: d[1] });
    }
    const top = Math.max(10, Math.ceil(max / 10) * 10);
    const fmt = (dt) => dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const bars = cols.map((c, i) => {
      const h = (c.n / top) * 100, hr = c.n ? (c.r / c.n) * h : 0;
      const today = i === N - 1;
      return `<li class="pg-bar ${today ? 'today' : ''} ${c.n ? '' : 'empty'}" title="${fmt(c.dt)}: ${c.n ? `${c.n} cards, ${c.r} right` : 'no practice'}">
        <span class="pg-bar-col" style="--h:${h}%;--hr:${hr}%"><i class="miss"></i><i class="ok"></i></span></li>`;
    }).join('');
    const thisWk = sumWindow(days, 0, 7), lastWk = sumWindow(days, 7, 14);
    const a = pct(thisWk.r, thisWk.n), b = pct(lastWk.r, lastWk.n);
    const delta = a != null && b != null && a !== b
      ? `<span class="pg-delta ${a > b ? 'up' : 'down'}">${a > b ? '▲' : '▼'} ${Math.abs(a - b)} pts vs last week</span>` : '';
    return `<section class="pg-panel pg-activity">
      <div class="pg-panel-head"><h2>Last 4 weeks</h2>
        <p class="pg-legend"><span><i class="ok"></i>Right</span><span><i class="miss"></i>Missed</span></p></div>
      <ol class="pg-chart" aria-label="Cards answered per day, last 28 days">${bars}</ol>
      <div class="pg-axis"><span>${fmt(cols[0].dt)}</span><span>Today</span></div>
      <div class="pg-weeks">
        <div><small>This week</small><b>${thisWk.n}</b> cards · <b>${fmtPct(a)}</b> right ${delta}</div>
        <div><small>Last week</small><b>${lastWk.n}</b> cards · <b>${fmtPct(b)}</b> right</div>
      </div>
    </section>`;
  }

  function modes(ms) {
    const rows = MODES.map((m) => {
      const [n, r] = ms[m.id] || [0, 0];
      const p = pct(r, n);
      return `<li><span class="pg-row-name"><b>${m.label}</b><small>${m.sub}</small></span>
        <span class="pg-row-bar"><i style="width:${p || 0}%"></i></span>
        <span class="pg-row-val"><b>${fmtPct(p)}</b><small>${n} card${n === 1 ? '' : 's'}</small></span></li>`;
    }).join('');
    return `<section class="pg-panel"><div class="pg-panel-head"><h2>By practice mode</h2></div><ul class="pg-rows">${rows}</ul></section>`;
  }

  function families(box) {
    const rows = T.CATEGORIES.map((cat) => {
      const list = T.CHORDS.filter((c) => c.cat === cat.id);
      const levels = list.map((c) => box(c.id));
      const mastered = levels.filter((l) => l >= 4).length;
      const avg = levels.reduce((a, b) => a + b, 0) / (list.length * 5);
      return `<li style="--c:${cat.color}"><span class="pg-row-name"><b><i class="pg-dot"></i>${PHONE_NAME[cat.id] ? `<span class="lbl-long">${cat.label}</span><span class="lbl-short">${PHONE_NAME[cat.id]}</span>` : cat.label}</b></span>
        <span class="pg-row-bar pg-fambar"><i style="width:${avg * 100}%"></i></span>
        <span class="pg-row-val"><b>${mastered}<small>/${list.length}</small></b><small>mastered</small></span></li>`;
    }).join('');
    return `<section class="pg-panel"><div class="pg-panel-head"><h2>Chord families</h2><p class="pg-note">Bar = average level</p></div><ul class="pg-rows">${rows}</ul></section>`;
  }

  function weakest(S, max) {
    const seen = T.CHORDS.filter((c) => S.stats[c.id] && S.stats[c.id].seen);
    const list = seen
      .map((c) => ({ c, st: S.stats[c.id], p: S.stats[c.id].right / S.stats[c.id].seen }))
      .filter((x) => x.st.box < 4)
      .sort((a, b) => a.st.box - b.st.box || a.p - b.p || b.st.seen - a.st.seen)
      .slice(0, 6);
    const body = list.length
      ? `<div class="pg-weak">${list.map(({ c, st, p }) => {
          const cat = T.catOf(c.cat);
          return `<button class="pg-weak-tile" data-pgchord="${c.id}" style="--c:${cat.color}">
            <span class="tile-sym">${R.symHTML('C', c)}</span>
            <span class="pg-weak-name">${c.name}</span>
            <span class="pg-weak-stat">${Math.round(p * 100)}% · ${st.seen} tr${st.seen === 1 ? 'y' : 'ies'}</span>
            <span class="pg-pips" aria-label="Level ${st.box} of ${max}">${Array.from({ length: max }, (_, i) => `<i class="${i < st.box ? 'on' : ''}"></i>`).join('')}</span>
          </button>`;
        }).join('')}</div>`
      : `<p class="pg-empty-line">${seen.length ? 'Nothing below level 4. Every chord you’ve practiced is mastered.' : 'Chords you miss will show up here.'}</p>`;
    return `<section class="pg-panel"><div class="pg-panel-head"><h2>Needs work</h2><p class="pg-note">Tap to study</p></div>${body}</section>`;
  }

  function keys(ks) {
    const cells = T.ROOT_NAMES.map((k) => {
      const [n, r] = ks[k] || [0, 0];
      const p = pct(r, n);
      // colour runs coral (shaky) → gold → teal (solid); untried keys stay blank
      const tone = p == null ? '' : p >= 85 ? 'good' : p >= 65 ? 'mid' : 'low';
      return `<li class="pg-key ${tone}" title="${T.prettyRoot(k)}: ${n ? `${p}% of ${n}` : 'not practiced'}"><b>${T.prettyRoot(k)}</b><small>${fmtPct(p)}</small></li>`;
    }).join('');
    return `<section class="pg-panel"><div class="pg-panel-head"><h2>By key</h2><p class="pg-note">Spell, Name &amp; Progressions</p></div><ol class="pg-keys">${cells}</ol></section>`;
  }

  function how(max) {
    return `<section class="pg-panel pg-how">
      <div class="pg-panel-head"><h2>How scoring works</h2></div>
      <ul>
        <li>Every chord type and progression has a <b>level from 0 to ${max}</b>. A right answer moves it up 1; a miss drops it 2.</li>
        <li>Level <b>4 or higher</b> counts as <b>mastered</b>.</li>
        <li>The level belongs to the chord type, not the key: C7 and E♭7 both count toward “dominant 7th”.</li>
        <li>Spell, Name and Hear all feed the same level. In Spell, you mark your own answer.</li>
        <li>Low-level chords come up far more often, so practice goes where it’s needed.</li>
      </ul>
    </section>`;
  }

  /**
   * Render the Progress view.
   * ctx: { S, box, pbox, max, isApp, openChord(id), practice(), reset() }
   */
  function render(el, ctx) {
    const { S, box, pbox, max } = ctx;
    const days = S.days || {};
    const all = Object.values(S.stats).concat(Object.values(S.progStats));
    const total = all.reduce((a, s) => a + s.seen, 0);
    const right = all.reduce((a, s) => a + s.right, 0);
    const mastered = T.CHORDS.filter((c) => box(c.id) >= 4).length;
    const pMastered = T.PROGRESSIONS.filter((p) => pbox(p.id) >= 4).length;
    const streak = dayStreak(days);
    const practicedDays = Object.keys(days).length;
    const where = ctx.isApp ? 'Saved on this iPhone' : 'Saved in this browser';

    const tiles = `<dl class="pg-tiles">
      <div class="pg-tile hero"><dt>Day streak</dt><dd>${streak}<small> day${streak === 1 ? '' : 's'}</small></dd>
        <span class="pg-tile-sub">${days[dayKey()] ? 'Practiced today' : streak ? 'Practice today to keep it going' : practicedDays ? 'Start a new one today' : 'Practice today to start one'}</span></div>
      <div class="pg-tile"><dt>Chords mastered</dt><dd>${mastered}<small>/${T.CHORDS.length}</small></dd>
        <span class="mbar"><i style="width:${(mastered / T.CHORDS.length) * 100}%"></i></span></div>
      <div class="pg-tile"><dt>Progressions mastered</dt><dd>${pMastered}<small>/${T.PROGRESSIONS.length}</small></dd>
        <span class="mbar"><i style="width:${(pMastered / T.PROGRESSIONS.length) * 100}%"></i></span></div>
      <div class="pg-tile"><dt>Cards answered</dt><dd>${total.toLocaleString()}</dd></div>
      <div class="pg-tile"><dt>Accuracy</dt><dd>${fmtPct(pct(right, total))}</dd></div>
      <div class="pg-tile"><dt>Best run</dt><dd>${S.best}<small> in a row</small></dd></div>
    </dl>`;

    const empty = !total
      ? `<div class="pg-start"><p>Answer a few cards and your progress shows up here.</p><button class="btn primary" data-pgact="practice">Start practicing</button></div>`
      : '';

    el.innerHTML = `
      <div class="lib-head pg-head">
        <div>
          <h1 class="lib-title">Your progress</h1>
          <p class="lib-sub">${where}. No account needed.</p>
        </div>
      </div>
      ${empty}
      ${tiles}
      <div class="pg-grid">
        ${chart(days)}
        ${weakest(S, max)}
        ${modes(S.modeStats || {})}
        ${keys(S.keyStats || {})}
        ${families(box)}
        ${how(max)}
      </div>
      <p class="pg-reset"><button type="button" class="link-btn" data-pgact="reset">Reset all progress</button></p>`;
  }

  function bind(el, ctx) {
    el.addEventListener('click', (e) => {
      const c = e.target.closest('[data-pgchord]');
      if (c) return ctx.openChord(c.dataset.pgchord);
      const a = e.target.closest('[data-pgact]');
      if (a && a.dataset.pgact === 'practice') ctx.practice();
      if (a && a.dataset.pgact === 'reset') ctx.reset();
    });
  }

  window.Progress = { render, bind, dayKey };
})();
