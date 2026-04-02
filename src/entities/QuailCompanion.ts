// QuailCompanion.ts — pre-baked sprite, animated via tweens only
import Phaser from 'phaser';
import { PlayerState } from './Player';

export function bakeQuailTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('quail_sprite')) return;
  const rt = scene.add.renderTexture(0, 0, 32, 32);
  const g = scene.add.graphics();
  // Body
  g.fillStyle(0xF5F5F5);
  g.fillEllipse(16, 18, 20, 16);
  // Head
  g.fillStyle(0xEEEEEE);
  g.fillCircle(16, 8, 8);
  // Wing
  g.fillStyle(0xBDBDBD);
  g.fillEllipse(10, 18, 12, 8);
  // Crest
  g.fillStyle(0x795548);
  g.fillEllipse(16, 2, 4, 8);
  // Tail
  g.fillStyle(0xBDBDBD);
  g.fillEllipse(22, 22, 8, 6);
  // Eye
  g.fillStyle(0x212121);
  g.fillCircle(13, 7, 2.5);
  g.fillStyle(0xFFFFFF);
  g.fillCircle(12, 6.5, 1);
  // Beak
  g.fillStyle(0xFFB300);
  g.fillTriangle(9, 9, 6, 10, 9, 11);
  rt.draw(g, 0, 0);
  rt.saveTexture('quail_sprite');
  g.destroy();
  rt.destroy();
}

export class QuailCompanion extends Phaser.GameObjects.Image {
  private readonly OFFSET_X = 2;
  private readonly OFFSET_Y = -42;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const key = scene.textures.exists('quail_sprite') ? 'quail_sprite' : '__DEFAULT';
    super(scene, x, y, key);
    scene.add.existing(this);
    this.setDepth(10);
    this.setOrigin(0.5, 1.0);

    // Gentle bob tween — GPU only
    scene.tweens.add({
      targets: this,
      y: y - 3,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(_dt: number, playerX: number, playerY: number, _state: PlayerState, facingRight: boolean): void {
    this.setPosition(playerX + this.OFFSET_X, playerY + this.OFFSET_Y);
    this.setFlipX(!facingRight);
  }
}
