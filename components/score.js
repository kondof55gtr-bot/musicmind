// ============================================================
// components/score.js — 初見楽譜 SVG 表示 + 問題出題
// ============================================================

// ---- SVG レイアウト定数（rhythm.js と完全同値）----
const ST   = 28;              // staffTop: 上端五線のy
const SS   = 10;              // staffSpace: 五線間隔
const SB   = ST + SS * 4;     // staffBottom = 68
const SUT  = ST + SS * 2;     // stemUpThreshold = 48 (B4 中線)
const SLEN = 33;              // 符尾の長さ
const BH   = 5;               // 連桁の厚さ
const SVG_H = 110;            // SVG 通常高さ
const SVG_H_LABEL = 125;      // 音名ラベルあり時のSVG高さ

// ト音記号・拍子記号エリア
const CLEF_X  = 4;
const CLEF_W  = 26;
const TSIG_X  = CLEF_X + CLEF_W;   // 30
const TSIG_W  = 22;
const FNX     = TSIG_X + TSIG_W + 6; // firstNoteX = 58

// ---- ピッチ → y 座標（rhythm.js と完全同値）----
// 五線 (上→下): F5=28, D5=38, B4=48(中線), G4=58, E4=68
const PY = {
  'G5': ST - SS * 0.5,   // 23
  'F5': ST,               // 28 — 第5線
  'E5': ST + SS * 0.5,   // 33
  'D5': ST + SS,          // 38 — 第4線
  'C5': ST + SS * 1.5,   // 43
  'B4': ST + SS * 2,      // 48 — 第3線（中線）
  'A4': ST + SS * 2.5,   // 53
  'G4': ST + SS * 3,      // 58 — 第2線
  'F4': ST + SS * 3.5,   // 63
  'E4': ST + SS * 4,      // 68 — 第1線（下端）= SB
  'D4': ST + SS * 4.5,   // 73
  'C4': ST + SS * 5,      // 78 — 第1加線下（中央ハ）
};

// ---- 音符タイプ → スロット幅 ----
const NU = 36; // noteUnit
const NW = {
  w: NU * 1.9, h: NU * 1.5, q: NU,   dq: NU * 1.35,
  e: NU * 0.75, de: NU * 1.05, s: NU * 0.6,
  qr: NU, er: NU * 0.75, hr: NU * 1.5, wr: NU * 1.9,
};
const RESTS = new Set(['qr','er','hr','wr']);

// ---- 音名 → 日本語ソルフェージュ ----
const NOTE_NAMES = { C:'ド', D:'レ', E:'ミ', F:'ファ', G:'ソ', A:'ラ', B:'シ' };

// ============================================================
// 問題データ（初級3・中級3・上級2）
// ============================================================
const PROBLEMS = [

  // ========== 初級 ==========
  {
    id: 'b1', level: 'beginner', levelLabel: '初級',
    title: 'ドレミの音階',
    key: 'ハ長調', timeSig: [4, 4],
    measures: [
      [
        { type:'q', pitch:'C4' }, { type:'q', pitch:'D4' },
        { type:'q', pitch:'E4' }, { type:'q', pitch:'F4' },
      ],
      [
        { type:'h', pitch:'G4' }, { type:'h', pitch:'E4' },
      ],
    ],
  },
  {
    id: 'b2', level: 'beginner', levelLabel: '初級',
    title: 'ドミソの分散和音',
    key: 'ハ長調', timeSig: [4, 4],
    measures: [
      [
        { type:'q', pitch:'E4' }, { type:'q', pitch:'G4' },
        { type:'q', pitch:'E4' }, { type:'q', pitch:'C4' },
      ],
      [
        { type:'h', pitch:'G4' }, { type:'h', pitch:'C4' },
      ],
    ],
  },
  {
    id: 'b3', level: 'beginner', levelLabel: '初級',
    title: '跳躍と順次進行',
    key: 'ハ長調', timeSig: [4, 4],
    measures: [
      [
        { type:'q', pitch:'C4' }, { type:'q', pitch:'E4' },
        { type:'q', pitch:'G4' }, { type:'q', pitch:'E4' },
      ],
      [
        { type:'h', pitch:'C5' }, { type:'h', pitch:'G4' },
      ],
    ],
  },

  // ========== 中級 ==========
  {
    id: 'i1', level: 'intermediate', levelLabel: '中級',
    title: 'イ短調のメロディ',
    key: 'イ短調', timeSig: [4, 4],
    measures: [
      [
        { type:'q', pitch:'A4' },
        { type:'e', pitch:'G4', beamStart:true },
        { type:'e', pitch:'A4', beamEnd:true  },
        { type:'q', pitch:'B4' }, { type:'q', pitch:'A4' },
      ],
      [
        { type:'q', pitch:'G4' }, { type:'q', pitch:'F4' },
        { type:'h', pitch:'E4' },
      ],
    ],
  },
  {
    id: 'i2', level: 'intermediate', levelLabel: '中級',
    title: 'ト長調のワルツ',
    key: 'ト長調', timeSig: [3, 4],
    measures: [
      [
        { type:'q', pitch:'G4' }, { type:'q', pitch:'A4' },
        { type:'q', pitch:'B4' },
      ],
      [
        { type:'h', pitch:'D5' }, { type:'q', pitch:'B4' },
      ],
    ],
  },
  {
    id: 'i3', level: 'intermediate', levelLabel: '中級',
    title: '下降するメロディ',
    key: 'ハ長調', timeSig: [4, 4],
    measures: [
      [
        { type:'q', pitch:'G4' },
        { type:'e', pitch:'A4', beamStart:true },
        { type:'e', pitch:'B4', beamEnd:true  },
        { type:'q', pitch:'A4' }, { type:'q', pitch:'G4' },
      ],
      [
        { type:'q', pitch:'F4' }, { type:'q', pitch:'E4' },
        { type:'h', pitch:'D4' },
      ],
    ],
  },

  // ========== 上級 ==========
  {
    id: 'a1', level: 'advanced', levelLabel: '上級',
    title: '付点リズムと休符',
    key: 'ハ長調', timeSig: [4, 4],
    measures: [
      [
        { type:'dq', pitch:'C5', dot:true },
        { type:'e',  pitch:'B4' },
        { type:'q',  pitch:'A4' },
        { type:'qr' },
      ],
      [
        { type:'de', pitch:'G4', dot:true, beamStart:true },
        { type:'s',  pitch:'A4',           beamEnd:true  },
        { type:'q',  pitch:'G4' },
        { type:'h',  pitch:'E4' },
      ],
    ],
  },
  {
    id: 'a2', level: 'advanced', levelLabel: '上級',
    title: '付点と16分音符',
    key: 'イ短調', timeSig: [3, 4],
    measures: [
      [
        { type:'dq', pitch:'A4', dot:true },
        { type:'e',  pitch:'G4' },
        { type:'er' },
      ],
      [
        { type:'de', pitch:'E4', dot:true, beamStart:true },
        { type:'s',  pitch:'F4',           beamEnd:true  },
        { type:'e',  pitch:'G4', beamStart:true },
        { type:'e',  pitch:'A4', beamEnd:true  },
        { type:'q',  pitch:'A4' },
      ],
    ],
  },
];

// ============================================================
// SVG 描画ヘルパー（rhythm.js と同値の定数で統一）
// ============================================================

function sPY(p)    { return PY[p] ?? (ST + SS * 3); }
function stemUp(p) { return sPY(p) >= SUT; }

function svgStaff(w) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const y = ST + i * SS;
    s += `<line x1="2" y1="${y}" x2="${w - 3}" y2="${y}"
      stroke="var(--text)" stroke-width="1" opacity="0.9"/>`;
  }
  return s;
}

function svgClef() {
  const fs = SS * 8.2;
  const ty = SB + SS * 1.35;
  return `<text x="${CLEF_X}" y="${ty}"
    font-family="'Times New Roman','Georgia',serif"
    font-size="${fs}" fill="var(--text)"
    dominant-baseline="auto" letter-spacing="0">&#x1D11E;</text>`;
}

function svgTimeSig([top, bot]) {
  const cx = TSIG_X + TSIG_W / 2;
  const fs = SS * 1.95;
  return `
    <text x="${cx}" y="${ST + SS * 1.25}" text-anchor="middle" dominant-baseline="middle"
      font-family="var(--font-mono)" font-size="${fs}" font-weight="700"
      fill="var(--text)">${top}</text>
    <text x="${cx}" y="${ST + SS * 3.25}" text-anchor="middle" dominant-baseline="middle"
      font-family="var(--font-mono)" font-size="${fs}" font-weight="700"
      fill="var(--text)">${bot}</text>`;
}

// 単小節縦線
function svgBarline(x) {
  return `<line x1="${x}" y1="${ST}" x2="${x}" y2="${SB}"
    stroke="var(--text)" stroke-width="1.5"/>`;
}

// 終止線（細＋太）
function svgFinalBarline(x) {
  return `
    <line x1="${x - 3}" y1="${ST}" x2="${x - 3}" y2="${SB}"
      stroke="var(--text)" stroke-width="1.5"/>
    <line x1="${x + 1}" y1="${ST}" x2="${x + 1}" y2="${SB}"
      stroke="var(--text)" stroke-width="4"/>`;
}

// 加線
function svgLedger(x, py) {
  let s = '';
  if (py >= SB + SS) {
    for (let ly = SB + SS; ly <= py; ly += SS)
      s += `<line x1="${x-9}" y1="${ly}" x2="${x+9}" y2="${ly}"
        stroke="var(--text)" stroke-width="1.3"/>`;
  }
  if (py <= ST - SS) {
    for (let ly = ST - SS; ly >= py; ly -= SS)
      s += `<line x1="${x-9}" y1="${ly}" x2="${x+9}" y2="${ly}"
        stroke="var(--text)" stroke-width="1.3"/>`;
  }
  return s;
}

// 音符ヘッド（楕円）
function svgHead(x, py, open) {
  const fill = open ? 'none' : 'var(--text)';
  const sw   = open ? '1.6' : '0';
  let s = `<ellipse cx="${x}" cy="${py}" rx="5.8" ry="4.1"
    transform="rotate(-18 ${x} ${py})"
    fill="${fill}" stroke="var(--text)" stroke-width="${sw}"/>`;
  if (open) {
    s += `<ellipse cx="${x}" cy="${py}" rx="3.2" ry="2.1"
      transform="rotate(-18 ${x} ${py})" fill="var(--bg)"/>`;
  }
  return s;
}

// 符点
function svgDot(x, py) {
  const onLine = [ST, ST+SS, ST+SS*2, ST+SS*3, SB].includes(py);
  return `<circle cx="${x + 9}" cy="${onLine ? py - SS * 0.5 : py}"
    r="2.2" fill="var(--text)"/>`;
}

// 旗（8分・16分の旗）
function svgFlag(stx, sty, up, second = false) {
  const off = second ? (up ? 8 : -8) : 0;
  if (up)
    return `<path d="M ${stx},${sty+off} C ${stx+10},${sty+off+3} ${stx+11},${sty+off+12} ${stx+4},${sty+off+18}"
      fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round"/>`;
  return   `<path d="M ${stx},${sty+off} C ${stx+10},${sty+off-3} ${stx+11},${sty+off-12} ${stx+4},${sty+off-18}"
      fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round"/>`;
}

// 休符
function svgRest(x, type) {
  const mid = ST + SS * 2; // B4 ライン y=48
  switch (type) {
    case 'qr': {
      const cx = x;
      return `<path d="M ${cx-3},${mid-9} C ${cx+6},${mid-5} ${cx-1},${mid+0} ${cx+4},${mid+5} C ${cx+7},${mid+8} ${cx+1},${mid+11} ${cx-3},${mid+10}"
        fill="none" stroke="var(--text)" stroke-width="2.2"
        stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'er':
      return `<line x1="${x-2}" y1="${mid+7}" x2="${x+3}" y2="${mid-5}"
          stroke="var(--text)" stroke-width="2" stroke-linecap="round"/>
        <circle cx="${x+3.5}" cy="${mid-4.5}" r="2.5" fill="var(--text)"/>`;
    case 'hr':
      return `<rect x="${x - 7}" y="${mid - SS * 0.55}" width="14" height="${SS * 0.55}"
        fill="var(--text)" rx="0.5"/>`;
    case 'wr':
      return `<rect x="${x - 7}" y="${ST + SS}" width="14" height="${SS * 0.55}"
        fill="var(--text)" rx="0.5"/>`;
    default: return '';
  }
}

// ビームグループ検出
function findBeams(notes) {
  const groups = [];
  let cur = null;
  for (const n of notes) {
    if (n.beamStart) cur = [n];
    else if (cur)    cur.push(n);
    if (n.beamEnd && cur) { groups.push(cur); cur = null; }
  }
  return groups;
}

// 連桁（ビーム）描画
function svgBeam(group) {
  if (group.length < 2) return '';
  const up  = stemUp(group[0].pitch);
  const gsx = n => up ? n.x + 5.5 : n.x - 5.5;
  const gty = n => {
    const py = sPY(n.pitch);
    return up ? py - SLEN : py + SLEN;
  };
  const beamY = group.reduce((s, n) => s + gty(n), 0) / group.length;

  let s = '';
  // 幹
  group.forEach(n => {
    const py  = sPY(n.pitch);
    const sy1 = up ? py - 4 : py + 4;
    s += `<line x1="${gsx(n)}" y1="${sy1}" x2="${gsx(n)}" y2="${beamY}"
      stroke="var(--text)" stroke-width="1.6"/>`;
  });
  // 第1連桁
  const x1   = gsx(group[0]);
  const x2   = gsx(group[group.length - 1]);
  const bTop = up ? beamY - BH : beamY;
  s += `<rect x="${Math.min(x1,x2)}" y="${bTop}"
    width="${Math.abs(x2-x1)}" height="${BH}" fill="var(--text)" rx="1"/>`;
  // 第2連桁（16分音符）
  group.forEach((n, i) => {
    if (n.type === 's') {
      const nx  = gsx(n);
      const pw  = NW.s * 0.9;
      const rpx = i > 0 ? nx - pw : nx;
      const b2y = up ? bTop - BH - 2 : bTop + BH + 2;
      s += `<rect x="${Math.min(nx,rpx)}" y="${b2y}"
        width="${Math.abs(nx-rpx) || pw}" height="${BH}" fill="var(--text)" rx="1"/>`;
    }
  });
  return s;
}

// 1音符の描画（加線・ヘッド・符点・幹・旗）
function svgNote(n, inBeam) {
  const { type, pitch, dot } = n;
  const py   = sPY(pitch);
  const up   = stemUp(pitch);
  const open = type === 'h' || type === 'w';
  let s = '';

  s += svgLedger(n.x, py);
  s += svgHead(n.x, py, open);
  if (dot) s += svgDot(n.x, py);
  if (type === 'w') return s;

  if (!inBeam) {
    const stx = up ? n.x + 5.5 : n.x - 5.5;
    const sy1 = up ? py - 4    : py + 4;
    const sy2 = up ? py - SLEN : py + SLEN;
    s += `<line x1="${stx}" y1="${sy1}" x2="${stx}" y2="${sy2}"
      stroke="var(--text)" stroke-width="1.6"/>`;
    if (['e','de'].includes(type)) s += svgFlag(stx, sy2, up);
    if (type === 's') {
      s += svgFlag(stx, sy2, up);
      s += svgFlag(stx, sy2, up, true);
    }
  }
  return s;
}

// 音名ラベル（初級用）
function svgLabel(n) {
  if (RESTS.has(n.type) || !n.pitch) return '';
  const py     = sPY(n.pitch);
  const labelY = Math.max(py + 14, SB + 12);
  const name   = NOTE_NAMES[n.pitch[0]] ?? n.pitch[0];
  return `<text x="${n.x}" y="${labelY}" text-anchor="middle"
    font-family="var(--font-body)" font-size="9"
    fill="var(--accent)" opacity="0.9">${name}</text>`;
}

// ============================================================
// レイアウト計算（複数小節対応）
// ============================================================
function layoutMeasures(measures) {
  let cx = FNX;
  const allNotes    = [];
  const barlineXs   = [];

  measures.forEach((measure, mi) => {
    measure.forEach(n => {
      const hw = (NW[n.type] ?? NU) * 0.45;
      allNotes.push({ ...n, x: cx + hw, mi });
      cx += NW[n.type] ?? NU;
    });
    cx += 4;
    barlineXs.push(cx);
    cx += 10; // 次小節までの間隔（最終小節はtotalW計算に使わない）
  });

  // 最後の barlineX から終止線位置・全体幅を決定
  const finalX = barlineXs[barlineXs.length - 1];
  const totalW = finalX + 20;
  return { allNotes, barlineXs, totalW };
}

// ============================================================
// SVG ビルダー本体
// ============================================================
function buildScoreSVG(problem, showLabels) {
  const { measures, timeSig } = problem;
  const { allNotes, barlineXs, totalW } = layoutMeasures(measures);
  const svgH = showLabels ? SVG_H_LABEL : SVG_H;

  const beamGroups = findBeams(allNotes);
  const inBeamSet  = new Set(beamGroups.flat());

  const parts = [];

  // 五線
  parts.push(svgStaff(totalW));

  // ト音記号
  parts.push(svgClef());

  // 拍子記号
  parts.push(svgTimeSig(timeSig));

  // 音符・休符
  allNotes.forEach(n => {
    if (RESTS.has(n.type)) {
      parts.push(svgRest(n.x, n.type));
    } else {
      parts.push(svgNote(n, inBeamSet.has(n)));
      if (showLabels) parts.push(svgLabel(n));
    }
  });

  // 連桁
  beamGroups.forEach(g => parts.push(svgBeam(g)));

  // 小節縦線（最後は終止線）
  barlineXs.forEach((bx, i) => {
    parts.push(
      i === barlineXs.length - 1
        ? svgFinalBarline(bx)
        : svgBarline(bx)
    );
  });

  return `<svg viewBox="0 0 ${totalW} ${svgH}"
    xmlns="http://www.w3.org/2000/svg"
    style="width:100%;max-width:100%;overflow:visible;display:block"
    aria-label="${problem.title} 楽譜">
    ${parts.join('\n')}
  </svg>`;
}

// ============================================================
// CSS インジェクション
// ============================================================
function injectStyles() {
  if (document.getElementById('score-css')) return;
  const el = document.createElement('style');
  el.id = 'score-css';
  el.textContent = `
/* ---- Score Component ---- */
.score-wrap {
  padding: 16px;
}
/* 難易度タブ */
.score-level-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}
.score-level-tab {
  flex: 1;
  padding: 9px 4px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-light);
  background: var(--surface);
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.score-level-tab.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-pale);
}
.score-level-tab.active.advanced {
  border-color: var(--gold);
  color: var(--gold);
  background: #fdf8ee;
}

/* 問題カード */
.score-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 12px 10px;
  margin-bottom: 10px;
  box-shadow: var(--shadow-sm);
}
.score-card-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

/* タグ行 */
.score-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.score-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.score-tag.key {
  background: var(--accent-pale);
  color: var(--accent);
}
.score-tag.timesig {
  background: #eef4ff;
  color: #3b5bdb;
}
.score-tag.level-beginner {
  background: #e8fce8;
  color: #2b8a3e;
}
.score-tag.level-intermediate {
  background: var(--gold-light);
  color: #7a5600;
}
.score-tag.level-advanced {
  background: #ffe8e8;
  color: #c0392b;
}

/* SVG スクロール */
.score-svg-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  min-height: ${SVG_H}px;
}
.score-svg-wrap::-webkit-scrollbar { height: 3px; }
.score-svg-wrap::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* 音名ヒント */
.score-label-hint {
  font-size: 0.75rem;
  color: var(--accent);
  text-align: center;
  margin-top: 6px;
  font-style: italic;
}

/* 操作ボタン行 */
.score-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.score-btn-next {
  flex: 1;
  padding: 12px;
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  text-align: center;
}
.score-btn-next:active { transform: scale(0.97); opacity: 0.85; }
.score-btn-label {
  flex: none;
  padding: 12px 14px;
  background: var(--border);
  color: var(--text-light);
  border-radius: var(--radius);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.12s;
}
.score-btn-label.on {
  background: var(--accent-pale);
  color: var(--accent);
}
.score-btn-label:active { opacity: 0.75; }

/* カウンター */
.score-counter {
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--muted);
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}
`;
  document.head.appendChild(el);
}

// ============================================================
// 問題ピッカー
// ============================================================
const LEVELS = ['beginner', 'intermediate', 'advanced'];

function pickRandom(level, excludeId) {
  const pool = PROBLEMS.filter(p => p.level === level);
  const candidates = pool.length > 1
    ? pool.filter(p => p.id !== excludeId)
    : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ============================================================
// initScore エントリポイント
// ============================================================
export function initScore(container) {
  injectStyles();

  let currentLevel   = 'beginner';
  let currentProblem = pickRandom('beginner', null);
  let showLabels     = true;   // 初級はデフォルトON
  let solveCount     = { beginner:0, intermediate:0, advanced:0 };

  // ---- レンダリング ----
  function render() {
    const isBeginnerLevel = currentLevel === 'beginner';
    const canToggleLabels = true; // 全難易度でトグル可

    container.innerHTML = `
      <div class="score-wrap">

        <div class="section-label">難易度を選ぶ</div>
        <div class="score-level-tabs">
          <button class="score-level-tab ${currentLevel==='beginner'     ? 'active' : ''}"
            data-level="beginner">初級</button>
          <button class="score-level-tab ${currentLevel==='intermediate' ? 'active' : ''}"
            data-level="intermediate">中級</button>
          <button class="score-level-tab ${currentLevel==='advanced'     ? 'active advanced' : ''}"
            data-level="advanced">上級</button>
        </div>

        <div class="score-counter" id="sc-counter">
          この難易度：${solveCount[currentLevel]} 問解いた
        </div>

        <div class="score-card">
          <div class="score-card-title">${currentProblem.title}</div>
          <div class="score-tags">
            <span class="score-tag key">${currentProblem.key}</span>
            <span class="score-tag timesig">${currentProblem.timeSig[0]}/${currentProblem.timeSig[1]}拍子</span>
            <span class="score-tag level-${currentLevel}">${currentProblem.levelLabel}</span>
          </div>
          <div class="score-svg-wrap" id="sc-svg-wrap">
            ${buildScoreSVG(currentProblem, showLabels)}
          </div>
          ${showLabels && isBeginnerLevel
            ? `<div class="score-label-hint">音名ラベルを表示中</div>`
            : ''}
        </div>

        <div class="score-actions">
          <button class="score-btn-label ${showLabels ? 'on' : ''}" id="sc-toggle-label">
            ${showLabels ? '音名 ON' : '音名 OFF'}
          </button>
          <button class="score-btn-next" id="sc-next">次の問題 →</button>
        </div>

      </div>`;

    // ---- イベント ----
    // 難易度タブ
    container.querySelectorAll('.score-level-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const lv = btn.dataset.level;
        if (lv === currentLevel) return;
        currentLevel   = lv;
        showLabels     = lv === 'beginner'; // 初級切り替えでON、他はOFF
        currentProblem = pickRandom(lv, null);
        render();
      });
    });

    // 次の問題
    container.querySelector('#sc-next').addEventListener('click', () => {
      solveCount[currentLevel]++;
      currentProblem = pickRandom(currentLevel, currentProblem.id);
      render();
    });

    // 音名トグル
    container.querySelector('#sc-toggle-label').addEventListener('click', () => {
      showLabels = !showLabels;
      // SVGと表示だけ更新（再レンダリング）
      container.querySelector('#sc-svg-wrap').innerHTML =
        buildScoreSVG(currentProblem, showLabels);
      const btn = container.querySelector('#sc-toggle-label');
      btn.textContent = showLabels ? '音名 ON' : '音名 OFF';
      btn.classList.toggle('on', showLabels);
      const hint = container.querySelector('.score-label-hint');
      if (hint) hint.style.display = showLabels ? '' : 'none';
    });
  }

  render();
}
