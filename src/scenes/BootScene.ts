// ============================================================
// scenes/BootScene.ts
// Asset preloading — loads real character images + particles
// ============================================================

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // ---- Loading screen ----
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a3a, 0x1a1a3a, 1);
    bg.fillRect(0, 0, W, H);

    // Saba logo (if already loaded via DOM img, just draw a placeholder)
    this.add.text(W / 2, H / 2 - 100, '🎨', { fontSize: '64px' }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 40, 'סבא מצוייר', {
      fontSize: '48px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 0, 'SABA MITZUYAR', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#AAAAFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Progress bar
    const barW = 400, barH = 20;
    const barX = W / 2 - barW / 2, barY = H / 2 + 50;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x333355);
    barBg.fillRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 10);

    const bar = this.add.graphics();
    const loadingText = this.add.text(W / 2, barY + barH + 16, 'Loading...', {
      fontSize: '16px', fontFamily: 'Arial', color: '#AAAAAA',
    }).setOrigin(0.5, 0);

    this.load.on('progress', (value: number) => {
      bar.clear();
      bar.fillStyle(0x4466FF);
      bar.fillRoundedRect(barX, barY, barW * value, barH, 8);
      bar.fillStyle(0x88AAFF, 0.6);
      bar.fillRoundedRect(barX, barY, barW * value * 0.6, barH / 3, 4);
      loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
    });

    // ---- Load background images (3 earth backgrounds, rotate by level) ----
    this.load.image('bg_earth_1', 'assets/backgrounds/bg_earth_1.jpg');
    this.load.image('bg_earth_2', 'assets/backgrounds/bg_earth_2.jpg');
    this.load.image('bg_earth_3', 'assets/backgrounds/bg_earth_3.jpg');

    // ---- Load intro video ----
    // Replace assets/intro.mp4 with your own video file (960x540 recommended)
    this.load.video('intro_video', 'assets/saba_intro.mp4', true);

    // ---- Load character images ----
    this.load.image('saba_painted',     'assets/sprites/saba_painted.png');
    this.load.image('saba_large',       'assets/sprites/saba_painted_large.png');
    this.load.image('saba_small',       'assets/sprites/saba_painted_small.png');
    this.load.image('savta_rivka',      'assets/sprites/savta_rivka.png');
    this.load.image('savta_large',      'assets/sprites/savta_rivka_large.png');

    // Your new, cleanly named monsters
    this.load.image('monster1',         'assets/sprites/new_monster_1.png');
    this.load.image('monster2',         'assets/sprites/new_monster_2.png');
    this.load.image('monster3',         'assets/sprites/new_monster_3.png');
    this.load.image('monster4',         'assets/sprites/new_monster_4.png');
    this.load.image('monster5',         'assets/sprites/new_monster_5.png');
    this.load.image('monster6',         'assets/sprites/new_monster_6.png');
    this.load.image('imagina_logo',     'logo.png');
    // ---- Particle textures (generated) ----
    this.generatePlaceholderAssets();
  }

  private generatePlaceholderAssets(): void {
    this.generateParticleTexture('particle_spark',  0xFFD700, 6);
    this.generateParticleTexture('particle_bubble', 0x44AAFF, 8);
    this.generateParticleTexture('particle_star',   0xFFFFFF, 5);
    this.generateParticleTexture('particle_leaf',   0x44CC44, 7);
    this.generateParticleTexture('coin_particle',   0xFFD700, 4);
  }

  private generateParticleTexture(key: string, color: number, radius: number): void {
    const gfx = this.add.graphics({ x: -1000, y: -1000 });
    gfx.fillStyle(color, 1);
    gfx.fillCircle(radius, radius, radius);
    gfx.generateTexture(key, radius * 2, radius * 2);
    gfx.destroy();
  }

  create(): void {
    this.scene.start('IntroScene');
  }
}
