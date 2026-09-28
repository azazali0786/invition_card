/**
 * Ambient Audio Synthesizer (Web Audio API)
 * Plays tranquil, spiritual ambient harp & ney style notes with zero external audio assets.
 * Also plays audio feedback for wax seal opening.
 */

class AmbientMusicEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.gainNode = null;
    this.timer = null;
    // Maqam Bayati / Hijaz / Pentatonic tranquil notes (frequencies in Hz)
    // D4, F4, G4, A4, Bb4, C5, D5, E5, F5
    this.scale = [293.66, 349.23, 392.00, 440.00, 466.16, 523.25, 587.33, 659.25, 698.46];
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHarpPluck(freq, delay = 0, duration = 3.5) {
    if (!this.ctx || !this.isPlaying) return;

    const startTime = this.ctx.currentTime + delay;

    // Dual oscillator for rich, warm acoustic resonance
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 2, startTime); // Harmonic overtone

    // Lowpass filter for smooth, warm warmth
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.frequency.exponentialRampToValueAtTime(350, startTime + duration);

    // Natural plucked harp envelope
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.gainNode);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  scheduleMelodyLoop() {
    if (!this.isPlaying) return;

    // Pick 2 to 3 soothing notes in a flowing motif
    const note1 = this.scale[Math.floor(Math.random() * this.scale.length)];
    const note2 = this.scale[Math.floor(Math.random() * this.scale.length)];
    const note3 = this.scale[Math.floor(Math.random() * this.scale.length)];

    this.playHarpPluck(note1, 0, 4.0);
    this.playHarpPluck(note2, 0.9, 3.8);
    if (Math.random() > 0.4) {
      this.playHarpPluck(note3, 1.8, 4.5);
    }

    // Schedule next peaceful cluster
    const nextInterval = Math.random() * 2200 + 2600;
    this.timer = setTimeout(() => {
      this.scheduleMelodyLoop();
    }, nextInterval);
  }

  start() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleMelodyLoop();
    this.updateIcon(true);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updateIcon(false);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  updateIcon(active) {
    const icon = document.getElementById('audioIcon');
    if (!icon) return;
    if (active) {
      icon.className = 'fa-solid fa-volume-high';
      icon.style.color = '#dfab52';
    } else {
      icon.className = 'fa-solid fa-volume-xmark';
      icon.style.color = '';
    }
  }

  // Chime sound when wax seal is cracked
  playSealBreakChime() {
    this.initContext();
    if (!this.ctx) return;

    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6 shimmer
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = this.ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.001, st);
      gain.gain.exponentialRampToValueAtTime(0.2, st + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(st);
      osc.stop(st + 1.2);
    });
  }
}

// Global instance
window.weddingAudio = new AmbientMusicEngine();
