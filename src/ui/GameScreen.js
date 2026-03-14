// ==========================================
// GameScreen.js - ゲーム画面
// ==========================================

const QUESTIONS_PER_ROUND = 10;

export class GameScreen {
  constructor(game, onFinish) {
    this.game = game;
    this.onFinish = onFinish;
    this.questionCount = 0;
    this.correctCount = 0;
    this._container = null;
  }

  render(container) {
    this._container = container;
    container.innerHTML = `
      <div class="game-header">
        <span class="game-title">${this.game.getTitle()}</span>
        <span class="score-badge" id="score-badge">0 / 0</span>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" id="progress-fill" style="width:0%"></div>
      </div>

      <div class="play-zone">
        <button class="play-btn" id="play-btn" aria-label="音を再生">▶</button>
        <p class="play-hint" id="play-hint">タップして音を聴こう</p>
      </div>

      <p class="question-label" id="question-label">何の音・コード？</p>

      <div class="answer-grid" id="answer-grid"></div>

      <div class="feedback-msg" id="feedback-msg"></div>
      <div class="streak-display" id="streak-display"></div>
    `;

    this._setupQuestion();

    document.getElementById('play-btn').addEventListener('click', () => {
      this._playAudio();
    });
  }

  _setupQuestion() {
    this.game.newQuestion();
    this._renderChoices();
    this._updateProgress();

    const feedback = document.getElementById('feedback-msg');
    if (feedback) { feedback.textContent = ''; feedback.className = 'feedback-msg'; }

    const playBtn = document.getElementById('play-btn');
    if (playBtn) { playBtn.textContent = '▶'; playBtn.classList.remove('playing'); }

    const hint = document.getElementById('play-hint');
    if (hint) hint.textContent = 'タップして音を聴こう';
  }

  _renderChoices() {
    const grid = document.getElementById('answer-grid');
    if (!grid) return;

    let choices;
    if (this.game.id === 'pitch') {
      choices = this.game.getChoices();
      grid.innerHTML = choices.map((note) => `
        <button class="answer-btn" data-value="${note}">${note}</button>
      `).join('');
      grid.querySelectorAll('.answer-btn').forEach((btn) => {
        btn.addEventListener('click', () => this._onAnswer(btn.dataset.value));
      });
    } else if (this.game.id === 'interval') {
      choices = this.game.getChoices();
      grid.innerHTML = choices.map((c) => `
        <button class="answer-btn" data-value="${c.semitones}">${c.label}</button>
      `).join('');
      grid.querySelectorAll('.answer-btn').forEach((btn) => {
        btn.addEventListener('click', () => this._onAnswer(Number(btn.dataset.value)));
      });
    } else if (this.game.id === 'chord') {
      choices = this.game.getChoices();
      grid.innerHTML = choices.map((chord) => `
        <button class="answer-btn" data-value="${chord}">${chord}</button>
      `).join('');
      grid.querySelectorAll('.answer-btn').forEach((btn) => {
        btn.addEventListener('click', () => this._onAnswer(btn.dataset.value));
      });
    }
  }

  async _playAudio() {
    const btn = document.getElementById('play-btn');
    if (!btn) return;
    btn.textContent = '♫';
    btn.classList.add('playing');

    const hint = document.getElementById('play-hint');
    if (hint) hint.textContent = '再生中...';

    await this.game.playQuestion();

    if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }
    if (hint) hint.textContent = 'もう一度 / 答えを選ぼう';
  }

  _onAnswer(value) {
    const result = this.game.answer(value);
    if (!result) return;

    this.questionCount += 1;
    if (result.correct) this.correctCount += 1;

    // ボタンのハイライト
    const grid = document.getElementById('answer-grid');
    grid.querySelectorAll('.answer-btn').forEach((btn) => {
      btn.disabled = true;
      const btnVal = this.game.id === 'interval'
        ? Number(btn.dataset.value)
        : btn.dataset.value;
      const correctVal = this.game.id === 'interval'
        ? Number(btn.dataset.value) === this.game.currentInterval
        : btn.dataset.value === this.game.currentNote || btn.dataset.value === this.game.currentChord;

      if (correctVal) btn.classList.add('correct');
      else if (btnVal === value && !result.correct) btn.classList.add('wrong');
    });

    // フィードバックメッセージ
    const feedback = document.getElementById('feedback-msg');
    if (result.correct) {
      feedback.textContent = '正解！ ✓';
      feedback.className = 'feedback-msg correct';
    } else {
      feedback.textContent = `不正解 — 正解: ${result.correctAnswer}`;
      feedback.className = 'feedback-msg wrong';
    }

    // ストリーク表示
    const streakEl = document.getElementById('streak-display');
    if (this.game.streak >= 3) {
      streakEl.innerHTML = `🔥 <span>${this.game.streak}</span> 連続正解！`;
    } else {
      streakEl.innerHTML = '';
    }

    this._updateProgress();

    // 次の問題 or 結果画面
    if (this.questionCount >= QUESTIONS_PER_ROUND) {
      setTimeout(() => this._showResult(), 1200);
    } else {
      setTimeout(() => this._setupQuestion(), 1400);
    }
  }

  _updateProgress() {
    const fill = document.getElementById('progress-fill');
    const badge = document.getElementById('score-badge');
    if (fill) fill.style.width = `${(this.questionCount / QUESTIONS_PER_ROUND) * 100}%`;
    if (badge) badge.textContent = `${this.correctCount} / ${this.questionCount}`;
  }

  _showResult() {
    const accuracy = Math.round((this.correctCount / QUESTIONS_PER_ROUND) * 100);
    let emoji = '😅';
    if (accuracy >= 90) emoji = '🏆';
    else if (accuracy >= 70) emoji = '🎉';
    else if (accuracy >= 50) emoji = '👍';

    const overlay = document.createElement('div');
    overlay.className = 'result-overlay visible';
    overlay.innerHTML = `
      <div class="result-card">
        <div class="result-emoji">${emoji}</div>
        <div class="result-title">ラウンド終了！</div>
        <div class="result-stats">
          <div class="result-stat">
            <span class="val">${this.correctCount}/${QUESTIONS_PER_ROUND}</span>
            <span class="lbl">正解数</span>
          </div>
          <div class="result-stat">
            <span class="val">${accuracy}%</span>
            <span class="lbl">正解率</span>
          </div>
          <div class="result-stat">
            <span class="val">${this.game.streak}</span>
            <span class="lbl">現在の連続</span>
          </div>
          <div class="result-stat">
            <span class="val">${this.game.score}</span>
            <span class="lbl">累計正解</span>
          </div>
        </div>
        <div class="result-actions">
          <button class="btn btn-secondary" id="result-home">ホームへ</button>
          <button class="btn btn-primary" id="result-retry">もう一度</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('result-home').addEventListener('click', () => {
      overlay.remove();
      this.onFinish('home');
    });
    document.getElementById('result-retry').addEventListener('click', () => {
      overlay.remove();
      this.questionCount = 0;
      this.correctCount = 0;
      this._setupQuestion();
    });
  }
}
