// EnemyRenderer.ts — pre-bakes enemy sprites into RenderTextures
// Called ONCE at level load, returns texture keys
// Zero per-frame CPU cost

export type EnemyType = 'slime' | 'beetle' | 'spinner' | 'jellyfish' | 'crab' | 'bird' | 'robot';

export function bakeEnemyTextures(scene: Phaser.Scene): void {
  // Only bake if not already done
  if (scene.textures.exists('enemy_slime_0')) return;

  // Slime variants
  for (let v = 0; v < 3; v++) {
    const rt = scene.add.renderTexture(0, 0, 48, 40);
    const g = scene.add.graphics();
    const colors = [0x66BB6A, 0x29B6F6, 0xEF5350];
    const c = colors[v % colors.length];
    // Body
    g.fillStyle(c);
    g.fillEllipse(24, 24, 36, 28);
    // Eyes
    g.fillStyle(0xFFFFFF);
    g.fillCircle(17, 16, 5);
    g.fillCircle(31, 16, 5);
    g.fillStyle(0x111111);
    g.fillCircle(18, 16, 3);
    g.fillCircle(32, 16, 3);
    // Smile
    g.lineStyle(1.5, 0x000000, 0.5);
    g.strokeCircle(24, 22, 6);
    rt.draw(g, 0, 0);
    rt.saveTexture(`enemy_slime_${v}`);
    g.destroy();
    rt.destroy();
  }

  // Beetle variants
  for (let v = 0; v < 3; v++) {
    const rt = scene.add.renderTexture(0, 0, 44, 36);
    const g = scene.add.graphics();
    const shells = [0xD32F2F, 0x6A1B9A, 0x1565C0];
    const c = shells[v % shells.length];
    // Shell
    g.fillStyle(c);
    g.fillEllipse(22, 18, 34, 28);
    // Shell highlight
    g.fillStyle(0xFFFFFF, 0.18);
    g.fillEllipse(18, 12, 14, 10);
    // Head
    g.fillStyle(0x3E2723);
    g.fillCircle(22, 7, 8);
    // Legs
    g.lineStyle(2, 0x3E2723, 0.9);
    for (let i = -1; i <= 1; i++) {
      g.lineBetween(6, 18 + i * 7, 0, 16 + i * 8);
      g.lineBetween(38, 18 + i * 7, 44, 16 + i * 8);
    }
    // Eyes
    g.fillStyle(0xFF6F00);
    g.fillCircle(18, 6, 2.5);
    g.fillCircle(26, 6, 2.5);
    rt.draw(g, 0, 0);
    rt.saveTexture(`enemy_beetle_${v}`);
    g.destroy();
    rt.destroy();
  }

  // Extra enemy types
  const extraTypes: [string, number, number, number][] = [
    ['enemy_jellyfish_0', 0x7986CB, 40, 44],  // indigo jellyfish
    ['enemy_crab_0',      0xE64A19, 44, 32],  // orange crab
    ['enemy_bird_0',      0xFF8F00, 36, 32],  // amber bird
    ['enemy_robot_0',     0x607D8B, 40, 44],  // blue-grey robot
  ];
  for (const [key, color, w, h] of extraTypes) {
    if (scene.textures.exists(key)) continue;
    const rt2 = scene.add.renderTexture(0, 0, w, h);
    const g2 = scene.add.graphics();
    g2.fillStyle(color); g2.fillEllipse(w/2, h/2, w*0.75, h*0.7);
    g2.fillStyle(0xFFFFFF); g2.fillCircle(w/2-5, h/2-4, 4); g2.fillCircle(w/2+5, h/2-4, 4);
    g2.fillStyle(0x111111); g2.fillCircle(w/2-4, h/2-4, 2); g2.fillCircle(w/2+6, h/2-4, 2);
    rt2.draw(g2, 0, 0); rt2.saveTexture(key); g2.destroy(); rt2.destroy();
  }

  // Spinner (boss-style)
  const rt = scene.add.renderTexture(0, 0, 44, 44);
  const g = scene.add.graphics();
  g.fillStyle(0xB71C1C);
  g.fillCircle(22, 22, 18);
  g.fillStyle(0xE53935);
  g.fillCircle(22, 22, 12);
  g.lineStyle(2, 0xFF8F00, 0.8);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g.lineBetween(22, 22, 22 + Math.cos(a) * 18, 22 + Math.sin(a) * 18);
  }
  rt.draw(g, 0, 0);
  rt.saveTexture('enemy_spinner_0');
  g.destroy();
  rt.destroy();
}
