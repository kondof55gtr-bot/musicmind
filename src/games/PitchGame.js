// ==========================================
// PitchGame.js - 音名当てゲーム
// ==========================================

import { audioEngine } from '../audio/AudioEngine.js';
import { GAME_NOTES_EASY, GAME_NOTES_ALL, noteNameToMidi, midiToFreq } from '../audio/notes.js';
import { recordResult } from '../utils/storage.js';

export class PitchGame {
  constructor(difficulty = 'easy') {
    this.id = 'pitch';
    this.difficulty = difficulty;
    this.notes = difficulty === 'easy' ? GAME_NOTES_EASY : GAME_NOTES_ALL;
    this.currentNote = null;
    this.currentOctave = 4;
    this.streak = 0;
    this.score = 0;
    this.answered = false;
  }

  getTitle() { return '音名当て'; }
  getIcon()  { return '🎵'; }
  getDesc()  { return '音を聞いて音名を当てよう'; }

  // 新しい問題を生成
  newQuestion() {
    const idx = Math.floor(Math.random() * this.notes.length);
    this.currentNote = this.notes[idx];
    // ランダムにオクターブを少し変える (3〜5)
    this.currentOctave = 3 + Math.floor(Math.random() * 3);
    this.answered = false;
    return this.currentNote;
  }

  // 音を再生
  async playQuestion() {
    audioEngine.init();
    const midi = noteNameToMidi(this.currentNote, this.currentOctave);
    await audioEngine.playNote(midiToFreq(midi), 1.2);
  }

  // 選択肢を生成 (4択)
  getChoices() {
    const correct = this.currentNote;
    const pool = [...this.notes].filter((n) => n !== correct);
    const wrongs = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [...wrongs, correct].sort(() => Math.random() - 0.5);
    return choices;
  }

  // 回答チェック
  answer(selected) {
    if (this.answered) return null;
    this.answered = true;
    const correct = selected === this.currentNote;
    if (correct) {
      this.streak += 1;
      this.score += 1;
      audioEngine.playCorrect();
    } else {
      this.streak = 0;
      audioEngine.playWrong();
    }
    recordResult(this.id, correct, this.streak);
    return { correct, correctAnswer: this.currentNote };
  }
}
