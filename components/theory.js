// ============================================================
// components/theory.js — 音楽基礎（ソルフェージュ）
// 全楽器共通コア。INSTRUMENT_CONFIG に依存しない。
// ============================================================

export const THEORY_CATEGORIES = [
  {
    id: 'solfege',
    label: 'ドレミの読み方',
    icon: '🎵',
    prompt: 'ドレミ（音名）の読み方について、固定ド・移動ドの違いも含めて初心者にわかりやすく教えてください。',
    fallback: `「ドレミ」とは音の高さに名前をつけたものです。日本では「ドレミファソラシ」、英語では「C D E F G A B」と呼びます。「固定ド」はCの音を常に「ド」と呼ぶ方法で、クラシック音楽で主流です。「移動ド」は調（キー）に合わせて「ド」の位置が変わる方法で、相対的な音の関係を学ぶのに役立ちます。まず楽器の音を聴きながら「ドレミ」と口ずさむことから始めましょう。`,
  },
  {
    id: 'scales',
    label: '音階の構造',
    icon: '📐',
    prompt: '音階の構造（全音・半音のパターン）について、長音階・短音階を例に初心者にわかりやすく教えてください。',
    fallback: `音階は音を低い方から高い方へ並べたものです。最も基本的な長音階（メジャースケール）は「全・全・半・全・全・全・半」という全音と半音のパターンでできています。Cメジャースケール（ドレミファソラシド）がその代表例で、ピアノの白鍵だけで弾けます。この「全全半全全全半」のパターンさえ覚えれば、どの音からでも長音階を作れるようになります。`,
  },
  {
    id: 'notation',
    label: '楽譜の読み方',
    icon: '📄',
    prompt: '五線譜の基本（五線・ト音記号・音符の位置）について、初心者が楽譜を読み始めるための最初のステップを教えてください。',
    fallback: `楽譜は5本の横線（五線）の上に音符を並べたものです。ト音記号が書かれた五線では、下から「ミ・ソ・シ・レ・ファ」と線の音が並び、その間に「ファ・ラ・ド・ミ」が入ります。まず「Every Good Boy Deserves Fudge（線：ミソシレファ）」のような語呂合わせで覚えましょう。楽譜を読む練習は毎日少しずつ、簡単な曲から始めることが上達の秘訣です。`,
  },
  {
    id: 'symbols',
    label: '音符と記号',
    icon: '🎼',
    prompt: '音符の種類（四分音符・八分音符・付点など）と基本的な楽譜記号（タイ・スラー・強弱記号）を初心者向けに教えてください。',
    fallback: `音符には長さがあります。四分音符が「1拍」の基準で、二分音符は2拍、全音符は4拍です。八分音符は半拍（四分音符の半分）です。付点がつくと元の長さの1.5倍になります。「タイ」は同じ音の音符をつなげて長くする記号、「スラー」は異なる音を滑らかにつなぐ記号です。これらを一つずつ実際の曲の中で確認しながら覚えていきましょう。`,
  },
];

/**
 * 音楽基礎カテゴリを container に描画
 * @param {HTMLElement} container
 * @param {Function} onSelect (category) => void
 */
export function renderTheoryCategories(container, onSelect) {
  const html = `
    <div class="section-label">ソルフェージュ</div>
    <div class="category-grid">
      ${THEORY_CATEGORIES.map((cat) => `
        <button class="category-card" data-id="${cat.id}">
          <span class="category-icon">${cat.icon}</span>
          <span class="category-label">${cat.label}</span>
        </button>
      `).join('')}
    </div>
    <div id="theory-explanation" class="explanation-area hidden"></div>
    <p class="hint-text">カテゴリをタップするとAIが解説します</p>
  `;
  container.innerHTML = html;

  container.querySelectorAll('.category-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = THEORY_CATEGORIES.find((c) => c.id === btn.dataset.id);
      if (cat) onSelect(cat);
    });
  });
}
