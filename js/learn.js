/* Learn: an illustrated guide to what each chord family is, how it sounds and how it's used. */
(function () {
  const T = window.Theory, R = window.Render;

  const FAMILIES = [
    {
      cat: 'major', formula: ['1', '3', '5', '7'], role: 'Home base (I, IV)', feel: 'Bright, stable, at rest',
      examples: ['maj7', '69', 'maj7#11'],
      what: 'A <b>major 3rd</b> (4 half steps) above the root, plus a perfect 5th. In jazz the triad almost always gets a color note on top: a <b>major 7th</b> (maj7) or a <b>6th</b> (6, 6/9).',
      sound: 'Bright and settled. This is the sound of "arriving home." The major 7th adds a lush, slightly bittersweet shimmer; the 6th sounds sweeter and more old-school.',
      where: 'The tonic <b>I chord</b> at the end of a ii–V–I, and the <b>IV chord</b>. A plain "C" on a lead sheet usually means "play some kind of C major chord," and most players add a 6th, 7th or 9th.',
      symbols: 'maj7, Δ7, M7 and ma7 all mean the same thing. "6/9" stacks the 6th and 9th. A ♯11 (maj7♯11) gives the Lydian sound.',
      tip: 'Avoid the natural 11 on major chords: it sits a half step above the 3rd and clashes. Use ♯11 instead.',
    },
    {
      cat: 'minor', formula: ['1', 'b3', '5', 'b7'], role: 'ii chord, minor tonic', feel: 'Darker, soft, still stable',
      examples: ['m7', 'm6', 'mmaj7'],
      what: 'A <b>minor 3rd</b> (3 half steps) above the root. The most common version adds a <b>♭7</b> (m7). For a minor-key tonic, players often use a <b>6th</b> (m6) or a <b>major 7th</b> (m(maj7)) instead.',
      sound: 'Darker and more inward than major, but still at rest. m7 is mellow; m6 sounds noir and cool; m(maj7) is tense and cinematic.',
      where: 'The <b>ii chord</b> of a ii–V–I (Dm7 in C) is the single most common chord in jazz. Also the iii and vi chords, and the tonic of minor-key tunes.',
      symbols: 'm, mi, min and "−" all mean minor: Cm7 = C−7 = Cmi7. Extensions stack on top: m9, m11, m13.',
      tip: 'Unlike on major chords, the natural 11 sounds great on minor chords: m11 is a classic modal sound.',
    },
    {
      cat: 'dominant', formula: ['1', '3', '5', 'b7'], role: 'V chord, blues', feel: 'Tense, wants to move',
      examples: ['7', '9', '13'],
      what: 'A <b>major 3rd</b> with a <b>♭7</b>. The 3rd and ♭7 form a <b>tritone</b> (three whole steps), the most unstable interval in tonal music, and that tension is what makes the chord want to resolve.',
      sound: 'Restless and forward-leaning. It pulls toward the chord a 5th below: G7 wants to go to C. Add the 9 and 13 for a fuller, swinging big-band sound.',
      where: 'The <b>V chord</b> of every ii–V–I, secondary dominants (A7 → Dm7), and the blues, where even the I and IV chords are dominant 7ths.',
      symbols: 'A plain number with no "maj" or "m" means dominant: C7, C9, C13. The number is the highest extension, and the ♭7 is implied.',
      tip: 'The 3rd and ♭7 are the "guide tones." Voice just those two and you already hear the chord.',
    },
    {
      cat: 'altered', formula: ['1', '3', 'b7', 'b9/#9', '#11', 'b13'], role: 'Extra-tense V chord', feel: 'Crunchy, dark, urgent',
      examples: ['7b9', '7#9', '7alt'],
      what: 'A dominant 7th with one or more <b>altered tensions</b>: the 9th, 11th or 13th raised or lowered by a half step (♭9, ♯9, ♯11/♭5, ♭13/♯5).',
      sound: 'More tension than a plain dominant, so the resolution feels stronger. ♭9 is dark and Spanish; ♯9 is gritty and bluesy; ♭13 pulls downward.',
      where: 'Mostly on <b>V chords resolving to minor</b> (G7♭9 → Cm), and anywhere a player wants extra pull. In minor ii–V–i progressions it is close to mandatory.',
      symbols: 'Alterations are written after the number: C7♭9, C7♯9♭13. "<b>C7alt</b>" means "use the altered scale": play any mix of ♭9, ♯9, ♯11 and ♭13, and leave out the natural 5th and 9th.',
      tip: 'Rule of thumb: natural tensions (9, 13) for dominants going to major, altered tensions for dominants going to minor.',
    },
    {
      cat: 'sus', formula: ['1', '4', '5', 'b7'], role: 'Floating V, modal vamps', feel: 'Open, ambiguous, floating',
      examples: ['7sus4', '9sus4', '7sus4b9'],
      what: 'The 3rd is <b>replaced by the 4th</b> (sus4) or 2nd (sus2). Without a 3rd the chord is neither major nor minor, and without the 3rd–♭7 tritone a 7sus4 has no built-in urge to resolve.',
      sound: 'Suspended and open, like a held breath. Modern and spacious rather than bluesy.',
      where: 'As a softer <b>V chord</b> (G9sus4 → Cmaj7, or G7sus4 → G7), and in modal tunes such as "Maiden Voyage," where sus chords are the whole tune.',
      symbols: '"sus" alone means sus4. 9sus4 is often written as a slash chord: G9sus4 ≈ F/G. 7sus4♭9 (sus♭9) is the darker Phrygian version.',
      tip: 'Hear a dominant that won\'t settle? It\'s probably a sus chord.',
    },
    {
      cat: 'dim', formula: ['1', 'b3', 'b5', 'bb7 / b7'], role: 'Passing chords, minor ii', feel: 'Unstable, mysterious',
      examples: ['dim7', 'm7b5', 'dim'],
      what: 'Built from <b>stacked minor 3rds</b>. The <b>diminished 7th</b> (°7) uses only minor 3rds, so it\'s perfectly symmetrical. The <b>half-diminished</b> (ø7, m7♭5) has a regular ♭7 on top.',
      sound: '°7 is tense and dramatic, like a silent-film chase. ø7 is softer, darker and more melancholy.',
      where: '<b>°7</b> is a passing chord between diatonic chords (Cmaj7 – C♯°7 – Dm7) and can stand in for a 7♭9. <b>ø7</b> is the ii chord of a minor ii–V–i (Dø7 – G7♭9 – Cm).',
      symbols: 'dim, °, o = diminished. m7♭5, ø7, −7♭5 = half-diminished. Note the spelling: C°7 is C E♭ G♭ B𝄫, with a double flat.',
      tip: 'Because °7 is symmetrical, C°7, E♭°7, G♭°7 and A°7 share the same four notes. There are only three different diminished 7th chords.',
    },
    {
      cat: 'aug', formula: ['1', '3', '#5'], role: 'Passing chords, color', feel: 'Dreamy, unresolved, rising',
      examples: ['aug', 'maj7#5', '7#5'],
      what: 'A major triad with a <b>raised 5th</b>, which makes two stacked major 3rds. Like °7 it\'s symmetrical: C+, E+ and G♯+ share the same notes.',
      sound: 'Floating and unresolved, with a sense of rising. The ♯5 wants to keep moving up.',
      where: 'Passing chords that move a line chromatically (C – C+ – C6 – C7), the "Lydian augmented" color maj7♯5, and dominants like 7♯5 heading to the next chord.',
      symbols: 'aug, + and (♯5) all mean augmented. C+7 = C7♯5; C+Δ7 = Cmaj7♯5.',
      tip: 'Hear a whole-tone, dream-sequence sound? That\'s augmented harmony.',
    },
    {
      cat: 'slash', formula: ['triad', '/', 'bass'], role: 'Modern colors, bass lines', feel: 'Open, modern, cinematic',
      examples: ['sl-bVII', 'sl-II', 'sl-bII'],
      what: '"X/Y" means <b>chord X with note Y in the bass</b>. If Y is in the chord (C/E), it\'s just an <b>inversion</b>. If Y is <i>not</i> in the chord (F/G), it\'s a <b>hybrid chord</b>: the triad and bass combine into a richer sound, usually with no 3rd.',
      sound: 'Open and modern, without the "pull" of a 3rd. F/G floats like a sus chord; D/C shimmers like Lydian.',
      where: 'Modern jazz, fusion, film and gospel. <b>F/G</b> (IV/V) is a very common replacement for G7. Slash chords also spell out moving bass lines.',
      symbols: 'Read the left side as the chord and the right side as the bass: D/C = D major triad over C. Each hybrid has a "real" name (F/G ≈ G9sus4), but the slash version is easier to read.',
      tip: 'Pianists: right hand plays the triad, left hand plays the bass note. That\'s the whole voicing.',
    },
    {
      cat: 'upper', formula: ['triad', '—', '1 3 ♭7'], role: 'Rich dominant voicings', feel: 'Lush, bright to very tense',
      examples: ['us-bVI', 'us-II', 'us-VI'],
      what: 'A <b>triad stacked on top of a dominant 7th</b>. The bottom (root, 3rd, ♭7) defines the chord; the triad on top supplies three tensions at once. An A♭ triad over C7 gives ♭13, root and ♯9, which together make C7alt.',
      sound: 'Depends on the triad: II (D/C7) is bright Lydian; ♭VI (A♭/C7) is dark and altered; VI (A/C7) is sweet but tense.',
      where: 'Piano and big-band voicings on dominant chords. It\'s a way of <i>thinking</i> about complex chords as much as a way of writing them.',
      symbols: 'Written as a <b>fraction with a horizontal line</b> (triad over chord) to tell it apart from a slash chord. Many charts simply write the full name (C13♯11, C7♯5♯9).',
      tip: 'Learn the six common upper structures and you can voice almost any altered dominant with two simple shapes.',
    },
  ];

  const CONCEPTS = [
    ['Extensions', '9, 11 and 13 are just 2, 4 and 6 an octave higher, stacked above the 7th. A 13 chord implies the 7th and 9th too (the 11 is usually left out).'],
    ['Alterations', 'Extensions moved up or down a half step: ♭9, ♯9, ♯11, ♭13. Normally only used on dominant chords, where they add tension.'],
    ['Avoid notes', 'A note a half step above an important chord tone tends to clash, such as the natural 11 over a major 3rd. Players leave it out or raise it (♯11).'],
    ['Inversions', 'Same notes, different bottom note. 1st inversion has the 3rd in the bass, 2nd the 5th, 3rd the 7th. Written as slash chords: C/E, C/G, Cmaj7/B.'],
    ['Guide tones', 'The 3rd and 7th define a chord\'s quality. Moving smoothly between them from chord to chord is the core of jazz voice leading.'],
    ['Chord–scale', 'Every chord implies a scale to improvise with: Dorian on m7, Mixolydian on 7, Lydian on maj7♯11, altered on 7alt. Each chord in the library lists its scales.'],
  ];

  const svgPlay = '<svg viewBox="0 0 24 24" aria-hidden="true" class="i"><path d="M7 5l12 7-12 7z"/></svg>';
  const svgArp = '<svg viewBox="0 0 24 24" aria-hidden="true" class="i"><rect x="3" y="15" width="4" height="5" rx="1"/><rect x="10" y="10" width="4" height="10" rx="1"/><rect x="17" y="5" width="4" height="15" rx="1"/></svg>';
  const chordById = (id) => T.CHORDS.find((c) => c.id === id);
  const fml = (t) => T.pretty(t);

  let root = 'C';
  const picked = {}; // family -> example chord id

  function exampleHTML(fam) {
    const id = picked[fam.cat] || fam.examples[0];
    const chord = chordById(id);
    const notes = T.voice(root, chord);
    return `
      <div class="ex-tabs" role="tablist" aria-label="Examples">${fam.examples.map((x) => {
        const c = chordById(x);
        return `<button role="tab" aria-selected="${x === id}" class="${x === id ? 'on' : ''}" data-ex="${fam.cat}:${x}">${R.symHTML(root, c)}</button>`;
      }).join('')}</div>
      <div class="ex-title">${T.title(root, chord)}${chord.equiv ? `<span class="ex-equiv">≈ ${chord.equiv}</span>` : ''}</div>
      ${R.notePills(notes)}
      <div class="vis-staff">${R.staffSVG(notes, { labels: true })}</div>
      <div class="vis-keys">${R.keyboardSVG(notes)}</div>
      <div class="play-row">
        <button class="btn ghost small" data-lplay="${id}">${svgPlay} Chord</button>
        <button class="btn ghost small" data-larp="${id}">${svgArp} Arpeggio</button>
      </div>`;
  }

  function familyHTML(fam, i) {
    const cat = T.catOf(fam.cat);
    const members = T.CHORDS.filter((c) => c.cat === fam.cat);
    return `<article class="fam" id="learn-${fam.cat}" style="--c:${cat.color}">
      <header class="fam-head">
        <span class="fam-num">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h2>${cat.label}</h2>
          <p class="fam-sum">${fam.feel}</p>
        </div>
        <div class="fam-formula" aria-label="Formula">${fam.formula.map((t) => `<span>${fml(t)}</span>`).join('')}</div>
      </header>
      <div class="fam-body">
        <dl class="fam-text">
          <dt>What makes it</dt><dd>${fam.what}</dd>
          <dt>How it sounds</dt><dd>${fam.sound}</dd>
          <dt>Where you'll see it</dt><dd>${fam.where}</dd>
          <dt>Reading the symbol</dt><dd>${fam.symbols}</dd>
        </dl>
        <div class="fam-ex" data-fam="${fam.cat}">${exampleHTML(fam)}</div>
      </div>
      <div class="fam-tip"><b>Tip</b><p>${fam.tip}</p></div>
      <div class="fam-members">
        <span>All ${members.length} in the library</span>
        ${members.map((c) => `<button class="mchip" data-open="${c.id}" title="${c.name}">${R.symHTML(root, c)}</button>`).join('')}
      </div>
    </article>`;
  }

  function anatomyHTML() {
    const parts = [
      ['G', 'Root', 'The note the chord is built on.'],
      ['7', 'Quality', 'A 7 with no "maj" or "m" means dominant 7th: major 3rd and ♭7.'],
      ['♭9', 'Alteration', 'An added tension, here the 9th lowered a half step.'],
      ['/B', 'Bass', 'The bass note. B is the 3rd, so this is a 1st inversion.'],
    ];
    return `<div class="anatomy">
      <div class="an-symbol" role="img" aria-label="G7♭9/B">
        <span class="an-p an-0">G</span><span class="an-sup"><span class="an-p an-1">7</span><span class="an-p an-2">♭9</span></span><span class="an-p an-3 an-bass">/B</span>
      </div>
      <ol class="an-legend">${parts.map(([g, k, d], i) => `<li class="an-${i}"><span class="an-chip">${g}</span><div><b>${k}</b><small>${d}</small></div></li>`).join('')}</ol>
    </div>`;
  }

  function stackHTML() {
    const stack = { tokens: ['1', '3', '5', '7', '9', '11', '13'] };
    const notes = T.voice(root, stack);
    return `<div class="stack-vis">
      <div class="vis-staff">${R.staffSVG(notes, { labels: true })}</div>
      <div class="vis-keys">${R.keyboardSVG(notes)}</div>
    </div>`;
  }

  function render(el) {
    el.innerHTML = `
      <div class="learn-hero">
        <div>
          <h1 class="lib-title">How jazz chords work</h1>
          <p class="lib-sub">A short guide to every chord family in the app: what it is, how it sounds and where it shows up. Tap any example to hear it.</p>
        </div>
        <label class="learn-root">Examples in
          <select id="learn-root">${T.ROOT_NAMES.map((r) => `<option value="${r}" ${r === root ? 'selected' : ''}>${T.prettyRoot(r)}</option>`).join('')}</select>
        </label>
      </div>

      <div class="learn-layout">
        <label class="toc-select-wrap"><span>Jump to</span>
          <select class="toc-select" aria-label="Jump to section">
            <option value="learn-basics">The basics</option>
            ${FAMILIES.map((f) => `<option value="learn-${f.cat}">${T.catOf(f.cat).label}</option>`).join('')}
            <option value="learn-ideas">Key ideas</option>
            <option value="learn-table">Cheat sheet</option>
          </select>
        </label>
        <nav class="learn-toc" aria-label="Guide contents">
          <a href="#learn-basics">The basics</a>
          ${FAMILIES.map((f) => `<a href="#learn-${f.cat}" style="--c:${T.catOf(f.cat).color}"><i></i>${T.catOf(f.cat).label}</a>`).join('')}
          <a href="#learn-ideas">Key ideas</a>
          <a href="#learn-table">Cheat sheet</a>
        </nav>

        <div class="learn-main">
          <section class="basics" id="learn-basics">
            <div class="basic-card">
              <h2>Chords are stacked thirds</h2>
              <p>Start on a root and skip every other note of the scale: 1, 3, 5, 7, then keep going: <b>9, 11, 13</b>. Those upper numbers are just 2, 4 and 6 an octave up. A chord's "family" comes from its <b>3rd</b> (major or minor) and its <b>7th</b> (major, minor or diminished); everything above is color.</p>
              ${stackHTML()}
            </div>
            <div class="basic-card">
              <h2>Reading a chord symbol</h2>
              <p>Every symbol follows the same order: root, quality, then any tensions, then an optional bass note.</p>
              ${anatomyHTML()}
            </div>
          </section>

          ${FAMILIES.map(familyHTML).join('')}

          <section class="ideas" id="learn-ideas">
            <h2 class="sec-title">Key ideas</h2>
            <div class="idea-grid">${CONCEPTS.map(([h, p]) => `<div class="idea"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
          </section>

          <section id="learn-table">
            <h2 class="sec-title">Cheat sheet</h2>
            <div class="table-wrap"><table class="cheat">
              <thead><tr><th>Family</th><th>Core formula</th><th>Sound</th><th>Typical role</th><th>Example</th></tr></thead>
              <tbody>${FAMILIES.map((f) => {
                const cat = T.catOf(f.cat);
                const ex = chordById(f.examples[0]);
                return `<tr style="--c:${cat.color}"><td class="c-fam"><i></i>${cat.label}</td><td data-label="Formula">${f.formula.map(fml).join(' ')}</td><td data-label="Sound">${f.feel}</td><td data-label="Role">${f.role}</td><td data-label="Example"><button class="mchip" data-open="${ex.id}">${R.symHTML(root, ex)}</button></td></tr>`;
              }).join('')}</tbody>
            </table></div>
          </section>
        </div>
      </div>`;
  }

  /** Wire up a container. `api` supplies play(notes, arp) and openChord(root, id) from the app. */
  function mount(el, api) {
    render(el);
    el.addEventListener('click', (e) => {
      const ex = e.target.closest('[data-ex]');
      if (ex) {
        const [cat, id] = ex.dataset.ex.split(':');
        picked[cat] = id;
        const fam = FAMILIES.find((f) => f.cat === cat);
        el.querySelector(`.fam-ex[data-fam="${cat}"]`).innerHTML = exampleHTML(fam);
        return api.play(T.voice(root, chordById(id)));
      }
      const p = e.target.closest('[data-lplay],[data-larp]');
      if (p) return api.play(T.voice(root, chordById(p.dataset.lplay || p.dataset.larp)), !!p.dataset.larp);
      const o = e.target.closest('[data-open]');
      if (o) return api.openChord(root, o.dataset.open);
      const a = e.target.closest('.learn-toc a');
      if (a) {
        e.preventDefault();
        const id = a.getAttribute('href').slice(1);
        el.querySelector('#' + id).scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(history.state, '', `${location.pathname}#${id.replace(/^learn-/, '')}`);
      }
    });
    el.addEventListener('change', (e) => {
      if (!e.target.classList.contains('toc-select')) return;
      const id = e.target.value;
      el.querySelector('#' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(history.state, '', `${location.pathname}#${id.replace(/^learn-/, '')}`);
    });
    // highlight the contents entry for the section on screen
    let spy = null;
    const watch = () => {
      spy?.disconnect();
      if (!('IntersectionObserver' in window)) return;
      const links = new Map([...el.querySelectorAll('.learn-toc a')].map((l) => [l.getAttribute('href').slice(1), l]));
      spy = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((l) => l.classList.remove('active'));
          links.get(en.target.id)?.classList.add('active');
          const sel = el.querySelector('.toc-select');
          if (sel && sel.value !== en.target.id && sel.querySelector(`option[value="${en.target.id}"]`)) sel.value = en.target.id;
        });
      }, { rootMargin: '-35% 0px -60% 0px' });
      links.forEach((_, id) => { const sec = el.querySelector('#' + id); if (sec) spy.observe(sec); });
    };
    // the last sections are too short to reach the middle of the screen; at the bottom, mark the last one
    window.addEventListener('scroll', () => {
      if (el.hidden || innerHeight + scrollY < document.documentElement.scrollHeight - 4) return;
      const last = [...el.querySelectorAll('.learn-toc a')].pop();
      el.querySelectorAll('.learn-toc a').forEach((l) => l.classList.toggle('active', l === last));
      const sel = el.querySelector('.toc-select');
      if (sel) sel.value = last.getAttribute('href').slice(1);
    }, { passive: true });
    watch();
    el.addEventListener('change', (e) => {
      if (e.target.id !== 'learn-root') return;
      root = e.target.value;
      const y = window.scrollY;
      render(el);
      watch();
      window.scrollTo(0, y);
    });
  }

  window.Learn = { mount, FAMILIES };
})();
