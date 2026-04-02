// ============================================================
// entities/Boss.ts — Stone Giant (Level 10 Boss)
// 3-phase AI: Patrol → Rage → Berserk
// ============================================================

import Phaser from 'phaser';

export type BossPhase = 1 | 2 | 3;
export type BossState =
  | 'IDLE' | 'WALK' | 'CHARGE' | 'STOMP'
  | 'THROW' | 'ROAR' | 'HIT' | 'DEAD';

export interface BossRock {
  gfx: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  size: number;
  active: boolean;
}

export class Boss extends Phaser.GameObjects.Container {
  body!: Phaser.Physics.Arcade.Body;

  // Stats
  maxHealth: number;
  health: number;
  phase: BossPhase = 1;
  state: BossState = 'IDLE';
  facingRight: boolean = false;

  // AI timers
  private stateTimer: number = 0;
  private actionCooldown: number = 0;
  private attackWarning: boolean = false;
  private warningTimer: number = 0;

  // Phase thresholds (% health)
  private readonly PHASE2_HP = 0.65;
  private readonly PHASE3_HP = 0.30;

  // Graphics layers
  private bodyGfx!: Phaser.GameObjects.Graphics;
  private faceGfx!: Phaser.GameObjects.Graphics;
  private shadowGfx!: Phaser.GameObjects.Graphics;
  private glowGfx!: Phaser.GameObjects.Graphics;
  private healthBarGfx!: Phaser.GameObjects.Graphics;

  // Projectiles
  rocks: BossRock[] = [];

  // Animation
  private animTime: number = 0;
  private hitFlash: number = 0;
  private roarScale: number = 1;
  private shakeX: number = 0;

  // Physics proxy
  physRect!: Phaser.GameObjects.Rectangle;

  // Events
  onDeath?: () => void;
  onPhaseChange?: (phase: BossPhase) => void;
  onRockThrown?: (x: number, y: number, vx: number, vy: number) => void;
  onStomp?: (x: number, y: number) => void;

  // Patrol
  private patrolStartX: number;
  private readonly PATROL_RANGE = 300;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxHealth = 30;
    this.health    = this.maxHealth;
    this.patrolStartX = x;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(72, 120);
    body.setOffset(-36, -120);
    body.setCollideWorldBounds(true);
    body.setMaxVelocityY(800);
    body.setGravityY(800);

    this.buildLayers();
    this.setDepth(6);
  }

  private buildLayers(): void {
    this.shadowGfx   = this.scene.add.graphics();
    this.glowGfx     = this.scene.add.graphics();
    this.bodyGfx     = this.scene.add.graphics();
    this.faceGfx     = this.scene.add.graphics();
    this.healthBarGfx = this.scene.add.graphics();
    this.add([this.shadowGfx, this.glowGfx, this.bodyGfx, this.faceGfx, this.healthBarGfx]);
  }

  // ============================================================
  // DRAWING — Stone Giant
  // ============================================================

  private getPhaseColors(): { stone: number; stoneDark: number; stoneLight: number; crack: number; eye: number; glow: number } {
    switch (this.phase) {
      case 1: return { stone: 0x78909C, stoneDark: 0x546E7A, stoneLight: 0xB0BEC5, crack: 0x37474F, eye: 0xFFEB3B, glow: 0x00000000 };
      case 2: return { stone: 0x8D6E63, stoneDark: 0x6D4C41, stoneLight: 0xBCAAA4, crack: 0x4E342E, eye: 0xFF6F00, glow: 0xFF8C00 };
      case 3: return { stone: 0xB71C1C, stoneDark: 0x7F0000, stoneLight: 0xEF9A9A, crack: 0x000000, eye: 0xFF1744, glow: 0xFF1744 };
    }
  }

  private redraw(): void {
    const C = this.getPhaseColors();
    const t = this.animTime;
    const W = 72, H = 120;
    const hx = -W / 2, hy = -H;

    // ---- SHADOW ----
    this.shadowGfx.clear();
    const shadowScale = this.state === 'CHARGE' ? 1.3 : 1.0;
    this.shadowGfx.fillStyle(0x000000, 0.25 * shadowScale);
    this.shadowGfx.fillEllipse(0, 4, W * 1.1 * shadowScale, 18);

    // ---- PHASE GLOW (2 and 3) ----
    this.glowGfx.clear();
    if (this.phase >= 2) {
      const glowAlpha = (0.12 + Math.sin(t * 3) * 0.06) * (this.phase === 3 ? 1.8 : 1.0);
      for (let r = 4; r >= 0; r--) {
        this.glowGfx.fillStyle(C.glow, glowAlpha * (1 - r * 0.15));
        this.glowGfx.fillEllipse(this.shakeX, hy + H / 2, W + r * 20, H + r * 24);
      }
    }

    this.bodyGfx.clear();
    this.bodyGfx.setX(this.shakeX);

    // ---- FEET ----
    this.bodyGfx.fillStyle(C.stoneDark);
    this.bodyGfx.fillRoundedRect(hx + 4, hy + H - 18, 28, 22, { tl:2, tr:4, bl:8, br:8 });
    this.bodyGfx.fillRoundedRect(hx + W - 30, hy + H - 18, 28, 22, { tl:4, tr:2, bl:8, br:8 });
    this.bodyGfx.fillStyle(C.stone);
    this.bodyGfx.fillRoundedRect(hx + 4, hy + H - 20, 28, 20, { tl:2, tr:4, bl:8, br:8 });
    this.bodyGfx.fillRoundedRect(hx + W - 30, hy + H - 20, 28, 20, { tl:4, tr:2, bl:8, br:8 });
    // Toenails
    this.bodyGfx.fillStyle(C.stoneLight, 0.6);
    for (let i = 0; i < 3; i++) {
      this.bodyGfx.fillRect(hx + 6 + i * 8, hy + H - 6, 6, 5);
      this.bodyGfx.fillRect(hx + W - 28 + i * 8, hy + H - 6, 6, 5);
    }

    // ---- LEGS ----
    const legSwing = this.state === 'WALK' ? Math.sin(t * 6) * 5 : 0;
    this.bodyGfx.fillStyle(C.stoneDark);
    this.bodyGfx.fillRoundedRect(hx + 6, hy + H * 0.62 + 2, 24, H * 0.32, 6);
    this.bodyGfx.fillRoundedRect(hx + W - 28, hy + H * 0.62 - legSwing + 2, 24, H * 0.32, 6);
    this.bodyGfx.fillStyle(C.stone);
    this.bodyGfx.fillRoundedRect(hx + 6, hy + H * 0.62, 24, H * 0.32, 6);
    this.bodyGfx.fillRoundedRect(hx + W - 28, hy + H * 0.62 - legSwing, 24, H * 0.32, 6);

    // ---- BODY (torso) ----
    const breathe = Math.sin(t * 1.4) * (this.phase === 3 ? 4 : 2);
    this.bodyGfx.fillStyle(C.stoneDark);
    this.bodyGfx.fillRoundedRect(hx + 2, hy + H * 0.26 + 2, W - 2, H * 0.40 + breathe, 8);
    this.bodyGfx.fillStyle(C.stone);
    this.bodyGfx.fillRoundedRect(hx + 2, hy + H * 0.26, W - 2, H * 0.40 + breathe, 8);
    // Belly highlight
    this.bodyGfx.fillStyle(C.stoneLight, 0.25);
    this.bodyGfx.fillRoundedRect(hx + 10, hy + H * 0.28, W * 0.45, H * 0.18, 6);

    // Stone texture — cracks on body
    this.bodyGfx.lineStyle(1.5, C.crack, 0.6);
    this.bodyGfx.lineBetween(hx + 20, hy + H * 0.30, hx + 14, hy + H * 0.45);
    this.bodyGfx.lineBetween(hx + 14, hy + H * 0.45, hx + 22, hy + H * 0.52);
    this.bodyGfx.lineBetween(hx + 44, hy + H * 0.32, hx + 50, hy + H * 0.44);
    this.bodyGfx.lineBetween(hx + 50, hy + H * 0.44, hx + 42, hy + H * 0.56);
    if (this.phase >= 2) {
      // Extra cracks in phase 2+
      this.bodyGfx.lineBetween(hx + 30, hy + H * 0.34, hx + 38, hy + H * 0.50);
      this.bodyGfx.lineBetween(hx + 18, hy + H * 0.55, hx + 30, hy + H * 0.62);
    }

    // ---- ARMS ----
    this.drawArms(C, t, hx, hy, W, H, breathe);

    // ---- HEAD ----
    const headBob = this.state === 'WALK' ? Math.sin(t * 6) * 3 : 0;
    const headY   = hy + H * 0.12 + headBob;
    const headW   = 60, headH = 52;

    // Head shadow
    this.bodyGfx.fillStyle(C.stoneDark);
    this.bodyGfx.fillRoundedRect(-headW/2 + 2, headY + 2, headW, headH, 10);
    // Head
    this.bodyGfx.fillStyle(C.stone);
    this.bodyGfx.fillRoundedRect(-headW/2, headY, headW, headH, 10);
    // Brow ridge
    this.bodyGfx.fillStyle(C.stoneDark);
    this.bodyGfx.fillRoundedRect(-headW/2, headY, headW, 14, { tl:10, tr:10, bl:0, br:0 });
    this.bodyGfx.fillStyle(C.stoneLight, 0.2);
    this.bodyGfx.fillRoundedRect(-headW/2 + 4, headY + 2, headW - 8, 6, 4);

    // Head cracks
    this.bodyGfx.lineStyle(1.5, C.crack, 0.7);
    this.bodyGfx.lineBetween(-8, headY + 5, -4, headY + 22);
    this.bodyGfx.lineBetween(-4, headY + 22, -10, headY + 35);
    if (this.phase >= 3) {
      this.bodyGfx.lineStyle(2, C.crack, 0.9);
      this.bodyGfx.lineBetween(12, headY + 8, 8, headY + 30);
      this.bodyGfx.lineBetween(-20, headY + 14, -14, headY + 28);
    }

    // ---- HORNS ----
    this.bodyGfx.fillStyle(C.stoneDark);
    this.bodyGfx.fillTriangle(-headW/2 + 8, headY, -headW/2 + 2, headY - 22, -headW/2 + 18, headY);
    this.bodyGfx.fillTriangle(headW/2 - 8, headY, headW/2 - 2, headY - 22, headW/2 - 18, headY);
    this.bodyGfx.fillStyle(C.stone);
    this.bodyGfx.fillTriangle(-headW/2 + 8, headY, -headW/2 + 4, headY - 18, -headW/2 + 17, headY);
    this.bodyGfx.fillTriangle(headW/2 - 8, headY, headW/2 - 4, headY - 18, headW/2 - 17, headY);

    // ---- FACE ----
    this.faceGfx.clear();
    this.faceGfx.setX(this.shakeX);
    this.drawFace(C, headY, headW, t);

    // ---- HEALTH BAR (floating above) ----
    this.healthBarGfx.clear();
    this.drawFloatingHealthBar();
  }

  private drawArms(C: ReturnType<typeof this.getPhaseColors>, t: number, hx: number, hy: number, W: number, H: number, breathe: number): void {
    const armRaise = this.state === 'ROAR' ? -30 :
                     this.state === 'CHARGE' ? -15 :
                     this.state === 'STOMP' ? Math.sin(t * 8) * 20 : 0;
    const armSwing = this.state === 'WALK' ? Math.sin(t * 6) * 12 : 0;

    // Left arm
    this.bodyGfx.fillStyle(C.stoneDark);
    this.bodyGfx.fillRoundedRect(hx - 18, hy + H * 0.26 + breathe + 2, 22, 54, 11);
    this.bodyGfx.fillStyle(C.stone);
    this.bodyGfx.fillRoundedRect(hx - 18, hy + H * 0.26 + breathe + armSwing + armRaise, 22, 54, 11);
    // Left fist
    this.bodyGfx.fillStyle(C.stoneDark);
    this.bodyGfx.fillCircle(hx - 7, hy + H * 0.26 + breathe + armSwing + armRaise + 58, 14);
    this.bodyGfx.fillStyle(C.stone);
    this.bodyGfx.fillCircle(hx - 7, hy + H * 0.26 + breathe + armSwing + armRaise + 56, 14);
    // Knuckle lines
    this.bodyGfx.lineStyle(1.5, C.crack, 0.5);
    for (let k = 0; k < 3; k++) {
      this.bodyGfx.lineBetween(hx - 16 + k * 5, hy + H * 0.26 + breathe + armSwing + armRaise + 50, hx - 16 + k * 5, hy + H * 0.26 + breathe + armSwing + armRaise + 62);
    }

    // Right arm
    this.bodyGfx.fillStyle(C.stoneDark);
    this.bodyGfx.fillRoundedRect(hx + W - 4, hy + H * 0.26 + breathe + 2, 22, 54, 11);
    this.bodyGfx.fillStyle(C.stone);
    this.bodyGfx.fillRoundedRect(hx + W - 4, hy + H * 0.26 + breathe - armSwing + armRaise, 22, 54, 11);
    // Right fist
    this.bodyGfx.fillStyle(C.stoneDark);
    this.bodyGfx.fillCircle(hx + W + 7, hy + H * 0.26 + breathe - armSwing + armRaise + 58, 14);
    this.bodyGfx.fillStyle(C.stone);
    this.bodyGfx.fillCircle(hx + W + 7, hy + H * 0.26 + breathe - armSwing + armRaise + 56, 14);
  }

  private drawFace(C: ReturnType<typeof this.getPhaseColors>, headY: number, headW: number, t: number): void {
    const g = this.faceGfx;
    const eyeY = headY + 20;

    // ---- EYES ----
    const eyeGlow = 0.7 + Math.sin(t * 4) * 0.3;
    const eyeSize = this.state === 'ROAR' || this.state === 'CHARGE' ? 10 : 8;

    // Eye sockets
    g.fillStyle(0x000000, 0.8);
    g.fillEllipse(-14, eyeY, eyeSize * 2.4, eyeSize * 2.2);
    g.fillEllipse(14, eyeY, eyeSize * 2.4, eyeSize * 2.2);

    // Eye glow outer
    if (this.phase >= 2) {
      for (let r = 2; r >= 0; r--) {
        g.fillStyle(C.eye, eyeGlow * 0.15 * (3 - r));
        g.fillCircle(-14, eyeY, eyeSize + r * 4);
        g.fillCircle(14, eyeY, eyeSize + r * 4);
      }
    }

    // Eye iris
    g.fillStyle(C.eye, eyeGlow);
    g.fillCircle(-14, eyeY, eyeSize);
    g.fillCircle(14, eyeY, eyeSize);

    // Pupil slit (reptilian)
    g.fillStyle(0x000000, 0.9);
    g.fillEllipse(-14, eyeY, 3, eyeSize * 1.8);
    g.fillEllipse(14, eyeY, 3, eyeSize * 1.8);

    // Eye shine
    g.fillStyle(0xFFFFFF, 0.6);
    g.fillCircle(-12, eyeY - 3, 2.5);
    g.fillCircle(16, eyeY - 3, 2.5);

    // ---- NOSE ----
    g.fillStyle(0x000000, 0.5);
    g.fillEllipse(-5, headY + 36, 7, 6);
    g.fillEllipse(5, headY + 36, 7, 6);

    // ---- MOUTH ----
    const mouthOpen = this.state === 'ROAR' ? 18 :
                      this.state === 'CHARGE' ? 10 : 5;
    const mouthY2 = headY + 44;

    // Outer mouth shadow
    g.fillStyle(0x000000, 0.9);
    g.fillRoundedRect(-22, mouthY2 - mouthOpen * 0.4, 44, mouthOpen + 4, 4);

    // Upper teeth
    g.fillStyle(0xE0E0E0);
    for (let i = 0; i < 4; i++) {
      g.fillTriangle(-18 + i * 10, mouthY2, -14 + i * 10, mouthY2, -16 + i * 10, mouthY2 + 6);
    }

    // Lower teeth
    g.fillStyle(0xBDBDBD);
    for (let i = 0; i < 3; i++) {
      g.fillTriangle(-14 + i * 10, mouthY2 + mouthOpen, -10 + i * 10, mouthY2 + mouthOpen, -12 + i * 10, mouthY2 + mouthOpen - 5);
    }

    // Tongue (visible when mouth open)
    if (mouthOpen > 8) {
      g.fillStyle(0xC62828);
      g.fillEllipse(0, mouthY2 + mouthOpen * 0.5, 20, 8);
    }

    // Hit flash overlay
    if (this.hitFlash > 0) {
      g.fillStyle(0xFFFFFF, this.hitFlash);
      g.fillRoundedRect(-headW/2, headY, headW, 52, 10);
    }
  }

  private drawFloatingHealthBar(): void {
    const g = this.healthBarGfx;
    const pct = this.health / this.maxHealth;
    const BW = 100, BH = 10;
    const bx = -BW / 2, by = -140;

    // Background
    g.fillStyle(0x000000, 0.7);
    g.fillRoundedRect(bx - 2, by - 2, BW + 4, BH + 4, 5);

    // Bar bg
    g.fillStyle(0x333333);
    g.fillRoundedRect(bx, by, BW, BH, 4);

    // Health fill — color by phase
    const barColor = pct > 0.65 ? 0x4CAF50 : pct > 0.30 ? 0xFF9800 : 0xF44336;
    g.fillStyle(barColor);
    g.fillRoundedRect(bx, by, BW * pct, BH, 4);

    // Shine
    g.fillStyle(0xFFFFFF, 0.2);
    g.fillRoundedRect(bx, by, BW * pct, BH / 2, { tl:4, tr:4, bl:0, br:0 });

    // Border
    g.lineStyle(1, 0x888888, 0.8);
    g.strokeRoundedRect(bx, by, BW, BH, 4);

    // Phase markers
    g.lineStyle(1.5, 0xFFFFFF, 0.6);
    g.lineBetween(bx + BW * this.PHASE2_HP, by, bx + BW * this.PHASE2_HP, by + BH);
    g.lineBetween(bx + BW * this.PHASE3_HP, by, bx + BW * this.PHASE3_HP, by + BH);
  }

  // ============================================================
  // AI BRAIN
  // ============================================================

  update(dt: number, playerX: number, playerY: number): void {
    this.animTime += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt * 4);
    this.stateTimer  -= dt;
    this.actionCooldown -= dt;

    // Shake (hit effect)
    this.shakeX = this.hitFlash > 0.3 ? (Math.random() - 0.5) * 6 : 0;

    // Phase check
    const hpPct = this.health / this.maxHealth;
    if (hpPct <= this.PHASE3_HP && this.phase < 3) this.enterBossPhase(3);
    else if (hpPct <= this.PHASE2_HP && this.phase < 2) this.enterBossPhase(2);

    if (this.state === 'DEAD') { this.redraw(); return; }

    const body = this.physRect.body as Phaser.Physics.Arcade.Body;
    // Sync container position to physics rect
    this.setPosition(this.physRect.x, this.physRect.y);
    const dx = playerX - this.x;
    const dist = Math.abs(dx);

    this.facingRight = dx > 0;
    this.setScale(this.facingRight ? 1 : -1, 1);

    // ---- State machine ----
    switch (this.state) {
      case 'IDLE':
        body.velocity.x = 0;
        if (this.stateTimer <= 0) {
          if (dist < 500) this.setBossState('WALK', 1.5 + Math.random());
          else this.setBossState('WALK', 2.0);
        }
        break;

      case 'WALK': {
        const spd = this.phase === 3 ? 140 : this.phase === 2 ? 100 : 70;
        body.velocity.x = Math.sign(dx) * spd;
        if (this.stateTimer <= 0 || dist < 80) {
          this.decideNextAction(dist, playerY);
        }
        break;
      }

      case 'CHARGE': {
        const spd = this.phase === 3 ? 420 : 300;
        body.velocity.x = Math.sign(dx) * spd;
        if (this.stateTimer <= 0) {
          body.velocity.x = 0;
          this.setBossState('IDLE', 0.8);
        }
        break;
      }

      case 'STOMP':
        body.velocity.x = 0;
        if (this.stateTimer <= 0) {
          this.onStomp?.(this.x, this.y);
          this.setBossState('IDLE', 1.0);
        }
        break;

      case 'THROW':
        body.velocity.x = 0;
        if (this.stateTimer <= 0) {
          this.throwRock(playerX, playerY);
          this.setBossState('IDLE', 0.6);
        }
        break;

      case 'ROAR':
        body.velocity.x = 0;
        this.roarScale = 1 + Math.sin(this.animTime * 12) * 0.04;
        this.setScale((this.facingRight ? 1 : -1) * this.roarScale, this.roarScale);
        if (this.stateTimer <= 0) this.setBossState('WALK', 0.5);
        break;

      case 'HIT':
        body.velocity.x *= 0.85;
        if (this.stateTimer <= 0) this.setBossState('IDLE', 0.3);
        break;
    }

    // Update rocks
    this.updateRocks(dt);

    this.redraw();
  }

  private decideNextAction(dist: number, _playerY: number): void {
    if (this.actionCooldown > 0) {
      this.setBossState('IDLE', 0.5);
      return;
    }

    const roll = Math.random();

    if (this.phase === 3) {
      // Phase 3 — aggressive
      if (roll < 0.35) this.setBossState('CHARGE', 0.7);
      else if (roll < 0.55) this.setBossState('STOMP', 0.6);
      else if (roll < 0.75) this.setBossState('THROW', 0.5);
      else if (roll < 0.85) this.setBossState('ROAR', 1.0);
      else this.setBossState('WALK', 1.0);
      this.actionCooldown = 0.4;
    } else if (this.phase === 2) {
      if (dist < 120 && roll < 0.4) this.setBossState('STOMP', 0.7);
      else if (roll < 0.3) this.setBossState('CHARGE', 0.8);
      else if (roll < 0.5) this.setBossState('THROW', 0.6);
      else this.setBossState('WALK', 1.5);
      this.actionCooldown = 0.6;
    } else {
      // Phase 1 — cautious
      if (dist < 100 && roll < 0.3) this.setBossState('STOMP', 0.8);
      else if (roll < 0.2) this.setBossState('THROW', 0.8);
      else this.setBossState('WALK', 2.0);
      this.actionCooldown = 1.0;
    }
  }

  private setBossState(newState: BossState, duration: number): void {
    this.state = newState;
    this.stateTimer = duration;
  }

  private enterBossPhase(phase: BossPhase): void {
    this.phase = phase;
    this.setBossState('ROAR', phase === 3 ? 2.0 : 1.5);
    this.onPhaseChange?.(phase);
  }

  private throwRock(targetX: number, targetY: number): void {
    const startX = this.x + (this.facingRight ? 50 : -50);
    const startY = this.y - 80;
    const dist = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
    const time = dist / 480;
    const vx = (targetX - startX) / time;
    const vy = (targetY - startY) / time - 0.5 * 980 * time;

    const gfx = this.scene.add.graphics().setDepth(7);
    const size = this.phase === 3 ? 14 : 10;

    const rock: BossRock = {
      gfx, x: startX, y: startY,
      vx, vy: Math.min(vy, -300),
      rotation: 0, rotSpeed: (Math.random() - 0.5) * 12,
      size, active: true,
    };
    this.rocks.push(rock);
    this.onRockThrown?.(startX, startY, vx, rock.vy);
  }

  private updateRocks(dt: number): void {
    const H = this.scene.scale.height;
    for (const rock of this.rocks) {
      if (!rock.active) continue;
      rock.vy += 980 * dt;
      rock.x  += rock.vx * dt;
      rock.y  += rock.vy * dt;
      rock.rotation += rock.rotSpeed * dt;

      if (rock.y > H + 100) { rock.active = false; rock.gfx.destroy(); continue; }

      this.drawRock(rock);
    }
    this.rocks = this.rocks.filter(r => r.active);
  }

  private drawRock(rock: BossRock): void {
    const g = rock.gfx;
    g.clear();
    g.setPosition(rock.x, rock.y);
    g.setRotation(rock.rotation);

    const s = rock.size;
    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(2, 2, s * 2.2, s * 1.6);
    // Rock body (irregular polygon)
    g.fillStyle(0x78909C);
    g.fillRect(-s, -s * 0.7, s * 2, s * 1.4);
    g.fillStyle(0x546E7A);
    g.fillRect(-s + 2, -s * 0.7 + 2, s * 2 - 4, s * 1.4 - 4);
    // Highlight
    g.fillStyle(0xB0BEC5, 0.5);
    g.fillRect(-s + 3, -s * 0.6, s * 0.6, s * 0.4);
    // Cracks
    g.lineStyle(1, 0x37474F, 0.7);
    g.lineBetween(-s * 0.3, -s * 0.4, s * 0.1, s * 0.2);
    g.lineBetween(s * 0.1, s * 0.2, s * 0.4, -s * 0.1);
  }

  // ============================================================
  // DAMAGE / DEATH
  // ============================================================

  takeDamage(amount: number): void {
    if (this.state === 'DEAD') return;
    this.health = Math.max(0, this.health - amount);
    this.hitFlash = 0.8;
    this.setBossState('HIT', 0.25);

    const dmgBody = this.physRect.body as Phaser.Physics.Arcade.Body;
    dmgBody.velocity.x = (this.facingRight ? -1 : 1) * 150;

    if (this.health <= 0) this.die();
  }

  private die(): void {
    this.setBossState('DEAD', 999);
    const dieBody = this.physRect.body as Phaser.Physics.Arcade.Body;
    dieBody.velocity.x = 0;
    dieBody.velocity.y = -400;

    // Death animation
    this.scene.tweens.add({
      targets: this,
      angle: this.facingRight ? 80 : -80,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => {
        this.onDeath?.();
        this.destroy();
      }
    });
  }

  getRockBodies(): Array<{ x: number; y: number; size: number }> {
    return this.rocks.filter(r => r.active).map(r => ({ x: r.x, y: r.y, size: r.size }));
  }
}
