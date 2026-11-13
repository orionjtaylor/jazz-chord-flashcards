/* App: practice modes, spaced repetition, progressions, library, deck settings. */
(function () {
  const T = window.Theory, R = window.Render, A = window.JazzAudio;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const STORE = 'changes.v1';
  const MAX_BOX = 5;

  const defaults = {
    mode: 'spell', sound: true, best: 0, inv: 'off',
    roots: [...T.ROOT_NAMES], cats: T.CATEGORIES.map((c) => c.id),
    stats: {}, progStats: {}, libRoot: 'C', libChord: 'maj7', libInv: 0,
  };
  const S = load();
  function load() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORE) || '{}')); }
    catch { return { ...defaults }; }
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch {} }
  // chord families added after a visitor saved their deck start switched on
  {
    const known = S.knownCats || S.cats;
    T.CATEGORIES.forEach((c) => { if (!known.includes(c.id) && !S.cats.includes(c.id)) S.cats.push(c.id); });
    S.knownCats = T.CATEGORIES.map((c) => c.id);
  }

  const session = { streak: 0, seen: 0, right: 0 };
  let card = null;
  let view = 'practice';
  let timers = [];

  const HINTS = {
    spell: 'Read the symbol and name every chord tone, in your head or on your instrument. Then flip the card to check.',
    name: 'Read the notes on the staff and keyboard, then choose the matching chord symbol.',
    hear: 'Ear training: listen to the chord and identify its quality. The root changes every time.',
    prog: 'Work out each chord from its Roman numeral in the given key. Tap a chord to check it, or reveal them all and play the progression.',
  };

  const box = (id) => (S.stats[id] ? S.stats[id].box : 0);
  const pbox = (id) => (S.progStats[id] ? S.progStats[id].box : 0);
  const pool = () => {
    let p = T.CHORDS.filter((c) => S.cats.includes(c.cat));
    if (!p.length) p = T.CHORDS;
    if (S.inv === 'only') { const q = p.filter(T.canInvert); p = q.length ? q : T.CHORDS.filter(T.canInvert); }
    return p;
  };
  const roots = () => (S.roots.length ? S.roots : T.ROOT_NAMES);
  const rand = (a) => a[(Math.random() * a.length) | 0];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const bassOf = (root, chord, inv) => (inv ? T.voice(root, chord, inv)[0] : null);

  function weightedPick(list, boxFn) {
    // Leitner-style: low boxes (weak items) come up far more often
    const w = list.map((c) => Math.pow(MAX_BOX + 1 - boxFn(c.id), 2));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) if ((r -= w[i]) <= 0) return list[i];
    return list[list.length - 1];
  }

  function stopTimers() { timers.forEach(clearTimeout); timers = []; $$('.slot.playing').forEach((s) => s.classList.remove('playing')); }
  function playMidis(midis, arp = false) {
    if (!S.sound) return;
    A.play(midis, { arp });
    const v = $('.vinyl');
    if (v) { v.classList.remove('spinning'); void v.offsetWidth; v.classList.add('spinning'); }
  }
  const play = (notes, arp) => playMidis(notes.map((n) => n.midi), arp);
  function playScale(root, id) {
    const ns = T.scaleNotes(root, id);
    playMidis([...ns.map((n) => n.midi), ns[0].midi + 12], true);
  }

  // ───────────────────────── Practice: chord cards
  function newCard() {
    stopTimers();
    if (S.mode === 'prog') return newProg();
    const p = pool();
    let chord, tries = 0;
    do chord = weightedPick(p, box);
    while (card && card.chord && p.length > 1 && chord.id === card.chord.id && ++tries < 12);
    const root = rand(roots());
    let inv = 0;
    if (T.canInvert(chord) && (S.inv === 'only' || (S.inv === 'mix' && Math.random() < 0.5))) inv = 1 + ((Math.random() * (chord.tokens.length - 1)) | 0);
    const notes = T.voice(root, chord, inv);
    card = { kind: 'chord', root, chord, inv, notes, bass: inv ? notes[0] : null, choices: null, answered: null, flipped: false };
    if (S.mode !== 'spell') card.choices = buildChoices(chord, inv, p);
    renderCard(true);
    if (S.mode === 'hear') timers.push(setTimeout(() => play(card.notes), 380));
  }

  function buildChoices(chord, inv, p) {
    const ans = { chord, inv };
    if (S.mode === 'hear') return shuffle([ans, ...T.distractors(chord, p).map((c) => ({ chord: c, inv: 0 }))]);
    let ds = T.distractors(chord, p).map((c) => ({ chord: c, inv: T.canInvert(c) && inv < c.tokens.length ? inv : 0 }));
    if (S.inv !== 'off' && T.canInvert(chord)) {
      // mix in other inversions of the same chord — the real test of reading a slash chord
      const others = shuffle([...Array(chord.tokens.length).keys()].filter((k) => k !== inv)).slice(0, 2);
      ds = [...others.map((k) => ({ chord, inv: k })), ...ds].slice(0, 3);
    }
    return shuffle([ans, ...ds]);
  }

  function frontHTML() {
    const { root, chord, notes, bass } = card;
    const cat = T.catOf(chord.cat);
    if (S.mode === 'spell') {
      return `<div class="front-spell">
        <span class="tag" style="--c:${cat.color}">${cat.label}${card.inv ? ' · inversion' : ''}</span>
        <div class="big-sym">${R.symHTML(root, chord, bass)}</div>
        <p class="prompt">${card.inv
          ? `Spell all ${notes.length} notes, bass note first, and say <b>which inversion</b> it is.`
          : `Spell it. Name all ${notes.length} notes.`}</p>
        <span class="flip-hint"><span class="kb-only"><kbd>Space</kbd> or tap</span><span class="touch-only">Tap</span> to flip</span>
      </div>`;
    }
    if (S.mode === 'name') {
      return `<div class="front-name">
        <span class="tag neutral">${S.inv !== 'off' ? 'What chord is this? Include the bass note' : 'What chord is this?'}</span>
        <div class="visuals">
          <div class="vis-staff">${R.staffSVG(notes, { highlightRoot: false })}</div>
          <div class="vis-keys">${R.keyboardSVG(notes, { labels: false })}</div>
        </div>
        <button class="btn ghost small" data-act="play">${playIcon()} Play</button>
        ${invHint()}
      </div>`;
    }
    return `<div class="front-hear">
      <span class="tag neutral">Ear training</span>
      <button class="vinyl" data-act="play" aria-label="Play the chord">
        <span class="vinyl-label"><b>Changes</b><small>Side A · ${notes.length} notes</small></span>
      </button>
      <div class="play-row">
        <button class="btn ghost small" data-act="play">${playIcon()} Again</button>
        <button class="btn ghost small" data-act="arp">${arpIcon()} Arpeggio</button>
      </div>
      <p class="prompt">What quality is this chord?</p>
      ${invHint()}
    </div>`;
  }

  /** Inversion instructions. In "mixed" decks the text is the same for every card, so it never gives away whether this one is inverted. */
  function invHint() {
    if (S.inv === 'off') return '';
    if (S.mode === 'hear') return `<p class="inv-hint">${S.inv === 'only' ? 'Every chord is inverted' : 'It may be inverted'}. Name the quality only; the bass note doesn't matter.</p>`;
    return `<p class="inv-hint">${S.inv === 'only'
      ? 'Every card is an inversion. Pick the slash chord with the right bass note.'
      : 'It may be inverted. Check which chord tone is in the bass, and pick the slash chord if it isn\'t the root.'}</p>`;
  }

  function backHTML() {
    const { root, chord, notes, bass, inv } = card;
    const cat = T.catOf(chord.cat);
    return `<div class="back-wrap">
      <div class="back-head">
        <div class="back-sym">${R.symHTML(root, chord, bass)}</div>
        <div class="back-title">
          <span class="tag" style="--c:${cat.color}">${cat.label}</span>
          <h2>${T.title(root, chord)}</h2>
          ${chord.equiv ? `<p class="equiv">≈ ${chord.equiv}</p>` : ''}
          ${T.canInvert(chord) ? `<p class="inv-name">${T.invName(chord, inv)}</p>` : ''}
          ${chord.alts.length ? `<p class="alts">Also written ${chord.alts.map((a) => `<span>${T.prettyRoot(root)}${T.pretty(a)}${bass ? '/' + bass.name : ''}</span>`).join('')}</p>` : ''}
        </div>
      </div>
      ${R.notePills(notes)}
      <div class="visuals">
        <div class="vis-staff">${R.staffSVG(notes, { labels: true })}</div>
        <div class="vis-keys">${R.keyboardSVG(notes)}</div>
      </div>
      <div class="back-foot">
        <p class="desc">${chord.desc}</p>
        <div class="play-row">
          <button class="btn ghost small" data-act="play">${playIcon()} Chord</button>
          <button class="btn ghost small" data-act="arp">${arpIcon()} Arpeggio</button>
        </div>
      </div>
      ${R.scaleList(root, chord)}
    </div>`;
  }

  const playIcon = () => '<svg viewBox="0 0 24 24" aria-hidden="true" class="i"><path d="M7 5l12 7-12 7z"/></svg>';
  const arpIcon = () => '<svg viewBox="0 0 24 24" aria-hidden="true" class="i"><rect x="3" y="15" width="4" height="5" rx="1"/><rect x="10" y="10" width="4" height="10" rx="1"/><rect x="17" y="5" width="4" height="15" rx="1"/></svg>';

  function renderCard(fresh) {
    const el = $('#card');
    if (fresh) { el.classList.add('no-anim'); el.classList.remove('flipped', 'enter', 'shake'); }
    el.classList.toggle('is-prog', card.kind === 'prog');
    if (card.kind === 'prog') {
      el.style.setProperty('--c', 'var(--gold)');
      el.style.setProperty('--front-c', 'var(--gold)');
      $('#front').innerHTML = progHTML();
      $('#back').innerHTML = '';
    } else {
      const cat = T.catOf(card.chord.cat);
      el.style.setProperty('--c', cat.color);
      el.style.setProperty('--front-c', S.mode === 'spell' ? cat.color : 'var(--gold)');
      $('#front').innerHTML = frontHTML();
      $('#back').innerHTML = backHTML();
    }
    $('#front').setAttribute('aria-hidden', card.flipped ? 'true' : 'false');
    $('#back').setAttribute('aria-hidden', card.flipped ? 'false' : 'true');
    sizeCard();
    if (fresh) { void el.offsetWidth; el.classList.remove('no-anim'); el.classList.add('enter'); }
    renderControls();
  }

  function setFlipped(v) {
    card.flipped = v;
    $('#card').classList.toggle('flipped', v);
    $('#front').setAttribute('aria-hidden', v ? 'true' : 'false');
    $('#back').setAttribute('aria-hidden', v ? 'false' : 'true');
    sizeCard();
  }

  /** The card is as tall as its visible face, not the taller of the two. */
  function sizeCard() {
    if (!card) return;
    const inner = $('.card-inner');
    const h = (card.flipped ? $('#back') : $('#front')).scrollHeight;
    inner.style.height = h + 'px';
    inner.style.setProperty('--h', h + 'px');
  }
  window.addEventListener('resize', () => sizeCard());

  function flip() {
    if (S.mode !== 'spell' || card.flipped) return;
    setFlipped(true);
    play(card.notes);
    renderControls();
  }

  function gradeButtons() {
    return `<button class="btn miss" data-act="miss"><span>✕</span> Missed it <kbd>1</kbd></button>
            <button class="btn got" data-act="got"><span>✓</span> Got it <kbd>2</kbd></button>`;
  }

  function renderControls() {
    const c = $('#controls');
    c.className = 'controls';
    if (card.kind === 'prog') {
      const all = card.revealed.size === card.steps.length;
      c.innerHTML = all ? gradeButtons()
        : `<button class="btn primary wide" data-act="revealall">Reveal all chords <kbd>Space</kbd></button>`;
      return;
    }
    if (S.mode === 'spell') {
      c.innerHTML = !card.flipped
        ? `<button class="btn primary wide" data-act="flip">Reveal the notes <kbd>Space</kbd></button>`
        : gradeButtons();
      return;
    }
    c.className = 'controls choices' + (card.answered != null ? ' answered' : '');
    const btns = card.choices.map((ch, i) => {
      let st = '';
      if (card.answered != null) {
        if (isRight(ch)) st = 'correct';
        else if (i === card.answered) st = 'wrong';
        else st = 'dim';
      }
      const label = S.mode === 'name'
        ? `<span class="choice-sym">${R.symHTML(card.root, ch.chord, bassOf(card.root, ch.chord, ch.inv))}</span>`
        : `<span class="choice-sym q">${T.qualityLabel(ch.chord)}</span><span class="choice-name">${ch.chord.name}</span>`;
      return `<button class="choice ${st}" data-choice="${i}" ${card.answered != null ? 'tabindex="-1"' : ''}><kbd>${i + 1}</kbd>${label}</button>`;
    }).join('');
    const next = card.answered != null ? `<button class="btn primary next" data-act="next">Next card <kbd>Enter</kbd></button>` : '';
    c.innerHTML = `<div class="choice-grid">${btns}</div>${next}`;
    if (card.answered != null) $('.next', c).focus({ preventScroll: true });
  }

  const isRight = (ch) => ch.chord.id === card.chord.id && (S.mode === 'hear' || ch.inv === card.inv);

  function bump(statsObj, id, ok) {
    const st = (statsObj[id] ||= { box: 0, seen: 0, right: 0 });
    st.seen++;
    if (ok) { st.right++; st.box = Math.min(MAX_BOX, st.box + 1); }
    else st.box = Math.max(0, st.box - 2);
  }

  function grade(ok) {
    if (card.kind === 'prog') bump(S.progStats, card.prog.id, ok);
    else bump(S.stats, card.chord.id, ok);
    session.seen++;
    if (ok) { session.right++; session.streak++; S.best = Math.max(S.best, session.streak); }
    else session.streak = 0;
    save();
    renderStats(ok);
  }

  function answer(i) {
    if (card.kind !== 'chord' || S.mode === 'spell' || card.answered != null || !card.choices[i]) return;
    const ok = isRight(card.choices[i]);
    card.answered = i;
    grade(ok);
    renderControls();
    const el = $('#card');
    if (!ok) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
    timers.push(setTimeout(() => {
      setFlipped(true);
      if (S.mode === 'name') play(card.notes);
    }, ok ? 220 : 520));
  }

  function selfGrade(ok) {
    const ready = card.kind === 'prog' ? card.revealed.size === card.steps.length : S.mode === 'spell' && card.flipped;
    if (!ready) return;
    grade(ok);
    newCard();
  }

  // ───────────────────────── Practice: progressions
  function newProg() {
    let prog, tries = 0;
    do prog = weightedPick(T.PROGRESSIONS, pbox);
    while (card && card.prog && prog.id === card.prog.id && ++tries < 12);
    const key = rand(roots());
    card = { kind: 'prog', prog, key, steps: T.realise(prog, key), revealed: new Set(), flipped: false };
    renderCard(true);
  }

  const romanHTML = (r) => {
    const m = r.match(/^([♭♯]?[ivIV]+)(.*)$/);
    return m ? `<b>${m[1]}</b><sup>${m[2]}</sup>` : `<b>${r}</b>`;
  };

  function slotHTML(s, i) {
    const open = card.revealed.has(i);
    const scale = T.scalesFor(s.chord)[0];
    return `<li class="slot ${open ? 'open' : ''}" data-slot="${i}" style="--c:${T.catOf(s.chord.cat).color}">
      <button class="slot-btn" aria-label="${open ? 'Play' : 'Reveal'} chord ${i + 1}">
        <span class="roman">${romanHTML(s.roman)}</span>
        <span class="slot-face">${open
          ? `<span class="slot-sym">${R.symHTML(s.root, s.chord)}</span>
             <span class="slot-notes">${s.notes.map((n) => n.name).join(' ')}</span>
             ${scale ? `<span class="slot-scale">${scale.name}</span>` : ''}`
          : '<span class="slot-q">?</span>'}</span>
      </button>
    </li>`;
  }

  function progHTML() {
    const { prog, key, steps } = card;
    return `<div class="prog">
      <div class="prog-head">
        <div>
          <span class="tag" style="--c:var(--gold)">Progression · ${steps.length} chords</span>
          <h2 class="prog-name">${prog.name}</h2>
          <p class="desc">${prog.desc}</p>
        </div>
        <div class="prog-key"><small>Key</small><b>${R.symHTML(key, { sym: '' })}</b><small>${prog.mode}</small></div>
      </div>
      <ol class="prog-row">${steps.map(slotHTML).join('')}</ol>
      <div class="play-row center">
        <button class="btn ghost small" data-act="playprog">${playIcon()} Play progression <kbd>P</kbd></button>
      </div>
    </div>`;
  }

  function revealSlot(i, sound = true) {
    card.revealed.add(i);
    const li = $(`.slot[data-slot="${i}"]`);
    if (li) li.outerHTML = slotHTML(card.steps[i], i);
    $(`.slot[data-slot="${i}"]`)?.classList.add('just');
    if (sound) playMidis(card.steps[i].midis);
    renderControls();
    sizeCard();
  }

  function playProg() {
    stopTimers();
    card.steps.forEach((s, i) => {
      timers.push(setTimeout(() => {
        $$('.slot.playing').forEach((x) => x.classList.remove('playing'));
        $(`.slot[data-slot="${i}"]`)?.classList.add('playing');
        playMidis(s.midis);
      }, i * 1150));
    });
    timers.push(setTimeout(() => $$('.slot.playing').forEach((x) => x.classList.remove('playing')), card.steps.length * 1150 + 600));
  }

  function renderStats(pulse) {
    const acc = session.seen ? Math.round((session.right / session.seen) * 100) + '%' : '—';
    const mastered = T.CHORDS.filter((c) => box(c.id) >= 4).length;
    $('#stats').innerHTML = `
      <div class="${pulse === true ? 'pulse' : ''}"><dt>Streak</dt><dd>${session.streak}</dd></div>
      <div><dt>Best</dt><dd>${S.best}</dd></div>
      <div><dt>Accuracy</dt><dd>${acc}</dd></div>
      <div><dt>Cards</dt><dd>${session.seen}</dd></div>
      <div class="mastery"><dt>Chords mastered</dt><dd>${mastered}<small>/${T.CHORDS.length}</small></dd>
        <span class="mbar"><i style="width:${(mastered / T.CHORDS.length) * 100}%"></i></span></div>`;
  }

  function setMode(m) {
    if (!HINTS[m]) m = 'spell';
    S.mode = m;
    save();
    $$('#mode-seg button').forEach((b) => {
      const on = b.dataset.mode === m;
      b.classList.toggle('active', on);
      b.setAttribute('aria-checked', on);
    });
    $('#mode-hint').textContent = HINTS[m];
    card = null;
    newCard();
  }

  // ───────────────────────── Deck dialog
  function deckCount() {
    $('#deck-count').textContent = `${pool().length} chords · ${roots().length} keys${S.inv !== 'off' ? ' · inversions' : ''}`;
  }

  function renderDialog() {
    $('#dlg-roots').innerHTML = T.ROOT_NAMES.map((r) =>
      `<button type="button" class="chip ${S.roots.includes(r) ? 'on' : ''}" data-root="${r}" aria-pressed="${S.roots.includes(r)}">${T.prettyRoot(r)}</button>`).join('');
    $('#dlg-cats').innerHTML = T.CATEGORIES.map((c) => {
      const n = T.CHORDS.filter((x) => x.cat === c.id).length;
      const on = S.cats.includes(c.id);
      return `<button type="button" class="chip cat ${on ? 'on' : ''}" style="--c:${c.color}" data-cat="${c.id}" aria-pressed="${on}"><i></i>${c.label}<small>${n}</small></button>`;
    }).join('');
    $$('#dlg-inv button').forEach((b) => { const on = b.dataset.inv === S.inv; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
  }

  function toggleIn(arr, v) { const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v); }

  // ───────────────────────── Library
  function libChord() { return T.CHORDS.find((c) => c.id === S.libChord) || T.CHORDS[0]; }

  function renderLibrary() {
    $('#lib-roots').innerHTML = T.ROOT_NAMES.map((r) =>
      `<button role="radio" aria-checked="${r === S.libRoot}" class="chip ${r === S.libRoot ? 'on' : ''}" data-libroot="${r}">${T.prettyRoot(r)}</button>`).join('');
    $('#lib-cats').innerHTML = T.CATEGORIES.map((cat) => {
      const list = T.CHORDS.filter((c) => c.cat === cat.id);
      return `<section class="lib-cat" style="--c:${cat.color}">
        <h3><i></i>${cat.label}<small>${list.length}</small></h3>
        <div class="lib-grid">${list.map((c) => `
          <button class="tile ${c.id === S.libChord ? 'sel' : ''}" data-chord="${c.id}" aria-pressed="${c.id === S.libChord}">
            <span class="tile-sym">${R.symHTML(S.libRoot, c)}</span>
            <span class="tile-name">${c.name}</span>
            <span class="meter" title="Mastery ${box(c.id)}/${MAX_BOX}"><i style="width:${(box(c.id) / MAX_BOX) * 100}%"></i></span>
          </button>`).join('')}
        </div></section>`;
    }).join('');
    renderDetail();
  }

  function libNotes() {
    const chord = libChord();
    if (!T.canInvert(chord) || S.libInv >= chord.tokens.length) S.libInv = 0;
    return T.voice(S.libRoot, chord, S.libInv);
  }

  function renderDetail() {
    const chord = libChord();
    const notes = libNotes();
    const bass = S.libInv ? notes[0] : null;
    const cat = T.catOf(chord.cat);
    const st = S.stats[chord.id];
    const invs = T.canInvert(chord)
      ? `<div class="inv-switch" role="radiogroup" aria-label="Inversion">${chord.tokens.map((_, k) =>
          `<button role="radio" aria-checked="${k === S.libInv}" class="${k === S.libInv ? 'on' : ''}" data-libinv="${k}">${k === 0 ? 'Root' : ['', '1st', '2nd', '3rd'][k]}</button>`).join('')}</div>
         <p class="inv-name">${T.invName(chord, S.libInv)}</p>`
      : '';
    $('#lib-detail').style.setProperty('--c', cat.color);
    $('#lib-detail').innerHTML = `
      <div class="detail-card">
        <span class="tag" style="--c:${cat.color}">${cat.label}</span>
        <div class="detail-sym">${R.symHTML(S.libRoot, chord, bass)}</div>
        <h2>${chord.upper ? T.title(S.libRoot, chord) : chord.name}</h2>
        ${chord.equiv ? `<p class="equiv">${chord.name} · ≈ ${chord.equiv}</p>` : ''}
        ${chord.alts.length ? `<p class="alts">Also written ${chord.alts.map((a) => `<span>${T.prettyRoot(S.libRoot)}${T.pretty(a)}</span>`).join('')}</p>` : ''}
        <p class="formula">${(chord.upper ? notes.map((n) => n.label.replace('R', '1')) : chord.tokens.map((t) => T.pretty(t))).map((t) => `<span>${t}</span>`).join('')}</p>
        ${invs}
        ${R.notePills(notes)}
        <div class="vis-staff">${R.staffSVG(notes, { labels: true })}</div>
        <div class="vis-keys">${R.keyboardSVG(notes)}</div>
        <p class="desc">${chord.desc}</p>
        <div class="play-row">
          <button class="btn ghost small" data-libplay="chord">${playIcon()} Chord</button>
          <button class="btn ghost small" data-libplay="arp">${arpIcon()} Arpeggio</button>
        </div>
        ${R.scaleList(S.libRoot, chord)}
        <p class="detail-stat">${st ? `Practiced ${st.seen}× · ${Math.round((st.right / st.seen) * 100)}% correct · level ${st.box}/${MAX_BOX}` : 'Not practiced yet'}</p>
      </div>`;
  }

  function setView(v) {
    view = v;
    stopTimers();
    $$('.tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.view === v);
      t.setAttribute('aria-current', t.dataset.view === v ? 'page' : 'false');
    });
    $('#view-practice').hidden = v !== 'practice';
    $('#view-library').hidden = v !== 'library';
    $('#view-learn').hidden = v !== 'learn';
    if (v === 'library') renderLibrary();
    else if (v === 'learn') mountLearn();
    else renderStats();
    window.scrollTo(0, 0);
  }

  let learnMounted = false;
  function mountLearn() {
    if (learnMounted || !window.Learn) return;
    learnMounted = true;
    window.Learn.mount($('#view-learn'), {
      play: (notes, arp) => play(notes, arp),
      openChord: (root, id) => {
        S.libRoot = root; S.libChord = id; S.libInv = 0; save();
        setView('library');
        play(libNotes());
        if (window.matchMedia('(max-width: 900px)').matches) $('#lib-detail').scrollIntoView({ block: 'start' });
        else $(`.tile[data-chord="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'center' });
      },
    });
  }

  function renderSound() {
    const b = $('#sound-btn');
    b.setAttribute('aria-pressed', S.sound);
    b.classList.toggle('muted', !S.sound);
  }

  // ───────────────────────── Events
  $$('.tab').forEach((t) => t.addEventListener('click', () => setView(t.dataset.view)));
  $('.brand').addEventListener('click', (e) => { e.preventDefault(); setView('practice'); });
  $$('#mode-seg button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  $('#sound-btn').addEventListener('click', () => { S.sound = !S.sound; save(); renderSound(); });

  $('#card').addEventListener('click', (e) => {
    const sc = e.target.closest('[data-scale]');
    if (sc) { e.stopPropagation(); return playScale(card.root, sc.dataset.scale); }
    const slot = e.target.closest('[data-slot]');
    if (slot) {
      const i = +slot.dataset.slot;
      return card.revealed.has(i) ? playMidis(card.steps[i].midis) : revealSlot(i);
    }
    const act = e.target.closest('[data-act]');
    if (act) {
      e.stopPropagation();
      const a = act.dataset.act;
      if (a === 'play') play(card.notes);
      if (a === 'arp') play(card.notes, true);
      if (a === 'playprog') playProg();
      return;
    }
    if (card.kind === 'chord' && S.mode === 'spell' && !card.flipped) flip();
  });

  $('#controls').addEventListener('click', (e) => {
    const ch = e.target.closest('[data-choice]');
    if (ch) return answer(+ch.dataset.choice);
    const act = e.target.closest('[data-act]');
    if (!act) return;
    ({
      flip, next: newCard,
      miss: () => selfGrade(false), got: () => selfGrade(true),
      revealall: () => { card.steps.forEach((_, i) => card.revealed.has(i) || revealSlot(i, false)); playProg(); },
    })[act.dataset.act]?.();
  });

  const dlg = $('#deck-dialog');
  $('#deck-btn').addEventListener('click', () => { renderDialog(); dlg.showModal(); });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) return dlg.close();
    const r = e.target.closest('[data-root]');
    const c = e.target.closest('[data-cat]');
    const rq = e.target.closest('[data-roots]');
    const cq = e.target.closest('[data-cats]');
    const iv = e.target.closest('[data-inv]');
    if (r) toggleIn(S.roots, r.dataset.root);
    if (c) toggleIn(S.cats, c.dataset.cat);
    if (rq) S.roots = rq.dataset.roots === 'all' ? [...T.ROOT_NAMES] : rq.dataset.roots === 'common' ? ['C', 'F', 'Bb', 'Eb', 'G', 'D'] : ['C'];
    if (cq) S.cats = cq.dataset.cats === 'all' ? T.CATEGORIES.map((x) => x.id) : ['major', 'minor', 'dominant', 'dim'];
    if (iv) S.inv = iv.dataset.inv;
    if (r || c || rq || cq || iv) { save(); renderDialog(); deckCount(); }
  });
  $('#reset-progress').addEventListener('click', () => {
    if (!confirm('Reset all chord progress and your best streak?')) return;
    S.stats = {}; S.progStats = {}; S.best = 0; session.streak = session.seen = session.right = 0;
    save(); renderStats();
  });
  dlg.addEventListener('close', () => { if (!S.roots.length) S.roots = [...T.ROOT_NAMES]; save(); deckCount(); card = null; newCard(); });

  $('#lib-roots').addEventListener('click', (e) => {
    const b = e.target.closest('[data-libroot]');
    if (b) { S.libRoot = b.dataset.libroot; save(); renderLibrary(); }
  });
  $('#lib-cats').addEventListener('click', (e) => {
    const b = e.target.closest('[data-chord]');
    if (!b) return;
    S.libChord = b.dataset.chord; S.libInv = 0; save();
    $$('.tile').forEach((t) => { const on = t === b; t.classList.toggle('sel', on); t.setAttribute('aria-pressed', on); });
    renderDetail();
    play(libNotes());
    if (window.matchMedia('(max-width: 900px)').matches) $('#lib-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#lib-detail').addEventListener('click', (e) => {
    const b = e.target.closest('[data-libplay]');
    if (b) return play(libNotes(), b.dataset.libplay === 'arp');
    const iv = e.target.closest('[data-libinv]');
    if (iv) { S.libInv = +iv.dataset.libinv; save(); renderDetail(); return play(libNotes()); }
    const sc = e.target.closest('[data-scale]');
    if (sc) playScale(S.libRoot, sc.dataset.scale);
  });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || dlg.open) return;
    const k = e.key.toLowerCase();
    if (k === 'm') { S.sound = !S.sound; save(); renderSound(); return; }
    if (view !== 'practice' || !card) return;
    const onButton = e.target.tagName === 'BUTTON';
    if (card.kind === 'prog') {
      const all = card.revealed.size === card.steps.length;
      if (k === 'p') playProg();
      else if (k === ' ' && !all && !onButton) { e.preventDefault(); $('[data-act="revealall"]').click(); }
      else if (all && k === '1') selfGrade(false);
      else if (all && k === '2') selfGrade(true);
      return;
    }
    if (k === 'p') return play(card.notes);
    if (S.mode === 'spell') {
      if (k === ' ' && !card.flipped) { e.preventDefault(); flip(); }
      else if (card.flipped && k === '1') selfGrade(false);
      else if (card.flipped && k === '2') selfGrade(true);
      return;
    }
    if (/^[1-4]$/.test(k)) answer(+k - 1);
    else if (k === ' ' && !onButton) { e.preventDefault(); play(card.notes); }
    else if ((k === 'enter' || k === 'arrowright') && card.answered != null && !onButton) newCard();
  });

  // ───────────────────────── Boot
  renderSound();
  deckCount();
  renderStats();
  setMode(S.mode);
  document.fonts?.ready.then(() => sizeCard());
})();
