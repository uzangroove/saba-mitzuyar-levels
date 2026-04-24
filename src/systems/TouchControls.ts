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

    // ── Joystick — שמאל, אמצע אנכי ──
    const jx = 90, jy = H * 0.55;   // אמצע-שמאל
    this.joystickCenter = { x: jx, y: jy };

    // בסיס שקוף מאוד
    this.joystickBase = this.scene.add.graphics();
    this.joystickBase.fillStyle(0xFFFFFF, 0.08);
    this.joystickBase.fillCircle(0, 0, this.joystickRadius + 10);
    this.joystickBase.lineStyle(2, 0xFFFFFF, 0.2);
    this.joystickBase.strokeCircle(0, 0, this.joystickRadius + 10);
    this.joystickBase.setPosition(jx, jy);

    // חצים שקופים
    const arrowGfx = this.scene.add.graphics();
    arrowGfx.fillStyle(0xFFFFFF, 0.18);
    arrowGfx.fillTriangle(jx - 50, jy, jx - 36, jy - 10, jx - 36, jy + 10);
    arrowGfx.fillTriangle(jx + 50, jy, jx + 36, jy - 10, jx + 36, jy + 10);

    // אגודל שקוף
    this.joystickThumb = this.scene.add.graphics();
    this.joystickThumb.fillStyle(0xFFFFFF, 0.35);
    this.joystickThumb.fillCircle(0, 0, 26);
    this.joystickThumb.lineStyle(2, 0xFFFFFF, 0.5);
    this.joystickThumb.strokeCircle(0, 0, 26);
    this.joystickThumb.setPosition(jx, jy);

    this.container.add([this.joystickBase, arrowGfx, this.joystickThumb]);

    // ── כפתורי פעולה — מלבנים שטוחים, שורה תחתונה מרכז-ימין ──
    const btnH2 = 36, btnW2 = 68, btnGap = 6;
    const btnY = H - 44;
    // מרכז הקבוצה: בין הדלג (שמאל) לפאוז (ימין)
    const groupCenterX = W * 0.62;
    const totalW = btnW2 * 3 + btnGap * 2;
    const btnStartX = groupCenterX - totalW / 2;

    const btnConfigs = [
      { id: 'hammer', label: '🔨 פטיש', color: 0xFF6622 },
      { id: 'dash',   label: '💨 דאש',  color: 0x2266DD },
      { id: 'jump',   label: '↑ קפץ',   color: 0x22AA44 },
    ];

    btnConfigs.forEach((cfg, i) => {
      const bx = btnStartX + i * (btnW2 + btnGap);
      const by = btnY - btnH2 / 2;

      const bg = this.scene.add.graphics();
      bg.fillStyle(cfg.color, 0.78);
      bg.fillRoundedRect(0, 0, btnW2, btnH2, 7);
      bg.lineStyle(1.5, 0xFFFFFF, 0.55);
      bg.strokeRoundedRect(0, 0, btnW2, btnH2, 7);
      bg.setPosition(bx, by);
      bg.setName(`btn_bg_${cfg.id}`);

      const label = this.scene.add.text(bx + btnW2 / 2, btnY, cfg.label, {
        fontSize: '13px', color: '#FFFFFF',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setName(`btn_lbl_${cfg.id}`);

      this.container.add([bg, label]);
    });

    // ── כפתור פאוז — פינה ימין עליון ──
    const pauseBg = this.scene.add.graphics();
    pauseBg.fillStyle(0x000000, 0.35);
    pauseBg.fillRoundedRect(0, 0, 44, 30, 8);
    pauseBg.setPosition(W - 50, 8);
    const pauseLbl = this.scene.add.text(W - 28, 23, '⏸', {
      fontSize: '15px', color: '#FFFFFF'
    }).setOrigin(0.5);

    // ── כפתור דלג — מתחת לגבול המשחק, מרכז שמאל ──
    const skipBg = this.scene.add.graphics();
    skipBg.fillStyle(0xFF8800, 0.8);
    skipBg.fillRoundedRect(0, 0, 80, 32, 10);
    skipBg.setPosition(W / 2 - 130, H - 54);
    const skipLbl = this.scene.add.text(W / 2 - 90, H - 38, '⏭ דלג', {
      fontSize: '14px', color: '#FFFFFF',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.container.add([pauseBg, pauseLbl, skipBg, skipLbl]);

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

    // Hit test for rectangular action buttons
    const btnH2 = 36, btnW2 = 68, btnGap = 6;
    const btnY2 = H - 44;
    const groupCenterX = W * 0.62;
    const totalBtnW = btnW2 * 3 + btnGap * 2;
    const btnStartX2 = groupCenterX - totalBtnW / 2;
    const btnIds = ['hammer', 'dash', 'jump'];
    for (let i = 0; i < 3; i++) {
      const bx = btnStartX2 + i * (btnW2 + btnGap);
      const by = btnY2 - btnH2 / 2;
      if (px >= bx && px <= bx + btnW2 && py >= by && py <= by + btnH2) {
        return btnIds[i];
      }
    }
    const buttons = [
      { id: 'pause',   x: W - 28,       y: 23,      r: 22 },
      { id: 'skip',    x: W / 2 - 90,   y: H - 38,  r: 38 },
    ];

    for (const b of buttons) {
      const dx = px - b.x, dy = py - b.y;
      if (dx * dx + dy * dy <= b.r * b.r) return b.id;
    }
    return null;
  }

  private hitJoystick(px: number, py: number): boolean {
    const jx = this.joystickCenter.x, jy = this.joystickCenter.y;
    const r = this.joystickRadius + 50; // רדיוס touch גדול יותר
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
      this.scene.events.emit('touch_pause');
    }
    if (btn === 'skip') {
      // Simulate pressing 'O' key to skip level
      this.scene.events.emit('touch_skip_level');
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
