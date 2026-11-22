// A pocket synthesiser: every sound is a few oscillators shaped on the fly, so the
// game ships no audio files at all. A soft blip for a lifted prize, a rising chirp
// for the great gem, a coin's ring for a decoy, a low buzz when a cone first finds
// you, and two little phrases — caught, and clean away. Created lazily on the first
// key or click, as browsers require a gesture before they make noise.

export class SoundKit {
  constructor() {
    this.ctx = null;
  }

  wake() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  tone(freq, at, seconds, type = 'sine', gain = 0.08) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(amp).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.02);
  }

  loot() {
    this.tone(880, 0, 0.09, 'triangle');
    this.tone(1318, 0.07, 0.12, 'triangle');
  }

  gem() {
    this.tone(659, 0, 0.1, 'triangle');
    this.tone(880, 0.09, 0.1, 'triangle');
    this.tone(1318, 0.18, 0.22, 'triangle');
  }

  decoy() {
    this.tone(1568, 0, 0.06, 'square', 0.04);
    this.tone(1568, 0.12, 0.06, 'square', 0.04);
  }

  spotted() {
    this.tone(196, 0, 0.16, 'sawtooth', 0.05);
  }

  dash() {
    this.tone(320, 0, 0.12, 'sine', 0.05);
    this.tone(640, 0.03, 0.1, 'sine', 0.04);
  }

  caught() {
    this.tone(392, 0, 0.16, 'square', 0.05);
    this.tone(311, 0.16, 0.16, 'square', 0.05);
    this.tone(233, 0.32, 0.34, 'square', 0.05);
  }

  escaped() {
    this.tone(523, 0, 0.11, 'triangle');
    this.tone(659, 0.11, 0.11, 'triangle');
    this.tone(784, 0.22, 0.11, 'triangle');
    this.tone(1046, 0.33, 0.26, 'triangle');
  }
}
