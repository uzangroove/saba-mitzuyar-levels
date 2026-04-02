// ============================================================
// constants/physics.ts
// Physics constants — migrated & upgraded from prototype CONFIG
// ============================================================

export const PHYSICS = {
  // Base gravity (px/s²)
  GRAVITY: 1800,

  // Player movement
  ACCEL_GROUND: 2200,    // Acceleration when grounded
  ACCEL_AIR: 1400,       // Acceleration in air (less control)
  MAX_SPEED: 280,        // Horizontal max speed (px/s)
  RUN_SPEED: 420,        // When holding run key

  // Jump
  JUMP_FORCE: -720,      // Initial jump velocity (negative = up)
  DOUBLE_JUMP_FORCE: -600,
  JUMP_HOLD_GRAVITY: 0.45, // Gravity multiplier while holding jump (floatier rise)
  FALL_GRAVITY: 1.6,       // Extra gravity on fall (snappier)
  MAX_FALL_SPEED: 900,

  // Feel — the magic numbers
  COYOTE_TIME: 0.12,     // Seconds after walking off edge where jump still works
  JUMP_BUFFER: 0.15,     // Seconds jump input is remembered before landing
  FRICTION_GROUND: 0.78, // Velocity retention per frame when grounded, no input
  FRICTION_AIR: 0.97,    // Velocity retention per frame in air

  // Dash
  DASH_SPEED: 900,
  DASH_DURATION: 0.18,   // Seconds
  DASH_COOLDOWN: 0.7,

  // Hammer attack
  HAMMER_COOLDOWN: 0.5,

  // Invulnerability after hit
  INVULN_DURATION: 1.5,
} as const;

export const PLAYER = {
  WIDTH: 32,
  HEIGHT: 48,
  MAX_HEALTH: 3,
  MAX_JUMPS: 2,
} as const;

export const GAME = {
  WIDTH: 960,
  HEIGHT: 540,
  TILE_SIZE: 32,
  GRAVITY_Y: 1800,
} as const;
