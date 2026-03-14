// ==========================================
// HomeScreen.js - ホーム画面
// ==========================================

import { getTotalPlayed, getTotalCorrect, getBestStreak, loadStats } from '../utils/storage.js';

export class HomeScreen {
  constructor(onStartGame) {
    this.onStartGame = onStartGame;
  }

  render(container) {
    const totalPlayed   = getTotalPlayed();
    const totalCorrect  = getTotalCorrect();
    const bestStreak    = getBestStreak();
    const accuracy      = totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0;

    container.innerHTML = `
      <div class="greeting">
        <h2>おはよう 🎶</h2>
        <p>今日も耳を鍛えよう！</p>
      </div>

      <div class="stats-row">
        <div class="stat-chip">
          <span class="value">${totalPlayed}</span>
          <span class="label">回プレイ</span>
        </div>
        <div class="stat-chip">
          <span class="value">${accuracy}%</span>
          <span class="label">正解率</span>
        </div>
        <div class="stat-chip">
          <span class="value">${bestStreak}</span>
          <span class="label">最高連続</span>
        </div>
      </div>

      <div class="card-title">ゲームを選ぶ</div>
      <div class="game-grid">
        ${this._gameCard('pitch', '🎵', '音名当て', '音を聞いて音名を答えよう')}
        ${this._gameCard('interval', '🎼', '音程当て', '2音の音程を当てよう')}
        ${this._gameCard('chord', '🎹', 'コード識別', 'コードの種類を当てよう')}
      </div>
    `;

    container.querySelectorAll('.game-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.onStartGame(card.dataset.game);
      });
    });
  }

  _gameCard(id, icon, name, desc) {
    const stats = loadStats();
    const s = stats[id];
    const accuracy = s && s.played > 0
      ? `${Math.round((s.correct / s.played) * 100)}% (${s.played}回)`
      : '未プレイ';
    return `
      <div class="game-card" data-game="${id}">
        <span class="game-icon">${icon}</span>
        <span class="game-name">${name}</span>
        <span class="game-desc">${desc}</span>
        <span class="best-score">正解率: ${accuracy}</span>
      </div>
    `;
  }
}
