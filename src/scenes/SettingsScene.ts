// ============================================================
// scenes/SettingsScene.ts
// הגדרות משחק — Settings screen with Hebrew RTL text
// Controls: Keyboard / Mouse, Sound, Language
// ============================================================

import Phaser from 'phaser';
import { saveManager } from '../systems/SaveManager';

export class SettingsScene extends Phaser.Scene {
  private settings = {
    soundOn: true,
    musicOn: true,
    controlScheme: 'keyboard' as 'keyboard' | 'mouse' | 'gamepad',
    language: 'he' as 'he' | 'en',
  };

  constructor() { super({ key: 'SettingsScene' }); }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // Load saved settings
    const saved = (saveManager as any).getSettings?.() ?? {};
    Object.assign(this.settings, saved);

    // Dark overlay background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a2a, 0x0a0a2a, 0x1a1a4a, 0x1a1a4a, 1);
    bg.fillRect(0, 0, W, H);

    // Panel
    const panelW = 560, panelH = 420;
    const px = W/2 - panelW/2, py = H/2 - panelH/2;
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRoundedRect(px, py, panelW, panelH, 16);
    panel.lineStyle(2, 0xFFD700, 0.8);
    panel.strokeRoundedRect(px, py, panelW, panelH, 16);

    // Title — Hebrew
    this.add.text(W/2, py + 30, '⚙ הגדרות', {
      fontSize: '32px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    // ---- Rows ----
    const startY = py + 90;
    const rowH = 64;
    const labels = [
      { label: '🔊 צלילים', key: 'soundOn' },
      { label: '🎵 מוזיקה', key: 'musicOn' },
    ];

    labels.forEach(({ label, key }, i) => {
      const y = startY + i * rowH;
      this.add.text(W/2 + 80, y + 16, label, {
        fontSize: '22px', fontFamily: 'Arial', color: '#FFFFFF',
      }).setOrigin(1, 0);

      this.makeToggle(W/2 - 80, y + 4, key as 'soundOn' | 'musicOn');
    });

    // Control scheme row
    const ctrlY = startY + 2 * rowH;
    this.add.text(W/2 + 80, ctrlY + 16, '🎮 שליטה', {
      fontSize: '22px', fontFamily: 'Arial', color: '#FFFFFF',
    }).setOrigin(1, 0);

    const schemes: Array<'keyboard' | 'mouse'> = ['keyboard', 'mouse'];
    const schemeLabels = { keyboard: 'מקלדת', mouse: 'עכבר' };
    schemes.forEach((s, i) => {
      const bx = W/2 - 70 - i * 120;
      const by = ctrlY + 4;
      this.makeChoiceButton(bx, by, schemeLabels[s], s === this.settings.controlScheme, () => {
        this.settings.controlScheme = s;
        this.scene.restart();
      });
    });

    // Controls hint
    const hintY = startY + 3 * rowH + 10;
    this.add.text(W/2, hintY, this.getControlsHint(), {
      fontSize: '14px', fontFamily: 'Arial', color: '#AACCFF',
      align: 'center',
    }).setOrigin(0.5);

    // Save & back button
    this.makeButton(W/2, py + panelH - 50, '← חזור לתפריט', 0x2A3A6A, 0x3A5AAA, () => {
      (saveManager as any).saveSettings?.(this.settings);
      this.cameras.main.fadeOut(200, 0,0,0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop();
        this.scene.resume('MainMenuScene');
      });
    });

    // Fade in
    this.cameras.main.fadeIn(200);
  }

  private getControlsHint(): string {
    if (this.settings.controlScheme === 'mouse') {
      return 'לחיצה שמאל: קפיצה   |   לחיצה ימין: דאש   |   גרירה: הזזה';
    }
    return 'חצים/WASD: הזזה   |   Space/W: קפיצה   |   Z: דאש   |   X: פטיש';
  }

  private makeToggle(x: number, y: number, key: 'soundOn' | 'musicOn'): void {
    const isOn = this.settings[key];
    const g = this.add.graphics();
    const draw = (on: boolean) => {
      g.clear();
      g.fillStyle(on ? 0x22CC44 : 0x555555, 1);
      g.fillRoundedRect(x, y, 64, 32, 16);
      g.fillStyle(0xFFFFFF, 1);
      g.fillCircle(on ? x + 48 : x + 16, y + 16, 12);
    };
    draw(isOn);

    const zone = this.add.zone(x + 32, y + 16, 64, 32).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      (this.settings as any)[key] = !(this.settings as any)[key];
      draw((this.settings as any)[key]);
    });
  }

  private makeChoiceButton(x: number, y: number, label: string, selected: boolean, cb: () => void): void {
    const g = this.add.graphics();
    g.fillStyle(selected ? 0x2255CC : 0x333355, 1);
    g.fillRoundedRect(x - 44, y, 88, 36, 8);
    if (selected) {
      g.lineStyle(2, 0xFFD700, 1);
      g.strokeRoundedRect(x - 44, y, 88, 36, 8);
    }
    const txt = this.add.text(x, y + 18, label, {
      fontSize: '16px', fontFamily: 'Arial', color: '#FFFFFF',
    }).setOrigin(0.5);
    txt.setInteractive({ useHandCursor: true }).on('pointerdown', cb);
  }

  private makeButton(cx: number, cy: number, label: string, c1: number, c2: number, cb: () => void): void {
    const BW = 280, BH = 44;
    const g = this.add.graphics();
    g.fillStyle(c1, 0.95);
    g.fillRoundedRect(cx - BW/2, cy - BH/2, BW, BH, 10);
    const txt = this.add.text(cx, cy, label, {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#FFF', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    txt.on('pointerover', () => { g.clear(); g.fillStyle(c2, 1); g.fillRoundedRect(cx-BW/2, cy-BH/2, BW, BH, 10); });
    txt.on('pointerout',  () => { g.clear(); g.fillStyle(c1, 0.95); g.fillRoundedRect(cx-BW/2, cy-BH/2, BW, BH, 10); });
    txt.on('pointerdown', cb);
  }
}
