# Changes: Jazz Chord Flashcards

Live at **https://chordchanges.app**

A static website for practicing jazz chords: 81 chord types in 9 families (major, minor, dominant, altered, sus, diminished, augmented, slash/hybrid chords and upper-structure triads), every key, inversions, chord-scale relationships, ear training and common jazz progressions.

## Features
- **Spell it**: see a chord symbol (e.g. `E♭7♯9`, `Cmaj7/B`), name the notes, flip to check.
- **Name it**: read a chord from a treble staff and keyboard, then pick the symbol (with inversions this includes slash chords).
- **Hear it**: ear training. The chord plays and you identify the quality. Replay it or play it as an arpeggio.
- **Progressions**: ii–V–I, minor ii–V–i, turnarounds, tritone sub, backdoor, Coltrane cycle, jazz blues and more, in any key. Work out each chord from its Roman numeral, then reveal it and play it back with smooth voice leading.
- **Slash & upper-structure chords**: hybrids like F/G, D/C and D♭/C, plus triads over dominants (D/C7, E♭/C7, A♭/C7…) drawn as stacked polychords. The upper triad is colored separately, and each shows what it's equivalent to (e.g. F/G ≈ G9sus4).
- **Learn**: an illustrated guide to how chords are built, how to read a chord symbol, and what defines each of the 9 chord families (sound, typical use, symbols, tips), with playable examples and a cheat sheet.
- **Library**: browse every chord in any key with notation, keyboard, inversions, audio and scales that fit it.
- Correct enharmonic spelling (C°7 = C E♭ G♭ B𝄫), synthesized piano audio, spaced repetition (chords you miss come up more often), and progress saved in the browser.

Keyboard shortcuts: `Space` flip/play · `1`–`4` answer · `Enter` next · `P` play · `M` mute

## Install as an app
The site is an installable web app (PWA) and works offline after the first visit.
- **iPhone/iPad (Safari):** Share → Add to Home Screen, or tap the site's **Install** button for instructions.
- **Android / Chrome / Edge:** tap **Install** in the header (or the browser's install icon).

When you deploy changes, bump `CACHE` in `sw.js` (e.g. `changes-v2` → `changes-v3`) so installed copies drop the old files. Updates show up the next time the app is opened.

## Run locally
No build step. Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Host it
It's plain static files, so any static host works:
- **GitHub Pages**: push this folder to a repo, then Settings → Pages → deploy from branch.
- **Netlify / Cloudflare Pages / Vercel**: drag and drop the folder, or connect the repo (no build command; publish directory `.`).

## Project layout
```
index.html        page structure
css/styles.css    all styling
js/theory.js      chords, scales, progressions, spelling and voicing
js/render.js      SVG staff, keyboard, chord symbols
js/audio.js       Web Audio piano synth with reverb
js/app.js         practice modes, spaced repetition, library, settings
js/learn.js       the Learn guide (family explanations and examples)
js/pwa.js         service worker registration and Install button
sw.js             offline cache (service worker)
manifest.webmanifest, icons/   app name, colors and home-screen icons
```
To add a chord, add a line to `CHORDS` in `js/theory.js` (and its scales in `CHORD_SCALES`). To add a progression, add a line to `PROGRESSIONS`.
