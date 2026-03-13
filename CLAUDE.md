# MusicMind - AI Music Practice PWA

## プロジェクト概要
スマートフォン向けのPWA（Progressive Web App）音楽練習アプリ。
Web Audio APIを使用して音を生成し、音楽理論の耳鍛えトレーニングを提供する。

## 技術スタック
- **フロントエンド**: Vanilla JavaScript (ES Modules) - フレームワークなし
- **スタイル**: Pure CSS (CSS Variables, Grid, Flexbox)
- **音声**: Web Audio API
- **PWA**: Service Worker + Web App Manifest
- **ストレージ**: localStorage (スコア・設定の永続化)

## プロジェクト構造
```
musicmind/
├── CLAUDE.md
├── index.html          # アプリシェル
├── manifest.json       # PWAマニフェスト
├── sw.js               # Service Worker
├── styles/
│   └── main.css        # グローバルスタイル
├── src/
│   ├── app.js          # エントリーポイント・ルーター
│   ├── audio/
│   │   ├── AudioEngine.js   # Web Audio API ラッパー
│   │   └── notes.js         # 音名・周波数定義
│   ├── games/
│   │   ├── PitchGame.js     # 音名当てゲーム
│   │   ├── IntervalGame.js  # 音程当てゲーム
│   │   └── ChordGame.js     # コード識別ゲーム
│   ├── ui/
│   │   ├── HomeScreen.js    # ホーム画面
│   │   ├── GameScreen.js    # ゲーム画面ベース
│   │   └── StatsScreen.js   # 統計画面
│   └── utils/
│       └── storage.js       # localStorage ユーティリティ
└── icons/                   # PWAアイコン
```

## MVP機能 (v1.0)
1. **音名当て (Pitch Training)** - 音を聞いて C/D/E/F/G/A/B から選ぶ
2. **音程当て (Interval Training)** - 2音を聞いて音程名を選ぶ
3. **コード識別 (Chord Recognition)** - コードを聞いてメジャー/マイナーなどを選ぶ
4. **スコア管理** - 正解率・連続正解数を localStorage に保存
5. **オフライン対応** - Service Worker でキャッシュ

## UI/UX 設計原則
- **スマホファースト**: min タップ領域 48px
- **ダークテーマ**: 目に優しい配色
- **シングルページ**: ページ遷移なし、状態管理のみ
- **ボトムナビ**: Home / Games / Stats の3タブ

## カラーパレット
```css
--bg-primary: #0f0f1a       /* 深い紺 */
--bg-card: #1a1a2e           /* カード背景 */
--accent: #7c4dff            /* 紫 (メインカラー) */
--accent-light: #b388ff      /* ライト紫 */
--correct: #4caf50           /* 正解グリーン */
--wrong: #f44336             /* 不正解レッド */
--text-primary: #ffffff
--text-secondary: #9e9e9e
```

## 開発コマンド
```bash
# ローカルサーバー起動 (Python)
python3 -m http.server 8080

# ローカルサーバー起動 (Node)
npx serve .
```

## 開発ガイドライン
- ES Modules を使用 (`type="module"`)
- クラスベースの設計
- イベント駆動アーキテクチャ
- Web Audio APIは必ずユーザーインタラクション後に初期化
- 新機能追加時はゲームモジュールを `src/games/` に追加

## テスト方針
- ブラウザのDevToolsで手動テスト
- Lighthouse でPWAスコアを確認
- 実機 (iOS/Android) でのタッチ操作確認
