// ============================================================
// entities/Player.ts  — Saba Shimon
// Premium hand-drawn character with rich detail
// Architecture: swap drawBody() for sprite when assets arrive
// ============================================================

import Phaser from 'phaser';
import { PHYSICS, PLAYER } from '../constants/physics';
import { InputState } from '../systems/InputManager';
import { WorldParams } from '../worlds/WorldConfig';

export type PlayerState =
  | 'IDLE' | 'RUN' | 'JUMP' | 'DOUBLE_JUMP'
  | 'FALL' | 'LAND' | 'DASH' | 'ATTACK' | 'HIT' | 'DEAD';

export class Player extends Phaser.GameObjects.Container {
  body!: Phaser.Physics.Arcade.Body;

  state: PlayerState = 'IDLE';
  facingRight: boolean = true;
  health: number = PLAYER.MAX_HEALTH;
  maxHealth: number = PLAYER.MAX_HEALTH;
  isInvulnerable: boolean = false;
  private invulnTimer: number = 0;
  coins: number = 0;

  // Jump system
  private jumpsLeft: number = PLAYER.MAX_JUMPS;
  private isGrounded: boolean = false;
  private wasGrounded: boolean = false;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;

  // Dash
  private dashCooldown: number = 0;
  private dashTimer: number = 0;
  isDashing: boolean = false;

  // Attack
  private hammerCooldown: number = 0;
  private isAttacking: boolean = false;
  private attackTimer: number = 0;
  private attackPhase: number = 0; // 0=swing, 1=return

  // Land
  private landTimer: number = 0;

  // Animation
  private animTime: number = 0;
  private redrawTimer: number = 0;
  private blink: number = 0;
  private blinkNext: number = 3 + Math.random() * 4;
  private runCycle: number = 0;
  private breathe: number = 0;

  // Graphics layers
  private shadowGfx!: Phaser.GameObjects.Graphics;
  private bodyGfx!: Phaser.GameObjects.Graphics;
  private faceGfx!: Phaser.GameObjects.Graphics;
  private hammerGfx!: Phaser.GameObjects.Graphics;
  private dashTrailGfx!: Phaser.GameObjects.Graphics;
  private sabaImage!: Phaser.GameObjects.Image;
  private hammerImageGfx!: Phaser.GameObjects.Graphics;

  private worldParams!: WorldParams;

  // Color palette — easy to swap for themed skins
  private readonly COLORS = {
    skin:       0xFFCCBC,
    skinShad:   0xE8A090,
    hair:       0xC8C8C8,  // Grey — Saba!
    hairShad:   0x999999,
    beard:      0xDDDDDD,
    beardShad:  0xBBBBBB,
    shirt:      0x1565C0,  // Deep blue
    shirtShad:  0x0D47A1,
    shirtHigh:  0x2196F3,
    collar:     0xFFFFFF,
    pants:      0x37474F,
    pantsShad:  0x263238,
    shoes:      0x3E2723,
    belt:       0x4E342E,
    buckle:     0xFFD700,
    hammer:     0x78909C,
    hammerShad: 0x546E7A,
    handle:     0x5D4037,
    handleShad: 0x3E2723,
  } as const;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
    body.setOffset(-PLAYER.WIDTH / 2, -PLAYER.HEIGHT / 2);
    body.setCollideWorldBounds(true);
    // Note: checkCollision.down must stay TRUE so player lands on platforms
    // Pit death is handled in GameScene.update() when player.y > screen bottom
    body.setMaxVelocityY(PHYSICS.MAX_FALL_SPEED);

    this.buildLayers();
    this.redrawAll();
  }

  private buildLayers(): void {
    this.shadowGfx   = this.scene.add.graphics();
    this.bodyGfx     = this.scene.add.graphics();
    this.faceGfx     = this.scene.add.graphics();
    this.hammerGfx   = this.scene.add.graphics();
    this.dashTrailGfx = this.scene.add.graphics();
    this.hammerImageGfx = this.scene.add.graphics();

    // Real saba_painted image — covers the procedural body
    if (this.scene.textures.exists('saba_painted')) {
      // Scale image to fit physics body: natural 192x320, want ~36x60 in game
      this.sabaImage = this.scene.add.image(0, 0, 'saba_painted');
      this.sabaImage.setScale(0.19, 0.19);
      // Align bottom of image with bottom of physics body
      // Body bottom at +24 from container center, image half-height = 320*0.19/2 ≈ 30
      this.sabaImage.setOrigin(0.5, 1.0);   // Anchor at BOTTOM center
      this.sabaImage.setPosition(0, 24);     // Bottom aligns with body bottom
      // DESTROY procedural layers when image is available — they cost CPU even when hidden
      this.shadowGfx.destroy();
      this.dashTrailGfx.destroy();
      this.bodyGfx.destroy();
      this.faceGfx.destroy();
      this.hammerImageGfx.destroy();
      // Only keep sabaImage and hammerGfx (used for attack animation)
      this.add([this.sabaImage, this.hammerGfx]);
    } else {
      // Fallback: procedural drawing
      this.add([this.shadowGfx, this.bodyGfx, this.faceGfx, this.hammerGfx, this.dashTrailGfx]);
    }

    this.hammerGfx.setVisible(false);
  }

  // ============================================================
  // DRAWING — Premium hand-crafted Saba Shimon
  // ============================================================

  private redrawAll(): void {
    // Skip if using image (graphics were destroyed)
    if (!this.bodyGfx || !this.bodyGfx.active) {
      if (this.isAttacking) this.drawHammer();
      return;
    }
    this.drawShadow();
    this.drawBody();
    this.drawFace();
    if (this.isAttacking) this.drawHammer();
  }

  private drawShadow(): void {
    if (!this.shadowGfx || !this.shadowGfx.active) return;
    const g = this.shadowGfx;
    g.clear();
    const squish = this.isGrounded ? 1.0 : 0.5;
    g.fillStyle(0x000000, 0.18 * squish);
    g.fillEllipse(0, PLAYER.HEIGHT / 2 + 3, PLAYER.WIDTH * 0.9 * squish, 8 * squish);
  }

  private drawBody(): void {
    const g = this.bodyGfx;
    g.clear();

    const W = PLAYER.WIDTH;
    const H = PLAYER.HEIGHT;
    const hx = -W / 2;
    const hy = -H / 2;

    // Squash/stretch based on state
    const sy = this.getSquashY();
    g.setScale(1, sy);

    // ---- SHOES ----
    const shoeY = hy + H - 4;
    g.fillStyle(this.COLORS.shoes);
    // Left shoe
    g.fillRoundedRect(hx + 1, shoeY, 12, 8, { tl:2, tr:2, bl:4, br:4 });
    // Right shoe
    g.fillRoundedRect(hx + W - 13, shoeY, 12, 8, { tl:2, tr:2, bl:4, br:4 });
    // Shoe shine
    g.fillStyle(0xFFFFFF, 0.15);
    g.fillRoundedRect(hx + 2, shoeY + 1, 5, 3, 2);
    g.fillRoundedRect(hx + W - 12, shoeY + 1, 5, 3, 2);

    // ---- PANTS ----
    const pantsY = hy + H * 0.60;
    const pantsH = H * 0.32;
    g.fillStyle(this.COLORS.pantsShad);
    g.fillRoundedRect(hx + 2, pantsY + 2, W - 4, pantsH, 4);
    g.fillStyle(this.COLORS.pants);
    g.fillRoundedRect(hx + 2, pantsY, W - 4, pantsH, 4);
    // Pants crease
    g.lineStyle(1, this.COLORS.pantsShad, 0.6);
    g.beginPath();
    g.moveTo(-1, pantsY + 4);
    g.lineTo(-1, pantsY + pantsH - 4);
    g.strokePath();
    g.beginPath();
    g.moveTo(3, pantsY + 4);
    g.lineTo(3, pantsY + pantsH - 4);
    g.strokePath();

    // ---- BELT ----
    const beltY = pantsY - 4;
    g.fillStyle(this.COLORS.belt);
    g.fillRoundedRect(hx + 1, beltY, W - 2, 7, 2);
    // Belt buckle (center)
    g.fillStyle(this.COLORS.buckle);
    g.fillRoundedRect(-6, beltY + 1, 12, 5, 1);
    g.lineStyle(1, 0xAA8800, 0.8);
    g.strokeRoundedRect(-6, beltY + 1, 12, 5, 1);
    g.fillStyle(0xFFFF88, 0.6);
    g.fillRect(-4, beltY + 2, 4, 2);

    // ---- SHIRT ----
    const shirtY = hy + H * 0.38;
    const shirtH = H * 0.26;
    // Shadow side
    g.fillStyle(this.COLORS.shirtShad);
    g.fillRoundedRect(hx + 2, shirtY + 2, W - 4, shirtH, { tl:4, tr:4, bl:2, br:2 });
    // Main shirt
    g.fillStyle(this.COLORS.shirt);
    g.fillRoundedRect(hx + 2, shirtY, W - 4, shirtH, { tl:4, tr:4, bl:2, br:2 });
    // Shirt highlight (top left)
    g.fillStyle(this.COLORS.shirtHigh, 0.35);
    g.fillRoundedRect(hx + 4, shirtY + 2, (W - 8) * 0.55, shirtH * 0.45, 3);
    // Button line
    g.lineStyle(1, this.COLORS.shirtShad, 0.5);
    g.beginPath(); g.moveTo(0, shirtY + 2); g.lineTo(0, shirtY + shirtH - 2); g.strokePath();
    // Buttons
    g.fillStyle(0xFFFFFF, 0.8);
    for (let bi = 0; bi < 3; bi++) {
      g.fillCircle(0, shirtY + 6 + bi * 9, 1.5);
    }
    // Collar
    g.fillStyle(this.COLORS.collar);
    g.fillTriangle(hx + W/2 - 8, shirtY, hx + W/2, shirtY + 8, hx + W/2 - 16, shirtY + 8);
    g.fillTriangle(hx + W/2 + 8, shirtY, hx + W/2, shirtY + 8, hx + W/2 + 16, shirtY + 8);

    // ---- ARMS ----
    this.drawArms(g, hx, hy, W, H);

    // ---- HEAD BASE ----
    const headCX = 0;
    const headCY = hy + H * 0.20;
    const headR = H * 0.175;

    // Neck
    g.fillStyle(this.COLORS.skinShad);
    g.fillRect(-5, headCY + headR - 4, 10, 10);
    g.fillStyle(this.COLORS.skin);
    g.fillRect(-4, headCY + headR - 5, 8, 10);

    // Head shadow
    g.fillStyle(this.COLORS.skinShad);
    g.fillCircle(headCX + 2, headCY + 2, headR);
    // Head
    g.fillStyle(this.COLORS.skin);
    g.fillCircle(headCX, headCY, headR);

    // Ear left
    g.fillStyle(this.COLORS.skinShad);
    g.fillEllipse(headCX - headR + 1, headCY + 2, 8, 10);
    g.fillStyle(this.COLORS.skin);
    g.fillEllipse(headCX - headR + 2, headCY, 7, 9);
    g.fillStyle(this.COLORS.skinShad, 0.5);
    g.fillEllipse(headCX - headR + 3, headCY, 3, 5);

    // ---- HAIR ----
    this.drawHair(g, headCX, headCY, headR);

    // ---- BEARD ----
    this.drawBeard(g, headCX, headCY, headR);
  }

  private drawArms(g: Phaser.GameObjects.Graphics, hx: number, hy: number, W: number, H: number): void {
    const shirtY = hy + H * 0.38;
    const swing = this.state === 'RUN' ? Math.sin(this.runCycle * 2) * 8 : 0;

    // Left arm
    g.fillStyle(this.COLORS.shirtShad);
    g.fillRoundedRect(hx - 4, shirtY + 2 + swing, 8, 22, 4);
    g.fillStyle(this.COLORS.shirt);
    g.fillRoundedRect(hx - 4, shirtY + swing, 8, 21, 4);
    // Left hand
    g.fillStyle(this.COLORS.skin);
    g.fillCircle(hx + 0, shirtY + 22 + swing, 5);

    // Right arm
    g.fillStyle(this.COLORS.shirtShad);
    g.fillRoundedRect(hx + W - 4, shirtY + 2 - swing, 8, 22, 4);
    g.fillStyle(this.COLORS.shirt);
    g.fillRoundedRect(hx + W - 4, shirtY - swing, 8, 21, 4);
    // Right hand
    g.fillStyle(this.COLORS.skin);
    g.fillCircle(hx + W, shirtY + 22 - swing, 5);
  }

  private drawHair(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number): void {
    // Hair cap
    g.fillStyle(this.COLORS.hairShad);
    g.fillCircle(cx + 1, cy - r * 0.1 + 1, r * 0.88);
    g.fillStyle(this.COLORS.hair);
    g.fillCircle(cx, cy - r * 0.1, r * 0.88);

    // Skin cutout for forehead
    g.fillStyle(this.COLORS.skin);
    g.fillEllipse(cx, cy + r * 0.15, r * 1.5, r * 1.0);

    // Hair texture lines
    g.lineStyle(1, this.COLORS.hairShad, 0.5);
    for (let i = 0; i < 4; i++) {
      const hx2 = cx - r * 0.5 + i * (r * 0.33);
      g.beginPath();
      g.moveTo(hx2, cy - r * 0.9);
      g.lineTo(hx2 + 2, cy - r * 0.4);
      g.strokePath();
    }

    // Side burn
    g.fillStyle(this.COLORS.hair);
    g.fillRect(cx - r + 2, cy - 2, 6, 12);
  }

  private drawBeard(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number): void {
    // Full beard — Saba style!
    g.fillStyle(this.COLORS.beardShad);
    g.fillEllipse(cx + 1, cy + r * 0.5 + 1, r * 1.6, r * 0.9);
    g.fillStyle(this.COLORS.beard);
    g.fillEllipse(cx, cy + r * 0.45, r * 1.55, r * 0.85);

    // Beard shine highlight
    g.fillStyle(0xFFFFFF, 0.2);
    g.fillEllipse(cx - r * 0.2, cy + r * 0.35, r * 0.6, r * 0.3);

    // Beard texture — light lines
    g.lineStyle(1, this.COLORS.beardShad, 0.4);
    for (let i = -2; i <= 2; i++) {
      g.beginPath();
      g.moveTo(cx + i * (r * 0.25), cy + r * 0.2);
      g.lineTo(cx + i * (r * 0.28), cy + r * 0.8);
      g.strokePath();
    }
  }

  private drawFace(): void {
    const g = this.faceGfx;
    g.clear();

    const H = PLAYER.HEIGHT;
    const hy = -H / 2;
    const headCY = hy + H * 0.20;
    const headR = H * 0.175;

    // Re-apply squash to match body
    g.setScale(1, this.getSquashY());

    // ---- EYES ----
    const eyeY = headCY - headR * 0.1;
    const eyeOffX = headR * 0.38;
    const isBlinking = this.blink > 0;

    // Eyebrows (friendly, expressive)
    const browRaise = this.state === 'JUMP' || this.state === 'FALL' ? -3 : 0;
    const browAngle = this.state === 'HIT' ? 0.3 : 0;
    g.lineStyle(2.5, 0x777777);
    // Left brow
    g.beginPath();
    g.moveTo(-eyeOffX - 5, eyeY - headR * 0.3 + browRaise);
    g.lineTo(-eyeOffX + 4, eyeY - headR * 0.25 + browRaise + browAngle * 4);
    g.strokePath();
    // Right brow
    g.beginPath();
    g.moveTo(eyeOffX - 4, eyeY - headR * 0.25 + browRaise + browAngle * 4);
    g.lineTo(eyeOffX + 5, eyeY - headR * 0.3 + browRaise);
    g.strokePath();

    if (isBlinking) {
      // Closed eyes
      g.lineStyle(2, 0x555555);
      g.beginPath(); g.moveTo(-eyeOffX - 4, eyeY); g.lineTo(-eyeOffX + 4, eyeY); g.strokePath();
      g.beginPath(); g.moveTo(eyeOffX - 4, eyeY); g.lineTo(eyeOffX + 4, eyeY); g.strokePath();
    } else {
      // Eye whites
      g.fillStyle(0xFFFFFF);
      g.fillEllipse(-eyeOffX, eyeY, 11, 10);
      g.fillEllipse(eyeOffX, eyeY, 11, 10);

      // Iris
      const irisColor = 0x5D4037; // Brown
      g.fillStyle(irisColor);
      g.fillCircle(-eyeOffX + 1, eyeY, 4);
      g.fillCircle(eyeOffX + 1, eyeY, 4);

      // Pupil
      g.fillStyle(0x111111);
      g.fillCircle(-eyeOffX + 1, eyeY, 2.5);
      g.fillCircle(eyeOffX + 1, eyeY, 2.5);

      // Eye shine
      g.fillStyle(0xFFFFFF);
      g.fillCircle(-eyeOffX + 2.5, eyeY - 1.5, 1.5);
      g.fillCircle(eyeOffX + 2.5, eyeY - 1.5, 1.5);

      // Eye lower shadow
      g.fillStyle(this.COLORS.skinShad, 0.3);
      g.fillEllipse(-eyeOffX, eyeY + 4, 9, 4);
      g.fillEllipse(eyeOffX, eyeY + 4, 9, 4);
    }

    // ---- NOSE ----
    const noseY = headCY + headR * 0.15;
    g.fillStyle(this.COLORS.skinShad);
    g.fillCircle(2, noseY + 1, 4);
    g.fillStyle(this.COLORS.skin);
    g.fillCircle(0, noseY, 4.5);
    // Nostril
    g.fillStyle(this.COLORS.skinShad, 0.6);
    g.fillCircle(-2, noseY + 1, 1.5);
    g.fillCircle(3, noseY + 1, 1.5);

    // ---- MOUTH / SMILE ----
    const mouthY = headCY + headR * 0.45;
    const smileW = this.state === 'HIT' ? 0 : 1;
    if (smileW > 0) {
      // Smile line
      g.lineStyle(2, 0x8D6E63);
      g.lineBetween(-5, mouthY, 0, mouthY + 4);
      g.lineBetween(0, mouthY + 4, 5, mouthY);
      // Teeth peek
      g.fillStyle(0xFFFFFF, 0.9);
      g.fillRoundedRect(-4, mouthY - 1, 8, 3, 1);
    } else {
      // Worried mouth
      g.lineStyle(2, 0x8D6E63);
      g.lineBetween(-5, mouthY + 3, 0, mouthY - 1);
      g.lineBetween(0, mouthY - 1, 5, mouthY + 3);
    }

    // ---- GLASSES (optional premium detail) ----
    g.lineStyle(1.5, 0x888888, 0.7);
    g.strokeRoundedRect(-eyeOffX - 6, eyeY - 5, 13, 12, 3);
    g.strokeRoundedRect(eyeOffX - 6, eyeY - 5, 13, 12, 3);
    g.beginPath();
    g.moveTo(-eyeOffX + 7, eyeY - 1);
    g.lineTo(eyeOffX - 6, eyeY - 1);
    g.strokePath();
    // Temple
    g.beginPath();
    g.moveTo(-eyeOffX - 6, eyeY - 1);
    g.lineTo(-eyeOffX - 14, eyeY - 1);
    g.strokePath();
    g.beginPath();
    g.moveTo(eyeOffX + 7, eyeY - 1);
    g.lineTo(eyeOffX + 14, eyeY - 1);
    g.strokePath();
  }

  private drawHammer(): void {
    const g = this.hammerGfx;
    g.clear();

    const phase = this.attackPhase; // 0=swing out, 1=return
    const swingAngle = phase * Math.PI * 0.6; // 0 to ~108 degrees

    // Hammer extends to the right when facing right
    const armLen = 28;
    const hammerX = Math.cos(-swingAngle) * armLen;
    const hammerY = Math.sin(-swingAngle) * armLen - 10;

    // Handle
    g.lineStyle(5, this.COLORS.handleShad);
    g.lineBetween(8, -15, hammerX + 2, hammerY + 2);
    g.lineStyle(4, this.COLORS.handle);
    g.lineBetween(8, -15, hammerX, hammerY);

    // Head shadow
    g.fillStyle(this.COLORS.hammerShad);
    g.fillRoundedRect(hammerX - 10, hammerY - 12, 22, 18, 4);
    // Head main
    g.fillStyle(this.COLORS.hammer);
    g.fillRoundedRect(hammerX - 11, hammerY - 14, 22, 18, 4);
    // Head highlight
    g.fillStyle(0xECEFF1, 0.5);
    g.fillRoundedRect(hammerX - 9, hammerY - 13, 10, 6, 3);

    // Impact flash at full swing
    if (phase > 0.8) {
      const flashAlpha = (phase - 0.8) / 0.2;
      g.fillStyle(0xFFFFFF, flashAlpha * 0.7);
      g.fillCircle(hammerX, hammerY - 5, 18 * flashAlpha);
    }
  }

  private getSquashY(): number {
    switch (this.state) {
      case 'LAND':    return 0.72;
      case 'JUMP':    return 1.18;
      case 'DOUBLE_JUMP': return 1.22;
      case 'FALL':    return 1.12;
      case 'DASH':    return 0.82;
      default:        return 1.0;
    }
  }

  // ============================================================
  // PHYSICS UPDATE
  // ============================================================

  setWorldParams(params: WorldParams): void {
    this.worldParams = params;
  }

  update(dt: number, input: InputState): void {
    if (!this.worldParams) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    this.animTime += dt;
    this.breathe = Math.sin(this.animTime * 1.5) * 0.5;

    // ---- Grounded ----
    this.wasGrounded = this.isGrounded;
    this.isGrounded = body.blocked.down;

    if (this.wasGrounded && !this.isGrounded) {
      this.coyoteTimer = PHYSICS.COYOTE_TIME;
    } else if (this.isGrounded) {
      this.coyoteTimer = 0;
      this.jumpsLeft = PLAYER.MAX_JUMPS;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // Jump buffer
    if (input.jumpJustPressed) {
      this.jumpBufferTimer = PHYSICS.JUMP_BUFFER;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // Timers
    this.invulnTimer    = Math.max(0, this.invulnTimer - dt);
    this.dashCooldown   = Math.max(0, this.dashCooldown - dt);
    this.hammerCooldown = Math.max(0, this.hammerCooldown - dt);
    this.landTimer      = Math.max(0, this.landTimer - dt);
    this.isInvulnerable = this.invulnTimer > 0;

    // Blink
    this.blinkNext -= dt;
    if (this.blinkNext <= 0) {
      this.blink = this.blink > 0 ? 0 : 0.14;
      this.blinkNext = this.blink > 0 ? 0.14 : (2.5 + Math.random() * 4);
    } else if (this.blink > 0) {
      this.blink = Math.max(0, this.blink - dt);
    }

    // Run cycle
    if (this.isGrounded && Math.abs(body.velocity.x) > 20) {
      this.runCycle += dt * (Math.abs(body.velocity.x) / 80);
    }

    // ---- Dash ----
    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      body.velocity.x = (this.facingRight ? 1 : -1) * PHYSICS.DASH_SPEED;
      body.velocity.y = 0;
      body.setGravityY(-PHYSICS.GRAVITY);
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        body.setGravityY(0);
      }
      this.updateState(body);
      this.updateVisuals();
      return;
    }

    if (input.dashJustPressed && this.dashCooldown <= 0 && this.worldParams.dashEnabled && !this.isDashing) {
      this.isDashing = true;
      this.dashTimer = PHYSICS.DASH_DURATION;
      this.dashCooldown = PHYSICS.DASH_COOLDOWN;
    }

    // ---- Hammer attack ----
    if (input.hammerJustPressed && this.hammerCooldown <= 0) {
      this.isAttacking = true;
      this.attackTimer = PHYSICS.HAMMER_COOLDOWN * 0.5;
      this.attackPhase = 0;
      this.hammerCooldown = PHYSICS.HAMMER_COOLDOWN;
      this.hammerGfx.setVisible(true);
    }
    if (this.isAttacking) {
      this.attackTimer -= dt;
      this.attackPhase = 1 - (this.attackTimer / (PHYSICS.HAMMER_COOLDOWN * 0.5));
      this.drawHammer();
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this.hammerGfx.setVisible(false);
      }
    }

    // ---- Horizontal movement ----
    const maxSpd = input.run ? PHYSICS.RUN_SPEED : PHYSICS.MAX_SPEED;
    const accel  = (this.isGrounded ? PHYSICS.ACCEL_GROUND : PHYSICS.ACCEL_AIR)
                   * this.worldParams.accelMultiplier;

    if (input.left && !input.right) {
      body.velocity.x -= accel * dt;
      this.facingRight = false;
    } else if (input.right && !input.left) {
      body.velocity.x += accel * dt;
      this.facingRight = true;
    } else {
      const friction = this.isGrounded
        ? PHYSICS.FRICTION_GROUND
        : this.worldParams.frictionAir;
      body.velocity.x *= Math.pow(friction, dt * 60);
      if (Math.abs(body.velocity.x) < 4) body.velocity.x = 0;
    }

    body.velocity.x = Phaser.Math.Clamp(body.velocity.x, -maxSpd, maxSpd);

    // ---- Jump ----
    const canJump = this.isGrounded || this.coyoteTimer > 0;

    if (this.jumpBufferTimer > 0 && canJump && this.jumpsLeft > 0) {
      body.velocity.y = PHYSICS.JUMP_FORCE * this.worldParams.jumpMultiplier;
      this.jumpsLeft--;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
    } else if (input.jumpJustPressed && !canJump && this.jumpsLeft > 0 && this.worldParams.doubleJumpEnabled) {
      body.velocity.y = PHYSICS.DOUBLE_JUMP_FORCE * this.worldParams.jumpMultiplier;
      this.jumpsLeft--;
      this.state = 'DOUBLE_JUMP';
    }

    // Variable jump height
    if (!input.jumpHeld && body.velocity.y < 0) {
      body.velocity.y += PHYSICS.GRAVITY * (1 - PHYSICS.JUMP_HOLD_GRAVITY) * dt;
    }

    // Extra fall gravity
    if (body.velocity.y > 0) {
      body.velocity.y += PHYSICS.GRAVITY * (PHYSICS.FALL_GRAVITY - 1) * dt;
    }

    body.velocity.y = Math.min(body.velocity.y, this.worldParams.maxFallSpeed);

    // Land detection
    if (!this.wasGrounded && this.isGrounded) {
      this.landTimer = 0.1;
      if (this.jumpBufferTimer > 0) {
        body.velocity.y = PHYSICS.JUMP_FORCE * this.worldParams.jumpMultiplier;
        this.jumpBufferTimer = 0;
        this.jumpsLeft = Math.max(0, this.jumpsLeft - 1);
      }
    }

    this.updateState(body);
    this.updateVisuals();
  }

  private updateState(body: Phaser.Physics.Arcade.Body): void {
    if (this.isDashing)           this.state = 'DASH';
    else if (this.isAttacking)    this.state = 'ATTACK';
    else if (!this.isGrounded)    this.state = body.velocity.y < 0 ? 'JUMP' : 'FALL';
    else if (this.landTimer > 0)  this.state = 'LAND';
    else if (Math.abs(body.velocity.x) > 20) this.state = 'RUN';
    else                          this.state = 'IDLE';
  }

  private updateVisuals(): void {
    // Direction flip
    this.setScale(this.facingRight ? 1 : -1, 1);

    // Invulnerability flash
    if (this.isInvulnerable) {
      const flash = Math.sin(Date.now() * 0.03) > 0;
      this.setAlpha(flash ? 0.35 : 1.0);
    } else {
      this.setAlpha(1.0);
    }

    // Image-based animation — squash/stretch + bob
    if (this.sabaImage) {
      const bob = Math.sin(this.animTime * 6) * 2;
      const squishX = this.state === 'LAND' ? 1.25 : 1.0;
      const squishY = this.state === 'LAND' ? 0.78 : (this.state === 'JUMP' ? 1.12 : 1.0);
      const runBob = this.state === 'RUN' ? bob : 0;
      this.sabaImage.setPosition(0, 24 + runBob);
      this.sabaImage.setScale(squishX * 0.19, squishY * 0.19);
      if (this.state === 'HIT') {
        this.sabaImage.setTint(0xFF4444);
      } else if (this.isDashing) {
        this.sabaImage.setTint(0x88CCFF);
      } else {
        this.sabaImage.clearTint();
      }
      // Only draw hammer when attacking
      if (this.isAttacking) this.drawHammer();
    } else {
      // Fallback: full procedural redraw (throttled to 20fps)
      this.redrawTimer += 0.016;
      if (this.redrawTimer >= 0.05) {
        this.redrawTimer = 0;
        this.redrawAll();
      }
    }
  }

  // ============================================================
  // GAMEPLAY METHODS
  // ============================================================

  takeDamage(amount: number = 1): void {
    if (this.isInvulnerable || this.isDashing) return;
    this.health = Math.max(0, this.health - amount);
    this.isInvulnerable = true;
    this.invulnTimer = PHYSICS.INVULN_DURATION;
    this.state = 'HIT';
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.velocity.y = -400;
    body.velocity.x = this.facingRight ? -220 : 220;
  }

  collectCoin(): void { this.coins++; }
  isDead(): boolean   { return this.health <= 0; }

  getHammerHitbox(): Phaser.Geom.Rectangle | null {
    if (!this.isAttacking) return null;
    const dir = this.facingRight ? 1 : -1;
    return new Phaser.Geom.Rectangle(
      this.x + dir * 12, this.y - 28, 36, 30
    );
  }
}
