// ============================================================
// utils/storage.js — localStorage ラッパー
// 全ての永続化操作はこのファイル経由で行う
// ============================================================

export const KEYS = {
  PROFILE:  'gm_profile',
  MENU:     'gm_menu',
  DATES:    'gm_dates',
  MINUTES:  'gm_minutes',
  CHAT:     'gm_chat',
  SETTINGS: 'gm_settings',
  LIMITS:   'gm_limits',
  APIKEY:   'gm_apikey',
};

const CHAT_MAX = 20;

// ---- Generic ----
function get(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function set(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// ---- Profile ----
export function loadProfile() {
  return get(KEYS.PROFILE, {
    name: '',
    instrument: 'guitar',
    level: 'beginner',
    isPro: false,
    onboardingDone: false,
  });
}
export function saveProfile(profile) { set(KEYS.PROFILE, profile); }

// ---- Menu ----
export function loadMenu() { return get(KEYS.MENU, null); }
export function saveMenu(menu) { set(KEYS.MENU, menu); }

// ---- Practice Dates ----
export function loadDates() { return get(KEYS.DATES, {}); }
export function saveDates(dates) { set(KEYS.DATES, dates); }

export function toggleDate(dateStr) {
  const dates = loadDates();
  if (dates[dateStr]) {
    delete dates[dateStr];
  } else {
    dates[dateStr] = true;
  }
  saveDates(dates);
  return dates;
}

// ---- Practice Minutes ----
export function loadMinutes() { return get(KEYS.MINUTES, {}); }
export function saveMinutes(minutes) { set(KEYS.MINUTES, minutes); }

export function addMinutes(dateStr, mins) {
  const minutes = loadMinutes();
  minutes[dateStr] = (minutes[dateStr] || 0) + mins;
  saveMinutes(minutes);
}

// ---- Chat ----
export function loadChat() { return get(KEYS.CHAT, []); }
export function saveChat(messages) {
  // 最新20件のみ保持
  const trimmed = messages.slice(-CHAT_MAX);
  set(KEYS.CHAT, trimmed);
}
export function appendChat(msg) {
  const msgs = loadChat();
  msgs.push(msg);
  saveChat(msgs);
}

// ---- Settings ----
export function loadSettings() {
  return get(KEYS.SETTINGS, { bpm: 80, showLabels: true });
}
export function saveSettings(s) { set(KEYS.SETTINGS, s); }

// ---- API Key ----
export function loadApiKey() {
  return localStorage.getItem(KEYS.APIKEY) || '';
}
export function saveApiKey(key) {
  localStorage.setItem(KEYS.APIKEY, key);
}

// ---- Freemium Limits ----
const FREE_CHAT_LIMIT = 3;

export function loadLimits() {
  return get(KEYS.LIMITS, { chatDate: '', chatCount: 0 });
}
export function saveLimits(l) { set(KEYS.LIMITS, l); }

/**
 * 日次リセット + チャット使用回数チェック
 * @param {string} today 'YYYY-MM-DD'
 * @returns {{ allowed: boolean, remaining: number }}
 */
export function checkChatLimit(today) {
  const profile = loadProfile();
  if (profile.isPro) return { allowed: true, remaining: Infinity };

  let limits = loadLimits();
  if (limits.chatDate !== today) {
    limits = { chatDate: today, chatCount: 0 };
    saveLimits(limits);
  }
  const remaining = FREE_CHAT_LIMIT - limits.chatCount;
  return { allowed: remaining > 0, remaining };
}

export function incrementChatCount(today) {
  let limits = loadLimits();
  if (limits.chatDate !== today) limits = { chatDate: today, chatCount: 0 };
  limits.chatCount += 1;
  saveLimits(limits);
}

// ---- Clear All ----
export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
