// ============================================================
// scenes/LevelSelectScene.ts
// Level selection — world overview → level grid
// ============================================================

import Phaser from 'phaser';
import { saveManager } from '../systems/SaveManager';

type SelectState = 'worlds' | 'levels';

interface WorldDef {
  key: string;
  name: string;
  emoji: string;
  color: number;
  colorDark: number;
  levelStart: number;
  levelEnd: number;
  bossLevel: number;
  unlockLevel: number;
}

const WORLDS: WorldDef[] = [
  { key: 'earth',  name: 'ארץ',    emoji: '🌍', color: 0x4CAF50, colorDark: 0x2E7D32, levelStart: 1,  levelEnd: 10, bossLevel: 10, unlockLevel: 1  },
  { key: 'water',  name: 'מים',    emoji: '🌊', color: 0x2196F3, colorDark: 0x1565C0, levelStart: 11, levelEnd: 20, bossLevel: 20, unlockLevel: 11 },
  { key: 'sky',    name: 'שמיים',  emoji: '☁️',  color: 0x03A9F4, colorDark: 0x0277BD, levelStart: 21, levelEnd: 30, bossLevel: 30, unlockLevel: 21 },
  { key: 'space',  name: 'חלל',   emoji: '🚀', color: 0x9C27B0, colorDark: 0x6A1B9A, levelStart: 31, levelEnd: 40, bossLevel: 40, unlockLevel: 31 },
  { key: 'crayon', name: 'ציורים', emoji: '🎨', color: 0xFF69B4, colorDark: 0xC71585, levelStart: 41, levelEnd: 60, bossLevel: 60, unlockLevel: 41 },
];

export class LevelSelectScene extends Phaser.Scene {
  private selectState: SelectState = 'worlds';
  private selectedWorld: WorldDef | null = null;
  private selectedLevel: number | null = null;

  private worldCards: Phaser.GameObjects.Container[] = [];
  private levelBubbles: Phaser.GameObjects.Container[] = [];
  private playButton: Phaser.GameObjects.Container | null = null;
  private backButton: Phaser.GameObjects.Container | null = null;
  private titleText!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'LevelSelectScene' }); }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.buildBackground(W, H);

    // Title
    this.titleText = this.add.text(W / 2, 28, '🗺  בחר עולם', {
      fontSize: '28px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 5, rtl: true,
    }).setOrigin(0.5, 0).setDepth(10);

    // Back button (always visible)
    this.backButton = this.makeSmallButton(70, H - 32, '← חזור', 0x333366, 0x4444AA, () => {
      this.handleBack();
    });

    // Build world overview
    this.buildWorldCards(W, H);

    // Fade in
    this.cameras.main.fadeIn(350, 0, 0, 0);

    // ESC key goes back
    this.input.keyboard!.on('keydown-ESC', () => {
      this.handleBack();
    });
  }

  // ============================================================
  // BACKGROUND
  // ============================================================
  private buildBackground(W: number, H: number): void {
    const bgKey = 'level_select_bg';
    if (!this.textures.exists(bgKey)) {
      const rt = this.add.renderTexture(0, 0, W, H);
      const g = this.add.graphics();
      g.fillGradientStyle(0x0a1628, 0x0a1628, 0x1a2a4a, 0x1a2a4a, 1);
      g.fillRect(0, 0, W, H);
      // Star field
      g.fillStyle(0xFFFFFF);
      for (let i = 0; i < 80; i++) {
        const sx = Math.random() * W;
        const sy = Math.random() * H * 0.7;
        g.fillCircle(sx, sy, 0.5 + Math.random() * 1.5);
      }
      rt.draw(g, 0, 0);
      rt.saveTexture(bgKey);
      g.destroy();
      rt.destroy();
    }
    this.add.image(W / 2, H / 2, bgKey).setDepth(0);
  }

  // ============================================================
  // WORLD CARDS
  // ============================================================
  private buildWorldCards(W: number, H: number): void {
    // Clear existing cards
    this.worldCards.forEach(c => c.destroy());
    this.worldCards = [];

    const cardW = 190, cardH = 160;
    const totalW = WORLDS.length * cardW + (WORLDS.length - 1) * 20;
    const startX = (W - totalW) / 2 + cardW / 2;
    const cardY = H / 2 - 10;

    for (let i = 0; i < WORLDS.length; i++) {
      const wd = WORLDS[i];
      const cx = startX + i * (cardW + 20);
      const unlocked = saveManager.isLevelUnlocked(wd.unlockLevel);
      const pct = saveManager.getWorldCompletionPct(wd.levelStart, wd.levelEnd);

      const container = this.add.container(cx, cardY).setDepth(5);

      const cardGfx = this.add.graphics();
      const drawCard = (hover: boolean) => {
        cardGfx.clear();
        if (unlocked) {
          // Shadow
          cardGfx.fillStyle(0x000000, 0.35);
          cardGfx.fillRoundedRect(-cardW/2 + 3, -cardH/2 + 4, cardW, cardH, 16);
          // Body
          cardGfx.fillGradientStyle(
            hover ? wd.color : wd.colorDark,
            hover ? wd.color : wd.colorDark,
            hover ? wd.colorDark : (wd.colorDark - 0x111111),
            hover ? wd.colorDark : (wd.colorDark - 0x111111),
            1
          );
          cardGfx.fillRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 16);
          // Shine
          cardGfx.fillStyle(0xFFFFFF, hover ? 0.18 : 0.1);
          cardGfx.fillRoundedRect(-cardW/2 + 6, -cardH/2 + 6, cardW - 12, cardH * 0.35, { tl:10, tr:10, bl:0, br:0 });
          // Border
          cardGfx.lineStyle(2, hover ? 0xFFFFFF : 0x88AAFF, 0.7);
          cardGfx.strokeRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 16);

          // Progress arc (top-right corner)
          if (pct > 0) {
            const arcR = 20;
            const arcX = cardW/2 - 26, arcY = -cardH/2 + 26;
            cardGfx.lineStyle(3, 0xFFD700, 0.9);
            cardGfx.beginPath();
            cardGfx.arc(arcX, arcY, arcR, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct / 100), false);
            cardGfx.strokePath();
            cardGfx.lineStyle(3, 0x000000, 0.2);
            cardGfx.strokeCircle(arcX, arcY, arcR);
          }
        } else {
          // Locked — gray
          cardGfx.fillStyle(0x222222, 0.9);
          cardGfx.fillRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 16);
          cardGfx.lineStyle(2, 0x444444, 0.6);
          cardGfx.strokeRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 16);
        }
      };
      drawCard(false);
      container.add(cardGfx);

      if (unlocked) {
        // World emoji (large)
        const emojiTxt = this.add.text(0, -28, wd.emoji, {
          fontSize: '42px', fontFamily: 'Arial',
        }).setOrigin(0.5);
        container.add(emojiTxt);

        // World name
        const nameTxt = this.add.text(0, 20, wd.name, {
          fontSize: '20px', fontFamily: 'Arial Black, Arial',
          color: '#FFFFFF', stroke: '#000', strokeThickness: 3, rtl: true,
        }).setOrigin(0.5);
        container.add(nameTxt);

        // Completion %
        const pctTxt = this.add.text(0, 50, `${pct}% הושלם`, {
          fontSize: '13px', fontFamily: 'Arial',
          color: '#FFD700', stroke: '#000', strokeThickness: 2, rtl: true,
        }).setOrigin(0.5);
        container.add(pctTxt);

        // Levels range
        const rangeTxt = this.add.text(0, 70, `רמות ${wd.levelStart}–${wd.levelEnd}`, {
          fontSize: '11px', fontFamily: 'Arial',
          color: '#DDDDDD', rtl: true,
        }).setOrigin(0.5);
        container.add(rangeTxt);

        // Hover interaction
        const zone = this.add.zone(0, 0, cardW, cardH).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => { drawCard(true); this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 120, ease: 'Power2' }); });
        zone.on('pointerout',  () => { drawCard(false); this.tweens.add({ targets: container, scaleX: 1.0, scaleY: 1.0, duration: 120, ease: 'Power2' }); });
        zone.on('pointerdown', () => { this.onWorldSelected(wd); });
        container.add(zone);
      } else {
        // Lock icon
        const lockTxt = this.add.text(0, -10, '🔒', {
          fontSize: '36px', fontFamily: 'Arial',
        }).setOrigin(0.5);
        container.add(lockTxt);

        const lockHintTxt = this.add.text(0, 40, `פתח ברמה ${wd.unlockLevel}`, {
          fontSize: '12px', fontFamily: 'Arial',
          color: '#888888', rtl: true,
        }).setOrigin(0.5);
        container.add(lockHintTxt);
      }

      // Entrance animation
      container.setAlpha(0).setScale(0.7);
      this.tweens.add({
        targets: container,
        alpha: 1, scaleX: 1, scaleY: 1,
        duration: 350, delay: i * 80, ease: 'Back.easeOut',
      });

      this.worldCards.push(container);
    }
  }

  // ============================================================
  // WORLD SELECTED → show level grid
  // ============================================================
  private onWorldSelected(wd: WorldDef): void {
    this.selectedWorld = wd;
    this.selectState = 'levels';
    this.selectedLevel = null;

    // Animate world cards out
    this.worldCards.forEach((card, i) => {
      this.tweens.add({
        targets: card,
        scaleX: 0, scaleY: 0, alpha: 0,
        duration: 180, delay: i * 40, ease: 'Power2',
        onComplete: () => card.destroy(),
      });
    });
    this.worldCards = [];

    const totalDelay = 180 + WORLDS.length * 40 + 60;
    this.time.delayedCall(totalDelay, () => {
      this.buildLevelGrid(this.scale.width, this.scale.height, wd);
      this.titleText.setText(`${wd.emoji} ${wd.name}`);
    });

    // Remove any existing play button
    this.playButton?.destroy();
    this.playButton = null;
  }

  // ============================================================
  // LEVEL GRID
  // ============================================================
  private buildLevelGrid(W: number, H: number, wd: WorldDef): void {
    this.levelBubbles.forEach(c => c.destroy());
    this.levelBubbles = [];

    const bubbleSize = 60;
    const levelCount2 = wd.levelEnd - wd.levelStart + 1;
    const cols = levelCount2 > 10 ? 10 : 5;
    const rows = Math.ceil(levelCount2 / cols);
    const gapX = 20, gapY = 24;
    const totalW = cols * bubbleSize + (cols - 1) * gapX;
    const totalH = rows * bubbleSize + (rows - 1) * gapY;
    const startX = (W - totalW) / 2 + bubbleSize / 2;
    const startY = (H - totalH) / 2;

    for (let i = 0; i < (wd.levelEnd - wd.levelStart + 1); i++) {
      const levelId = wd.levelStart + i;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (bubbleSize + gapX);
      const cy = startY + row * (bubbleSize + gapY);
      const isBoss = levelId === wd.bossLevel;
      const unlocked = saveManager.isLevelUnlocked(levelId);
      const completed = saveManager.isLevelCompleted(levelId);

      const container = this.add.container(cx, cy).setDepth(5);

      const bg = this.add.graphics();
      const drawBubble = (hover: boolean) => {
        bg.clear();
        let fillColor: number;
        let borderColor: number;

        if (!unlocked) {
          fillColor = 0x222233;
          borderColor = 0x444466;
        } else if (isBoss) {
          fillColor = hover ? 0xCC1111 : 0x991111;
          borderColor = hover ? 0xFF4444 : 0xCC2222;
        } else if (completed) {
          fillColor = hover ? 0xFFCC00 : 0xDD9900;
          borderColor = 0xFFDD44;
        } else {
          fillColor = hover ? wd.color : wd.colorDark;
          borderColor = hover ? 0xFFFFFF : 0x88AAFF;
        }

        // Shadow
        bg.fillStyle(0x000000, 0.35);
        bg.fillCircle(2, 3, bubbleSize / 2);
        // Body
        bg.fillStyle(fillColor, 0.95);
        bg.fillCircle(0, 0, bubbleSize / 2);
        // Shine
        bg.fillStyle(0xFFFFFF, hover ? 0.2 : 0.12);
        bg.fillCircle(-8, -10, bubbleSize / 4);
        // Border
        bg.lineStyle(isBoss ? 3 : 2, borderColor, 0.9);
        bg.strokeCircle(0, 0, bubbleSize / 2);

        // Double border for boss
        if (isBoss && unlocked) {
          bg.lineStyle(1.5, 0xFF8888, 0.6);
          bg.strokeCircle(0, 0, bubbleSize / 2 - 4);
        }
      };
      drawBubble(false);
      container.add(bg);

      if (unlocked) {
        // Level number
        const numTxt = this.add.text(0, isBoss ? -6 : 0, `${levelId}`, {
          fontSize: isBoss ? '16px' : '20px',
          fontFamily: 'Arial Black, Arial',
          color: completed ? '#2a1a00' : '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5);
        container.add(numTxt);

        if (isBoss) {
          const skullTxt = this.add.text(0, 12, '☠', { fontSize: '16px' }).setOrigin(0.5);
          container.add(skullTxt);
        }

        if (completed) {
          const checkTxt = this.add.text(18, -18, '✓', {
            fontSize: '14px', fontFamily: 'Arial Black',
            color: '#00FF44', stroke: '#000', strokeThickness: 2,
          }).setOrigin(0.5);
          container.add(checkTxt);
        }

        // Interaction
        const zone = this.add.zone(0, 0, bubbleSize, bubbleSize).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => { drawBubble(true); this.tweens.add({ targets: container, scaleX: 1.12, scaleY: 1.12, duration: 100 }); });
        zone.on('pointerout',  () => { drawBubble(false); this.tweens.add({ targets: container, scaleX: 1.0, scaleY: 1.0, duration: 100 }); });
        zone.on('pointerdown', () => { this.onLevelSelected(levelId); });
        container.add(zone);
      } else {
        const lockTxt = this.add.text(0, 0, '🔒', { fontSize: '20px' }).setOrigin(0.5);
        container.add(lockTxt);
      }

      // Entrance animation
      container.setAlpha(0).setScale(0.5);
      this.tweens.add({
        targets: container,
        alpha: 1, scaleX: 1, scaleY: 1,
        duration: 300, delay: i * 40, ease: 'Back.easeOut',
      });

      this.levelBubbles.push(container);
    }
  }

  // ============================================================
  // LEVEL SELECTED → show Play button
  // ============================================================
  private onLevelSelected(levelId: number): void {
    this.selectedLevel = levelId;

    this.playButton?.destroy();
    const W = this.scale.width;
    const H = this.scale.height;

    this.playButton = this.makeSmallButton(W - 100, H - 32, `▶ שחק ${levelId}`, 0x1B6B2E, 0x2E9E4A, () => {
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('HUDScene');
        this.scene.start('GameScene', { level: this.selectedLevel });
      });
    });
  }

  // ============================================================
  // BACK NAVIGATION
  // ============================================================
  private handleBack(): void {
    if (this.selectState === 'levels') {
      // Go back to world overview
      this.selectState = 'worlds';
      this.selectedWorld = null;
      this.selectedLevel = null;

      this.levelBubbles.forEach((b, i) => {
        this.tweens.add({ targets: b, scaleX: 0, scaleY: 0, alpha: 0, duration: 150, delay: i * 30, ease: 'Power2', onComplete: () => b.destroy() });
      });
      this.levelBubbles = [];

      this.playButton?.destroy();
      this.playButton = null;

      this.titleText.setText('🗺  בחר עולם');
      this.time.delayedCall(200, () => {
        this.buildWorldCards(this.scale.width, this.scale.height);
      });
    } else {
      // Go back to main menu
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    }
  }

  // ============================================================
  // SMALL BUTTON HELPER
  // ============================================================
  private makeSmallButton(cx: number, cy: number, label: string, colorDark: number, colorLight: number, cb: () => void): Phaser.GameObjects.Container {
    const BW = 130, BH = 36;
    const container = this.add.container(cx, cy).setDepth(12);

    const gfx = this.add.graphics();
    const draw = (hover: boolean) => {
      gfx.clear();
      gfx.fillStyle(0x000000, 0.2);
      gfx.fillRoundedRect(-BW/2 + 2, -BH/2 + 3, BW, BH, 10);
      gfx.fillStyle(hover ? colorLight : colorDark, 0.95);
      gfx.fillRoundedRect(-BW/2, -BH/2, BW, BH, 10);
      gfx.lineStyle(1.5, hover ? 0xFFFFFF : 0x88AAFF, 0.6);
      gfx.strokeRoundedRect(-BW/2, -BH/2, BW, BH, 10);
    };
    draw(false);
    container.add(gfx);

    const txt = this.add.text(0, 0, label, {
      fontSize: '15px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000', strokeThickness: 2, rtl: true,
    }).setOrigin(0.5);
    container.add(txt);

    const zone = this.add.zone(0, 0, BW, BH).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => { draw(true);  this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 80 }); });
    zone.on('pointerout',  () => { draw(false); this.tweens.add({ targets: container, scaleX: 1.0,  scaleY: 1.0,  duration: 80 }); });
    zone.on('pointerdown', () => { this.tweens.add({ targets: container, scaleX: 0.93, scaleY: 0.93, duration: 80, yoyo: true, onComplete: cb }); });
    container.add(zone);

    return container;
  }
}