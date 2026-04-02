// ============================================================
// systems/SaveManager.ts
// Persistent progress — localStorage with external handshake API
// ============================================================

export interface SaveData {
  currentLevel: number;
  unlockedLevels: number[];
  worldsUnlocked: string[];
  totalCoins: number;
  bestTimes: Record<number, number>;
  settings: GameSettings;
  lastPlayed: number; // Unix timestamp
}

export interface GameSettings {
  musicVolume: number;  // 0-1
  sfxVolume: number;
  gamepadEnabled: boolean;
  showFPS: boolean;
}

const SAVE_KEY = 'saba_mitzuyar_save_v1';

const DEFAULT_SAVE: SaveData = {
  currentLevel: 1,
  unlockedLevels: [1],
  worldsUnlocked: ['earth'],
  totalCoins: 0,
  bestTimes: {},
  settings: {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    gamepadEnabled: true,
    showFPS: false,
  },
  lastPlayed: 0,
};

export class SaveManager {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ...DEFAULT_SAVE };
      const parsed = JSON.parse(raw);
      // Merge with defaults to handle new fields
      return { ...DEFAULT_SAVE, ...parsed };
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  save(): void {
    try {
      this.data.lastPlayed = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('SaveManager: Could not save to localStorage', e);
    }
  }

  // ---- Getters ----
  getCurrentLevel(): number { return this.data.currentLevel; }
  getUnlockedLevels(): number[] { return this.data.unlockedLevels; }
  getTotalCoins(): number { return this.data.totalCoins; }
  getSettings(): GameSettings { return this.data.settings; }
  getBestTime(level: number): number | undefined { return this.data.bestTimes[level]; }

  // ---- Progress updates ----
  completeLevel(level: number, coinsEarned: number, timeTaken: number): void {
    // Update best time
    if (!this.data.bestTimes[level] || timeTaken < this.data.bestTimes[level]) {
      this.data.bestTimes[level] = timeTaken;
    }

    // Add coins
    this.data.totalCoins += coinsEarned;

    // Unlock next level
    const nextLevel = level + 1;
    if (!this.data.unlockedLevels.includes(nextLevel)) {
      this.data.unlockedLevels.push(nextLevel);
    }

    // Update current level
    if (nextLevel > this.data.currentLevel) {
      this.data.currentLevel = nextLevel;
    }

    // Unlock worlds
    this.checkWorldUnlocks(nextLevel);

    this.save();
  }

  private checkWorldUnlocks(level: number): void {
    const worldMap = [
      { level: 11, world: 'water' },
      { level: 21, world: 'sky' },
      { level: 31, world: 'space' },
    ];
    for (const { level: unlockAt, world } of worldMap) {
      if (level >= unlockAt && !this.data.worldsUnlocked.includes(world)) {
        this.data.worldsUnlocked.push(world);
      }
    }
  }

  updateSettings(settings: Partial<GameSettings>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
  }

  isLevelUnlocked(level: number): boolean {
    return this.data.unlockedLevels.includes(level);
  }

  isLevelCompleted(level: number): boolean {
    return this.data.bestTimes[level] !== undefined;
  }

  getWorldCompletionPct(worldStart: number, worldEnd: number): number {
    const total = worldEnd - worldStart + 1;
    const completed = this.data.unlockedLevels.filter(
      l => l > worldStart && l <= worldEnd
    ).length;
    return Math.round((completed / total) * 100);
  }

  // ---- External API (for educational app handshake) ----
  exportSave(): SaveData {
    return { ...this.data };
  }

  importSave(data: SaveData): void {
    this.data = { ...DEFAULT_SAVE, ...data };
    this.save();
  }

  reset(): void {
    this.data = { ...DEFAULT_SAVE };
    this.save();
  }
}

// Singleton
export const saveManager = new SaveManager();
