// ==========================================
// notes.js - 音名・周波数・音楽理論定義
// ==========================================

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_JA = ['ド', 'ド#', 'レ', 'レ#', 'ミ', 'ファ', 'ファ#', 'ソ', 'ソ#', 'ラ', 'ラ#', 'シ'];

// 基準: A4 = 440Hz
export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// オクターブ4のC〜Bの音名→MIDI番号
export function noteNameToMidi(name, octave = 4) {
  const idx = NOTE_NAMES.indexOf(name);
  if (idx === -1) throw new Error(`Unknown note: ${name}`);
  return (octave + 1) * 12 + idx;
}

// 音程（半音数）→名称
export const INTERVAL_NAMES = {
  0:  'ユニゾン',
  1:  '短2度',
  2:  '長2度',
  3:  '短3度',
  4:  '長3度',
  5:  '完全4度',
  6:  '増4度/減5度',
  7:  '完全5度',
  8:  '短6度',
  9:  '長6度',
  10: '短7度',
  11: '長7度',
  12: 'オクターブ',
};

// ゲームで使う音程の選択肢（難易度別）
export const INTERVAL_SETS = {
  easy:   [3, 4, 5, 7, 12],           // 短3・長3・完全4・完全5・オクターブ
  medium: [2, 3, 4, 5, 7, 9, 12],     // + 長2・長6
  hard:   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

// コード定義 (ルートからの半音オフセット配列)
export const CHORD_TYPES = {
  'メジャー':       [0, 4, 7],
  'マイナー':       [0, 3, 7],
  'ドミナント7':    [0, 4, 7, 10],
  'メジャー7':      [0, 4, 7, 11],
  'マイナー7':      [0, 3, 7, 10],
  'ディミニッシュ': [0, 3, 6],
  'オーグメント':   [0, 4, 8],
  'sus4':           [0, 5, 7],
};

// ゲームで使うコードの選択肢（難易度別）
export const CHORD_SETS = {
  easy:   ['メジャー', 'マイナー'],
  medium: ['メジャー', 'マイナー', 'ドミナント7', 'メジャー7'],
  hard:   Object.keys(CHORD_TYPES),
};

// ゲームで使う音名（オクターブ4, C〜B）
export const GAME_NOTES_EASY = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const GAME_NOTES_ALL  = NOTE_NAMES;
