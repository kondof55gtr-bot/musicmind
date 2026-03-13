// ==========================================
// AudioEngine.js - Web Audio API ラッパー
// ==========================================

import { midiToFreq, noteNameToMidi, CHORD_TYPES } from './notes.js';

export class AudioEngine {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._initialized = false;
  }

  // ユーザーインタラクション後に初期化 (AudioContext制限回避)
  init() {
    if (this._initialized) return;
    this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._masterGain = this._ctx.createGain();
    this._masterGain.gain.value = 0.6;
    this._masterGain.connect(this._ctx.destination);
    this._initialized = true;
  }

  get ctx() { return this._ctx; }

  // 単音再生
  playNote(freq, duration = 1.0, startTime = 0) {
    if (!this._initialized) return Promise.resolve();
    const ctx = this._ctx;
    const now = ctx.currentTime + startTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    // エンベロープ (ADSR)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.8, now + 0.02);          // Attack
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1);           // Decay
    gainNode.gain.setValueAtTime(0.5, now + duration - 0.08);        // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration);         // Release

    osc.connect(gainNode);
    gainNode.connect(this._masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.01);

    return new Promise((resolve) => {
      osc.onended = resolve;
    });
  }

  // 音名で単音再生
  playNoteByName(name, octave = 4, duration = 1.0, startTime = 0) {
    const midi = noteNameToMidi(name, octave);
    const freq = midiToFreq(midi);
    return this.playNote(freq, duration, startTime);
  }

  // MIDI番号で単音再生
  playNoteByMidi(midi, duration = 1.0, startTime = 0) {
    return this.playNote(midiToFreq(midi), duration, startTime);
  }

  // 音程を2音で再生 (順番に)
  async playInterval(rootMidi, semitones, duration = 0.8) {
    this.playNoteByMidi(rootMidi, duration, 0);
    await this._wait(duration * 0.7 * 1000);
    this.playNoteByMidi(rootMidi + semitones, duration, 0);
    await this._wait(duration * 1200);
  }

  // コードを再生 (アルペジオ)
  playChord(rootMidi, chordType, duration = 1.5, arpeggio = true) {
    const offsets = CHORD_TYPES[chordType];
    if (!offsets) return Promise.resolve();

    if (arpeggio) {
      offsets.forEach((offset, i) => {
        this.playNoteByMidi(rootMidi + offset, duration, i * 0.08);
      });
    } else {
      offsets.forEach((offset) => {
        this.playNoteByMidi(rootMidi + offset, duration, 0);
      });
    }
    return this._wait((duration + offsets.length * 0.08) * 1000);
  }

  // UI フィードバック音
  playCorrect() {
    if (!this._initialized) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      g.gain.setValueAtTime(0, now + i * 0.08);
      g.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.02);
      g.gain.linearRampToValueAtTime(0, now + i * 0.08 + 0.2);
      osc.connect(g);
      g.connect(this._masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.25);
    });
  }

  playWrong() {
    if (!this._initialized) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.value = 180;
    osc.type = 'sawtooth';
    g.gain.setValueAtTime(0.3, now);
    g.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.connect(g);
    g.connect(this._masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  _wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// シングルトン
export const audioEngine = new AudioEngine();
