// ============================================================
// scenes/HUDScene.ts  — UPGRADED Visual Polish Version
// New features:
//   - Smooth animated health bar (replaces hearts for clarity)
//   - Retained heart icons with damage pulse animation
//   - Combo bar with fill + color shift
//   - Difficulty badge (Easy / Hard toggle in settings)
//   - FPS always-off unless dev hotkey
// ============================================================

import Phaser from 'phaser';
import { PLAYER } from '../constants/physics';

export class HUDScene extends Phaser.Scene {
  // Hearts (kept — kids love them)
  private hearts: Phaser.GameObjects.Graphics[] = [];

  // Health bar (for adults / hard mode — clearer under pressure)
  private healthBarFill!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBarGlow!: Phaser.GameObjects.Graphics;
  private lastHealthPct: number = 1;

  // Coin counter
  private coinText!: Phaser.GameObjects.Text;
  private coinIcon!: Phaser.GameObjects.Graphics;

  // Level / world
  private levelText!: Phaser.GameObjects.Text;
  private worldText!: Phaser.GameObjects.Text;

  // Timer
  private timerText!: Phaser.GameObjects.Text;
  private timerWarning: boolean = false;

  // FPS (dev-only)
  private fpsText!: Phaser.GameObjects.Text;

  // Lives
  private livesText!: Phaser.GameObjects.Text;

  // Progress bar (top strip)
  private progressBarFill!: Phaser.GameObjects.Graphics;

  // Boss bar
  private bossBarGfx!: Phaser.GameObjects.Graphics;
  private bossNameText!: Phaser.GameObjects.Text;
  private bossMaxHp: number = 30;
  private bossCurrentHp: number = 30;
  private bossBarTargetPct: number = 1;
  private bossBarCurrentPct: number = 1;

  // Combo bar
  private comboBarBg!: Phaser.GameObjects.Graphics;
  private comboBarFill!: Phaser.GameObjects.Graphics;
  private comboText!: Phaser.GameObjects.Text;
  private comboValue: number = 0;
  private comboMax: number = 10;
  private comboDecay: number = 0; // seconds left on combo
  private comboDecayMax: number = 2.5;

  // Savta portrait
  private savtaIcon: Phaser.GameObjects.Image | null = null;

  // State
  private health: number = PLAYER.MAX_HEALTH;
  private maxHealth: number = PLAYER.MAX_HEALTH;
  private lives: number = 3;
  private coins: number = 0;
  private level: number = 1;
  private worldName: string = 'ארץ';

  // Difficulty badge
  private difficultyBadge!: Phaser.GameObjects.Text;
  private isHardMode: boolean = false;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // ─── TOP STRIP ─── progress bar ────────────────────────────
    const progressBg = this.add.graphics().setDepth(9).setScrollFactor(0);
    progressBg.fillStyle(0x000000, 0.3);
    progressBg.fillRect(0, 0, W, 5);
    this.progressBarFill = this.add.graphics().setDepth(10).setScrollFactor(0);

    // ─── TOP LEFT ─── Health hearts + optional bar ─────────────
    this.buildHearts();
    this.buildHealthBar(W);

    // ─── TOP LEFT, below hearts ─── Lives ──────────────────────
    this.livesText = this.add.text(12, 56, '❤️ × 3', {
      fontSize: '15px', fontFamily: 'Arial Black, Arial',
      color: '#FF6666', stroke: '#000000', strokeThickness: 3,
    }).setDepth(10).setScrollFactor(0);

    // ─── TOP CENTER ─── Level + World ──────────────────────────
    this.levelText = this.add.text(W / 2, 10, 'רמה 1', {
      fontSize: '20px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 4, rtl: true,
    }).setOrigin(0.5, 0).setDepth(10).setScrollFactor(0);

    this.worldText = this.add.text(W / 2, 34, 'ארץ 🌍', {
      fontSize: '15px', fontFamily: 'Arial',
      color: '#AAFFAA', stroke: '#000', strokeThickness: 2, rtl: true,
    }).setOrigin(0.5, 0).setDepth(10).setScrollFactor(0);

    // ─── TOP RIGHT ─── Coins ───────────────────────────────────
    this.coinIcon = this.add.graphics().setDepth(10).setScrollFactor(0);
    this.drawCoinIcon(this.coinIcon, W - 52, 24);

    this.coinText = this.add.text(W - 36, 18, '× 0', {
      fontSize: '17px', fontFamily: 'Arial Black, Arial',
      color: '#FFD700', stroke: '#000', strokeThickness: 3,
    }).setDepth(10).setScrollFactor(0);

    // ─── TIMER ─────────────────────────────────────────────────
    this.timerText = this.add.text(W / 2, 56, '0:00', {
      fontSize: '18px', fontFamily: 'Arial',
      color: '#FFFFFF', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setVisible(false).setDepth(10).setScrollFactor(0);

    // ─── COMBO BAR ─── bottom center ───────────────────────────
    this.buildComboBar(W, H);

    // ─── BOSS BAR ──────────────────────────────────────────────
    this.bossBarGfx = this.add.graphics().setDepth(18).setScrollFactor(0).setVisible(false);
    this.bossNameText = this.add.text(W / 2, H - 72, '', {
      fontSize: '15px', fontFamily: 'Arial Black, Arial',
      color: '#FF4444', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(19).setScrollFactor(0).setVisible(false);

    // ─── SAVTA RIVKA portrait ───────────────────────────────────
    if (this.textures.exists('savta_rivka')) {
      const frameBg = this.add.graphics().setDepth(19).setScrollFactor(0);
      frameBg.lineStyle(2, 0xFFD700, 0.85);
      frameBg.strokeRoundedRect(W - 56, H - 58, 52, 52, 8);
      frameBg.fillStyle(0x000000, 0.45);
      frameBg.fillRoundedRect(W - 56, H - 58, 52, 52, 8);

      this.savtaIcon = this.add.image(W - 30, H - 32, 'savta_rivka')
        .setDisplaySize(44, 44).setDepth(20).setScrollFactor(0);

      this.tweens.add({
        targets: this.savtaIcon,
        y: { from: H - 34, to: H - 28 },
        duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      this.add.text(W - 31, H - 8, '💕 מחכה', {
        fontSize: '8px', fontFamily: 'Arial',
        color: '#FFD700', stroke: '#000', strokeThickness: 2, rtl: true,
      }).setOrigin(0.5, 1).setDepth(21).setScrollFactor(0);
    }

    // ─── DIFFICULTY BADGE ──────────────────────────────────────
    this.difficultyBadge = this.add.text(W - 8, 50, '⭐ קל', {
      fontSize: '12px', fontFamily: 'Arial',
      color: '#AAFFAA', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(10).setScrollFactor(0);

    // ─── FPS (off by default) ──────────────────────────────────
    this.fpsText = this.add.text(8, H - 8, '', {
      fontSize: '12px', fontFamily: 'monospace', color: '#FFFFFF88',
    }).setOrigin(0, 1).setVisible(false).setDepth(10).setScrollFactor(0);

    // Dev: F key toggles FPS
    this.input.keyboard?.on('keydown-F', () => {
      this.fpsText.setVisible(!this.fpsText.visible);
    });
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
    // Empty container
    g.fillStyle(0x552233, 0.7);
    g.fillCircle(x + 7, y + 6, 5.5);
    g.fillCircle(x + 14, y + 6, 5.5);
    g.fillTriangle(x + 2, y + 9, x + 20, y + 9, x + 11, y + 20);
    if (filled) {
      g.fillStyle(0xFF3D5A);
      g.fillCircle(x + 7, y + 6, 5);
      g.fillCircle(x + 14, y + 6, 5);
      g.fillTriangle(x + 3, y + 9, x + 19, y + 9, x + 11, y + 19);
      g.fillStyle(0xFF8FA0, 0.65);
      g.fillCircle(x + 7, y + 5, 2.5);
    }
  }

  // ============================================================
  // HEALTH BAR (hard mode / adult mode — shows alongside hearts)
  // ============================================================
  private buildHealthBar(W: number): void {
    const barW = 140, barH = 8;
    const bx = 10, by = 44;

    this.healthBarBg = this.add.graphics().setDepth(10).setScrollFactor(0);
    this.healthBarBg.fillStyle(0x000000, 0.55);
    this.healthBarBg.fillRoundedRect(bx - 1, by - 1, barW + 2, barH + 2, 4);
    this.healthBarBg.fillStyle(0x330011, 1);
    this.healthBarBg.fillRoundedRect(bx, by, barW, barH, 3);

    this.healthBarGlow = this.add.graphics().setDepth(9).setScrollFactor(0);
    this.healthBarFill = this.add.graphics().setDepth(11).setScrollFactor(0);
    this.drawHealthBar(barW);
  }

  private drawHealthBar(barW: number = 140): void {
    const pct = this.health / this.maxHealth;
    const bx = 10, by = 44, barH = 8;

    // Glow
    this.healthBarGlow.clear();
    const fillW = barW * pct;
    const glowColor = pct > 0.5 ? 0x44FF44 : pct > 0.25 ? 0xFFAA00 : 0xFF3333;
    this.healthBarGlow.fillStyle(glowColor, 0.18);
    this.healthBarGlow.fillRoundedRect(bx - 2, by - 3, fillW + 4, barH + 6, 5);

    // Fill
    this.healthBarFill.clear();
    const barColor = pct > 0.5 ? 0x44DD44 : pct > 0.25 ? 0xFF9900 : 0xFF2222;
    if (pct > 0) {
      this.healthBarFill.fillStyle(barColor, 1);
      this.healthBarFill.fillRoundedRect(bx, by, fillW, barH, 3);
      // Shine strip
      this.healthBarFill.fillStyle(0xFFFFFF, 0.22);
      this.healthBarFill.fillRoundedRect(bx, by, fillW, barH / 2, { tl:3, tr:3, bl:0, br:0 });
    }

    this.lastHealthPct = pct;
  }

  // ============================================================
  // COMBO BAR
  // ============================================================
  private buildComboBar(W: number, H: number): void {
    const barW = 160, barH = 12;
    const bx = W / 2 - barW / 2, by = H - 82;

    this.comboBarBg = this.add.graphics().setDepth(15).setScrollFactor(0).setAlpha(0);
    this.comboBarBg.fillStyle(0x000000, 0.6);
    this.comboBarBg.fillRoundedRect(bx - 2, by - 2, barW + 4, barH + 4, 6);
    this.comboBarBg.fillStyle(0x111111, 1);
    this.comboBarBg.fillRoundedRect(bx, by, barW, barH, 4);

    this.comboBarFill = this.add.graphics().setDepth(16).setScrollFactor(0).setAlpha(0);

    this.comboText = this.add.text(W / 2, by - 6, '', {
      fontSize: '14px', fontFamily: 'Arial Black, Arial',
      color: '#FF8C00', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(17).setScrollFactor(0).setAlpha(0);
  }

  private drawComboBar(): void {
    if (!this.comboBarFill) return;
    const W = this.scale.width;
    const H = this.scale.height;
    const barW = 160, barH = 12;
    const bx = W / 2 - barW / 2, by = H - 82;

    const pct = Math.min(1, this.comboDecay / this.comboDecayMax);
    const fillW = barW * pct;

    this.comboBarFill.clear();
    if (fillW > 2) {
      const colors: number[] = [0xFFD700, 0xFF8C00, 0xFF4444, 0xFF00FF, 0x00FFFF];
      const ci = Math.min(colors.length - 1, Math.floor(this.comboValue / 2));
      this.comboBarFill.fillStyle(colors[ci], 1);
      this.comboBarFill.fillRoundedRect(bx, by, fillW, barH, 4);
      this.comboBarFill.fillStyle(0xFFFFFF, 0.2);
      this.comboBarFill.fillRoundedRect(bx, by, fillW, barH / 2, { tl:4, tr:4, bl:0, br:0 });
    }
  }

  // ============================================================
  // COIN ICON
  // ============================================================
  private drawCoinIcon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0xAA8800); g.fillCircle(x, y, 10);
    g.fillStyle(0xFFD700); g.fillCircle(x - 1, y - 1, 10);
    g.fillStyle(0xFFA000); g.fillCircle(x - 1, y - 1, 7);
    g.fillStyle(0xFFD700); g.fillCircle(x - 2, y - 2, 5);
    g.fillStyle(0xFFFFFF, 0.5); g.fillEllipse(x - 3, y - 3, 6, 4);
  }

  // ============================================================
  // PUBLIC UPDATE API — called from GameScene
  // ============================================================
  updateHealth(health: number, maxHealth: number): void {
    const oldHealth = this.health;
    this.health = health;
    this.maxHealth = maxHealth;
    this.buildHearts();
    this.drawHealthBar();

    if (health < oldHealth) {
      const idx = health;
      if (this.hearts[idx]) {
        this.tweens.add({
          targets: this.hearts[idx],
          scaleX: { from: 1.4, to: 1.0 },
          scaleY: { from: 1.4, to: 1.0 },
          duration: 250, ease: 'Back.easeOut',
        });
      }
      // Health bar flash red
      if (this.healthBarFill) {
        this.tweens.add({
          targets: this.healthBarFill,
          alpha: { from: 0.3, to: 1.0 },
          duration: 150, yoyo: true, repeat: 1,
        });
      }
    }
  }

  updateLives(lives: number): void {
    this.lives = lives;
    if (this.livesText) this.livesText.setText(`❤️ × ${lives}`);
  }

  updateCoins(coins: number): void {
    const old = this.coins;
    this.coins = coins;
    const counter = { value: old };
    this.tweens.add({
      targets: counter, value: coins, duration: 500, ease: 'Power2',
      onUpdate: () => this.coinText.setText(`× ${Math.round(counter.value)}`),
      onComplete: () => this.coinText.setText(`× ${coins}`),
    });
    this.tweens.add({
      targets: this.coinIcon,
      scaleX: { from: 1.0, to: 1.5 }, scaleY: { from: 1.0, to: 1.5 },
      duration: 120, yoyo: true, ease: 'Back.easeOut',
    });
  }

  updateLevel(level: number, worldName: string): void {
    this.level = level;
    this.worldName = worldName;
    this.levelText.setText(`רמה ${level}`);
    const worldEmoji: Record<string, string> = {
      earth:'🌍', water:'🌊', sky:'☁️', space:'🚀',
      'ארץ':'🌍', 'מים':'🌊', 'שמיים':'☁️', 'חלל':'🚀',
    };
    const key = worldName.split(' ')[0];
    const emoji = worldEmoji[key] ?? '🌍';
    this.worldText.setText(`${emoji} ${worldName}`);
  }

  updateProgress(playerX: number, goalX: number): void {
    if (!this.progressBarFill) return;
    const pct = Math.min(1, Math.max(0, playerX / goalX));
    const W = this.scale.width;
    this.progressBarFill.clear();
    // Gradient-like fill: green → yellow near end
    const barColor = pct > 0.8 ? 0xFFD700 : 0x76FF03;
    this.progressBarFill.fillStyle(barColor, 0.85);
    this.progressBarFill.fillRect(0, 0, W * pct, 5);
    // Shimmer dot at head
    if (pct > 0.02) {
      this.progressBarFill.fillStyle(0xFFFFFF, 0.7);
      this.progressBarFill.fillRect(W * pct - 3, 0, 3, 5);
    }
  }

  updateTimer(elapsed: number, limit: number): void {
    if (limit <= 0) return;
    this.timerText.setVisible(true);
    const remaining = Math.max(0, limit - elapsed);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    this.timerText.setText(`⏱ ${mins}:${secs.toString().padStart(2, '0')}`);

    const isWarning = remaining < 20;
    if (isWarning && !this.timerWarning) {
      this.timerWarning = true;
      this.tweens.add({
        targets: this.timerText,
        scaleX: { from: 1.0, to: 1.2 }, scaleY: { from: 1.0, to: 1.2 },
        duration: 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
    this.timerText.setColor(isWarning ? '#FF4444' : '#FFFFFF');
  }

  updateCombo(comboCount: number, decayTimer: number): void {
    this.comboValue = comboCount;
    this.comboDecay = decayTimer;
    this.comboDecayMax = 2.5;

    const visible = comboCount > 1;
    const alpha = visible ? 1 : 0;
    this.comboBarBg.setAlpha(alpha);
    this.comboBarFill.setAlpha(alpha);
    this.comboText.setAlpha(alpha);

    if (visible) {
      this.comboText.setText(`× ${comboCount} COMBO`);
      this.drawComboBar();
    }
  }

  setDifficulty(hard: boolean): void {
    this.isHardMode = hard;
    this.difficultyBadge.setText(hard ? '💀 קשה' : '⭐ קל');
    this.difficultyBadge.setColor(hard ? '#FF4444' : '#AAFFAA');
  }

  showFPS(show: boolean): void {
    this.fpsText.setVisible(show);
  }

  // ============================================================
  // BOSS BAR
  // ============================================================
  showBossBar(show: boolean, name?: string, maxHp?: number, currentHp?: number): void {
    this.bossBarGfx.setVisible(show);
    this.bossNameText.setVisible(show);
    if (name) this.bossNameText.setText(`☠ ${name} ☠`);
    if (maxHp !== undefined) {
      this.bossMaxHp = maxHp;
      this.bossBarTargetPct = 1;
      this.bossBarCurrentPct = 1;
    }
    if (currentHp !== undefined) this.bossCurrentHp = currentHp;
    else if (maxHp !== undefined) this.bossCurrentHp = maxHp;
    if (show) this.drawBossBar();
  }

  updateBossHealth(hp: number): void {
    this.bossCurrentHp = Math.max(0, hp);
    this.bossBarTargetPct = this.bossCurrentHp / this.bossMaxHp;
    if (this.bossBarGfx.visible) this.drawBossBar();
  }

  private drawBossBar(): void {
    const g = this.bossBarGfx;
    g.clear();
    const W = this.scale.width;
    const H = this.scale.height;
    const BW = 400, BH = 18;
    const bx = W / 2 - BW / 2, by = H - 50;

    // Smooth approach
    this.bossBarCurrentPct += (this.bossBarTargetPct - this.bossBarCurrentPct) * 0.12;
    const pct = this.bossBarCurrentPct;

    g.fillStyle(0x000000, 0.75);
    g.fillRoundedRect(bx - 3, by - 3, BW + 6, BH + 6, 8);
    g.fillStyle(0x222222);
    g.fillRoundedRect(bx, by, BW, BH, 6);

    const barColor = pct > 0.65 ? 0xE53935 : pct > 0.30 ? 0xFF6F00 : 0xB71C1C;
    if (pct > 0.002) {
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

  // ============================================================
  // SCREEN EFFECTS
  // ============================================================
  flashDamage(): void {
    this.cameras.main.flash(200, 255, 50, 50);
  }

  showMessage(text: string, color: string = '#FFFFFF', duration: number = 2000): void {
    const W = this.scale.width;
    const H = this.scale.height;
    const msg = this.add.text(W / 2, H / 2 - 60, text, {
      fontSize: '32px', fontFamily: 'Arial Black, Arial',
      color, stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(30).setScrollFactor(0);

    // Bounce in, float up, fade
    this.tweens.add({
      targets: msg,
      scaleX: { from: 0.5, to: 1.0 },
      scaleY: { from: 0.5, to: 1.0 },
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: msg,
          y: H / 2 - 100,
          alpha: 0,
          duration: duration - 200,
          ease: 'Power2',
          delay: 300,
          onComplete: () => msg.destroy(),
        });
      },
    });
  }

  // ============================================================
  // UPDATE — smooth boss bar + combo decay + FPS
  // ============================================================
  update(_time: number, _delta: number): void {
    if (this.fpsText.visible) {
      this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }

    // Boss bar smooth lerp
    if (this.bossBarGfx?.visible) {
      this.drawBossBar();
    }

    // Combo bar sparkle
    if (this.comboValue > 1 && this.comboDecay > 0) {
      this.drawComboBar();
    }
  }
}
