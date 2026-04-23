// ============================================================
// worlds/WorldConfig.ts
// Per-world physics overrides — this is what makes each world
// feel distinctly different using a SINGLE PlayerController
// ============================================================

export interface WorldParams {
  name: string;
  gravityMultiplier: number;   // Applied to base PHYSICS.GRAVITY
  accelMultiplier: number;     // Horizontal acceleration multiplier
  jumpMultiplier: number;      // Jump force multiplier
  frictionAir: number;         // Air friction (0=stop instantly, 1=no friction)
  maxFallSpeed: number;        // Terminal velocity (px/s)
  dashEnabled: boolean;
  doubleJumpEnabled: boolean;
  // Visual/audio cues
  ambientParticles?: string;   // 'bubbles' | 'leaves' | 'stars' | 'dust'
  bgScrollSpeed: number;       // Parallax background scroll speed
}

export const WORLD_CONFIGS: Record<string, WorldParams> = {
  earth: {
    name: 'Earth',
    gravityMultiplier: 1.0,
    accelMultiplier: 1.0,
    jumpMultiplier: 1.0,
    frictionAir: 0.97,
    maxFallSpeed: 900,
    dashEnabled: true,
    doubleJumpEnabled: true,
    ambientParticles: 'leaves',
    bgScrollSpeed: 1.0,
  },

  water: {
    name: 'Water',
    gravityMultiplier: 0.28,   // Very floaty — buoyancy effect
    accelMultiplier: 0.55,     // Sluggish acceleration — water drag
    jumpMultiplier: 1.5,       // Higher jump possible (buoyancy helps)
    frictionAir: 0.72,         // High friction = water drag
    maxFallSpeed: 220,         // Slow descent = floating underwater
    dashEnabled: false,        // Can't dash underwater
    doubleJumpEnabled: true,   // Swim stroke replaces double jump
    ambientParticles: 'bubbles',
    bgScrollSpeed: 0.6,
  },

  sky: {
    name: 'Sky',
    gravityMultiplier: 0.65,   // Lighter gravity
    accelMultiplier: 1.3,      // Fast acceleration — less resistance
    jumpMultiplier: 1.25,
    frictionAir: 0.985,        // Very little air resistance
    maxFallSpeed: 600,
    dashEnabled: true,
    doubleJumpEnabled: true,
    ambientParticles: 'clouds',
    bgScrollSpeed: 1.4,
  },

  space: {
    name: 'Space',
    gravityMultiplier: 0.12,   // Nearly zero-G
    accelMultiplier: 0.7,      // Hard to start moving
    jumpMultiplier: 2.2,       // Rocket-like jumps
    frictionAir: 0.995,        // Almost NO friction — inertia heavy
    maxFallSpeed: 180,         // Float in space
    dashEnabled: true,         // Thruster dash
    doubleJumpEnabled: true,   // Thruster burst
    ambientParticles: 'stars',
    bgScrollSpeed: 0.3,
  },

  crayon: {
    name: 'Crayon',
    gravityMultiplier: 0.82,   // קצת קל יותר — ציורי ילדים צפים
    accelMultiplier: 1.15,     // תגובה מהירה — כיפי וזריז
    jumpMultiplier: 1.2,       // קפיצות גבוהות ושמחות
    frictionAir: 0.975,
    maxFallSpeed: 700,
    dashEnabled: true,
    doubleJumpEnabled: true,
    ambientParticles: 'crayonsparkles',
    bgScrollSpeed: 1.1,
  },
};

// Determine world type from level number (1-indexed)
// 1-10: Earth, 11-20: Water, 21-30: Sky, 31-40: Space, repeat
export function getWorldForLevel(level: number): string {
  // Crayon world: levels 41-60
  if (level >= 41 && level <= 60) return 'crayon';
  const cycle = ((level - 1) % 40);
  if (cycle < 10) return 'earth';
  if (cycle < 20) return 'water';
  if (cycle < 30) return 'sky';
  return 'space';
}

// Level 100 special case
export function getWorldConfig(level: number): WorldParams {
  if (level === 100) return WORLD_CONFIGS.earth; // Castle world uses earth physics
  return WORLD_CONFIGS[getWorldForLevel(level)];
}