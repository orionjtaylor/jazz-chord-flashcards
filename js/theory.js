/* Music theory core: chord definitions, correct enharmonic spelling, voicings. */
(function () {
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];

  // interval token -> [scale degree, semitones above root]
  const IV = {
    '1': [1, 0], 'b2': [2, 1], '2': [2, 2], '#2': [2, 3], 'b3': [3, 3], '3': [3, 4],
    '4': [4, 5], '#4': [4, 6], 'b5': [5, 6], '5': [5, 7], '#5': [5, 8],
    'b6': [6, 8], '6': [6, 9], 'bb7': [7, 9], 'b7': [7, 10], '7': [7, 11],
    'b9': [9, 13], '9': [9, 14], '#9': [9, 15], '11': [11, 17], '#11': [11, 18],
    'b13': [13, 20], '13': [13, 21],
  };

  const ROOT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  const CATEGORIES = [
    { id: 'major', label: 'Major', color: '#f2b134' },
    { id: 'minor', label: 'Minor', color: '#3fb8af' },
    { id: 'dominant', label: 'Dominant', color: '#e8553d' },
    { id: 'altered', label: 'Altered Dominant', color: '#d6407f' },
    { id: 'sus', label: 'Suspended', color: '#94b447' },
    { id: 'dim', label: 'Diminished & Half-Dim', color: '#8b7cf6' },
    { id: 'aug', label: 'Augmented', color: '#4fa3e3' },
    { id: 'slash', label: 'Slash & Hybrid', color: '#ff8c42' },
    { id: 'upper', label: 'Upper Structures', color: '#9fd3ff' },
  ];

  const C = (id, sym, name, cat, tokens, alts, desc) => ({ id, sym, name, cat, tokens, alts, desc });

  const CHORDS = [
    // ── Major
    C('maj', '', 'Major triad', 'major', ['1', '3', '5'], ['M', 'maj'], 'The bright, stable foundation: root, major 3rd, perfect 5th.'),
    C('6', '6', 'Major sixth', 'major', ['1', '3', '5', '6'], ['M6', 'add6'], 'Swing-era tonic. The 6th stands in for the 7th for a sweet, settled sound.'),
    C('69', '6/9', 'Six-nine', 'major', ['1', '3', '5', '6', '9'], ['6(add9)'], 'Wide-open tonic color: the classic last chord of a ballad.'),
    C('add9', 'add9', 'Major add nine', 'major', ['1', '3', '5', '9'], ['add2', '(9)'], 'A triad plus the 9th, with no 7th.'),
    C('maj7', 'maj7', 'Major seventh', 'major', ['1', '3', '5', '7'], ['Δ7', 'M7', 'ma7'], 'The I of a major ii–V–I. The major 7th sits a half step under the root.'),
    C('maj9', 'maj9', 'Major ninth', 'major', ['1', '3', '5', '7', '9'], ['Δ9', 'M9'], 'Maj7 with the 9th on top: the default modern tonic voicing.'),
    C('maj13', 'maj13', 'Major thirteenth', 'major', ['1', '3', '5', '7', '9', '13'], ['Δ13', 'M13'], 'The full major stack. The natural 11 is left out because it clashes with the 3rd.'),
    C('maj7#11', 'maj7#11', 'Major seven sharp eleven', 'major', ['1', '3', '5', '7', '#11'], ['Δ7♯11', 'maj7(♯11)'], 'The Lydian sound. Raising the 11 removes the clash with the 3rd.'),
    C('maj9#11', 'maj9#11', 'Major nine sharp eleven', 'major', ['1', '3', '5', '7', '9', '#11'], ['Δ9♯11'], 'Lydian with the 9th, shimmering and unresolved.'),
    C('maj13#11', 'maj13#11', 'Major thirteen sharp eleven', 'major', ['1', '3', '5', '7', '9', '#11', '13'], ['Δ13♯11'], 'Every note of the Lydian mode stacked in thirds.'),

    // ── Minor
    C('m', 'm', 'Minor triad', 'minor', ['1', 'b3', '5'], ['-', 'mi', 'min'], 'Root, minor 3rd, perfect 5th.'),
    C('m6', 'm6', 'Minor sixth', 'minor', ['1', 'b3', '5', '6'], ['-6', 'mi6'], 'Minor tonic with a major 6th, the dark Dorian color of minor-key standards.'),
    C('m69', 'm6/9', 'Minor six-nine', 'minor', ['1', 'b3', '5', '6', '9'], ['-6/9'], 'Rich minor tonic, often used as a final chord in minor keys.'),
    C('madd9', 'm(add9)', 'Minor add nine', 'minor', ['1', 'b3', '5', '9'], ['-add9', 'm(add2)'], 'A minor triad plus the 9th. The half step between ♭3 and 9 gives it tension.'),
    C('m7', 'm7', 'Minor seventh', 'minor', ['1', 'b3', '5', 'b7'], ['-7', 'mi7', 'min7'], 'The ii of a major ii–V–I, and the most common chord in jazz.'),
    C('m9', 'm9', 'Minor ninth', 'minor', ['1', 'b3', '5', 'b7', '9'], ['-9', 'mi9'], 'Minor 7 with the 9th: a smooth, Dorian sound.'),
    C('m11', 'm11', 'Minor eleventh', 'minor', ['1', 'b3', '5', 'b7', '9', '11'], ['-11', 'mi11'], 'The 11 works on minor chords because it doesn\'t clash with the ♭3. Modal and open.'),
    C('m13', 'm13', 'Minor thirteenth', 'minor', ['1', 'b3', '5', 'b7', '9', '11', '13'], ['-13', 'mi13'], 'The full Dorian stack, with the natural 13 as the defining note.'),
    C('mmaj7', 'm(maj7)', 'Minor-major seventh', 'minor', ['1', 'b3', '5', '7'], ['-Δ7', 'mΔ7', 'mM7'], 'Minor triad with a major 7th: the noir, spy-movie chord from melodic minor.'),
    C('mmaj9', 'm(maj9)', 'Minor-major ninth', 'minor', ['1', 'b3', '5', '7', '9'], ['-Δ9', 'mΔ9'], 'The minor-major 7th with an added 9th.'),

    // ── Dominant
    C('7', '7', 'Dominant seventh', 'dominant', ['1', '3', '5', 'b7'], ['dom7'], 'The V chord. The tritone between the 3rd and ♭7 pulls toward resolution.'),
    C('9', '9', 'Dominant ninth', 'dominant', ['1', '3', '5', 'b7', '9'], ['dom9'], 'A dominant 7 with a natural 9th: the bluesy, funky dominant.'),
    C('11', '11', 'Dominant eleventh', 'dominant', ['1', '5', 'b7', '9', '11'], ['dom11'], 'The 3rd is usually dropped, so it sounds like a 9sus4.'),
    C('13', '13', 'Dominant thirteenth', 'dominant', ['1', '3', '5', 'b7', '9', '13'], ['dom13'], 'The classic big-band dominant. The 13 sits a whole step above the 5th.'),
    C('7#11', '7#11', 'Dominant seven sharp eleven', 'dominant', ['1', '3', '5', 'b7', '#11'], ['7(♯11)', '7♭5'], 'The Lydian dominant. Common on ♭VII7 and on tritone subs.'),
    C('9#11', '9#11', 'Dominant nine sharp eleven', 'dominant', ['1', '3', '5', 'b7', '9', '#11'], ['9(♯11)'], 'Lydian dominant with the 9th.'),
    C('13#11', '13#11', 'Dominant thirteen sharp eleven', 'dominant', ['1', '3', '5', 'b7', '9', '#11', '13'], ['13(♯11)'], 'All of Lydian dominant (melodic minor\'s 4th mode) stacked in thirds.'),
    C('7b5', '7b5', 'Dominant seven flat five', 'dominant', ['1', '3', 'b5', 'b7'], ['7(♭5)'], 'Symmetrical: it\'s the same chord a tritone away. Good for tritone substitution.'),

    // ── Altered dominant
    C('7#5', '7#5', 'Augmented seventh', 'altered', ['1', '3', '#5', 'b7'], ['7+', 'aug7', '7(♯5)'], 'Dominant with a raised 5th that leans up toward the next chord\'s 3rd.'),
    C('9#5', '9#5', 'Augmented ninth', 'altered', ['1', '3', '#5', 'b7', '9'], ['9+', '9(♯5)'], 'From the whole-tone scale: dreamy and unresolved.'),
    C('7b9', '7b9', 'Dominant seven flat nine', 'altered', ['1', '3', '5', 'b7', 'b9'], ['7(♭9)'], 'The V7 of minor keys. The ♭9 resolves down by half step to the 5th of the I chord.'),
    C('7#9', '7#9', 'Dominant seven sharp nine', 'altered', ['1', '3', '5', 'b7', '#9'], ['7(♯9)'], 'Major and minor 3rd together, a gritty blues sound. Known as the "Hendrix chord."'),
    C('7b13', '7b13', 'Dominant seven flat thirteen', 'altered', ['1', '3', '5', 'b7', 'b13'], ['7(♭13)'], 'A mixolydian ♭6 color. The ♭13 pulls down to the 9 of the next chord.'),
    C('13b9', '13b9', 'Thirteen flat nine', 'altered', ['1', '3', '5', 'b7', 'b9', '13'], ['13(♭9)'], 'Half-whole diminished sound: the ♭9 and natural 13 together.'),
    C('7b9b13', '7b9b13', 'Seven flat nine flat thirteen', 'altered', ['1', '3', '5', 'b7', 'b9', 'b13'], ['7(♭9♭13)'], 'The Phrygian-dominant V of a minor key, dark and pulling hard toward i.'),
    C('7#9b13', '7#9b13', 'Seven sharp nine flat thirteen', 'altered', ['1', '3', '5', 'b7', '#9', 'b13'], ['7(♯9♭13)'], 'Two altered tensions on top of a full dominant.'),
    C('7b9#11', '7b9#11', 'Seven flat nine sharp eleven', 'altered', ['1', '3', '5', 'b7', 'b9', '#11'], ['7(♭9♯11)'], 'Diminished-scale tensions over a dominant.'),
    C('7#9#11', '7#9#11', 'Seven sharp nine sharp eleven', 'altered', ['1', '3', '5', 'b7', '#9', '#11'], ['7(♯9♯11)'], 'Crunchy and bright with altered tensions.'),
    C('7alt', '7alt', 'Altered dominant', 'altered', ['1', '3', 'b7', '#9', 'b13'], ['7(alt)', '7♯9♭13'], 'Shorthand for the altered scale (♭9 ♯9 ♯11 ♭13). Shown here in a common voicing: 1 3 ♭7 ♯9 ♭13.'),

    // ── Suspended
    C('sus2', 'sus2', 'Suspended second', 'sus', ['1', '2', '5'], ['sus9'], 'The 3rd is replaced by the 2nd, so it is neither major nor minor.'),
    C('sus4', 'sus4', 'Suspended fourth', 'sus', ['1', '4', '5'], ['sus'], 'The 3rd is replaced by the 4th, which traditionally resolves down.'),
    C('7sus4', '7sus4', 'Seven sus four', 'sus', ['1', '4', '5', 'b7'], ['7sus'], 'A dominant without its tritone. Floats rather than pulls.'),
    C('9sus4', '9sus4', 'Nine sus four', 'sus', ['1', '4', '5', 'b7', '9'], ['9sus', 'IV/V'], 'A modern V chord, also written as IV/V (e.g. F/G). Herbie Hancock territory.'),
    C('13sus4', '13sus4', 'Thirteen sus four', 'sus', ['1', '4', '5', 'b7', '9', '13'], ['13sus'], 'A sus chord with everything stacked on top. Lush and open.'),
    C('7sus4b9', '7sus4b9', 'Sus flat nine (Phrygian)', 'sus', ['1', '4', '5', 'b7', 'b9'], ['sus♭9', '7sus(♭9)'], 'The Phrygian chord: dark and exotic. Heard all over modal jazz.'),

    // ── Diminished & half-diminished
    C('dim', 'dim', 'Diminished triad', 'dim', ['1', 'b3', 'b5'], ['°', 'o'], 'Two stacked minor 3rds.'),
    C('dim7', 'dim7', 'Diminished seventh', 'dim', ['1', 'b3', 'b5', 'bb7'], ['°7', 'o7'], 'Symmetrical: all minor 3rds, so any note can be the root. Used as a passing chord.'),
    C('dimmaj7', 'dim(maj7)', 'Diminished major seventh', 'dim', ['1', 'b3', 'b5', '7'], ['°Δ7', 'dimΔ7'], 'A diminished triad with a major 7th, rare and haunting.'),
    C('m7b5', 'm7b5', 'Half-diminished seventh', 'dim', ['1', 'b3', 'b5', 'b7'], ['ø7', '-7♭5', 'ø'], 'The ii of a minor ii–V–i (e.g. Dø7 – G7♭9 – Cm).'),
    C('m9b5', 'm9b5', 'Half-diminished ninth', 'dim', ['1', 'b3', 'b5', 'b7', '9'], ['ø9', '-9♭5'], 'Half-diminished with a natural 9, from Locrian ♮2.'),
    C('m11b5', 'm11b5', 'Half-diminished eleventh', 'dim', ['1', 'b3', 'b5', 'b7', '11'], ['ø11', '-11♭5'], 'Half-diminished with the 11, a darker and more open voicing.'),

    // ── Augmented
    C('aug', 'aug', 'Augmented triad', 'aug', ['1', '3', '#5'], ['+', '(♯5)'], 'Two stacked major 3rds. Symmetrical and unstable.'),
    C('maj7#5', 'maj7#5', 'Augmented major seventh', 'aug', ['1', '3', '#5', '7'], ['Δ7♯5', '+Δ7', 'maj7+'], 'The Lydian augmented chord from the 3rd mode of melodic minor.'),
    C('maj9#5', 'maj9#5', 'Augmented major ninth', 'aug', ['1', '3', '#5', '7', '9'], ['Δ9♯5', '+Δ9'], 'Lydian augmented with the 9th, a floating and modern sound.'),

    // ── More chords found on real charts
    C('maj7b5', 'maj7b5', 'Major seven flat five', 'major', ['1', '3', 'b5', '7'], ['Δ7♭5', 'maj7(♭5)'], 'A Lydian sound with the ♯11 (♭5) replacing the 5th.'),
    C('69#11', '6/9#11', 'Six-nine sharp eleven', 'major', ['1', '3', '5', '6', '9', '#11'], ['6/9(♯11)'], 'A Lydian tonic without the major 7th. A favorite final chord.'),
    C('mb6', 'm(b6)', 'Minor flat six', 'minor', ['1', 'b3', '5', 'b6'], ['-♭6', 'm(♯5)'], 'Aeolian minor. The ♭6 moving to 5 drives many minor-key lines.'),
    C('m7b9', 'm7b9', 'Minor seven flat nine', 'minor', ['1', 'b3', '5', 'b7', 'b9'], ['-7♭9', 'mi7(♭9)'], 'The Phrygian minor chord, as on the iii of a major key.'),
    C('m7#5', 'm7#5', 'Minor seven sharp five', 'minor', ['1', 'b3', '#5', 'b7'], ['-7♯5', 'm7(♭13)'], 'Aeolian color. It sounds like a major 7 chord in first inversion.'),
    C('7add13', '7(13)', 'Dominant seven add thirteen', 'dominant', ['1', '3', '5', 'b7', '13'], ['7/6', '7add13'], 'A dominant with the 13th but no 9th. Common in big-band voicings.'),
    C('9b5', '9b5', 'Dominant nine flat five', 'dominant', ['1', '3', 'b5', 'b7', '9'], ['9(♭5)', '9♯11 (no 5)'], 'From the whole-tone scale, also heard as a Lydian dominant.'),
    C('7#5#9', '7#5#9', 'Seven sharp five sharp nine', 'altered', ['1', '3', '#5', 'b7', '#9'], ['7+♯9', '7(♯5♯9)', '7alt'], 'One of the most common altered dominant spellings.'),
    C('7#5b9', '7#5b9', 'Seven sharp five flat nine', 'altered', ['1', '3', '#5', 'b7', 'b9'], ['7+♭9', '7(♯5♭9)'], 'An altered dominant with a dark, pulling ♭9.'),
    C('7b5b9', '7b5b9', 'Seven flat five flat nine', 'altered', ['1', '3', 'b5', 'b7', 'b9'], ['7(♭5♭9)'], 'Diminished-scale tensions with a ♭5 in place of the 5th.'),
    C('7b5#9', '7b5#9', 'Seven flat five sharp nine', 'altered', ['1', '3', 'b5', 'b7', '#9'], ['7(♭5♯9)'], 'Altered-scale tensions: ♭5 and ♯9 together.'),
    C('13#9', '13#9', 'Thirteen sharp nine', 'altered', ['1', '3', '5', 'b7', '#9', '13'], ['13(♯9)'], 'A half-whole diminished sound with a bluesy ♯9 under the 13.'),
    C('9b13', '9b13', 'Nine flat thirteen', 'altered', ['1', '3', '5', 'b7', '9', 'b13'], ['9(♭13)'], 'A Mixolydian ♭6 dominant, often written V7 going to a minor chord.'),
    C('5', '5', 'Power chord (no 3rd)', 'sus', ['1', '5'], ['(no3)'], 'Root and 5th only. It is neither major nor minor.'),
  ];

  // ── Slash / hybrid chords and upper-structure triads.
  // The root passed to voice() is the BASS; `upper.tok` locates the triad's root above it.
  const SL = (id, cat, lowerSym, upTok, q, rel, name, alts, equiv, desc) => ({
    id, cat, sym: null, lower: lowerSym ? ['1', '3', 'b7'] : ['1'], lowerSym, upper: { tok: upTok, q }, rel, name, alts, equiv, desc,
  });
  CHORDS.push(
    SL('sl-bVII', 'slash', '', 'b7', 'maj', '♭VII/I', '♭VII triad over the root', ['9sus4', '11'], '9sus4 without the 5th', 'For example F/G: the modern "sus" dominant in Herbie Hancock\'s style. It often replaces V7.'),
    SL('sl-v', 'slash', '', '5', 'min', 'v/I', 'Minor v triad over the root', ['9(no3)'], 'A dominant 9 with no 3rd', 'For example Gm/C: open and ambiguous, like a sus chord.'),
    SL('sl-bvii', 'slash', '', 'b7', 'min', '♭vii/I', 'Minor ♭vii triad over the root', ['7sus4♭9', 'sus♭9'], '7sus4♭9 (Phrygian)', 'For example Fm/G: the Phrygian sus♭9 sound written as a hybrid chord.'),
    SL('sl-II', 'slash', '', '2', 'maj', 'II/I', 'II triad over the root', [], 'Lydian: maj7♯11 color without the 3rd or 7th', 'For example D/C: a bright, floating Lydian sound. Very common in modern jazz and film music.'),
    SL('sl-V', 'slash', '', '5', 'maj', 'V/I', 'V triad over the root', ['maj9(no3)'], 'maj9 without the 3rd', 'For example G/C: an open, modern major sound with the 7th and 9th on top.'),
    SL('sl-bII', 'slash', '', 'b2', 'maj', '♭II/I', '♭II triad over the root', ['sus♭9♭13'], 'Phrygian: sus♭9 with a ♭13', 'For example D♭/C: dark and Spanish-sounding, heard in modal tunes.'),
    SL('sl-III', 'slash', '', '3', 'maj', 'III/I', 'III triad over the root', ['maj7♯5'], 'maj7♯5 (Lydian augmented)', 'For example E/C: the Lydian augmented sound written as a triad over a bass note.'),
    SL('us-II', 'upper', '7', '2', 'maj', 'II/I7', 'Upper structure II', ['13♯11'], '13♯11 (Lydian dominant)', 'For example D over C7: the triad gives the 9, ♯11 and 13. Bright and unresolved.'),
    SL('us-bIII', 'upper', '7', 'b3', 'maj', '♭III/I7', 'Upper structure ♭III', ['7♯9'], '7♯9', 'For example E♭ over C7: the triad gives the ♯9, 5 and ♭7. Bluesy and gritty.'),
    SL('us-biii', 'upper', '7', 'b3', 'min', '♭iii/I7', 'Upper structure ♭iii minor', ['7♯9♯11', '7alt'], '7♯9♯11 (altered)', 'For example E♭m over C7: the triad gives the ♯9, ♯11 and ♭7.'),
    SL('us-bV', 'upper', '7', 'b5', 'maj', '♭V/I7', 'Upper structure ♭V', ['7♭9♯11'], '7♭9♯11 (diminished)', 'For example G♭ over C7: a tritone apart, giving the ♯11, ♭7 and ♭9.'),
    SL('us-bVI', 'upper', '7', 'b6', 'maj', '♭VI/I7', 'Upper structure ♭VI', ['7♯5♯9', '7alt'], '7♯5♯9 (altered)', 'For example A♭ over C7: the classic altered sound, with the ♭13, root and ♯9.'),
    SL('us-VI', 'upper', '7', '6', 'maj', 'VI/I7', 'Upper structure VI', ['13♭9'], '13♭9 (half-whole diminished)', 'For example A over C7: the triad gives the 13, ♭9 and 3. Sweet and tense.'),
  );

  const TRIADS = { maj: ['1', '3', '5'], min: ['1', 'b3', '5'], aug: ['1', '3', '#5'] };
  for (const c of CHORDS) {
    c.semis = c.upper
      ? [...c.lower.map((t) => IV[t][1]), ...TRIADS[c.upper.q].map((t) => IV[c.upper.tok][1] + IV[t][1])]
      : c.tokens.map((t) => IV[t][1]);
    if (c.upper) c.tokens = c.lower; // only the bass part is root-relative
  }


  // ── Scales (chord-scale theory)
  const S = (name, tokens, note) => ({ name, tokens, note });
  const SCALES = {
    ionian: S('Ionian (major)', ['1', '2', '3', '4', '5', '6', '7'], 'Treat the 4th as an avoid note.'),
    lydian: S('Lydian', ['1', '2', '3', '#4', '5', '6', '7'], 'Major with a ♯4. The modern default over maj7.'),
    majpent: S('Major pentatonic', ['1', '2', '3', '5', '6'], 'No half steps, so it never clashes.'),
    dorian: S('Dorian', ['1', '2', 'b3', '4', '5', '6', 'b7'], 'Minor with a natural 6th. The standard ii-chord sound.'),
    aeolian: S('Aeolian (natural minor)', ['1', '2', 'b3', '4', '5', 'b6', 'b7'], 'Darker minor with a ♭6.'),
    phrygian: S('Phrygian', ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'], 'Minor with a ♭2. Spanish and modal flavor.'),
    dorianb2: S('Dorian ♭2 (Phrygian ♮6)', ['1', 'b2', 'b3', '4', '5', '6', 'b7'], 'Melodic minor, 2nd mode. The sus♭9 sound.'),
    minpent: S('Minor pentatonic', ['1', 'b3', '4', '5', 'b7'], 'The bluesy five-note minor scale.'),
    blues: S('Blues scale', ['1', 'b3', '4', 'b5', '5', 'b7'], 'Minor pentatonic plus the ♭5 "blue note."'),
    melmin: S('Melodic minor', ['1', '2', 'b3', '4', '5', '6', '7'], 'Jazz melodic minor, the same going up and down.'),
    harmmin: S('Harmonic minor', ['1', '2', 'b3', '4', '5', 'b6', '7'], 'Minor with a major 7th. Has an exotic augmented 2nd.'),
    mixolydian: S('Mixolydian', ['1', '2', '3', '4', '5', '6', 'b7'], 'Major with a ♭7. The basic dominant sound.'),
    bebopdom: S('Bebop dominant', ['1', '2', '3', '4', '5', '6', 'b7', '7'], 'Mixolydian plus a passing major 7th, so chord tones land on the beat.'),
    lyddom: S('Lydian dominant', ['1', '2', '3', '#4', '5', '6', 'b7'], 'Melodic minor, 4th mode. Fits 7♯11 and tritone subs.'),
    mixob6: S('Mixolydian ♭6', ['1', '2', '3', '4', '5', 'b6', 'b7'], 'Melodic minor, 5th mode.'),
    phrydom: S('Phrygian dominant', ['1', 'b2', '3', '4', '5', 'b6', 'b7'], 'Harmonic minor, 5th mode. The V of a minor key.'),
    altered: S('Altered (super Locrian)', ['1', 'b2', '#2', '3', '#4', 'b6', 'b7'], 'Melodic minor, 7th mode. Includes every altered tension: ♭9 ♯9 ♯11 ♭13.'),
    hwdim: S('Half-whole diminished', ['1', 'b2', '#2', '3', '#4', '5', '6', 'b7'], 'Symmetrical. Fits 7♭9 and 13♭9.'),
    whdim: S('Whole-half diminished', ['1', '2', 'b3', '4', 'b5', 'b6', '6', '7'], 'Symmetrical. The scale for °7 chords.'),
    wholetone: S('Whole tone', ['1', '2', '3', '#4', '#5', 'b7'], 'All whole steps, for augmented dominants.'),
    locrian: S('Locrian', ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'], 'Classic half-diminished scale.'),
    locrian2: S('Locrian ♮2', ['1', '2', 'b3', '4', 'b5', 'b6', 'b7'], 'Melodic minor, 6th mode. Smoother over ø7, with a natural 9.'),
    lydaug: S('Lydian augmented', ['1', '2', '3', '#4', '#5', '6', '7'], 'Melodic minor, 3rd mode.'),
    augscale: S('Augmented scale', ['1', '#2', '3', '5', '#5', '7'], 'Symmetrical hexatonic: two augmented triads.'),
  };

  const CHORD_SCALES = {
    maj: ['ionian', 'lydian', 'majpent'], 6: ['ionian', 'majpent', 'lydian'], 69: ['majpent', 'ionian', 'lydian'],
    add9: ['ionian', 'majpent'], maj7: ['ionian', 'lydian'], maj9: ['ionian', 'lydian'], maj13: ['ionian', 'lydian'],
    'maj7#11': ['lydian'], 'maj9#11': ['lydian'], 'maj13#11': ['lydian'],
    m: ['dorian', 'aeolian', 'minpent'], m6: ['dorian', 'melmin'], m69: ['dorian', 'melmin'], madd9: ['aeolian', 'dorian'],
    m7: ['dorian', 'aeolian', 'phrygian', 'minpent'], m9: ['dorian', 'aeolian'], m11: ['dorian', 'minpent'], m13: ['dorian'],
    mmaj7: ['melmin', 'harmmin'], mmaj9: ['melmin', 'harmmin'],
    7: ['mixolydian', 'bebopdom', 'blues'], 9: ['mixolydian', 'bebopdom'], 11: ['mixolydian'], 13: ['mixolydian', 'bebopdom'],
    '7#11': ['lyddom'], '9#11': ['lyddom'], '13#11': ['lyddom'], '7b5': ['wholetone', 'lyddom'],
    '7#5': ['wholetone', 'altered'], '9#5': ['wholetone'], '7b9': ['hwdim', 'phrydom'], '7#9': ['altered', 'hwdim', 'blues'],
    '7b13': ['mixob6', 'phrydom'], '13b9': ['hwdim'], '7b9b13': ['phrydom', 'altered'], '7#9b13': ['altered'],
    '7b9#11': ['hwdim'], '7#9#11': ['hwdim', 'altered'], '7alt': ['altered'],
    sus2: ['mixolydian', 'majpent'], sus4: ['mixolydian'], '7sus4': ['mixolydian'], '9sus4': ['mixolydian', 'dorian'],
    '13sus4': ['mixolydian'], '7sus4b9': ['dorianb2', 'phrygian'],
    dim: ['whdim', 'locrian'], dim7: ['whdim'], dimmaj7: ['whdim'],
    m7b5: ['locrian', 'locrian2'], m9b5: ['locrian2'], m11b5: ['locrian', 'locrian2'],
    aug: ['wholetone', 'augscale'], 'maj7#5': ['lydaug'], 'maj9#5': ['lydaug'],
    maj7b5: ['lydian'], '69#11': ['lydian'], mb6: ['aeolian'], m7b9: ['phrygian'], 'm7#5': ['aeolian', 'phrygian'],
    '7add13': ['mixolydian'], '9b5': ['wholetone', 'lyddom'], '7#5#9': ['altered'], '7#5b9': ['altered'],
    '7b5b9': ['hwdim', 'altered'], '7b5#9': ['altered', 'hwdim'], '13#9': ['hwdim'], '9b13': ['mixob6'], 5: ['minpent', 'mixolydian', 'aeolian'],
    'sl-bVII': ['mixolydian'], 'sl-v': ['mixolydian', 'dorian'], 'sl-bvii': ['phrygian', 'dorianb2'], 'sl-II': ['lydian'],
    'sl-V': ['ionian', 'lydian'], 'sl-bII': ['phrygian'], 'sl-III': ['lydaug'],
    'us-II': ['lyddom'], 'us-bIII': ['altered', 'hwdim'], 'us-biii': ['altered'], 'us-bV': ['hwdim'], 'us-bVI': ['altered'], 'us-VI': ['hwdim'],
  };

  // ── Progressions: [degree token from key, chord id, roman numeral]
  const P = (id, name, mode, steps, desc) => ({ id, name, mode, steps, desc });
  const PROGRESSIONS = [
    P('251', 'Major ii–V–I', 'major', [['2', 'm7', 'ii7'], ['5', '7', 'V7'], ['1', 'maj7', 'Imaj7']], 'The most important cadence in jazz.'),
    P('251ext', 'ii–V–I with extensions', 'major', [['2', 'm9', 'ii9'], ['5', '13', 'V13'], ['1', '69', 'I6/9']], 'The same cadence with richer, modern colors.'),
    P('minor251', 'Minor ii–V–i', 'minor', [['2', 'm7b5', 'iiø7'], ['5', '7b9', 'V7♭9'], ['1', 'm6', 'i6']], 'Half-diminished ii, ♭9 dominant, and a minor tonic.'),
    P('1625', 'I–vi–ii–V turnaround', 'major', [['1', 'maj7', 'Imaj7'], ['6', 'm7', 'vi7'], ['2', 'm7', 'ii7'], ['5', '7', 'V7']], 'The classic turnaround from "rhythm changes" and countless standards.'),
    P('3625', 'iii–VI–ii–V–I', 'major', [['3', 'm7', 'iii7'], ['6', '7', 'VI7'], ['2', 'm7', 'ii7'], ['5', '7', 'V7'], ['1', 'maj7', 'Imaj7']], 'A turnaround using VI7 as a secondary dominant of ii.'),
    P('tritone', 'Tritone substitution', 'major', [['2', 'm7', 'ii7'], ['b2', '7', '♭II7'], ['1', 'maj7', 'Imaj7']], 'V7 is replaced by the dominant a tritone away, so the bass moves down chromatically.'),
    P('backdoor', 'Backdoor ii–V', 'major', [['4', 'm7', 'iv7'], ['b7', '7', '♭VII7'], ['1', 'maj7', 'Imaj7']], 'Resolves to I from a whole step below, borrowed from the parallel minor.'),
    P('altcad', 'Altered cadence', 'major', [['2', 'm7', 'ii7'], ['5', '7alt', 'V7alt'], ['1', 'maj9', 'Imaj9']], 'Tension and release: an altered dominant resolving to a lush tonic.'),
    P('rhythmbridge', 'Rhythm changes bridge', 'major', [['3', '7', 'III7'], ['6', '7', 'VI7'], ['2', '7', 'II7'], ['5', '7', 'V7']], 'Dominants moving around the cycle of fourths.'),
    P('autumn', 'Major to relative minor cycle', 'major', [['2', 'm7', 'ii7'], ['5', '7', 'V7'], ['1', 'maj7', 'Imaj7'], ['4', 'maj7', 'IVmaj7'], ['7', 'm7b5', 'viiø7'], ['3', '7b9', 'III7♭9'], ['6', 'm6', 'vi6']], 'A ii–V–I in major, then in its relative minor. The backbone of many standards.'),
    P('coltrane', 'Coltrane cycle', 'major', [['1', 'maj7', 'Imaj7'], ['b3', '7', '♭III7'], ['b6', 'maj7', '♭VImaj7'], ['7', '7', 'VII7'], ['3', 'maj7', 'IIImaj7'], ['5', '7', 'V7'], ['1', 'maj7', 'Imaj7']], 'Key centers a major 3rd apart, the harmonic engine of "Giant Steps."'),
    P('blues', 'Jazz blues', 'major', [['1', '7', 'I7'], ['4', '7', 'IV7'], ['1', '7', 'I7'], ['4', '7', 'IV7'], ['#4', 'dim7', '♯iv°7'], ['1', '7', 'I7'], ['6', '7b9', 'VI7♭9'], ['2', 'm7', 'ii7'], ['5', '7', 'V7']], 'The essential changes of a 12-bar jazz blues.'),
    P('modal', 'Modal shift', 'minor', [['1', 'm11', 'i11'], ['b2', 'm11', '♭ii11']], 'Dorian vamp up a half step, as in "So What" and "Impressions."'),
    P('minorline', 'Minor line cliché', 'minor', [['1', 'm', 'i'], ['1', 'mmaj7', 'i(maj7)'], ['1', 'm7', 'i7'], ['1', 'm6', 'i6']], 'A chromatic line descends inside a static minor chord.'),
    P('sus251', 'Modern ii–V–I with a sus dominant', 'major', [['2', 'm9', 'ii9'], ['5', 'sl-bVII', 'IV/V'], ['1', 'maj9', 'Imaj9']], 'The V7 is replaced by a hybrid IV/V chord, as in Herbie Hancock\'s "Maiden Voyage" era.'),
    P('ust251', 'Upper-structure ii–V–I', 'major', [['2', 'm7', 'ii7'], ['5', 'us-bVI', '♭III/V7'], ['1', '69', 'I6/9']], 'An altered dominant voiced as a triad over V7, resolving to a 6/9.'),
  ];

  const ACC = { '-2': '𝄫', '-1': '♭', '0': '', '1': '♯', '2': '𝄪' };
  const pretty = (s) => s.replace(/bb(?=\d)/g, '𝄫').replace(/b(?=\d)/g, '♭').replace(/#/g, '♯');

  function parseNote(s) {
    const li = LETTERS.indexOf(s[0]);
    let acc = 0;
    for (const ch of s.slice(1)) acc += ch === 'b' ? -1 : ch === '#' ? 1 : 0;
    return { li, acc, pc: (LETTER_PC[li] + acc + 120) % 12 };
  }
  const prettyRoot = (r) => { const p = parseNote(r); return LETTERS[p.li] + ACC[p.acc]; };
  const asciiName = (li, acc) => LETTERS[li] + (acc < 0 ? 'b'.repeat(-acc) : '#'.repeat(acc));

  /** Spell interval tokens above a root with correct letter names. */
  function spell(rootName, tokens) {
    const r = parseNote(rootName);
    return tokens.map((t) => {
      const [deg, semi] = IV[t];
      const li = (r.li + deg - 1) % 7;
      const pc = (r.pc + semi) % 12;
      let acc = (((pc - LETTER_PC[li]) % 12) + 12) % 12;
      if (acc > 6) acc -= 12;
      return { token: t, label: t === '1' ? 'R' : pretty(t), deg, semi, li, acc, pc, name: LETTERS[li] + (ACC[acc] ?? '?'), ascii: asciiName(li, acc) };
    });
  }

  const canInvert = (chord) => !chord.upper && chord.tokens.length >= 3 && chord.tokens.length <= 4;
  const INV_NAMES = ['Root position', '1st inversion', '2nd inversion', '3rd inversion'];
  const BASS_NAMES = ['root', '3rd', '5th', '7th'];
  function invName(chord, inv) {
    if (!inv) return INV_NAMES[0];
    const t = chord.tokens[inv];
    const deg = IV[t][0];
    const what = deg === 3 ? '3rd' : deg === 5 ? '5th' : deg === 7 ? '7th' : deg === 6 ? '6th' : deg === 2 ? '2nd' : deg === 4 ? '4th' : t;
    return `${INV_NAMES[inv]} · ${what} in the bass`;
  }

  /** Bass part + a close-position triad above it, each spelled from its own root. */
  function hybridNotes(bassName, chord, baseMidi) {
    const bass = parseNote(bassName);
    const lower = spell(bassName, chord.lower).map((n) => ({ ...n, midi: baseMidi + n.semi }));
    const top = Math.max(...lower.map((n) => n.midi));
    const upName = upperRoot(bassName, chord);
    let upMidi = baseMidi + ((parseNote(upName).pc - bass.pc + 12) % 12);
    while (upMidi <= top) upMidi += 12;
    // label by tension name relative to the bass (♯5 for the III/I Lydian-augmented sound, ♭13 elsewhere)
    const T = ['R', '♭9', '9', chord.lowerSym ? '♯9' : '♭3', '3', '11', '♯11', '5', chord.upper.tok === '3' ? '♯5' : '♭13', '13', '♭7', '7'];
    return [...lower, ...spell(upName, TRIADS[chord.upper.q]).map((n) => ({
      ...n, token: 'u' + n.token, upper: true, midi: upMidi + n.semi, label: T[(n.pc - bass.pc + 12) % 12],
    }))];
  }

  /** Spell + voice a chord (optionally inverted). Notes come back sorted low → high. */
  function voice(rootName, chord, inv = 0) {
    const r = parseNote(rootName);
    const baseMidi = 48 + r.pc; // root in octave 3
    const notes = chord.upper ? hybridNotes(rootName, chord, baseMidi)
      : spell(rootName, chord.tokens).map((n, i) => ({ ...n, midi: baseMidi + n.semi + (i < inv ? 12 : 0) }));
    if (Math.max(...notes.map((n) => n.midi)) > 83) notes.forEach((n) => (n.midi -= 12));
    // staff position from the sounding pitch: diatonic index, C4 = 28, E4 = 30 (bottom treble line)
    notes.forEach((n) => { n.d = (Math.floor((n.midi - n.acc - LETTER_PC[n.li]) / 12) - 1) * 7 + n.li; });
    // treble staff: write low voicings an octave up (like guitar notation) so they sit on the staff
    const span = () => [Math.min(...notes.map((n) => n.d)), Math.max(...notes.map((n) => n.d))];
    let [minD, maxD] = span();
    let shift = 0;
    while (minD < 26 && maxD + 7 <= 45) { notes.forEach((n) => (n.d += 7)); shift++; [minD, maxD] = span(); }
    while (maxD > 43 && minD - 7 >= 23) { notes.forEach((n) => (n.d -= 7)); shift--; [minD, maxD] = span(); }
    notes.sort((a, b) => a.midi - b.midi);
    notes.octaveClef = shift; // +1 → treble-8vb clef (sounds an octave lower than written)
    return notes;
  }

  function scaleNotes(rootName, scaleId) {
    const r = parseNote(rootName);
    return spell(rootName, SCALES[scaleId].tokens).map((n) => ({ ...n, midi: 60 + r.pc + n.semi }));
  }

  const scalesFor = (chord) => (CHORD_SCALES[chord.id] || []).map((id) => ({ id, ...SCALES[id] }));

  /** Realise a progression in a key, with smooth voice leading for playback. */
  function realise(prog, keyName) {
    let prevMean = null;
    return prog.steps.map(([tok, cid, roman]) => {
      const [rn] = spell(keyName, [tok]);
      // players write B7, not C♭7: respell awkward roots to the common name
      if (Math.abs(rn.acc) > 1 || ['Cb', 'Fb', 'E#', 'B#'].includes(rn.ascii)) rn.ascii = ROOT_NAMES[rn.pc];
      const chord = CHORDS.find((c) => c.id === cid);
      const notes = voice(rn.ascii, chord);
      let midis = notes.map((n) => n.midi);
      const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
      if (prevMean != null) {
        // keep each chord near the previous one
        for (const shift of [-12, 12]) {
          const m = midis.map((x) => x + shift);
          if (Math.abs(mean(m) - prevMean) < Math.abs(mean(midis) - prevMean) && Math.min(...m) >= 43 && Math.max(...m) <= 86) midis = m;
        }
      }
      prevMean = mean(midis);
      return { root: rn.ascii, chord, roman, notes, midis };
    });
  }

  const pcSig = (c) => [...new Set(c.semis.map((x) => x % 12))].sort((a, b) => a - b).join(',');

  /** Pick plausible wrong answers that don't share the same pitch content. */
  function distractors(answer, pool, n = 3) {
    const used = new Set([pcSig(answer)]);
    const ok = (c) => c.id !== answer.id && !used.has(pcSig(c));
    let cands = pool.filter(ok);
    if (cands.length < n) cands = CHORDS.filter(ok);
    const scored = cands
      .map((c) => ({ c, s: (c.cat === answer.cat ? 0 : 1) + Math.abs(c.semis.length - answer.semis.length) * 0.35 + Math.random() * 1.3 }))
      .sort((a, b) => a.s - b.s);
    const out = [];
    for (const { c } of scored) {
      const sig = pcSig(c);
      if (used.has(sig)) continue;
      used.add(sig);
      out.push(c);
      if (out.length === n) break;
    }
    return out;
  }

  const catOf = (id) => CATEGORIES.find((c) => c.id === id);

  /** Upper triad root (ASCII name) for a hybrid chord over a given bass, respelled the way charts write it. */
  function upperRoot(bassName, chord) {
    const [ur] = spell(bassName, [chord.upper.tok]);
    const awkward = (n) => Math.abs(n.acc) > 1 || ['Cb', 'Fb', 'E#', 'B#'].includes(n.ascii);
    const triadAwkward = spell(ur.ascii, TRIADS[chord.upper.q]).some(awkward);
    return awkward(ur) || triadAwkward ? ROOT_NAMES[ur.pc] : ur.ascii;
  }
  /** Human title, e.g. "E♭ dominant seventh" or "F major over G". */
  function title(root, chord) {
    if (!chord.upper) return `${prettyRoot(root)} ${chord.name.toLowerCase()}`;
    const q = { maj: 'major', min: 'minor', aug: 'augmented' }[chord.upper.q];
    return `${prettyRoot(upperRoot(root, chord))} ${q} over ${prettyRoot(root)}${chord.lowerSym}`;
  }
  /** Root-less quality label for ear training choices. */
  const qualityLabel = (chord) => (chord.upper ? chord.rel : chord.sym ? pretty(chord.sym) : 'triad');

  window.Theory = {
    upperRoot, title, qualityLabel,
    LETTERS, IV, ROOT_NAMES, CATEGORIES, CHORDS, SCALES, PROGRESSIONS, ACC,
    pretty, prettyRoot, parseNote, spell, voice, scaleNotes, scalesFor, realise,
    canInvert, invName, distractors, catOf,
  };
})();
