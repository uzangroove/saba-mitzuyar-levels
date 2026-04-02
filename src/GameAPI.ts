// ============================================================
// GameAPI.ts
// External integration API — the ONLY interface the educational
// app needs. Clean separation, minimal coupling.
// ============================================================

import Phaser from 'phaser';
import { saveManager, SaveData } from './systems/SaveManager';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { TransitionScene } from './scenes/TransitionScene';
import { IntroScene } from './scenes/IntroScene';
import { SettingsScene } from './scenes/SettingsScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { GAME } from './constants/physics';

let gameInstance: Phaser.Game | null = null;
const eventCallbacks: Record<string, ((...args: unknown[]) => void)[]> = {};

function emit(event: string, ...args: unknown[]): void {
  (eventCallbacks[event] ?? []).forEach(cb => cb(...args));
}

export const GameAPI = {
  /**
   * Launch the game in a container element.
   * @param containerId - DOM element ID where canvas will be injected
   * @param startLevel - Optional level to start at (default: saved progress)
   */
  launch(containerId: string, startLevel?: number): void {
    if (gameInstance) {
      console.warn('GameAPI: Game already running. Call exit() first.');
      return;
    }

    const level = startLevel ?? saveManager.getCurrentLevel();

    gameInstance = new Phaser.Game({
      type: Phaser.WEBGL,  // Force WebGL (no canvas fallback overhead)
      width: GAME.WIDTH,
      height: GAME.HEIGHT,
      parent: containerId,
      backgroundColor: '#0a0a1a',
      pixelArt: false,
      antialias: false,     // Disable antialiasing (big perf gain)
      roundPixels: true,    // Prevent sub-pixel rendering
      powerPreference: 'high-performance',  // Request GPU preference
      fps: {
        target: 60,
        forceSetTimeOut: false,  // Use RAF not setTimeout
        smoothStep: true,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 }, // Gravity set per-scene
          debug: false,
          fixedStep: true,   // Consistent physics regardless of framerate
        }
      },
      input: {
        gamepad: true,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 960,
        height: 540,
      },
      scene: [BootScene, IntroScene, MainMenuScene, LevelSelectScene, SettingsScene, GameScene, HUDScene, TransitionScene],
    });

    // Once game boots, go to specified level if provided
    if (startLevel) {
      gameInstance.events.once('ready', () => {
        gameInstance?.scene.start('GameScene', { level: startLevel });
      });
    }
  },

  /**
   * Gracefully stop the game and release resources.
   */
  exit(): void {
    if (!gameInstance) return;
    gameInstance.destroy(true);
    gameInstance = null;
    emit('exit');
  },

  /**
   * Load external save data (e.g., from educational app's storage).
   */
  loadSave(data: SaveData): void {
    saveManager.importSave(data);
  },

  /**
   * Get current save state for external persistence.
   */
  getSave(): SaveData {
    return saveManager.exportSave();
  },

  /**
   * Register event listeners.
   */
  on(event: 'levelComplete' | 'gameOver' | 'exit', callback: (...args: unknown[]) => void): void {
    if (!eventCallbacks[event]) eventCallbacks[event] = [];
    eventCallbacks[event].push(callback);
  },

  /**
   * Remove event listener.
   */
  off(event: string, callback: (...args: unknown[]) => void): void {
    if (!eventCallbacks[event]) return;
    eventCallbacks[event] = eventCallbacks[event].filter(cb => cb !== callback);
  },

  /**
   * Check if game is currently running.
   */
  isRunning(): boolean {
    return gameInstance !== null;
  },

  /**
   * Get game version.
   */
  version: '1.0.0',
};

// Make available globally for non-module usage
(window as unknown as Record<string, unknown>)['SabaMitzuyar'] = GameAPI;
