// ============================================================
// components/timer.js — 練習タイマー
// ============================================================

export class Timer {
  /**
   * @param {string} id - メニュー項目 ID
   * @param {number} durationMin - 目安時間（分）
   * @param {Function} onTick - (elapsed: number) => void
   * @param {Function} onComplete - () => void
   */
  constructor(id, durationMin, onTick, onComplete) {
    this.id = id;
    this.duration = durationMin * 60; // 秒
    this.elapsed = 0;
    this._interval = null;
    this._onTick = onTick || (() => {});
    this._onComplete = onComplete || (() => {});
  }

  get isRunning() { return this._interval !== null; }

  start() {
    if (this.isRunning) return;
    this._interval = setInterval(() => {
      this.elapsed++;
      this._onTick(this.elapsed);
      if (this.elapsed >= this.duration) this._onComplete();
    }, 1000);
  }

  stop() {
    if (!this.isRunning) return;
    clearInterval(this._interval);
    this._interval = null;
  }

  reset() {
    this.stop();
    this.elapsed = 0;
    this._onTick(0);
  }

  toggle() {
    this.isRunning ? this.stop() : this.start();
  }

  /** 'MM:SS' 形式 */
  getDisplay() {
    return Timer.formatTime(this.elapsed);
  }

  /** 残り時間 'MM:SS' (duration - elapsed) */
  getRemaining() {
    return Timer.formatTime(Math.max(0, this.duration - this.elapsed));
  }

  /** 進捗 0〜1 */
  getProgress() {
    return Math.min(1, this.elapsed / this.duration);
  }

  /** 経過分（切り捨て）*/
  getElapsedMinutes() {
    return Math.floor(this.elapsed / 60);
  }

  static formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  destroy() { this.stop(); }
}
