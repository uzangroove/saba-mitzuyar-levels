// ============================================================
// systems/ParallaxBackground.ts
// Multi-layer parallax background system.
//
// USAGE (inside GameScene.create()):
//   this.parallax = new ParallaxBackground(this, worldWidth, EARTH_PARALLAX);
//   // In update():
//   this.parallax.update();
//
// Each layer is a TileSprite that repeats horizontally, so the
// background image can be any width — it tiles seamlessly. The
// scrollFactor controls "distance": 0.0 = infinitely far (never
// moves), 1.0 = same speed as camera, >1.0 = foreground (moves
// faster than the camera, closer than the player).
// ============================================================

import Phaser from 'phaser';

export interface ParallaxLayer {
  /** Texture key already loaded in preload() */
  key: string;
  /** 0.0 = static, 1.0 = camera speed, >1.0 = foreground */
  scrollFactor: number;
  /** Depth (draw order). Lower = further back. */
  depth: number;
  /** Vertical position relative to screen top (0-1). 1 = bottom. */
  yAnchor?: number;
  /** Pixel offset applied after yAnchor */
  yOffset?: number;
  /** Optional alpha (0-1) */
  alpha?: number;
  /** Optional auto-drift speed (px/sec) — for clouds, mist */
  driftX?: number;
  /** Optional tint color (0xRRGGBB) — great for day/night reuse */
  tint?: number;
  /** Optional blend mode ('ADD' for glow, 'MULTIPLY' for darkening) */
  blendMode?: Phaser.BlendModes;
  /** If set, layer height is fixed instead of matching image */
  height?: number;
}

interface LayerRuntime {
  cfg: ParallaxLayer;
  sprite: Phaser.GameObjects.TileSprite;
  driftAccum: number;
}

export class ParallaxBackground {
  private scene: Phaser.Scene;
  private worldWidth: number;
  private layers: LayerRuntime[] = [];

  constructor(scene: Phaser.Scene, worldWidth: number, config: ParallaxLayer[]) {
    this.scene = scene;
    this.worldWidth = worldWidth;

    const cam = scene.cameras.main;
    const W = cam.width;
    const H = cam.height;

    for (const cfg of config) {
      // If texture missing, skip silently (fallback happens elsewhere)
      if (!scene.textures.exists(cfg.key)) {
        console.warn(`[Parallax] texture "${cfg.key}" missing — skipping layer`);
        continue;
      }

      const tex = scene.textures.get(cfg.key).getSourceImage() as HTMLImageElement;
      const layerH = cfg.height ?? tex.height;

      // yAnchor: 0 = top, 1 = bottom. Default is bottom.
      const anchor = cfg.yAnchor ?? 1;
      const yPos = H * anchor - layerH * anchor + (cfg.yOffset ?? 0);

      const sprite = scene.add.tileSprite(
        0,
        yPos,
        W,          // width = screen width (we handle scroll manually)
        layerH,
        cfg.key
      );

      sprite.setOrigin(0, 0);
      sprite.setScrollFactor(0);         // We drive scrolling manually via tilePositionX
      sprite.setDepth(cfg.depth);
      if (cfg.alpha !== undefined) sprite.setAlpha(cfg.alpha);
      if (cfg.tint !== undefined) sprite.setTint(cfg.tint);
      if (cfg.blendMode !== undefined) sprite.setBlendMode(cfg.blendMode);

      this.layers.push({ cfg, sprite, driftAccum: 0 });
    }
  }

  /** Call once per frame from GameScene.update() */
  update(_time?: number, delta?: number): void {
    const cam = this.scene.cameras.main;
    const dt = (delta ?? 16.67) / 1000;

    for (const l of this.layers) {
      // Camera-based parallax offset
      l.driftAccum += (l.cfg.driftX ?? 0) * dt;
      l.sprite.tilePositionX = cam.scrollX * l.cfg.scrollFactor + l.driftAccum;
      // Also update Y to follow camera vertical (for tall levels)
      // Keep as-is: layers stick to screen bottom by design.
    }
  }

  /** Resize handler — call from scene's resize event if needed */
  resize(): void {
    const cam = this.scene.cameras.main;
    for (const l of this.layers) {
      l.sprite.setSize(cam.width, l.sprite.height);
    }
  }

  destroy(): void {
    for (const l of this.layers) l.sprite.destroy();
    this.layers = [];
  }
}

// ============================================================
// EARTH WORLD — 6-layer parallax config
// ============================================================
// Depth ordering (further back = lower number):
//  -20 sky      — never moves (scrollFactor 0)
//  -18 mountains — very slow
//  -16 hills    — slow
//  -14 trees far — medium
//  -12 trees near — fast
//  -10 grass foreground — faster than camera (pops forward)
// ============================================================

export const EARTH_PARALLAX: ParallaxLayer[] = [
  // Clouds — anchored to TOP of screen, drift slowly on their own
  {
    key: 'earth_clouds',
    scrollFactor: 0.08,
    depth: -19,
    yAnchor: 0,        // top-anchored (clouds are at top of the image)
    yOffset: 0,
    alpha: 0.85,
    driftX: 10,
  },
  // Mountains — very slow, far in the distance
  {
    key: 'earth_mountains',
    scrollFactor: 0.18,
    depth: -18,
    yAnchor: 1,        // bottom-anchored so terrain sits at screen bottom
    yOffset: 0,
    alpha: 0.85,
  },
  // Hills — mid-distance
  {
    key: 'earth_hills',
    scrollFactor: 0.38,
    depth: -16,
    yAnchor: 1,
    yOffset: 0,
  },
  // Trees far — closer than hills
  {
    key: 'earth_trees_far',
    scrollFactor: 0.62,
    depth: -14,
    yAnchor: 1,
    yOffset: 0,
    alpha: 0.95,
  },
  // Trees near — even closer
  {
    key: 'earth_trees_near',
    scrollFactor: 0.90,
    depth: -12,
    yAnchor: 1,
    yOffset: 0,
    alpha: 0.9,
  },
  // Grass foreground — moves FASTER than camera (signature parallax effect)
  {
    key: 'earth_grass_fg',
    scrollFactor: 1.20,
    depth: 100,        // in front of gameplay
    yAnchor: 1,
    yOffset: 0,
    alpha: 0.85,
  },
];
