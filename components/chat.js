// ============================================================
// components/chat.js — チャット UI ヘルパー
// ============================================================

/**
 * メッセージ要素を生成して返す
 * @param {{ role: 'user'|'assistant', text: string, ts?: number }} msg
 * @returns {HTMLElement}
 */
export function createMessageEl(msg) {
  const wrap = document.createElement('div');
  wrap.className = `chat-msg chat-msg--${msg.role}`;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = escapeHtml(msg.text).replace(/\n/g, '<br>');

  wrap.appendChild(bubble);
  return wrap;
}

/**
 * ローディングバブルを生成
 */
export function createLoadingEl() {
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg chat-msg--assistant chat-msg--loading';
  wrap.innerHTML = `<div class="chat-bubble"><span class="dot-loader"><span></span><span></span><span></span></span></div>`;
  return wrap;
}

/**
 * コンテナを最下部にスクロール
 */
export function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}

/**
 * チャット履歴をコンテナに描画
 */
export function renderHistory(messages, container) {
  container.innerHTML = '';
  messages.forEach((msg) => container.appendChild(createMessageEl(msg)));
  scrollToBottom(container);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
