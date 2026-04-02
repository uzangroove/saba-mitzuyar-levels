// ============================================================
// main.ts — Entry point
// Launches via GameAPI for standalone mode
// (Educational app integration uses GameAPI.launch() directly)
// ============================================================

import './style.css';
import { GameAPI } from './GameAPI';

// Standalone launch — starts at saved progress
GameAPI.launch('game-container');

// Hook exit event
GameAPI.on('exit', () => {
  console.log('Game exited. Save:', GameAPI.getSave());
});
