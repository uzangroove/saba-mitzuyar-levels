// ============================================================
// scenes/HUDScene.ts
// HUD overlay scene — runs parallel to GameScene
// Improved: heart containers, animated coin counter, progress bar,
//           world indicator with icon, boss bar fix
// ============================================================

import Phaser from 'phaser';
import { PLAYER } from '../constants/physics';

export class HUDScene extends Phaser.Scene {
  private hearts: Phaser.GameObjects.Graphics[] = [];
  private coinText!: Phaser.GameObjects.Text;
  private coinIcon!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private worldText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private fpsText!: Phaser.GameObjects.Text;
  private bossBarGfx!: Phaser.GameObjects.Graphics;
  private bossNameText!: Phaser.GameObjects.Text;
  private bossMaxHp: number = 30;
  private bossCurrentHp: number = 30;
  private savtaIcon: Phaser.GameObjects.Image | null = null;
  private progressBarFill!: Phaser.GameObjects.Graphics;

  // State
  private health: number = PLAYER.MAX_HEALTH;
  private maxHealth: number = PLAYER.MAX_HEALTH;
  private lives: number = 3;
  private livesText!: Phaser.GameObjects.Text;
  private coins: number = 0;
  private level: number = 1;
  private worldName: string = 'Earth';

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // ---- Level progress bar (top of screen, 5px tall) ----
    const progressBg = this.add.graphics().setDepth(9).setScrollFactor(0);
    progressBg.fillStyle(0x000000, 0.3);
    progressBg.fillRect(0, 0, W, 5);

    this.progressBarFill = this.add.graphics().setDepth(10).setScrollFactor(0);

    // ---- Health hearts ----
    this.buildHearts();

    // ---- Lives counter — top right ----
    this.livesText = this.add.text(W - 12, 12, '❤️ × 3', {
      fontSize: '17px',
      fontFamily: 'Arial Black, Arial',
      color: '#FF4444',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(10).setScrollFactor(0).setOrigin(1, 0);

    // ---- Coin counter ----
    this.coinIcon = this.add.graphics().setDepth(10).setScrollFactor(0);
    this.drawCoinIcon(this.coinIcon, 16, 56);

    this.coinText = this.add.text(36, 50, '× 0', {
      fontSize: '17px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(10).setScrollFactor(0);

    // ---- Level indicator (center top) ----
    this.levelText = this.add.text(W / 2, 10, 'רמה 1', {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
      rtl: true,
    }).setOrigin(0.5, 0).setDepth(10).setScrollFactor(0);

    // ---- World name — slightly larger, top-right area ----
    this.worldText = this.add.text(W / 2, 34, 'ארץ 🌍', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#AAFFAA',
      stroke: '#000000',
      strokeThickness: 2,
      rtl: true,
    }).setOrigin(0.5, 0).setDepth(10).setScrollFactor(0);

    // ---- Timer ----
    this.timerText = this.add.text(W - 12, 12, '0:00', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setVisible(false).setDepth(10).setScrollFactor(0);

    // ---- Boss health bar (initialized here to fix the crash bug) ----
    this.bossBarGfx = this.add.graphics().setDepth(18).setScrollFactor(0).setVisible(false);
    this.bossNameText = this.add.text(W / 2, H - 70, '', {
      fontSize: '15px',
      fontFamily: 'Arial Black, Arial',
      color: '#FF4444',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(19).setScrollFactor(0).setVisible(false);

    // ---- Savta Rivka portrait (bottom right motivator) ----
    if (this.textures.exists('savta_rivka')) {
      const frameBg = this.add.graphics().setDepth(19).setScrollFactor(0);
      frameBg.lineStyle(2, 0xFFD700, 0.85);
      frameBg.strokeRoundedRect(W - 56, H - 58, 52, 52, 8);
      frameBg.fillStyle(0x000000, 0.45);
      frameBg.fillRoundedRect(W - 56, H - 58, 52, 52, 8);

      this.savtaIcon = this.add.image(W - 30, H - 32, 'savta_rivka')
        .setDisplaySize(44, 44).setDepth(20).setScrollFactor(0);

      // Savta gently bobs
      this.tweens.add({
        targets: this.savtaIcon,
        y: { from: H - 34, to: H - 28 },
        duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      this.add.text(W - 31, H - 8, '💕 מחכה לי', {
        fontSize: '8px', fontFamily: 'Arial',
        color: '#FFD700', stroke: '#000', strokeThickness: 2, rtl: true,
      }).setOrigin(0.5, 1).setDepth(21).setScrollFactor(0);
    }

    // ---- FPS counter (debug) ----
    this.fpsText = this.add.text(W - 8, H - 8, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF88',
    }).setOrigin(1, 1).setVisible(false).setDepth(10).setScrollFactor(0);
  }

  // ============================================================
  // HEARTS
  // ============================================================
  private buildHearts(): void {
    this.hearts.forEach(h => h.destroy());
    this.hearts = [];

    for (let i = 0; i < this.maxHealth; i++) {
      const g = this.add.graphics().setDepth(10).setScrollFactor(0);
      this.hearts.push(g);
      this.drawHeart(g, 12 + i * 28, 12, i < this.health);
    }
  }

  private drawHeart(g: Phaser.GameObjects.Graphics, x: number, y: number, filled: boolean): void {
    g.clear();

    // Container (empty frame) — always visible
    g.fillStyle(0x552233, 0.7);
    g.fillCircle(x + 7, y + 6, 5.5);
    g.fillCircle(x + 14, y + 6, 5.5);
    g.fillTriangle(x + 2, y + 9, x + 20, y + 9, x + 11, y + 20);

    if (filled) {
      // Filled heart overlaid
      g.fillStyle(0xFF3D5A);
      g.fillCircle(x + 7, y + 6, 5);
      g.fillCircle(x + 14, y + 6, 5);
      g.fillTriangle(x + 3, y + 9, x + 19, y + 9, x + 11, y + 19);
      // Shine
      g.fillStyle(0xFF8FA0, 0.65);
      g.fillCircle(x + 7, y + 5, 2.5);
    }
  }

  // ============================================================
  // COIN ICON
  // ============================================================
  private drawCoinIcon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0xFFD700);
    g.fillCircle(x, y, 9);
    g.fillStyle(0xFFA000);
    g.fillCircle(x, y, 7);
    g.fillStyle(0xFFD700);
    g.fillCircle(x, y, 5);
    g.lineStyle(1.5, 0xFFFFFF, 0.5);
    g.strokeCircle(x, y, 8);
  }

  // ============================================================
  // PUBLIC UPDATE API
  // ============================================================
  updateHealth(health: number, maxHealth: number): void {
    const oldHealth = this.health;
    this.health = health;
    this.maxHealth = maxHealth;
    this.buildHearts();

    // Pulse the heart that changed
    if (health < oldHealth) {
      const idx = health; // the first empty heart
      if (this.hearts[idx]) {
        this.tweens.add({
          targets: this.hearts[idx],
          scaleX: { from: 1.0, to: 1.25 },
          scaleY: { from: 1.0, to: 1.25 },
          duration: 150, yoyo: true, ease: 'Power2',
        });
      }
    }
  }

  updateLives(lives: number): void {
    this.lives = lives;
    if (this.livesText) this.livesText.setText(`❤️ × ${lives}`);
  }

  updateCoins(coins: number): void {
    const oldCoins = this.coins;
    this.coins = coins;

    // Animated count-up
    const counter = { value: oldCoins };
    this.tweens.add({
      targets: counter,
      value: coins,
      duration: 500,
      ease: 'Power2',
      onUpdate: () => {
        this.coinText.setText(`× ${Math.round(counter.value)}`);
      },
      onComplete: () => {
        this.coinText.setText(`× ${coins}`);
      },
    });

    // Coin icon bounce
    this.tweens.add({
      targets: this.coinIcon,
      scaleX: { from: 1.0, to: 1.4 },
      scaleY: { from: 1.0, to: 1.4 },
      duration: 150, yoyo: true, ease: 'Back.easeOut',
    });
  }

  updateLevel(level: number, worldName: string): void {
    this.level = level;
    this.worldName = worldName;
    this.levelText.setText(`רמה ${level}`);

    const worldEmoji: Record<string, string> = {
      earth: '🌍', water: '🌊', sky: '☁️', space: '🚀',
      'ארץ 🌍': '🌍', 'מים 🌊': '🌊', 'שמיים ☁️': '☁️', 'חלל 🚀': '🚀',
    };
    const key = worldName.toLowerCase().split(' ')[0];
    const emoji = worldEmoji[key] ?? worldEmoji[worldName] ?? '';
    this.worldText.setText(`${emoji} ${worldName}`);
  }

  updateProgress(playerX: number, goalX: number): void {
    if (!this.progressBarFill) return;
    const pct = Math.min(1, Math.max(0, playerX / goalX));
    const W = this.scale.width;
    this.progressBarFill.clear();
    this.progressBarFill.fillStyle(0x76FF03, 0.85);
    this.progressBarFill.fillRect(0, 0, W * pct, 5);
  }

  updateTimer(elapsed: number, limit: number): void {
    if (limit > 0) {
      this.timerText.setVisible(true);
      const remaining = Math.max(0, limit - elapsed);
      const mins = Math.floor(remaining / 60);
      const secs = Math.floor(remaining % 60);
      this.timerText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);
      this.timerText.setColor(remaining < 20 ? '#FF4444' : '#FFFFFF');
    }
  }

  showFPS(show: boolean): void {
    this.fpsText.setVisible(show);
  }

  update(): void {
    if (this.fpsText.visible) {
      this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }
  }

  showBossBar(show: boolean, name?: string, maxHp?: number, currentHp?: number): void {
    this.bossBarGfx.setVisible(show);
    this.bossNameText.setVisible(show);
    if (name) this.bossNameText.setText(`☠ ${name} ☠`);
    if (maxHp !== undefined) this.bossMaxHp = maxHp;
    if (currentHp !== undefined) this.bossCurrentHp = currentHp;
    else if (maxHp !== undefined) this.bossCurrentHp = maxHp;
    if (show) this.drawBossBar();
  }

  updateBossHealth(hp: number): void {
    this.bossCurrentHp = Math.max(0, hp);
    if (this.bossBarGfx.visible) this.drawBossBar();
  }

  private drawBossBar(): void {
    const g = this.bossBarGfx;
    g.clear();
    const W = this.scale.width;
    const H = this.scale.height;
    const BW = 400, BH = 18;
    const bx = W / 2 - BW / 2;
    const by = H - 48;
    const pct = this.bossCurrentHp / this.bossMaxHp;

    g.fillStyle(0x000000, 0.75);
    g.fillRoundedRect(bx - 3, by - 3, BW + 6, BH + 6, 8);
    g.fillStyle(0x222222);
    g.fillRoundedRect(bx, by, BW, BH, 6);

    const barColor = pct > 0.65 ? 0xE53935 : pct > 0.30 ? 0xFF6F00 : 0xB71C1C;
    if (pct > 0) {
      g.fillStyle(barColor);
      g.fillRoundedRect(bx, by, BW * pct, BH, 6);
      g.fillStyle(0xFFFFFF, 0.18);
      g.fillRoundedRect(bx, by, BW * pct, BH / 2, { tl:6, tr:6, bl:0, br:0 });
    }

    g.lineStyle(2, 0xFFFFFF, 0.5);
    g.lineBetween(bx + BW * 0.65, by - 1, bx + BW * 0.65, by + BH + 1);
    g.lineBetween(bx + BW * 0.30, by - 1, bx + BW * 0.30, by + BH + 1);
    g.lineStyle(1.5, 0x880000, 0.9);
    g.strokeRoundedRect(bx, by, BW, BH, 6);
  }

  flashDamage(): void {
    this.cameras.main.flash(200, 255, 50, 50);
  }

  showMessage(text: string, color: string = '#FFFFFF', duration: number = 2000): void {
    const W = this.scale.width;
    const H = this.scale.height;
    const msg = this.add.text(W / 2, H / 2 - 60, text, {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial',
      color,
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(30).setScrollFactor(0);

    this.tweens.add({
      targets: msg,
      y: H / 2 - 90,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => msg.destroy(),
    });
  }
}
