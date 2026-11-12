/* Tiny Web Audio electric-piano-ish synth with a generated reverb. */
(function () {
  let ctx, master, wet;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(comp).connect(ctx.destination);

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

    const peak = 0.16 * vel;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(peak, t + 0.006);
    out.gain.exponentialRampToValueAtTime(peak * 0.45, t + 0.35);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lp.connect(out);
    out.connect(master);
    out.connect(wet);
    oscs.forEach((o) => { o.start(t); o.stop(t + dur + 0.05); });
  }

  /** Play MIDI notes as a chord (slight strum) or arpeggio. */
  function play(midis, { arp = false } = {}) {
    init();
    if (ctx.state === 'suspended') ctx.resume();
    const sorted = [...midis].sort((a, b) => a - b);
    const t0 = ctx.currentTime + 0.03;
    const vel = 1 / Math.sqrt(sorted.length) * 1.6;
    // add a bass root an octave down for body
    if (!arp) note(sorted[0] - 12, t0, 2.6, vel * 0.8);
    sorted.forEach((m, i) => {
      const t = arp ? t0 + i * 0.2 : t0 + i * 0.012;
      note(m, t, arp ? 1.8 : 2.6, vel);
    });
    return arp ? sorted.length * 200 + 1200 : 2400;
  }

  window.JazzAudio = { play };
})();
