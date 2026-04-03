// EnemyRenderer.ts — pre-bakes enemy sprites into RenderTextures
// If custom monster images are loaded (monster1..monster6), uses those.
// Otherwise falls back to procedurally drawn shapes.
// Called ONCE at level load. Zero per-frame CPU cost.

export type EnemyType = 'slime' | 'beetle' | 'spinner' | 'jellyfish' | 'crab' | 'bird' | 'robot';

// Maps enemy types to which custom monster slot (1-6) to use
const MONSTER_SLOT: Record<EnemyType, number> = {
  slime:     1,
  beetle:    2,
  jellyfish: 3,
  crab:      4,
  bird:      5,
  robot:     6,
  spinner:   1, // spinner uses monster1 as fallback
};

export function bakeEnemyTextures(scene: Phaser.Scene): void {
  // Only bake if not already done
  if (scene.textures.exists('enemy_slime_0')) return;

  // --- Try to use custom monster images first ---
  const types: EnemyType[] = ['slime', 'beetle', 'jellyfish', 'crab', 'bird', 'robot', 'spinner'];

  for (const type of types) {
    const slot = MONSTER_SLOT[type];
    const customKey = `monster${slot}`;
    const targetKey = `enemy_${type}_0`;

    if (scene.textures.exists(customKey)) {
      // Copy the custom texture under the enemy key so Enemy.ts finds it
      const frame = scene.textures.get(customKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      scene.textures.addImage(targetKey, frame as HTMLImageElement);
    } else {
      // Fallback: bake a simple procedural shape
      _bakeFallback(scene, type);
    }

    // Variants 1 and 2 reuse the same base (or tinted fallback)
    if (!scene.textures.exists(`enemy_${type}_1`)) {
      const src = scene.textures.get(targetKey).getSourceImage() as HTMLImageElement;
      scene.textures.addImage(`enemy_${type}_1`, src);
      scene.textures.addImage(`enemy_${type}_2`, src);
    }
  }
}

function _bakeFallback(scene: Phaser.Scene, type: EnemyType): void {
  type FallbackDef = { color: number; w: number; h: number };
  const defs: Record<EnemyType, FallbackDef> = {
    slime:     { color: 0x66BB6A, w: 48, h: 40 },
    beetle:    { color: 0xD32F2F, w: 44, h: 36 },
    spinner:   { color: 0xB71C1C, w: 44, h: 44 },
    jellyfish: { color: 0x7986CB, w: 40, h: 44 },
    crab:      { color: 0xE64A19, w: 44, h: 32 },
    bird:      { color: 0xFF8F00, w: 36, h: 32 },
    robot:     { color: 0x607D8B, w: 40, h: 44 },
  };

  const { color, w, h } = defs[type];
  const key = `enemy_${type}_0`;
  if (scene.textures.exists(key)) return;

  const rt = scene.add.renderTexture(0, 0, w, h);
  const g = scene.add.graphics();
  g.fillStyle(color);
  g.fillEllipse(w / 2, h / 2, w * 0.8, h * 0.8);
  g.fillStyle(0xFFFFFF);
  g.fillCircle(w / 2 - 6, h / 2 - 4, 5);
  g.fillCircle(w / 2 + 6, h / 2 - 4, 5);
  g.fillStyle(0x111111);
  g.fillCircle(w / 2 - 5, h / 2 - 4, 2.5);
  g.fillCircle(w / 2 + 7, h / 2 - 4, 2.5);
  rt.draw(g, 0, 0);
  rt.saveTexture(key);
  g.destroy();
  rt.destroy();
}
