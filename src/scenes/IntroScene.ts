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

    // Hide IMAGINA logo during intro video
    const htmlLogo = document.getElementById('floating-logo') as HTMLElement | null;
    if (htmlLogo) htmlLogo.style.display = 'none';

    // Black background
    this.add.rectangle(W/2, H/2, W, H, 0x000000);

    // Try to play video — setDisplaySize after 'created' so dimensions are known
    const vid = this.add.video(W/2, H/2, 'intro_video');
    if (vid) {
      const fitVideo = () => {
        vid.setDisplaySize(W, H);
        vid.setPosition(W / 2, H / 2);
      };
      vid.on('created', fitVideo);
      vid.on('play', fitVideo);   // second safety net
      vid.play(false);
      vid.on('complete', () => this.goToMenu());

      // Also apply via the underlying HTML video element's CSS
      const el = vid.video as HTMLVideoElement | null;
      if (el) {
        el.style.objectFit = 'fill';
        el.style.width  = `${W}px`;
        el.style.height = `${H}px`;
      }
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
