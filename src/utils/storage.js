// ==========================================
// storage.js - localStorage ユーティリティ
// ==========================================

const KEY = 'musicmind_stats';

const DEFAULT_STATS = {
  pitch:    { played: 0, correct: 0, bestStreak: 0 },
  interval: { played: 0, correct: 0, bestStreak: 0 },
  chord:    { played: 0, correct: 0, bestStreak: 0 },
};

export function loadStats() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_STATS);
    return { ...structuredClone(DEFAULT_STATS), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_STATS);
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    // ストレージがいっぱいの場合は無視
  }
}

export function recordResult(gameId, correct, currentStreak) {
  const stats = loadStats();
  if (!stats[gameId]) {
    stats[gameId] = { played: 0, correct: 0, bestStreak: 0 };
  }
  stats[gameId].played += 1;
  if (correct) stats[gameId].correct += 1;
  if (currentStreak > stats[gameId].bestStreak) {
    stats[gameId].bestStreak = currentStreak;
  }
  saveStats(stats);
  return stats;
}

export function getAccuracy(gameId) {
  const stats = loadStats();
  const s = stats[gameId];
  if (!s || s.played === 0) return 0;
  return Math.round((s.correct / s.played) * 100);
}

export function getTotalPlayed() {
  const stats = loadStats();
  return Object.values(stats).reduce((sum, s) => sum + (s.played || 0), 0);
}

export function getTotalCorrect() {
  const stats = loadStats();
  return Object.values(stats).reduce((sum, s) => sum + (s.correct || 0), 0);
}

export function getBestStreak() {
  const stats = loadStats();
  return Object.values(stats).reduce((max, s) => Math.max(max, s.bestStreak || 0), 0);
}

export function clearStats() {
  localStorage.removeItem(KEY);
}
