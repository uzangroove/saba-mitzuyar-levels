// EnemyRenderer.ts — pre-bakes enemy sprites into RenderTextures
// If custom monster images are loaded (monster1..monster6), uses those.
// Otherwise falls back to procedurally drawn shapes.
// Called ONCE at level load. Zero per-frame CPU cost.

export type EnemyType = 'monster1' | 'monster2' | 'monster3' | 'monster4' | 'monster5' | 'monster6';

// Maps each monsterN to its own slot N
const MONSTER_SLOT: Record<EnemyType, number> = {
  monster1: 1,
  monster2: 2,
  monster3: 3,
  monster4: 4,
  monster5: 5,
  monster6: 6,
};

export function bakeEnemyTextures(scene: Phaser.Scene): void {
  // Only bake if not already done
  if (scene.textures.exists('enemy_monster1_0')) return;

  // --- Try to use custom monster images first ---
  const types: EnemyType[] = ['monster1', 'monster2', 'monster3', 'monster4', 'monster5', 'monster6'];

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
    monster1: { color: 0x66BB6A, w: 48, h: 40 },
    monster2: { color: 0xD32F2F, w: 44, h: 36 },
    monster3: { color: 0x7986CB, w: 40, h: 44 },
    monster4: { color: 0xE64A19, w: 44, h: 32 },
    monster5: { color: 0xFF8F00, w: 36, h: 32 },
    monster6: { color: 0x607D8B, w: 40, h: 44 },
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
