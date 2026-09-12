/**
 * audio.js - Procedural Web Audio API sound & dynamic music synthesizer.
 * Zero external audio assets required.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.initialized = false;
    this.bgGain = null;
    this.sfxGain = null;
    this.currentMusicState = 1; // 1: Classical, 2: Glitched, 3: Synthwave
    this.musicTimer = null;
    this.noteStep = 0;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Busses
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgGain = this.ctx.createGain();
      this.bgGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.55, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
      this.startMusicLoop();
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.resume();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    return !this.isMuted;
  }

  setMusicState(state) {
    if (this.currentMusicState !== state) {
      this.currentMusicState = state;
      this.playGlitch();
    }
  }

  /* ---------------- SFX Generators ---------------- */
  playClick() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.05);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playPickup() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.04);
      g.gain.setValueAtTime(0.25, t + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.35);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.36);
    });
  }

  playDialogue() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    const pitch = 300 + Math.random() * 250;
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.8, t + 0.04);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  playGlitch() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.08);
    osc.frequency.linearRampToValueAtTime(60, t + 0.16);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  playWhoosh() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Noise buffer for sci-fi vortex whoosh
    const bufferSize = this.ctx.sampleRate * 1.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + 0.5);
    filter.frequency.exponentialRampToValueAtTime(400, t + 1.1);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 1.2);
  }

  playAlarm() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(440, t + 0.12);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.24);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playSuccess() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      g.gain.setValueAtTime(0.3, t + idx * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.42);
    });
  }

  /* ---------------- Procedural Background Soundtrack ---------------- */
  startMusicLoop() {
    if (this.musicTimer) clearInterval(this.musicTimer);

    // Dynamic music sequencer step
    this.musicTimer = setInterval(() => {
      if (!this.initialized || this.isMuted) return;
      this.playMusicBeat();
    }, 280);
  }

  playMusicBeat() {
    const t = this.ctx.currentTime;
    this.noteStep = (this.noteStep + 1) % 16;

    if (this.currentMusicState === 1) {
      // Classical Calm (Pentatonic / Lyre-like tones)
      if (this.noteStep % 4 === 0) {
        const rootNotes = [261.63, 293.66, 329.63, 392.00]; // C4, D4, E4, G4
        const freq = rootNotes[(this.noteStep / 4) % rootNotes.length];
        this.playPadChord(freq, 1.2, 'sine', 0.12);
      }
      if (this.noteStep % 2 === 0 && Math.random() > 0.4) {
        const arpNotes = [523.25, 587.33, 659.25, 783.99, 880.00];
        const freq = arpNotes[Math.floor(Math.random() * arpNotes.length)];
        this.playArpNote(freq, 0.4, 'triangle', 0.08);
      }
    } else if (this.currentMusicState === 2) {
      // Slightly Corrupted (Glitch Arp + 8-bit bass)
      if (this.noteStep % 2 === 0) {
        const bassNotes = [130.81, 146.83, 110.00, 164.81];
        const freq = bassNotes[Math.floor(this.noteStep / 4) % bassNotes.length];
        this.playBassNote(freq, 0.3, 'sawtooth', 0.16);
      }
      const glitchNotes = [440, 466.16, 554.37, 622.25, 739.99]; // Detuned chromatic
      const freq = glitchNotes[this.noteStep % glitchNotes.length];
      this.playArpNote(freq, 0.18, 'square', 0.07);
    } else {
      // Completely Ridiculous (Synthwave Rave / Cyber-Olympus)
      // Four-on-the-floor kick pulse
      if (this.noteStep % 4 === 0) {
        this.playSynthKick();
      }
      // Hi-hat / synth zap on offbeats
      if (this.noteStep % 2 === 1) {
        this.playHiHat();
      }
      // Driving neon bassline
      const bassSequence = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
      const freq = bassSequence[this.noteStep % bassSequence.length];
      this.playBassNote(freq, 0.22, 'sawtooth', 0.22);

      // Lead melody hook
      if (this.noteStep % 4 === 2) {
        const leadSequence = [440, 523.25, 659.25, 880, 783.99];
        this.playArpNote(leadSequence[(this.noteStep / 2) % leadSequence.length], 0.35, 'sawtooth', 0.12);
      }
    }
  }

  playPadChord(freq, duration, type = 'sine', vol = 0.1) {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol, t + duration * 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(g);
    g.connect(this.bgGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  playArpNote(freq, duration, type = 'sine', vol = 0.1) {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(g);
    g.connect(this.bgGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  playBassNote(freq, duration, type = 'sawtooth', vol = 0.15) {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(150, t + duration);

    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(g);
    g.connect(this.bgGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  playSynthKick() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g);
    g.connect(this.bgGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playHiHat() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.04);
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(g);
    g.connect(this.bgGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }
}

// Global instance
window.soundEngine = new SoundEngine();
