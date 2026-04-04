// ============================================================
// scenes/GameScene.ts  — Core gameplay (Week 3: Boss support)
// ============================================================

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { bakeEnemyTextures } from '../entities/EnemyRenderer';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { InputManager } from '../systems/InputManager';
import { HUDScene } from './HUDScene';
import { saveManager } from '../systems/SaveManager';
import { PALETTES } from '../constants/palettes';
import { getWorldConfig, getWorldForLevel } from '../worlds/WorldConfig';
import { getLevelData, LevelData, PlatformConfig } from '../levels/LevelRegistry';
import { PHYSICS } from '../constants/physics';

interface CrumblingState {
  gfx: Phaser.GameObjects.Graphics;
  rect: Phaser.GameObjects.Rectangle;
  state: 'solid' | 'shaking' | 'falling';
  shakeTimer: number;
  shakeOffset: number;
}

export class GameScene extends Phaser.Scene {
  // Entities
  private player!: Player;
  private enemies: Enemy[] = [];
  private boss: Boss | null = null;

  // Groups
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private platformGfx!: Phaser.GameObjects.Graphics;
  private staticCoinGfx!: Phaser.GameObjects.Graphics;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private crumblingPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private crumblingData: CrumblingState[] = [];
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private coinGroup!: Phaser.Physics.Arcade.StaticGroup;
  private goalZone!: Phaser.Physics.Arcade.StaticGroup;

  // Systems
  private inputManager!: InputManager;
  private hudScene!: HUDScene;

  // State
  private currentLevel: number = 1;
  private levelData!: LevelData;
  private levelStartTime: number = 0;
  private coinsCollected: number = 0;
  private isTransitioning: boolean = false;
  private lives: number = 3;
  private godMode: boolean = false;
  private bossDefeated: boolean = false;
  private worldKey: string = 'earth';
  private shadowGfx!: Phaser.GameObjects.Graphics;

  // Combo
  private comboCount: number = 0;
  private comboTimer: number = 0;

  constructor() { super({ key: 'GameScene' }); }

  init(data: { level?: number; lives?: number }): void {
    this.currentLevel = data?.level ?? 1;
    this.lives = data?.lives ?? 3;
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    const ld = getLevelData(this.currentLevel);
    if (!ld) { this.scene.start('MainMenuScene'); return; }
    this.levelData = ld;
    this.worldKey  = ld.worldType;

    this.physics.world.gravity.y = PHYSICS.GRAVITY;

    const worldWidth = this.calcWorldWidth(ld);
    this.physics.world.setBounds(0, -200, worldWidth, H + 800);  // tall bounds — pit death handled in code

    // Pre-bake all sprites (zero per-frame cost after this)
    bakeEnemyTextures(this);
    // Background
    this.buildBackground(W, H, worldWidth);

    // Castle with Savta in background
    this.buildCastleBackground(W, H, worldWidth);

    // Groups
    this.platforms          = this.physics.add.staticGroup();
    this.platformGfx        = this.add.graphics().setDepth(2);
    this.staticCoinGfx      = this.add.graphics().setDepth(3);
    this.movingPlatforms    = this.physics.add.group();
    this.crumblingPlatforms = this.physics.add.staticGroup();
    this.crumblingData      = [];
    this.enemyGroup         = this.physics.add.group();
    this.coinGroup          = this.physics.add.staticGroup();
    this.goalZone           = this.physics.add.staticGroup();

    // Load level content
    this.loadLevel(ld);
    // Bake all static platform graphics into a cached texture (1 GPU draw call)
    this.bakePlatformLayer();

    // Drop-shadow graphics (drawn under all entities — gives 3D depth illusion)
    this.shadowGfx = this.add.graphics().setDepth(3);

    // Player
    this.player = new Player(this, ld.spawnPoint.x, ld.spawnPoint.y);
    this.player.setWorldParams(getWorldConfig(this.currentLevel));
    this.player.setDepth(5);

    // Boss (if boss level)
    if (ld.isBoss) this.spawnBoss(ld);

    // Input
    this.inputManager = new InputManager(this);

    // Collisions
    this.setupCollisions();

    // Camera
    // Camera bounds: full world width, but tall enough to follow player vertically
    this.cameras.main.setBounds(0, 0, worldWidth, H);
    // Follow player, offset camera UP so player appears in lower 1/3 of screen
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, H * 0.15);
    this.cameras.main.setDeadzone(120, 60);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // HUD
    this.scene.launch('HUDScene');
    this.hudScene = this.scene.get('HUDScene') as HUDScene;
    this.time.delayedCall(80, () => {
      this.hudScene.updateLevel(this.currentLevel, this.getWorldName());
      this.hudScene.updateLives(this.lives);
      this.hudScene.updateHealth(this.player.health, this.player.maxHealth);
      this.hudScene.updateCoins(0);
      if (ld.isBoss) this.hudScene.showBossBar(true, 'STONE GIANT', 30);
    });

    // Transition reveal (level name card)
    if (this.currentLevel > 1) {
      this.scene.launch('TransitionScene', {
        fromLevel: this.currentLevel - 1,
        toLevel: this.currentLevel,
        isBoss: ld.isBoss ?? false,
        worldName: this.getWorldName(),
        worldEmoji: this.getWorldEmoji(),
      });
      this.scene.pause();
      // TransitionScene will resume us
    }

    this.levelStartTime = this.time.now;
    this.coinsCollected = 0;
    this.isTransitioning = false;
    this.bossDefeated = false;
    this.comboCount = 0;
    this.comboTimer = 0;

    // Ambient particles
    this.startAmbientParticles();

    // O key = skip to next level
    this.input.keyboard!.on('keydown-O', () => {
      this.completeLevel();
    });

    // G key = toggle God Mode (no damage, unlimited lives)
    this.input.keyboard!.on('keydown-G', () => {
      this.godMode = !this.godMode;
      const msg = this.godMode ? '✨ GOD MODE ON' : 'God Mode OFF';
      this.hudScene?.showMessage(msg, this.godMode ? '#FFD700' : '#AAAAAA', 2000);
      if (this.godMode) {
        this.player.health = this.player.maxHealth;
        this.hudScene?.updateHealth(this.player.health, this.player.maxHealth);
      }
    });

    // Debug: Shift+K = skip level
    this.input.keyboard!.on('keydown-K', () => {
      if (this.input.keyboard!.checkDown(this.input.keyboard!.addKey('SHIFT'))) {
        this.completeLevel();
      }
    });
  }

  private calcWorldWidth(ld: LevelData): number {
    let maxX = 960;
    for (const p of ld.platforms) maxX = Math.max(maxX, p.x + p.width + 200);
    maxX = Math.max(maxX, ld.goalX + 300);
    return maxX;
  }

  // ============================================================
  // BACKGROUND
  // ============================================================

  private buildBackground(W: number, H: number, worldWidth: number): void {
    const palette = PALETTES[this.levelData.paletteName] ?? PALETTES['DAY'];

    const toHex = (s: string) => parseInt(s.replace('#', ''), 16);

    // ---- Real background images for Earth world ----
    if (this.worldKey === 'earth') {
      // Rotate 3 backgrounds: level 1→bg1, 2→bg2, 3→bg3, 4→bg1, etc.
      const bgIndex = ((this.currentLevel - 1) % 3) + 1;
      const bgKey = `bg_earth_${bgIndex}`;
      if (this.textures.exists(bgKey)) {
        // Just ONE image — background is complete
        this.add.image(W/2, H/2, bgKey)
          .setScrollFactor(0)
          .setDepth(-10)
          .setDisplaySize(W, H);

        this.buildLavaAndWaterEffects(worldWidth, W, H);
        return;
      }
    }

    // Bake entire background into ONE RenderTexture → 1 draw call, no per-frame cost
    const bgCacheKey = `bg_proc_${this.worldKey}_${this.levelData.paletteName}`;
    if (!this.textures.exists(bgCacheKey)) {
      const rt = this.add.renderTexture(0, 0, W, H);
      const g = this.add.graphics();
      // Sky gradient
      g.fillGradientStyle(toHex(palette.skyTop), toHex(palette.skyTop),
        toHex(palette.skyBottom), toHex(palette.skyBottom), 1);
      g.fillRect(0, 0, W, H);
      // Stars for space
      if (this.worldKey === 'space') {
        g.fillStyle(0xFFFFFF);
        for (let i = 0; i < 120; i++) {
          g.fillCircle(Math.random() * W, Math.random() * H, 0.5 + Math.random() * 1.5);
        }
      }
      // Far hills
      g.fillStyle(toHex(palette.hillFar));
      for (let hx = 0; hx < W + 300; hx += 180) {
        g.fillEllipse(hx, H - 60, 280, (80 + Math.sin(hx * 0.02) * 40) * 2);
      }
      // Near hills
      g.fillStyle(toHex(palette.hillNear));
      for (let hx = 0; hx < W + 200; hx += 140) {
        g.fillEllipse(hx, H - 30, 220, (60 + Math.cos(hx * 0.03) * 30) * 2);
      }
      // Clouds
      const cloudColor = toHex(palette.cloud);
      for (let i = 0; i < 8; i++) {
        const cx = Math.random() * W;
        const cy = 40 + Math.random() * 180;
        const cw = 90 + Math.random() * 120;
        g.fillStyle(cloudColor, 0.85);
        g.fillEllipse(cx, cy, cw, cw * 0.5);
        g.fillEllipse(cx + cw * 0.2, cy - cw * 0.12, cw * 0.65, cw * 0.45);
        g.fillEllipse(cx - cw * 0.2, cy - cw * 0.08, cw * 0.55, cw * 0.38);
      }
      rt.draw(g, 0, 0);
      rt.saveTexture(bgCacheKey);
      g.destroy();
      rt.destroy();
    }
    this.add.image(W/2, H/2, bgCacheKey).setScrollFactor(0).setDepth(-10);

    // Water tint (baked RenderTexture)
    if (this.worldKey === 'water') {
      const wtG = this.add.graphics();
      wtG.fillStyle(0x0044AA, 0.22);
      wtG.fillRect(0, 0, worldWidth, H);
      const wtRt = this.add.renderTexture(0, 0, worldWidth, H).setDepth(-5).setScrollFactor(0.4);
      wtRt.draw(wtG, 0, 0); wtG.destroy();
    }

    // Boss arena: lava glow (baked)
    if (this.levelData.isBoss) {
      const lavaG = this.add.graphics();
      lavaG.fillStyle(0xFF4500, 0.08);
      lavaG.fillRect(0, 0, worldWidth, H);
      for (let i = 0; i < 12; i++) {
        const cx = 100 + Math.random() * (worldWidth - 200);
        const cy = H - 38;
        lavaG.lineStyle(2, 0xFF6F00, 0.5);
        lavaG.lineBetween(cx, cy, cx + (Math.random() - 0.5) * 80, cy - Math.random() * 30);
      }
      const lavaRt = this.add.renderTexture(0, 0, worldWidth, H).setDepth(-5).setScrollFactor(0.2);
      lavaRt.draw(lavaG, 0, 0); lavaG.destroy();
    }
  }

  // ============================================================
  // CASTLE BACKGROUND — Savta Rivka waits in the tower window
  // Placed in the far background, fixed scroll factor (parallax)
  // ============================================================
  private buildCastleBackground(W: number, H: number, worldWidth: number): void {
    // Castle sits in far right of scene, parallax 0.2 (slow scroll - feels far away)
    // Position: right side of world, slightly above ground level
    const castleX = worldWidth * 0.75;  // 3/4 through the level
    const groundY = H;                  // bottom of screen
    const castleScrollFactor = 0.2;

    // Bake castle structure into RenderTexture (baked once, displayed as image)
    const castleRTKey = `castle_static_${this.worldKey}`;
    // We'll draw cg, then bake at the end
    const cg = this.add.graphics();

    // ---- Draw stone castle ----
    const cx = castleX;
    const cy = groundY;          // castle base sits on ground line

    const towerW  = 90;
    const towerH  = 240;
    const mainW   = 160;
    const mainH   = 180;
    const stoneColor  = 0x8D9FA8;
    const stoneDark   = 0x6B7D86;
    const stoneLight  = 0xAABEC8;
    const roofColor   = 0x4A5568;

    // --- Main keep ---
    cg.fillStyle(stoneDark);
    cg.fillRect(cx - mainW/2, cy - mainH, mainW, mainH);
    cg.fillStyle(stoneColor);
    cg.fillRect(cx - mainW/2 + 4, cy - mainH + 4, mainW - 8, mainH - 4);

    // Stone texture (horizontal lines)
    cg.lineStyle(1, stoneDark, 0.35);
    for (let row = 1; row < 7; row++) {
      cg.lineBetween(cx - mainW/2 + 4, cy - mainH + row * 26, cx + mainW/2 - 4, cy - mainH + row * 26);
    }

    // Main gate arch
    cg.fillStyle(0x1A1A2E);
    cg.fillRoundedRect(cx - 22, cy - 75, 44, 75, { tl:22, tr:22, bl:0, br:0 });
    cg.fillStyle(0x2A1A0E);
    cg.fillRoundedRect(cx - 18, cy - 72, 36, 72, { tl:18, tr:18, bl:0, br:0 });
    // Gate door planks
    cg.lineStyle(1.5, 0x3D2B1F, 0.7);
    for (let pl = 0; pl < 4; pl++) {
      cg.lineBetween(cx - 16, cy - 65 + pl * 15, cx + 16, cy - 65 + pl * 15);
    }
    // Gate handle
    cg.fillStyle(0xFFD700, 0.9);
    cg.fillCircle(cx + 10, cy - 35, 3.5);

    // Battlements on main keep
    for (let b = 0; b < 5; b++) {
      const bx = cx - mainW/2 + 10 + b * (mainW - 20) / 4;
      cg.fillStyle(stoneColor);
      cg.fillRect(bx - 8, cy - mainH - 24, 16, 24);
      cg.fillStyle(stoneLight);
      cg.fillRect(bx - 7, cy - mainH - 22, 14, 20);
    }

    // --- Left tower (taller) ---
    const ltx = cx - mainW/2 - towerW/2 + 10;
    cg.fillStyle(stoneDark);
    cg.fillRect(ltx - towerW/2, cy - towerH, towerW, towerH);
    cg.fillStyle(stoneColor);
    cg.fillRect(ltx - towerW/2 + 3, cy - towerH + 3, towerW - 6, towerH - 3);

    // Tower stone lines
    cg.lineStyle(1, stoneDark, 0.3);
    for (let row = 1; row < 9; row++) {
      cg.lineBetween(ltx - towerW/2 + 3, cy - towerH + row * 28, ltx + towerW/2 - 3, cy - towerH + row * 28);
    }

    // Conical roof on left tower
    const roofPts = [ltx, cy - towerH - 70, ltx - towerW/2 - 5, cy - towerH, ltx + towerW/2 + 5, cy - towerH];
    cg.fillStyle(roofColor);
    cg.fillTriangle(roofPts[0], roofPts[1], roofPts[2], roofPts[3], roofPts[4], roofPts[5]);

    // Tower battlements
    for (let b = 0; b < 3; b++) {
      const bx = ltx - towerW/2 + 8 + b * (towerW - 16) / 2;
      cg.fillStyle(stoneColor);
      cg.fillRect(bx - 7, cy - towerH - 20, 14, 20);
    }

    // --- Right tower (shorter) ---
    const rtx = cx + mainW/2 + towerW/2 - 10;
    const rtH = towerH * 0.8;
    cg.fillStyle(stoneDark);
    cg.fillRect(rtx - towerW/2, cy - rtH, towerW, rtH);
    cg.fillStyle(stoneColor);
    cg.fillRect(rtx - towerW/2 + 3, cy - rtH + 3, towerW - 6, rtH - 3);
    cg.lineStyle(1, stoneDark, 0.3);
    for (let row = 1; row < 7; row++) {
      cg.lineBetween(rtx - towerW/2 + 3, cy - rtH + row * 28, rtx + towerW/2 - 3, cy - rtH + row * 28);
    }
    for (let b = 0; b < 3; b++) {
      const bx = rtx - towerW/2 + 8 + b * (towerW - 16) / 2;
      cg.fillStyle(stoneColor);
      cg.fillRect(bx - 7, cy - rtH - 18, 14, 18);
    }

    // Right tower tiny roof
    cg.fillStyle(roofColor);
    cg.fillTriangle(rtx, cy - rtH - 55, rtx - towerW/2 - 4, cy - rtH, rtx + towerW/2 + 4, cy - rtH);

    // ---- SAVTA WINDOW — top of left tower ----
    // Window glow (animated via time event)
    const winX = ltx;
    const winY = cy - towerH + 70;   // Upper portion of left tower

    // Arched window frame (stone)
    cg.fillStyle(stoneDark);
    cg.fillRoundedRect(winX - 18, winY - 36, 36, 42, { tl:18, tr:18, bl:0, br:0 });

    // Window glow graphics (separate, animated)
    const winGlow = this.add.graphics().setDepth(-5).setScrollFactor(castleScrollFactor);

    // Savta image in window
    if (this.textures.exists('savta_rivka')) {
      const savtaWin = this.add.image(winX, winY - 10, 'savta_rivka')
        .setDisplaySize(30, 30)
        .setDepth(-5)
        .setScrollFactor(castleScrollFactor)
        ;

      // Window sill / ledge (savta leans on it)
      cg.fillStyle(stoneLight);
      cg.fillRect(winX - 20, winY + 4, 40, 6);

      // ---- Animate with TWEENS (zero CPU cost) instead of Graphics redraw ----

      // Static warm window glow (drawn ONCE)
      winGlow.fillStyle(0xFFD700, 0.45);
      winGlow.fillRoundedRect(winX - 15, winY - 32, 30, 36, { tl:15, tr:15, bl:0, br:0 });
      winGlow.fillStyle(0xFFAA33, 0.1);
      winGlow.fillCircle(winX, winY - 14, 40);
      winGlow.fillStyle(0xFFAA33, 0.07);
      winGlow.fillCircle(winX, winY - 14, 52);

      // Tween: glow pulse (alpha oscillation) — GPU only, no JS math per frame
      this.tweens.add({
        targets: winGlow,
        alpha: { from: 0.7, to: 1.0 },
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Tween: savta bobs gently
      this.tweens.add({
        targets: savtaWin,
        y: { from: winY - 12, to: winY - 6 },
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      // Fallback silhouette
      const winGfx = this.add.graphics().setDepth(-5).setScrollFactor(castleScrollFactor);
      winGfx.fillStyle(0xFFD700, 0.7);
      winGfx.fillRoundedRect(winX - 15, winY - 32, 30, 36, { tl:15, tr:15, bl:0, br:0 });
    }

    // Ivy vines on castle walls
    cg.lineStyle(2, 0x2D7D32, 0.6);
    for (let v = 0; v < 5; v++) {
      const vx = cx - mainW/2 + 15 + v * 28;
      const vy = cy - mainH;
      cg.lineBetween(vx, vy, vx + (Math.random() - 0.5) * 10, vy + 40);
      cg.lineBetween(vx, vy + 40, vx + 8, vy + 70);
    }
    // Bake entire castle structure into single image (1 draw call instead of 7)
    if (!this.textures.exists(castleRTKey)) {
      const rtW = 300, rtH = 350;
      const rt = this.add.renderTexture(0, 0, rtW, rtH);
      // Translate cg to origin for baking
      const offX = cx - rtW/2, offY = cy - rtH;
      cg.setPosition(-offX, -offY);
      rt.draw(cg, 0, 0);
      rt.saveTexture(castleRTKey);
      cg.setPosition(0, 0);
      rt.destroy();
    }
    cg.destroy();
    // Display baked castle
    this.add.image(cx, cy - 175, castleRTKey)
      .setDepth(-6)
      .setScrollFactor(castleScrollFactor)
      .setOrigin(0.5, 0.5);

    // Flag on left tower — drawn ONCE, animated with tween
    const flagPole = this.add.graphics().setDepth(-5).setScrollFactor(castleScrollFactor);
    flagPole.lineStyle(2, 0x5D4037, 1);
    flagPole.lineBetween(ltx, cy - towerH - 70, ltx, cy - towerH - 110);

    // Flag as a Rectangle (cheap to tween scaleX for wave effect)
    const flagRect = this.add.rectangle(ltx + 12, cy - towerH - 100, 24, 18, 0xE53935)
      .setDepth(-5)
      .setScrollFactor(castleScrollFactor)
      .setOrigin(0, 0.5);

    // Tween: flag "waves" by scaling X
    this.tweens.add({
      targets: flagRect,
      scaleX: { from: 1.0, to: 0.6 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private buildLavaAndWaterEffects(worldWidth: number, W: number, H: number): void {
    if (this.worldKey === 'water') {
      const wtG2 = this.add.graphics();
      wtG2.fillStyle(0x0044AA, 0.22);
      wtG2.fillRect(0, 0, worldWidth, H);
      const wtRt2 = this.add.renderTexture(0, 0, worldWidth, H).setDepth(-5).setScrollFactor(0.4);
      wtRt2.draw(wtG2, 0, 0); wtG2.destroy();
    }
    if (this.levelData.isBoss) {
      const lavaG2 = this.add.graphics();
      lavaG2.fillStyle(0xFF4500, 0.08);
      lavaG2.fillRect(0, 0, worldWidth, H);
      for (let i = 0; i < 12; i++) {
        const cx2 = 100 + Math.random() * (worldWidth - 200);
        const cy2 = H - 38;
        lavaG2.lineStyle(2, 0xFF6F00, 0.5);
        lavaG2.lineBetween(cx2, cy2, cx2 + (Math.random() - 0.5) * 80, cy2 - Math.random() * 30);
      }
      const lavaRt2 = this.add.renderTexture(0, 0, worldWidth, H).setDepth(-5).setScrollFactor(0.2);
      lavaRt2.draw(lavaG2, 0, 0); lavaG2.destroy();
    }
  }

  // ============================================================
  // LEVEL LOADING
  // ============================================================

  private loadLevel(ld: LevelData): void {
    const palette = PALETTES[ld.paletteName] ?? PALETTES['DAY'];
    const toHex = (s: string) => parseInt(s.replace('#', ''), 16);
    const fill = toHex(palette.platformFill);
    const top  = toHex(palette.platformTop);

    for (const p of ld.platforms) {
      if (p.type === 'moving') {
        this.createMovingPlatform(p, fill, top);
      } else if (p.type === 'crumbling') {
        this.createCrumblingPlatform(p, fill, top);
      } else {
        this.createStaticPlatform(p, fill, top, p.type === 'passthrough');
      }
    }

    for (const e of ld.enemies) {
      const enemy = new Enemy(this, e.x, e.y - 28, e.type, e.patrolDistance, e.variant ?? 0);
      enemy.setDepth(4);
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy);
    }

    for (const c of ld.coins) this.createCoin(c.x, c.y);
    this.createGoal(ld.goalX, ld.goalY);
  }

  private bakePlatformLayer(): void {
    // Convert the shared platformGfx into a RenderTexture for faster GPU rendering
    // This reduces it from a vector Graphics object to a simple cached bitmap
    if (!this.platformGfx || !this.platformGfx.active) return;
    const W = this.scale.width;
    const worldW = this.cameras.main.getBounds().width || W * 3;
    const H = this.scale.height;
    // Note: with large worlds this is memory-intensive, so only bake if world < 3000px
    // For larger worlds, the shared Graphics is already much better than per-platform Graphics
    if (worldW > 3000) return;  // Skip baking for very large worlds
    const rt = this.add.renderTexture(0, 0, worldW, H);
    rt.draw(this.platformGfx, 0, 0);
    const platKey = `platform_layer_baked_${this.currentLevel}`;
    if (this.textures.exists(platKey)) this.textures.remove(platKey);
    rt.saveTexture(platKey);
    this.platformGfx.destroy();
    const img = this.add.image(worldW/2, H/2, platKey).setDepth(2);
    img.setOrigin(0.5, 0.5);
  }

  private createStaticPlatform(cfg: PlatformConfig, fill: number, top: number, passthrough = false): void {
    const g = this.platformGfx; // shared — no new Graphics per platform

    // === ISO-STYLE 3D BLOCK ===
    // Bottom depth face — dark strip below body gives illusion of block thickness
    const depthDark = Math.max(0x111111, fill - 0x3a3a3a);
    g.fillStyle(depthDark, 1);
    g.fillRect(cfg.x + 6, cfg.y + cfg.height, cfg.width - 6, 11);

    // Right-edge depth face — dark right wall of the block
    const sideDark = Math.max(0x111111, fill - 0x282828);
    g.fillStyle(sideDark, 1);
    g.fillRect(cfg.x + cfg.width, cfg.y + 7, 8, cfg.height + 5);

    // Body (front face)
    g.fillStyle(fill);
    g.fillRect(cfg.x, cfg.y + 8, cfg.width, cfg.height - 8);

    // Brick / stone texture on front face
    const brickShade = Math.max(0, fill - 0x151515);
    g.fillStyle(brickShade, 0.4);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < Math.floor(cfg.width / 24); col++) {
        const bx = cfg.x + col * 24 + (row % 2) * 12;
        const by = cfg.y + 10 + row * 11;
        if (bx + 22 < cfg.x + cfg.width) {
          g.fillRoundedRect(bx + 1, by, 21, 9, 1);
        }
      }
    }

    // Top surface (the bright face you stand on)
    g.fillStyle(top);
    g.fillRoundedRect(cfg.x, cfg.y, cfg.width, 9, { tl: 4, tr: 4, bl: 0, br: 0 });

    // Top highlight — thin bright shimmer line
    g.fillStyle(0xFFFFFF, 0.20);
    g.fillRect(cfg.x + 4, cfg.y + 1, cfg.width - 8, 3);

    // Grass blade decoration on top surface
    if (!this.levelData.isBoss) {
      const bladeColor = Math.min(0xFFFFFF, top + 0x181818);
      g.fillStyle(bladeColor);
      for (let bx = cfg.x + 6; bx < cfg.x + cfg.width - 4; bx += 10) {
        const h = 3 + Math.sin(bx * 0.4) * 2;
        g.fillTriangle(bx, cfg.y, bx + 5, cfg.y, bx + 2, cfg.y - h);
      }
    }

    // Physics (unchanged — body matches original rect)
    const rect = this.add.rectangle(
      cfg.x + cfg.width / 2, cfg.y + cfg.height / 2,
      cfg.width, cfg.height
    ).setVisible(false);
    this.platforms.add(rect);

    if (passthrough) {
      const body = rect.body as Phaser.Physics.Arcade.StaticBody;
      body.checkCollision.down = false;
      body.checkCollision.left = false;
      body.checkCollision.right = false;
    }
  }

  private createMovingPlatform(cfg: PlatformConfig, fill: number, top: number): void {
    const g = this.add.graphics().setDepth(2);

    // === ISO-STYLE 3D BLOCK (moving) ===
    // Bottom depth face
    const depthDark = Math.max(0x111111, fill - 0x3a3a3a);
    g.fillStyle(depthDark, 1);
    g.fillRect(6, cfg.height, cfg.width - 6, 11);

    // Right-edge depth face
    const sideDark = Math.max(0x111111, fill - 0x282828);
    g.fillStyle(sideDark, 1);
    g.fillRect(cfg.width, 7, 8, cfg.height + 5);

    // Body (front face)
    g.fillStyle(fill);
    g.fillRect(0, 8, cfg.width, cfg.height - 8);

    // Top surface
    g.fillStyle(top);
    g.fillRoundedRect(0, 0, cfg.width, 9, { tl: 4, tr: 4, bl: 0, br: 0 });

    // Top highlight
    g.fillStyle(0xFFFFFF, 0.20);
    g.fillRect(4, 1, cfg.width - 8, 3);

    // Arrow indicator (signals this platform moves)
    g.fillStyle(0xFFFFFF, 0.30);
    g.fillTriangle(cfg.width/2 - 7, 15, cfg.width/2 + 7, 15, cfg.width/2, 8);

    const plat = this.add.rectangle(
      cfg.x + cfg.width / 2, cfg.y + cfg.height / 2,
      cfg.width, cfg.height
    ).setVisible(false);

    plat.setData('gfx', g);
    plat.setData('startX', cfg.x + cfg.width / 2);
    plat.setData('startY', cfg.y + cfg.height / 2);
    plat.setData('moveX', cfg.moveX ?? 0);
    plat.setData('moveY', cfg.moveY ?? 0);
    plat.setData('moveSpeed', cfg.moveSpeed ?? 1);
    plat.setData('phase', Math.random() * Math.PI * 2);

    this.movingPlatforms.add(plat);
    this.physics.add.existing(plat);
    const body = plat.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.allowGravity = false;
    g.setPosition(cfg.x, cfg.y);
  }

  private createCrumblingPlatform(cfg: PlatformConfig, fill: number, top: number): void {
    const g = this.add.graphics().setDepth(2);

    // === ISO-STYLE 3D BLOCK (crumbling — red-tinted warning) ===
    // Bottom depth face
    const depthDark = Math.max(0x111111, fill - 0x3a3a3a);
    g.fillStyle(depthDark, 1);
    g.fillRect(cfg.x + 6, cfg.y + cfg.height, cfg.width - 6, 11);

    // Right-edge depth face
    const sideDark = Math.max(0x111111, fill - 0x282828);
    g.fillStyle(sideDark, 1);
    g.fillRect(cfg.x + cfg.width, cfg.y + 7, 8, cfg.height + 5);

    // Body (front face)
    g.fillStyle(fill);
    g.fillRect(cfg.x, cfg.y + 8, cfg.width, cfg.height - 8);

    // Crack lines on the body
    g.lineStyle(1.5, 0x000000, 0.38);
    for (let i = 1; i < 4; i++) {
      const cx = cfg.x + (cfg.width / 4) * i;
      g.lineBetween(cx - 4, cfg.y + 10, cx + 4, cfg.y + cfg.height - 2);
    }

    // Top surface (red-tinted to signal danger)
    g.fillStyle(top);
    g.fillRoundedRect(cfg.x, cfg.y, cfg.width, 9, { tl: 4, tr: 4, bl: 0, br: 0 });

    // Red danger tint on top
    g.fillStyle(0xFF3333, 0.28);
    g.fillRoundedRect(cfg.x + 2, cfg.y + 1, cfg.width - 4, 7, { tl: 4, tr: 4, bl: 0, br: 0 });

    // Top highlight
    g.fillStyle(0xFFFFFF, 0.15);
    g.fillRect(cfg.x + 4, cfg.y + 1, cfg.width - 8, 3);

    const rect = this.add.rectangle(
      cfg.x + cfg.width / 2, cfg.y + cfg.height / 2,
      cfg.width, cfg.height
    ).setVisible(false);
    this.crumblingPlatforms.add(rect);

    this.crumblingData.push({
      gfx: g,
      rect,
      state: 'solid',
      shakeTimer: 0,
      shakeOffset: 0,
    });
  }

  private createCoin(x: number, y: number): void {
    // Bake coin ONCE, reuse as Image (no Graphics per coin)
    if (!this.textures.exists('coin_sprite')) {
      const rt = this.add.renderTexture(0, 0, 20, 20);
      const g2 = this.add.graphics();
      g2.fillStyle(0xAA8800); g2.fillCircle(11, 11, 8);
      g2.fillStyle(0xFFD700); g2.fillCircle(10, 10, 8);
      g2.fillStyle(0xFFA000); g2.fillCircle(10, 10, 6);
      g2.fillStyle(0xFFD700); g2.fillCircle(9, 9, 4.5);
      g2.fillStyle(0xFFFFFF, 0.55); g2.fillEllipse(8, 8, 5, 3.5);
      rt.draw(g2, 0, 0);
      rt.saveTexture('coin_sprite');
      g2.destroy();
      rt.destroy();
    }

    const img = this.add.image(x, y, 'coin_sprite').setDepth(3);
    // Bob with tween — GPU only
    this.tweens.add({
      targets: img, y: y - 7,
      duration: 700 + Math.random() * 400,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      delay: Math.random() * 500,
    });

    const rect = this.add.rectangle(x, y, 16, 16).setVisible(false);
    rect.setData('graphics', img);  // same key, used for hide on collect
    rect.setData('collected', false);
    this.coinGroup.add(rect);
  }

  private createGoal(x: number, y: number): void {
    const cx = x + 16, cy = y + 16;

    // Bake star into RenderTexture ONCE — then rotate with tween (zero CPU)
    if (!this.textures.exists('goal_star')) {
      const rt = this.add.renderTexture(0, 0, 80, 80);
      const g2 = this.add.graphics();
      // Glow rings
      for (let r = 3; r >= 0; r--) {
        g2.fillStyle(0x76FF03, 0.06 * (4 - r));
        g2.fillCircle(40, 40, 28 + r * 7);
      }
      g2.lineStyle(3, 0x76FF03, 0.9);
      g2.strokeCircle(40, 40, 20);
      // Static star polygon
      const pts: number[] = [];
      for (let si = 0; si < 10; si++) {
        const r = si % 2 === 0 ? 18 : 9;
        const a = si * Math.PI / 5;
        pts.push(40 + Math.cos(a) * r, 40 + Math.sin(a) * r);
      }
      g2.fillStyle(0x76FF03);
      g2.fillPoints(pts, true);
      g2.fillStyle(0xFFFFFF, 0.95);
      g2.fillCircle(40, 40, 5);
      rt.draw(g2, 0, 0);
      rt.saveTexture('goal_star');
      g2.destroy();
      rt.destroy();
    }

    // Display star as Image — rotate with tween (GPU transform, zero CPU)
    const starImg = this.add.image(cx, cy, 'goal_star').setDepth(3).setOrigin(0.5);
    this.tweens.add({
      targets: starImg,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear',
    });
    // Pulse glow
    this.tweens.add({
      targets: starImg,
      alpha: { from: 0.8, to: 1.0 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    if (!this.levelData.isBoss) {
      this.add.text(x + 16, y - 22, '🏰', { fontSize: '18px' }).setOrigin(0.5).setDepth(4);
    }

    // Savta Rivka waiting at the goal
    if (this.textures.exists('savta_rivka')) {
      const savtaImg = this.add.image(x + 58, y - 16, 'savta_rivka')
        .setDisplaySize(52, 52)
        .setDepth(4);

      // Tween: savta bobs at goal (zero CPU)
      this.tweens.add({
        targets: savtaImg,
        y: { from: y - 20, to: y - 12 },
        alpha: { from: 0.85, to: 1.0 },
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Static glow ring (drawn once, alpha-tweened)
      const savtaGlow = this.add.graphics().setDepth(3);
      savtaGlow.fillStyle(0xFFD700, 0.18);
      savtaGlow.fillCircle(x + 58, y - 14, 56);
      savtaGlow.fillStyle(0xFFD700, 0.12);
      savtaGlow.fillCircle(x + 58, y - 14, 44);
      savtaGlow.fillStyle(0xFFAA00, 0.08);
      savtaGlow.fillCircle(x + 58, y - 14, 68);
      this.tweens.add({
        targets: savtaGlow,
        alpha: { from: 0.6, to: 1.0 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      // Fallback heart
      this.add.text(x + 58, y - 16, '❤️', { fontSize: '24px' }).setOrigin(0.5).setDepth(4);
    }

    const rect = this.add.rectangle(x + 16, y + 16, 32, 32).setVisible(false);
    this.goalZone.add(rect);
  }

  // ============================================================
  // BOSS SPAWN
  // ============================================================

  private spawnBoss(ld: LevelData): void {
    const bossX = Math.floor((ld.goalX + ld.spawnPoint.x) / 2);
    const bossY = ld.spawnPoint.y;

    this.boss = new Boss(this, bossX, bossY);
    this.boss.setDepth(6);

    // Boss events
    this.boss.onDeath = () => {
      this.bossDefeated = true;
      this.cameras.main.shake(600, 0.018);
      this.hudScene?.showBossBar(false);
      this.hudScene?.showMessage('BOSS DEFEATED! 🏆', '#FFD700', 3500);
      this.spawnDeathExplosion(bossX, bossY);
      this.time.delayedCall(3000, () => this.completeLevel());
    };

    this.boss.onPhaseChange = (phase) => {
      const msgs: Record<number, string> = {
        2: '⚠ STONE GIANT ENRAGES! ⚠',
        3: '☠ FINAL FORM! ☠',
      };
      this.hudScene?.showMessage(msgs[phase] ?? '', '#FF4444', 2000);
      this.cameras.main.shake(300, 0.012);
    };

    this.boss.onStomp = (x, y) => {
      this.cameras.main.shake(180, 0.008);
      this.spawnStompShockwave(x, y);
    };

    // Boss physics
    this.physics.add.collider(this.boss, this.platforms);
    this.physics.add.collider(this.boss, this.movingPlatforms);
  }

  // ============================================================
  // COLLISIONS
  // ============================================================

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.player, this.crumblingPlatforms);
    this.physics.add.collider(this.enemyGroup, this.platforms);
    this.physics.add.collider(this.enemyGroup, this.movingPlatforms);

    // Coins
    this.physics.add.overlap(this.player, this.coinGroup, (_, coin) => {
      const c = coin as Phaser.GameObjects.Rectangle;
      if (c.getData('collected')) return;
      c.setData('collected', true);
      const cg = c.getData('graphics') as Phaser.GameObjects.Graphics;
      if (cg) {
        this.tweens.killTweensOf(cg);
        this.tweens.add({ targets: cg, y: '-=28', alpha: 0, scaleX: 1.6, scaleY: 1.6, duration: 300, ease: 'Power2', onComplete: () => cg.destroy() });
      }
      c.destroy();
      this.player.collectCoin();
      this.coinsCollected++;
      this.hudScene?.updateCoins(this.player.coins);
      this.spawnCoinBurst(c.x, c.y);
    });

    // Enemies
    this.physics.add.overlap(this.player, this.enemyGroup, (_, enemy) => {
      const e = enemy as Enemy;
      if (e.isDead || this.player.isDead()) return;
      const pBody = this.player.body as Phaser.Physics.Arcade.Body;
      if (pBody.velocity.y > 50 && this.player.y < e.y - 10) {
        this.registerKill(e);
        e.takeDamage(1);
        pBody.velocity.y = -480;
      } else {
        this.playerTakeDamage();
      }
    });

    // Boss overlap
    if (this.boss) {
      this.physics.add.overlap(this.player, this.boss, () => {
        if (!this.boss || this.boss.state === 'DEAD' || this.player.isDead() || this.bossDefeated) return;
        const pBody = this.player.body as Phaser.Physics.Arcade.Body;
        // Stomp boss head
        if (pBody.velocity.y > 60 && this.player.y < this.boss.y - 50) {
          this.boss.takeDamage(1);
          pBody.velocity.y = -550;
          this.hudScene?.showBossBar(true, 'STONE GIANT', this.boss.maxHealth, this.boss.health);
          this.hudScene?.showMessage('HIT!', '#FFD700', 600);
        } else if (!this.player.isInvulnerable) {
          this.playerTakeDamage();
        }
      });
    }

    // Goal
    this.physics.add.overlap(this.player, this.goalZone, () => {
      if (this.isTransitioning) return;
      // Boss level: goal only opens after boss defeat
      if (this.levelData.isBoss && !this.bossDefeated) {
        this.hudScene?.showMessage('!נצח את הבוס תחילה', '#FF8888', 1200);
        return;
      }
      // Regular level: must kill all enemies first
      // Filter: alive = not dead AND scene still active (not already destroyed)
      const aliveEnemies = this.enemies.filter(e => !e.isDead && e.active).length;
      if (aliveEnemies > 0) {
        this.hudScene?.showMessage(`נותרו ${aliveEnemies} מפלצות!`, '#FF8888', 1200);
        return;
      }
      this.completeLevel();
    });
  }

  // ============================================================
  // PARTICLE EFFECTS
  // ============================================================

  private spawnCoinBurst(x: number, y: number): void {
    for (let i = 0; i < 7; i++) {
      const p = this.add.graphics().setDepth(8);
      p.fillStyle(0xFFD700);
      p.fillCircle(0, 0, 3.5);
      p.setPosition(x, y);
      const a = Math.random() * Math.PI * 2;
      const spd = 80 + Math.random() * 130;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * spd * 0.6,
        y: y + Math.sin(a) * spd * 0.6 - 30,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: 380 + Math.random() * 180, ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  private spawnStompShockwave(bossX: number, bossY: number): void {
    // Ground crack lines
    for (let i = 0; i < 6; i++) {
      const line = this.add.graphics().setDepth(4);
      line.lineStyle(3, 0xFF4500, 0.8);
      const angle = (i / 6) * Math.PI * 2;
      const len = 60 + Math.random() * 80;
      line.lineBetween(bossX, bossY, bossX + Math.cos(angle) * len, bossY + Math.sin(angle) * len * 0.3);
      this.tweens.add({ targets: line, alpha: 0, duration: 700, onComplete: () => line.destroy() });
    }
    // Expanding ring
    const ring = this.add.graphics().setDepth(4);
    ring.lineStyle(4, 0xFF6F00, 0.9);
    ring.strokeCircle(bossX, bossY, 10);
    this.tweens.add({
      targets: ring, scaleX: 6, scaleY: 1.5, alpha: 0,
      duration: 600, ease: 'Power2', onComplete: () => ring.destroy()
    });
  }

  private spawnDeathExplosion(x: number, y: number): void {
    for (let i = 0; i < 20; i++) {
      const p = this.add.graphics().setDepth(10);
      const colors = [0xFF4500, 0xFFD700, 0xFF8C00, 0xFFFFFF, 0x78909C];
      p.fillStyle(colors[Math.floor(Math.random() * colors.length)]);
      const sz = 4 + Math.random() * 12;
      p.fillRect(-sz/2, -sz/2, sz, sz);
      p.setPosition(x + (Math.random() - 0.5) * 60, y - 60 + (Math.random() - 0.5) * 60);
      const a = Math.random() * Math.PI * 2;
      const spd = 200 + Math.random() * 400;
      this.tweens.add({
        targets: p,
        x: p.x + Math.cos(a) * spd * 0.8,
        y: p.y + Math.sin(a) * spd * 0.5 - 100,
        alpha: 0, scaleX: 0.1, scaleY: 0.1, angle: Math.random() * 720,
        duration: 800 + Math.random() * 600, ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
    // Screen flash
    this.cameras.main.flash(300, 255, 200, 100);
  }

  private startAmbientParticles(): void {
    const worldConfig = getWorldConfig(this.currentLevel);
    const W = this.scale.width;
    const H = this.scale.height;

    if (worldConfig.ambientParticles === 'bubbles') {
      this.time.addEvent({
        delay: 350, loop: true,
        callback: () => {
          const bx = this.cameras.main.scrollX + Math.random() * W;
          const b = this.add.graphics().setDepth(1);
          const r = 2 + Math.random() * 5;
          b.lineStyle(1, 0xAADDFF, 0.6);
          b.strokeCircle(bx, H - 30, r);
          this.tweens.add({
            targets: b, y: -80, alpha: 0,
            duration: 2000 + Math.random() * 1500,
            onComplete: () => b.destroy()
          });
        }
      });
    }

    if (worldConfig.ambientParticles === 'leaves') {
      this.time.addEvent({
        delay: 600, loop: true,
        callback: () => {
          const lx = this.cameras.main.scrollX + Math.random() * W;
          const l = this.add.graphics().setDepth(1);
          l.fillStyle(0x66BB6A, 0.7);
          l.fillEllipse(lx, 60, 8, 5);
          this.tweens.add({
            targets: l,
            x: lx + (Math.random() - 0.5) * 120,
            y: H + 60, alpha: 0, angle: 360,
            duration: 3000 + Math.random() * 2000,
            ease: 'Linear', onComplete: () => l.destroy()
          });
        }
      });
    }
  }

  // ============================================================
  // GAME LOGIC
  // ============================================================

  private playerTakeDamage(): void {
    if (this.godMode) return;
    this.player.takeDamage(1);
    this.hudScene?.updateHealth(this.player.health, this.player.maxHealth);
    this.cameras.main.shake(120, 0.006);
    this.cameras.main.flash(80, 255, 50, 50);
    this.comboCount = 0;
    this.comboTimer = 0;
    if (this.player.isDead()) {
      this.time.delayedCall(700, () => this.restartLevel());
    }
  }

  private registerKill(enemy: Enemy): void {
    this.comboCount++;
    this.comboTimer = 2.5;
    if (this.comboCount > 1) {
      this.hudScene?.showMessage(`${this.comboCount}x COMBO!`, '#FF8C00', 900);
    }
  }

  private completeLevel(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    // Restore full health on level complete
    this.player.health = this.player.maxHealth;
    this.hudScene?.updateHealth(this.player.health, this.player.maxHealth);
    const elapsed = (this.time.now - this.levelStartTime) / 1000;
    saveManager.completeLevel(this.currentLevel, this.coinsCollected, elapsed);
    this.hudScene?.showMessage('!כל הכבוד! 🎉', '#FFD700', 2500);
    this.cameras.main.flash(500, 255, 240, 100);
    this.time.delayedCall(2000, () => {
      const next = this.currentLevel + 1;
      if (next > 100) {
        this.hudScene?.showMessage('YOU RESCUED SAVTA! 🏆❤️', '#FF69B4', 6000);
      } else {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.stop('HUDScene');
          this.scene.stop('TransitionScene');
          this.scene.restart({ level: next, lives: this.lives });
        });
      }
    });
  }

  private restartLevel(): void {
    this.lives--;
    this.cameras.main.shake(200, 0.01);
    if (this.lives <= 0) {
      // Game Over
      this.time.delayedCall(400, () => {
        this.cameras.main.fadeOut(500, 150, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.stop('HUDScene');
          this.scene.start('MainMenuScene');
        });
      });
      this.hudScene?.showMessage('GAME OVER! 💀', '#FF2222', 3000);
      return;
    }
    this.hudScene?.showMessage(`חיים: ${this.lives} ❤️`, '#FF8888', 1200);
    this.time.delayedCall(800, () => {
      this.cameras.main.fadeOut(300, 100, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('HUDScene');
        // Pass lives count to next restart so it persists
        this.scene.restart({ level: this.currentLevel, lives: this.lives });
      });
    });
  }

  private getWorldName(): string {
    const names: Record<string, string> = { earth:'ארץ', water:'מים', sky:'שמיים', space:'חלל' };
    return names[this.worldKey] ?? 'Earth';
  }

  private getWorldEmoji(): string {
    const em: Record<string, string> = { earth:'🌍', water:'🌊', sky:'☁️', space:'🚀' };
    return em[this.worldKey] ?? '🌍';
  }

  // ============================================================
  // UPDATE
  // ============================================================

  update(_time: number, delta: number): void {
    // ---- Pit detection — player falls below screen ----
    const pitThreshold = this.scale.height + 120;
    if (this.player && this.player.y > pitThreshold && !this.isTransitioning) {
      this.isTransitioning = true;
      this.cameras.main.flash(300, 255, 0, 0, false);
      if (!this.godMode) {
        this.player.takeDamage(1);
        this.hudScene?.updateHealth(this.player.health, this.player.maxHealth);
      }
      this.time.delayedCall(400, () => {
        // Teleport back to spawn
        this.player.setPosition(
          this.levelData.spawnPoint.x,
          this.levelData.spawnPoint.y
        );
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        this.isTransitioning = false;
      });
    }
    const dt = Math.min(delta / 1000, 0.05);
    if (this.isTransitioning) return;

    const input = this.inputManager.getState();

    this.player.update(dt, input);
    const worldBottom = this.physics.world.bounds.height;
    for (const e of this.enemies) {
      if (!e.isDead) {
        // Kill enemies that fall into pits
        if (e.y > worldBottom + 100) {
          e.die();
        } else {
          e.update(dt);
        }
      }
    }

    // === ISO-STYLE DROP SHADOWS under all entities ===
    if (this.shadowGfx) {
      this.shadowGfx.clear();
      this.shadowGfx.fillStyle(0x000000, 0.18);
      // Player shadow — ellipse at feet, squashed for perspective
      if (!this.player.isDead()) {
        this.shadowGfx.fillEllipse(this.player.x, this.player.y + 2, 28, 7);
      }
      // Enemy shadows
      for (const e of this.enemies) {
        if (!e.isDead) {
          this.shadowGfx.fillEllipse(e.x, e.y + 2, 26, 6);
        }
      }
      // Boss shadow
      if (this.boss && this.boss.state !== 'DEAD') {
        this.shadowGfx.fillStyle(0x000000, 0.22);
        this.shadowGfx.fillEllipse(this.boss.x, this.boss.y + 4, 60, 12);
      }
    }

    // Boss update
    if (this.boss && this.boss.state !== 'DEAD') {
      this.boss.update(dt, this.player.x, this.player.y);
      this.hudScene?.updateBossHealth(this.boss.health);

      // Rock collision with player
      for (const rb of this.boss.getRockBodies()) {
        const dx = rb.x - this.player.x;
        const dy = rb.y - this.player.y;
        if (Math.sqrt(dx*dx + dy*dy) < rb.size + 16) {
          this.playerTakeDamage();
        }
      }
    }

    // Hammer hits on boss
    if (this.boss && !this.bossDefeated) {
      const hb = this.player.getHammerHitbox();
      if (hb) {
        const bx = this.boss.x, by = this.boss.y;
        if (hb.contains(bx, by - 60) || hb.contains(bx, by)) {
          this.boss.takeDamage(2);
          this.hudScene?.updateBossHealth(this.boss.health);
        }
      }
    }

    // Hammer hits on regular enemies
    const hb = this.player.getHammerHitbox();
    if (hb) {
      for (const e of this.enemies) {
        if (!e.isDead) {
          const eb = e.body as Phaser.Physics.Arcade.Body;
          if (hb.contains(eb.x + eb.width/2, eb.y + eb.height/2)) {
            const killed = e.takeDamage(1);
            if (killed) this.registerKill(e);
          }
        }
      }
    }

    // Moving platforms — compute delta per frame for player attachment
    this.movingPlatforms.getChildren().forEach((child) => {
      const pl = child as Phaser.GameObjects.Rectangle;
      const startX  = pl.getData('startX') as number;
      const startY  = pl.getData('startY') as number ?? pl.y;
      const moveX   = pl.getData('moveX') as number;
      const moveY   = pl.getData('moveY') as number ?? 0;
      const spd     = pl.getData('moveSpeed') as number;
      const phase   = pl.getData('phase') as number;
      const gfx     = pl.getData('gfx') as Phaser.GameObjects.Graphics;

      const oldX = pl.x;
      const oldY = pl.y;

      const nx = moveX ? startX + Math.sin(_time * 0.001 * spd + phase) * moveX : pl.x;
      const ny = moveY ? (startY + Math.sin(_time * 0.001 * spd + phase + Math.PI / 2) * moveY) : pl.y;

      const body = pl.body as Phaser.Physics.Arcade.Body;
      body.reset(nx, ny);
      if (gfx) gfx.setPosition(nx - pl.width / 2, ny - pl.height / 2);

      pl.setData('lastDeltaX', pl.x - oldX);
      pl.setData('lastDeltaY', pl.y - oldY);
    });

    // Player riding — attach player to moving platform if standing on it
    if (this.player && !this.isTransitioning) {
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      const pBottom = this.player.y + this.player.height / 2;
      for (const child of this.movingPlatforms.getChildren()) {
        const pl = child as Phaser.GameObjects.Rectangle;
        const platTop = pl.y - pl.height / 2;
        const platLeft = pl.x - pl.width / 2 - 8;
        const platRight = pl.x + pl.width / 2 + 8;
        const onTop = Math.abs(pBottom - platTop) < 8;
        const hOverlap = this.player.x > platLeft && this.player.x < platRight;
        const notJumping = playerBody.velocity.y >= -50;
        if (onTop && hOverlap && notJumping) {
          const dx = pl.getData('lastDeltaX') as number ?? 0;
          const dy = pl.getData('lastDeltaY') as number ?? 0;
          this.player.x += dx;
          this.player.y += dy;
          playerBody.reset(this.player.x, this.player.y);
        }
      }
    }

    // Crumbling platforms state machine
    const playerBody2 = this.player?.body as Phaser.Physics.Arcade.Body;
    const pBottom2 = this.player ? this.player.y + this.player.height / 2 : -9999;
    for (const cd of this.crumblingData) {
      if (cd.state === 'falling') continue;

      if (cd.state === 'solid') {
        // Check if player is standing on this crumbling platform
        const platTop = cd.rect.y - cd.rect.height / 2;
        const platLeft = cd.rect.x - cd.rect.width / 2 - 6;
        const platRight = cd.rect.x + cd.rect.width / 2 + 6;
        const onTop = Math.abs(pBottom2 - platTop) < 8;
        const hOverlap = this.player && this.player.x > platLeft && this.player.x < platRight;
        const notJumping = playerBody2 && playerBody2.velocity.y >= -50;
        if (onTop && hOverlap && notJumping) {
          cd.state = 'shaking';
          cd.shakeTimer = 0;
        }
      } else if (cd.state === 'shaking') {
        cd.shakeTimer += delta;
        // Shake visual effect
        cd.shakeOffset = Math.sin(cd.shakeTimer * 0.04) * 3;
        cd.gfx.setX(cd.gfx.x + (cd.shakeOffset - (cd.shakeOffset > 0 ? 0 : 0)));
        cd.gfx.setPosition(
          cd.rect.x - cd.rect.width / 2 + Math.sin(cd.shakeTimer * 0.04) * 3,
          cd.rect.y - cd.rect.height / 2
        );
        if (cd.shakeTimer >= 500) {
          // Start falling — remove physics body, animate fall
          cd.state = 'falling';
          const body = cd.rect.body as Phaser.Physics.Arcade.StaticBody;
          body.enable = false;
          this.tweens.add({
            targets: cd.gfx,
            y: cd.gfx.y + 350,
            alpha: 0,
            duration: 700,
            ease: 'Power2',
            onComplete: () => {
              cd.gfx.destroy();
              cd.rect.destroy();
            },
          });
        }
      }
    }

    // Dash trail
    if (this.player.isDashing && Math.random() < 0.4) {
      const t = this.add.graphics().setDepth(4).setAlpha(0.45);
      t.fillStyle(0x00AAFF, 0.5);
      t.fillRoundedRect(-16, -24, 32, 48, 4);
      t.setPosition(this.player.x, this.player.y);
      this.tweens.add({ targets: t, alpha: 0, scaleX: 0.5, duration: 180, onComplete: () => t.destroy() });
    }

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }

    // Fall death (skipped in god mode — player teleports back instead)
    if (!this.godMode && this.player.y > this.physics.world.bounds.height + 80) {
      this.player.takeDamage(this.player.health);
      this.hudScene?.updateHealth(0, this.player.maxHealth);
      this.time.delayedCall(300, () => this.restartLevel());
    }

    // Timer update
    const elapsed = (this.time.now - this.levelStartTime) / 1000;
    if (this.levelData.timeLimit && this.levelData.timeLimit > 0) {
      this.hudScene?.updateTimer(elapsed, this.levelData.timeLimit);
    }

    // Progress bar update
    this.hudScene?.updateProgress(this.player.x, this.levelData.goalX);

    if (input.pauseJustPressed) {
      console.log('PAUSE — TODO: Pause scene');
    }
  }
}
