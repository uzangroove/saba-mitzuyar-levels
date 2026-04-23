// ============================================================
// systems/VFXManager.ts
// Centralized Visual Effects Manager
// Drop-in upgrade — no changes needed to existing files
// Usage: Add to GameScene, call methods from game events
// ============================================================

import Phaser from 'phaser';

// ---- Floating text pool (damage numbers, combo, messages) ----
interface FloatingText {
  text: Phaser.GameObjects.Text;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

// ---- Particle pool entry ----
interface Particle {
  gfx: Phaser.GameObjects.Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  gravity: number;
  color: number;
  size: number;
  spin: number;
}

export class VFXManager {
  private scene: Phaser.Scene;
  private floatingTexts: FloatingText[] = [];
  private particles: Particle[] = [];

  // Persistent tween-based effects (no update needed)
  private dustContainer!: Phaser.GameObjects.Container;
  private trailPoints: { x: number; y: number; alpha: number }[] = [];
  private trailGfx!: Phaser.GameObjects.Graphics;
  private lastTrailTime: number = 0;

  // Screen shake state
  private shakeQueue: { intensity: number; duration: number }[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.dustContainer = scene.add.container(0, 0).setDepth(6);
    this.trailGfx = scene.add.graphics().setDepth(4);
  }

  // ============================================================
  // JUMP DUST — puff of dust when player jumps
  // ============================================================
  spawnJumpDust(x: number, y: number, isDoubleJump: boolean = false): void {
    const color = isDoubleJump ? 0x88AAFF : 0xCCBB99;
    const count = isDoubleJump ? 10 : 6;
    const spreadY = isDoubleJump ? [-2, -4] : [0, 2]; // double jump goes upward

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = isDoubleJump ? 60 + Math.random() * 90 : 40 + Math.random() * 60;

      const p = this.scene.add.graphics().setDepth(5);
      const r = isDoubleJump ? 3 + Math.random() * 4 : 2.5 + Math.random() * 3.5;
      p.fillStyle(color, 0.85);
      p.fillCircle(0, 0, r);
      p.setPosition(x + (Math.random() - 0.5) * 20, y);

      this.scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * speed * 0.7,
        y: p.y + Math.sin(angle) * speed * (isDoubleJump ? -0.5 : 0.4) +
           Phaser.Math.Between(spreadY[0], spreadY[1]) * 10,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 280 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }

    // Ring flash for double jump
    if (isDoubleJump) {
      const ring = this.scene.add.graphics().setDepth(5).setPosition(x, y);
      ring.lineStyle(3, 0x88AAFF, 0.9);
      ring.strokeCircle(0, 0, 8);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 4, scaleY: 4,
        alpha: 0,
        duration: 350,
        ease: 'Power2',
        onComplete: () => ring.destroy(),
      });
    }
  }

  // ============================================================
  // LAND IMPACT — dust + shockwave on landing
  // ============================================================
  spawnLandDust(x: number, y: number, velocity: number = 300): void {
    const intensity = Math.min(1, velocity / 600);
    const count = Math.floor(4 + intensity * 8);

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const p = this.scene.add.graphics().setDepth(5);
      p.fillStyle(0xBBAA88, 0.75);
      const r = 2 + Math.random() * 3;
      p.fillEllipse(0, 0, r * 2, r);
      p.setPosition(x + side * (4 + Math.random() * 16), y);

      this.scene.tweens.add({
        targets: p,
        x: p.x + side * (30 + Math.random() * 50),
        y: p.y - 10 - Math.random() * 20,
        alpha: 0,
        scaleX: 0.2,
        duration: 300 + Math.random() * 150,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }

    // Hard landing: shockwave ring
    if (intensity > 0.4) {
      const ring = this.scene.add.graphics().setDepth(4).setPosition(x, y);
      ring.lineStyle(2 + intensity * 3, 0xBBAA88, 0.7);
      ring.strokeEllipse(0, 0, 20, 8);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 3 + intensity * 3,
        scaleY: 1.5,
        alpha: 0,
        duration: 350,
        ease: 'Power3',
        onComplete: () => ring.destroy(),
      });

      // Screen micro-shake for hard landing
      if (intensity > 0.6) {
        this.scene.cameras.main.shake(80, 0.004 * intensity);
      }
    }
  }

  // ============================================================
  // DASH TRAIL — motion blur effect during dash
  // ============================================================
  spawnDashTrail(x: number, y: number, facingRight: boolean, time: number): void {
    if (time - this.lastTrailTime < 40) return;
    this.lastTrailTime = time;

    const ghost = this.scene.add.graphics().setDepth(3);
    ghost.fillStyle(0x4488FF, 0.35);
    // Rough player silhouette
    ghost.fillRect(facingRight ? -8 : -14, -28, 22, 44);
    ghost.fillStyle(0x88AAFF, 0.2);
    ghost.fillCircle(0, -34, 12);
    ghost.setPosition(x, y);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 0.6,
      x: facingRight ? x - 30 : x + 30,
      duration: 200,
      ease: 'Linear',
      onComplete: () => ghost.destroy(),
    });
  }

  // ============================================================
  // RUN DUST — tiny puffs under feet while running
  // ============================================================
  spawnRunDust(x: number, y: number): void {
    if (Math.random() > 0.35) return; // throttle
    const p = this.scene.add.graphics().setDepth(3);
    p.fillStyle(0xCCBBAA, 0.5);
    p.fillCircle(0, 0, 2 + Math.random() * 2);
    p.setPosition(x + (Math.random() - 0.5) * 12, y);

    this.scene.tweens.add({
      targets: p,
      y: p.y - 12,
      x: p.x + (Math.random() - 0.5) * 20,
      alpha: 0,
      duration: 250 + Math.random() * 100,
      ease: 'Power1',
      onComplete: () => p.destroy(),
    });
  }

  // ============================================================
  // ATTACK SPARK — sparks when hammer hits
  // ============================================================
  spawnAttackSparks(x: number, y: number, facingRight: boolean): void {
    const colors = [0xFFD700, 0xFFAA00, 0xFF8800, 0xFFFFAA];
    for (let i = 0; i < 12; i++) {
      const p = this.scene.add.graphics().setDepth(8);
      p.fillStyle(colors[Math.floor(Math.random() * colors.length)]);
      p.fillRect(-1.5, -1.5, 3 + Math.random() * 4, 3);
      p.setPosition(x, y);

      const dir = facingRight ? 1 : -1;
      const angle = (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = 80 + Math.random() * 180;

      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed * dir,
        y: y + Math.sin(angle) * speed - 30,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        angle: Math.random() * 360,
        duration: 250 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }

    // Impact flash
    const flash = this.scene.add.graphics()
      .setDepth(8)
      .setPosition(x + (facingRight ? 20 : -20), y);
    flash.fillStyle(0xFFFFFF, 0.9);
    flash.fillCircle(0, 0, 10);
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2.5, scaleY: 2.5,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
  }

  // ============================================================
  // HIT FLASH — enemy/player takes damage
  // ============================================================
  spawnHitFlash(
    target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image,
    color: number = 0xFF4444
  ): void {
    target.setTint(color);
    this.scene.time.delayedCall(80, () => {
      if (target.active) target.clearTint();
    });
    this.scene.time.delayedCall(160, () => {
      if (target.active) target.setTint(color);
    });
    this.scene.time.delayedCall(240, () => {
      if (target.active) target.clearTint();
    });
  }

  // ============================================================
  // PLAYER DAMAGE — red flash + screen shake
  // ============================================================
  spawnPlayerDamageEffect(px: number, py: number): void {
    this.scene.cameras.main.shake(220, 0.009);
    this.scene.cameras.main.flash(180, 255, 40, 40, false);

    // Red shockwave from player
    const ring = this.scene.add.graphics().setDepth(8).setPosition(px, py);
    ring.lineStyle(4, 0xFF4444, 0.9);
    ring.strokeCircle(0, 0, 16);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 4, scaleY: 4,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => ring.destroy(),
    });

    // Blood-like particles (cartoonish — red star shapes)
    for (let i = 0; i < 8; i++) {
      const p = this.scene.add.graphics().setDepth(8);
      p.fillStyle(0xFF3333);
      const sz = 4 + Math.random() * 6;
      p.fillRect(-sz/2, -sz/2, sz, sz);
      p.setPosition(px, py);
      const a = Math.random() * Math.PI * 2;
      this.scene.tweens.add({
        targets: p,
        x: px + Math.cos(a) * (60 + Math.random() * 80),
        y: py + Math.sin(a) * 40 - 40,
        alpha: 0,
        angle: Math.random() * 360,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 400 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  // ============================================================
  // ENEMY DEATH — colorful explosion based on enemy type
  // ============================================================
  spawnEnemyDeath(x: number, y: number, enemyColor: number = 0xFF6B6B): void {
    const lighterColor = Math.min(0xFFFFFF, enemyColor + 0x404040);
    const colors = [enemyColor, 0xFFD700, 0xFFFFFF, lighterColor];

    for (let i = 0; i < 18; i++) {
      const p = this.scene.add.graphics().setDepth(8);
      const c = colors[Math.floor(Math.random() * colors.length)];
      p.fillStyle(c, 0.9);
      const sz = 3 + Math.random() * 8;
      if (Math.random() > 0.5) {
        p.fillRect(-sz / 2, -sz / 2, sz, sz);
      } else {
        p.fillCircle(0, 0, sz / 2);
      }
      p.setPosition(x + (Math.random() - 0.5) * 30, y - 20 + (Math.random() - 0.5) * 30);

      const a = Math.random() * Math.PI * 2;
      const spd = 100 + Math.random() * 200;
      this.scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(a) * spd,
        y: p.y + Math.sin(a) * spd * 0.6 - 60,
        alpha: 0,
        angle: Math.random() * 540 - 270,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 450 + Math.random() * 350,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }

    // Star burst ring
    const ring = this.scene.add.graphics().setDepth(7).setPosition(x, y - 20);
    ring.lineStyle(3, enemyColor, 0.9);
    ring.strokeCircle(0, 0, 10);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 5, scaleY: 5,
      alpha: 0,
      duration: 400,
      ease: 'Power3',
      onComplete: () => ring.destroy(),
    });

    // Smoke puff
    for (let i = 0; i < 4; i++) {
      const smoke = this.scene.add.graphics().setDepth(6);
      smoke.fillStyle(0x888888, 0.35);
      smoke.fillCircle(0, 0, 10 + Math.random() * 10);
      smoke.setPosition(x + (Math.random() - 0.5) * 40, y - 30 + (Math.random() - 0.5) * 20);
      this.scene.tweens.add({
        targets: smoke,
        y: smoke.y - 40,
        scaleX: 2.5,
        scaleY: 2.5,
        alpha: 0,
        duration: 600 + Math.random() * 300,
        ease: 'Power1',
        onComplete: () => smoke.destroy(),
      });
    }
  }

  // ============================================================
  // COIN BURST — upgraded coin collect effect
  // ============================================================
  spawnCoinBurst(x: number, y: number): void {
    // Gold particles
    for (let i = 0; i < 10; i++) {
      const p = this.scene.add.graphics().setDepth(8);
      p.fillStyle(0xFFD700, 0.9);
      p.fillCircle(0, 0, 2.5 + Math.random() * 3);
      p.setPosition(x, y);

      const a = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(a) * spd,
        y: y + Math.sin(a) * spd - 20,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 350 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }

    // Shine flash
    const flash = this.scene.add.graphics().setDepth(8).setPosition(x, y);
    flash.fillStyle(0xFFFFAA, 0.85);
    flash.fillCircle(0, 0, 16);
    this.scene.tweens.add({
      targets: flash,
      scaleX: 3, scaleY: 3,
      alpha: 0,
      duration: 220,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    // Floating coin symbol
    this.spawnFloatingText(x, y - 10, '+🪙', '#FFD700', 24, true);
  }

  // ============================================================
  // COMBO EFFECT — visual burst when combos hit
  // ============================================================
  spawnComboEffect(x: number, y: number, comboCount: number): void {
    const colors: Record<number, string> = {
      2: '#FFD700',
      3: '#FF8C00',
      5: '#FF4444',
      8: '#FF00FF',
      10: '#00FFFF',
    };
    const thresholds = [10, 8, 5, 3, 2];
    const colorKey = thresholds.find(t => comboCount >= t) ?? 2;
    const color = colors[colorKey] ?? '#FFD700';

    const texts: Record<number, string> = {
      2: '×2 COMBO!',
      3: '×3 NICE!',
      5: '×5 GREAT! 🔥',
      8: '×8 AMAZING! ⚡',
      10: '×10 LEGENDARY! 💥',
    };
    const label = texts[colorKey] ?? `×${comboCount} COMBO!`;

    this.spawnFloatingText(x, y - 30, label, color, 28 + comboCount * 2, true);

    // Star burst for high combos
    if (comboCount >= 5) {
      for (let i = 0; i < comboCount * 2; i++) {
        const p = this.scene.add.graphics().setDepth(10);
        const hexColor = parseInt(color.replace('#', ''), 16);
        p.fillStyle(hexColor, 0.9);
        p.fillCircle(0, 0, 6);
        p.setPosition(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 40);

        const a = Math.random() * Math.PI * 2;
        const spd = 80 + Math.random() * 160;
        this.scene.tweens.add({
          targets: p,
          x: p.x + Math.cos(a) * spd,
          y: p.y + Math.sin(a) * spd - 50,
          alpha: 0,
          angle: Math.random() * 720,
          scaleX: 0.1,
          scaleY: 0.1,
          duration: 500 + Math.random() * 300,
          ease: 'Power2',
          onComplete: () => p.destroy(),
        });
      }
    }
  }

  // ============================================================
  // FLOATING TEXT — damage numbers, pickups, messages
  // ============================================================
  spawnFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = '#FFFFFF',
    fontSize: number = 22,
    bounce: boolean = false
  ): void {
    const txt = this.scene.add.text(x, y, text, {
      fontSize: `${fontSize}px`,
      fontFamily: 'Arial Black, Arial',
      color,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);

    if (bounce) {
      this.scene.tweens.add({
        targets: txt,
        y: y - 55,
        alpha: 0,
        scaleX: { from: 1.4, to: 0.8 },
        scaleY: { from: 1.4, to: 0.8 },
        duration: 900,
        ease: 'Power2',
        onComplete: () => txt.destroy(),
      });
    } else {
      this.scene.tweens.add({
        targets: txt,
        y: y - 40,
        alpha: 0,
        duration: 700,
        ease: 'Power2',
        onComplete: () => txt.destroy(),
      });
    }
  }

  // ============================================================
  // LEVEL COMPLETE — celebration effect
  // ============================================================
  spawnLevelCompleteEffect(cx: number, cy: number): void {
    this.scene.cameras.main.flash(300, 255, 255, 150);
    this.scene.cameras.main.shake(200, 0.008);

    // Firework bursts
    const colors = [0xFF0000, 0x00FF00, 0x0088FF, 0xFFFF00, 0xFF00FF, 0xFF8800];
    for (let burst = 0; burst < 5; burst++) {
      this.scene.time.delayedCall(burst * 180, () => {
        const bx = cx + (Math.random() - 0.5) * 300;
        const by = cy - 50 - Math.random() * 150;
        const c = colors[Math.floor(Math.random() * colors.length)];

        for (let i = 0; i < 16; i++) {
          const p = this.scene.add.graphics().setDepth(15);
          p.fillStyle(c, 0.95);
          p.fillCircle(0, 0, 3 + Math.random() * 4);
          p.setPosition(bx, by);

          const a = (i / 16) * Math.PI * 2;
          const spd = 100 + Math.random() * 180;
          this.scene.tweens.add({
            targets: p,
            x: bx + Math.cos(a) * spd,
            y: by + Math.sin(a) * spd,
            alpha: 0,
            scaleX: 0.2,
            scaleY: 0.2,
            duration: 600 + Math.random() * 400,
            ease: 'Power2',
            onComplete: () => p.destroy(),
          });
        }
      });
    }

    // Text celebration
    this.scene.time.delayedCall(200, () => {
      this.spawnFloatingText(cx, cy - 80, '🏆 רמה הושלמה!', '#FFD700', 40, true);
    });
  }

  // ============================================================
  // AMBIENT SPARKLE — twinkling on coins/goal
  // ============================================================
  spawnSparkle(x: number, y: number, color: number = 0xFFD700): void {
    if (Math.random() > 0.2) return; // throttle

    const p = this.scene.add.graphics().setDepth(4);
    p.fillStyle(color, 0.9);
    p.fillCircle(x, y, 4);

    this.scene.tweens.add({
      targets: p,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 400 + Math.random() * 300,
      ease: 'Power2',
      onComplete: () => p.destroy(),
    });
  }

  // ============================================================
  // HEAL EFFECT — green hearts rising
  // ============================================================
  spawnHealEffect(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const heart = this.scene.add.text(
        x + (Math.random() - 0.5) * 40,
        y,
        '💚',
        { fontSize: `${16 + Math.random() * 12}px` }
      ).setDepth(10).setOrigin(0.5);

      this.scene.tweens.add({
        targets: heart,
        y: y - 60 - Math.random() * 40,
        alpha: 0,
        delay: Math.random() * 300,
        duration: 800 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => heart.destroy(),
      });
    }
  }

  // ============================================================
  // STOMP SHOCKWAVE — upgraded boss stomp
  // ============================================================
  spawnStompShockwave(x: number, y: number): void {
    this.scene.cameras.main.shake(200, 0.012);

    // Multiple rings expanding outward
    for (let ring = 0; ring < 3; ring++) {
      this.scene.time.delayedCall(ring * 80, () => {
        const r = this.scene.add.graphics().setDepth(4).setPosition(x, y);
        r.lineStyle(4 - ring, 0xFF4500, 0.9 - ring * 0.25);
        r.strokeEllipse(0, 0, 20, 8);
        this.scene.tweens.add({
          targets: r,
          scaleX: 8 + ring * 2,
          scaleY: 3,
          alpha: 0,
          duration: 500 + ring * 100,
          ease: 'Power3',
          onComplete: () => r.destroy(),
        });
      });
    }

    // Ground crack lines
    for (let i = 0; i < 8; i++) {
      const line = this.scene.add.graphics().setDepth(4);
      line.lineStyle(2.5, 0xFF4500, 0.8);
      const angle = (i / 8) * Math.PI * 2;
      const len = 50 + Math.random() * 90;
      line.lineBetween(x, y, x + Math.cos(angle) * len, y + Math.sin(angle) * len * 0.25);
      this.scene.tweens.add({
        targets: line,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => line.destroy(),
      });
    }

    // Debris
    for (let i = 0; i < 8; i++) {
      const d = this.scene.add.graphics().setDepth(5);
      d.fillStyle(0x8B7355, 0.9);
      const sz = 3 + Math.random() * 6;
      d.fillRect(-sz / 2, -sz / 2, sz, sz);
      d.setPosition(x + (Math.random() - 0.5) * 60, y);

      const a = -(Math.PI * 0.3 + Math.random() * Math.PI * 0.5);
      const spd = 80 + Math.random() * 150;
      this.scene.tweens.add({
        targets: d,
        x: d.x + Math.cos(a) * spd,
        y: d.y + Math.sin(a) * spd,
        angle: Math.random() * 720,
        alpha: 0,
        duration: 600 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => d.destroy(),
      });
    }
  }

  // ============================================================
  // AMBIENT WORLD PARTICLES — world-specific atmosphere
  // ============================================================
  startWorldParticles(worldKey: string, width: number, height: number): Phaser.Time.TimerEvent[] {
    const timers: Phaser.Time.TimerEvent[] = [];

    if (worldKey === 'earth') {
      // Fireflies at night levels
      timers.push(this.scene.time.addEvent({
        delay: 1200, loop: true,
        callback: () => {
          const scrollX = this.scene.cameras.main.scrollX;
          const fx = scrollX + Math.random() * width;
          const fy = 100 + Math.random() * (height - 200);
          const fly = this.scene.add.graphics().setDepth(1);
          fly.fillStyle(0xAAFF66, 0.8);
          fly.fillCircle(fx, fy, 2);

          this.scene.tweens.add({
            targets: fly,
            x: fx + (Math.random() - 0.5) * 80,
            y: fy + (Math.random() - 0.5) * 40,
            alpha: 0,
            duration: 2000 + Math.random() * 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: 1,
            onComplete: () => fly.destroy(),
          });
        },
      }));
    }

    if (worldKey === 'water') {
      // Rising bubbles
      timers.push(this.scene.time.addEvent({
        delay: 300, loop: true,
        callback: () => {
          const scrollX = this.scene.cameras.main.scrollX;
          const bx = scrollX + Math.random() * width;
          const b = this.scene.add.graphics().setDepth(1);
          const r = 2 + Math.random() * 5;
          b.lineStyle(1.5, 0xAADDFF, 0.6);
          b.strokeCircle(bx, height - 30, r);
          b.fillStyle(0xCCEEFF, 0.15);
          b.fillCircle(bx, height - 30, r);
          this.scene.tweens.add({
            targets: b,
            y: -80,
            alpha: 0,
            x: bx + (Math.random() - 0.5) * 30,
            duration: 2000 + Math.random() * 1500,
            ease: 'Sine.easeIn',
            onComplete: () => b.destroy(),
          });
        },
      }));
    }

    if (worldKey === 'space') {
      // Shooting stars
      timers.push(this.scene.time.addEvent({
        delay: 2500, loop: true,
        callback: () => {
          const scrollX = this.scene.cameras.main.scrollX;
          const sx = scrollX + Math.random() * width;
          const sy = Math.random() * height * 0.5;
          const star = this.scene.add.graphics().setDepth(1);
          star.lineStyle(2, 0xFFFFFF, 0.9);
          star.lineBetween(sx, sy, sx + 40, sy + 20);
          this.scene.tweens.add({
            targets: star,
            x: 200, y: 100,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => star.destroy(),
          });
        },
      }));
    }

    if (worldKey === 'sky') {
      // Floating feathers
      timers.push(this.scene.time.addEvent({
        delay: 1500, loop: true,
        callback: () => {
          const scrollX = this.scene.cameras.main.scrollX;
          const fx = scrollX + Math.random() * width;
          const f = this.scene.add.graphics().setDepth(1);
          f.fillStyle(0xFFFFFF, 0.6);
          f.fillEllipse(fx, 80, 6, 18);
          this.scene.tweens.add({
            targets: f,
            y: height + 60,
            x: fx + (Math.random() - 0.5) * 150,
            angle: Math.random() * 360,
            alpha: 0,
            duration: 4000 + Math.random() * 2000,
            ease: 'Linear',
            onComplete: () => f.destroy(),
          });
        },
      }));
    }

    return timers;
  }

  // ============================================================
  // SCREEN FLASH — colored full-screen flash
  // ============================================================
  screenFlash(r: number, g: number, b: number, duration: number = 200): void {
    this.scene.cameras.main.flash(duration, r, g, b);
  }

  // ============================================================
  // DESTROY — cleanup (call when scene shuts down)
  // ============================================================
  destroy(): void {
    this.trailGfx.destroy();
    this.dustContainer.destroy();
  }
}
