// ============================================================
// levels/LevelRegistry.ts
// Level data — migrated structure from prototype, extended
// ============================================================

export interface EnemyConfig {
  type: 'monster1' | 'monster2' | 'monster3' | 'monster4' | 'monster5' | 'monster6';
  difficulty?: number;
  x: number;
  y: number;
  patrolDistance: number;
  variant?: number;
}

export interface CoinConfig {
  x: number;
  y: number;
}

export interface PlatformConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'solid' | 'passthrough' | 'moving' | 'crumbling';
  // For moving platforms:
  moveX?: number;
  moveY?: number;
  moveSpeed?: number;
}

export interface LevelData {
  id: number;
  worldType: 'earth' | 'water' | 'sky' | 'space' | 'crayon';
  paletteName: string;
  music: string;
  spawnPoint: { x: number; y: number };
  platforms: PlatformConfig[];
  enemies: EnemyConfig[];
  coins: CoinConfig[];
  goalX: number;
  goalY: number;
  isBoss?: boolean;
  timeLimit?: number;        // Seconds (0 = no limit)
  parallaxLayers?: number;   // How many background layers
}

// ============================================================
// LEVEL DATA
// ============================================================

export const LEVELS: LevelData[] = [
  // ---- LEVEL 1: Tutorial Earth ----
  {
    id: 1,
    worldType: 'earth',
    paletteName: 'DAY',
    music: 'earth_theme',
    spawnPoint: { x: 80, y: 420 },
    goalX: 1720,
    goalY: 380,
    platforms: [
      // Ground
      { x: 0,    y: 500, width: 2000, height: 40 },
      // Platforms
      { x: 300,  y: 400, width: 140, height: 20 },
      { x: 520,  y: 330, width: 120, height: 20 },
      { x: 680,  y: 260, width: 100, height: 20 },
      { x: 860,  y: 330, width: 140, height: 20 },
      { x: 1040, y: 400, width: 100, height: 20 },
      { x: 1180, y: 310, width: 120, height: 20 },
      { x: 1380, y: 380, width: 160, height: 20 },
      { x: 1560, y: 290, width: 120, height: 20 },
      { x: 1680, y: 400, width: 120, height: 20 },
    ],
    enemies: [
      { type: 'monster1',  x: 400,  y: 460, patrolDistance: 180, variant: 0 },
      { type: 'monster2', x: 800,  y: 460, patrolDistance: 120, variant: 0 },
      { type: 'monster4',   x: 1200, y: 460, patrolDistance: 200, variant: 0 },
    ],
    coins: [
      { x: 340, y: 360 }, { x: 380, y: 360 }, { x: 420, y: 360 },
      { x: 560, y: 290 }, { x: 600, y: 290 },
      { x: 700, y: 220 }, { x: 730, y: 220 },
      { x: 900, y: 290 }, { x: 940, y: 290 },
      { x: 1220, y: 270 }, { x: 1260, y: 270 },
      { x: 1420, y: 340 }, { x: 1600, y: 250 },
    ],
    timeLimit: 0,
    parallaxLayers: 3,
  },

  // ---- LEVEL 2: Earth — Wider Gaps ----
  {
    id: 2,
    worldType: 'earth',
    paletteName: 'DAY',
    music: 'earth_theme',
    spawnPoint: { x: 80, y: 420 },
    goalX: 1820,
    goalY: 350,
    // Level 2: Lake crossing! Gap in middle = fall into lake = lose a life
    // Left bank → stepping stones over lake → right bank → raised area
    platforms: [
      // Left bank (solid ground)
      { x: 0,    y: 500, width: 380, height: 40 },
      // Stepping stones over lake (small platforms, must jump)
      { x: 460,  y: 490, width: 80,  height: 20 },
      { x: 620,  y: 470, width: 80,  height: 20 },
      { x: 780,  y: 485, width: 80,  height: 20 },
      { x: 940,  y: 465, width: 80,  height: 20 },
      // Right bank (solid ground continues)
      { x: 1100, y: 500, width: 800, height: 40 },
      // Upper platforms on right side
      { x: 1180, y: 400, width: 120, height: 20 },
      { x: 1360, y: 340, width: 140, height: 20 },
      { x: 1540, y: 400, width: 120, height: 20 },
      { x: 1700, y: 350, width: 200, height: 20 },
    ],
    enemies: [
      // Left bank - solid ground (platform top y=500, enemy bottom at y=495)
      { type: 'monster1',  x: 200,  y: 495, patrolDistance: 160, variant: 0 },
      // Right bank - solid ground (platform top y=500)
      { type: 'monster2', x: 1250, y: 495, patrolDistance: 90,  variant: 0 },
      { type: 'monster5',   x: 1500, y: 495, patrolDistance: 100, variant: 0 },
    ],
    coins: [
      { x: 500,  y: 450 }, { x: 660,  y: 430 }, { x: 820,  y: 445 },
      { x: 980,  y: 425 }, { x: 1200, y: 360 }, { x: 1390, y: 300 },
      { x: 1570, y: 360 }, { x: 1730, y: 310 }, { x: 1780, y: 310 },
    ],
    timeLimit: 0,
    parallaxLayers: 3,
  },

  // ---- LEVEL 3: Earth — Sunset ----
  {
    id: 3,
    worldType: 'earth',
    paletteName: 'SUNSET',
    music: 'earth_theme',
    spawnPoint: { x: 80, y: 380 },
    goalX: 1780,
    goalY: 300,
    platforms: [
      { x: 0,    y: 450, width: 2000, height: 40 },
      { x: 200,  y: 350, width: 120, height: 20, type: 'passthrough' },
      { x: 420,  y: 270, width: 120, height: 20, type: 'passthrough' },
      { x: 640,  y: 350, width: 160, height: 20 },
      { x: 860,  y: 260, width: 100, height: 20 },
      { x: 1020, y: 350, width: 140, height: 20 },
      { x: 1220, y: 280, width: 120, height: 20, type: 'moving', moveX: 80, moveSpeed: 1.2 },
      { x: 1460, y: 330, width: 140, height: 20 },
      { x: 1640, y: 260, width: 180, height: 20 },
    ],
    enemies: [
      { type: 'monster1',   x: 300,  y: 410, patrolDistance: 200, variant: 0 },
      { type: 'monster2',  x: 700,  y: 410, patrolDistance: 140, variant: 0 },
      { type: 'monster1', x: 1100, y: 410, patrolDistance: 160, variant: 0 },
      { type: 'monster6',   x: 1500, y: 410, patrolDistance: 120, variant: 0 },
    ],
    coins: [
      { x: 230, y: 310 }, { x: 450, y: 230 }, { x: 490, y: 230 },
      { x: 680, y: 310 }, { x: 890, y: 220 }, { x: 1060, y: 310 },
      { x: 1260, y: 240 }, { x: 1490, y: 290 }, { x: 1680, y: 220 },
    ],
    timeLimit: 0,
    parallaxLayers: 3,
  },
];


// ============ AUTO-GENERATED LEVELS ============
// This will be appended to LevelRegistry.ts

// ============================================================
// EARTH WORLD — Levels 4-9
// ============================================================

const earthLevel4: LevelData = {
  id: 4, worldType: 'earth', paletteName: 'DAY', music: 'earth_theme',
  spawnPoint: { x: 80, y: 420 }, goalX: 2200, goalY: 380,
  platforms: [
    { x: 0,    y: 500, width: 300, height: 40 },
    { x: 360,  y: 460, width: 120, height: 20, type: 'passthrough' },
    { x: 540,  y: 420, width: 120, height: 20, type: 'passthrough' },
    { x: 720,  y: 380, width: 120, height: 20, type: 'passthrough' },
    { x: 900,  y: 500, width: 400, height: 40 },
    { x: 960,  y: 400, width: 100, height: 20, type: 'passthrough' },
    { x: 1380, y: 460, width: 80,  height: 20, type: 'passthrough' },
    { x: 1520, y: 420, width: 80,  height: 20, type: 'passthrough' },
    { x: 1660, y: 380, width: 100, height: 20, type: 'passthrough' },
    { x: 1800, y: 500, width: 600, height: 40 },
    { x: 1860, y: 400, width: 120, height: 20, type: 'passthrough' },
    { x: 2040, y: 340, width: 120, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster1',   x: 180,  y: 495, patrolDistance: 120, variant: 0 },
    { type: 'monster2',  x: 1000, y: 495, patrolDistance: 150, variant: 0 },
    { type: 'monster6',   x: 1900, y: 495, patrolDistance: 100, variant: 0 },
    { type: 'monster1', x: 2100, y: 495, patrolDistance: 120, variant: 0 },
  ],
  coins: [
    { x: 420, y: 430 }, { x: 600, y: 390 }, { x: 780, y: 350 },
    { x: 1010, y: 370 }, { x: 1410, y: 430 }, { x: 1690, y: 350 },
    { x: 1900, y: 370 }, { x: 2080, y: 310 }, { x: 2140, y: 310 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const earthLevel5: LevelData = {
  id: 5, worldType: 'earth', paletteName: 'SUNSET', music: 'earth_theme',
  spawnPoint: { x: 80, y: 420 }, goalX: 2400, goalY: 360,
  platforms: [
    { x: 0,    y: 500, width: 250, height: 40 },
    { x: 300,  y: 440, width: 100, height: 20, type: 'passthrough' },
    { x: 460,  y: 380, width: 100, height: 20, type: 'passthrough' },
    { x: 620,  y: 440, width: 100, height: 20, type: 'passthrough' },
    { x: 780,  y: 500, width: 300, height: 40 },
    { x: 840,  y: 400, width: 80,  height: 20, type: 'passthrough' },
    { x: 1150, y: 460, width: 80,  height: 20 },
    { x: 1290, y: 420, width: 80,  height: 20 },
    { x: 1430, y: 380, width: 80,  height: 20 },
    { x: 1570, y: 420, width: 80,  height: 20 },
    { x: 1710, y: 500, width: 900, height: 40 },
    { x: 1780, y: 400, width: 120, height: 20, type: 'passthrough' },
    { x: 1980, y: 340, width: 140, height: 20, type: 'passthrough' },
    { x: 2180, y: 400, width: 120, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster1',   x: 150,  y: 495, patrolDistance: 100, variant: 0 },
    { type: 'monster1', x: 850,  y: 495, patrolDistance: 160, variant: 0 },
    { type: 'monster4',    x: 1750, y: 495, patrolDistance: 120, variant: 0 },
    { type: 'monster2',  x: 1950, y: 495, patrolDistance: 100, variant: 0 },
    { type: 'monster6',   x: 2200, y: 495, patrolDistance: 130, variant: 0 },
  ],
  coins: [
    { x: 330, y: 410 }, { x: 490, y: 350 }, { x: 650, y: 410 },
    { x: 870, y: 370 }, { x: 1180, y: 430 }, { x: 1460, y: 350 },
    { x: 1810, y: 370 }, { x: 2010, y: 310 }, { x: 2210, y: 370 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const earthLevel6: LevelData = {
  id: 6, worldType: 'earth', paletteName: 'NIGHT', music: 'earth_theme',
  spawnPoint: { x: 80, y: 420 }, goalX: 2600, goalY: 360,
  platforms: [
    { x: 0,    y: 500, width: 200, height: 40 },
    // Wide gap
    { x: 280,  y: 500, width: 200, height: 40 },
    { x: 560,  y: 500, width: 200, height: 40 },
    { x: 840,  y: 460, width: 160, height: 20, type: 'passthrough' },
    { x: 1060, y: 500, width: 400, height: 40 },
    { x: 1120, y: 380, width: 100, height: 20, type: 'passthrough' },
    { x: 1280, y: 320, width: 100, height: 20, type: 'passthrough' },
    { x: 1540, y: 460, width: 80,  height: 20 },
    { x: 1680, y: 420, width: 80,  height: 20 },
    { x: 1820, y: 380, width: 80,  height: 20 },
    { x: 1960, y: 500, width: 800, height: 40 },
    { x: 2040, y: 380, width: 120, height: 20, type: 'passthrough' },
    { x: 2280, y: 320, width: 160, height: 20, type: 'passthrough' },
    { x: 2480, y: 380, width: 120, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster2',    x: 320,  y: 495, patrolDistance: 120, variant: 0 },
    { type: 'monster1',     x: 600,  y: 495, patrolDistance: 120, variant: 0 },
    { type: 'monster1',   x: 1100, y: 495, patrolDistance: 200, variant: 0 },
    { type: 'monster6',     x: 2000, y: 495, patrolDistance: 150, variant: 0 },
    { type: 'monster3', x: 2200, y: 495, patrolDistance: 120, variant: 0 },
    { type: 'monster5',      x: 2440, y: 495, patrolDistance: 100, variant: 0 },
  ],
  coins: [
    { x: 310, y: 465 }, { x: 590, y: 465 }, { x: 880, y: 430 },
    { x: 1150, y: 350 }, { x: 1310, y: 290 }, { x: 1560, y: 430 },
    { x: 1850, y: 350 }, { x: 2070, y: 350 }, { x: 2310, y: 290 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const earthLevel7: LevelData = {
  id: 7, worldType: 'earth', paletteName: 'DAY', music: 'earth_theme',
  spawnPoint: { x: 80, y: 420 }, goalX: 2800, goalY: 340,
  platforms: [
    { x: 0,    y: 500, width: 300, height: 40 },
    { x: 360,  y: 460, width: 100, height: 20, type: 'passthrough' },
    { x: 520,  y: 400, width: 100, height: 20, type: 'passthrough' },
    { x: 680,  y: 340, width: 100, height: 20, type: 'passthrough' },
    { x: 840,  y: 400, width: 100, height: 20, type: 'passthrough' },
    { x: 1000, y: 460, width: 100, height: 20, type: 'passthrough' },
    { x: 1160, y: 500, width: 300, height: 40 },
    { x: 1220, y: 380, width: 100, height: 20, type: 'passthrough' },
    { x: 1540, y: 440, width: 80,  height: 20 },
    { x: 1680, y: 380, width: 80,  height: 20 },
    { x: 1820, y: 440, width: 80,  height: 20 },
    { x: 1960, y: 380, width: 80,  height: 20 },
    { x: 2100, y: 500, width: 900, height: 40 },
    { x: 2200, y: 380, width: 120, height: 20, type: 'passthrough' },
    { x: 2420, y: 300, width: 160, height: 20, type: 'passthrough' },
    { x: 2640, y: 380, width: 120, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster1',     x: 180,  y: 495, patrolDistance: 120, variant: 0 },
    { type: 'monster1',   x: 1200, y: 495, patrolDistance: 160, variant: 0 },
    { type: 'monster2',    x: 1400, y: 495, patrolDistance: 100, variant: 0 },
    { type: 'monster4',      x: 2150, y: 495, patrolDistance: 130, variant: 0 },
    { type: 'monster6',     x: 2380, y: 495, patrolDistance: 120, variant: 0 },
    { type: 'monster3', x: 2650, y: 495, patrolDistance: 100, variant: 0 },
  ],
  coins: [
    { x: 390, y: 430 }, { x: 550, y: 370 }, { x: 710, y: 310 },
    { x: 1250, y: 350 }, { x: 1570, y: 410 }, { x: 1850, y: 410 },
    { x: 2230, y: 350 }, { x: 2450, y: 270 }, { x: 2670, y: 350 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const earthLevel8: LevelData = {
  id: 8, worldType: 'earth', paletteName: 'SUNSET', music: 'earth_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 3000, goalY: 340,
  platforms: [
    { x: 0,    y: 420, width: 200, height: 40 },
    { x: 260,  y: 380, width: 80,  height: 20 },
    { x: 400,  y: 340, width: 80,  height: 20 },
    { x: 540,  y: 380, width: 80,  height: 20 },
    { x: 680,  y: 420, width: 80,  height: 20 },
    { x: 820,  y: 380, width: 80,  height: 20 },
    { x: 960,  y: 340, width: 80,  height: 20 },
    { x: 1100, y: 420, width: 300, height: 40 },
    { x: 1480, y: 380, width: 80,  height: 20 },
    { x: 1620, y: 320, width: 80,  height: 20 },
    { x: 1760, y: 380, width: 80,  height: 20 },
    { x: 1900, y: 420, width: 300, height: 40 },
    { x: 2260, y: 380, width: 80,  height: 20 },
    { x: 2400, y: 320, width: 100, height: 20 },
    { x: 2560, y: 380, width: 80,  height: 20 },
    { x: 2700, y: 420, width: 500, height: 40 },
    { x: 2800, y: 320, width: 160, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster2',    x: 290,  y: 345, patrolDistance: 50,  variant: 0 },
    { type: 'monster1',     x: 1150, y: 385, patrolDistance: 180, variant: 0 },
    { type: 'monster1',   x: 1490, y: 345, patrolDistance: 50,  variant: 0 },
    { type: 'monster6',     x: 1950, y: 385, patrolDistance: 180, variant: 0 },
    { type: 'monster4',      x: 2730, y: 385, patrolDistance: 150, variant: 0 },
    { type: 'monster3', x: 2900, y: 385, patrolDistance: 120, variant: 0 },
  ],
  coins: [
    { x: 290, y: 350 }, { x: 430, y: 310 }, { x: 690, y: 390 },
    { x: 990, y: 310 }, { x: 1510, y: 350 }, { x: 1640, y: 290 },
    { x: 2290, y: 350 }, { x: 2430, y: 290 }, { x: 2830, y: 290 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const earthLevel9: LevelData = {
  id: 9, worldType: 'earth', paletteName: 'NIGHT', music: 'earth_theme',
  spawnPoint: { x: 80, y: 420 }, goalX: 3200, goalY: 360,
  platforms: [
    { x: 0,    y: 500, width: 250, height: 40 },
    { x: 310,  y: 460, width: 80,  height: 20 },
    { x: 460,  y: 420, width: 80,  height: 20 },
    { x: 610,  y: 360, width: 80,  height: 20 },
    { x: 760,  y: 420, width: 80,  height: 20 },
    { x: 910,  y: 480, width: 80,  height: 20 },
    { x: 1060, y: 500, width: 300, height: 40 },
    { x: 1120, y: 380, width: 100, height: 20, type: 'passthrough' },
    { x: 1440, y: 450, width: 80,  height: 20 },
    { x: 1580, y: 390, width: 80,  height: 20 },
    { x: 1720, y: 450, width: 80,  height: 20 },
    { x: 1860, y: 390, width: 80,  height: 20 },
    { x: 2000, y: 500, width: 300, height: 40 },
    { x: 2060, y: 380, width: 100, height: 20, type: 'passthrough' },
    { x: 2380, y: 450, width: 80,  height: 20 },
    { x: 2520, y: 390, width: 80,  height: 20 },
    { x: 2660, y: 450, width: 80,  height: 20 },
    { x: 2800, y: 500, width: 600, height: 40 },
    { x: 2920, y: 380, width: 140, height: 20, type: 'passthrough' },
    { x: 3100, y: 320, width: 160, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster1',     x: 150,  y: 495, patrolDistance: 100, variant: 0 },
    { type: 'monster2',    x: 1100, y: 495, patrolDistance: 200, variant: 0 },
    { type: 'monster1',   x: 1460, y: 415, patrolDistance: 50,  variant: 0 },
    { type: 'monster6',     x: 2040, y: 495, patrolDistance: 200, variant: 0 },
    { type: 'monster4',      x: 2400, y: 415, patrolDistance: 50,  variant: 0 },
    { type: 'monster3', x: 2850, y: 495, patrolDistance: 150, variant: 0 },
    { type: 'monster5',      x: 3050, y: 495, patrolDistance: 100, variant: 0 },
  ],
  coins: [
    { x: 340, y: 430 }, { x: 490, y: 390 }, { x: 640, y: 330 },
    { x: 1150, y: 350 }, { x: 1470, y: 420 }, { x: 1600, y: 360 },
    { x: 2090, y: 350 }, { x: 2950, y: 350 }, { x: 3130, y: 290 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};


// ============================================================
// WATER WORLD — Levels 13-19 + Boss 20
// ============================================================

const waterLevel13: LevelData = {
  id: 13, worldType: 'water', paletteName: 'DEEP_OCEAN', music: 'water_theme',
  spawnPoint: { x: 80, y: 420 }, goalX: 2200, goalY: 360,
  platforms: [
    { x: 0,    y: 500, width: 300, height: 40 },
    { x: 360,  y: 460, width: 100, height: 20 },
    { x: 520,  y: 420, width: 100, height: 20 },
    { x: 680,  y: 460, width: 100, height: 20 },
    { x: 840,  y: 500, width: 300, height: 40 },
    { x: 900,  y: 400, width: 80,  height: 20, type: 'passthrough' },
    { x: 1220, y: 460, width: 80,  height: 20 },
    { x: 1360, y: 400, width: 80,  height: 20 },
    { x: 1500, y: 460, width: 80,  height: 20 },
    { x: 1640, y: 500, width: 700, height: 40 },
    { x: 1720, y: 380, width: 120, height: 20, type: 'passthrough' },
    { x: 1940, y: 320, width: 140, height: 20, type: 'passthrough' },
    { x: 2060, y: 380, width: 120, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster3', x: 180,  y: 495, patrolDistance: 120, variant: 0 },
    { type: 'monster4',      x: 900,  y: 495, patrolDistance: 180, variant: 0 },
    { type: 'monster1',     x: 1680, y: 495, patrolDistance: 160, variant: 0 },
    { type: 'monster6',     x: 1940, y: 495, patrolDistance: 100, variant: 0 },
  ],
  coins: [
    { x: 390, y: 430 }, { x: 550, y: 390 }, { x: 710, y: 430 },
    { x: 930, y: 370 }, { x: 1250, y: 430 }, { x: 1530, y: 430 },
    { x: 1750, y: 350 }, { x: 1970, y: 290 }, { x: 2090, y: 350 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const waterLevel14: LevelData = {
  id: 14, worldType: 'water', paletteName: 'DEEP_OCEAN', music: 'water_theme',
  spawnPoint: { x: 80, y: 420 }, goalX: 2600, goalY: 340,
  platforms: [
    { x: 0,    y: 500, width: 200, height: 40 },
    { x: 260,  y: 460, width: 80,  height: 20 },
    { x: 400,  y: 400, width: 80,  height: 20 },
    { x: 540,  y: 460, width: 80,  height: 20 },
    { x: 680,  y: 500, width: 200, height: 40 },
    { x: 960,  y: 460, width: 80,  height: 20 },
    { x: 1100, y: 400, width: 80,  height: 20 },
    { x: 1240, y: 460, width: 80,  height: 20 },
    { x: 1380, y: 500, width: 300, height: 40 },
    { x: 1760, y: 450, width: 80,  height: 20 },
    { x: 1900, y: 390, width: 80,  height: 20 },
    { x: 2040, y: 450, width: 80,  height: 20 },
    { x: 2180, y: 500, width: 600, height: 40 },
    { x: 2280, y: 360, width: 120, height: 20, type: 'passthrough' },
    { x: 2480, y: 300, width: 140, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster4',      x: 700,  y: 495, patrolDistance: 130, variant: 0 },
    { type: 'monster3', x: 1420, y: 495, patrolDistance: 200, variant: 0 },
    { type: 'monster1',     x: 1760, y: 415, patrolDistance: 50,  variant: 0 },
    { type: 'monster2',    x: 2220, y: 495, patrolDistance: 180, variant: 0 },
    { type: 'monster5',      x: 2440, y: 495, patrolDistance: 100, variant: 0 },
  ],
  coins: [
    { x: 290, y: 430 }, { x: 430, y: 370 }, { x: 570, y: 430 },
    { x: 990, y: 430 }, { x: 1130, y: 370 }, { x: 1790, y: 420 },
    { x: 1930, y: 360 }, { x: 2310, y: 330 }, { x: 2510, y: 270 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const waterLevel15: LevelData = {
  id: 15, worldType: 'water', paletteName: 'DEEP_OCEAN', music: 'water_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 2800, goalY: 320,
  platforms: [
    { x: 0,    y: 420, width: 200, height: 40 },
    { x: 260,  y: 380, width: 80,  height: 20 },
    { x: 400,  y: 320, width: 80,  height: 20 },
    { x: 540,  y: 380, width: 80,  height: 20 },
    { x: 680,  y: 440, width: 80,  height: 20 },
    { x: 820,  y: 380, width: 80,  height: 20 },
    { x: 960,  y: 320, width: 80,  height: 20 },
    { x: 1100, y: 420, width: 300, height: 40 },
    { x: 1480, y: 380, width: 80,  height: 20 },
    { x: 1620, y: 320, width: 80,  height: 20 },
    { x: 1760, y: 380, width: 80,  height: 20 },
    { x: 1900, y: 440, width: 80,  height: 20 },
    { x: 2040, y: 380, width: 80,  height: 20 },
    { x: 2180, y: 320, width: 80,  height: 20 },
    { x: 2320, y: 420, width: 600, height: 40 },
    { x: 2440, y: 300, width: 160, height: 20, type: 'passthrough' },
    { x: 2660, y: 280, width: 160, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster3', x: 290,  y: 345, patrolDistance: 50,  variant: 0 },
    { type: 'monster4',      x: 1140, y: 385, patrolDistance: 200, variant: 0 },
    { type: 'monster1',     x: 1510, y: 345, patrolDistance: 50,  variant: 0 },
    { type: 'monster6',     x: 2360, y: 385, patrolDistance: 200, variant: 0 },
    { type: 'monster2',    x: 2590, y: 385, patrolDistance: 120, variant: 0 },
    { type: 'monster5',      x: 2780, y: 385, patrolDistance: 80,  variant: 0 },
  ],
  coins: [
    { x: 290, y: 350 }, { x: 430, y: 290 }, { x: 710, y: 410 },
    { x: 990, y: 290 }, { x: 1510, y: 350 }, { x: 1650, y: 290 },
    { x: 2390, y: 390 }, { x: 2470, y: 270 }, { x: 2690, y: 250 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// Water boss
const waterBoss20: LevelData = {
  id: 20, worldType: 'water', paletteName: 'DEEP_OCEAN', music: 'boss_theme',
  isBoss: true,
  spawnPoint: { x: 200, y: 420 }, goalX: 1400, goalY: 380,
  platforms: [
    { x: 0,    y: 500, width: 1800, height: 40 },
    { x: 200,  y: 380, width: 120, height: 20, type: 'passthrough' },
    { x: 800,  y: 380, width: 120, height: 20, type: 'passthrough' },
    { x: 1400, y: 380, width: 120, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster3', x: 400,  y: 495, patrolDistance: 100, variant: 0 },
    { type: 'monster4',      x: 800,  y: 495, patrolDistance: 100, variant: 0 },
    { type: 'monster1',     x: 1200, y: 495, patrolDistance: 100, variant: 0 },
  ],
  coins: [
    { x: 300, y: 460 }, { x: 600, y: 460 }, { x: 900, y: 460 },
    { x: 1200, y: 460 }, { x: 1500, y: 460 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ============================================================
// SKY WORLD — Levels 21-29 + Boss 30
// ============================================================

const skyLevel21: LevelData = {
  id: 21, worldType: 'sky', paletteName: 'SKY_HIGH', music: 'sky_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 2200, goalY: 260,
  platforms: [
    { x: 0,    y: 420, width: 220, height: 20 },
    { x: 280,  y: 380, width: 100, height: 20 },
    { x: 440,  y: 320, width: 100, height: 20 },
    { x: 600,  y: 380, width: 100, height: 20 },
    { x: 760,  y: 420, width: 220, height: 20 },
    { x: 1040, y: 360, width: 80,  height: 20 },
    { x: 1180, y: 300, width: 80,  height: 20 },
    { x: 1320, y: 360, width: 80,  height: 20 },
    { x: 1460, y: 420, width: 220, height: 20 },
    { x: 1740, y: 360, width: 80,  height: 20 },
    { x: 1880, y: 300, width: 80,  height: 20 },
    { x: 2020, y: 360, width: 80,  height: 20 },
    { x: 2160, y: 300, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster5',    x: 160,  y: 385, patrolDistance: 140, variant: 0 },
    { type: 'monster1',   x: 820,  y: 385, patrolDistance: 140, variant: 0 },
    { type: 'monster1', x: 1500, y: 385, patrolDistance: 140, variant: 0 },
    { type: 'monster2',  x: 2200, y: 265, patrolDistance: 120, variant: 0 },
  ],
  coins: [
    { x: 310, y: 350 }, { x: 470, y: 290 }, { x: 630, y: 350 },
    { x: 1070, y: 330 }, { x: 1210, y: 270 }, { x: 1770, y: 330 },
    { x: 1910, y: 270 }, { x: 2050, y: 330 }, { x: 2200, y: 270 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const skyLevel22: LevelData = {
  id: 22, worldType: 'sky', paletteName: 'SKY_HIGH', music: 'sky_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 2400, goalY: 240,
  platforms: [
    { x: 0,    y: 420, width: 180, height: 20 },
    { x: 240,  y: 360, width: 80,  height: 20 },
    { x: 380,  y: 300, width: 80,  height: 20 },
    { x: 520,  y: 240, width: 80,  height: 20 },
    { x: 660,  y: 300, width: 80,  height: 20 },
    { x: 800,  y: 360, width: 80,  height: 20 },
    { x: 940,  y: 420, width: 180, height: 20 },
    { x: 1200, y: 360, width: 80,  height: 20 },
    { x: 1340, y: 300, width: 80,  height: 20 },
    { x: 1480, y: 240, width: 80,  height: 20 },
    { x: 1620, y: 300, width: 80,  height: 20 },
    { x: 1760, y: 360, width: 80,  height: 20 },
    { x: 1900, y: 420, width: 180, height: 20 },
    { x: 2160, y: 340, width: 100, height: 20 },
    { x: 2320, y: 260, width: 180, height: 20 },
  ],
  enemies: [
    { type: 'monster5',      x: 60,   y: 385, patrolDistance: 100, variant: 0 },
    { type: 'monster1',     x: 550,  y: 205, patrolDistance: 50,  variant: 0 },
    { type: 'monster1',   x: 980,  y: 385, patrolDistance: 100, variant: 0 },
    { type: 'monster4',      x: 1510, y: 205, patrolDistance: 50,  variant: 0 },
    { type: 'monster3', x: 1940, y: 385, patrolDistance: 100, variant: 0 },
  ],
  coins: [
    { x: 270, y: 330 }, { x: 410, y: 270 }, { x: 550, y: 210 },
    { x: 1230, y: 330 }, { x: 1370, y: 270 }, { x: 1510, y: 210 },
    { x: 2190, y: 310 }, { x: 2350, y: 230 }, { x: 2400, y: 230 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const skyLevel23: LevelData = {
  id: 23, worldType: 'sky', paletteName: 'SUNSET', music: 'sky_theme',
  spawnPoint: { x: 80, y: 400 }, goalX: 2600, goalY: 240,
  platforms: [
    { x: 0,    y: 440, width: 200, height: 20 },
    { x: 260,  y: 400, width: 80,  height: 20 },
    { x: 400,  y: 340, width: 80,  height: 20 },
    { x: 540,  y: 280, width: 80,  height: 20 },
    { x: 680,  y: 340, width: 80,  height: 20 },
    { x: 820,  y: 400, width: 80,  height: 20 },
    { x: 960,  y: 440, width: 200, height: 20 },
    { x: 1220, y: 380, width: 80,  height: 20 },
    { x: 1360, y: 300, width: 80,  height: 20 },
    { x: 1500, y: 240, width: 80,  height: 20 },
    { x: 1640, y: 300, width: 80,  height: 20 },
    { x: 1780, y: 360, width: 80,  height: 20 },
    { x: 1920, y: 440, width: 200, height: 20 },
    { x: 2180, y: 360, width: 100, height: 20 },
    { x: 2340, y: 280, width: 120, height: 20 },
    { x: 2500, y: 260, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster5',    x: 100,  y: 405, patrolDistance: 120, variant: 0 },
    { type: 'monster1',   x: 570,  y: 245, patrolDistance: 50,  variant: 0 },
    { type: 'monster6',   x: 1000, y: 405, patrolDistance: 120, variant: 0 },
    { type: 'monster2',  x: 1530, y: 205, patrolDistance: 50,  variant: 0 },
    { type: 'monster4',    x: 1960, y: 405, patrolDistance: 120, variant: 0 },
    { type: 'monster1', x: 2370, y: 245, patrolDistance: 80,  variant: 0 },
  ],
  coins: [
    { x: 290, y: 370 }, { x: 430, y: 310 }, { x: 570, y: 250 },
    { x: 1250, y: 350 }, { x: 1390, y: 270 }, { x: 1530, y: 210 },
    { x: 2210, y: 330 }, { x: 2370, y: 250 }, { x: 2540, y: 230 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// Sky boss
const skyBoss30: LevelData = {
  id: 30, worldType: 'sky', paletteName: 'SKY_HIGH', music: 'boss_theme',
  isBoss: true,
  spawnPoint: { x: 200, y: 380 }, goalX: 1400, goalY: 300,
  platforms: [
    { x: 0,    y: 460, width: 1800, height: 20 },
    { x: 100,  y: 340, width: 120, height: 20 },
    { x: 500,  y: 280, width: 120, height: 20 },
    { x: 900,  y: 320, width: 120, height: 20 },
    { x: 1300, y: 280, width: 120, height: 20 },
    { x: 1600, y: 340, width: 120, height: 20 },
  ],
  enemies: [
    { type: 'monster5',    x: 400,  y: 425, patrolDistance: 150, variant: 0 },
    { type: 'monster1', x: 900,  y: 425, patrolDistance: 150, variant: 0 },
    { type: 'monster2',  x: 1400, y: 425, patrolDistance: 150, variant: 0 },
  ],
  coins: [
    { x: 300, y: 420 }, { x: 700, y: 420 }, { x: 1100, y: 420 },
    { x: 1500, y: 420 }, { x: 530, y: 250 }, { x: 930, y: 290 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ============================================================
// SPACE WORLD — Levels 33-39 + Boss 40
// ============================================================

const spaceLevel33: LevelData = {
  id: 33, worldType: 'space', paletteName: 'SPACE_VOID', music: 'space_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 2400, goalY: 260,
  platforms: [
    { x: 0,    y: 420, width: 200, height: 20 },
    { x: 260,  y: 360, width: 80,  height: 20 },
    { x: 400,  y: 300, width: 80,  height: 20 },
    { x: 540,  y: 240, width: 80,  height: 20 },
    { x: 680,  y: 300, width: 80,  height: 20 },
    { x: 820,  y: 360, width: 80,  height: 20 },
    { x: 960,  y: 420, width: 200, height: 20 },
    { x: 1220, y: 360, width: 80,  height: 20 },
    { x: 1360, y: 280, width: 80,  height: 20 },
    { x: 1500, y: 220, width: 80,  height: 20 },
    { x: 1640, y: 280, width: 80,  height: 20 },
    { x: 1780, y: 360, width: 80,  height: 20 },
    { x: 1920, y: 420, width: 200, height: 20 },
    { x: 2180, y: 340, width: 100, height: 20 },
    { x: 2340, y: 260, width: 180, height: 20 },
  ],
  enemies: [
    { type: 'monster6',   x: 100,  y: 385, patrolDistance: 120, variant: 0 },
    { type: 'monster1',   x: 570,  y: 205, patrolDistance: 50,  variant: 0 },
    { type: 'monster1', x: 1000, y: 385, patrolDistance: 120, variant: 0 },
    { type: 'monster2',  x: 1530, y: 185, patrolDistance: 50,  variant: 0 },
    { type: 'monster4',    x: 1960, y: 385, patrolDistance: 120, variant: 0 },
  ],
  coins: [
    { x: 290, y: 330 }, { x: 430, y: 270 }, { x: 570, y: 210 },
    { x: 1250, y: 330 }, { x: 1390, y: 250 }, { x: 1530, y: 190 },
    { x: 2210, y: 310 }, { x: 2370, y: 230 }, { x: 2420, y: 230 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const spaceLevel34: LevelData = {
  id: 34, worldType: 'space', paletteName: 'SPACE_VOID', music: 'space_theme',
  spawnPoint: { x: 80, y: 400 }, goalX: 2600, goalY: 260,
  platforms: [
    { x: 0,    y: 440, width: 180, height: 20 },
    { x: 240,  y: 400, width: 80,  height: 20 },
    { x: 380,  y: 340, width: 80,  height: 20 },
    { x: 520,  y: 280, width: 80,  height: 20 },
    { x: 660,  y: 340, width: 80,  height: 20 },
    { x: 800,  y: 400, width: 80,  height: 20 },
    { x: 940,  y: 440, width: 180, height: 20 },
    { x: 1200, y: 380, width: 80,  height: 20 },
    { x: 1340, y: 300, width: 80,  height: 20 },
    { x: 1480, y: 240, width: 80,  height: 20 },
    { x: 1620, y: 300, width: 80,  height: 20 },
    { x: 1760, y: 380, width: 80,  height: 20 },
    { x: 1900, y: 440, width: 180, height: 20 },
    { x: 2160, y: 360, width: 100, height: 20 },
    { x: 2320, y: 280, width: 120, height: 20 },
    { x: 2480, y: 260, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster6',     x: 90,   y: 405, patrolDistance: 100, variant: 0 },
    { type: 'monster1',     x: 550,  y: 245, patrolDistance: 50,  variant: 0 },
    { type: 'monster2',    x: 980,  y: 405, patrolDistance: 100, variant: 0 },
    { type: 'monster1',   x: 1510, y: 205, patrolDistance: 50,  variant: 0 },
    { type: 'monster3', x: 1940, y: 405, patrolDistance: 100, variant: 0 },
    { type: 'monster5',      x: 2350, y: 245, patrolDistance: 80,  variant: 0 },
  ],
  coins: [
    { x: 270, y: 370 }, { x: 410, y: 310 }, { x: 550, y: 250 },
    { x: 1230, y: 350 }, { x: 1370, y: 270 }, { x: 1510, y: 210 },
    { x: 2190, y: 330 }, { x: 2350, y: 250 }, { x: 2510, y: 230 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// Space boss
const spaceBoss40: LevelData = {
  id: 40, worldType: 'space', paletteName: 'SPACE_VOID', music: 'boss_theme',
  isBoss: true,
  spawnPoint: { x: 200, y: 380 }, goalX: 1400, goalY: 300,
  platforms: [
    { x: 0,    y: 460, width: 1800, height: 20 },
    { x: 100,  y: 320, width: 120, height: 20 },
    { x: 500,  y: 260, width: 120, height: 20 },
    { x: 900,  y: 300, width: 120, height: 20 },
    { x: 1300, y: 260, width: 120, height: 20 },
    { x: 1600, y: 320, width: 120, height: 20 },
  ],
  enemies: [
    { type: 'monster6',   x: 400,  y: 425, patrolDistance: 150, variant: 0 },
    { type: 'monster1', x: 900,  y: 425, patrolDistance: 150, variant: 0 },
    { type: 'monster1',   x: 1400, y: 425, patrolDistance: 150, variant: 0 },
  ],
  coins: [
    { x: 300, y: 420 }, { x: 700, y: 420 }, { x: 1100, y: 420 },
    { x: 1500, y: 420 }, { x: 530, y: 230 }, { x: 930, y: 270 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};



// ============================================================
// CRAYON WORLD — רמות 41-60
// ============================================================

// ---- LEVEL 41: שמש מחייכת — Tutorial Crayon ----
const crayonLevel41: LevelData = {
  id: 41, worldType: 'crayon', paletteName: 'CRAYON_SUNNY', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 430 },
  goalX: 1600, goalY: 380,
  platforms: [
    { x: 0,    y: 480, width: 2000, height: 40 },  // קרקע
    { x: 260,  y: 390, width: 150, height: 22 },
    { x: 490,  y: 320, width: 130, height: 22 },
    { x: 700,  y: 250, width: 120, height: 22 },
    { x: 880,  y: 320, width: 140, height: 22 },
    { x: 1060, y: 390, width: 110, height: 22 },
    { x: 1220, y: 310, width: 130, height: 22 },
    { x: 1420, y: 380, width: 160, height: 22 },
    { x: 1560, y: 290, width: 120, height: 22 },
  ],
  enemies: [
    { type: 'monster1', x: 350,  y: 445, patrolDistance: 160, variant: 0 },
    { type: 'monster2', x: 820,  y: 445, patrolDistance: 140, variant: 0 },
    { type: 'monster1', x: 1200, y: 445, patrolDistance: 180, variant: 0 },
  ],
  coins: [
    { x: 310, y: 355 }, { x: 540, y: 285 }, { x: 740, y: 215 },
    { x: 930, y: 285 }, { x: 1110, y: 355 }, { x: 1270, y: 275 },
    { x: 1470, y: 345 }, { x: 1590, y: 255 },
  ],
  timeLimit: 0, parallaxLayers: 2,
};

// ---- LEVEL 42: גשר הקשת ----
const crayonLevel42: LevelData = {
  id: 42, worldType: 'crayon', paletteName: 'CRAYON_RAINBOW', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 430 },
  goalX: 1900, goalY: 350,
  platforms: [
    { x: 0,    y: 480, width: 260, height: 40 },
    { x: 320,  y: 420, width: 100, height: 22 },
    { x: 480,  y: 360, width: 100, height: 22 },
    { x: 640,  y: 300, width: 100, height: 22 },
    { x: 800,  y: 240, width: 120, height: 22 },
    { x: 980,  y: 300, width: 100, height: 22 },
    { x: 1140, y: 360, width: 100, height: 22 },
    { x: 1300, y: 420, width: 100, height: 22 },
    { x: 1460, y: 360, width: 120, height: 22 },
    { x: 1640, y: 290, width: 120, height: 22 },
    { x: 1820, y: 360, width: 160, height: 22 },
    { x: 1800, y: 480, width: 300, height: 40 },
  ],
  enemies: [
    { type: 'monster3', x: 360,  y: 395, patrolDistance: 80,  variant: 0 },
    { type: 'monster1', x: 830,  y: 215, patrolDistance: 100, variant: 1 },
    { type: 'monster3', x: 1480, y: 335, patrolDistance: 100, variant: 0 },
    { type: 'monster2', x: 1660, y: 265, patrolDistance: 100, variant: 1 },
  ],
  coins: [
    { x: 360, y: 385 }, { x: 520, y: 325 }, { x: 680, y: 265 },
    { x: 850, y: 205 }, { x: 1020, y: 265 }, { x: 1180, y: 325 },
    { x: 1500, y: 255 }, { x: 1680, y: 255 }, { x: 1880, y: 325 },
  ],
  timeLimit: 0, parallaxLayers: 2,
};

// ---- LEVEL 43: יער הפרחים ----
const crayonLevel43: LevelData = {
  id: 43, worldType: 'crayon', paletteName: 'CRAYON_GARDEN', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 430 },
  goalX: 2100, goalY: 360,
  platforms: [
    { x: 0,    y: 480, width: 220, height: 40 },
    { x: 280,  y: 400, width: 120, height: 22 },
    { x: 280,  y: 310, width: 80,  height: 22, type: 'passthrough' },
    { x: 460,  y: 350, width: 100, height: 22 },
    { x: 620,  y: 280, width: 120, height: 22 },
    { x: 800,  y: 400, width: 100, height: 22, type: 'moving', moveX: 80, moveSpeed: 1.0 },
    { x: 960,  y: 320, width: 120, height: 22 },
    { x: 1140, y: 240, width: 100, height: 22 },
    { x: 1300, y: 320, width: 100, height: 22 },
    { x: 1460, y: 400, width: 100, height: 22, type: 'moving', moveX: 90, moveSpeed: 1.1 },
    { x: 1640, y: 330, width: 120, height: 22 },
    { x: 1820, y: 260, width: 100, height: 22 },
    { x: 1980, y: 340, width: 160, height: 22 },
    { x: 1960, y: 480, width: 260, height: 40 },
  ],
  enemies: [
    { type: 'monster2', x: 320,  y: 375, patrolDistance: 100, variant: 0 },
    { type: 'monster4', x: 660,  y: 255, patrolDistance: 100, variant: 0 },
    { type: 'monster2', x: 1000, y: 295, patrolDistance: 100, variant: 1 },
    { type: 'monster4', x: 1680, y: 305, patrolDistance: 100, variant: 0 },
    { type: 'monster1', x: 2000, y: 315, patrolDistance: 140, variant: 1 },
  ],
  coins: [
    { x: 320, y: 375 }, { x: 500, y: 315 }, { x: 660, y: 245 },
    { x: 1000, y: 285 }, { x: 1180, y: 205 }, { x: 1340, y: 285 },
    { x: 1680, y: 295 }, { x: 1860, y: 225 }, { x: 2020, y: 305 },
  ],
  timeLimit: 0, parallaxLayers: 2,
};

// ---- LEVEL 44: ענני כותנה ----
const crayonLevel44: LevelData = {
  id: 44, worldType: 'crayon', paletteName: 'CRAYON_CLOUD', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 400 },
  goalX: 2200, goalY: 320,
  platforms: [
    { x: 0,    y: 440, width: 200, height: 22 },
    { x: 260,  y: 380, width: 110, height: 22, type: 'passthrough' },
    { x: 440,  y: 320, width: 110, height: 22, type: 'passthrough' },
    { x: 620,  y: 260, width: 110, height: 22, type: 'passthrough' },
    { x: 800,  y: 340, width: 110, height: 22, type: 'passthrough' },
    { x: 980,  y: 400, width: 200, height: 22 },
    { x: 1240, y: 340, width: 110, height: 22, type: 'passthrough' },
    { x: 1420, y: 270, width: 110, height: 22, type: 'passthrough' },
    { x: 1600, y: 340, width: 110, height: 22, type: 'passthrough' },
    { x: 1780, y: 400, width: 110, height: 22 },
    { x: 1960, y: 330, width: 120, height: 22 },
    { x: 2140, y: 260, width: 160, height: 22 },
    { x: 2120, y: 440, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster3', x: 290,  y: 355, patrolDistance: 90,  variant: 0 },
    { type: 'monster5', x: 650,  y: 235, patrolDistance: 90,  variant: 0 },
    { type: 'monster3', x: 1270, y: 315, patrolDistance: 90,  variant: 1 },
    { type: 'monster5', x: 1450, y: 245, patrolDistance: 90,  variant: 1 },
    { type: 'monster3', x: 2000, y: 305, patrolDistance: 100, variant: 0 },
  ],
  coins: [
    { x: 300, y: 345 }, { x: 480, y: 285 }, { x: 660, y: 225 },
    { x: 840, y: 305 }, { x: 1280, y: 305 }, { x: 1460, y: 235 },
    { x: 1640, y: 305 }, { x: 2000, y: 295 }, { x: 2190, y: 225 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ---- LEVEL 45: גשרים מתנדנדים ----
const crayonLevel45: LevelData = {
  id: 45, worldType: 'crayon', paletteName: 'CRAYON_SUNNY', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 420 },
  goalX: 2300, goalY: 350,
  platforms: [
    { x: 0,    y: 460, width: 220, height: 40 },
    { x: 280,  y: 400, width: 100, height: 22, type: 'moving', moveX: 100, moveSpeed: 0.9 },
    { x: 440,  y: 330, width: 100, height: 22, type: 'moving', moveY: 60,  moveSpeed: 1.0 },
    { x: 600,  y: 400, width: 100, height: 22, type: 'moving', moveX: 80,  moveSpeed: 1.1 },
    { x: 760,  y: 460, width: 220, height: 40 },
    { x: 1040, y: 380, width: 100, height: 22, type: 'moving', moveX: 90,  moveSpeed: 0.8 },
    { x: 1200, y: 300, width: 100, height: 22, type: 'moving', moveY: 70,  moveSpeed: 1.2 },
    { x: 1360, y: 380, width: 100, height: 22, type: 'moving', moveX: 100, moveSpeed: 1.0 },
    { x: 1520, y: 460, width: 220, height: 40 },
    { x: 1800, y: 380, width: 110, height: 22, type: 'moving', moveX: 80,  moveSpeed: 1.3 },
    { x: 1980, y: 300, width: 110, height: 22, type: 'moving', moveY: 80,  moveSpeed: 1.1 },
    { x: 2160, y: 360, width: 180, height: 22 },
    { x: 2140, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster4', x: 820,  y: 435, patrolDistance: 160, variant: 0 },
    { type: 'monster4', x: 1580, y: 435, patrolDistance: 180, variant: 1 },
    { type: 'monster5', x: 2200, y: 335, patrolDistance: 140, variant: 0 },
  ],
  coins: [
    { x: 310, y: 365 }, { x: 470, y: 295 }, { x: 640, y: 365 },
    { x: 1080, y: 345 }, { x: 1240, y: 265 }, { x: 1400, y: 345 },
    { x: 1840, y: 345 }, { x: 2020, y: 265 }, { x: 2200, y: 325 },
  ],
  timeLimit: 0, parallaxLayers: 2,
};

// ---- LEVEL 46: מפלצות קשתות ----
const crayonLevel46: LevelData = {
  id: 46, worldType: 'crayon', paletteName: 'CRAYON_RAINBOW', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 420 },
  goalX: 2400, goalY: 330,
  platforms: [
    { x: 0,    y: 460, width: 220, height: 40 },
    { x: 280,  y: 380, width: 130, height: 22 },
    { x: 480,  y: 310, width: 110, height: 22 },
    { x: 660,  y: 380, width: 130, height: 22 },
    { x: 860,  y: 460, width: 180, height: 40 },
    { x: 1100, y: 380, width: 110, height: 22 },
    { x: 1270, y: 300, width: 110, height: 22 },
    { x: 1440, y: 380, width: 110, height: 22 },
    { x: 1620, y: 300, width: 110, height: 22 },
    { x: 1800, y: 380, width: 110, height: 22 },
    { x: 1980, y: 460, width: 180, height: 40 },
    { x: 2220, y: 370, width: 110, height: 22 },
    { x: 2380, y: 300, width: 200, height: 22 },
    { x: 2360, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster2', x: 320,  y: 355, patrolDistance: 110, variant: 0 },
    { type: 'monster4', x: 520,  y: 285, patrolDistance: 90,  variant: 1 },
    { type: 'monster2', x: 700,  y: 355, patrolDistance: 110, variant: 0 },
    { type: 'monster5', x: 1140, y: 355, patrolDistance: 90,  variant: 0 },
    { type: 'monster4', x: 1310, y: 275, patrolDistance: 90,  variant: 1 },
    { type: 'monster5', x: 1660, y: 275, patrolDistance: 90,  variant: 0 },
    { type: 'monster2', x: 2260, y: 345, patrolDistance: 90,  variant: 1 },
  ],
  coins: [
    { x: 320, y: 345 }, { x: 520, y: 275 }, { x: 700, y: 345 },
    { x: 1140, y: 345 }, { x: 1310, y: 265 }, { x: 1480, y: 345 },
    { x: 1660, y: 265 }, { x: 1840, y: 345 }, { x: 2420, y: 265 },
  ],
  timeLimit: 0, parallaxLayers: 2,
};

// ---- LEVEL 47: מגדל הצבעים ----
const crayonLevel47: LevelData = {
  id: 47, worldType: 'crayon', paletteName: 'CRAYON_GARDEN', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 420 },
  goalX: 2500, goalY: 150,
  platforms: [
    { x: 0,    y: 460, width: 220, height: 40 },
    { x: 260,  y: 400, width: 110, height: 22 },
    { x: 420,  y: 340, width: 110, height: 22 },
    { x: 580,  y: 280, width: 110, height: 22 },
    { x: 740,  y: 220, width: 110, height: 22 },
    { x: 900,  y: 160, width: 120, height: 22 },
    { x: 1060, y: 220, width: 110, height: 22 },
    { x: 1220, y: 280, width: 110, height: 22 },
    { x: 1380, y: 340, width: 110, height: 22 },
    { x: 1540, y: 260, width: 110, height: 22 },
    { x: 1700, y: 180, width: 110, height: 22 },
    { x: 1860, y: 240, width: 110, height: 22 },
    { x: 2020, y: 180, width: 110, height: 22 },
    { x: 2180, y: 200, width: 110, height: 22 },
    { x: 2360, y: 160, width: 200, height: 22 },
    { x: 2340, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster3', x: 300,  y: 375, patrolDistance: 90,  variant: 0 },
    { type: 'monster5', x: 620,  y: 255, patrolDistance: 90,  variant: 0 },
    { type: 'monster3', x: 780,  y: 195, patrolDistance: 90,  variant: 1 },
    { type: 'monster5', x: 1260, y: 255, patrolDistance: 90,  variant: 0 },
    { type: 'monster3', x: 1580, y: 235, patrolDistance: 90,  variant: 1 },
    { type: 'monster5', x: 1740, y: 155, patrolDistance: 90,  variant: 0 },
    { type: 'monster6', x: 2200, y: 175, patrolDistance: 80,  variant: 0 },
  ],
  coins: [
    { x: 300, y: 365 }, { x: 460, y: 305 }, { x: 620, y: 245 },
    { x: 780, y: 185 }, { x: 940, y: 125 }, { x: 1580, y: 225 },
    { x: 1740, y: 145 }, { x: 2060, y: 145 }, { x: 2400, y: 125 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ---- LEVEL 48: גבעות קפיצה ----
const crayonLevel48: LevelData = {
  id: 48, worldType: 'crayon', paletteName: 'CRAYON_SUNNY', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 420 },
  goalX: 2600, goalY: 350,
  platforms: [
    { x: 0,    y: 460, width: 200, height: 40 },
    { x: 260,  y: 380, width: 90,  height: 22, type: 'crumbling' },
    { x: 410,  y: 320, width: 90,  height: 22, type: 'crumbling' },
    { x: 560,  y: 380, width: 90,  height: 22, type: 'crumbling' },
    { x: 710,  y: 460, width: 180, height: 40 },
    { x: 960,  y: 380, width: 110, height: 22 },
    { x: 1130, y: 300, width: 90,  height: 22, type: 'crumbling' },
    { x: 1280, y: 380, width: 110, height: 22 },
    { x: 1440, y: 300, width: 90,  height: 22, type: 'crumbling' },
    { x: 1590, y: 380, width: 110, height: 22 },
    { x: 1750, y: 460, width: 180, height: 40 },
    { x: 2000, y: 380, width: 90,  height: 22, type: 'crumbling' },
    { x: 2150, y: 300, width: 90,  height: 22, type: 'crumbling' },
    { x: 2300, y: 380, width: 90,  height: 22, type: 'crumbling' },
    { x: 2460, y: 310, width: 200, height: 22 },
    { x: 2440, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster1', x: 760,  y: 435, patrolDistance: 140, variant: 0 },
    { type: 'monster4', x: 1000, y: 355, patrolDistance: 120, variant: 1 },
    { type: 'monster1', x: 1630, y: 355, patrolDistance: 110, variant: 0 },
    { type: 'monster4', x: 1800, y: 435, patrolDistance: 140, variant: 1 },
    { type: 'monster6', x: 2500, y: 285, patrolDistance: 160, variant: 0 },
  ],
  coins: [
    { x: 290, y: 345 }, { x: 440, y: 285 }, { x: 590, y: 345 },
    { x: 1000, y: 345 }, { x: 1165, y: 265 }, { x: 1480, y: 265 },
    { x: 2040, y: 345 }, { x: 2190, y: 265 }, { x: 2500, y: 275 },
  ],
  timeLimit: 0, parallaxLayers: 2,
};

// ---- LEVEL 49: הכפר הצבעוני ----
const crayonLevel49: LevelData = {
  id: 49, worldType: 'crayon', paletteName: 'CRAYON_CLOUD', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 410 },
  goalX: 2700, goalY: 280,
  platforms: [
    { x: 0,    y: 460, width: 220, height: 40 },
    { x: 280,  y: 390, width: 120, height: 22 },
    { x: 460,  y: 320, width: 100, height: 22, type: 'moving', moveX: 80, moveSpeed: 1.0 },
    { x: 620,  y: 250, width: 120, height: 22 },
    { x: 800,  y: 320, width: 100, height: 22 },
    { x: 960,  y: 390, width: 120, height: 22, type: 'crumbling' },
    { x: 1140, y: 320, width: 100, height: 22, type: 'moving', moveY: 70, moveSpeed: 1.1 },
    { x: 1300, y: 250, width: 120, height: 22 },
    { x: 1480, y: 320, width: 100, height: 22, type: 'crumbling' },
    { x: 1640, y: 390, width: 120, height: 22 },
    { x: 1820, y: 310, width: 110, height: 22, type: 'moving', moveX: 90, moveSpeed: 1.2 },
    { x: 2000, y: 240, width: 120, height: 22 },
    { x: 2180, y: 310, width: 110, height: 22 },
    { x: 2360, y: 240, width: 120, height: 22 },
    { x: 2540, y: 300, width: 200, height: 22 },
    { x: 2520, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster2', x: 320,  y: 365, patrolDistance: 100, variant: 0 },
    { type: 'monster5', x: 660,  y: 225, patrolDistance: 100, variant: 0 },
    { type: 'monster2', x: 840,  y: 295, patrolDistance: 80,  variant: 1 },
    { type: 'monster5', x: 1340, y: 225, patrolDistance: 100, variant: 1 },
    { type: 'monster2', x: 1680, y: 365, patrolDistance: 100, variant: 0 },
    { type: 'monster6', x: 2040, y: 215, patrolDistance: 100, variant: 0 },
    { type: 'monster5', x: 2400, y: 215, patrolDistance: 100, variant: 1 },
  ],
  coins: [
    { x: 320, y: 355 }, { x: 500, y: 285 }, { x: 660, y: 215 },
    { x: 1340, y: 215 }, { x: 1520, y: 285 }, { x: 2040, y: 205 },
    { x: 2220, y: 275 }, { x: 2400, y: 205 }, { x: 2590, y: 265 },
  ],
  timeLimit: 0, parallaxLayers: 2,
};

// ---- LEVEL 50: BOSS — גמד הציורים הענק ----
const crayonBoss50: LevelData = {
  id: 50, worldType: 'crayon', paletteName: 'CRAYON_RAINBOW', music: 'boss_theme',
  isBoss: true,
  spawnPoint: { x: 80, y: 400 },
  goalX: 1600, goalY: 380,
  platforms: [
    { x: 0,    y: 460, width: 1800, height: 40 },
    { x: 200,  y: 350, width: 160, height: 22 },
    { x: 500,  y: 280, width: 130, height: 22, type: 'passthrough' },
    { x: 760,  y: 350, width: 160, height: 22 },
    { x: 1040, y: 280, width: 130, height: 22, type: 'passthrough' },
    { x: 1300, y: 350, width: 160, height: 22 },
    { x: 550,  y: 200, width: 100, height: 22, type: 'passthrough' },
    { x: 800,  y: 180, width: 140, height: 22 },
    { x: 1060, y: 200, width: 100, height: 22, type: 'passthrough' },
  ],
  enemies: [],
  coins: [
    { x: 260, y: 315 }, { x: 540, y: 245 }, { x: 800, y: 315 },
    { x: 580, y: 165 }, { x: 840, y: 145 }, { x: 1080, y: 165 },
    { x: 1080, y: 245 }, { x: 1360, y: 315 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ---- LEVEL 51: פרפרים וציפורים ----
const crayonLevel51: LevelData = {
  id: 51, worldType: 'crayon', paletteName: 'CRAYON_GARDEN', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 410 },
  goalX: 2500, goalY: 300,
  platforms: [
    { x: 0,    y: 460, width: 200, height: 40 },
    { x: 260,  y: 390, width: 110, height: 22 },
    { x: 440,  y: 320, width: 110, height: 22, type: 'moving', moveX: 70, moveSpeed: 1.0 },
    { x: 620,  y: 390, width: 110, height: 22 },
    { x: 800,  y: 310, width: 110, height: 22 },
    { x: 980,  y: 380, width: 200, height: 40 },
    { x: 1240, y: 310, width: 110, height: 22, type: 'moving', moveX: 80, moveSpeed: 1.1 },
    { x: 1420, y: 240, width: 110, height: 22 },
    { x: 1600, y: 310, width: 110, height: 22, type: 'crumbling' },
    { x: 1780, y: 380, width: 110, height: 22 },
    { x: 1960, y: 300, width: 110, height: 22, type: 'moving', moveY: 70, moveSpeed: 1.2 },
    { x: 2140, y: 230, width: 110, height: 22 },
    { x: 2320, y: 300, width: 200, height: 22 },
    { x: 2300, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster3', x: 300,  y: 365, patrolDistance: 90,  variant: 0 },
    { type: 'monster1', x: 660,  y: 365, patrolDistance: 90,  variant: 1 },
    { type: 'monster3', x: 840,  y: 285, patrolDistance: 90,  variant: 0 },
    { type: 'monster4', x: 1460, y: 215, patrolDistance: 90,  variant: 0 },
    { type: 'monster3', x: 1820, y: 355, patrolDistance: 90,  variant: 1 },
    { type: 'monster6', x: 2180, y: 205, patrolDistance: 100, variant: 0 },
  ],
  coins: [
    { x: 300, y: 355 }, { x: 480, y: 285 }, { x: 660, y: 355 },
    { x: 840, y: 275 }, { x: 1280, y: 275 }, { x: 1460, y: 205 },
    { x: 2000, y: 265 }, { x: 2180, y: 195 }, { x: 2380, y: 265 },
  ],
  timeLimit: 0, parallaxLayers: 2,
};

// ---- LEVEL 52: ממתקים ועוגות ----
const crayonLevel52: LevelData = {
  id: 52, worldType: 'crayon', paletteName: 'CRAYON_CANDY', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 410 },
  goalX: 2600, goalY: 280,
  platforms: [
    { x: 0,    y: 460, width: 200, height: 40 },
    { x: 260,  y: 380, width: 120, height: 22 },
    { x: 440,  y: 300, width: 100, height: 22, type: 'passthrough' },
    { x: 600,  y: 380, width: 120, height: 22 },
    { x: 780,  y: 300, width: 100, height: 22, type: 'passthrough' },
    { x: 940,  y: 380, width: 120, height: 22 },
    { x: 1120, y: 460, width: 200, height: 40 },
    { x: 1380, y: 380, width: 120, height: 22 },
    { x: 1560, y: 300, width: 100, height: 22, type: 'moving', moveX: 90, moveSpeed: 1.0 },
    { x: 1740, y: 380, width: 120, height: 22 },
    { x: 1920, y: 300, width: 100, height: 22, type: 'passthrough' },
    { x: 2100, y: 380, width: 120, height: 22 },
    { x: 2280, y: 300, width: 120, height: 22 },
    { x: 2460, y: 230, width: 200, height: 22 },
    { x: 2440, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster5', x: 300,  y: 355, patrolDistance: 100, variant: 0 },
    { type: 'monster2', x: 640,  y: 355, patrolDistance: 100, variant: 1 },
    { type: 'monster5', x: 980,  y: 355, patrolDistance: 100, variant: 0 },
    { type: 'monster2', x: 1420, y: 355, patrolDistance: 100, variant: 0 },
    { type: 'monster5', x: 1780, y: 355, patrolDistance: 100, variant: 1 },
    { type: 'monster6', x: 2320, y: 275, patrolDistance: 110, variant: 0 },
    { type: 'monster5', x: 2500, y: 205, patrolDistance: 160, variant: 1 },
  ],
  coins: [
    { x: 300, y: 345 }, { x: 480, y: 265 }, { x: 640, y: 345 },
    { x: 820, y: 265 }, { x: 980, y: 345 }, { x: 1600, y: 265 },
    { x: 1780, y: 345 }, { x: 2320, y: 265 }, { x: 2510, y: 195 },
  ],
  timeLimit: 0, parallaxLayers: 2,
};

// ---- LEVEL 53: נהר הצבע ----
const crayonLevel53: LevelData = {
  id: 53, worldType: 'crayon', paletteName: 'CRAYON_CLOUD', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 400 },
  goalX: 2800, goalY: 260,
  platforms: [
    { x: 0,    y: 460, width: 200, height: 40 },
    { x: 260,  y: 390, width: 90,  height: 22, type: 'moving', moveX: 80, moveSpeed: 1.0 },
    { x: 410,  y: 320, width: 90,  height: 22, type: 'moving', moveY: 60, moveSpeed: 1.1 },
    { x: 560,  y: 390, width: 90,  height: 22, type: 'moving', moveX: 70, moveSpeed: 0.9 },
    { x: 710,  y: 460, width: 160, height: 40 },
    { x: 940,  y: 380, width: 110, height: 22 },
    { x: 1110, y: 300, width: 90,  height: 22, type: 'moving', moveX: 80, moveSpeed: 1.2 },
    { x: 1260, y: 380, width: 110, height: 22 },
    { x: 1440, y: 300, width: 90,  height: 22, type: 'crumbling' },
    { x: 1590, y: 380, width: 110, height: 22 },
    { x: 1770, y: 460, width: 160, height: 40 },
    { x: 2010, y: 370, width: 90,  height: 22, type: 'moving', moveX: 90, moveSpeed: 1.3 },
    { x: 2160, y: 290, width: 90,  height: 22, type: 'moving', moveY: 70, moveSpeed: 1.1 },
    { x: 2310, y: 370, width: 90,  height: 22, type: 'moving', moveX: 80, moveSpeed: 1.2 },
    { x: 2480, y: 300, width: 120, height: 22 },
    { x: 2660, y: 230, width: 200, height: 22 },
    { x: 2640, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster4', x: 760,  y: 435, patrolDistance: 120, variant: 0 },
    { type: 'monster2', x: 980,  y: 355, patrolDistance: 90,  variant: 1 },
    { type: 'monster4', x: 1630, y: 355, patrolDistance: 90,  variant: 0 },
    { type: 'monster2', x: 1830, y: 435, patrolDistance: 120, variant: 1 },
    { type: 'monster6', x: 2520, y: 275, patrolDistance: 100, variant: 0 },
    { type: 'monster4', x: 2700, y: 205, patrolDistance: 160, variant: 1 },
  ],
  coins: [
    { x: 295, y: 355 }, { x: 445, y: 285 }, { x: 600, y: 355 },
    { x: 980, y: 345 }, { x: 1150, y: 265 }, { x: 1480, y: 265 },
    { x: 2050, y: 335 }, { x: 2200, y: 255 }, { x: 2700, y: 195 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ---- LEVEL 54: כוכבי ציור ----
const crayonLevel54: LevelData = {
  id: 54, worldType: 'crayon', paletteName: 'CRAYON_NIGHT', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 400 },
  goalX: 2900, goalY: 240,
  platforms: [
    { x: 0,    y: 460, width: 200, height: 40 },
    { x: 260,  y: 390, width: 110, height: 22 },
    { x: 440,  y: 320, width: 90,  height: 22, type: 'passthrough' },
    { x: 590,  y: 250, width: 90,  height: 22, type: 'passthrough' },
    { x: 740,  y: 320, width: 90,  height: 22, type: 'passthrough' },
    { x: 890,  y: 390, width: 110, height: 22 },
    { x: 1060, y: 310, width: 90,  height: 22, type: 'crumbling' },
    { x: 1210, y: 240, width: 110, height: 22 },
    { x: 1380, y: 310, width: 90,  height: 22, type: 'crumbling' },
    { x: 1540, y: 390, width: 110, height: 22 },
    { x: 1710, y: 310, width: 90,  height: 22, type: 'moving', moveX: 80, moveSpeed: 1.1 },
    { x: 1870, y: 240, width: 110, height: 22 },
    { x: 2050, y: 310, width: 90,  height: 22, type: 'moving', moveY: 70, moveSpeed: 1.0 },
    { x: 2210, y: 240, width: 110, height: 22 },
    { x: 2390, y: 310, width: 100, height: 22 },
    { x: 2560, y: 240, width: 120, height: 22 },
    { x: 2740, y: 280, width: 200, height: 22 },
    { x: 2720, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster6', x: 300,  y: 365, patrolDistance: 90,  variant: 0 },
    { x: 620, y: 225, patrolDistance: 70,  variant: 1, type: 'monster3' },
    { type: 'monster6', x: 930,  y: 365, patrolDistance: 90,  variant: 0 },
    { type: 'monster3', x: 1250, y: 215, patrolDistance: 90,  variant: 1 },
    { type: 'monster6', x: 1580, y: 365, patrolDistance: 90,  variant: 0 },
    { type: 'monster3', x: 1910, y: 215, patrolDistance: 90,  variant: 1 },
    { type: 'monster6', x: 2600, y: 215, patrolDistance: 110, variant: 0 },
  ],
  coins: [
    { x: 300, y: 355 }, { x: 480, y: 285 }, { x: 625, y: 215 },
    { x: 780, y: 285 }, { x: 1250, y: 205 }, { x: 1910, y: 205 },
    { x: 2250, y: 205 }, { x: 2600, y: 205 }, { x: 2790, y: 245 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ---- LEVEL 55: הקרב הצבעוני ----
const crayonLevel55: LevelData = {
  id: 55, worldType: 'crayon', paletteName: 'CRAYON_RAINBOW', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 400 },
  goalX: 3000, goalY: 220,
  platforms: [
    { x: 0,    y: 460, width: 200, height: 40 },
    { x: 260,  y: 380, width: 100, height: 22, type: 'crumbling' },
    { x: 420,  y: 310, width: 100, height: 22 },
    { x: 580,  y: 380, width: 100, height: 22, type: 'crumbling' },
    { x: 740,  y: 460, width: 160, height: 40 },
    { x: 980,  y: 380, width: 100, height: 22 },
    { x: 1140, y: 300, width: 100, height: 22, type: 'moving', moveX: 90, moveSpeed: 1.1 },
    { x: 1300, y: 380, width: 100, height: 22 },
    { x: 1460, y: 300, width: 100, height: 22, type: 'crumbling' },
    { x: 1620, y: 380, width: 100, height: 22 },
    { x: 1800, y: 460, width: 160, height: 40 },
    { x: 2040, y: 370, width: 100, height: 22, type: 'moving', moveX: 80, moveSpeed: 1.2 },
    { x: 2200, y: 290, width: 100, height: 22, type: 'crumbling' },
    { x: 2360, y: 370, width: 100, height: 22 },
    { x: 2520, y: 290, width: 100, height: 22, type: 'moving', moveY: 80, moveSpeed: 1.0 },
    { x: 2680, y: 220, width: 120, height: 22 },
    { x: 2840, y: 260, width: 200, height: 22 },
    { x: 2820, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster5', x: 460,  y: 285, patrolDistance: 90,  variant: 0 },
    { type: 'monster3', x: 800,  y: 435, patrolDistance: 120, variant: 1 },
    { type: 'monster5', x: 1020, y: 355, patrolDistance: 90,  variant: 0 },
    { type: 'monster3', x: 1340, y: 355, patrolDistance: 90,  variant: 1 },
    { type: 'monster5', x: 1660, y: 355, patrolDistance: 90,  variant: 0 },
    { type: 'monster3', x: 1860, y: 435, patrolDistance: 120, variant: 1 },
    { type: 'monster6', x: 2400, y: 345, patrolDistance: 90,  variant: 0 },
    { type: 'monster5', x: 2720, y: 195, patrolDistance: 110, variant: 1 },
  ],
  coins: [
    { x: 460, y: 275 }, { x: 620, y: 345 }, { x: 1020, y: 345 },
    { x: 1180, y: 265 }, { x: 1500, y: 265 }, { x: 2080, y: 335 },
    { x: 2240, y: 255 }, { x: 2720, y: 185 }, { x: 2890, y: 225 },
  ],
  timeLimit: 0, parallaxLayers: 2,
};

// ---- LEVEL 56: מבוך הפרחים ----
const crayonLevel56: LevelData = {
  id: 56, worldType: 'crayon', paletteName: 'CRAYON_GARDEN', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 400 },
  goalX: 3100, goalY: 200,
  platforms: [
    { x: 0,    y: 460, width: 200, height: 40 },
    { x: 260,  y: 380, width: 120, height: 22 },
    { x: 440,  y: 300, width: 100, height: 22, type: 'passthrough' },
    { x: 600,  y: 220, width: 100, height: 22, type: 'passthrough' },
    { x: 760,  y: 300, width: 100, height: 22, type: 'passthrough' },
    { x: 920,  y: 380, width: 120, height: 22 },
    { x: 1100, y: 300, width: 100, height: 22, type: 'crumbling' },
    { x: 1260, y: 220, width: 120, height: 22 },
    { x: 1440, y: 300, width: 100, height: 22, type: 'crumbling' },
    { x: 1600, y: 380, width: 120, height: 22 },
    { x: 1780, y: 300, width: 100, height: 22, type: 'moving', moveX: 80, moveSpeed: 1.1 },
    { x: 1940, y: 220, width: 120, height: 22 },
    { x: 2120, y: 300, width: 100, height: 22, type: 'moving', moveY: 70, moveSpeed: 1.2 },
    { x: 2280, y: 220, width: 120, height: 22 },
    { x: 2460, y: 300, width: 110, height: 22 },
    { x: 2640, y: 220, width: 120, height: 22 },
    { x: 2820, y: 270, width: 120, height: 22 },
    { x: 2980, y: 200, width: 200, height: 22 },
    { x: 2960, y: 460, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster4', x: 300,  y: 355, patrolDistance: 100, variant: 0 },
    { type: 'monster2', x: 640,  y: 195, patrolDistance: 80,  variant: 1 },
    { type: 'monster4', x: 960,  y: 355, patrolDistance: 100, variant: 0 },
    { type: 'monster2', x: 1300, y: 195, patrolDistance: 100, variant: 1 },
    { type: 'monster4', x: 1640, y: 355, patrolDistance: 100, variant: 0 },
    { type: 'monster2', x: 1980, y: 195, patrolDistance: 100, variant: 1 },
    { type: 'monster6', x: 2320, y: 195, patrolDistance: 100, variant: 0 },
    { type: 'monster4', x: 2680, y: 195, patrolDistance: 100, variant: 1 },
  ],
  coins: [
    { x: 300, y: 345 }, { x: 480, y: 265 }, { x: 640, y: 185 },
    { x: 800, y: 265 }, { x: 1300, y: 185 }, { x: 1980, y: 185 },
    { x: 2320, y: 185 }, { x: 2680, y: 185 }, { x: 3020, y: 165 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ---- LEVEL 57: ספינת הציורים ----
const crayonLevel57: LevelData = {
  id: 57, worldType: 'crayon', paletteName: 'CRAYON_CLOUD', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 390 },
  goalX: 3200, goalY: 180,
  platforms: [
    { x: 0,    y: 440, width: 200, height: 40 },
    { x: 260,  y: 370, width: 100, height: 22, type: 'moving', moveX: 90, moveSpeed: 1.0 },
    { x: 420,  y: 300, width: 100, height: 22, type: 'moving', moveY: 60, moveSpeed: 1.1 },
    { x: 580,  y: 370, width: 100, height: 22, type: 'moving', moveX: 80, moveSpeed: 0.9 },
    { x: 740,  y: 440, width: 160, height: 40 },
    { x: 980,  y: 360, width: 100, height: 22 },
    { x: 1140, y: 280, width: 90,  height: 22, type: 'crumbling' },
    { x: 1290, y: 360, width: 100, height: 22 },
    { x: 1450, y: 280, width: 90,  height: 22, type: 'crumbling' },
    { x: 1600, y: 360, width: 100, height: 22 },
    { x: 1780, y: 440, width: 160, height: 40 },
    { x: 2020, y: 360, width: 100, height: 22, type: 'moving', moveX: 90, moveSpeed: 1.2 },
    { x: 2180, y: 280, width: 90,  height: 22, type: 'moving', moveY: 70, moveSpeed: 1.3 },
    { x: 2340, y: 360, width: 100, height: 22, type: 'moving', moveX: 80, moveSpeed: 1.1 },
    { x: 2510, y: 280, width: 100, height: 22 },
    { x: 2690, y: 210, width: 110, height: 22 },
    { x: 2870, y: 260, width: 110, height: 22 },
    { x: 3060, y: 190, width: 200, height: 22 },
    { x: 3040, y: 440, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster5', x: 800,  y: 415, patrolDistance: 120, variant: 0 },
    { type: 'monster3', x: 1020, y: 335, patrolDistance: 90,  variant: 1 },
    { type: 'monster5', x: 1640, y: 335, patrolDistance: 90,  variant: 0 },
    { type: 'monster3', x: 1840, y: 415, patrolDistance: 120, variant: 1 },
    { type: 'monster5', x: 2550, y: 255, patrolDistance: 90,  variant: 0 },
    { type: 'monster6', x: 2730, y: 185, patrolDistance: 100, variant: 1 },
    { type: 'monster5', x: 3100, y: 165, patrolDistance: 160, variant: 0 },
  ],
  coins: [
    { x: 300, y: 335 }, { x: 460, y: 265 }, { x: 620, y: 335 },
    { x: 1020, y: 325 }, { x: 1180, y: 245 }, { x: 1490, y: 245 },
    { x: 2220, y: 245 }, { x: 2730, y: 175 }, { x: 3110, y: 155 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ---- LEVEL 58: מרוץ האצבעות ----
const crayonLevel58: LevelData = {
  id: 58, worldType: 'crayon', paletteName: 'CRAYON_CANDY', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 390 },
  goalX: 3300, goalY: 160,
  timeLimit: 90,
  platforms: [
    { x: 0,    y: 440, width: 200, height: 40 },
    { x: 260,  y: 370, width: 90,  height: 22 },
    { x: 410,  y: 300, width: 90,  height: 22 },
    { x: 560,  y: 370, width: 90,  height: 22 },
    { x: 710,  y: 300, width: 90,  height: 22 },
    { x: 860,  y: 370, width: 90,  height: 22 },
    { x: 1010, y: 440, width: 160, height: 40 },
    { x: 1240, y: 360, width: 90,  height: 22, type: 'moving', moveX: 80, moveSpeed: 1.2 },
    { x: 1390, y: 280, width: 90,  height: 22, type: 'moving', moveY: 70, moveSpeed: 1.3 },
    { x: 1540, y: 360, width: 90,  height: 22, type: 'moving', moveX: 80, moveSpeed: 1.1 },
    { x: 1690, y: 280, width: 90,  height: 22, type: 'crumbling' },
    { x: 1840, y: 360, width: 90,  height: 22 },
    { x: 1990, y: 440, width: 160, height: 40 },
    { x: 2230, y: 360, width: 90,  height: 22, type: 'crumbling' },
    { x: 2380, y: 280, width: 90,  height: 22, type: 'crumbling' },
    { x: 2530, y: 360, width: 90,  height: 22, type: 'crumbling' },
    { x: 2680, y: 280, width: 100, height: 22 },
    { x: 2850, y: 210, width: 100, height: 22 },
    { x: 3030, y: 260, width: 110, height: 22 },
    { x: 3180, y: 190, width: 200, height: 22 },
    { x: 3160, y: 440, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster6', x: 300,  y: 345, patrolDistance: 90,  variant: 0 },
    { type: 'monster4', x: 600,  y: 345, patrolDistance: 90,  variant: 1 },
    { type: 'monster6', x: 900,  y: 345, patrolDistance: 90,  variant: 0 },
    { type: 'monster4', x: 1070, y: 415, patrolDistance: 120, variant: 1 },
    { type: 'monster6', x: 1580, y: 335, patrolDistance: 80,  variant: 0 },
    { type: 'monster4', x: 1880, y: 335, patrolDistance: 80,  variant: 1 },
    { type: 'monster6', x: 2050, y: 415, patrolDistance: 120, variant: 0 },
    { type: 'monster5', x: 2720, y: 255, patrolDistance: 90,  variant: 1 },
    { type: 'monster6', x: 3220, y: 165, patrolDistance: 160, variant: 0 },
  ],
  coins: [
    { x: 300, y: 335 }, { x: 450, y: 265 }, { x: 600, y: 335 },
    { x: 1280, y: 325 }, { x: 1430, y: 245 }, { x: 1730, y: 245 },
    { x: 2420, y: 245 }, { x: 2890, y: 175 }, { x: 3220, y: 155 },
  ],
  parallaxLayers: 2,
};

// ---- LEVEL 59: גן הפסלים ----
const crayonLevel59: LevelData = {
  id: 59, worldType: 'crayon', paletteName: 'CRAYON_NIGHT', music: 'crayon_theme',
  spawnPoint: { x: 80, y: 390 },
  goalX: 3400, goalY: 160,
  platforms: [
    { x: 0,    y: 440, width: 200, height: 40 },
    { x: 260,  y: 370, width: 110, height: 22 },
    { x: 440,  y: 300, width: 90,  height: 22, type: 'passthrough' },
    { x: 590,  y: 230, width: 90,  height: 22, type: 'passthrough' },
    { x: 740,  y: 300, width: 90,  height: 22, type: 'passthrough' },
    { x: 890,  y: 370, width: 110, height: 22 },
    { x: 1070, y: 290, width: 90,  height: 22, type: 'crumbling' },
    { x: 1220, y: 220, width: 110, height: 22 },
    { x: 1400, y: 290, width: 90,  height: 22, type: 'crumbling' },
    { x: 1560, y: 370, width: 110, height: 22 },
    { x: 1740, y: 290, width: 90,  height: 22, type: 'moving', moveX: 80, moveSpeed: 1.2 },
    { x: 1900, y: 220, width: 110, height: 22 },
    { x: 2080, y: 290, width: 90,  height: 22, type: 'moving', moveY: 70, moveSpeed: 1.3 },
    { x: 2240, y: 220, width: 110, height: 22 },
    { x: 2420, y: 290, width: 90,  height: 22, type: 'crumbling' },
    { x: 2580, y: 220, width: 110, height: 22 },
    { x: 2760, y: 290, width: 90,  height: 22, type: 'crumbling' },
    { x: 2920, y: 220, width: 110, height: 22 },
    { x: 3100, y: 270, width: 110, height: 22 },
    { x: 3280, y: 200, width: 200, height: 22 },
    { x: 3260, y: 440, width: 280, height: 40 },
  ],
  enemies: [
    { type: 'monster6', x: 300,  y: 345, patrolDistance: 90,  variant: 0 },
    { type: 'monster5', x: 625,  y: 205, patrolDistance: 70,  variant: 1 },
    { type: 'monster6', x: 930,  y: 345, patrolDistance: 90,  variant: 0 },
    { type: 'monster5', x: 1260, y: 195, patrolDistance: 90,  variant: 1 },
    { type: 'monster6', x: 1600, y: 345, patrolDistance: 90,  variant: 0 },
    { type: 'monster5', x: 1940, y: 195, patrolDistance: 90,  variant: 1 },
    { type: 'monster6', x: 2280, y: 195, patrolDistance: 90,  variant: 0 },
    { type: 'monster5', x: 2620, y: 195, patrolDistance: 90,  variant: 1 },
    { type: 'monster6', x: 3320, y: 175, patrolDistance: 160, variant: 0 },
  ],
  coins: [
    { x: 300, y: 335 }, { x: 475, y: 265 }, { x: 625, y: 195 },
    { x: 780, y: 265 }, { x: 1260, y: 185 }, { x: 1940, y: 185 },
    { x: 2280, y: 185 }, { x: 2620, y: 185 }, { x: 3320, y: 165 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ---- LEVEL 60: BOSS FINAL — המלך הצבעוני ----
const crayonBoss60: LevelData = {
  id: 60, worldType: 'crayon', paletteName: 'CRAYON_RAINBOW', music: 'boss_theme',
  isBoss: true,
  spawnPoint: { x: 80, y: 390 },
  goalX: 1700, goalY: 350,
  platforms: [
    { x: 0,    y: 440, width: 1900, height: 40 },
    { x: 180,  y: 330, width: 150, height: 22 },
    { x: 440,  y: 260, width: 120, height: 22, type: 'passthrough' },
    { x: 680,  y: 330, width: 150, height: 22 },
    { x: 920,  y: 260, width: 120, height: 22, type: 'passthrough' },
    { x: 1160, y: 330, width: 150, height: 22 },
    { x: 1400, y: 260, width: 120, height: 22, type: 'passthrough' },
    // High platforms
    { x: 500,  y: 180, width: 100, height: 22, type: 'passthrough' },
    { x: 780,  y: 160, width: 140, height: 22 },
    { x: 1060, y: 180, width: 100, height: 22, type: 'passthrough' },
    // Moving platforms
    { x: 300,  y: 380, width: 90,  height: 22, type: 'moving', moveX: 60, moveSpeed: 1.0 },
    { x: 1500, y: 380, width: 90,  height: 22, type: 'moving', moveX: 60, moveSpeed: 1.0 },
  ],
  enemies: [],
  coins: [
    { x: 220, y: 295 }, { x: 480, y: 225 }, { x: 720, y: 295 },
    { x: 540, y: 145 }, { x: 820, y: 125 }, { x: 1100, y: 145 },
    { x: 960, y: 225 }, { x: 1200, y: 295 }, { x: 1440, y: 225 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};


export function getLevelData(id: number): LevelData | undefined {
  const extraLevels: LevelData[] = [
    // Earth
    earthLevel4, earthLevel5, earthLevel6, earthLevel7, earthLevel8, earthLevel9,
    // Water
    waterLevel11, waterLevel12,
    waterLevel13, waterLevel14, waterLevel15,
    waterLevel16, waterLevel17, waterLevel18, waterLevel19,
    waterBoss20,
    // Sky
    skyLevel21, skyLevel22, skyLevel23,
    skyLevel24, skyLevel25, skyLevel26, skyLevel27, skyLevel28, skyLevel29,
    skyBoss30,
    // Space
    spaceLevel31, spaceLevel32,
    spaceLevel33, spaceLevel34,
    spaceLevel35, spaceLevel36, spaceLevel37, spaceLevel38, spaceLevel39,
    spaceBoss40,
    // Crayon — ציורי ילדים
    crayonLevel41, crayonLevel42, crayonLevel43, crayonLevel44, crayonLevel45,
    crayonLevel46, crayonLevel47, crayonLevel48, crayonLevel49, crayonBoss50,
    crayonLevel51, crayonLevel52, crayonLevel53, crayonLevel54, crayonLevel55,
    crayonLevel56, crayonLevel57, crayonLevel58, crayonLevel59, crayonBoss60,
  ];
  const extra = extraLevels.find(l => l.id === id);
  if (extra) return extra;
  return LEVELS.find(l => l.id === id);
}

// ---- LEVEL 10: BOSS — Stone Giant ----
LEVELS.push({
  id: 10,
  worldType: 'earth',
  paletteName: 'MAGMA',
  music: 'boss_theme',
  spawnPoint: { x: 120, y: 420 },
  platforms: [
    { x: 0,    y: 500, width: 2000, height: 40 },
    { x: 60,   y: 380, width: 120, height: 20 },
    { x: 800,  y: 360, width: 100, height: 20 },
    { x: 1600, y: 370, width: 130, height: 20 },
    { x: 400,  y: 290, width: 80,  height: 20, type: 'moving', moveX: 120, moveSpeed: 0.8 },
    { x: 1100, y: 290, width: 80,  height: 20, type: 'moving', moveX: -100, moveSpeed: 1.0 },
  ],
  enemies: [],
  coins: [
    { x: 200, y: 460 }, { x: 400, y: 460 }, { x: 600, y: 460 },
    { x: 800, y: 460 }, { x: 1000, y: 460 }, { x: 1200, y: 460 },
    { x: 90,  y: 340 }, { x: 120, y: 340 },
    { x: 830, y: 320 }, { x: 860, y: 320 },
  ],
  goalX: 1800,
  goalY: 430,
  isBoss: true,
  timeLimit: 0,
  parallaxLayers: 2,
});


// ============================================================
// WATER WORLD — Levels 11-12 (fish_happy + jellycap enemies)
// ============================================================

const waterLevel11: LevelData = {
  id: 11,
  worldType: 'water',
  paletteName: 'OCEAN',
  music: 'water_theme',
  spawnPoint: { x: 80, y: 400 },
  goalX: 1700, goalY: 400,
  timeLimit: 0,
  platforms: [
    { x: 0,    y: 500, width: 2000, height: 40 },
    { x: 200,  y: 400, width: 120, height: 20 },
    { x: 480,  y: 350, width: 100, height: 20 },
    { x: 750,  y: 300, width: 140, height: 20 },
    { x: 1000, y: 350, width: 90,  height: 20 },
    { x: 1250, y: 310, width: 110, height: 20 },
    { x: 380,  y: 430, width: 80,  height: 20, type: 'moving', moveX: 120, moveSpeed: 0.8 },
    { x: 900,  y: 390, width: 80,  height: 20, type: 'moving', moveX: 80,  moveSpeed: 1.0 },
    { x: 1450, y: 370, width: 80,  height: 20, type: 'moving', moveX: 100, moveSpeed: 0.9 },
  ],
  enemies: [
    { x: 300,  y: 360, type: 'monster3', patrolDistance: 100 },
    { x: 600,  y: 320, type: 'monster4',      patrolDistance: 80 },
    { x: 850,  y: 280, type: 'monster3', patrolDistance: 120, variant: 1 },
    { x: 1100, y: 330, type: 'monster4',      patrolDistance: 90 },
    { x: 1400, y: 290, type: 'monster3', patrolDistance: 100 },
  ],
  coins: [
    { x: 240, y: 375 }, { x: 270, y: 375 }, { x: 520, y: 325 },
    { x: 790, y: 275 }, { x: 820, y: 275 }, { x: 1050, y: 325 },
    { x: 1300, y: 285 }, { x: 1550, y: 345 }, { x: 1580, y: 345 },
    { x: 1610, y: 345 },
  ],
};

const waterLevel12: LevelData = {
  id: 12,
  worldType: 'water',
  paletteName: 'DEEP_SEA',
  music: 'water_theme',
  spawnPoint: { x: 80, y: 420 },
  goalX: 1850, goalY: 400,
  timeLimit: 0,
  platforms: [
    { x: 0,    y: 500, width: 2100, height: 40 },
    { x: 160,  y: 410, width: 100, height: 20 },
    { x: 380,  y: 360, width: 80,  height: 20 },
    { x: 620,  y: 320, width: 120, height: 20 },
    { x: 880,  y: 370, width: 80,  height: 20 },
    { x: 1100, y: 310, width: 100, height: 20 },
    { x: 1340, y: 350, width: 90,  height: 20 },
    { x: 1580, y: 380, width: 110, height: 20 },
    { x: 450,  y: 450, width: 70,  height: 20, type: 'moving', moveX: 90,  moveSpeed: 1.1 },
    { x: 750,  y: 430, width: 70,  height: 20, type: 'moving', moveX: 110, moveSpeed: 0.9 },
    { x: 1200, y: 410, width: 70,  height: 20, type: 'moving', moveX: 80,  moveSpeed: 1.2 },
  ],
  enemies: [
    { x: 260,  y: 390, type: 'monster3', patrolDistance: 80 },
    { x: 500,  y: 340, type: 'monster4',      patrolDistance: 70, variant: 1 },
    { x: 720,  y: 300, type: 'monster3', patrolDistance: 100 },
    { x: 980,  y: 350, type: 'monster4',      patrolDistance: 85 },
    { x: 1200, y: 290, type: 'monster3', patrolDistance: 110 },
    { x: 1440, y: 330, type: 'monster4',      patrolDistance: 80, variant: 1 },
  ],
  coins: [
    { x: 200, y: 385 }, { x: 420, y: 335 }, { x: 660, y: 295 },
    { x: 920, y: 345 }, { x: 1140, y: 285 }, { x: 1380, y: 325 },
    { x: 1620, y: 355 }, { x: 1650, y: 355 }, { x: 1680, y: 355 },
  ],
};

// ============================================================
// SPACE WORLD — Levels 31-32 (full_eyes + space_telot enemies)
// ============================================================

const spaceLevel31: LevelData = {
  id: 31,
  worldType: 'space',
  paletteName: 'NEBULA',
  music: 'space_theme',
  spawnPoint: { x: 80, y: 400 },
  goalX: 1900, goalY: 380,
  timeLimit: 0,
  platforms: [
    { x: 0,    y: 500, width: 2100, height: 40 },
    { x: 150,  y: 430, width: 90,  height: 20 },
    { x: 350,  y: 380, width: 80,  height: 20 },
    { x: 560,  y: 320, width: 100, height: 20 },
    { x: 780,  y: 270, width: 80,  height: 20 },
    { x: 1000, y: 330, width: 90,  height: 20 },
    { x: 1220, y: 280, width: 80,  height: 20 },
    { x: 1460, y: 320, width: 100, height: 20 },
    { x: 1680, y: 370, width: 90,  height: 20 },
    { x: 440,  y: 470, width: 60,  height: 20, type: 'moving', moveX: 130, moveSpeed: 0.7 },
    { x: 900,  y: 430, width: 60,  height: 20, type: 'moving', moveX: 100, moveSpeed: 0.9 },
    { x: 1360, y: 450, width: 60,  height: 20, type: 'moving', moveX: 120, moveSpeed: 0.8 },
  ],
  enemies: [
    { x: 250,  y: 410, type: 'monster6', patrolDistance: 70 },
    { x: 460,  y: 360, type: 'monster5',  patrolDistance: 90 },
    { x: 660,  y: 300, type: 'monster6', patrolDistance: 75, variant: 1 },
    { x: 880,  y: 250, type: 'monster5',  patrolDistance: 80 },
    { x: 1100, y: 310, type: 'monster6', patrolDistance: 85 },
    { x: 1320, y: 260, type: 'monster5',  patrolDistance: 90, variant: 1 },
    { x: 1560, y: 300, type: 'monster6', patrolDistance: 70 },
  ],
  coins: [
    { x: 190, y: 405 }, { x: 390, y: 355 }, { x: 600, y: 295 },
    { x: 820, y: 245 }, { x: 850, y: 245 }, { x: 1040, y: 305 },
    { x: 1260, y: 255 }, { x: 1500, y: 295 }, { x: 1720, y: 345 },
    { x: 1750, y: 345 },
  ],
};

const spaceLevel32: LevelData = {
  id: 32,
  worldType: 'space',
  paletteName: 'ASTEROID',
  music: 'space_theme',
  spawnPoint: { x: 80, y: 420 },
  goalX: 2000, goalY: 400,
  timeLimit: 0,
  platforms: [
    { x: 0,    y: 500, width: 2200, height: 40 },
    { x: 200,  y: 410, width: 100, height: 20 },
    { x: 420,  y: 350, width: 80,  height: 20 },
    { x: 660,  y: 290, width: 90,  height: 20 },
    { x: 900,  y: 240, width: 80,  height: 20 },
    { x: 1140, y: 290, width: 100, height: 20 },
    { x: 1380, y: 250, width: 80,  height: 20 },
    { x: 1620, y: 300, width: 90,  height: 20 },
    { x: 1840, y: 350, width: 100, height: 20 },
    { x: 320,  y: 470, width: 60,  height: 20, type: 'moving', moveX: 110, moveSpeed: 1.0 },
    { x: 780,  y: 450, width: 60,  height: 20, type: 'moving', moveX: 130, moveSpeed: 0.85 },
    { x: 1280, y: 460, width: 60,  height: 20, type: 'moving', moveX: 100, moveSpeed: 1.1 },
    { x: 1740, y: 440, width: 60,  height: 20, type: 'moving', moveX: 90,  moveSpeed: 0.95 },
  ],
  enemies: [
    { x: 300,  y: 390, type: 'monster5',  patrolDistance: 80 },
    { x: 520,  y: 330, type: 'monster6', patrolDistance: 70 },
    { x: 760,  y: 270, type: 'monster5',  patrolDistance: 85, variant: 1 },
    { x: 1000, y: 220, type: 'monster6', patrolDistance: 75 },
    { x: 1240, y: 270, type: 'monster5',  patrolDistance: 90 },
    { x: 1480, y: 230, type: 'monster6', patrolDistance: 80 },
    { x: 1720, y: 280, type: 'monster5',  patrolDistance: 85, variant: 1 },
  ],
  coins: [
    { x: 240, y: 385 }, { x: 460, y: 325 }, { x: 700, y: 265 },
    { x: 940, y: 215 }, { x: 1180, y: 265 }, { x: 1420, y: 225 },
    { x: 1660, y: 275 }, { x: 1880, y: 325 }, { x: 1910, y: 325 },
    { x: 1940, y: 325 },
  ],
};

// ============================================================
// WATER WORLD — Missing levels 16-19
// ============================================================

const waterLevel16: LevelData = {
  id: 16, worldType: 'water', paletteName: 'DEEP_SEA', music: 'water_theme',
  spawnPoint: { x: 80, y: 420 }, goalX: 2800, goalY: 340,
  platforms: [
    { x: 0,    y: 500, width: 260, height: 40 },
    { x: 320,  y: 460, width: 80,  height: 20 },
    { x: 460,  y: 420, width: 80,  height: 20 },
    { x: 600,  y: 380, width: 80,  height: 20 },
    { x: 740,  y: 500, width: 260, height: 40 },
    // Vertical moving platforms over deep gap
    { x: 840,  y: 400, width: 70,  height: 20, type: 'moving', moveY: 80,  moveSpeed: 0.9 },
    { x: 1080, y: 360, width: 70,  height: 20, type: 'moving', moveY: 100, moveSpeed: 1.1 },
    { x: 1320, y: 420, width: 70,  height: 20, type: 'moving', moveY: 70,  moveSpeed: 0.8 },
    { x: 1560, y: 500, width: 260, height: 40 },
    { x: 1640, y: 380, width: 100, height: 20, type: 'passthrough' },
    { x: 1900, y: 460, width: 80,  height: 20 },
    { x: 2040, y: 400, width: 80,  height: 20 },
    { x: 2180, y: 340, width: 80,  height: 20 },
    { x: 2380, y: 500, width: 600, height: 40 },
    { x: 2500, y: 320, width: 160, height: 20, type: 'passthrough' },
    { x: 2680, y: 280, width: 140, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster3', x: 180,  y: 495, patrolDistance: 100, variant: 0 },
    { type: 'monster4',      x: 780,  y: 495, patrolDistance: 180, variant: 0 },
    { type: 'monster3', x: 1600, y: 495, patrolDistance: 200, variant: 1 },
    { type: 'monster4',      x: 2000, y: 495, patrolDistance: 150, variant: 0 },
    { type: 'monster3', x: 2420, y: 495, patrolDistance: 130, variant: 0 },
  ],
  coins: [
    { x: 350, y: 430 }, { x: 490, y: 390 }, { x: 630, y: 350 },
    { x: 870, y: 380 }, { x: 1110, y: 340 }, { x: 1350, y: 400 },
    { x: 1670, y: 350 }, { x: 2070, y: 370 }, { x: 2530, y: 290 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const waterLevel17: LevelData = {
  id: 17, worldType: 'water', paletteName: 'DEEP_SEA', music: 'water_theme',
  spawnPoint: { x: 80, y: 420 }, goalX: 3000, goalY: 320,
  platforms: [
    { x: 0,    y: 460, width: 240, height: 40 },
    // Crumbling platforms over gaps — high stakes!
    { x: 300,  y: 430, width: 90,  height: 20, type: 'crumbling' },
    { x: 460,  y: 390, width: 90,  height: 20, type: 'crumbling' },
    { x: 620,  y: 430, width: 90,  height: 20, type: 'crumbling' },
    { x: 780,  y: 460, width: 240, height: 40 },
    { x: 840,  y: 360, width: 100, height: 20, type: 'passthrough' },
    { x: 1100, y: 420, width: 90,  height: 20, type: 'crumbling' },
    { x: 1260, y: 380, width: 90,  height: 20, type: 'crumbling' },
    { x: 1420, y: 420, width: 90,  height: 20, type: 'crumbling' },
    { x: 1580, y: 460, width: 240, height: 40 },
    { x: 1660, y: 350, width: 100, height: 20, type: 'passthrough' },
    { x: 1880, y: 420, width: 80,  height: 20 },
    { x: 2020, y: 360, width: 80,  height: 20 },
    { x: 2160, y: 420, width: 80,  height: 20 },
    { x: 2300, y: 360, width: 80,  height: 20 },
    { x: 2500, y: 460, width: 700, height: 40 },
    { x: 2620, y: 320, width: 160, height: 20, type: 'passthrough' },
    { x: 2840, y: 280, width: 180, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster4',      x: 160,  y: 425, patrolDistance: 120, variant: 0 },
    { type: 'monster3', x: 820,  y: 425, patrolDistance: 160, variant: 1 },
    { type: 'monster4',      x: 1620, y: 425, patrolDistance: 200, variant: 0 },
    { type: 'monster3', x: 1900, y: 385, patrolDistance: 80,  variant: 0 },
    { type: 'monster4',      x: 2540, y: 425, patrolDistance: 180, variant: 0 },
    { type: 'monster3', x: 2760, y: 425, patrolDistance: 100, variant: 1 },
  ],
  coins: [
    { x: 330, y: 400 }, { x: 490, y: 360 }, { x: 650, y: 400 },
    { x: 870, y: 330 }, { x: 1130, y: 390 }, { x: 1450, y: 390 },
    { x: 1690, y: 320 }, { x: 2050, y: 330 }, { x: 2650, y: 290 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const waterLevel18: LevelData = {
  id: 18, worldType: 'water', paletteName: 'DEEP_SEA', music: 'water_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 3000, goalY: 300,
  platforms: [
    { x: 0,    y: 420, width: 200, height: 40 },
    { x: 260,  y: 380, width: 80,  height: 20 },
    { x: 400,  y: 320, width: 80,  height: 20 },
    { x: 540,  y: 380, width: 80,  height: 20 },
    { x: 680,  y: 420, width: 80,  height: 20 },
    { x: 820,  y: 360, width: 80,  height: 20 },
    { x: 960,  y: 300, width: 80,  height: 20 },
    { x: 1100, y: 420, width: 300, height: 40 },
    { x: 1460, y: 380, width: 80,  height: 20 },
    { x: 1600, y: 320, width: 80,  height: 20 },
    { x: 1740, y: 380, width: 80,  height: 20 },
    { x: 1880, y: 420, width: 80,  height: 20 },
    { x: 2020, y: 360, width: 80,  height: 20 },
    { x: 2160, y: 300, width: 80,  height: 20 },
    { x: 2300, y: 420, width: 500, height: 40 },
    { x: 2400, y: 300, width: 100, height: 20, type: 'passthrough' },
    { x: 2600, y: 240, width: 160, height: 20, type: 'passthrough' },
    { x: 2820, y: 300, width: 160, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster4',      x: 120,  y: 385, patrolDistance: 80,  variant: 1 },
    { type: 'monster3', x: 430,  y: 345, patrolDistance: 60,  variant: 0 },
    { type: 'monster4',      x: 1140, y: 385, patrolDistance: 220, variant: 0 },
    { type: 'monster3', x: 1490, y: 345, patrolDistance: 60,  variant: 1 },
    { type: 'monster4',      x: 1910, y: 385, patrolDistance: 80,  variant: 0 },
    { type: 'monster3', x: 2340, y: 385, patrolDistance: 200, variant: 0 },
    { type: 'monster4',      x: 2620, y: 385, patrolDistance: 100, variant: 1 },
  ],
  coins: [
    { x: 290, y: 350 }, { x: 430, y: 290 }, { x: 710, y: 390 },
    { x: 990, y: 270 }, { x: 1490, y: 350 }, { x: 1630, y: 290 },
    { x: 2430, y: 270 }, { x: 2630, y: 210 }, { x: 2850, y: 270 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const waterLevel19: LevelData = {
  id: 19, worldType: 'water', paletteName: 'DEEP_OCEAN', music: 'water_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 3400, goalY: 300,
  platforms: [
    { x: 0,    y: 420, width: 180, height: 40 },
    { x: 240,  y: 380, width: 80,  height: 20 },
    { x: 380,  y: 320, width: 80,  height: 20 },
    { x: 520,  y: 380, width: 80,  height: 20 },
    { x: 660,  y: 420, width: 80,  height: 20 },
    { x: 800,  y: 360, width: 80,  height: 20 },
    { x: 940,  y: 300, width: 80,  height: 20 },
    // Mix of crumbling + moving
    { x: 1080, y: 380, width: 80,  height: 20, type: 'crumbling' },
    { x: 1220, y: 420, width: 80,  height: 20, type: 'moving', moveX: 100, moveSpeed: 1.1 },
    { x: 1360, y: 360, width: 80,  height: 20, type: 'crumbling' },
    { x: 1500, y: 420, width: 300, height: 40 },
    { x: 1580, y: 320, width: 100, height: 20, type: 'passthrough' },
    { x: 1860, y: 380, width: 80,  height: 20 },
    { x: 2000, y: 320, width: 80,  height: 20 },
    { x: 2140, y: 380, width: 80,  height: 20 },
    { x: 2280, y: 420, width: 80,  height: 20 },
    { x: 2420, y: 360, width: 80,  height: 20 },
    { x: 2560, y: 300, width: 80,  height: 20 },
    { x: 2700, y: 420, width: 300, height: 40 },
    { x: 2800, y: 300, width: 100, height: 20, type: 'passthrough' },
    { x: 3000, y: 240, width: 160, height: 20, type: 'passthrough' },
    { x: 3200, y: 300, width: 200, height: 20, type: 'passthrough' },
  ],
  enemies: [
    { type: 'monster4',      x: 100,  y: 385, patrolDistance: 80,  variant: 0 },
    { type: 'monster3', x: 410,  y: 345, patrolDistance: 60,  variant: 1 },
    { type: 'monster4',      x: 830,  y: 345, patrolDistance: 60,  variant: 0 },
    { type: 'monster3', x: 1540, y: 385, patrolDistance: 180, variant: 0 },
    { type: 'monster4',      x: 1890, y: 345, patrolDistance: 80,  variant: 1 },
    { type: 'monster3', x: 2160, y: 345, patrolDistance: 60,  variant: 0 },
    { type: 'monster4',      x: 2740, y: 385, patrolDistance: 220, variant: 0 },
    { type: 'monster3', x: 3040, y: 385, patrolDistance: 100, variant: 1 },
  ],
  coins: [
    { x: 270, y: 350 }, { x: 410, y: 290 }, { x: 690, y: 390 },
    { x: 970, y: 270 }, { x: 1610, y: 290 }, { x: 2030, y: 290 },
    { x: 2590, y: 270 }, { x: 3030, y: 210 }, { x: 3230, y: 270 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ============================================================
// SKY WORLD — Missing levels 24-29
// ============================================================

const skyLevel24: LevelData = {
  id: 24, worldType: 'sky', paletteName: 'SKY_HIGH', music: 'sky_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 2600, goalY: 220,
  platforms: [
    { x: 0,    y: 420, width: 200, height: 20 },
    { x: 260,  y: 360, width: 80,  height: 20 },
    { x: 400,  y: 300, width: 80,  height: 20 },
    { x: 540,  y: 240, width: 80,  height: 20 },
    { x: 680,  y: 300, width: 80,  height: 20 },
    // Vertical moving cloud platforms
    { x: 820,  y: 360, width: 80,  height: 20, type: 'moving', moveY: 80,  moveSpeed: 0.8 },
    { x: 980,  y: 300, width: 80,  height: 20, type: 'moving', moveY: 100, moveSpeed: 1.0 },
    { x: 1140, y: 360, width: 80,  height: 20, type: 'moving', moveY: 70,  moveSpeed: 0.9 },
    { x: 1300, y: 420, width: 200, height: 20 },
    { x: 1560, y: 360, width: 80,  height: 20 },
    { x: 1700, y: 300, width: 80,  height: 20 },
    { x: 1840, y: 240, width: 80,  height: 20 },
    { x: 1980, y: 300, width: 80,  height: 20 },
    { x: 2120, y: 360, width: 80,  height: 20 },
    { x: 2260, y: 420, width: 200, height: 20 },
    { x: 2400, y: 280, width: 160, height: 20, type: 'passthrough' },
    { x: 2540, y: 220, width: 160, height: 20 },
  ],
  enemies: [
    { type: 'monster5', x: 100,  y: 385, patrolDistance: 120, variant: 0 },
    { type: 'monster5', x: 570,  y: 205, patrolDistance: 50,  variant: 1 },
    { type: 'monster5', x: 1360, y: 385, patrolDistance: 120, variant: 0 },
    { type: 'monster5', x: 1870, y: 205, patrolDistance: 60,  variant: 1 },
    { type: 'monster5', x: 2300, y: 385, patrolDistance: 120, variant: 0 },
  ],
  coins: [
    { x: 290, y: 330 }, { x: 430, y: 270 }, { x: 570, y: 210 },
    { x: 850, y: 340 }, { x: 1010, y: 280 }, { x: 1170, y: 340 },
    { x: 1590, y: 330 }, { x: 1870, y: 210 }, { x: 2430, y: 250 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const skyLevel25: LevelData = {
  id: 25, worldType: 'sky', paletteName: 'SUNSET', music: 'sky_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 2800, goalY: 200,
  platforms: [
    { x: 0,    y: 420, width: 180, height: 20 },
    { x: 240,  y: 360, width: 80,  height: 20 },
    { x: 380,  y: 300, width: 80,  height: 20 },
    { x: 520,  y: 240, width: 80,  height: 20 },
    { x: 660,  y: 300, width: 80,  height: 20 },
    { x: 800,  y: 360, width: 80,  height: 20 },
    { x: 940,  y: 420, width: 180, height: 20 },
    // Crumbling cloud platforms
    { x: 1180, y: 360, width: 90,  height: 20, type: 'crumbling' },
    { x: 1340, y: 300, width: 90,  height: 20, type: 'crumbling' },
    { x: 1500, y: 360, width: 90,  height: 20, type: 'crumbling' },
    { x: 1660, y: 420, width: 180, height: 20 },
    { x: 1900, y: 360, width: 80,  height: 20 },
    { x: 2040, y: 300, width: 80,  height: 20 },
    { x: 2180, y: 240, width: 80,  height: 20 },
    { x: 2320, y: 300, width: 80,  height: 20 },
    { x: 2460, y: 420, width: 180, height: 20 },
    { x: 2560, y: 240, width: 180, height: 20, type: 'passthrough' },
    { x: 2700, y: 200, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster5', x: 90,   y: 385, patrolDistance: 100, variant: 0 },
    { type: 'monster5', x: 550,  y: 205, patrolDistance: 50,  variant: 1 },
    { type: 'monster5', x: 980,  y: 385, patrolDistance: 100, variant: 0 },
    { type: 'monster5', x: 1700, y: 385, patrolDistance: 120, variant: 1 },
    { type: 'monster5', x: 2210, y: 205, patrolDistance: 50,  variant: 0 },
    { type: 'monster5', x: 2500, y: 385, patrolDistance: 100, variant: 1 },
  ],
  coins: [
    { x: 270, y: 330 }, { x: 410, y: 270 }, { x: 550, y: 210 },
    { x: 1210, y: 330 }, { x: 1370, y: 270 }, { x: 1530, y: 330 },
    { x: 1930, y: 330 }, { x: 2210, y: 210 }, { x: 2730, y: 170 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const skyLevel26: LevelData = {
  id: 26, worldType: 'sky', paletteName: 'SKY_HIGH', music: 'sky_theme',
  spawnPoint: { x: 80, y: 360 }, goalX: 3000, goalY: 180,
  platforms: [
    { x: 0,    y: 400, width: 180, height: 20 },
    { x: 240,  y: 340, width: 80,  height: 20 },
    { x: 380,  y: 280, width: 80,  height: 20 },
    { x: 520,  y: 220, width: 80,  height: 20 },
    { x: 660,  y: 280, width: 80,  height: 20 },
    { x: 800,  y: 340, width: 80,  height: 20 },
    { x: 940,  y: 400, width: 180, height: 20 },
    { x: 1200, y: 340, width: 80,  height: 20 },
    { x: 1340, y: 280, width: 80,  height: 20 },
    { x: 1480, y: 220, width: 80,  height: 20 },
    { x: 1620, y: 280, width: 80,  height: 20 },
    { x: 1760, y: 340, width: 80,  height: 20 },
    { x: 1900, y: 400, width: 180, height: 20 },
    // Moving + passthrough combo
    { x: 2160, y: 360, width: 80,  height: 20, type: 'moving', moveX: 100, moveSpeed: 1.2 },
    { x: 2360, y: 300, width: 80,  height: 20, type: 'moving', moveX: 80,  moveSpeed: 0.9 },
    { x: 2560, y: 400, width: 240, height: 20 },
    { x: 2680, y: 260, width: 160, height: 20, type: 'passthrough' },
    { x: 2880, y: 200, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster5', x: 90,   y: 365, patrolDistance: 100, variant: 0 },
    { type: 'monster5', x: 550,  y: 185, patrolDistance: 50,  variant: 1 },
    { type: 'monster5', x: 980,  y: 365, patrolDistance: 100, variant: 0 },
    { type: 'monster5', x: 1510, y: 185, patrolDistance: 50,  variant: 1 },
    { type: 'monster5', x: 1940, y: 365, patrolDistance: 100, variant: 0 },
    { type: 'monster5', x: 2600, y: 365, patrolDistance: 160, variant: 1 },
  ],
  coins: [
    { x: 270, y: 310 }, { x: 410, y: 250 }, { x: 550, y: 190 },
    { x: 1230, y: 310 }, { x: 1370, y: 250 }, { x: 1510, y: 190 },
    { x: 2190, y: 330 }, { x: 2390, y: 270 }, { x: 2710, y: 230 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const skyLevel27: LevelData = {
  id: 27, worldType: 'sky', paletteName: 'ICE', music: 'sky_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 3000, goalY: 200,
  platforms: [
    { x: 0,    y: 420, width: 200, height: 20 },
    // Crumbling cloud platforms — fall into sky below!
    { x: 260,  y: 380, width: 90,  height: 20, type: 'crumbling' },
    { x: 420,  y: 320, width: 90,  height: 20, type: 'crumbling' },
    { x: 580,  y: 380, width: 90,  height: 20, type: 'crumbling' },
    { x: 740,  y: 420, width: 200, height: 20 },
    { x: 800,  y: 300, width: 100, height: 20, type: 'passthrough' },
    { x: 1000, y: 360, width: 90,  height: 20, type: 'crumbling' },
    { x: 1160, y: 300, width: 90,  height: 20, type: 'crumbling' },
    { x: 1320, y: 360, width: 90,  height: 20, type: 'crumbling' },
    { x: 1480, y: 420, width: 200, height: 20 },
    { x: 1560, y: 300, width: 100, height: 20, type: 'passthrough' },
    { x: 1760, y: 380, width: 80,  height: 20 },
    { x: 1900, y: 320, width: 80,  height: 20 },
    { x: 2040, y: 260, width: 80,  height: 20 },
    { x: 2180, y: 320, width: 80,  height: 20 },
    { x: 2320, y: 380, width: 80,  height: 20 },
    { x: 2460, y: 420, width: 300, height: 20 },
    { x: 2600, y: 280, width: 160, height: 20, type: 'passthrough' },
    { x: 2820, y: 220, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster5', x: 100,  y: 385, patrolDistance: 120, variant: 0 },
    { type: 'monster5', x: 780,  y: 385, patrolDistance: 120, variant: 1 },
    { type: 'monster5', x: 1530, y: 385, patrolDistance: 140, variant: 0 },
    { type: 'monster5', x: 1930, y: 285, patrolDistance: 60,  variant: 1 },
    { type: 'monster5', x: 2500, y: 385, patrolDistance: 160, variant: 0 },
    { type: 'monster5', x: 2850, y: 185, patrolDistance: 80,  variant: 1 },
  ],
  coins: [
    { x: 290, y: 350 }, { x: 450, y: 290 }, { x: 610, y: 350 },
    { x: 830, y: 270 }, { x: 1030, y: 330 }, { x: 1350, y: 330 },
    { x: 1590, y: 270 }, { x: 2070, y: 230 }, { x: 2850, y: 190 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const skyLevel28: LevelData = {
  id: 28, worldType: 'sky', paletteName: 'SUNSET', music: 'sky_theme',
  spawnPoint: { x: 80, y: 360 }, goalX: 3200, goalY: 180,
  platforms: [
    { x: 0,    y: 400, width: 200, height: 20 },
    { x: 260,  y: 340, width: 80,  height: 20 },
    { x: 400,  y: 280, width: 80,  height: 20 },
    { x: 540,  y: 220, width: 80,  height: 20 },
    { x: 680,  y: 280, width: 80,  height: 20 },
    { x: 820,  y: 340, width: 80,  height: 20 },
    { x: 960,  y: 400, width: 200, height: 20 },
    { x: 1220, y: 340, width: 80,  height: 20 },
    { x: 1360, y: 280, width: 80,  height: 20 },
    { x: 1500, y: 220, width: 80,  height: 20 },
    { x: 1640, y: 280, width: 80,  height: 20 },
    { x: 1780, y: 340, width: 80,  height: 20 },
    { x: 1920, y: 400, width: 200, height: 20 },
    { x: 2180, y: 340, width: 80,  height: 20 },
    { x: 2320, y: 280, width: 80,  height: 20 },
    { x: 2460, y: 220, width: 80,  height: 20 },
    { x: 2600, y: 280, width: 80,  height: 20 },
    { x: 2740, y: 340, width: 80,  height: 20 },
    { x: 2880, y: 400, width: 200, height: 20 },
    { x: 3000, y: 240, width: 160, height: 20, type: 'passthrough' },
    { x: 3140, y: 200, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster5', x: 100,  y: 365, patrolDistance: 120, variant: 0 },
    { type: 'monster5', x: 570,  y: 185, patrolDistance: 50,  variant: 1 },
    { type: 'monster5', x: 1000, y: 365, patrolDistance: 120, variant: 0 },
    { type: 'monster5', x: 1530, y: 185, patrolDistance: 50,  variant: 1 },
    { type: 'monster5', x: 1960, y: 365, patrolDistance: 120, variant: 0 },
    { type: 'monster5', x: 2490, y: 185, patrolDistance: 50,  variant: 1 },
    { type: 'monster5', x: 2920, y: 365, patrolDistance: 120, variant: 0 },
  ],
  coins: [
    { x: 290, y: 310 }, { x: 430, y: 250 }, { x: 570, y: 190 },
    { x: 1250, y: 310 }, { x: 1390, y: 250 }, { x: 1530, y: 190 },
    { x: 2210, y: 310 }, { x: 2490, y: 190 }, { x: 3170, y: 170 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const skyLevel29: LevelData = {
  id: 29, worldType: 'sky', paletteName: 'SKY_HIGH', music: 'sky_theme',
  spawnPoint: { x: 80, y: 360 }, goalX: 3400, goalY: 160,
  platforms: [
    { x: 0,    y: 400, width: 180, height: 20 },
    { x: 240,  y: 340, width: 80,  height: 20 },
    { x: 380,  y: 280, width: 80,  height: 20 },
    { x: 520,  y: 220, width: 80,  height: 20 },
    { x: 660,  y: 280, width: 80,  height: 20 },
    { x: 800,  y: 340, width: 80,  height: 20 },
    { x: 940,  y: 400, width: 180, height: 20 },
    // Mix of moving and crumbling — pre-boss gauntlet
    { x: 1180, y: 360, width: 80,  height: 20, type: 'moving', moveY: 80,  moveSpeed: 1.2 },
    { x: 1340, y: 300, width: 80,  height: 20, type: 'crumbling' },
    { x: 1500, y: 360, width: 80,  height: 20, type: 'moving', moveX: 90,  moveSpeed: 1.0 },
    { x: 1660, y: 300, width: 80,  height: 20, type: 'crumbling' },
    { x: 1820, y: 400, width: 180, height: 20 },
    { x: 2080, y: 340, width: 80,  height: 20 },
    { x: 2220, y: 280, width: 80,  height: 20 },
    { x: 2360, y: 220, width: 80,  height: 20 },
    { x: 2500, y: 280, width: 80,  height: 20 },
    { x: 2640, y: 340, width: 80,  height: 20 },
    { x: 2780, y: 400, width: 180, height: 20 },
    { x: 3040, y: 340, width: 80,  height: 20 },
    { x: 3180, y: 280, width: 80,  height: 20 },
    { x: 3280, y: 220, width: 160, height: 20, type: 'passthrough' },
    { x: 3380, y: 180, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster5', x: 90,   y: 365, patrolDistance: 100, variant: 0 },
    { type: 'monster5', x: 550,  y: 185, patrolDistance: 50,  variant: 1 },
    { type: 'monster5', x: 980,  y: 365, patrolDistance: 100, variant: 0 },
    { type: 'monster5', x: 1860, y: 365, patrolDistance: 120, variant: 1 },
    { type: 'monster5', x: 2390, y: 185, patrolDistance: 60,  variant: 0 },
    { type: 'monster5', x: 2820, y: 365, patrolDistance: 120, variant: 1 },
    { type: 'monster5', x: 3210, y: 245, patrolDistance: 80,  variant: 0 },
  ],
  coins: [
    { x: 270, y: 310 }, { x: 410, y: 250 }, { x: 550, y: 190 },
    { x: 1210, y: 340 }, { x: 1370, y: 270 }, { x: 1530, y: 340 },
    { x: 2250, y: 250 }, { x: 3210, y: 250 }, { x: 3410, y: 150 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// ============================================================
// SPACE WORLD — Missing levels 35-39
// ============================================================

const spaceLevel35: LevelData = {
  id: 35, worldType: 'space', paletteName: 'NEBULA', music: 'space_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 2600, goalY: 240,
  platforms: [
    { x: 0,    y: 420, width: 200, height: 20 },
    { x: 260,  y: 360, width: 80,  height: 20 },
    { x: 400,  y: 300, width: 80,  height: 20 },
    { x: 540,  y: 240, width: 80,  height: 20 },
    { x: 680,  y: 300, width: 80,  height: 20 },
    // Drifting platforms (both X and Y movement)
    { x: 820,  y: 360, width: 70,  height: 20, type: 'moving', moveX: 80,  moveY: 60,  moveSpeed: 0.7 },
    { x: 1000, y: 300, width: 70,  height: 20, type: 'moving', moveX: 100, moveY: 50,  moveSpeed: 0.9 },
    { x: 1180, y: 360, width: 70,  height: 20, type: 'moving', moveX: 70,  moveY: 70,  moveSpeed: 0.8 },
    { x: 1360, y: 420, width: 200, height: 20 },
    { x: 1620, y: 360, width: 80,  height: 20 },
    { x: 1760, y: 300, width: 80,  height: 20 },
    { x: 1900, y: 240, width: 80,  height: 20 },
    { x: 2040, y: 300, width: 80,  height: 20 },
    { x: 2180, y: 360, width: 80,  height: 20 },
    { x: 2320, y: 420, width: 200, height: 20 },
    { x: 2440, y: 280, width: 160, height: 20, type: 'passthrough' },
    { x: 2560, y: 240, width: 180, height: 20 },
  ],
  enemies: [
    { type: 'monster6', x: 100,  y: 385, patrolDistance: 120, variant: 0 },
    { type: 'monster6', x: 570,  y: 205, patrolDistance: 50,  variant: 1 },
    { type: 'monster6', x: 1400, y: 385, patrolDistance: 120, variant: 0 },
    { type: 'monster6', x: 1930, y: 205, patrolDistance: 60,  variant: 1 },
    { type: 'monster6', x: 2360, y: 385, patrolDistance: 120, variant: 0 },
  ],
  coins: [
    { x: 290, y: 330 }, { x: 430, y: 270 }, { x: 570, y: 210 },
    { x: 850, y: 340 }, { x: 1030, y: 280 }, { x: 1210, y: 340 },
    { x: 1790, y: 270 }, { x: 1930, y: 210 }, { x: 2470, y: 250 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const spaceLevel36: LevelData = {
  id: 36, worldType: 'space', paletteName: 'SPACE_VOID', music: 'space_theme',
  spawnPoint: { x: 80, y: 380 }, goalX: 2800, goalY: 220,
  platforms: [
    { x: 0,    y: 420, width: 180, height: 20 },
    { x: 240,  y: 360, width: 80,  height: 20 },
    { x: 380,  y: 300, width: 80,  height: 20 },
    { x: 520,  y: 240, width: 80,  height: 20 },
    { x: 660,  y: 300, width: 80,  height: 20 },
    { x: 800,  y: 360, width: 80,  height: 20 },
    { x: 940,  y: 420, width: 180, height: 20 },
    { x: 1200, y: 360, width: 80,  height: 20 },
    { x: 1340, y: 300, width: 80,  height: 20 },
    { x: 1480, y: 240, width: 80,  height: 20 },
    { x: 1620, y: 300, width: 80,  height: 20 },
    { x: 1760, y: 360, width: 80,  height: 20 },
    { x: 1900, y: 420, width: 180, height: 20 },
    { x: 2160, y: 360, width: 80,  height: 20 },
    { x: 2300, y: 300, width: 80,  height: 20 },
    { x: 2440, y: 240, width: 80,  height: 20 },
    { x: 2580, y: 420, width: 200, height: 20 },
    { x: 2680, y: 280, width: 160, height: 20, type: 'passthrough' },
    { x: 2780, y: 240, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster6', x: 90,   y: 385, patrolDistance: 100, variant: 0 },
    { type: 'monster6', x: 550,  y: 205, patrolDistance: 50,  variant: 1 },
    { type: 'monster6', x: 980,  y: 385, patrolDistance: 100, variant: 0 },
    { type: 'monster6', x: 1510, y: 205, patrolDistance: 50,  variant: 1 },
    { type: 'monster6', x: 1940, y: 385, patrolDistance: 100, variant: 0 },
    { type: 'monster6', x: 2470, y: 205, patrolDistance: 50,  variant: 1 },
  ],
  coins: [
    { x: 270, y: 330 }, { x: 410, y: 270 }, { x: 550, y: 210 },
    { x: 1230, y: 330 }, { x: 1370, y: 270 }, { x: 1510, y: 210 },
    { x: 2190, y: 330 }, { x: 2470, y: 210 }, { x: 2810, y: 210 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const spaceLevel37: LevelData = {
  id: 37, worldType: 'space', paletteName: 'ASTEROID', music: 'space_theme',
  spawnPoint: { x: 80, y: 360 }, goalX: 3000, goalY: 200,
  platforms: [
    { x: 0,    y: 400, width: 200, height: 20 },
    { x: 260,  y: 340, width: 80,  height: 20 },
    { x: 400,  y: 280, width: 80,  height: 20 },
    { x: 540,  y: 220, width: 80,  height: 20 },
    { x: 680,  y: 280, width: 80,  height: 20 },
    { x: 820,  y: 340, width: 80,  height: 20 },
    { x: 960,  y: 400, width: 200, height: 20 },
    // Drifting asteroid platforms
    { x: 1220, y: 360, width: 70,  height: 20, type: 'moving', moveX: 120, moveY: 80,  moveSpeed: 0.9 },
    { x: 1420, y: 300, width: 70,  height: 20, type: 'moving', moveX: 90,  moveY: 60,  moveSpeed: 1.1 },
    { x: 1620, y: 360, width: 70,  height: 20, type: 'moving', moveX: 100, moveY: 70,  moveSpeed: 0.8 },
    { x: 1820, y: 400, width: 200, height: 20 },
    { x: 2080, y: 340, width: 80,  height: 20 },
    { x: 2220, y: 280, width: 80,  height: 20 },
    { x: 2360, y: 220, width: 80,  height: 20 },
    { x: 2500, y: 280, width: 80,  height: 20 },
    { x: 2640, y: 400, width: 240, height: 20 },
    { x: 2760, y: 260, width: 160, height: 20, type: 'passthrough' },
    { x: 2920, y: 200, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster6', x: 100,  y: 365, patrolDistance: 120, variant: 0 },
    { type: 'monster6', x: 570,  y: 185, patrolDistance: 50,  variant: 1 },
    { type: 'monster6', x: 1000, y: 365, patrolDistance: 120, variant: 0 },
    { type: 'monster6', x: 1860, y: 365, patrolDistance: 140, variant: 1 },
    { type: 'monster6', x: 2390, y: 185, patrolDistance: 60,  variant: 0 },
    { type: 'monster6', x: 2680, y: 365, patrolDistance: 160, variant: 1 },
  ],
  coins: [
    { x: 290, y: 310 }, { x: 430, y: 250 }, { x: 570, y: 190 },
    { x: 1250, y: 340 }, { x: 1450, y: 280 }, { x: 1650, y: 340 },
    { x: 2250, y: 250 }, { x: 2790, y: 230 }, { x: 2950, y: 170 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const spaceLevel38: LevelData = {
  id: 38, worldType: 'space', paletteName: 'SPACE_VOID', music: 'space_theme',
  spawnPoint: { x: 80, y: 360 }, goalX: 3200, goalY: 200,
  platforms: [
    { x: 0,    y: 400, width: 200, height: 20 },
    // Crumbling platforms over void — deadly fall
    { x: 260,  y: 360, width: 90,  height: 20, type: 'crumbling' },
    { x: 420,  y: 300, width: 90,  height: 20, type: 'crumbling' },
    { x: 580,  y: 360, width: 90,  height: 20, type: 'crumbling' },
    { x: 740,  y: 400, width: 200, height: 20 },
    { x: 820,  y: 280, width: 100, height: 20, type: 'passthrough' },
    { x: 1020, y: 360, width: 90,  height: 20, type: 'crumbling' },
    { x: 1180, y: 300, width: 90,  height: 20, type: 'crumbling' },
    { x: 1340, y: 360, width: 90,  height: 20, type: 'crumbling' },
    { x: 1500, y: 400, width: 200, height: 20 },
    { x: 1580, y: 280, width: 100, height: 20, type: 'passthrough' },
    { x: 1780, y: 360, width: 80,  height: 20 },
    { x: 1920, y: 300, width: 80,  height: 20 },
    { x: 2060, y: 240, width: 80,  height: 20 },
    { x: 2200, y: 300, width: 80,  height: 20 },
    { x: 2340, y: 360, width: 80,  height: 20 },
    { x: 2480, y: 400, width: 300, height: 20 },
    { x: 2620, y: 280, width: 160, height: 20, type: 'passthrough' },
    { x: 2880, y: 220, width: 200, height: 20, type: 'passthrough' },
    { x: 3080, y: 220, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster6', x: 100,  y: 365, patrolDistance: 120, variant: 0 },
    { type: 'monster6', x: 780,  y: 365, patrolDistance: 120, variant: 1 },
    { type: 'monster6', x: 1560, y: 365, patrolDistance: 140, variant: 0 },
    { type: 'monster6', x: 1950, y: 265, patrolDistance: 60,  variant: 1 },
    { type: 'monster6', x: 2520, y: 365, patrolDistance: 160, variant: 0 },
    { type: 'monster6', x: 2910, y: 185, patrolDistance: 80,  variant: 1 },
  ],
  coins: [
    { x: 290, y: 330 }, { x: 450, y: 270 }, { x: 610, y: 330 },
    { x: 850, y: 250 }, { x: 1050, y: 330 }, { x: 1370, y: 330 },
    { x: 1610, y: 250 }, { x: 2090, y: 210 }, { x: 3110, y: 190 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

const spaceLevel39: LevelData = {
  id: 39, worldType: 'space', paletteName: 'NEBULA', music: 'space_theme',
  spawnPoint: { x: 80, y: 360 }, goalX: 3500, goalY: 180,
  platforms: [
    { x: 0,    y: 400, width: 180, height: 20 },
    { x: 240,  y: 340, width: 80,  height: 20 },
    { x: 380,  y: 280, width: 80,  height: 20 },
    { x: 520,  y: 220, width: 80,  height: 20 },
    { x: 660,  y: 280, width: 80,  height: 20 },
    { x: 800,  y: 340, width: 80,  height: 20 },
    { x: 940,  y: 400, width: 180, height: 20 },
    // Pre-boss gauntlet: drifting + crumbling mixed
    { x: 1180, y: 360, width: 70,  height: 20, type: 'moving', moveX: 90,  moveY: 60,  moveSpeed: 1.0 },
    { x: 1360, y: 300, width: 80,  height: 20, type: 'crumbling' },
    { x: 1520, y: 360, width: 70,  height: 20, type: 'moving', moveX: 80,  moveY: 80,  moveSpeed: 1.2 },
    { x: 1700, y: 300, width: 80,  height: 20, type: 'crumbling' },
    { x: 1860, y: 400, width: 180, height: 20 },
    { x: 2120, y: 340, width: 80,  height: 20 },
    { x: 2260, y: 280, width: 80,  height: 20 },
    { x: 2400, y: 220, width: 80,  height: 20 },
    { x: 2540, y: 280, width: 80,  height: 20 },
    { x: 2680, y: 340, width: 80,  height: 20 },
    { x: 2820, y: 400, width: 180, height: 20 },
    { x: 3080, y: 340, width: 80,  height: 20 },
    { x: 3220, y: 280, width: 80,  height: 20 },
    { x: 3340, y: 220, width: 160, height: 20, type: 'passthrough' },
    { x: 3460, y: 180, width: 200, height: 20 },
  ],
  enemies: [
    { type: 'monster6', x: 90,   y: 365, patrolDistance: 100, variant: 0 },
    { type: 'monster6', x: 550,  y: 185, patrolDistance: 50,  variant: 1 },
    { type: 'monster6', x: 980,  y: 365, patrolDistance: 100, variant: 0 },
    { type: 'monster6', x: 1900, y: 365, patrolDistance: 120, variant: 1 },
    { type: 'monster6', x: 2430, y: 185, patrolDistance: 60,  variant: 0 },
    { type: 'monster6', x: 2860, y: 365, patrolDistance: 120, variant: 1 },
    { type: 'monster6', x: 3250, y: 245, patrolDistance: 80,  variant: 0 },
  ],
  coins: [
    { x: 270, y: 310 }, { x: 410, y: 250 }, { x: 550, y: 190 },
    { x: 1210, y: 340 }, { x: 1390, y: 270 }, { x: 1550, y: 340 },
    { x: 2430, y: 190 }, { x: 3250, y: 250 }, { x: 3490, y: 150 },
  ],
  timeLimit: 0, parallaxLayers: 3,
};

// Update getLevelData to include new levels
