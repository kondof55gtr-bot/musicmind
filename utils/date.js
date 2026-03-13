// ============================================================
// utils/date.js — 日付・ストリーク計算
// ============================================================

/**
 * 今日の日付文字列を返す 'YYYY-MM-DD'
 */
export function today() {
  const d = new Date();
  return formatDate(d);
}

/**
 * Date オブジェクト → 'YYYY-MM-DD'
 */
export function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 'YYYY-MM-DD' → Date オブジェクト
 */
export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 連続練習日数（ストリーク）を計算
 * @param {object} dates { 'YYYY-MM-DD': true }
 * @returns {number}
 */
export function getStreak(dates) {
  const todayStr = today();
  let streak = 0;
  let cursor = new Date();

  // 今日が練習済みなら今日からカウント、そうでなければ昨日から
  if (!dates[todayStr]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const str = formatDate(cursor);
    if (dates[str]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * 今週（月〜日）の練習時間合計（分）
 * @param {object} minutes { 'YYYY-MM-DD': number }
 * @returns {number}
 */
export function getWeekMinutes(minutes) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));

  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const str = formatDate(d);
    total += minutes[str] || 0;
  }
  return total;
}

/**
 * 指定月の練習日数
 * @param {object} dates
 * @param {number} year
 * @param {number} month 0-indexed
 * @returns {number}
 */
export function getMonthDays(dates, year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  return Object.keys(dates).filter((d) => d.startsWith(prefix) && dates[d]).length;
}

/**
 * 累計練習日数
 */
export function getTotalDays(dates) {
  return Object.values(dates).filter(Boolean).length;
}

/**
 * 指定月の日数
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 指定月1日の曜日 (0=Sun)
 */
export function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * 時刻に応じた挨拶
 */
export function getGreeting(name) {
  const h = new Date().getHours();
  const base = h < 12 ? 'おはようございます' : h < 18 ? 'こんにちは' : 'こんばんは';
  return name ? `${base}、${name}さん` : base;
}
