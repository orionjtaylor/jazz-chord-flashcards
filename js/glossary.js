/* Vocabulary tooltips: on devices with a mouse, jazz terms anywhere on the page get a dotted
   underline and a hover definition. The first mention per paragraph is marked, to avoid clutter. */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // [display name, regex source (case-insensitive), definition]. Longer phrases are matched first.
  const TERMS = [
    ['Tritone substitution', 'tritone sub(?:stitution)?s?', 'Replacing a V7 with the dominant 7th a tritone away (D♭7 for G7). They share the same 3rd and 7th, so the swap sounds smooth.'],
    ['Half-whole diminished', 'half-whole diminished', 'An eight-note scale alternating half and whole steps. The usual scale for 7♭9 and 13♭9 chords.'],
    ['Whole-half diminished', 'whole-half diminished', 'An eight-note scale alternating whole and half steps. The usual scale for °7 chords.'],
    ['Half-diminished', 'half-diminished', 'A diminished triad with a ♭7 (m7♭5 or ø7). The ii chord of a minor ii–V–i.'],
    ['Lydian dominant', 'lydian dominant', 'Mixolydian with a ♯4 (the 4th mode of melodic minor). The sound of 7♯11 chords and tritone subs.'],
    ['Lydian augmented', 'lydian augmented', 'Lydian with a ♯5 (the 3rd mode of melodic minor). The sound of maj7♯5.'],
    ['Altered scale', '(?:altered scale|super locrian)', 'The 7th mode of melodic minor. It holds every altered tension (♭9, ♯9, ♯11, ♭13), so it\'s the scale for 7alt.'],
    ['Altered dominant', 'altered dominants?', 'A dominant 7th with ♭9, ♯9, ♯11 and/or ♭13 added for extra tension and a stronger pull.'],
    ['Secondary dominant', 'secondary dominants?', 'A dominant 7th that leads to a chord other than I, e.g. A7 → Dm7 in the key of C.'],
    ['Upper structure', 'upper[- ]structures?', 'A triad played on top of a dominant 7th, adding three tensions at once (A♭ over C7 gives C7♯5♯9).'],
    ['Melodic minor', 'melodic minor', 'A minor scale with a natural 6th and 7th. Its modes produce many modern jazz sounds.'],
    ['Harmonic minor', 'harmonic minor', 'Natural minor with a raised 7th, which gives a minor key\'s V chord its leading tone.'],
    ['Whole tone', 'whole[- ]tone', 'A six-note scale made only of whole steps. Fits augmented dominant chords (7♯5, 9♯5).'],
    ['Blues scale', 'blues scale', 'Minor pentatonic plus the ♭5, the "blue note."'],
    ['Bebop', 'bebop', 'The fast, harmonically dense jazz of the 1940s. Bebop scales add a passing note so chord tones land on the beat.'],
    ['Pentatonic', 'pentatonic', 'A five-note scale with no half steps, so it rarely clashes.'],
    ['Slash chord', 'slash chords?', 'Written X/Y: chord X with note Y in the bass. If Y is in the chord, it\'s an inversion.'],
    ['Hybrid chord', 'hybrid(?: chords?)?', 'A triad over a bass note that isn\'t part of it, like F/G. It implies a richer chord with no 3rd.'],
    ['Polychord', 'polychords?', 'One chord stacked over another, written as a fraction with a horizontal line.'],
    ['Guide tones', 'guide tones?', 'The 3rd and 7th of a chord. They define its quality and move smoothly from chord to chord.'],
    ['Avoid note', 'avoid notes?', 'A note a half step above a chord tone that clashes with it, like the natural 11 over a major 3rd.'],
    ['Chord tone', 'chord tones?', 'One of the notes that make up the chord: root, 3rd, 5th, 7th and so on.'],
    ['Root position', 'root position', 'The root is the lowest note of the chord.'],
    ['Passing chord', 'passing chords?', 'A chord that connects two others, usually moving by step.'],
    ['Power chord', 'power chords?', 'Just the root and 5th, with no 3rd: neither major nor minor.'],
    ['Roman numerals', 'roman numerals?', 'Chords named by their scale degree (ii, V, I), so a progression can be played in any key.'],
    ['ii–V–I', 'ii[–-]V[–-]I', 'The most common progression in jazz: minor ii7 → dominant V7 → major I (Dm7 – G7 – Cmaj7 in C).'],
    ['ii–V–i', 'ii[–-]V[–-]i', 'The minor-key version: half-diminished ii → V7♭9 → minor i (Dø7 – G7♭9 – Cm in C minor).'],
    ['Turnaround', 'turnarounds?', 'A short progression at the end of a section that leads back to the top, e.g. I–vi–ii–V.'],
    ['Backdoor', 'backdoor', 'Resolving to I from ♭VII7 (often iv7 → ♭VII7 → I) instead of from V7.'],
    ['Cadence', 'cadences?', 'A progression that ends a phrase and creates a sense of arrival, like V → I.'],
    ['Tonic', 'tonic', 'The home chord of a key (the I chord).'],
    ['Resolve', 'resolv(?:e|es|ed|ing)|resolution', 'To move from a tense chord or note to a stable one.'],
    ['Suspended', 'suspended|sus chords?', 'The 3rd is replaced by the 4th (or 2nd), so the chord is neither major nor minor. Open and unresolved.'],
    ['Diminished', 'diminished', 'Built from stacked minor 3rds. Tense and unstable; the °7 chord is perfectly symmetrical.'],
    ['Augmented', 'augmented', 'A major triad with a raised (♯) 5th: two stacked major 3rds. Dreamy and unresolved.'],
    ['Dominant', 'dominants?', 'A major triad plus a ♭7. Its 3rd and ♭7 form a tritone that pulls toward the chord a 5th below (G7 → C).'],
    ['Altered', 'altered', 'Describes tensions raised or lowered a half step (♭9, ♯9, ♯11, ♭13), usually on a dominant chord.'],
    ['Tritone', 'tritones?', 'An interval of three whole steps (six half steps), e.g. B to F. The most unstable interval, and the engine of dominant chords.'],
    ['Inversion', 'inversions?|inverted', 'The same chord with a note other than the root in the bass, written as a slash chord (C/E).'],
    ['Extension', 'extensions?', 'Chord tones above the 7th: the 9th, 11th and 13th (the 2nd, 4th and 6th an octave up).'],
    ['Alteration', 'alterations?', 'An extension raised or lowered a half step: ♭9, ♯9, ♯11, ♭13.'],
    ['Tension', 'tensions?', 'Color notes added above the basic chord: the 9th, 11th, 13th and their alterations.'],
    ['Voicing', 'voicings?', 'How a chord\'s notes are arranged: which octaves, which order, and which notes are left out.'],
    ['Triad', 'triads?', 'A three-note chord: root, 3rd and 5th.'],
    ['Arpeggio', 'arpeggio(?:s)?', 'Playing a chord\'s notes one at a time instead of together.'],
    ['Ionian', 'ionian', 'Another name for the major scale.'],
    ['Dorian', 'dorian', 'A minor scale with a natural 6th. The standard sound over m7 chords.'],
    ['Phrygian', 'phrygian', 'A minor scale with a ♭2. Dark and Spanish-sounding.'],
    ['Lydian', 'lydian', 'The major scale with a ♯4. Bright and floating; the modern sound over maj7 chords.'],
    ['Mixolydian', 'mixolydian', 'The major scale with a ♭7. The basic sound over dominant 7th chords.'],
    ['Aeolian', 'aeolian', 'The natural minor scale (♭3, ♭6, ♭7).'],
    ['Locrian', 'locrian', 'The mode with ♭2, ♭3, ♭5, ♭6 and ♭7. Fits half-diminished chords.'],
    ['Modal', 'modal', 'Music built on a scale (mode) rather than a fast-moving progression, often long vamps on one chord.'],
    ['Diatonic', 'diatonic', 'Using only the notes of the current key.'],
    ['Chromatic', 'chromatic(?:ally)?', 'Moving by half steps, or using notes from outside the key.'],
    ['Enharmonic', 'enharmonic(?:ally)?', 'The same pitch with a different name, like F♯ and G♭.'],
    ['Symmetrical', 'symmetrical', 'Built from one repeating interval, so it repeats as you move it: °7 every minor 3rd, augmented every major 3rd.'],
    ['Half step', 'half steps?', 'The smallest distance in Western music: from one key to the very next (C to C♯).'],
    ['Whole step', 'whole steps?', 'Two half steps, e.g. C to D.'],
    ['Lead sheet', 'lead sheets?', 'A melody with chord symbols written above it: the usual way jazz tunes are written down.'],
    ['Double flat', 'double flats?', 'Lowers a note by two half steps: B𝄫 sounds the same as A.'],
  ].sort((a, b) => b[1].length - a[1].length);

  const RE = new RegExp(`(?<![\\w♭♯])(?:${TERMS.map(([, src]) => `(${src})`).join('|')})(?![\\w])`, 'gi');
  const TARGETS = '.tag, .back-title h2, .detail-card h2, .ex-title, p, dd, li small, .scales small, .choice-name, .tile-name, .cheat td, .fam-sum, .slot-scale, .inv-name, .equiv, .fam-tip, .ex-title span, .idea p, .mode-hint';
  const SKIP = '.sym, svg, kbd, .term, .an-symbol, .gl-tip, select, option, script, style, .brand, .dialog-note, .tile, .mchip, .fam-chip';

  function annotate(el) {
    const text = el.textContent;
    if (el.dataset.gl === text) return; // unchanged since last pass
    const used = new Set(el.querySelectorAll('.term') ? [...el.querySelectorAll('.term')].map((t) => t.dataset.term) : []);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const str = node.nodeValue;
      RE.lastIndex = 0;
      let m, last = 0, frag = null;
      while ((m = RE.exec(str))) {
        let idx = m.slice(1).findIndex((g) => g !== undefined);
        // matching ignores case, so tell ii–V–I (major) from ii–V–i (minor) by the last letter
        if (idx >= 0 && /^ii[–-]V[–-]/.test(m[0])) idx = TERMS.findIndex(([name]) => name === (m[0].endsWith('i') ? 'ii–V–i' : 'ii–V–I'));
        if (idx < 0 || used.has(String(idx))) continue;
        used.add(String(idx));
        frag ||= document.createDocumentFragment();
        frag.append(str.slice(last, m.index));
        const span = document.createElement('span');
        span.className = 'term';
        span.dataset.term = String(idx);
        span.textContent = m[0];
        frag.append(span);
        last = m.index + m[0].length;
      }
      if (frag) { frag.append(str.slice(last)); node.replaceWith(frag); }
    }
    el.dataset.gl = el.textContent;
  }

  let queued = false;
  function scan() {
    queued = false;
    document.querySelectorAll(TARGETS).forEach((el) => { if (!el.closest(SKIP)) annotate(el); });
  }
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(scan); } };

  // tooltip
  const tip = document.createElement('div');
  tip.className = 'gl-tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  let current = null;
  function show(term) {
    const [name, , def] = TERMS[+term.dataset.term];
    tip.innerHTML = '';
    const b = document.createElement('b'); b.textContent = name;
    const s = document.createElement('span'); s.textContent = def;
    tip.append(b, s);
    tip.hidden = false;
    const r = term.getBoundingClientRect();
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let top = r.top - h - 10;
    if (top < 80) top = r.bottom + 10; // below the sticky nav bar if there's no room above
    const left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
    requestAnimationFrame(() => tip.classList.add('on'));
    current = term;
  }
  function hide() { tip.classList.remove('on'); tip.hidden = true; current = null; }

  document.addEventListener('DOMContentLoaded', () => {
    document.body.append(tip);
    scan();
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest?.('.term');
      if (t && t !== current) show(t);
      else if (!t && current) hide();
    });
    window.addEventListener('scroll', () => current && hide(), { passive: true });
  });
})();
