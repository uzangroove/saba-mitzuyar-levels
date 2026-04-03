// ============================================================
// scenes/MainMenuScene.ts  — Bright, child-friendly main menu
// Layout matches screenshot: buttons left, characters right
// No per-frame redraws — all animation via tweens
// ============================================================

import Phaser from 'phaser';
import { saveManager } from '../systems/SaveManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // ---- Background ----
    this.buildBackground(W, H);

    // ---- Animated clouds ----
    this.buildClouds(W, H);

    // ---- Castle + Savta ----
    this.buildCastleAndSavta(W, H);

    // ---- Saba character ----
    this.buildCharacters(W, H);

    // ---- Rainbow title + subtitle ----
    this.buildTitle(W, H);

    // ---- Left-side buttons ----
    this.buildButtons(W, H);

    // ---- Controls hint ----
    this.add.text(W / 2, H - 10, '← → הזזה   |   רווח קפיצה   |   Z דאש   |   X פטיש', {
      fontSize: '11px', fontFamily: 'Arial', color: '#7a9ab0', rtl: true,
    }).setOrigin(0.5, 1).setDepth(10);

    this.cameras.main.fadeIn(500, 255, 255, 255);
  }

  // ============================================================
  // BACKGROUND — baked once
  // ============================================================
  private buildBackground(W: number, H: number): void {
    // Try to use loaded background image first
    if (this.textures.exists('bg_earth_1')) {
      this.add.image(W / 2, H / 2, 'bg_earth_1')
        .setDisplaySize(W, H).setDepth(0);
      return;
    }

    const bgKey = 'menu_background_v3';
    if (!this.textures.exists(bgKey)) {
      const rt = this.add.renderTexture(0, 0, W, H);
      const g = this.add.graphics();
      g.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xFFF0A0, 0xFFF0A0, 1);
      g.fillRect(0, 0, W, H);
      g.fillStyle(0x8ABAA8);
      for (let hx = 0; hx < W + 300; hx += 200)
        g.fillEllipse(hx, H - 60, 320, (120 + Math.sin(hx * 0.015) * 40) * 2);
      g.fillStyle(0x76B98E);
      for (let hx = 0; hx < W + 200; hx += 160)
        g.fillEllipse(hx, H - 30, 240, (80 + Math.cos(hx * 0.02) * 30) * 2);
      g.fillStyle(0x5C9E72);
      g.fillRect(0, H - 52, W, 52);
      g.fillStyle(0x6DB583);
      g.fillRect(0, H - 56, W, 8);
      rt.draw(g, 0, 0);
      rt.saveTexture(bgKey);
      g.destroy();
      rt.destroy();
    }
    this.add.image(W / 2, H / 2, bgKey).setDepth(0);
  }

  // ============================================================
  // CLOUDS
  // ============================================================
  private buildClouds(W: number, H: number): void {
    const cloudKey = 'menu_cloud_sprite';
    if (!this.textures.exists(cloudKey)) {
      const rt = this.add.renderTexture(0, 0, 160, 70);
      const g = this.add.graphics();
      g.fillStyle(0xFFFFFF, 0.92);
      g.fillEllipse(80, 40, 120, 50);
      g.fillEllipse(50, 36, 80, 44);
      g.fillEllipse(110, 32, 70, 40);
      rt.draw(g, 0, 0);
      rt.saveTexture(cloudKey);
      g.destroy();
      rt.destroy();
    }

    const defs = [
      { x: W * 0.08, y: 50, scale: 1.0, spd: 22000, alpha: 0.8 },
      { x: W * 0.38, y: 32, scale: 0.7, spd: 30000, alpha: 0.65 },
      { x: W * 0.63, y: 60, scale: 1.1, spd: 25000, alpha: 0.75 },
      { x: W * 0.87, y: 40, scale: 0.8, spd: 35000, alpha: 0.6  },
    ];
    for (const cd of defs) {
      const cloud = this.add.image(cd.x, cd.y, cloudKey)
        .setDepth(1).setAlpha(cd.alpha).setScale(cd.scale);
      this.tweens.add({ targets: cloud, x: { from: cd.x, to: -200 }, duration: cd.spd, repeat: -1, onRepeat: () => cloud.setX(W + 200) });
      this.tweens.add({ targets: cloud, y: { from: cd.y - 5, to: cd.y + 5 }, duration: 4000 + Math.random() * 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  // ============================================================
  // CASTLE & SAVTA — right side
  // ============================================================
  private buildCastleAndSavta(W: number, H: number): void {
    const cx = W * 0.74, cy = H - 10;
    const castleKey = 'menu_castle_v3';

    if (!this.textures.exists(castleKey)) {
      const rtW = 320, rtH = 380;
      const rt = this.add.renderTexture(0, 0, rtW, rtH);
      const g = this.add.graphics();
      const ox = rtW / 2, oy = rtH;

      // Colour palette — bright toy/clay style matching screenshot
      const colors = {
        yellow: 0xF5C542, orange: 0xE07B30, pink: 0xDB6E9F,
        purple: 0x8B5CF6, green: 0x5AB56E, blue: 0x4B9FD5,
        roof1: 0xC0392B, roof2: 0x8E44AD, roof3: 0x2980B9,
        stone: 0xE8D5B7, stoneDark: 0xC4A882,
      };

      // Main keep — yellow
      g.fillStyle(colors.yellow);
      g.fillRect(ox - 70, oy - 180, 140, 180);
      g.fillStyle(colors.orange);
      g.fillRect(ox - 70, oy - 180, 140, 12);

      // Gate arch
      g.fillStyle(0x3D2B1F);
      g.fillRoundedRect(ox - 24, oy - 80, 48, 80, { tl: 24, tr: 24, bl: 0, br: 0 });

      // Left tower — pink
      g.fillStyle(colors.pink);
      g.fillRect(ox - 106, oy - 260, 72, 260);
      // Left roof — red cone
      g.fillStyle(colors.roof1);
      g.fillTriangle(ox - 70, oy - 310, ox - 118, oy - 260, ox - 22, oy - 260);

      // Right tower — purple, shorter
      g.fillStyle(colors.purple);
      g.fillRect(ox + 34, oy - 210, 60, 210);
      // Right roof — purple/blue
      g.fillStyle(colors.roof2);
      g.fillTriangle(ox + 64, oy - 255, ox + 20, oy - 210, ox + 108, oy - 210);

      // Far-right mini tower — green
      g.fillStyle(colors.green);
      g.fillRect(ox + 80, oy - 160, 44, 160);
      g.fillStyle(colors.roof3);
      g.fillTriangle(ox + 102, oy - 195, ox + 68, oy - 160, ox + 136, oy - 160);

      // Windows — yellow glows
      const wins = [[ox - 70, oy - 220], [ox - 70, oy - 160], [ox + 64, oy - 170], [ox + 102, oy - 130]];
      for (const [wx, wy] of wins) {
        g.fillStyle(0xFFE066);
        g.fillRoundedRect(wx - 13, wy - 20, 26, 28, { tl: 13, tr: 13, bl: 0, br: 0 });
      }

      // Battlements on main keep
      for (let b = -3; b <= 3; b++) {
        g.fillStyle(colors.yellow);
        g.fillRect(ox + b * 22 - 9, oy - 200, 16, 22);
      }

      // Flags
      g.lineStyle(2, 0x6D4C2A, 1);
      g.lineBetween(ox - 70, oy - 310, ox - 70, oy - 348);
      g.fillStyle(0xE53935);
      g.fillTriangle(ox - 70, oy - 348, ox - 70 + 28, oy - 338, ox - 70, oy - 326);

      g.lineBetween(ox + 64, oy - 255, ox + 64, oy - 285);
      g.fillStyle(0x43A047);
      g.fillTriangle(ox + 64, oy - 285, ox + 64 + 22, oy - 276, ox + 64, oy - 265);

      rt.draw(g, 0, 0);
      rt.saveTexture(castleKey);
      g.destroy();
      rt.destroy();
    }

    this.add.image(cx, cy, castleKey).setDepth(2).setOrigin(0.5, 1).setScale(1.15);

    // Savta on top of castle
    const savtaX = cx - 80, savtaY = cy - 335;
    if (this.textures.exists('savta_large')) {
      const savta = this.add.image(savtaX, savtaY, 'savta_large')
        .setDisplaySize(72, 90).setDepth(5);
      this.tweens.add({ targets: savta, y: { from: savtaY - 4, to: savtaY + 4 }, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    } else if (this.textures.exists('savta_rivka')) {
      const savta = this.add.image(savtaX, savtaY, 'savta_rivka')
        .setDisplaySize(48, 60).setDepth(5);
      this.tweens.add({ targets: savta, y: { from: savtaY - 4, to: savtaY + 4 }, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Flag wave
    const fPoleX = cx - 80 * 1.15 - 10, fPoleY = cy - 358;
    const flagRect = this.add.rectangle(fPoleX + 14, fPoleY + 9, 28, 18, 0xE53935)
      .setDepth(3).setOrigin(0, 0.5);
    this.tweens.add({ targets: flagRect, scaleX: { from: 1.0, to: 0.5 }, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  // ============================================================
  // CHARACTERS — Saba (large) center-left
  // ============================================================
  private buildCharacters(W: number, H: number): void {
    void W;
    const sabaX = 310, sabaY = H - 30;

    if (this.textures.exists('saba_large')) {
      const saba = this.add.image(sabaX, sabaY, 'saba_large')
        .setDisplaySize(170, 260).setDepth(4).setOrigin(0.5, 1);
      this.tweens.add({ targets: saba, y: { from: sabaY - 4, to: sabaY + 4 }, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: saba, scaleX: { from: 1.0, to: 1.015 }, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  // ============================================================
  // TITLE — rainbow coloured, subtitle in purple
  // ============================================================
  private buildTitle(W: number, H: number): void {
    void H;
    // Each letter of "סבא מצוייר" gets a different colour
    const letters   = ['ר', 'י', 'י', 'ו', 'צ', 'מ', ' ', 'א', 'ב', 'ס'];
    const colours   = ['#E53935','#FB8C00','#FDD835','#43A047','#00ACC1','#1E88E5','#ffffff','#8E24AA','#D81B60','#F4511E'];
    const startX    = W * 0.5 + 220;   // right-to-left: start from right
    const titleY    = 52;
    const letterW   = 48;

    letters.forEach((ch, i) => {
      if (ch === ' ') return;
      this.add.text(startX - i * letterW, titleY, ch, {
        fontSize: '58px',
        fontFamily: 'Arial Black, Arial',
        color: colours[i],
        stroke: '#FFFFFF',
        strokeThickness: 5,
      }).setOrigin(0.5).setDepth(8);
    });

    // Subtitle "להציל את סבתא רבקה"
    this.add.text(W / 2 + 60, titleY + 68, 'להציל את סבתא רבקה', {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#7B1FA2',
      stroke: '#FFFFFF',
      strokeThickness: 4,
      rtl: true,
    }).setOrigin(0.5).setDepth(8);
  }

  // ============================================================
  // BUTTONS — left side, matching screenshot colours
  // ============================================================
  private buildButtons(W: number, H: number): void {
    void W;
    const saved   = saveManager.getCurrentLevel();
    const BW      = 210;
    const BH      = 48;
    const btnX    = 118;       // left-side x center
    let   btnY    = H / 2 - 60;
    const gap     = 58;

    // "התחל כאן" — cyan/blue
    this.makeButton(btnX, btnY, 'התחל כאן', BW, BH, 0x0097A7, 0x00BCD4, () => this.startGame(1));
    btnY += gap;

    // "המשך — רמה X" — green (only if progress)
    if (saved > 1) {
      this.makeButton(btnX, btnY, `המשך - רמה ${saved}`, BW, BH, 0x388E3C, 0x4CAF50, () => this.startGame(saved));
      btnY += gap;
    }

    // "בחר רמה" — yellow/gold
    this.makeButton(btnX, btnY, 'בחר רמה', BW, BH, 0xF9A825, 0xFDD835, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('LevelSelectScene'));
    });
    btnY += gap;

    // "הגדרות" — salmon/pink
    this.makeButton(btnX, btnY, 'הגדרות', BW, BH, 0xE64A19, 0xFF8A65, () => {
      this.scene.pause();
      this.scene.launch('SettingsScene');
    });
  }

  private makeButton(cx: number, cy: number, label: string, BW: number, BH: number,
                     colorDark: number, colorLight: number, cb: () => void): void {
    const gfx = this.add.graphics().setDepth(8);

    const draw = (hover: boolean) => {
      gfx.clear();
      // Shadow
      gfx.fillStyle(0x000000, 0.18);
      gfx.fillRoundedRect(cx - BW / 2 + 3, cy - BH / 2 + 4, BW, BH, 16);
      // Body
      gfx.fillStyle(hover ? colorLight : colorDark, 1);
      gfx.fillRoundedRect(cx - BW / 2, cy - BH / 2, BW, BH, 16);
      // Top shine
      gfx.fillStyle(0xFFFFFF, hover ? 0.25 : 0.15);
      gfx.fillRoundedRect(cx - BW / 2 + 6, cy - BH / 2 + 5, BW - 12, BH * 0.4, { tl: 11, tr: 11, bl: 0, br: 0 });
      // Border
      gfx.lineStyle(2, 0xFFFFFF, 0.45);
      gfx.strokeRoundedRect(cx - BW / 2, cy - BH / 2, BW, BH, 16);
    };

    draw(false);

    const txt = this.add.text(cx, cy, label, {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#00000066',
      strokeThickness: 3,
      rtl: true,
    }).setOrigin(0.5).setDepth(9);

    const zone = this.add.zone(cx, cy, BW, BH).setInteractive({ useHandCursor: true }).setDepth(10);
    zone.on('pointerover',  () => { draw(true);  txt.setScale(1.05); });
    zone.on('pointerout',   () => { draw(false); txt.setScale(1.0); });
    zone.on('pointerdown',  () => {
      this.tweens.add({ targets: txt, scaleX: 0.93, scaleY: 0.93, duration: 70, yoyo: true, onComplete: cb });
    });
  }

  private startGame(level: number): void {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { level });
      this.scene.stop('HUDScene');
    });
  }
}
