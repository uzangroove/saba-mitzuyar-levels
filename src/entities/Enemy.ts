// Enemy.ts — uses pre-baked RenderTextures (zero per-frame CPU cost)
import Phaser from 'phaser';
import { EnemyType } from './EnemyRenderer';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  isDead = false;
  private moveDir = 1;
  private patrolStartX: number;
  private readonly patrolDistance: number;
  private readonly speed: number;
  private readonly variant: number;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    private readonly enemyType: EnemyType,
    patrolDistance: number,
    variant: number = 0,
  ) {
    const textureKey = `enemy_${enemyType}_${variant}`;
    const fallback = scene.textures.exists(textureKey) ? textureKey : '__DEFAULT';
    super(scene, x, y, fallback);

    this.variant = variant;
    this.patrolStartX = x;
    this.patrolDistance = patrolDistance;
    const speedMap: Record<string, number> = {
      monster1: 55, monster2: 70, monster3: 55,
      monster4: 60, monster5: 75, monster6: 65,
    };
    this.speed = speedMap[enemyType] ?? 55;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    const w = this.width || 40;
    const h = this.height || 36;
    body.setSize(w * 0.75, h * 0.75);
    body.setGravityY(200);
    body.setMaxVelocityY(600);
    this.setDepth(4);
    this.setOrigin(0.5, 1.0);

    // Tween: gentle bob animation (GPU only, zero CPU)
    scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 800 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(dt: number): void {
    if (this.isDead) return;  // death handled by tween in die()
    

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;  // physics not ready yet
    body.velocity.x = this.moveDir * this.speed;

    const distFromStart = this.x - this.patrolStartX;
    if (distFromStart > this.patrolDistance && this.moveDir > 0) this.moveDir = -1;
    else if (distFromStart < 0 && this.moveDir < 0) this.moveDir = 1;

    if (body.blocked.left) this.moveDir = 1;
    if (body.blocked.right) this.moveDir = -1;

    // Face direction by flipping sprite
    this.setFlipX(this.moveDir < 0);
  }

  takeDamage(_amount: number = 1): boolean {
    this.die();
    return true;
  }

  die(): void {
    if (this.isDead) return;
    this.isDead = true;
    // Stop all existing tweens (bob animation etc.)
    this.scene.tweens.killTweensOf(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, -200);
      body.setGravityY(600);
    }
    // Death animation → then destroy once
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: 180,
      scaleY: 0.5,
      duration: 500,
      onComplete: () => {
        if (this.scene) this.destroy();
      },
    });
  }
}
