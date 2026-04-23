// ============================================================
// constants/palettes.ts
// Visual palette system — migrated from prototype
// Each world type has a default palette, levels can override
// ============================================================

export interface LevelPalette {
  skyTop: string;
  skyBottom: string;
  cloud: string;
  hillFar: string;
  hillNear: string;
  platformFill: string;
  platformTop: string;
  ambientLight?: number; // Phaser tint (0xffffff = no tint)
}

export const PALETTES: Record<string, LevelPalette> = {
  DAY: {
    skyTop: '#00b4db',
    skyBottom: '#b2fefa',
    cloud: '#ffffff',
    hillFar: '#00b09b',
    hillNear: '#96c93d',
    platformFill: '#5D4037',
    platformTop: '#76FF03',
    ambientLight: 0xffffff,
  },
  SUNSET: {
    skyTop: '#2c3e50',
    skyBottom: '#fd746c',
    cloud: '#ffecd2',
    hillFar: '#8e44ad',
    hillNear: '#e67e22',
    platformFill: '#4a2c2a',
    platformTop: '#f1c40f',
    ambientLight: 0xffcc99,
  },
  MAGMA: {
    skyTop: '#4a0404',
    skyBottom: '#e25822',
    cloud: '#331111',
    hillFar: '#800000',
    hillNear: '#b22222',
    platformFill: '#2d0a0a',
    platformTop: '#ff4500',
    ambientLight: 0xff8866,
  },
  NIGHT: {
    skyTop: '#0f0c29',
    skyBottom: '#302b63',
    cloud: '#4b5563',
    hillFar: '#24243e',
    hillNear: '#4b4b8f',
    platformFill: '#1a1a2e',
    platformTop: '#7b2cbf',
    ambientLight: 0xaaaaff,
  },
  JUNGLE: {
    skyTop: '#064e3b',
    skyBottom: '#6ee7b7',
    cloud: '#d1fae5',
    hillFar: '#14532d',
    hillNear: '#166534',
    platformFill: '#3f2e3e',
    platformTop: '#22c55e',
    ambientLight: 0xaaffcc,
  },
  ICE: {
    skyTop: '#0ea5e9',
    skyBottom: '#e0f2fe',
    cloud: '#ffffff',
    hillFar: '#64748b',
    hillNear: '#94a3b8',
    platformFill: '#334155',
    platformTop: '#f1f5f9',
    ambientLight: 0xcceeff,
  },
  CANDY: {
    skyTop: '#f9a8d4',
    skyBottom: '#fdf2f8',
    cloud: '#fff1f2',
    hillFar: '#db2777',
    hillNear: '#f472b6',
    platformFill: '#831843',
    platformTop: '#fbcfe8',
    ambientLight: 0xffccee,
  },
  CYBER: {
    skyTop: '#020617',
    skyBottom: '#1e1b4b',
    cloud: '#312e81',
    hillFar: '#1e1b4b',
    hillNear: '#2e1065',
    platformFill: '#0f172a',
    platformTop: '#7c3aed',
    ambientLight: 0x8866ff,
  },
  DEEP_OCEAN: {
    skyTop: '#023e8a',
    skyBottom: '#0077b6',
    cloud: '#90e0ef',
    hillFar: '#03045e',
    hillNear: '#0096c7',
    platformFill: '#023e8a',
    platformTop: '#48cae4',
    ambientLight: 0x44aaff,
  },
  SKY_HIGH: {
    skyTop: '#4fc3f7',
    skyBottom: '#e1f5fe',
    cloud: '#ffffff',
    hillFar: '#81d4fa',
    hillNear: '#b3e5fc',
    platformFill: '#0288d1',
    platformTop: '#e1f5fe',
    ambientLight: 0xeeffff,
  },
  SPACE_VOID: {
    skyTop: '#000000',
    skyBottom: '#0d0d2b',
    cloud: '#1a1a4e',
    hillFar: '#0d0d1a',
    hillNear: '#1a1a3e',
    platformFill: '#1a0a2e',
    platformTop: '#9c27b0',
    ambientLight: 0x440066,
  },
  OCEAN: {
    skyTop: '#006994',
    skyBottom: '#0099CC',
    cloud: '#b0e8ff',
    hillFar: '#004466',
    hillNear: '#0077aa',
    platformFill: '#00334d',
    platformTop: '#33aacc',
    ambientLight: 0x55ccff,
  },
  DEEP_SEA: {
    skyTop: '#001933',
    skyBottom: '#003355',
    cloud: '#002244',
    hillFar: '#001122',
    hillNear: '#002233',
    platformFill: '#001a2e',
    platformTop: '#0055aa',
    ambientLight: 0x2266aa,
  },
  NEBULA: {
    skyTop: '#0d001a',
    skyBottom: '#1a0033',
    cloud: '#4a0080',
    hillFar: '#0a0015',
    hillNear: '#200040',
    platformFill: '#1a004d',
    platformTop: '#cc00ff',
    ambientLight: 0x9900cc,
  },
  ASTEROID: {
    skyTop: '#050505',
    skyBottom: '#101020',
    cloud: '#202030',
    hillFar: '#080810',
    hillNear: '#151525',
    platformFill: '#252535',
    platformTop: '#5555aa',
    ambientLight: 0x4444aa,
  },

  // ============================================================
  // CRAYON WORLD — פלטות עפרונות צבעוניים
  // צבעים עזים, ילדותיים, שמחים
  // ============================================================
  CRAYON_SUNNY: {
    skyTop: '#87CEEB',
    skyBottom: '#FFFACD',
    cloud: '#FFFFFF',
    hillFar: '#90EE90',
    hillNear: '#32CD32',
    platformFill: '#8B4513',
    platformTop: '#FF6347',
    ambientLight: 0xFFEE88,
  },
  CRAYON_RAINBOW: {
    skyTop: '#FF69B4',
    skyBottom: '#FFD700',
    cloud: '#FFF0F5',
    hillFar: '#FF8C00',
    hillNear: '#FF4500',
    platformFill: '#9400D3',
    platformTop: '#00CED1',
    ambientLight: 0xFFBBCC,
  },
  CRAYON_GARDEN: {
    skyTop: '#00FA9A',
    skyBottom: '#ADFF2F',
    cloud: '#F0FFF0',
    hillFar: '#228B22',
    hillNear: '#7CFC00',
    platformFill: '#8B6914',
    platformTop: '#FF1493',
    ambientLight: 0xCCFFCC,
  },
  CRAYON_CLOUD: {
    skyTop: '#B0E0E6',
    skyBottom: '#F0F8FF',
    cloud: '#FFFFFF',
    hillFar: '#87CEEB',
    hillNear: '#ADD8E6',
    platformFill: '#4169E1',
    platformTop: '#FF69B4',
    ambientLight: 0xEEF8FF,
  },
  CRAYON_CANDY: {
    skyTop: '#FF69B4',
    skyBottom: '#FFB6C1',
    cloud: '#FFF0F5',
    hillFar: '#FF1493',
    hillNear: '#FF69B4',
    platformFill: '#DC143C',
    platformTop: '#FF69B4',
    ambientLight: 0xFFCCEE,
  },
  CRAYON_NIGHT: {
    skyTop: '#191970',
    skyBottom: '#4B0082',
    cloud: '#9370DB',
    hillFar: '#2E0854',
    hillNear: '#4B0082',
    platformFill: '#800080',
    platformTop: '#FFD700',
    ambientLight: 0xAABBFF,
  },
};

// World-to-palette mapping (default, levels can override)
export const WORLD_DEFAULT_PALETTE: Record<string, string> = {
  earth: 'DAY',
  water: 'DEEP_OCEAN',
  sky: 'SKY_HIGH',
  space: 'SPACE_VOID',
  crayon: 'CRAYON_SUNNY',
};