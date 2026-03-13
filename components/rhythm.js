// ============================================================
// components/rhythm.js — リズム視唱 + SVG楽譜 + メトロノーム
// ============================================================

// ---- SVG レイアウト定数 ----
const ST = 28;          // staffTop: 上端五線のy
const SS = 10;          // staffSpace: 五線間隔
const SB = ST + SS * 4; // staffBottom: 下端五線のy = 68
const SVG_H = 110;      // SVG高さ
const CLEF_X = 4;
const CLEF_W = 26;
const TSIG_X = CLEF_X + CLEF_W; // = 30
const TSIG_W = 22;
const FNX   = TSIG_X + TSIG_W + 6; // firstNoteX = 58
const NU    = 36;  // noteUnit: 四分音符の幅基準
const SLEN  = 33;  // stemLen: 符尾の長さ
const BH    = 5;   // beamHeight
const SUT   = ST + SS * 2; // stemUpThreshold = 48 (中線B4のy)

// ---- ピッチ → y座標 (五線top=28, 各ステップ5px) ----
// 五線: F5=28, D5=38, B4=48(中線), G4=58, E4=68
const PY = {
  'G5': 13, 'F5': 18, 'E5': 23,
  'D5': ST,            // 28 (top line)
  'C5': ST + SS * 0.5, // 33
  'B4': ST + SS * 1,   // 38
  'A4': ST + SS * 1.5, // 43
  'G4': ST + SS * 2,   // 48
  'F4': ST + SS * 2.5, // 53
  'E4': ST + SS * 3,   // 58
  'D4': ST + SS * 3.5, // 63
  'C4': ST + SS * 4,   // 68 (bottom line)
  'B3': ST + SS * 4.5, // 73
};

// ---- 音符タイプ → 幅 ----
const NW = {
  w: NU * 1.9, h: NU * 1.5, q: NU, dq: NU * 1.35,
  e: NU * 0.75, de: NU * 1.05, s: NU * 0.6,
  qr: NU, er: NU * 0.75, hr: NU * 1.5, wr: NU * 1.9,
};
const isRest = t => ['qr','er','hr','wr'].includes(t);

// ============================================================
// 8つのリズムパターン
// ============================================================
const PATTERNS = [
  {
    id: 'basic4',
    title: '基本4拍子',
    genre: 'ポップス・クラシック',
    hint: '最も基本的なリズム。「1・2・3・4」と声に出しながら、一定のテンポを守ることが大切。手拍子から始めよう。',
    timeSig: [4, 4],
    beats: 4,
    swing: false,
    notes: [
      { type: 'q', pitch: 'G4' },
      { type: 'q', pitch: 'B4' },
      { type: 'q', pitch: 'G4' },
      { type: 'q', pitch: 'B4' },
    ],
  },
  {
    id: 'dotted',
    title: '付点リズム',
    genre: 'マーチ・クラシック',
    hint: '付点四分音符は四分音符の1.5倍の長さ。「タァーン・タ」の感覚でリズムに弾みをつけよう。跳ねる感じが出れば◎。',
    timeSig: [4, 4],
    beats: 4,
    swing: false,
    notes: [
      { type: 'dq', pitch: 'G4', dot: true },
      { type: 'e',  pitch: 'E4' },
      { type: 'dq', pitch: 'G4', dot: true },
      { type: 'e',  pitch: 'B4' },
    ],
  },
  {
    id: 'tango',
    title: 'タンゴ',
    genre: 'アルゼンチン・タンゴ',
    hint: '強いアクセントと「ため」が特徴。2拍目の裏(2.5拍目)に向かうシンコペーションを感じながら、腰を落として演奏しよう。',
    timeSig: [4, 4],
    beats: 4,
    swing: false,
    notes: [
      { type: 'q', pitch: 'E4' },
      { type: 'e', pitch: 'G4', beamStart: true },
      { type: 'e', pitch: 'B4', beamEnd: true },
      { type: 'q', pitch: 'G4' },
      { type: 'q', pitch: 'E4' },
    ],
  },
  {
    id: 'habanera',
    title: 'ハバネラ',
    genre: 'キューバ・フラメンコ',
    hint: 'ビゼーの「カルメン」で有名。付点8分音符+16分音符の「タッカ」感が命。重力を感じさせる引っ張りを表現しよう。',
    timeSig: [2, 4],
    beats: 2,
    swing: false,
    notes: [
      { type: 'de', pitch: 'G4', dot: true, beamStart: true },
      { type: 's',  pitch: 'E4',            beamEnd: true   },
      { type: 'e',  pitch: 'G4', beamStart: true },
      { type: 'e',  pitch: 'B4', beamEnd: true   },
    ],
  },
  {
    id: 'waltz',
    title: 'ワルツ',
    genre: 'クラシック・社交ダンス',
    hint: '「1・2・3」の3拍子。1拍目に強いアクセント、2・3拍目は軽やかに。チャイコフスキーの白鳥の湖を思い浮かべよう。',
    timeSig: [3, 4],
    beats: 3,
    swing: false,
    notes: [
      { type: 'q', pitch: 'E4' },
      { type: 'q', pitch: 'G4' },
      { type: 'q', pitch: 'B4' },
    ],
  },
  {
    id: 'jota',
    title: 'ホタ',
    genre: 'スペイン民族音楽',
    hint: 'アラゴン地方の伝統的踊り。3拍子で弾むような軽快さが特徴。カスタネットのリズムを想像しながら跳ねるように演奏しよう。',
    timeSig: [3, 4],
    beats: 3,
    swing: false,
    notes: [
      { type: 'q', pitch: 'G4' },
      { type: 'e', pitch: 'B4', beamStart: true },
      { type: 'e', pitch: 'G4', beamEnd: true   },
      { type: 'q', pitch: 'E4' },
    ],
  },
  {
    id: 'bossanova',
    title: 'ボサノバ',
    genre: 'ブラジル音楽',
    hint: '「イパネマの娘」で有名。付点8分+16分のシンコペーションがボサノバの核心。海風を感じながら、揺れるように演奏しよう。',
    timeSig: [4, 4],
    beats: 4,
    swing: false,
    notes: [
      { type: 'q',  pitch: 'G4' },
      { type: 'de', pitch: 'B4', dot: true, beamStart: true },
      { type: 's',  pitch: 'G4',            beamEnd: true   },
      { type: 'q',  pitch: 'E4' },
      { type: 'q',  pitch: 'G4' },
    ],
  },
  {
    id: 'swing',
    title: 'スウィング',
    genre: 'ジャズ',
    hint: '8分音符を「タータ」の3連符感覚で演奏するのがジャズスウィングの命。譜面通りでなく、グルーヴを身体で感じることが大切。',
    timeSig: [4, 4],
    beats: 4,
    swing: true,
    notes: [
      { type: 'e', pitch: 'G4', beamStart: true },
      { type: 'e', pitch: 'B4', beamEnd: true   },
      { type: 'e', pitch: 'G4', beamStart: true },
      { type: 'e', pitch: 'D5', beamEnd: true   },
      { type: 'e', pitch: 'G4', beamStart: true },
      { type: 'e', pitch: 'B4', beamEnd: true   },
      { type: 'e', pitch: 'G4', beamStart: true },
      { type: 'e', pitch: 'D5', beamEnd: true   },
    ],
  },
];

// ============================================================
// SVG 描画ヘルパー
// ============================================================

function pitchY(p) {
  return PY[p] ?? ST + SS * 2; // fallback to G4
}

function stemDir(p) {
  return pitchY(p) >= SUT; // true = stem UP (note below/on middle line)
}

// 五線
function drawStaff(w) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const y = ST + i * SS;
    s += `<line x1="2" y1="${y}" x2="${w - 3}" y2="${y}" stroke="var(--text)" stroke-width="1" opacity="0.9"/>`;
  }
  return s;
}

// 終端縦線（細+太）
function drawBarline(w) {
  return `
    <line x1="${w - 7}" y1="${ST}" x2="${w - 7}" y2="${SB}" stroke="var(--text)" stroke-width="1.5"/>
    <line x1="${w - 3}" y1="${ST}" x2="${w - 3}" y2="${SB}" stroke="var(--text)" stroke-width="4"/>`;
}

// ト音記号（Unicodeグリフ）
function drawClef() {
  const fs = SS * 8.2;
  const ty = SB + SS * 1.35;
  return `<text x="${CLEF_X}" y="${ty}" font-family="'Times New Roman','Georgia',serif"
    font-size="${fs}" fill="var(--text)" dominant-baseline="auto" letter-spacing="0">&#x1D11E;</text>`;
}

// 拍子記号
function drawTimeSig([top, bot]) {
  const cx = TSIG_X + TSIG_W / 2;
  const fs = SS * 1.95;
  const y1 = ST + SS * 1.25;
  const y2 = ST + SS * 3.25;
  return `
    <text x="${cx}" y="${y1}" text-anchor="middle" dominant-baseline="middle"
      font-family="var(--font-mono)" font-size="${fs}" font-weight="700" fill="var(--text)">${top}</text>
    <text x="${cx}" y="${y2}" text-anchor="middle" dominant-baseline="middle"
      font-family="var(--font-mono)" font-size="${fs}" font-weight="700" fill="var(--text)">${bot}</text>`;
}

// 加線（五線外の音符用）
function drawLedger(x, py) {
  let s = '';
  if (py >= SB + SS) {
    for (let ly = SB + SS; ly <= py; ly += SS) {
      s += `<line x1="${x - 9}" y1="${ly}" x2="${x + 9}" y2="${ly}" stroke="var(--text)" stroke-width="1.3"/>`;
    }
  }
  if (py <= ST - SS) {
    for (let ly = ST - SS; ly >= py; ly -= SS) {
      s += `<line x1="${x - 9}" y1="${ly}" x2="${x + 9}" y2="${ly}" stroke="var(--text)" stroke-width="1.3"/>`;
    }
  }
  return s;
}

// 音符ヘッド（楕円・斜め）
function drawHead(x, py, open) {
  const fill   = open ? 'none' : 'var(--text)';
  const stroke = 'var(--text)';
  const sw     = open ? '1.6' : '0';
  let s = `<ellipse cx="${x}" cy="${py}" rx="5.8" ry="4.1"
    transform="rotate(-18 ${x} ${py})"
    fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  // 白玉（二分音符）の中を白く抜く
  if (open && py !== undefined) {
    s += `<ellipse cx="${x}" cy="${py}" rx="3.2" ry="2.1"
      transform="rotate(-18 ${x} ${py})" fill="var(--bg)"/>`;
  }
  return s;
}

// 符点
function drawDot(x, py) {
  // 五線上にある場合は半スペース上にずらす
  const onLine = [ST, ST+SS, ST+SS*2, ST+SS*3, SB].includes(py);
  const dy = onLine ? py - SS * 0.5 : py;
  return `<circle cx="${x + 9}" cy="${dy}" r="2.2" fill="var(--text)"/>`;
}

// フラグ（付かれた8分・16分音符の旗）
function drawFlag(sx, sy, up, second = false) {
  const off = second ? (up ? 8 : -8) : 0;
  if (up) {
    return `<path d="M ${sx},${sy + off} C ${sx+10},${sy+off+3} ${sx+11},${sy+off+12} ${sx+4},${sy+off+18}"
      fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round"/>`;
  } else {
    return `<path d="M ${sx},${sy + off} C ${sx+10},${sy+off-3} ${sx+11},${sy+off-12} ${sx+4},${sy+off-18}"
      fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round"/>`;
  }
}

// 休符
function drawRest(x, type) {
  const mid = ST + SS * 2; // B4 line
  switch (type) {
    case 'qr': {
      // 四分休符：後ろに曲がる旗形
      const cx = x, cy = mid;
      return `<path d="M ${cx-3},${cy-9} C ${cx+6},${cy-5} ${cx-1},${cy+0} ${cx+4},${cy+5} C ${cx+7},${cy+8} ${cx+1},${cy+11} ${cx-3},${cy+10}"
        fill="none" stroke="var(--text)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'er': {
      // 8分休符：斜め線＋丸
      const cx = x, cy = mid;
      return `
        <line x1="${cx-2}" y1="${cy+7}" x2="${cx+3}" y2="${cy-5}"
          stroke="var(--text)" stroke-width="2" stroke-linecap="round"/>
        <circle cx="${cx+3.5}" cy="${cy-4.5}" r="2.5" fill="var(--text)"/>`;
    }
    case 'hr': {
      // 二分休符：中線上の帽子形（長方形）
      const ry = ST + SS * 2; // B4
      return `<rect x="${x - 7}" y="${ry - SS * 0.55}" width="14" height="${SS * 0.55}"
        fill="var(--text)" rx="0.5"/>`;
    }
    case 'wr': {
      // 全休符：D5線から下にぶら下がる長方形
      const ry = ST + SS; // D5
      return `<rect x="${x - 7}" y="${ry}" width="14" height="${SS * 0.55}"
        fill="var(--text)" rx="0.5"/>`;
    }
    default: return '';
  }
}

// ビーム（連桁）グループ検出
function findBeamGroups(notes) {
  const groups = [];
  let cur = null;
  for (const n of notes) {
    if (n.beamStart) cur = [n];
    else if (cur)    cur.push(n);
    if (n.beamEnd && cur) { groups.push(cur); cur = null; }
  }
  return groups;
}

// ビーム描画（連桁本体 + 幹）
function drawBeam(group) {
  if (group.length < 2) return '';
  const first = group[0];
  const up = stemDir(first.pitch);

  // 各音の幹のx座標
  const sx = n => up ? n.x + 5.5 : n.x - 5.5;

  // 幹先端y（各音の高さに依存しない均一の長さを使う）
  // → 音が違う高さでも連桁は傾かせず水平にする（シンプル実装）
  const tipY = n => {
    const py = pitchY(n.pitch);
    return up ? py - SLEN : py + SLEN;
  };
  const avgTip = group.reduce((s, n) => s + tipY(n), 0) / group.length;
  const beamY  = avgTip;

  let s = '';

  // 幹
  group.forEach(n => {
    const py = pitchY(n.pitch);
    const headY = up ? py - 4 : py + 4;
    s += `<line x1="${sx(n)}" y1="${headY}" x2="${sx(n)}" y2="${beamY}"
      stroke="var(--text)" stroke-width="1.6"/>`;
  });

  // 第1連桁（全音符共通）
  const x1 = sx(first), x2 = sx(group[group.length - 1]);
  const bTop = up ? beamY - BH : beamY;
  s += `<rect x="${Math.min(x1, x2)}" y="${bTop}"
    width="${Math.abs(x2 - x1)}" height="${BH}" fill="var(--text)" rx="1"/>`;

  // 第2連桁（16分音符を含む場合）
  const hasS = group.some(n => n.type === 's');
  if (hasS) {
    const b2off = up ? BH + 2 : -(BH + 2);
    const b2y = bTop + b2off;
    group.forEach((n, i) => {
      if (n.type === 's') {
        const nx = sx(n);
        // 16分音符側に短い連桁（前の音符方向へ）
        const pw = NW.s * 0.9;
        const rpx = i > 0 ? nx - pw : nx;
        s += `<rect x="${Math.min(nx, rpx)}" y="${b2y}"
          width="${Math.abs(nx - rpx) || pw}" height="${BH}" fill="var(--text)" rx="1"/>`;
      }
    });
  }

  return s;
}

// 音符1つ描画（ビーム内かどうかで幹・旗を制御）
function drawNote(n, inBeam) {
  const { type, pitch, dot } = n;
  const py   = pitchY(pitch);
  const up   = stemDir(pitch);
  const open = type === 'h' || type === 'w';
  let s = '';

  // 加線
  s += drawLedger(n.x, py);
  // ヘッド
  s += drawHead(n.x, py, open);
  // 符点
  if (dot) s += drawDot(n.x, py);
  // 全音符は幹なし
  if (type === 'w') return s;

  // 幹（ビーム外のみ；ビーム内はdrawBeamで描く）
  if (!inBeam) {
    const stx = up ? n.x + 5.5 : n.x - 5.5;
    const sy1 = up ? py - 4    : py + 4;
    const sy2 = up ? py - SLEN : py + SLEN;
    s += `<line x1="${stx}" y1="${sy1}" x2="${stx}" y2="${sy2}"
      stroke="var(--text)" stroke-width="1.6"/>`;

    // 旗（8分・付点8分・16分）
    if (['e', 'de'].includes(type)) {
      s += drawFlag(stx, sy2, up);
    }
    if (type === 's') {
      s += drawFlag(stx, sy2, up);
      s += drawFlag(stx, sy2, up, true);
    }
  }

  return s;
}

// スウィング表記（楽譜上部のテキスト）
function drawSwingMark(firstNoteX) {
  const y = ST - 12;
  return `<text x="${firstNoteX}" y="${y}"
    font-family="var(--font-body)" font-size="9" fill="var(--muted)"
    font-style="italic">Swing &#x266A;</text>`;
}

// ============================================================
// SVGビルダー本体
// ============================================================
function buildSVG(pattern) {
  const { notes, timeSig, swing } = pattern;

  // 各音符の x 座標を計算
  let cx = FNX;
  const positioned = notes.map(n => {
    const out = { ...n, x: cx + (NW[n.type] ?? NU) * 0.45 }; // head center
    cx += NW[n.type] ?? NU;
    return out;
  });
  const totalW = cx + 18;

  // ビームグループ
  const beamGroups = findBeamGroups(positioned);
  const inBeamSet  = new Set(beamGroups.flat());

  let parts = [];

  parts.push(drawStaff(totalW));
  parts.push(drawBarline(totalW));
  parts.push(drawClef());
  parts.push(drawTimeSig(timeSig));
  if (swing) parts.push(drawSwingMark(FNX));

  // 音符・休符
  positioned.forEach(n => {
    if (isRest(n.type)) {
      parts.push(drawRest(n.x, n.type));
    } else {
      parts.push(drawNote(n, inBeamSet.has(n)));
    }
  });

  // ビーム
  beamGroups.forEach(g => parts.push(drawBeam(g)));

  return `<svg viewBox="0 0 ${totalW} ${SVG_H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;max-width:100%;overflow:visible;display:block"
    aria-label="${pattern.title} 楽譜">
    ${parts.join('\n')}
  </svg>`;
}

// ============================================================
// メトロノームクラス
// ============================================================
class Metronome {
  constructor() {
    this.bpm      = 80;
    this.playing  = false;
    this._ctx     = null;
    this._tid     = null;
    this._beat    = 0;
    this._beats   = 4;
    this._onTick  = null;
  }

  start(beats, onTick) {
    this.stop();
    if (!this._ctx) {
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch { /* no audio */ }
    }
    if (this._ctx?.state === 'suspended') this._ctx.resume();
    this._beats  = beats;
    this._onTick = onTick;
    this._beat   = 0;
    this.playing = true;
    this._tick();
  }

  stop() {
    clearTimeout(this._tid);
    this.playing = false;
    this._beat   = 0;
  }

  setBpm(bpm) {
    this.bpm = Math.max(40, Math.min(200, bpm));
  }

  _tick() {
    const beat = this._beat % this._beats;
    this._onTick?.(beat);
    this._click(beat === 0);
    this._beat++;
    this._tid = setTimeout(() => this._tick(), 60000 / this.bpm);
  }

  _click(accent) {
    if (!this._ctx) return;
    try {
      const osc  = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      const now  = this._ctx.currentTime;
      osc.type             = 'sine';
      osc.frequency.value  = accent ? 1050 : 740;
      gain.gain.setValueAtTime(accent ? 0.75 : 0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
      osc.connect(gain);
      gain.connect(this._ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch { /* ignore */ }
  }
}

// ============================================================
// CSS インジェクション
// ============================================================
function injectStyles() {
  if (document.getElementById('rhythm-css')) return;
  const style = document.createElement('style');
  style.id = 'rhythm-css';
  style.textContent = `
/* ---- Rhythm Tab ---- */
.rhythm-wrap {
  padding: 16px;
}
.rhythm-pattern-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 12px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.rhythm-pattern-scroll::-webkit-scrollbar { display: none; }
.rhythm-pat-btn {
  flex-shrink: 0;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 13px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-light);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  line-height: 1.2;
}
.rhythm-pat-btn span {
  display: block;
  font-size: 0.65rem;
  font-weight: 400;
  color: var(--muted);
  margin-top: 2px;
}
.rhythm-pat-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-pale);
}
.rhythm-pat-btn.active span { color: var(--accent-light); }

/* Score card */
.rhythm-score-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 12px 10px;
  margin-bottom: 10px;
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.rhythm-score-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
}
.rhythm-score-genre {
  font-size: 0.72rem;
  color: var(--muted);
  margin-bottom: 10px;
}
.rhythm-svg-wrap {
  min-width: 260px;
}

/* Hint */
.rhythm-hint-box {
  background: var(--accent-pale);
  border-left: 3px solid var(--accent);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 12px;
}

/* Metronome card */
.rhythm-metro {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}
.rhythm-bpm-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}
.rhythm-bpm-adj {
  background: var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  width: 44px;
  height: 44px;
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s;
}
.rhythm-bpm-adj:active { background: var(--muted-light); }
.rhythm-bpm-num {
  text-align: center;
  min-width: 80px;
}
.rhythm-bpm-val {
  display: block;
  font-family: var(--font-mono);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}
.rhythm-bpm-lbl {
  display: block;
  font-size: 0.68rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 3px;
}

/* Beat dots */
.rhythm-beat-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 16px;
}
.rhythm-beat-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--border);
  transition: background 0.08s, transform 0.08s;
}
.rhythm-beat-dot.accent {
  background: var(--muted-light);
}
.rhythm-beat-dot.lit {
  transform: scale(1.35);
}
.rhythm-beat-dot.lit.accent {
  background: var(--gold) !important;
}
.rhythm-beat-dot.lit:not(.accent) {
  background: var(--accent-light) !important;
}

/* Play button */
.rhythm-play-btn {
  width: 100%;
  padding: 13px;
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}
.rhythm-play-btn:active { transform: scale(0.97); opacity: 0.85; }
.rhythm-play-btn.playing {
  background: var(--danger, #c0392b);
}
`;
  document.head.appendChild(style);
}

// ============================================================
// UI 描画
// ============================================================
function renderBeatDots(container, beats, currentBeat) {
  const row = container.querySelector('.rhythm-beat-row');
  if (!row) return;
  row.querySelectorAll('.rhythm-beat-dot').forEach((dot, i) => {
    dot.classList.toggle('lit',    i === currentBeat);
    dot.classList.toggle('accent', i === 0);
  });
}

function buildBeatDotsHTML(beats) {
  return Array.from({ length: beats }, (_, i) =>
    `<div class="rhythm-beat-dot${i === 0 ? ' accent' : ''}"></div>`
  ).join('');
}

// ============================================================
// メインエントリポイント
// ============================================================
export function initRhythm(container) {
  injectStyles();

  let selected = PATTERNS[0];
  const metro  = new Metronome();

  function renderPattern(pat) {
    selected = pat;

    // パターンボタン更新
    container.querySelectorAll('.rhythm-pat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.id === pat.id);
    });

    // スコア更新
    container.querySelector('.rhythm-score-title').textContent = pat.title;
    container.querySelector('.rhythm-score-genre').textContent = pat.genre;
    container.querySelector('.rhythm-svg-wrap').innerHTML = buildSVG(pat);

    // ヒント更新
    container.querySelector('.rhythm-hint-box').textContent = pat.hint;

    // ビートドット更新
    container.querySelector('.rhythm-beat-row').innerHTML = buildBeatDotsHTML(pat.beats);

    // 再生中なら再起動
    if (metro.playing) {
      metro.stop();
      metro.start(pat.beats, beat => renderBeatDots(container, pat.beats, beat));
      container.querySelector('.rhythm-play-btn').textContent = '■ ストップ';
      container.querySelector('.rhythm-play-btn').classList.add('playing');
    }
  }

  // ---- HTML構築 ----
  container.innerHTML = `
    <div class="rhythm-wrap">

      <div class="section-label">リズムパターン</div>
      <div class="rhythm-pattern-scroll">
        ${PATTERNS.map(p => `
          <button class="rhythm-pat-btn${p.id === selected.id ? ' active' : ''}" data-id="${p.id}">
            ${p.title}<span>${p.genre}</span>
          </button>`).join('')}
      </div>

      <div class="rhythm-score-card">
        <div class="rhythm-score-title">${selected.title}</div>
        <div class="rhythm-score-genre">${selected.genre}</div>
        <div class="rhythm-svg-wrap">${buildSVG(selected)}</div>
      </div>

      <div class="rhythm-hint-box">${selected.hint}</div>

      <div class="rhythm-metro">
        <div class="rhythm-bpm-row">
          <button class="rhythm-bpm-adj" id="r-bpm-dn" aria-label="BPM -5">−5</button>
          <div class="rhythm-bpm-num">
            <span class="rhythm-bpm-val" id="r-bpm-val">${metro.bpm}</span>
            <span class="rhythm-bpm-lbl">BPM</span>
          </div>
          <button class="rhythm-bpm-adj" id="r-bpm-up" aria-label="BPM +5">+5</button>
        </div>

        <div class="rhythm-beat-row">
          ${buildBeatDotsHTML(selected.beats)}
        </div>

        <button class="rhythm-play-btn" id="r-play">▶ スタート</button>
      </div>

    </div>`;

  // ---- イベント ----
  // パターン選択
  container.querySelectorAll('.rhythm-pat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pat = PATTERNS.find(p => p.id === btn.dataset.id);
      if (pat) renderPattern(pat);
    });
  });

  // BPM調整
  const bpmValEl = container.querySelector('#r-bpm-val');
  container.querySelector('#r-bpm-dn').addEventListener('click', () => {
    metro.setBpm(metro.bpm - 5);
    bpmValEl.textContent = metro.bpm;
  });
  container.querySelector('#r-bpm-up').addEventListener('click', () => {
    metro.setBpm(metro.bpm + 5);
    bpmValEl.textContent = metro.bpm;
  });

  // 再生/停止
  const playBtn = container.querySelector('#r-play');
  playBtn.addEventListener('click', () => {
    if (metro.playing) {
      metro.stop();
      // ドット全消灯
      container.querySelectorAll('.rhythm-beat-dot').forEach(d => d.classList.remove('lit'));
      playBtn.textContent = '▶ スタート';
      playBtn.classList.remove('playing');
    } else {
      metro.start(selected.beats, beat => {
        renderBeatDots(container, selected.beats, beat);
      });
      playBtn.textContent = '■ ストップ';
      playBtn.classList.add('playing');
    }
  });

  // タブ切り替え時にメトロノームを停止
  const observer = new MutationObserver(() => {
    if (!container.offsetParent && metro.playing) {
      metro.stop();
      container.querySelectorAll('.rhythm-beat-dot').forEach(d => d.classList.remove('lit'));
      playBtn.textContent = '▶ スタート';
      playBtn.classList.remove('playing');
    }
  });
  observer.observe(container, { attributes: true, attributeFilter: ['class'] });
}
