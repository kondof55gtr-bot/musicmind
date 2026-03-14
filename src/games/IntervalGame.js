// ==========================================
// IntervalGame.js - 音程当てゲーム
// ==========================================

import { audioEngine } from '../audio/AudioEngine.js';
import { INTERVAL_NAMES, INTERVAL_SETS, midiToFreq } from '../audio/notes.js';
import { recordResult } from '../utils/storage.js';

export class IntervalGame {
  constructor(difficulty = 'easy') {
    this.id = 'interval';
    this.difficulty = difficulty;
    this.intervalSet = INTERVAL_SETS[difficulty] || INTERVAL_SETS.easy;
    this.currentInterval = null;
    this.rootMidi = null;
    this.streak = 0;
    this.score = 0;
    this.answered = false;
  }

  getTitle() { return '音程当て'; }
  getIcon()  { return '🎼'; }
  getDesc()  { return '2音の音程を当てよう'; }

  newQuestion() {
    const idx = Math.floor(Math.random() * this.intervalSet.length);
    this.currentInterval = this.intervalSet[idx];
    // ルート音: C3〜G4 の範囲
    this.rootMidi = 48 + Math.floor(Math.random() * 19);
    this.answered = false;
    return this.currentInterval;
  }

  async playQuestion() {
    audioEngine.init();
    await audioEngine.playInterval(this.rootMidi, this.currentInterval, 0.9);
  }

  // 4択選択肢
  getChoices() {
    const correct = this.currentInterval;
    const pool = this.intervalSet.filter((i) => i !== correct);
    const wrongs = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrongs, correct]
      .sort(() => Math.random() - 0.5)
      .map((semitones) => ({ semitones, label: INTERVAL_NAMES[semitones] }));
  }

  answer(semitones) {
    if (this.answered) return null;
    this.answered = true;
    const correct = semitones === this.currentInterval;
    if (correct) {
      this.streak += 1;
      this.score += 1;
      audioEngine.playCorrect();
    } else {
      this.streak = 0;
      audioEngine.playWrong();
    }
    recordResult(this.id, correct, this.streak);
    return { correct, correctAnswer: INTERVAL_NAMES[this.currentInterval] };
  }
}
