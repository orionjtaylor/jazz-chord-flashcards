/* Tiny Web Audio electric-piano-ish synth with a generated reverb.
   Sound reliability:
   - Browsers only allow audio after the visitor interacts with the page, so the first tap or key
     press anywhere "unlocks" audio; after that, automatic playback (e.g. Hear it) works.
   - On iPhone, Web Audio is normally silenced by the ring/silent switch. Declaring a "playback"
     audio session (iOS 17+) makes it behave like a music app; older iOS gets a silent
     media-element nudge that has the same effect. */
(function () {
  let ctx, master, wet, unlocked = false;

  function init() {
    if (ctx) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
    ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 10;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.2;
    const makeup = ctx.createGain();
    makeup.gain.value = 1.35; // phone speakers are quiet; the compressor keeps peaks in check
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(comp).connect(makeup).connect(ctx.destination);

    // simple convolution reverb from decaying noise
    const len = ctx.sampleRate * 2.2;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    wet = ctx.createGain();
    wet.gain.value = 0.22;
    wet.connect(conv).connect(comp);
  }

  // A 0.1s silent WAV, used once on older iOS to move the page into the "playback" audio category.
  function silentWavUrl() {
    const rate = 8000, n = 800, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
    const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate, true);
    v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
    return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  }

  /** Called on the first user gesture: create/resume the audio context and prime iOS. */
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    init();
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    // a one-sample silent buffer fully wakes the audio output on Safari
    const b = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = b; src.connect(ctx.destination); src.start(0);
    if (!navigator.audioSession && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      try {
        const el = new Audio(silentWavUrl());
        el.setAttribute('playsinline', '');
        el.setAttribute('x-webkit-airplay', 'deny');
        el.play().catch(() => {});
      } catch {}
    }
    ['pointerdown', 'touchend', 'keydown'].forEach((t) => document.removeEventListener(t, unlock, true));
  }
  ['pointerdown', 'touchend', 'keydown'].forEach((t) => document.addEventListener(t, unlock, true));
  // coming back to the app (e.g. after locking the phone) can suspend audio; wake it again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
  });

  const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function note(m, t, dur, vel) {
    const f = freq(m);
    const out = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(9000, f * 9), t);
    lp.frequency.exponentialRampToValueAtTime(Math.min(4000, f * 3), t + 1.2);
    lp.Q.value = 0.4;

    const partials = [
      [1, 'triangle', 1, 0],
      [1, 'sine', 0.55, 4],
      [2, 'sine', 0.22, -3],
      [4, 'sine', 0.05, 0],
    ];
    const oscs = partials.map(([mul, type, g, det]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f * mul;
      o.detune.value = det;
      const gn = ctx.createGain();
      gn.gain.value = g;
      o.connect(gn).connect(lp);
      return o;
    });

    const peak = 0.2 * vel;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(peak, t + 0.006);
    out.gain.exponentialRampToValueAtTime(peak * 0.45, t + 0.35);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lp.connect(out);
    out.connect(master);
    out.connect(wet);
    oscs.forEach((o) => { o.start(t); o.stop(t + dur + 0.05); });
  }

  /** Play MIDI notes as a chord (slight strum) or arpeggio. onNote(midi, index, holdMs) is called
      as each note actually sounds (timed from the audio clock), so the UI can light it up. */
  function play(midis, { arp = false, onNote = null } = {}) {
    init();
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    const sorted = [...midis].sort((a, b) => a - b);
    const t0 = ctx.currentTime + 0.03;
    const vel = 1 / Math.sqrt(sorted.length) * 1.6;
    // add a bass root an octave down for body
    if (!arp) note(sorted[0] - 12, t0, 2.6, vel * 0.8);
    sorted.forEach((m, i) => {
      const t = arp ? t0 + i * 0.2 : t0 + i * 0.012;
      note(m, t, arp ? 1.8 : 2.6, vel);
      if (onNote) {
        const lag = ((ctx.outputLatency || ctx.baseLatency || 0) + (t - ctx.currentTime)) * 1000;
        setTimeout(() => onNote(m, i, arp ? 230 : 900), Math.max(0, lag));
      }
    });
    return arp ? sorted.length * 200 + 1200 : 2400;
  }

  /** True once the browser will actually let us make sound. */
  const ready = () => !!ctx && ctx.state === 'running';

  window.JazzAudio = { play, unlock, ready };
})();
