export interface Location {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  type: 'building' | 'landmark' | 'secret' | 'area';
  connections: string[];
  npcIds?: string[];
  questIds?: string[];
  model?: string;
  scale?: number;
  interactable?: boolean;
}

export function getLocationById(id: string): Location | undefined {
  return undefined;
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  locationId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  model: string;
  dialogue: DialogueNode[];
  wanderRadius?: number;
  requiresQuest?: string;
  questGiver?: boolean;
  shopItems?: string[];
}

export interface DialogueNode {
  id: string;
  text: string;
  speaker: 'npc' | 'player';
  options?: DialogueOption[];
  actions?: DialogueAction[];
  conditions?: string[];
}

export interface DialogueOption {
  text: string;
  nextNodeId: string;
  conditions?: string[];
  actions?: DialogueAction[];
}

export interface DialogueAction {
  type: 'giveItem' | 'startQuest' | 'completeQuest' | 'unlockAchievement' | 'openShop' | 'showPortfolio' | 'teleport';
  value: string;
}

export interface QuestData {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'daily' | 'weekly' | 'event' | 'hidden';
  category: string;
  level: number;
  prerequisites: string[];
  objectives: QuestObjective[];
  rewards: QuestReward[];
  failureConditions: QuestFailureCondition[];
  timeLimit?: number;
  repeatable: boolean;
  cooldown?: number;
  hidden: boolean;
  trackable: boolean;
  shareable: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'visit' | 'talk' | 'craft' | 'use' | 'reach' | 'survive' | 'custom';
  target: string;
  count: number;
  current: number;
  location?: [number, number, number];
  radius?: number;
  optional: boolean;
  hidden: boolean;
  prerequisites: string[];
}

export interface QuestReward {
  type: 'experience' | 'gold' | 'item' | 'skill' | 'reputation' | 'achievement' | 'unlock';
  value: any;
  quantity?: number;
  guaranteed: boolean;
}

export interface QuestFailureCondition {
  type: 'death' | 'time' | 'leave_area' | 'fail_objective' | 'npc_death' | 'custom';
  params: Record<string, any>;
}

export interface QuestState {
  id: string;
  status: 'available' | 'active' | 'completed' | 'failed' | 'turned_in';
  objectives: Record<string, { current: number; completed: boolean }>;
  startedAt: number;
  completedAt?: number;
  turnedInAt?: number;
  progress: number;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  quantity: number;
  slot?: string;
  durability?: number;
  maxDurability?: number;
  enchants?: Enchant[];
}

export interface Enchant {
  id: string;
  level: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'quest' | 'tool' | 'currency' | 'misc';
  subtype?: string;
  icon: string;
  model?: string;
  stackSize: number;
  weight: number;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact';
  properties: Record<string, any>;
  requirements?: {
    level?: number;
    skills?: Record<string, number>;
    stats?: Record<string, number>;
  };
  effects?: ItemEffect[];
  tags: string[];
}

export interface ItemEffect {
  type: 'heal' | 'damage' | 'buff' | 'debuff' | 'teleport' | 'learn' | 'custom';
  magnitude: number;
  duration?: number;
  target?: 'self' | 'target' | 'area';
  params?: Record<string, any>;
}

export interface EquipmentSlot {
  id: string;
  name: string;
  allowedTypes: string[];
  allowedSubtypes?: string[];
}

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
    items: InventoryItem[];
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
    type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'quest' | 'loot' | 'system';
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

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string & { readonly __brand: unique symbol };