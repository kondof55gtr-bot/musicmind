// ============================================================
// app.js — MusicMind メインロジック
// ============================================================

import { INSTRUMENTS, INSTRUMENT_CHOICES, getInstrumentConfig } from './instrument.config.js';
import {
  loadProfile, saveProfile,
  loadMenu, saveMenu,
  loadDates, saveDates, toggleDate,
  loadMinutes, addMinutes,
  loadChat, saveChat, appendChat,
  loadApiKey, saveApiKey,
  checkChatLimit, incrementChatCount,
} from './utils/storage.js';
import {
  today, getGreeting, getStreak,
  getWeekMinutes, getMonthDays, getTotalDays,
} from './utils/date.js';
import { callClaude, getFallback } from './utils/api.js';
import { Timer } from './components/timer.js';
import { createMessageEl, createLoadingEl, scrollToBottom, renderHistory } from './components/chat.js';
import { renderCalendar } from './components/calendar.js';
import { THEORY_CATEGORIES, renderTheoryCategories } from './components/theory.js';

// ---- Quick questions for AI chat ----
const QUICK_QUESTIONS = [
  'Fコードが押さえられない',
  '今日何を練習する？',
  '練習のやる気が出ない',
  '右手のフォームを教えて',
  '初見で止まってしまう',
];

class MusicMindApp {
  constructor() {
    this.currentTab    = 'today';
    this.timers        = new Map();   // id → Timer
    this.activeTimerId = null;        // 現在起動中のタイマー ID
    this.calYear       = new Date().getFullYear();
    this.calMonth      = new Date().getMonth();
    this.isSending     = false;
  }

  // ===========================================================
  // INIT
  // ===========================================================
  init() {
    const profile = loadProfile();
    if (!profile.onboardingDone) {
      this._showOnboarding();
    } else {
      this._showMainApp();
    }

    // PWA Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  }

  // ===========================================================
  // ONBOARDING
  // ===========================================================
  _showOnboarding() {
    document.getElementById('onboarding').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
    this._renderOnboarding();
  }

  _renderOnboarding() {
    const ob = document.getElementById('onboarding');
    let step = 1;
    const draft = { instrument: null, level: null, name: '' };

    const render = () => {
      ob.innerHTML = `
        <div class="ob-logo">🎵 MusicMind</div>
        <p class="ob-tagline">練習を迷わせない。毎日の音楽OSへ</p>

        <div class="ob-step">
          <div class="ob-progress">
            ${[1,2,3].map(i => `<div class="ob-dot ${i <= step ? 'active' : ''}"></div>`).join('')}
          </div>

          ${step === 1 ? `
            <p class="ob-step-title">楽器を選んでください</p>
            <div class="ob-cards">
              ${INSTRUMENT_CHOICES.map(c => `
                <button class="ob-card ${draft.instrument === c.id ? 'selected' : ''}" data-val="${c.id}">
                  <span class="ob-card-icon">${c.icon}</span>
                  <span class="ob-card-label">${c.label}</span>
                </button>
              `).join('')}
            </div>
            <button class="btn btn-primary btn-full" id="ob-next" ${!draft.instrument ? 'disabled style="opacity:.4"' : ''}>次へ</button>
          ` : step === 2 ? `
            <p class="ob-step-title">あなたのレベルは？</p>
            <div class="ob-levels">
              <button class="ob-card ${draft.level === 'beginner' ? 'selected' : ''}" data-val="beginner">
                <span class="ob-card-icon">🌱</span>
                <span class="ob-card-label">初心者</span>
              </button>
              <button class="ob-card ${draft.level === 'intermediate' ? 'selected' : ''}" data-val="intermediate">
                <span class="ob-card-icon">🌿</span>
                <span class="ob-card-label">中級者</span>
              </button>
            </div>
            <button class="btn btn-primary btn-full" id="ob-next" ${!draft.level ? 'disabled style="opacity:.4"' : ''}>次へ</button>
          ` : `
            <p class="ob-step-title">お名前を教えてください<br><small style="font-size:.75rem;color:var(--muted)">(任意・後から変更できます)</small></p>
            <input class="ob-name-input" type="text" id="ob-name" placeholder="例: 山田 太郎" maxlength="20" value="${draft.name}">
            <button class="btn btn-primary btn-full" id="ob-start">練習を始める 🎵</button>
          `}
        </div>
      `;

      // Card selection
      ob.querySelectorAll('.ob-card').forEach(card => {
        card.addEventListener('click', () => {
          ob.querySelectorAll('.ob-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          if (step === 1) draft.instrument = card.dataset.val;
          if (step === 2) draft.level      = card.dataset.val;
          // Re-enable next button
          const nextBtn = ob.querySelector('#ob-next');
          if (nextBtn) { nextBtn.disabled = false; nextBtn.style.opacity = '1'; }
        });
      });

      const nextBtn = ob.querySelector('#ob-next');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          step++;
          render();
        });
      }

      const startBtn = ob.querySelector('#ob-start');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          draft.name = (ob.querySelector('#ob-name')?.value || '').trim();
          const cfg  = getInstrumentConfig(draft.instrument || 'guitar');
          const profile = {
            name: draft.name,
            instrument: draft.instrument || 'guitar',
            level: draft.level || 'beginner',
            isPro: false,
            onboardingDone: true,
          };
          saveProfile(profile);
          // Save default menu
          if (!loadMenu()) {
            saveMenu(cfg.defaultMenu.map(m => ({ ...m, done: false })));
          }
          this._showMainApp();
        });
      }
    };

    render();
  }

  // ===========================================================
  // MAIN APP
  // ===========================================================
  _showMainApp() {
    document.getElementById('onboarding').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    this._renderHeader();
    this._setupTabNav();
    this._switchTab('today');
  }

  _renderHeader() {
    const profile = loadProfile();
    const nameEl  = document.getElementById('header-user');
    if (nameEl) nameEl.textContent = profile.name || '';

    document.getElementById('settings-btn')?.addEventListener('click', () => this._openSettings());
  }

  _setupTabNav() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this._switchTab(btn.dataset.tab));
    });
  }

  _switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tabName}`));

    // Scroll active tab button into view
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    activeBtn?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });

    this._renderTab(tabName);
  }

  _renderTab(name) {
    const panel = document.getElementById(`tab-${name}`);
    if (!panel) return;
    switch (name) {
      case 'today':  this._renderToday(panel);  break;
      case 'theory': this._renderTheory(panel); break;
      case 'chat':   this._renderChat(panel);   break;
      case 'world':  this._renderWorld(panel);  break;
      case 'record': this._renderRecord(panel); break;
    }
  }

  // ===========================================================
  // TODAY TAB
  // ===========================================================
  _renderToday(panel) {
    const profile  = loadProfile();
    const dates    = loadDates();
    const streak   = getStreak(dates);
    const todayStr = today();
    const greeting = getGreeting(profile.name);
    const cfg      = getInstrumentConfig(profile.instrument);

    // Ensure menu exists
    let menu = loadMenu();
    if (!menu || menu.length === 0) {
      menu = cfg.defaultMenu.map(m => ({ ...m, done: false }));
      saveMenu(menu);
    }

    const allDone = menu.every(m => m.done);

    panel.innerHTML = `
      <div class="streak-banner">
        <span class="streak-fire">🔥</span>
        <div class="streak-info">
          <div class="streak-num">${streak}</div>
          <div class="streak-label">日連続練習中</div>
        </div>
      </div>

      <p class="greeting-text">${greeting} 👋</p>

      <div class="section-label">今日の練習メニュー</div>

      <div id="menu-list">
        ${menu.map(item => this._menuItemHTML(item)).join('')}
      </div>

      ${allDone ? `
        <div class="alldone-banner">
          <div class="alldone-emoji">🎉</div>
          <div class="alldone-title">全メニュー完了！</div>
          <div class="alldone-sub">素晴らしい練習でした</div>
        </div>
      ` : ''}
    `;

    this._attachMenuEvents(panel, menu);
  }

  _menuItemHTML(item) {
    return `
      <div class="menu-item ${item.done ? 'done' : ''}" data-id="${item.id}">
        <div class="menu-item-top">
          <div class="menu-check-wrap">
            <div class="menu-checkbox ${item.done ? 'checked' : ''}" data-check="${item.id}"></div>
            <span class="menu-title">${item.title}</span>
          </div>
          <span class="menu-minutes">${item.minutes}分</span>
        </div>
        <div class="menu-timer">
          <span class="timer-display" id="timer-disp-${item.id}">00:00</span>
          <button class="timer-btn timer-btn--play" id="timer-play-${item.id}" data-id="${item.id}">▶</button>
          <button class="timer-btn timer-btn--reset" data-reset="${item.id}">↺</button>
        </div>
        <div class="timer-progress">
          <div class="timer-progress-fill" id="timer-prog-${item.id}"></div>
        </div>
      </div>
    `;
  }

  _attachMenuEvents(panel, menu) {
    // Checkbox toggle
    panel.querySelectorAll('[data-check]').forEach(el => {
      el.addEventListener('click', () => this._toggleMenuDone(el.dataset.check));
    });

    // Timer play/pause
    panel.querySelectorAll('[data-id].timer-btn--play').forEach(btn => {
      btn.addEventListener('click', () => this._toggleTimer(btn.dataset.id, menu));
    });

    // Timer reset
    panel.querySelectorAll('[data-reset]').forEach(btn => {
      btn.addEventListener('click', () => this._resetTimer(btn.dataset.reset));
    });
  }

  _toggleMenuDone(id) {
    const menu = loadMenu();
    const item = menu.find(m => m.id === id);
    if (!item) return;
    item.done = !item.done;
    saveMenu(menu);

    // Save today as practiced if any done
    if (menu.some(m => m.done)) {
      const dates = loadDates();
      dates[today()] = true;
      saveDates(dates);
    }

    this._renderTab('today');
  }

  _toggleTimer(id, menu) {
    const item = menu?.find(m => m.id === id) || loadMenu()?.find(m => m.id === id);
    if (!item) return;

    // タイマー二重起動防止: 他のタイマーを止める
    if (this.activeTimerId && this.activeTimerId !== id) {
      const prev = this.timers.get(this.activeTimerId);
      prev?.stop();
      this._updateTimerBtn(this.activeTimerId, false);
    }

    if (!this.timers.has(id)) {
      const timer = new Timer(
        id,
        item.minutes,
        (elapsed) => {
          const disp = document.getElementById(`timer-disp-${id}`);
          const prog = document.getElementById(`timer-prog-${id}`);
          if (disp) disp.textContent = Timer.formatTime(elapsed);
          if (prog) prog.style.width = `${timer.getProgress() * 100}%`;
        },
        () => {
          // 完了: 自動チェック
          this._updateTimerBtn(id, false);
          this.activeTimerId = null;
          // Add minutes
          addMinutes(today(), item.minutes);
          // Auto-check done
          const m = loadMenu();
          const it = m.find(x => x.id === id);
          if (it && !it.done) { it.done = true; saveMenu(m); }
          const dates = loadDates();
          dates[today()] = true;
          saveDates(dates);
          this._renderTab('today');
        }
      );
      this.timers.set(id, timer);
    }

    const timer = this.timers.get(id);
    timer.toggle();

    if (timer.isRunning) {
      this.activeTimerId = id;
      this._updateTimerBtn(id, true);
    } else {
      this.activeTimerId = null;
      this._updateTimerBtn(id, false);
      // Record partial minutes
      if (timer.getElapsedMinutes() > 0) {
        addMinutes(today(), timer.getElapsedMinutes());
        const dates = loadDates();
        dates[today()] = true;
        saveDates(dates);
      }
    }
  }

  _resetTimer(id) {
    const timer = this.timers.get(id);
    if (timer) {
      timer.reset();
      if (this.activeTimerId === id) this.activeTimerId = null;
    }
    const disp = document.getElementById(`timer-disp-${id}`);
    const prog = document.getElementById(`timer-prog-${id}`);
    if (disp) disp.textContent = '00:00';
    if (prog) prog.style.width = '0%';
    this._updateTimerBtn(id, false);
  }

  _updateTimerBtn(id, running) {
    const btn = document.getElementById(`timer-play-${id}`);
    if (!btn) return;
    btn.textContent = running ? '⏸' : '▶';
    btn.classList.toggle('running', running);
  }

  // ===========================================================
  // THEORY TAB
  // ===========================================================
  _renderTheory(panel) {
    renderTheoryCategories(panel, (cat) => this._showTheoryExplanation(cat, panel));
  }

  async _showTheoryExplanation(cat, panel) {
    const expArea = panel.querySelector('#theory-explanation');
    if (!expArea) return;

    panel.querySelectorAll('.category-card').forEach(c =>
      c.classList.toggle('selected', c.dataset.id === cat.id)
    );
    expArea.classList.remove('hidden');
    expArea.innerHTML = `
      <div class="explanation-title">${cat.icon} ${cat.label}</div>
      <div class="dot-loader"><span></span><span></span><span></span></div>
    `;
    expArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const text = await callClaude('theory', cat.prompt);
    expArea.innerHTML = `
      <div class="explanation-title">${cat.icon} ${cat.label}</div>
      ${text.replace(/\n/g, '<br>')}
    `;
  }

  // ===========================================================
  // CHAT TAB
  // ===========================================================
  _renderChat(panel) {
    const profile  = loadProfile();
    const todayStr = today();
    const { allowed, remaining } = checkChatLimit(todayStr);
    const messages = loadChat();

    panel.innerHTML = `
      <div class="chat-wrap">
        <div class="quick-btns" id="quick-btns"></div>
        ${!profile.isPro ? `
          <div class="chat-limit-badge ${remaining <= 1 ? 'warn' : ''}">
            ${remaining > 0 ? `残り ${remaining} 回（無料プラン）` : '本日の上限に達しました'}
          </div>
        ` : ''}
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input-row">
          <input class="chat-input" id="chat-input" type="text" placeholder="質問を入力..." maxlength="200"
            ${allowed ? '' : 'disabled'}>
          <button class="chat-send" id="chat-send" ${allowed ? '' : 'disabled'}>➤</button>
        </div>
      </div>
    `;

    // Quick buttons
    const qbtns = panel.querySelector('#quick-btns');
    QUICK_QUESTIONS.forEach(q => {
      const b = document.createElement('button');
      b.className = 'quick-btn';
      b.textContent = q;
      b.addEventListener('click', () => allowed ? this._sendChatMessage(q) : this._openUpgradeModal());
      qbtns.appendChild(b);
    });

    // Chat history
    const msgContainer = panel.querySelector('#chat-messages');
    if (messages.length === 0) {
      const cfg = getInstrumentConfig(profile.instrument);
      const welcomeEl = createMessageEl({
        role: 'assistant',
        text: `こんにちは！${cfg.name}の練習についてなんでも聞いてください。クイック質問ボタンも使えます 🎵`
      });
      msgContainer.appendChild(welcomeEl);
    } else {
      renderHistory(messages, msgContainer);
    }

    // Input events
    const input  = panel.querySelector('#chat-input');
    const sendBtn = panel.querySelector('#chat-send');
    sendBtn?.addEventListener('click', () => {
      const text = input?.value.trim();
      if (text) { input.value = ''; this._sendChatMessage(text); }
    });
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = input.value.trim();
        if (text) { input.value = ''; this._sendChatMessage(text); }
      }
    });
  }

  async _sendChatMessage(text) {
    if (this.isSending) return;
    const todayStr = today();
    const { allowed } = checkChatLimit(todayStr);
    if (!allowed) { this._openUpgradeModal(); return; }

    this.isSending = true;
    const msgContainer = document.getElementById('chat-messages');
    if (!msgContainer) { this.isSending = false; return; }

    // User message
    const userMsg = { role: 'user', text, ts: Date.now() };
    appendChat(userMsg);
    msgContainer.appendChild(createMessageEl(userMsg));
    scrollToBottom(msgContainer);

    // Loading
    const loadingEl = createLoadingEl();
    msgContainer.appendChild(loadingEl);
    scrollToBottom(msgContainer);

    // Disable input
    const input   = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    if (input)   input.disabled   = true;
    if (sendBtn) sendBtn.disabled = true;

    // API call
    incrementChatCount(todayStr);
    const history = loadChat().slice(-10);
    const reply   = await callClaude('chat', text, history.slice(0, -1));

    // Remove loading, add reply
    loadingEl.remove();
    const assistantMsg = { role: 'assistant', text: reply, ts: Date.now() };
    appendChat(assistantMsg);
    msgContainer.appendChild(createMessageEl(assistantMsg));
    scrollToBottom(msgContainer);

    // Re-check limit
    const { allowed: stillAllowed, remaining } = checkChatLimit(todayStr);
    const badge = document.querySelector('.chat-limit-badge');
    if (badge) {
      badge.textContent = stillAllowed ? `残り ${remaining} 回（無料プラン）` : '本日の上限に達しました';
      badge.classList.toggle('warn', remaining <= 1);
    }
    if (input)   { input.disabled   = !stillAllowed; }
    if (sendBtn) { sendBtn.disabled = !stillAllowed; }

    this.isSending = false;
  }

  // ===========================================================
  // WORLD TAB
  // ===========================================================
  _renderWorld(panel) {
    const profile = loadProfile();
    const cfg     = getInstrumentConfig(profile.instrument);

    panel.innerHTML = `
      <div class="world-instrument-badge">🎵 ${cfg.name}</div>
      <div class="section-label">カテゴリを選ぶ</div>
      <div class="category-grid" id="world-grid">
        ${cfg.worldCategories.map(cat => `
          <button class="category-card" data-id="${cat.id}">
            <span class="category-icon">${cat.icon}</span>
            <span class="category-label">${cat.label}</span>
          </button>
        `).join('')}
      </div>
      <div id="world-explanation" class="explanation-area hidden"></div>
      <p class="hint-text">カテゴリをタップするとAIが解説します</p>
    `;

    panel.querySelectorAll('.category-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = cfg.worldCategories.find(c => c.id === btn.dataset.id);
        if (cat) this._showWorldExplanation(cat, panel);
      });
    });
  }

  async _showWorldExplanation(cat, panel) {
    const expArea = panel.querySelector('#world-explanation');
    if (!expArea) return;

    panel.querySelectorAll('.category-card').forEach(c =>
      c.classList.toggle('selected', c.dataset.id === cat.id)
    );
    expArea.classList.remove('hidden');
    expArea.innerHTML = `
      <div class="explanation-title">${cat.icon} ${cat.label}</div>
      <div class="dot-loader"><span></span><span></span><span></span></div>
    `;
    expArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const text = await callClaude('world', cat.prompt || cat.label);
    expArea.innerHTML = `
      <div class="explanation-title">${cat.icon} ${cat.label}</div>
      ${text.replace(/\n/g, '<br>')}
    `;
  }

  // ===========================================================
  // RECORD TAB
  // ===========================================================
  _renderRecord(panel) {
    const dates    = loadDates();
    const minutes  = loadMinutes();
    const todayStr = today();
    const streak   = getStreak(dates);
    const weekMins = getWeekMinutes(minutes);
    const monthDays = getMonthDays(dates, this.calYear, this.calMonth);
    const totalDays = getTotalDays(dates);
    const practiced = !!dates[todayStr];

    panel.innerHTML = `
      <div class="stats-grid">
        <div class="stat-box">
          <span class="val">${streak}</span>
          <span class="lbl">🔥 連続日数</span>
        </div>
        <div class="stat-box">
          <span class="val">${weekMins}</span>
          <span class="lbl">今週(分)</span>
        </div>
        <div class="stat-box">
          <span class="val">${monthDays}</span>
          <span class="lbl">今月の日数</span>
        </div>
      </div>

      <button class="today-toggle ${practiced ? 'practiced' : 'not-practiced'}" id="today-toggle">
        ${practiced ? '✓ 今日練習済み' : '+ 今日の練習を記録'}
      </button>

      <div class="section-label">練習カレンダー</div>
      <div class="card" id="calendar-wrap"></div>
    `;

    // Calendar
    renderCalendar(
      panel.querySelector('#calendar-wrap'),
      this.calYear, this.calMonth, dates
    );

    // Calendar navigation
    panel.querySelector('#calendar-wrap').addEventListener('click', (e) => {
      const nav = e.target.closest('[data-dir]');
      if (!nav) return;
      const dir = parseInt(nav.dataset.dir);
      this.calMonth += dir;
      if (this.calMonth < 0)  { this.calMonth = 11; this.calYear--; }
      if (this.calMonth > 11) { this.calMonth = 0;  this.calYear++; }
      const fresh = loadDates();
      renderCalendar(panel.querySelector('#calendar-wrap'), this.calYear, this.calMonth, fresh);
    });

    // Today toggle
    panel.querySelector('#today-toggle')?.addEventListener('click', () => {
      toggleDate(todayStr);
      this._renderRecord(panel);
    });
  }

  // ===========================================================
  // SETTINGS MODAL
  // ===========================================================
  _openSettings() {
    const apiKey = loadApiKey();
    const backdrop = document.getElementById('modal-backdrop');
    const modal    = document.getElementById('settings-modal');
    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    const input = modal.querySelector('#settings-apikey');
    if (input) input.value = apiKey;

    const close = () => {
      backdrop.classList.add('hidden');
      modal.classList.add('hidden');
    };

    backdrop.onclick = close;
    modal.querySelector('#settings-close')?.addEventListener('click', close);
    modal.querySelector('#settings-save')?.addEventListener('click', () => {
      const key = input?.value.trim() || '';
      saveApiKey(key);
      close();
      this._showToast(key ? 'APIキーを保存しました' : 'APIキーをクリアしました');
    });
  }

  // ===========================================================
  // UPGRADE MODAL
  // ===========================================================
  _openUpgradeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const modal    = document.getElementById('upgrade-modal');
    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');

    const close = () => {
      backdrop.classList.add('hidden');
      modal.classList.add('hidden');
    };

    backdrop.onclick = close;
    modal.querySelector('#upgrade-close')?.addEventListener('click', close);
    modal.querySelector('#upgrade-later')?.addEventListener('click', close);
  }

  // ===========================================================
  // TOAST
  // ===========================================================
  _showToast(msg, duration = 2500) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.style.cssText = `
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
        background:var(--text);color:#fff;
        padding:10px 20px;border-radius:24px;font-size:0.85rem;
        z-index:500;white-space:nowrap;pointer-events:none;
        transition:opacity .3s;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, duration);
  }
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => {
  const app = new MusicMindApp();
  app.init();
});
