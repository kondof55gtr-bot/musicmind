# MusicMind — 開発ガイドライン v2

## コンセプト
「練習を迷わせない」楽器奏者のための練習OS。
アプリを開いたら1秒で次にやることがわかる。練習開始まで3タップ以内。

## 対象ユーザー
- 初心者〜中級者の楽器学習者（初期実装: ギター中心）
- スマホ利用 (iOS Safari / Android Chrome)

## ファイル構成
```
musicmind/
├── index.html              # アプリシェル
├── app.js                  # メインロジック・タブ制御
├── styles.css              # スタイル（和モダン）
├── instrument.config.js    # 楽器設定 ← 楽器切り替えの核
├── service-worker.js       # PWA Service Worker（ルートに必須）
├── components/
│   ├── timer.js            # 練習タイマー
│   ├── chat.js             # チャットUI
│   ├── calendar.js         # カレンダー描画
│   ├── theory.js           # 音楽基礎カテゴリ
│   ├── score.js            # 五線譜SVG描画 [Phase 2]
│   └── rhythm.js           # リズムパターン [Phase 2]
├── utils/
│   ├── storage.js          # localStorage ラッパー
│   ├── date.js             # 日付・ストリーク計算
│   └── api.js              # Claude API呼び出し・フォールバック
├── pwa/
│   └── manifest.json       # PWAマニフェスト
└── icons/                  # PWAアイコン (既存)
```

## 楽器カスタマイズ設計 (最重要)
`instrument.config.js` の `INSTRUMENTS` オブジェクトに全楽器固有要素を集約。
後から楽器を追加する場合は INSTRUMENTS にキーを追加するだけ。

```javascript
INSTRUMENTS[key] = {
  name,             // 表示名
  shortName,        // 短縮名
  defaultMenu[],    // デフォルト練習メニュー
  aiPrompt,         // 楽器固有AIシステムプロンプト
  accentColor,      // テーマカラー (MVPは共通色)
  worldCategories[] // 「楽器の世界」カテゴリ
}
```

## API設計
全AI呼び出しは `utils/api.js` の `callClaude(mode, message, history)` を通す。
- mode: `'chat'` / `'world'` / `'theory'`
- エラー時は必ず `getFallback(mode, message)` を呼ぶ
- フォールバックテキストは `api.js` に事前収録

## localStorage キー
| キー | 型 | 内容 |
|------|-----|------|
| gm_profile | object | ユーザープロフィール |
| gm_menu | array | 練習メニュー |
| gm_dates | object | 練習済み日付マップ |
| gm_minutes | object | 日付ごとの練習時間 |
| gm_chat | array | チャット履歴 (最新20件) |
| gm_settings | object | アプリ設定 |
| gm_limits | object | フリーミアム制限カウント |
| gm_apikey | string | Anthropic APIキー |

## デザイン原則 (和モダン)
- 背景: `#f7f4ef` / アクセント: `#2d5a3d` / 金: `#b8860b`
- フォント: Shippori Mincho (見出し) / Noto Sans JP (本文) / Space Mono (数字)
- max-width: 430px / タップ領域: min 48px

## フリーミアム
- `gm_profile.isPro` フラグで管理 (MVP: false 固定)
- Free制限: AIチャット3回/日、音楽基礎はソルフェージュのみ
- 制限到達時: アップグレードモーダル表示

## MVPスコープ
- ✅ オンボーディング / 今日の練習 / AI先生 / 楽器の世界 / 練習記録
- ✅ 音楽基礎 (ソルフェージュ解説) / INSTRUMENT_CONFIG 土台 / PWA基本

## Phase 2
- 五線譜SVG / リズム視唱 / 初見練習 / 音程クイズ / 複数楽器切り替え / 決済

## ローカル起動
```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## コーディング規約
- ES Modules (`type="module"`)
- クラスベース設計
- 新機能は既存のモジュールパターンに従って追加
- localStorage 操作は必ず utils/storage.js 経由
