/* SVG renderers: treble staff with whole-note chords, piano keyboard, chord symbols. */
(function () {
  const T = window.Theory;

  /** Chord symbol. Pass a bass note (spelled note object) to render a slash chord. */
  const rootPart = (name) => {
    const p = T.parseNote(name);
    return `${T.LETTERS[p.li]}${p.acc ? `<span class="sym-acc">${T.ACC[p.acc]}</span>` : ''}`;
  };

  function symHTML(root, chord, bass) {
    if (chord.upper) {
      const up = rootPart(T.upperRoot(root, chord));
      const q = { maj: '', min: 'm', aug: '+' }[chord.upper.q];
      const qs = q ? `<span class="sym-q">${q}</span>` : '';
      if (chord.lowerSym) {
        // upper-structure triad over a dominant: written as a stacked fraction
        return `<span class="sym poly"><span class="poly-top">${up}${qs}</span><span class="poly-line"></span><span class="poly-bot">${rootPart(root)}<span class="sym-q">${chord.lowerSym}</span></span></span>`;
      }
      return `<span class="sym hybrid"><span class="sym-root">${up}</span>${qs}<span class="sym-slash">/${rootPart(root)}</span></span>`;
    }
    const p = T.parseNote(root);
    const acc = p.acc ? `<span class="sym-acc">${T.ACC[p.acc]}</span>` : '';
    const q = chord.sym ? `<span class="sym-q">${T.pretty(chord.sym)}</span>` : '';
    const sl = bass ? `<span class="sym-slash">/${bass.name[0]}${bass.acc ? `<span class="sym-acc">${T.ACC[bass.acc]}</span>` : ''}</span>` : '';
    return `<span class="sym"><span class="sym-root">${T.LETTERS[p.li]}${acc}</span>${q}${sl}</span>`;
  }

  const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" class="i"><path d="M7 5l12 7-12 7z"/></svg>';

  /** List of scales that fit a chord, each playable. */
  function scaleList(root, chord) {
    const scales = T.scalesFor(chord);
    if (!scales.length) return '';
    return `<div class="scales"><h4>Scales that fit</h4><ul>${scales.map((s, i) => {
      const notes = T.scaleNotes(root, s.id);
      return `<li${i === 0 ? ' class="primary"' : ''}>
        <button class="scale-play" data-scale="${s.id}" aria-label="Play ${s.name}">${playIcon}</button>
        <div><b>${s.name}</b><span class="scale-notes">${notes.map((n) => `<i${n.token === '1' ? ' class="r"' : ''}>${n.name}</i>`).join('')}</span><small>${s.note}</small></div>
      </li>`;
    }).join('')}</ul></div>`;
  }

  // ── Accidental glyphs drawn as paths so they position exactly
  function accGlyph(acc, x, y) {
    const flat = (dx) => `<g transform="translate(${dx},0)"><line x1="-3" y1="-15" x2="-3" y2="6" stroke-width="1.6"/><path d="M-3 -0.5 C 1 -5, 6.5 -3.5, 4 0.5 C 2 3, -0.5 4.5, -3 6" fill="none" stroke-width="2"/></g>`;
    let body = '';
    if (acc === -1) body = flat(0);
    else if (acc === -2) body = flat(-4) + flat(4);
    else if (acc === 1) body = '<line x1="-2.4" y1="-10" x2="-2.4" y2="11.5" stroke-width="1.4"/><line x1="2.6" y1="-11.5" x2="2.6" y2="10" stroke-width="1.4"/><path d="M-5.5 -2.2 L5.5 -5.4 L5.5 -2.6 L-5.5 0.6 Z" stroke="none"/><path d="M-5.5 5 L5.5 1.8 L5.5 4.6 L-5.5 7.8 Z" stroke="none"/>';
    else if (acc === 2) body = '<path d="M-4.5 -4.5 L4.5 4.5 M4.5 -4.5 L-4.5 4.5" stroke-width="2"/><rect x="-5.5" y="-5.5" width="3.4" height="3.4" stroke="none"/><rect x="2.1" y="-5.5" width="3.4" height="3.4" stroke="none"/><rect x="-5.5" y="2.1" width="3.4" height="3.4" stroke="none"/><rect x="2.1" y="2.1" width="3.4" height="3.4" stroke="none"/>';
    return `<g class="acc" transform="translate(${x},${y})">${body}</g>`;
  }

  /** Treble staff with the chord as stacked whole notes. */
  function staffSVG(notes, { highlightRoot = true, labels = false } = {}) {
    const H = 7; // half a staff space
    const W = 280, HT = 190;
    const yOf = (d) => 126 - (d - 30) * H; // E4 line at y=126
    const x0 = 10, x1 = W - 10;
    const cx = 168;
    let s = `<svg class="staff" viewBox="0 0 ${W} ${HT}" role="img" aria-label="Chord on a treble staff: ${notes.map((n) => n.name).join(', ')}">`;
    for (let d = 30; d <= 38; d += 2) s += `<line class="st-line" x1="${x0}" x2="${x1}" y1="${yOf(d)}" y2="${yOf(d)}"/>`;
    s += `<line class="st-line" x1="${x0}" x2="${x0}" y1="${yOf(38)}" y2="${yOf(30)}"/>`;
    s += `<line class="st-line" x1="${x1}" x2="${x1}" y1="${yOf(38)}" y2="${yOf(30)}"/><line class="st-bar" x1="${x1 - 4}" x2="${x1 - 4}" y1="${yOf(38)}" y2="${yOf(30)}"/>`;
    s += `<text class="clef" x="${x0 + 6}" y="${yOf(32)}">𝄞</text>`;
    if (notes.octaveClef > 0) s += `<text class="clef8" x="${x0 + 22}" y="${yOf(30) + 29}">8</text><title>Octave treble clef: sounds an octave lower than written</title>`;

    const sorted = [...notes].sort((a, b) => a.d - b.d);
    let prev = null;
    for (const n of sorted) {
      n._off = prev && n.d - prev.d === 1 && !prev._off ? 1 : 0;
      prev = n;
    }
    const anyOff = sorted.some((n) => n._off);

    // ledger lines
    const ledgers = new Map();
    for (const n of sorted) {
      const ext = n._off ? 17 : 0;
      if (n.d <= 28) for (let L = 28; L >= n.d; L -= 2) ledgers.set(L, Math.max(ledgers.get(L) || 0, ext));
      if (n.d >= 40) for (let L = 40; L <= n.d; L += 2) ledgers.set(L, Math.max(ledgers.get(L) || 0, ext));
    }
    for (const [L, ext] of ledgers) s += `<line class="st-ledger" x1="${cx - 15}" x2="${cx + 15 + ext}" y1="${yOf(L)}" y2="${yOf(L)}"/>`;

    // accidentals: stack leftwards, top note first
    const placed = [];
    for (const n of [...sorted].reverse()) {
      if (!n.acc) continue;
      let col = 0;
      while (placed.some((p) => p._col === col && Math.abs(p.d - n.d) < 6)) col++;
      n._col = col;
      placed.push(n);
      const w = Math.abs(n.acc) === 2 && n.acc < 0 ? 17 : 13;
      s += accGlyph(n.acc, cx - 21 - col * 15 - (w - 13) / 2, yOf(n.d));
    }

    for (const n of sorted) {
      const x = cx + (n._off ? 17 : 0);
      const y = yOf(n.d);
      const cls = 'nh' + (highlightRoot && n.token === '1' ? ' root' : '') + (highlightRoot && n.upper ? ' up' : '');
      s += `<g class="${cls}" transform="translate(${x},${y})"><ellipse rx="8.6" ry="6.2"/><ellipse class="nh-hole" rx="4.4" ry="2.9" transform="rotate(-48)"/></g>`;
      if (labels) s += `<text class="st-label" x="${cx + (anyOff ? 40 : 24) + (n._off ? 20 : 0)}" y="${y + 4}">${n.label}</text>`;
    }
    // crop the viewBox to the content so the staff fills its panel
    const ys = sorted.map((n) => yOf(n.d));
    // The treble-clef glyph (64px Noto Music) reaches ~1.33em above its baseline and ~0.4em below,
    // so always keep that whole height (plus a little air) inside the crop.
    const clefTop = yOf(32) - 64 * 1.34 - 5, clefBot = yOf(32) + 64 * 0.4 + 5;
    const top = Math.min(clefTop, ...ys.map((y) => y - 14));
    const bot = Math.max(clefBot, yOf(30) + (notes.octaveClef > 0 ? 38 : 26), ...ys.map((y) => y + 14));
    return s.replace(`viewBox="0 0 ${W} ${HT}"`, `viewBox="0 ${top} ${W} ${bot - top}"`) + '</svg>';
  }

  const isBlack = (m) => [1, 3, 6, 8, 10].includes(m % 12);
  const WHITE_NAMES = { 0: 'C', 2: 'D', 4: 'E', 5: 'F', 7: 'G', 9: 'A', 11: 'B' };

  /** Piano keyboard, C3–B5, with chord tones lit up. */
  function keyboardSVG(notes, { from = 48, to = 83, labels = true } = {}) {
    const WK = 26, WH = 128, BK = 16, BH = 80;
    const hits = new Map(notes.map((n) => [n.midi, n]));
    const whites = [];
    for (let m = from; m <= to; m++) if (!isBlack(m)) whites.push(m);
    const W = whites.length * WK;
    let s = `<svg class="keyboard" viewBox="-1 -1 ${W + 2} ${WH + 2}" role="img" aria-label="Piano keyboard showing ${notes.map((n) => n.name).join(', ')}">`;
    whites.forEach((m, i) => {
      const n = hits.get(m);
      const cls = n ? 'wk hit' + (n.token === '1' ? ' root' : '') + (n.upper && labels ? ' up' : '') : 'wk';
      s += `<rect class="${cls}" x="${i * WK}" y="0" width="${WK}" height="${WH}" rx="3"/>`;
      if (n && labels) {
        s += `<text class="k-name" x="${i * WK + WK / 2}" y="${WH - 10}">${n.name}</text>`;
        s += `<text class="k-int" x="${i * WK + WK / 2}" y="${WH - 27}">${n.label}</text>`;
      } else if (m % 12 === 0) {
        s += `<text class="k-c" x="${i * WK + WK / 2}" y="${WH - 9}">C${Math.floor(m / 12) - 1}</text>`;
      }
    });
    whites.forEach((m, i) => {
      const b = m + 1;
      if (b > to || !isBlack(b)) return;
      const n = hits.get(b);
      const x = (i + 1) * WK - BK / 2;
      const cls = n ? 'bk hit' + (n.token === '1' ? ' root' : '') + (n.upper && labels ? ' up' : '') : 'bk';
      s += `<rect class="${cls}" x="${x}" y="-1" width="${BK}" height="${BH}" rx="2.5"/>`;
      if (n && labels) {
        s += `<text class="k-name k-on-black" x="${x + BK / 2}" y="${BH - 9}">${n.name}</text>`;
        s += `<text class="k-int k-on-black" x="${x + BK / 2}" y="${BH - 24}">${n.label}</text>`;
      }
    });
    return s + '</svg>';
  }

  function notePills(notes) {
    return `<ol class="pills">${notes
      .map((n) => `<li class="pill${n.token === '1' ? ' root' : ''}${n.upper ? ' up' : ''}"><b>${n.name}</b><span>${n.label}</span></li>`)
      .join('')}</ol>`;
  }

  window.Render = { symHTML, staffSVG, keyboardSVG, notePills, scaleList };
})();
