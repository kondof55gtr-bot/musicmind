// ==========================================
// StatsScreen.js - 統計画面
// ==========================================

import { loadStats, clearStats } from '../utils/storage.js';

const GAME_INFO = {
  pitch:    { name: '音名当て',   icon: '🎵' },
  interval: { name: '音程当て',   icon: '🎼' },
  chord:    { name: 'コード識別', icon: '🎹' },
};

export class StatsScreen {
  constructor(onClear) {
    this.onClear = onClear;
  }

  render(container) {
    const stats = loadStats();
    const hasData = Object.values(stats).some((s) => s.played > 0);

    if (!hasData) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📊</span>
          <p>まだデータがありません</p>
          <p style="margin-top:8px;font-size:0.8rem;color:var(--text-muted)">
            ゲームをプレイするとここに記録されます
          </p>
        </div>
      `;
      return;
    }

    const rows = Object.entries(GAME_INFO).map(([id, info]) => {
      const s = stats[id] || { played: 0, correct: 0, bestStreak: 0 };
      const accuracy = s.played > 0 ? Math.round((s.correct / s.played) * 100) : 0;
      return `
        <div class="stat-row">
          <div>
            <span style="font-size:1.2rem">${info.icon}</span>
            <span class="name" style="margin-left:8px">${info.name}</span>
          </div>
          <div class="numbers">
            <div class="accuracy">${accuracy}%</div>
            <div class="played">${s.played}回 / 最高連続${s.bestStreak}</div>
            <div class="accuracy-bar">
              <div class="accuracy-fill" style="width:${accuracy}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="stats-section">
        <h3>ゲーム別成績</h3>
        <div class="card">
          ${rows}
        </div>
      </div>
      <button class="btn btn-secondary" id="clear-stats-btn" style="width:100%;margin-top:8px">
        記録をリセット
      </button>
    `;

    document.getElementById('clear-stats-btn').addEventListener('click', () => {
      if (confirm('全ての記録をリセットしますか？')) {
        clearStats();
        this.onClear();
        this.render(container);
      }
    });
  }
}
