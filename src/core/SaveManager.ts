interface SaveData {
  version: number;
  timestamp: number;
  player: {
    position: [number, number, number];
    rotation: [number, number, number];
    currentArea: string;
    visitedAreas: string[];
    health: number;
    maxHealth: number;
    level: number;
    experience: number;
  };
  inventory: {
    items: { id: string; quantity: number; slot?: string }[];
    equipped: Record<string, string>;
  };
  quests: {
    active: string;
    completed: string[];
    objectives: Record<string, Record<string, boolean>>;
  };
  achievements: string[];
  skills: Record<string, number>;
  settings: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    musicVolume: number;
    sfxVolume: number;
    reducedMotion: boolean;
    showFPS: boolean;
  };
  world: {
    timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
    weather: 'clear' | 'rain' | 'fog' | 'snow';
    gameTime: number;
  };
  npcs: Record<string, {
    position: [number, number, number];
    dialogueState: string;
  }>;
}

const CURRENT_SAVE_VERSION = 1;
const SAVE_KEY = 'portfolio-quest-save';
const AUTO_SAVE_KEY = 'portfolio-quest-autosave';
const MAX_SAVE_SLOTS = 3;

class SaveManager {
  private autoSaveInterval: number | null = null;
  private autoSaveEnabled = true;
  private autoSaveIntervalMs = 30000; // 30 seconds

  save(slot: number = 0, data: Partial<SaveData>): boolean {
    try {
      const fullData: SaveData = {
        version: CURRENT_SAVE_VERSION,
        timestamp: Date.now(),
        player: {
          position: [0, 1, 0],
          rotation: [0, 0, 0],
          currentArea: 'town-square',
          visitedAreas: ['town-square'],
          health: 100,
          maxHealth: 100,
          level: 1,
          experience: 0,
          ...data.player,
        },
        inventory: {
          items: [],
          equipped: {},
          ...data.inventory,
        },
        quests: {
          active: 'main-quest',
          completed: [],
          objectives: {},
          ...data.quests,
        },
        achievements: data.achievements || [],
        skills: data.skills || {},
        settings: {
          quality: 'high',
          musicVolume: 0.5,
          sfxVolume: 0.7,
          reducedMotion: false,
          showFPS: false,
          ...data.settings,
        },
        world: {
          timeOfDay: 'day',
          weather: 'clear',
          gameTime: 0,
          ...data.world,
        },
        npcs: data.npcs || {},
      };

      const key = slot === 0 ? SAVE_KEY : `${SAVE_KEY}_${slot}`;
      localStorage.setItem(key, JSON.stringify(fullData));
      
      // Also update autosave
      if (slot === 0) {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(fullData));
      }

      console.log(`[SaveManager] Game saved to slot ${slot}`);
      return true;
    } catch (e) {
      console.error('[SaveManager] Failed to save:', e);
      return false;
    }
  }

  load(slot: number = 0): SaveData | null {
    try {
      const key = slot === 0 ? SAVE_KEY : `${SAVE_KEY}_${slot}`;
      const data = localStorage.getItem(key);
      
      if (!data) {
        console.log(`[SaveManager] No save found in slot ${slot}`);
        return null;
      }

      const parsed = JSON.parse(data);
      
      if (parsed.version !== CURRENT_SAVE_VERSION) {
        console.warn(`[SaveManager] Save version mismatch (${parsed.version} vs ${CURRENT_SAVE_VERSION}), migrating...`);
        return this.migrate(parsed);
      }

      console.log(`[SaveManager] Game loaded from slot ${slot}`);
      return parsed;
    } catch (e) {
      console.error('[SaveManager] Failed to load:', e);
      return null;
    }
  }

  loadAutoSave(): SaveData | null {
    try {
      const data = localStorage.getItem(AUTO_SAVE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('[SaveManager] Failed to load autosave:', e);
      return null;
    }
  }

  delete(slot: number = 0): boolean {
    try {
      const key = slot === 0 ? SAVE_KEY : `${SAVE_KEY}_${slot}`;
      localStorage.removeItem(key);
      console.log(`[SaveManager] Save deleted from slot ${slot}`);
      return true;
    } catch (e) {
      console.error('[SaveManager] Failed to delete:', e);
      return false;
    }
  }

  getSaveInfo(slot: number = 0): { timestamp: number; version: number; playtime: number } | null {
    try {
      const key = slot === 0 ? SAVE_KEY : `${SAVE_KEY}_${slot}`;
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return {
        timestamp: parsed.timestamp,
        version: parsed.version,
        playtime: parsed.world?.gameTime || 0,
      };
    } catch {
      return null;
    }
  }

  getAllSaves(): Array<{ slot: number; info: ReturnType<SaveManager['getSaveInfo']> }> {
    const saves: Array<{ slot: number; info: any }> = [];
    
    for (let i = 0; i <= MAX_SAVE_SLOTS; i++) {
      const info = this.getSaveInfo(i);
      if (info) {
        saves.push({ slot: i, info });
      }
    }
    
    return saves;
  }

  enableAutoSave(enabled: boolean = true, intervalMs: number = 30000): void {
    this.autoSaveEnabled = enabled;
    this.autoSaveIntervalMs = intervalMs;
    
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    
    if (enabled) {
      this.autoSaveInterval = window.setInterval(() => {
        this.autoSave();
      }, intervalMs);
    }
  }

  autoSave(): void {
    if (!this.autoSaveEnabled) return;
    
    // Get current game state from stores/events
    // This will be called by the game loop
    window.dispatchEvent(new CustomEvent('save:request'));
  }

  exportSave(slot: number = 0): string | null {
    const data = this.load(slot);
    if (!data) return null;
    return JSON.stringify(data, null, 2);
  }

  importSave(jsonString: string, slot: number = 0): boolean {
    try {
      const data = JSON.parse(jsonString);
      return this.save(slot, data);
    } catch (e) {
      console.error('[SaveManager] Failed to import save:', e);
      return false;
    }
  }

  private migrate(oldData: any): SaveData {
    // Handle migrations between versions
    // For now, just return with defaults for missing fields
    return {
      version: CURRENT_SAVE_VERSION,
      timestamp: oldData.timestamp || Date.now(),
      player: {
        position: oldData.player?.position || [0, 1, 0],
        rotation: oldData.player?.rotation || [0, 0, 0],
        currentArea: oldData.player?.currentArea || 'town-square',
        visitedAreas: oldData.player?.visitedAreas || ['town-square'],
        health: oldData.player?.health || 100,
        maxHealth: oldData.player?.maxHealth || 100,
        level: oldData.player?.level || 1,
        experience: oldData.player?.experience || 0,
      },
      inventory: oldData.inventory || { items: [], equipped: {} },
      quests: oldData.quests || { active: 'main-quest', completed: [], objectives: {} },
      achievements: oldData.achievements || [],
      skills: oldData.skills || {},
      settings: oldData.settings || {
        quality: 'high',
        musicVolume: 0.5,
        sfxVolume: 0.7,
        reducedMotion: false,
        showFPS: false,
      },
      world: oldData.world || {
        timeOfDay: 'day',
        weather: 'clear',
        gameTime: 0,
      },
      npcs: oldData.npcs || {},
    };
  }

  clearAll(): void {
    for (let i = 0; i <= MAX_SAVE_SLOTS; i++) {
      this.delete(i);
    }
    localStorage.removeItem(AUTO_SAVE_KEY);
    console.log('[SaveManager] All saves cleared');
  }
}

export const saveManager = new SaveManager();