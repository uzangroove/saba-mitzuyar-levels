// ============================================================
// systems/TouchControls.ts
// Virtual joystick + action buttons for mobile/tablet
// Works alongside keyboard — zero impact on desktop
// ============================================================

import Phaser from 'phaser';

export interface TouchState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  dash: boolean;
  dashJustPressed: boolean;
  hammer: boolean;
  hammerJustPressed: boolean;
}

export class TouchControls {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;

  // Joystick
  private joystickBase!: Phaser.GameObjects.Graphics;
  private joystickThumb!: Phaser.GameObjects.Graphics;
  private joystickPointer: Phaser.Input.Pointer | null = null;
  private joystickCenter = { x: 0, y: 0 };
  private joystickRadius = 60;
  private joystickDelta = { x: 0, y: 0 };

  // Button states
  private btnJump = false;
  private btnDash = false;
  private btnHammer = false;

  // Previous frame for justPressed
  private prevJump = false;
  private prevDash = false;
  private prevHammer = false;

  // Button pointers
  private jumpPointer: number | null = null;
  private dashPointer: number | null = null;
  private hammerPointer: number | null = null;

  // Visibility
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.build();
  }

  private build(): void {
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;

    this.container = this.scene.add.container(0, 0).setDepth(100).setScrollFactor(0);

    // ── Joystick (bottom-left) ──
    const jx = 110, jy = H - 120;
    this.joystickCenter = { x: jx, y: jy };

    this.joystickBase = this.scene.add.graphics();
    this.joystickBase.fillStyle(0x000000, 0.25);
    this.joystickBase.fillCircle(0, 0, this.joystickRadius + 10);
    this.joystickBase.lineStyle(3, 0xFFFFFF, 0.35);
    this.joystickBase.strokeCircle(0, 0, this.joystickRadius + 10);
    this.joystickBase.setPosition(jx, jy);

    this.joystickThumb = this.scene.add.graphics();
    this.joystickThumb.fillStyle(0xFFFFFF, 0.7);
    this.joystickThumb.fillCircle(0, 0, 28);
    this.joystickThumb.lineStyle(3, 0xFFFFFF, 0.9);
    this.joystickThumb.strokeCircle(0, 0, 28);
    this.joystickThumb.setPosition(jx, jy);

    // Directional arrows on base
    const arrowGfx = this.scene.add.graphics();
    arrowGfx.fillStyle(0xFFFFFF, 0.4);
    // Left arrow
    arrowGfx.fillTriangle(jx - 48, jy, jx - 35, jy - 10, jx - 35, jy + 10);
    // Right arrow
    arrowGfx.fillTriangle(jx + 48, jy, jx + 35, jy - 10, jx + 35, jy + 10);

    this.container.add([this.joystickBase, arrowGfx, this.joystickThumb]);

    // ── Action Buttons (bottom-right) ──
    const btnY = H - 100;
    const btnConfigs = [
      { id: 'jump',   x: W - 80,  y: btnY - 60, label: '↑',  color: 0x22CC55, size: 52 },
      { id: 'hammer', x: W - 165, y: btnY,       label: '🔨', color: 0xFF6622, size: 48 },
      { id: 'dash',   x: W - 80,  y: btnY + 30,  label: '💨', color: 0x2288FF, size: 48 },
    ];

    for (const cfg of btnConfigs) {
      const bg = this.scene.add.graphics();
      bg.fillStyle(cfg.color, 0.75);
      bg.fillCircle(0, 0, cfg.size / 2);
      bg.lineStyle(3, 0xFFFFFF, 0.6);
      bg.strokeCircle(0, 0, cfg.size / 2);
      bg.setPosition(cfg.x, cfg.y);
      bg.setName(`btn_bg_${cfg.id}`);

      const label = this.scene.add.text(cfg.x, cfg.y, cfg.label, {
        fontSize: '22px', color: '#FFFFFF',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setName(`btn_lbl_${cfg.id}`);

      this.container.add([bg, label]);
    }

    // ── Pause button (top-right) ──
    const pauseBg = this.scene.add.graphics();
    pauseBg.fillStyle(0x000000, 0.4);
    pauseBg.fillRoundedRect(0, 0, 52, 36, 10);
    pauseBg.setPosition(W - 62, 10);

    const pauseLbl = this.scene.add.text(W - 36, 28, '⏸', {
      fontSize: '18px', color: '#FFFFFF'
    }).setOrigin(0.5);

    this.container.add([pauseBg, pauseLbl]);

    // ── Touch event listeners ──
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup',   this.onPointerUp,   this);
    this.scene.input.on('pointerupoutside', this.onPointerUp, this);

    // Initially hidden — show only on touch device
    this.container.setVisible(false);
  }

  // ── Detect touch device and show controls ──
  checkAndShow(): void {
    const isTouch = this.scene.sys.game.device.input.touch;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isTouch || isMobile) {
      this.show();
    }
  }

  show(): void {
    this.visible = true;
    this.container.setVisible(true);
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
  }

  // ── Hit testing ──
  private hitButton(px: number, py: number): string | null {
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    const btnY = H - 100;

    const buttons = [
      { id: 'jump',    x: W - 80,  y: btnY - 60, r: 32 },
      { id: 'hammer',  x: W - 165, y: btnY,       r: 30 },
      { id: 'dash',    x: W - 80,  y: btnY + 30,  r: 30 },
      { id: 'pause',   x: W - 36,  y: 28,         r: 24 },
    ];

    for (const b of buttons) {
      const dx = px - b.x, dy = py - b.y;
      if (dx * dx + dy * dy <= b.r * b.r) return b.id;
    }
    return null;
  }

  private hitJoystick(px: number, py: number): boolean {
    const jx = this.joystickCenter.x, jy = this.joystickCenter.y;
    const r = this.joystickRadius + 30;
    return (px - jx) ** 2 + (py - jy) ** 2 <= r * r;
  }

  // ── Pointer handlers ──
  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.visible) return;
    const px = pointer.x, py = pointer.y;

    // Joystick
    if (this.hitJoystick(px, py) && !this.joystickPointer) {
      this.joystickPointer = pointer;
      this.updateJoystick(px, py);
      return;
    }

    // Buttons
    const btn = this.hitButton(px, py);
    if (btn === 'jump'   && this.jumpPointer   === null) { this.btnJump   = true; this.jumpPointer   = pointer.id; this.flashButton('jump'); }
    if (btn === 'dash'   && this.dashPointer   === null) { this.btnDash   = true; this.dashPointer   = pointer.id; this.flashButton('dash'); }
    if (btn === 'hammer' && this.hammerPointer === null) { this.btnHammer = true; this.hammerPointer = pointer.id; this.flashButton('hammer'); }
    if (btn === 'pause') {
      // Emit pause event
      this.scene.events.emit('touch_pause');
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.visible) return;
    if (this.joystickPointer && pointer.id === (this.joystickPointer as any).id) {
      this.updateJoystick(pointer.x, pointer.y);
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.visible) return;

    if (this.joystickPointer && pointer.id === (this.joystickPointer as any).id) {
      this.joystickPointer = null;
      this.joystickDelta = { x: 0, y: 0 };
      this.joystickThumb.setPosition(this.joystickCenter.x, this.joystickCenter.y);
    }

    if (pointer.id === this.jumpPointer)   { this.btnJump   = false; this.jumpPointer   = null; }
    if (pointer.id === this.dashPointer)   { this.btnDash   = false; this.dashPointer   = null; }
    if (pointer.id === this.hammerPointer) { this.btnHammer = false; this.hammerPointer = null; }
  }

  private updateJoystick(px: number, py: number): void {
    const jx = this.joystickCenter.x, jy = this.joystickCenter.y;
    let dx = px - jx, dy = py - jy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.joystickRadius) {
      dx = (dx / dist) * this.joystickRadius;
      dy = (dy / dist) * this.joystickRadius;
    }

    this.joystickDelta = { x: dx, y: dy };
    this.joystickThumb.setPosition(jx + dx, jy + dy);
  }

  private flashButton(id: string): void {
    const bg = this.container.getByName(`btn_bg_${id}`) as Phaser.GameObjects.Graphics;
    if (!bg) return;
    this.scene.tweens.add({
      targets: bg, scaleX: 0.85, scaleY: 0.85,
      duration: 80, yoyo: true, ease: 'Power2'
    });
  }

  // ── Called every frame from InputManager ──
  getState(): TouchState {
    const threshold = 0.3;
    const nx = this.joystickDelta.x / this.joystickRadius;

    const left  = nx < -threshold;
    const right = nx >  threshold;

    const jumpJustPressed  = this.btnJump   && !this.prevJump;
    const dashJustPressed  = this.btnDash   && !this.prevDash;
    const hammerJustPressed = this.btnHammer && !this.prevHammer;

    this.prevJump   = this.btnJump;
    this.prevDash   = this.btnDash;
    this.prevHammer = this.btnHammer;

    return {
      left, right,
      jump: this.btnJump,
      jumpJustPressed,
      dash: this.btnDash,
      dashJustPressed,
      hammer: this.btnHammer,
      hammerJustPressed,
    };
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup',   this.onPointerUp,   this);
    this.scene.input.off('pointerupoutside', this.onPointerUp, this);
    this.container.destroy();
  }
}
