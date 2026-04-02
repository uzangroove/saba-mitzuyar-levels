// ============================================================
// scenes/IntroScene.ts
// Saba Painted video intro — plays on first launch
// Tap/click or wait to skip
// ============================================================

import Phaser from 'phaser';

export class IntroScene extends Phaser.Scene {
  constructor() { super({ key: 'IntroScene' }); }

  preload(): void {
    // Video loaded via DOM (Phaser video support)
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // Black background
    this.add.rectangle(W/2, H/2, W, H, 0x000000);

    // Try to play video
    const vid = this.add.video(W/2, H/2, 'intro_video');
    if (vid) {
      vid.setDisplaySize(W, H);
      vid.play(false);
      vid.on('complete', () => this.goToMenu());
    }

    // Skip text
    const skip = this.add.text(W - 20, H - 20, 'לחץ לדלג ←', {
      fontSize: '16px', fontFamily: 'Arial', color: '#FFFFFF88',
    }).setOrigin(1, 1).setDepth(10);

    // Fade in skip text
    this.tweens.add({ targets: skip, alpha: { from: 0, to: 1 }, duration: 1000, delay: 500 });

    // Click to skip
    this.input.once('pointerdown', () => this.goToMenu());
    this.input.keyboard?.once('keydown', () => this.goToMenu());

    // Fallback — 8 sec max
    this.time.delayedCall(8000, () => this.goToMenu());
  }

  private goToMenu(): void {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
