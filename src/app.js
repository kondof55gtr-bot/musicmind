// ==========================================
// app.js - エントリーポイント・ルーター
// ==========================================

import { HomeScreen }   from './ui/HomeScreen.js';
import { GameScreen }   from './ui/GameScreen.js';
import { StatsScreen }  from './ui/StatsScreen.js';
import { PitchGame }    from './games/PitchGame.js';
import { IntervalGame } from './games/IntervalGame.js';
import { ChordGame }    from './games/ChordGame.js';

class App {
  constructor() {
    this._content = document.getElementById('main-content');
    this._currentTab = 'home';
    this._screens = {
      home:  document.getElementById('screen-home'),
      game:  document.getElementById('screen-game'),
      stats: document.getElementById('screen-stats'),
    };
    this._navBtns = document.querySelectorAll('.nav-btn');
    this._homeScreen  = new HomeScreen((gameId) => this._startGame(gameId));
    this._statsScreen = new StatsScreen(() => this._renderHome());
  }

  init() {
    // ナビゲーション
    this._navBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === 'home')  { this._showTab('home');  this._renderHome(); }
        if (tab === 'stats') { this._showTab('stats'); this._renderStats(); }
      });
    });

    // 初期画面
    this._renderHome();
    this._showTab('home');

    // Service Worker 登録
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }

  _showTab(tab) {
    this._currentTab = tab;
    Object.entries(this._screens).forEach(([key, el]) => {
      el.classList.toggle('active', key === tab);
    });
    this._navBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
  }

  _renderHome() {
    this._homeScreen.render(document.getElementById('screen-home'));
  }

  _renderStats() {
    this._statsScreen.render(document.getElementById('screen-stats'));
  }

  _startGame(gameId) {
    const game = this._createGame(gameId);
    if (!game) return;

    const gameScreen = new GameScreen(game, (dest) => {
      if (dest === 'home') {
        this._showTab('home');
        this._renderHome();
      }
    });

    this._showTab('game');
    gameScreen.render(document.getElementById('screen-game'));
  }

  _createGame(gameId) {
    switch (gameId) {
      case 'pitch':    return new PitchGame('easy');
      case 'interval': return new IntervalGame('easy');
      case 'chord':    return new ChordGame('easy');
      default: return null;
    }
  }
}

// アプリ起動
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
