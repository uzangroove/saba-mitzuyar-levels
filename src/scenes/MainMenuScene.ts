// ============================================================
// scenes/MainMenuScene.ts  — Bright, child-friendly main menu
// Uses baked RenderTexture for background + tweens for animation
// No per-frame Graphics redraws — all animation via tweens
// ============================================================

import Phaser from 'phaser';
import { saveManager } from '../systems/SaveManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // ---- Baked background (sky gradient + hills + ground) ----
    this.buildBackground(W, H);

    // ---- Animated cloud images ----
    this.buildClouds(W, H);

    // ---- Castle (baked once) + Savta in window ----
    this.buildCastleAndSavta(W, H);

    // ---- Saba character + quail ----
    this.buildCharacters(W, H);

    // ---- Title panel ----
    this.buildTitlePanel(W, H);

    // ---- Buttons ----
    this.buildButtons(W, H);

    // ---- Controls hint ----
    this.add.text(W / 2, H - 14, '← → הזזה   |   רווח קפיצה   |   Z דאש   |   X פטיש', {
      fontSize: '11px', fontFamily: 'Arial', color: '#7a9ab0', rtl: true,
    }).setOrigin(0.5, 1).setDepth(10);

    // Version
    this.add.text(10, H - 10, 'v1.0 — Saba Mitzuyar', {
      fontSize: '10px', fontFamily: 'monospace', color: '#6a8898',
    }).setOrigin(0, 1).setDepth(10);

    // Camera fade in
    this.cameras.main.fadeIn(500, 255, 255, 255);
  }

  // ============================================================
  // BACKGROUND — baked once into RenderTexture
  // ============================================================
  private buildBackground(W: number, H: number): void {
    const bgKey = 'menu_background_v2';
    if (!this.textures.exists(bgKey)) {
      const rt = this.add.renderTexture(0, 0, W, H);
      const g = this.add.graphics();

      // Sky gradient: bright blue top → warm yellow horizon
      g.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xFFF0A0, 0xFFF0A0, 1);
      g.fillRect(0, 0, W, H);

      // Sun
      g.fillStyle(0xFFDD44, 0.9);
      g.fillCircle(W * 0.82, H * 0.15, 48);
      g.fillStyle(0xFFEE88, 0.4);
      g.fillCircle(W * 0.82, H * 0.15, 62);
      g.fillStyle(0xFFEE88, 0.2);
      g.fillCircle(W * 0.82, H * 0.15, 76);

      // Far hills (light green/blue)
      g.fillStyle(0x8ABAA8);
      for (let hx = 0; hx < W + 300; hx += 200) {
        g.fillEllipse(hx, H - 60, 320, (120 + Math.sin(hx * 0.015) * 40) * 2);
      }

      // Near hills (brighter green)
      g.fillStyle(0x76B98E);
      for (let hx = 0; hx < W + 200; hx += 160) {
        g.fillEllipse(hx, H - 30, 240, (80 + Math.cos(hx * 0.02) * 30) * 2);
      }

      // Ground stripe
      g.fillStyle(0x5C9E72);
      g.fillRect(0, H - 52, W, 52);
      g.fillStyle(0x6DB583);
      g.fillRect(0, H - 56, W, 8);

      // Grass blades
      g.fillStyle(0x7FCC90);
      for (let gx = 0; gx < W; gx += 10) {
        const gh = 4 + Math.sin(gx * 0.2) * 3;
        g.fillTriangle(gx, H - 56, gx + 5, H - 56, gx + 2, H - 56 - gh);
      }

      // Stone path (decorative)
      g.fillStyle(0xC8B8A2, 0.6);
      for (let px = 100; px < 280; px += 40) {
        g.fillRoundedRect(px, H - 52, 32, 12, 4);
      }

      rt.draw(g, 0, 0);
      rt.saveTexture(bgKey);
      g.destroy();
      rt.destroy();
    }
    this.add.image(W / 2, H / 2, bgKey).setDepth(0).setScrollFactor(0);
  }

  // ============================================================
  // CLOUDS — individual images with tween movement
  // ============================================================
  private buildClouds(W: number, H: number): void {
    const cloudKey = 'menu_cloud_sprite';
    if (!this.textures.exists(cloudKey)) {
      const rt = this.add.renderTexture(0, 0, 160, 70);
      const g = this.add.graphics();
      g.fillStyle(0xFFFFFF, 0.9);
      g.fillEllipse(80, 40, 120, 50);
      g.fillEllipse(50, 36, 80, 44);
      g.fillEllipse(110, 32, 70, 40);
      g.fillStyle(0xF0F8FF, 0.6);
      g.fillEllipse(80, 36, 100, 38);
      rt.draw(g, 0, 0);
      rt.saveTexture(cloudKey);
      g.destroy();
      rt.destroy();
    }

    const cloudDefs = [
      { x: W * 0.1, y: 55, scale: 1.0, spd: 20000, alpha: 0.85 },
      { x: W * 0.4, y: 35, scale: 0.7, spd: 28000, alpha: 0.7 },
      { x: W * 0.65, y: 65, scale: 1.2, spd: 22000, alpha: 0.8 },
      { x: W * 0.88, y: 44, scale: 0.8, spd: 32000, alpha: 0.65 },
    ];

    for (const cd of cloudDefs) {
      const cloud = this.add.image(cd.x, cd.y, cloudKey)
        .setDepth(1).setAlpha(cd.alpha).setScale(cd.scale).setScrollFactor(0);

      // Drift left, loop to right
      this.tweens.add({
        targets: cloud,
        x: { from: cd.x, to: -200 },
        duration: cd.spd,
        repeat: -1,
        onRepeat: () => { cloud.setX(W + 200); },
      });

      // Gentle vertical bob
      this.tweens.add({
        targets: cloud,
        y: { from: cd.y - 5, to: cd.y + 5 },
        duration: 4000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  // ============================================================
  // CASTLE & SAVTA — baked once, with tweened glow pulse
  // ============================================================
  private buildCastleAndSavta(W: number, H: number): void {
    const cx = W * 0.78;
    const cy = H - 30;

    const castleKey = 'menu_castle_baked_v2';
    if (!this.textures.exists(castleKey)) {
      const rtW = 240, rtH = 300;
      const rt = this.add.renderTexture(0, 0, rtW, rtH);
      const g = this.add.graphics();

      const ox = rtW / 2, oy = rtH;
      const stoneColor = 0x8D9FA8, stoneDark = 0x6B7D86, stoneLight = 0xAABEC8, roofColor = 0x4A5568;

      // Main keep
      g.fillStyle(stoneDark);
      g.fillRect(ox - 72, oy - 160, 144, 160);
      g.fillStyle(stoneColor);
      g.fillRect(ox - 70, oy - 158, 140, 156);
      // Stone lines
      g.lineStyle(1, stoneDark, 0.3);
      for (let row = 1; row < 6; row++) {
        g.lineBetween(ox - 68, oy - 158 + row * 26, ox + 68, oy - 158 + row * 26);
      }
      // Battlements
      for (let b = 0; b < 5; b++) {
        const bx = ox - 70 + 10 + b * 30;
        g.fillStyle(stoneColor);
        g.fillRect(bx - 8, oy - 180, 16, 22);
        g.fillStyle(stoneLight);
        g.fillRect(bx - 7, oy - 178, 14, 20);
      }
      // Gate
      g.fillStyle(0x1A1A2E);
      g.fillRoundedRect(ox - 20, oy - 70, 40, 70, { tl:20, tr:20, bl:0, br:0 });
      g.fillStyle(0xFFD700, 0.9);
      g.fillCircle(ox + 10, oy - 30, 3);

      // Left tower
      const ltx = ox - 68;
      g.fillStyle(stoneDark);
      g.fillRect(ltx - 34, oy - 240, 68, 240);
      g.fillStyle(stoneColor);
      g.fillRect(ltx - 32, oy - 238, 64, 236);
      // Roof
      g.fillStyle(roofColor);
      g.fillTriangle(ltx, oy - 285, ltx - 38, oy - 240, ltx + 38, oy - 240);
      // Battlements
      for (let b = 0; b < 3; b++) {
        const bx = ltx - 28 + b * 28;
        g.fillStyle(stoneColor);
        g.fillRect(bx, oy - 258, 14, 20);
      }
      // Savta window
      const winX = ltx, winY = oy - 200;
      g.fillStyle(stoneDark);
      g.fillRoundedRect(winX - 14, winY - 32, 28, 36, { tl:14, tr:14, bl:0, br:0 });
      g.fillStyle(0xFFD700, 0.9);
      g.fillRoundedRect(winX - 11, winY - 28, 22, 30, { tl:11, tr:11, bl:0, br:0 });
      g.fillStyle(stoneLight);
      g.fillRect(winX - 15, winY + 2, 30, 5);

      // Right tower
      const rtx = ox + 68;
      const rtH2 = 190;
      g.fillStyle(stoneDark);
      g.fillRect(rtx - 28, oy - rtH2, 56, rtH2);
      g.fillStyle(stoneColor);
      g.fillRect(rtx - 26, oy - rtH2 + 2, 52, rtH2 - 2);
      g.fillStyle(roofColor);
      g.fillTriangle(rtx, oy - rtH2 - 45, rtx - 32, oy - rtH2, rtx + 32, oy - rtH2);
      // Right window
      g.fillStyle(0xFFD700, 0.6);
      g.fillRoundedRect(rtx - 10, oy - 145, 20, 24, { tl:10, tr:10, bl:0, br:0 });

      // Flag pole + flag
      g.lineStyle(2, 0x5D4037, 1);
      g.lineBetween(ltx, oy - 285, ltx, oy - 320);
      g.fillStyle(0xE53935);
      g.fillTriangle(ltx, oy - 320, ltx + 24, oy - 312, ltx, oy - 302);

      rt.draw(g, 0, 0);
      rt.saveTexture(castleKey);
      g.destroy();
      rt.destroy();
    }

    const castle = this.add.image(cx, cy, castleKey)
      .setDepth(2).setOrigin(0.5, 1);

    // Savta portrait in window
    const winOffX = cx - 68;
    const winOffY = cy - 200;
    if (this.textures.exists('savta_rivka')) {
      const savta = this.add.image(winOffX, winOffY - 10, 'savta_rivka')
        .setDisplaySize(22, 22).setDepth(4);
      this.tweens.add({
        targets: savta,
        y: { from: winOffY - 12, to: winOffY - 6 },
        duration: 1800,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // Glowing window pulse
    const winGlow = this.add.graphics().setDepth(3);
    winGlow.fillStyle(0xFFD700, 0.5);
    winGlow.fillCircle(winOffX, winOffY - 10, 30);
    this.tweens.add({
      targets: winGlow,
      alpha: { from: 0.5, to: 1.0 },
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Flag wave — use Rectangle tween instead of redrawing
    const flagPole = this.add.graphics().setDepth(3);
    flagPole.lineStyle(2, 0x5D4037, 1);
    const fPoleX = cx - 68, fPoleY = cy - 320;
    flagPole.lineBetween(fPoleX, cy - 285, fPoleX, fPoleY);

    const flagRect = this.add.rectangle(fPoleX + 12, fPoleY + 10, 24, 18, 0xE53935)
      .setDepth(3).setOrigin(0, 0.5);
    this.tweens.add({
      targets: flagRect,
      scaleX: { from: 1.0, to: 0.55 },
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Castle entrance torch glow
    const torchGlow = this.add.graphics().setDepth(3);
    torchGlow.fillStyle(0xFF8800, 0.25);
    torchGlow.fillCircle(cx - 40, cy - 80, 16);
    torchGlow.fillCircle(cx + 40, cy - 80, 16);
    this.tweens.add({
      targets: torchGlow,
      alpha: { from: 0.6, to: 1.0 },
      duration: 900, yoyo: true, repeat: -1,
    });

    // Unused variable warning suppressor
    void castle;
  }

  // ============================================================
  // CHARACTERS — Saba with bob tween, quail with wing tween
  // ============================================================
  private buildCharacters(W: number, H: number): void {
    void W;
    const sabaX = 185, sabaY = H - 125;

    if (this.textures.exists('saba_large')) {
      const saba = this.add.image(sabaX, sabaY, 'saba_large')
        .setDisplaySize(128, 210).setDepth(4);
      // Bob tween
      this.tweens.add({
        targets: saba,
        y: { from: sabaY - 5, to: sabaY + 5 },
        duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      // Breathe scale tween
      this.tweens.add({
        targets: saba,
        scaleX: { from: 1.0, to: 1.02 },
        scaleY: { from: 1.0, to: 1.02 },
        duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    } else {
      // Fallback procedural Saba (drawn once, static)
      this.drawSabaStatic(sabaX, sabaY);
    }

    // Quail companion (bake once)
    this.buildQuailCompanion(sabaX + 6, sabaY - 206);
  }

  private buildQuailCompanion(qx: number, qy: number): void {
    const quailKey = 'menu_quail_baked';
    if (!this.textures.exists(quailKey)) {
      const rt = this.add.renderTexture(0, 0, 36, 36);
      const g = this.add.graphics();
      g.fillStyle(0x455A64);
      g.fillEllipse(18, 20, 20, 16);
      g.fillStyle(0x546E7A);
      g.fillEllipse(18, 18, 20, 15);
      g.fillStyle(0xBCAAA4);
      g.fillEllipse(20, 22, 11, 10);
      g.fillStyle(0x37474F);
      g.fillEllipse(16, 21, 15, 8);
      g.fillStyle(0x263238);
      g.fillCircle(26, 11, 8);
      g.fillStyle(0xFF4800);
      g.fillCircle(29, 10, 3);
      g.fillStyle(0x111111);
      g.fillCircle(29, 10, 2);
      g.fillStyle(0xFFFFFF);
      g.fillCircle(30, 9, 1);
      g.fillStyle(0x1A237E);
      g.fillRect(26, 5, 2, 7);
      g.fillEllipse(27, 4, 8, 6);
      g.fillStyle(0x795548);
      g.fillTriangle(10, 20, 4, 30, 14, 26);
      rt.draw(g, 0, 0);
      rt.saveTexture(quailKey);
      g.destroy();
      rt.destroy();
    }
    const quail = this.add.image(qx, qy, quailKey).setDepth(5);
    // Wing-flap via scale tween
    this.tweens.add({
      targets: quail,
      scaleY: { from: 1.0, to: 0.7 },
      duration: 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    // Bob with Saba
    this.tweens.add({
      targets: quail,
      y: { from: qy - 5, to: qy + 5 },
      duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  private drawSabaStatic(cx: number, cy: number): void {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x3E2723);
    g.fillRoundedRect(cx - 28, cy - 4, 22, 14, { tl:2, tr:2, bl:5, br:5 });
    g.fillRoundedRect(cx + 6, cy - 4, 22, 14, { tl:2, tr:2, bl:5, br:5 });
    g.fillStyle(0x263238);
    g.fillRoundedRect(cx - 22, cy - 52, 44, 50, 5);
    g.fillStyle(0x0D47A1);
    g.fillRoundedRect(cx - 26, cy - 106, 52, 52, { tl:5, tr:5, bl:0, br:0 });
    g.fillStyle(0xFFCCBC);
    g.fillCircle(cx - 31, cy - 68, 9);
    g.fillCircle(cx + 31, cy - 68, 9);
    g.fillRect(cx - 7, cy - 124, 14, 17);
    g.fillStyle(0xFFCCBC);
    g.fillCircle(cx, cy - 150, 36);
    g.fillStyle(0x999999);
    g.fillCircle(cx, cy - 178, 32);
    g.fillStyle(0xFFCCBC);
    g.fillEllipse(cx, cy - 152, 60, 36);
    g.fillStyle(0xDDDDDD);
    g.fillEllipse(cx, cy - 128, 48, 26);
    g.fillStyle(0xFFFFFF);
    g.fillEllipse(cx - 13, cy - 154, 14, 8);
    g.fillEllipse(cx + 13, cy - 154, 14, 8);
    g.fillStyle(0x5D4037);
    g.fillCircle(cx - 12, cy - 154, 4);
    g.fillCircle(cx + 13, cy - 154, 4);
  }

  // ============================================================
  // TITLE PANEL — parchment look
  // ============================================================
  private buildTitlePanel(W: number, H: number): void {
    const panelW = 520, panelH = 130;
    const panelX = W / 2 - panelW / 2;
    const panelY = 24;

    const panel = this.add.graphics().setDepth(6);
    // Warm shadow
    panel.fillStyle(0x7B5E3A, 0.25);
    panel.fillRoundedRect(panelX + 4, panelY + 5, panelW, panelH, 18);
    // Parchment body
    panel.fillStyle(0xFFF8E1, 0.96);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 18);
    // Top highlight
    panel.fillStyle(0xFFFFFF, 0.45);
    panel.fillRoundedRect(panelX + 8, panelY + 6, panelW - 16, 28, { tl:12, tr:12, bl:0, br:0 });
    // Amber border
    panel.lineStyle(3, 0xFFB300, 0.9);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 18);
    // Inner accent
    panel.lineStyle(1.5, 0xFFCC44, 0.4);
    panel.strokeRoundedRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8, 14);

    // Hebrew title
    const titleHe = this.add.text(W / 2, panelY + 48, 'סבא מצוייר', {
      fontSize: '50px', fontFamily: 'Arial Black, Arial',
      color: '#E65100', stroke: '#FFF8E1', strokeThickness: 6, rtl: true,
    }).setOrigin(0.5).setDepth(7);

    // Title gentle float
    this.tweens.add({
      targets: titleHe,
      y: { from: panelY + 45, to: panelY + 51 },
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // English subtitle
    this.add.text(W / 2, panelY + 100, 'SABA  MITZUYAR', {
      fontSize: '20px', fontFamily: 'Arial Black',
      color: '#BF8600', stroke: '#FFF8E1', strokeThickness: 3,
      letterSpacing: 8,
    }).setOrigin(0.5).setDepth(7);

    // Tagline
    this.add.text(W / 2, panelY + 126, '✦  Rescue Savta Rebecca from the Castle!  ✦', {
      fontSize: '12px', fontFamily: 'Arial', color: '#8D6E63', stroke: '#FFF8E1', strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(7);
  }

  // ============================================================
  // BUTTONS
  // ============================================================
  private buildButtons(W: number, H: number): void {
    const saved = saveManager.getCurrentLevel();
    let btnY = H - 215;

    // Start Game — green
    this.makeButton(W / 2, btnY, '▶   התחל משחק', 0x1B6B2E, 0x2E9E4A, () => {
      this.startGame(1);
    });
    btnY += 58;

    // Continue — blue (only if progress exists)
    if (saved > 1) {
      this.makeButton(W / 2, btnY, `⟳   המשך — רמה ${saved}`, 0x1044A8, 0x1565C0, () => {
        this.startGame(saved);
      });
      btnY += 58;
    }

    // Level Select — teal
    this.makeButton(W / 2, btnY, '🗺   בחר רמה', 0x006060, 0x009090, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LevelSelectScene');
      });
    });
    btnY += 58;

    // Settings — purple
    this.makeButton(W / 2, btnY, '⚙   הגדרות', 0x4A1B7A, 0x6A2BAA, () => {
      this.scene.pause();
      this.scene.launch('SettingsScene');
    });
  }

  private makeButton(cx: number, cy: number, label: string, colorDark: number, colorLight: number, cb: () => void): void {
    const BW = 340, BH = 48;
    const gfx = this.add.graphics().setDepth(8);

    const draw = (hover: boolean) => {
      gfx.clear();
      const c = hover ? colorLight : colorDark;
      // Drop shadow
      gfx.fillStyle(0x000000, 0.2);
      gfx.fillRoundedRect(cx - BW/2 + 3, cy - BH/2 + 4, BW, BH, 14);
      // Body
      gfx.fillStyle(c, 0.96);
      gfx.fillRoundedRect(cx - BW/2, cy - BH/2, BW, BH, 14);
      // Top shine
      gfx.fillStyle(0xFFFFFF, hover ? 0.2 : 0.12);
      gfx.fillRoundedRect(cx - BW/2 + 6, cy - BH/2 + 5, BW - 12, BH * 0.38, { tl:9, tr:9, bl:0, br:0 });
      // Border
      gfx.lineStyle(1.5, hover ? 0xFFFFFF : 0xAAFFAA, 0.5);
      gfx.strokeRoundedRect(cx - BW/2, cy - BH/2, BW, BH, 14);
    };

    draw(false);

    const txt = this.add.text(cx, cy, label, {
      fontSize: '19px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 2, rtl: true,
    }).setOrigin(0.5).setDepth(9).setInteractive({ useHandCursor: true });

    const zone = this.add.zone(cx, cy, BW, BH).setInteractive({ useHandCursor: true }).setDepth(10);
    zone.on('pointerover',  () => { draw(true);  txt.setScale(1.04); });
    zone.on('pointerout',   () => { draw(false); txt.setScale(1.0); });
    zone.on('pointerdown',  () => {
      this.tweens.add({ targets: txt, scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true, onComplete: cb });
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
