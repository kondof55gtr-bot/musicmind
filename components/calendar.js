// ============================================================
// components/calendar.js — 月間カレンダー描画
// ============================================================

import { getDaysInMonth, getFirstDayOfWeek, formatDate, today } from '../utils/date.js';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * カレンダーを container に描画する
 * @param {HTMLElement} container
 * @param {number} year
 * @param {number} month 0-indexed
 * @param {object} dates { 'YYYY-MM-DD': true }
 */
export function renderCalendar(container, year, month, dates) {
  const todayStr   = today();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay   = getFirstDayOfWeek(year, month); // 0=Sun

  let html = `
    <div class="cal-header">
      <button class="cal-nav" data-dir="-1">‹</button>
      <span class="cal-title">${year}年 ${month + 1}月</span>
      <button class="cal-nav" data-dir="1">›</button>
    </div>
    <div class="cal-grid">
  `;

  // 曜日ヘッダー
  WEEKDAYS.forEach((d, i) => {
    const cls = i === 0 ? 'cal-wday cal-wday--sun' : i === 6 ? 'cal-wday cal-wday--sat' : 'cal-wday';
    html += `<div class="${cls}">${d}</div>`;
  });

  // 空白セル
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-cell cal-cell--empty"></div>`;
  }

  // 日付セル
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const practiced = dates[dateStr];
    const isToday   = dateStr === todayStr;
    const dow       = (firstDay + d - 1) % 7;

    let cls = 'cal-cell';
    if (isToday)   cls += ' cal-cell--today';
    if (practiced) cls += ' cal-cell--practiced';
    if (dow === 0) cls += ' cal-cell--sun';
    if (dow === 6) cls += ' cal-cell--sat';

    html += `
      <div class="${cls}" data-date="${dateStr}">
        <span class="cal-day">${d}</span>
        ${practiced ? '<span class="cal-dot"></span>' : ''}
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;
}
