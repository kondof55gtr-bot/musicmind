// ==========================================
// ChordGame.js - コード識別ゲーム
// ==========================================

import { audioEngine } from '../audio/AudioEngine.js';
import { CHORD_SETS } from '../audio/notes.js';
import { recordResult } from '../utils/storage.js';

export class ChordGame {
  constructor(difficulty = 'easy') {
    this.id = 'chord';
    this.difficulty = difficulty;
    this.chordSet = CHORD_SETS[difficulty] || CHORD_SETS.easy;
    this.currentChord = null;
    this.rootMidi = null;
    this.streak = 0;
    this.score = 0;
    this.answered = false;
  }

  getTitle() { return 'コード識別'; }
  getIcon()  { return '🎹'; }
  getDesc()  { return 'コードの種類を当てよう'; }

  newQuestion() {
    const idx = Math.floor(Math.random() * this.chordSet.length);
    this.currentChord = this.chordSet[idx];
    // ルート音: C3〜B3
    this.rootMidi = 48 + Math.floor(Math.random() * 12);
    this.answered = false;
    return this.currentChord;
  }

  async playQuestion() {
    audioEngine.init();
    await audioEngine.playChord(this.rootMidi, this.currentChord, 1.5, true);
  }

  getChoices() {
    const correct = this.currentChord;
    const pool = this.chordSet.filter((c) => c !== correct);
    const wrongs = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrongs, correct].sort(() => Math.random() - 0.5);
  }

  answer(chordType) {
    if (this.answered) return null;
    this.answered = true;
    const correct = chordType === this.currentChord;
    if (correct) {
      this.streak += 1;
      this.score += 1;
      audioEngine.playCorrect();
    } else {
      this.streak = 0;
      audioEngine.playWrong();
    }
    recordResult(this.id, correct, this.streak);
    return { correct, correctAnswer: this.currentChord };
  }
}
