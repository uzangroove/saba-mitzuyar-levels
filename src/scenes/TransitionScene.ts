// ============================================================
// scenes/TransitionScene.ts — Cinematic level transition
// Shows world name, level number, boss warning
// ============================================================

import Phaser from 'phaser';
import { getWorldForLevel } from '../worlds/WorldConfig';

interface TransitionData {
  fromLevel: number;
  toLevel: number;
  isBoss: boolean;
  worldName: string;
  worldEmoji: string;
}

export class TransitionScene extends Phaser.Scene {
  constructor() { super({ key: 'TransitionScene' }); }

  create(data: TransitionData): void {
    const W = this.scale.width;
    const H = this.scale.height;
    const { toLevel, isBoss, worldName, worldEmoji } = data;

    // ---- Full black overlay ----
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 1);
    overlay.fillRect(0, 0, W, H);
    overlay.setAlpha(0);

    // ---- Background glow ----
    const worldColors: Record<string, number> = {
      earth: 0x2E7D32, water: 0x01579B,
      sky:   0x0277BD, space: 0x4A148C,
    };
    const worldKey = getWorldForLevel(toLevel);
    const glowColor = isBoss ? 0x8B0000 : (worldColors[worldKey] ?? 0x1A237E);

    const bgGlow = this.add.graphics();
    bgGlow.fillGradientStyle(0x000000, 0x000000, glowColor, glowColor, 1);
    bgGlow.fillRect(0, 0, W, H);
    bgGlow.setAlpha(0);

    // ---- Divider line ----
    const line = this.add.graphics();
    line.lineStyle(2, 0xFFFFFF, 0.4);
    line.lineBetween(80, H/2, W - 80, H/2);
    line.setAlpha(0);

    // ---- World emoji ----
    const emojiText = this.add.text(W/2, H/2 - 70, isBoss ? '💀' : worldEmoji, {
      fontSize: '72px',
    }).setOrigin(0.5).setAlpha(0).setScale(0.3);

    // ---- Level label ----
    const levelLabel = this.add.text(W/2, H/2 - 10,
      isBoss ? `⚠  BOSS LEVEL  ⚠` : `LEVEL  ${toLevel}`, {
      fontSize: isBoss ? '28px' : '22px',
      fontFamily: 'Arial',
      color: isBoss ? '#FF4444' : '#AAAAAA',
      letterSpacing: 8,
    }).setOrigin(0.5).setAlpha(0);

    // ---- Main title ----
    // Hebrew world names must not use toUpperCase() or letterSpacing (breaks RTL glyphs)
    const titleStr  = isBoss ? 'STONE  GIANT' : worldName;
    const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = isBoss
      ? { fontSize: '56px', fontFamily: 'Arial Black, Arial', color: '#FF2222', stroke: '#000000', strokeThickness: 8, letterSpacing: 4 }
      : { fontSize: '52px', fontFamily: 'Arial Black, Arial', color: '#FFFFFF', stroke: '#000000', strokeThickness: 6, rtl: true };
    const title = this.add.text(W/2, H/2 + 34, titleStr, titleStyle)
      .setOrigin(0.5).setAlpha(0).setScale(0.6);

    // ---- Subtitle ----
    const subtitle = isBoss
      ? this.add.text(W/2, H/2 + 90, 'Defeat the guardian to continue...', {
          fontSize: '16px', fontFamily: 'Arial italic',
          color: '#FF8888', stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5).setAlpha(0)
      : null;

    // ---- Stars (decorative) ----
    const stars: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < 5; i++) {
      const sx = 120 + (W - 240) * (i / 4);
      const star = this.add.text(sx, H/2 - 110, '✦', {
        fontSize: '14px', color: '#FFFFFF44',
      }).setOrigin(0.5).setAlpha(0);
      stars.push(star);
    }

    // ============================================================
    // ANIMATION SEQUENCE
    // ============================================================
    const dur = isBoss ? 3200 : 2600;

    // Fade in background
    this.tweens.add({ targets: bgGlow, alpha: 1, duration: 300, ease: 'Power2' });

    // Stars appear
    this.time.delayedCall(200, () => {
      stars.forEach((s, i) => {
        this.tweens.add({ targets: s, alpha: 0.6, delay: i * 80, duration: 300 });
      });
    });

    // Line slides in
    this.time.delayedCall(300, () => {
      this.tweens.add({ targets: line, alpha: 1, duration: 400 });
    });

    // Emoji drops in
    this.time.delayedCall(400, () => {
      this.tweens.add({
        targets: emojiText, alpha: 1, scaleX: 1, scaleY: 1,
        duration: 500, ease: 'Back.Out',
      });
    });

    // Level label
    this.time.delayedCall(600, () => {
      this.tweens.add({ targets: levelLabel, alpha: 1, duration: 400, ease: 'Power2' });
    });

    // Title scales in
    this.time.delayedCall(750, () => {
      this.tweens.add({
        targets: title, alpha: 1, scaleX: 1, scaleY: 1,
        duration: 600, ease: 'Back.Out',
      });
    });

    // Subtitle
    if (subtitle) {
      this.time.delayedCall(1100, () => {
        this.tweens.add({ targets: subtitle, alpha: 1, duration: 400 });
      });
    }

    // Boss warning flash (3x red flash)
    if (isBoss) {
      for (let i = 0; i < 3; i++) {
        this.time.delayedCall(1400 + i * 220, () => {
          this.cameras.main.flash(180, 120, 0, 0);
        });
      }
    }

    // ---- Hold, then fade out ----
    this.time.delayedCall(dur - 500, () => {
      this.tweens.add({
        targets: [bgGlow, emojiText, levelLabel, title, subtitle, line, ...stars].filter(Boolean),
        alpha: 0, duration: 400, ease: 'Power2',
        onComplete: () => {
          this.scene.stop('TransitionScene');
          // Resume the game scene
          this.scene.resume('GameScene');
        }
      });
    });
  }
}
