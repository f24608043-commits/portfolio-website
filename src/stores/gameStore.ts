import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vec3, Euler } from 'three';

export interface PlayerState {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  currentArea: string;
  visitedAreas: string[];
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  level: number;
  experience: number;
  experienceToNext: number;
  skills: Record<string, number>;
  inventory: {
    items: string[];
    capacity: number;
    equipped: Record<string, string>;
    gold: number;
  };
  quests: {
    active: string | null;
    completed: string[];
    objectives: Record<string, Record<string, boolean>>;
  };
  achievements: string[];
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
    luck: number;
  };
}

export interface GameSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  musicEnabled: boolean;
  sfxEnabled: boolean;
  reducedMotion: boolean;
  showFPS: boolean;
  musicVolume: number;
  sfxVolume: number;
  cameraDistance: number;
  cameraFOV: number;
  invertY: boolean;
  sensitivity: number;
  keyBindings: Record<string, string>;
}

export interface WorldState {
  gameTime: number;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  weather: 'clear' | 'rain' | 'fog' | 'snow';
  loadedChunks: Record<string, boolean>;
}

export interface UIState {
  showQuestLog: boolean;
  showInventory: boolean;
  showSettings: boolean;
  showMiniMap: boolean;
  activeDialogue: string | null;
  activeNPC: string | null;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'quest';
    title: string;
    message: string;
    duration?: number;
  }>;
  tooltip: { content: string; position: [number, number] } | null;
}

export interface GameState {
  isLoading: boolean;
  loadingProgress: number;
  player: PlayerState;
  settings: GameSettings;
  world: WorldState;
  ui: UIState;
  npcs: Record<string, { position: [number, number, number]; state: string }>;
}

interface GameStore extends GameState {
  // Player actions
  setPlayerPosition: (pos: [number, number, number]) => void;
  setPlayerRotation: (rot: [number, number, number]) => void;
  setPlayerVelocity: (vel: [number, number, number]) => void;
  updateHealth: (amount: number) => void;
  updateStamina: (amount: number) => void;
  addExperience: (amount: number) => void;
  levelUp: () => void;
  updateSkill: (skill: string, value: number) => void;
  addItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  equipItem: (slot: string, itemId: string) => void;
  unequipItem: (slot: string) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  startQuest: (questId: string) => void;
  completeQuest: (questId: string) => void;
  updateObjective: (questId: string, objectiveId: string, completed: boolean) => void;
  unlockAchievement: (achievementId: string) => void;
  visitArea: (areaId: string) => void;
  setCurrentArea: (areaId: string) => void;

  // Settings
  updateSettings: (settings: Partial<GameSettings>) => void;
  applyQualityPreset: (quality: GameSettings['quality']) => void;

  // World
  updateGameTime: (deltaTime: number) => void;
  setTimeOfDay: (tod: GameState['world']['timeOfDay']) => void;
  setWeather: (weather: GameState['world']['weather']) => void;
  loadChunk: (x: number, z: number) => void;
  unloadChunk: (x: number, z: number) => void;

  // UI
  setLoading: (loading: boolean, progress?: number) => void;
  setShowQuestLog: (show: boolean) => void;
  setShowInventory: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowMiniMap: (show: boolean) => void;
  startDialogue: (npcId: string, nodeId?: string) => void;
  endDialogue: () => void;
  addNotification: (notification: Omit<GameState['ui']['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  setTooltip: (content: string | null, position?: [number, number]) => void;

  // NPCs
  updateNPCState: (npcId: string, state: string) => void;

  // Persistence
  saveGame: (slot?: number) => Promise<boolean>;
  loadGame: (slot?: number) => Promise<boolean>;
  resetGame: () => void;
}

const defaultPlayer: PlayerState = {
  position: [0, 1, 0],
  rotation: [0, 0, 0],
  velocity: [0, 0, 0],
  currentArea: 'town-square',
  visitedAreas: ['town-square'],
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  level: 1,
  experience: 0,
  experienceToNext: 100,
  skills: {
    frontend: 0,
    backend: 0,
    devops: 0,
    security: 0,
    ai: 0,
  },
  inventory: {
    items: [],
    capacity: 30,
    equipped: {},
    gold: 0,
  },
  quests: {
    active: null,
    completed: [],
    objectives: {},
  },
  achievements: [],
  stats: {
    strength: 10,
    agility: 10,
    intelligence: 10,
    vitality: 10,
    luck: 10,
  },
};

const defaultSettings: GameSettings = {
  quality: 'high',
  musicEnabled: true,
  sfxEnabled: true,
  reducedMotion: false,
  showFPS: false,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  cameraDistance: 8,
  cameraFOV: 75,
  invertY: false,
  sensitivity: 0.002,
  keyBindings: {},
};

const defaultWorld: WorldState = {
  gameTime: 0,
  timeOfDay: 'day',
  weather: 'clear',
  loadedChunks: {},
};

const defaultUI: UIState = {
  showQuestLog: false,
  showInventory: false,
  showSettings: false,
  showMiniMap: true,
  activeDialogue: null,
  activeNPC: null,
  notifications: [],
  tooltip: null,
};

// Track initialization
let hasInitialized = false;

const defaultNPCs: Record<string, { position: [number, number, number]; state: string }> = {};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: true,
      loadingProgress: 0,
      player: defaultPlayer,
      settings: defaultSettings,
      world: defaultWorld,
      ui: defaultUI,
      npcs: defaultNPCs,

      // Player actions
      setPlayerPosition: (pos) => set((state) => ({
        player: { ...state.player, position: pos }
      })),
      setPlayerRotation: (rot) => set((state) => ({
        player: { ...state.player, rotation: rot }
      })),
      setPlayerVelocity: (vel) => set((state) => ({
        player: { ...state.player, velocity: vel }
      })),
      updateHealth: (amount) => set((state) => ({
        player: {
          ...state.player,
          health: Math.max(0, Math.min(state.player.maxHealth, state.player.health + amount))
        }
      })),
      updateStamina: (amount) => set((state) => ({
        player: {
          ...state.player,
          stamina: Math.max(0, Math.min(state.player.maxStamina, state.player.stamina + amount))
        }
      })),
      addExperience: (amount) => set((state) => {
        const newExp = state.player.experience + amount;
        const newLevel = Math.floor(newExp / 100) + 1;
        return {
          player: {
            ...state.player,
            experience: newExp,
            level: newLevel > state.player.level ? newLevel : state.player.level,
            experienceToNext: newLevel > state.player.level ? newLevel * 100 : state.player.experienceToNext,
          }
        };
      }),
      levelUp: () => set((state) => ({
        player: {
          ...state.player,
          level: state.player.level + 1,
          maxHealth: state.player.maxHealth + 10,
          health: state.player.maxHealth + 10,
          maxStamina: state.player.maxStamina + 5,
          stamina: state.player.maxStamina + 5,
        }
      })),
      updateSkill: (skill, value) => set((state) => ({
        player: {
          ...state.player,
          skills: { ...state.player.skills, [skill]: Math.max(0, Math.min(100, value)) }
        }
      })),
      addItem: (itemId) => set((state) => {
        const inv = state.player.inventory;
        if (inv.items.filter(i => !inv.equipped[i]).length >= inv.capacity) return state;
        return {
          player: {
            ...state.player,
            inventory: {
              ...inv,
              items: [...inv.items, itemId]
            }
          }
        };
      }),
      removeItem: (itemId) => set((state) => ({
        player: {
          ...state.player,
          inventory: {
            ...state.player.inventory,
            items: state.player.inventory.items.filter(id => id !== itemId)
          }
        }
      })),
      equipItem: (slot, itemId) => set((state) => {
        const inv = state.player.inventory;
        if (!inv.items.includes(itemId)) return state;
        return {
          player: {
            ...state.player,
            inventory: {
              ...inv,
              items: inv.items.filter(id => id !== itemId),
              equipped: { ...inv.equipped, [slot]: itemId }
            }
          }
        };
      }),
      unequipItem: (slot) => set((state) => {
        const inv = state.player.inventory;
        const itemId = inv.equipped[slot];
        if (!itemId) return state;
        return {
          player: {
            ...state.player,
            inventory: {
              ...inv,
              items: [...inv.items, itemId],
              equipped: Object.fromEntries(Object.entries(inv.equipped).filter(([s]) => s !== slot))
            }
          }
        };
      }),
      addGold: (amount) => set((state) => ({
        player: {
          ...state.player,
          inventory: { ...state.player.inventory, gold: state.player.inventory.gold + amount }
        }
      })),
      spendGold: (amount) => {
        const state = get();
        if (state.player.inventory.gold < amount) return false;
        set((state) => ({
          player: {
            ...state.player,
            inventory: { ...state.player.inventory, gold: state.player.inventory.gold - amount }
          }
        }));
        return true;
      },
      startQuest: (questId) => set((state) => ({
        player: {
          ...state.player,
          quests: {
            ...state.player.quests,
            active: questId,
            objectives: { ...state.player.quests.objectives }
          }
        }
      })),
      completeQuest: (questId) => set((state) => ({
        player: {
          ...state.player,
          quests: {
            ...state.player.quests,
            active: null,
            completed: [...new Set([...state.player.quests.completed, questId])]
          }
        }
      })),
      updateObjective: (questId, objectiveId, completed) => set((state) => ({
        player: {
          ...state.player,
          quests: {
            ...state.player.quests,
            objectives: {
              ...state.player.quests.objectives,
              [questId]: {
                ...state.player.quests.objectives[questId],
                [objectiveId]: completed
              }
            }
          }
        }
      })),
      unlockAchievement: (achievementId) => set((state) => ({
        player: {
          ...state.player,
          achievements: [...new Set([...state.player.achievements, achievementId])]
        }
      })),
      visitArea: (areaId) => set((state) => ({
        player: {
          ...state.player,
          visitedAreas: [...new Set([...state.player.visitedAreas, areaId])]
        }
      })),
      setCurrentArea: (areaId) => set((state) => ({
        player: { ...state.player, currentArea: areaId }
      })),

      // Settings
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      applyQualityPreset: (quality) => set((state) => {
        const presets: Record<string, Partial<GameSettings>> = {
          low: { quality: 'low', showFPS: false },
          medium: { quality: 'medium' },
          high: { quality: 'high' },
          ultra: { quality: 'ultra', showFPS: true },
        };
        return { settings: { ...state.settings, ...presets[quality], quality } };
      })),
      initialize: () => set({ isLoading: false, loadingProgress: 1 }),

      // World
      updateGameTime: (deltaTime) => set((state) => ({
        world: { ...state.world, gameTime: state.world.gameTime + deltaTime }
      })),
      setTimeOfDay: (tod) => set((state) => ({ world: { ...state.world, timeOfDay: tod } })),
      setWeather: (weather) => set((state) => ({ world: { ...state.world, weather } })),
      loadChunk: (x, z) => set((state) => ({
        world: { ...state.world, loadedChunks: { ...state.world.loadedChunks, [`${x},${z}`]: true } }
      })),
      unloadChunk: (x, z) => set((state) => {
        const chunks = { ...state.world.loadedChunks };
        delete chunks[`${x},${z}`];
        return { world: { ...state.world, loadedChunks: chunks } };
      }),

      // UI
      setLoading: (loading, progress = 0) => set({ isLoading: loading, loadingProgress: progress }),
      setShowQuestLog: (show) => set((state) => ({ ui: { ...state.ui, showQuestLog: show } })),
      setShowInventory: (show) => set((state) => ({ ui: { ...state.ui, showInventory: show } })),
      setShowSettings: (show) => set((state) => ({ ui: { ...state.ui, showSettings: show } })),
      setShowMiniMap: (show) => set((state) => ({ ui: { ...state.ui, showMiniMap: show } })),
      startDialogue: (npcId, nodeId = 'start') => set((state) => ({
        ui: { ...state.ui, activeDialogue: nodeId, activeNPC: npcId }
      })),
      endDialogue: () => set((state) => ({ ui: { ...state.ui, activeDialogue: null, activeNPC: null } })),
      addNotification: (notification) => set((state) => ({
        ui: {
          ...state.ui,
          notifications: [
            ...state.ui.notifications,
            { ...notification, id: generateId() }
          ]
        }
      })),
      removeNotification: (id) => set((state) => ({
        ui: { ...state.ui, notifications: state.ui.notifications.filter(n => n.id !== id) }
      })),
      setTooltip: (content, position) => set((state) => ({
        ui: { ...state.ui, tooltip: content ? { content, position: position || [0, 0] } : null }
      })),

      // NPCs
      updateNPCState: (npcId, state) => set((state) => ({
        npcs: { ...state.npcs, [npcId]: { ...state.npcs[npcId], state, position: state.npcs[npcId]?.position || [0, 0, 0] } }
      })),

      // Persistence
      saveGame: async (slot = 0) => {
        try {
          const state = get();
          const saveData = {
            version: 1,
            timestamp: Date.now(),
            player: state.player,
            settings: state.settings,
            world: state.world,
          };
          localStorage.setItem(`portfolio-quest-save-${slot}`, JSON.stringify(saveData));
          return true;
        } catch (e) {
          console.error('[GameStore] Save failed:', e);
          return false;
        }
      },
      loadGame: async (slot = 0) => {
        try {
          const saved = localStorage.getItem(`portfolio-quest-save-${slot}`);
          if (!saved) return false;
          const data = JSON.parse(saved);
          if (data.version !== 1) return false;

          set({
            player: data.player,
            settings: data.settings,
            world: data.world,
          });
          return true;
        } catch (e) {
          console.error('[GameStore] Load failed:', e);
          return false;
        }
      },
      resetGame: () => {
        localStorage.clear();
        set({
          player: defaultPlayer,
          settings: defaultSettings,
          world: defaultWorld,
          ui: defaultUI,
          npcs: defaultNPCs,
        });
      },
      initialize: () => {
        // Auto-hide loading screen after assets load
        setTimeout(() => {
          set({ isLoading: false, loadingProgress: 1 });
        }, 500);
      },
    }),
    {
      name: 'portfolio-quest-game',
      partialize: (state) => ({
        player: state.player,
        settings: state.settings,
        world: state.world,
      }),
    }
  )
);