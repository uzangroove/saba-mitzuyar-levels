// ============================================================
// systems/InputManager.ts
// Unified input abstraction — keyboard + gamepad
// The game never directly queries hardware; always uses this
// ============================================================

import Phaser from 'phaser';
import { TouchControls, TouchState } from './TouchControls';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;         // For ladders / UI
  down: boolean;       // Crouch / pass-through platforms
  jumpJustPressed: boolean;
  jumpHeld: boolean;
  dash: boolean;
  dashJustPressed: boolean;
  hammer: boolean;
  hammerJustPressed: boolean;
  pause: boolean;
  pauseJustPressed: boolean;
  run: boolean;
  interact: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
    jump2: Phaser.Input.Keyboard.Key;
    dash: Phaser.Input.Keyboard.Key;
    hammer: Phaser.Input.Keyboard.Key;
    run: Phaser.Input.Keyboard.Key;
    pause: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
  };

  // Touch controls
  private touch: TouchControls | null = null;

  // Previous frame state for "just pressed" detection
  private prevJump = false;
  private prevDash = false;
  private prevHammer = false;
  private prevPause = false;
  private prevGpJump = false;
  private prevGpDash = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
    this.initTouch();
  }

  // Call this from GameScene.create() to activate touch UI
  initTouch(): void {
    this.touch = new TouchControls(this.scene);
    this.touch.checkAndShow();
    // Also show on any pointer event (for desktop testing)
    this.scene.input.once('pointerdown', () => {
      if (this.scene.sys.game.device.input.touch) {
        this.touch?.show();
      }
    });
  }

  private setupKeyboard(): void {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.keys = {
      left:    this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right:   this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump:    this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      jump2:   this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      dash:    this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      hammer:  this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      run:     this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      pause:   this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      down:    this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    };
  }

  private getGamepad(): Phaser.Input.Gamepad.Gamepad | null {
    const gp = this.scene.input.gamepad;
    if (!gp || gp.total === 0) return null;
    return gp.getPad(0);
  }

  getState(): InputState {
    const gp = this.getGamepad();

    // --- Keyboard ---
    const kbLeft  = this.cursors.left.isDown  || this.keys.left.isDown;
    const kbRight = this.cursors.right.isDown || this.keys.right.isDown;
    const kbUp    = this.cursors.up.isDown    || this.keys.jump.isDown || this.keys.jump2.isDown;
    const kbDown  = this.cursors.down.isDown  || this.keys.down.isDown;
    const kbDash  = this.keys.dash.isDown;
    const kbHammer = this.keys.hammer.isDown;
    const kbRun   = this.keys.run.isDown;
    const kbPause = this.keys.pause.isDown;

    // --- Gamepad ---
    const gpLeft  = gp ? (gp.axes[0]?.getValue() ?? 0) < -0.3 : false;
    const gpRight = gp ? (gp.axes[0]?.getValue() ?? 0) >  0.3 : false;
    const gpUp    = gp ? (gp.axes[1]?.getValue() ?? 0) < -0.3 : false;
    const gpDown  = gp ? (gp.axes[1]?.getValue() ?? 0) >  0.3 : false;
    // A button = jump, R1 = dash, X = hammer, Start = pause
    const gpJump  = gp ? (gp.buttons[0]?.value ?? 0) > 0.5 : false;
    const gpDash  = gp ? (gp.buttons[5]?.value ?? 0) > 0.5 : false;
    const gpHammer = gp ? (gp.buttons[2]?.value ?? 0) > 0.5 : false;
    const gpPause = gp ? (gp.buttons[9]?.value ?? 0) > 0.5 : false;
    const gpRun   = gp ? (gp.buttons[4]?.value ?? 0) > 0.5 : false;

    // Combine
    const jump  = kbUp || gpJump;
    const dash  = kbDash || gpDash;
    const hammer = kbHammer || gpHammer;
    const pause = kbPause || gpPause;

    // Just pressed (rising edge)
    const jumpJustPressed  = jump  && !this.prevJump;
    const dashJustPressed  = dash  && !this.prevDash;
    const hammerJustPressed = hammer && !this.prevHammer;
    const pauseJustPressed = pause && !this.prevPause;

    // Update previous state
    this.prevJump   = jump;
    this.prevDash   = dash;
    this.prevHammer = hammer;
    this.prevPause  = pause;
    this.prevGpJump = gpJump;
    this.prevGpDash = gpDash;

    // --- Touch ---
    const ts: TouchState = this.touch?.getState() ?? {
      left: false, right: false,
      jump: false, jumpJustPressed: false,
      dash: false, dashJustPressed: false,
      hammer: false, hammerJustPressed: false,
    };

    return {
      left:   kbLeft  || gpLeft  || ts.left,
      right:  kbRight || gpRight || ts.right,
      up:     kbUp    || gpUp    || ts.jump,
      down:   kbDown  || gpDown,
      jumpJustPressed:  jumpJustPressed  || ts.jumpJustPressed,
      jumpHeld:         jump || ts.jump,
      dash:             dash || ts.dash,
      dashJustPressed:  dashJustPressed  || ts.dashJustPressed,
      hammer:           hammer || ts.hammer,
      hammerJustPressed: hammerJustPressed || ts.hammerJustPressed,
      pause,
      pauseJustPressed,
      run:      kbRun || gpRun,
      interact: false,
    };
  }

  destroyTouch(): void {
    this.touch?.destroy();
    this.touch = null;
  }
}
