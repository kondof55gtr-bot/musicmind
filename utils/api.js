// ============================================================
// utils/api.js — Claude API 呼び出し & フォールバック
// 全 AI 呼び出しはこのファイルの callClaude() を経由する
// ============================================================

import { getInstrumentConfig } from '../instrument.config.js';
import { loadProfile, loadApiKey } from './storage.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 512;

// ---- フォールバック ------
const FALLBACKS = {
  chat: {
    'Fコードが押さえられない': `Fコードは多くの人が最初に壁を感じるコードです。まず人差し指全体でセーハするのではなく、1・2弦だけを押さえる「ミニFコード」から始めましょう。毎日5分だけ練習することで、1〜2週間で指の力と形が整ってきます。焦らず小さなステップで積み上げていきましょう。`,
    '今日何を練習する？': `今日は以下の順番で練習してみましょう。\n\n1. ウォームアップ（スケール）: 10分 — 指を温め、音程感を育てます\n2. コード練習: 15分 — 1つのコードをきれいに鳴らすことに集中\n3. 曲の練習: 20分 — 難しい箇所をゆっくり反復\n\n合計45分。短い休憩を挟みながら行うと集中力が持続します。`,
    '練習のやる気が出ない': `やる気が出ないのは、練習のハードルが高すぎるサインかもしれません。「ギターを手に取って1分だけ弾く」という最小の目標から始めてみてください。人間の脳は始めることで動き出します。お気に入りの曲の一小節だけを弾くところから始めても十分です。`,
    '右手のフォームを教えて': `右手（ピッキング）の基本フォームは、手首を軽くリラックスさせ、指先が弦に対して斜め45度程度に当たるようにします。親指・人差し指・中指の3本を主に使い、小指はボディに軽く触れて安定させましょう。鏡で自分のフォームを確認するのが上達の近道です。`,
    '初見で止まってしまう': `初見で止まるのは当然です。まず楽譜全体を1分間「眺める」だけで弾かず、難しそうな箇所を心の中でメモしましょう。次に、止まっても絶対に戻らず最後まで弾き切る練習をします。止まらずに弾くことが初見の核心です。テンポは半分でも構いません。`,
    default: `練習に取り組んでいる姿勢が素晴らしいです。具体的に困っていることをもう少し詳しく教えてもらえますか？例えば「Cコードの音がきれいに出ない」「テンポが安定しない」など、具体的な状況を教えていただくと的確なアドバイスができます。`
  },
  world: {
    performers: `セゴビア（1893-1987）はクラシックギターを現代の演奏会の舞台に確立した巨匠です。音色の美しさと音楽への深い解釈で知られています。日本では村治佳織、福田進一が世界的に活躍しています。ぜひYouTubeで彼らの演奏を聴き、音色・右手のタッチ・表情の付け方を観察してみてください。`,
    composers: `タレガ（1852-1909）は「ギターのショパン」と呼ばれ、アルハンブラの思い出などの名曲を生み出しました。ソル（1778-1839）はギターのための教則本と美しいエチュードを多数残しています。まず一人の作曲家の曲を深く聴き込むことで、音楽への理解が深まります。`,
    knowledge: `クラシックギターは6本のナイロン弦を持つ楽器で、胴体はスプルース（またはシダー）の表板と、ローズウッドなどの横裏板から作られています。初心者には3〜5万円程度の国産メーカー品がおすすめです。必ずお店で実際に弾き比べ、音の鳴り・ネックの握り心地を確認しましょう。`,
    shops: `楽器店では「自由に弾いて構いません」と声をかけてもらえます。試奏では①開放弦を弾いて音量・響きを確認 ②コードを押さえてネックの反りをチェック ③12フレットで音程のズレを確認します。「練習用に探しています」と正直に伝えると、予算に合った提案をしてもらえます。`,
    concert: `クラシックギターのリサイタルは演奏者との距離が近い親密な空間です。演奏中の写真撮影・録音は禁止です。拍手は曲と曲の間（組曲は最後まで）が基本。終演後は「ブラボー」の声や、ロビーで演奏者に感想を伝えることもできます。プログラムを読んで曲の背景を予習しておくとより楽しめます。`,
    strings: `クラシックギターの弦はナイロン弦が標準です。1〜3弦はナイロン単線、4〜6弦はナイロンまたはシルクにシルバーやブロンズを巻いた巻弦です。初心者にはヤマハやダダリオの「エクストラライト〜ノーマル」テンションがおすすめ。1〜2ヶ月で交換するのが理想的です。`,
    default: `クラシックギターの世界は奥深く、様々な楽しみ方があります。演奏家の動画を観たり、教本で理論を学んだり、楽器店で試奏したりと、少しずつ世界を広げていきましょう。何か具体的に知りたいことがあれば気軽に聞いてください。`
  },
  theory: {
    default: `音楽理論は楽器演奏の地図です。最初はドレミの音名と五線譜の読み方だけで十分です。週に1テーマずつ少しずつ積み上げていきましょう。理論を知ることで、曲の構造が見えてきて練習がもっと楽しくなります。`
  }
};

// ---- システムプロンプト生成 ----
function buildSystemPrompt(mode, config) {
  const base = config.aiPrompt;
  if (mode === 'chat') return base;
  if (mode === 'world') return `${base}\n\nあなたは今、${config.name}の世界（歴史・文化・楽器知識）について解説しています。3〜5文で、具体的な人名・作品名・場所を含めて答えてください。`;
  if (mode === 'theory') return `${base}\n\nあなたは今、音楽基礎理論（ソルフェージュ）を解説しています。初心者が理解できる平易な言葉で、具体例を交えて3〜5文で答えてください。`;
  return base;
}

// ---- フォールバック取得 ----
export function getFallback(mode, message) {
  if (mode === 'chat') {
    const key = Object.keys(FALLBACKS.chat).find((k) => k !== 'default' && message.includes(k));
    return FALLBACKS.chat[key] || FALLBACKS.chat.default;
  }
  if (mode === 'world') {
    const key = Object.keys(FALLBACKS.world).find((k) => k !== 'default' && message.includes(k));
    return FALLBACKS.world[key] || FALLBACKS.world.default;
  }
  return FALLBACKS.theory.default;
}

// ---- メイン: Claude API 呼び出し ----
/**
 * @param {'chat'|'world'|'theory'} mode
 * @param {string} userMessage
 * @param {Array<{role:string, text:string}>} [history=[]]
 * @returns {Promise<string>}
 */
export async function callClaude(mode, userMessage, history = []) {
  const apiKey = loadApiKey();
  if (!apiKey) return getFallback(mode, userMessage);

  const profile = loadProfile();
  const config  = getInstrumentConfig(profile.instrument);
  const system  = buildSystemPrompt(mode, config);

  // 会話履歴を Anthropic 形式に変換
  const messages = [
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: userMessage },
  ];

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system, messages }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text || getFallback(mode, userMessage);
  } catch (err) {
    console.warn('[MusicMind] API error:', err.message);
    return getFallback(mode, userMessage);
  }
}
