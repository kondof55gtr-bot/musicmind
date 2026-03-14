// ============================================================
// instrument.config.js
// 楽器固有設定の核。ここを差し替えるだけで他楽器に対応できる。
// ============================================================

export const INSTRUMENTS = {
  guitar: {
    name: 'クラシックギター',
    shortName: 'ギター',
    defaultMenu: [
      { id: 'warmup',  title: 'ウォームアップ（スケール）', minutes: 10, done: false },
      { id: 'chords',  title: 'コード練習',               minutes: 15, done: false },
      { id: 'piece',   title: '曲の練習',                 minutes: 20, done: false },
    ],
    aiPrompt: `あなたはクラシックギターの経験豊富で親身な指導者です。
生徒はギターを練習しています。以下の方針で回答してください：
- 回答は3〜5文で具体的に、初心者にわかりやすい言葉で
- 練習メニューを提案するときは番号付きリストで
- 短時間集中（15〜20分）と間隔反復を自然に勧める
- 楽器店・演奏会などリアルな場面で役立つ知識を優先
- 指の痛みや挫折感には共感してから励ます`,
    accentColor: '#2d5a3d',
    worldCategories: [
      { id: 'performers', label: '演奏家',       icon: '🎸',
        prompt: 'クラシックギターの著名な演奏家（セゴビア、イエペス、村治佳織など）について、その特徴や聴き方のポイントを教えてください。' },
      { id: 'composers',  label: '作曲家',       icon: '🎼',
        prompt: 'ギター音楽の作曲家（ソル、タレガ、ヴィラ＝ロボスなど）について、代表曲と作風を教えてください。' },
      { id: 'knowledge',  label: '楽器の知識',   icon: '📚',
        prompt: 'クラシックギターの構造（ボディ・ネック・弦）と、初心者が知っておくべき選び方のポイントを教えてください。' },
      { id: 'shops',      label: '楽器店・工房', icon: '🏪',
        prompt: 'ギターの楽器店や工房で何を見るべきか、試奏のコツ、店員への質問の仕方について教えてください。' },
      { id: 'concert',    label: '演奏会マナー', icon: '🎭',
        prompt: 'クラシックギターの演奏会やリサイタルでのマナー、楽しみ方、初心者が知っておくべきことを教えてください。' },
      { id: 'strings',    label: '弦の選び方',   icon: '🎵',
        prompt: 'クラシックギターの弦の種類（ナイロン・カーボン・フロロカーボン）と選び方、交換頻度と手順を教えてください。' },
    ],
  },

  piano: {
    name: 'ピアノ',
    shortName: 'ピアノ',
    defaultMenu: [
      { id: 'scales',  title: 'スケール練習（ハノン）', minutes: 10, done: false },
      { id: 'etude',   title: 'エチュード',           minutes: 15, done: false },
      { id: 'piece',   title: '曲の練習',             minutes: 25, done: false },
    ],
    aiPrompt: `あなたはピアノの経験豊富で親身な指導者です。
生徒はピアノを練習しています。以下の方針で回答してください：
- 回答は3〜5文で具体的に、初心者にわかりやすい言葉で
- 練習メニューを提案するときは番号付きリストで
- 両手のコーディネーションと脱力を意識した指導を心がける
- ハノン・バイエル・ソナチネなど教材に関する知識を活かす
- 挫折感には共感してから具体的な克服ステップを提示する`,
    accentColor: '#2d5a3d',
    worldCategories: [
      { id: 'performers', label: '演奏家',       icon: '🎹',
        prompt: '著名なピアニスト（ホロヴィッツ、アルゲリッチ、内田光子など）について、特徴や聴き方のポイントを教えてください。' },
      { id: 'composers',  label: '作曲家',       icon: '🎼',
        prompt: 'ピアノ音楽の作曲家（ショパン、シューベルト、ドビュッシーなど）について、代表曲と作風を教えてください。' },
      { id: 'knowledge',  label: '楽器の知識',   icon: '📚',
        prompt: 'ピアノの構造（グランド・アップライト・電子ピアノの違い）と初心者が知っておくべき選び方を教えてください。' },
      { id: 'shops',      label: '楽器店・工房', icon: '🏪',
        prompt: 'ピアノの試弾のポイント、楽器店での購入・レンタル時のチェック事項を教えてください。' },
      { id: 'concert',    label: '演奏会マナー', icon: '🎭',
        prompt: 'ピアノリサイタルや発表会でのマナー、楽しみ方を教えてください。' },
      { id: 'care',       label: 'メンテナンス', icon: '🔧',
        prompt: 'ピアノのメンテナンス（調律の頻度、鍵盤の手入れ、保管方法）について教えてください。' },
    ],
  },

  violin: {
    name: 'バイオリン',
    shortName: 'バイオリン',
    defaultMenu: [
      { id: 'bowing',  title: 'ボウイング練習',         minutes: 10, done: false },
      { id: 'scales',  title: 'スケール・ポジション練習', minutes: 15, done: false },
      { id: 'piece',   title: '曲の練習',               minutes: 20, done: false },
    ],
    aiPrompt: `あなたはバイオリンの経験豊富で親身な指導者です。
生徒はバイオリンを練習しています。以下の方針で回答してください：
- 回答は3〜5文で具体的に、初心者にわかりやすい言葉で
- 練習メニューを提案するときは番号付きリストで
- ボウイングとポジション移動の重要性を強調する
- 音程の正確さとビブラートは段階的に習得を勧める
- 肩・腕の疲れや痛みには丁寧に対処法を伝える`,
    accentColor: '#2d5a3d',
    worldCategories: [
      { id: 'performers', label: '演奏家',       icon: '🎻',
        prompt: '著名なバイオリニスト（ハイフェッツ、ムター、五嶋みどりなど）について、特徴や聴き方のポイントを教えてください。' },
      { id: 'composers',  label: '作曲家',       icon: '🎼',
        prompt: 'バイオリン音楽の作曲家（パガニーニ、ブラームス、バッハなど）について、代表曲と特徴を教えてください。' },
      { id: 'knowledge',  label: '楽器の知識',   icon: '📚',
        prompt: 'バイオリンの構造（弓・松脂・駒・魂柱）と初心者が知っておくべき選び方を教えてください。' },
      { id: 'shops',      label: '楽器店・工房', icon: '🏪',
        prompt: 'バイオリンの楽器店・工房で何をチェックすべきか、弓の選び方も含めて教えてください。' },
      { id: 'concert',    label: '演奏会マナー', icon: '🎭',
        prompt: 'バイオリンのコンサートや室内楽演奏会でのマナーと楽しみ方を教えてください。' },
      { id: 'strings',    label: '弦の選び方',   icon: '🎵',
        prompt: 'バイオリンの弦の種類と選び方、交換タイミング、松脂の使い方を教えてください。' },
    ],
  },

  other: {
    name: '楽器',
    shortName: '楽器',
    defaultMenu: [
      { id: 'warmup', title: 'ウォームアップ',   minutes: 10, done: false },
      { id: 'basic',  title: '基礎練習',         minutes: 15, done: false },
      { id: 'piece',  title: '曲・レパートリー', minutes: 20, done: false },
    ],
    aiPrompt: `あなたは音楽の経験豊富で親身な指導者です。
生徒は楽器を練習しています。以下の方針で回答してください：
- 回答は3〜5文で具体的に、初心者にわかりやすい言葉で
- 練習メニューを提案するときは番号付きリストで
- 短時間集中と間隔反復を自然に勧める
- 音楽の楽しさを常に中心に置いた指導を心がける`,
    accentColor: '#2d5a3d',
    worldCategories: [
      { id: 'performers', label: '演奏家',       icon: '🎼',
        prompt: '世界的な音楽家について、その演奏スタイルや音楽への向き合い方を教えてください。' },
      { id: 'composers',  label: '作曲家',       icon: '✍️',
        prompt: '音楽史に残る作曲家について、代表作と時代背景を教えてください。' },
      { id: 'knowledge',  label: '楽器の知識',   icon: '📚',
        prompt: '楽器の構造や音が出る仕組み、メンテナンスの基本を教えてください。' },
      { id: 'theory',     label: '音楽理論',     icon: '🎵',
        prompt: '楽器練習に役立つ音楽理論の基礎（スケール・コード・リズム）を教えてください。' },
      { id: 'concert',    label: '演奏会マナー', icon: '🎭',
        prompt: 'コンサートホールでのマナーと音楽を深く楽しむための心構えを教えてください。' },
      { id: 'practice',   label: '練習のコツ',   icon: '💡',
        prompt: '楽器上達に役立つ練習法（メンタル・身体管理を含む）を教えてください。' },
    ],
  },
};

/**
 * 楽器IDから設定を取得。未知のIDは 'other' にフォールバック。
 * @param {string} id
 * @returns {object}
 */
export function getInstrumentConfig(id) {
  return INSTRUMENTS[id] || INSTRUMENTS.other;
}

/** オンボーディング選択肢 */
export const INSTRUMENT_CHOICES = [
  { id: 'guitar',  label: 'ギター',     icon: '🎸' },
  { id: 'piano',   label: 'ピアノ',     icon: '🎹' },
  { id: 'violin',  label: 'バイオリン', icon: '🎻' },
  { id: 'other',   label: 'その他',     icon: '🎵' },
];
