// Core type definitions for Portfolio Quest

// Vector & Math Types
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Euler {
  x: number;
  y: number;
  z: number;
  order?: string;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Transform {
  position: Vec3;
  rotation: Euler;
  scale: Vec3;
}

export interface BoundingBox {
  min: Vec3;
  max: Vec3;
}

export interface BoundingSphere {
  center: Vec3;
  radius: number;
}

// Game Entity Types
export interface Entity {
  id: string;
  type: string;
  name: string;
  transform: Transform;
  active: boolean;
  components: Map<string, Component>;
  createdAt: number;
  updatedAt: number;
}

export interface Component {
  type: string;
  enabled: boolean;
  data: any;
}

// Player Types
export interface PlayerState {
  id: string;
  position: Vec3;
  rotation: Euler;
  velocity: Vec3;
  speed: number;
  runSpeed: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  level: number;
  experience: number;
  experienceToNext: number;
  skills: Record<string, SkillState>;
  inventory: InventoryState;
  quests: QuestState[];
  achievements: string[];
  settings: PlayerSettings;
}

export interface SkillState {
  id: string;
  level: number;
  experience: number;
  experienceToNext: number;
  unlocked: boolean;
}

export interface InventoryState {
  items: InventoryItem[];
  capacity: number;
  equipped: Record<string, string>;
  gold: number;
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

export interface PlayerSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  musicVolume: number;
  sfxVolume: number;
  reducedMotion: boolean;
  showFPS: boolean;
  cameraDistance: number;
  cameraFOV: number;
  invertY: boolean;
  sensitivity: number;
  keyBindings: Record<string, string>;
}

// NPC Types
export interface NPCData {
  id: string;
  name: string;
  title: string;
  model: string;
  position: Vec3;
  rotation: Euler;
  dialogue: DialogueTree;
  schedule: NPCTimetable[];
  interactionRadius: number;
  questGiver: boolean;
  merchant: boolean;
  merchantInventory?: string[];
  faction: string;
  level: number;
  respawnTime: number;
}

export interface NPCTimetable {
  timeStart: number; // game time in minutes
  timeEnd: number;
  position: Vec3;
  activity: 'idle' | 'walk' | 'work' | 'sleep' | 'social';
  targetId?: string;
}

export interface DialogueTree {
  startNode: string;
  nodes: Record<string, DialogueNode>;
  conditions: Record<string, DialogueCondition>;
}

export interface DialogueNode {
  id: string;
  speaker: 'npc' | 'player';
  text: string;
  portrait?: string;
  voice?: string;
  choices: DialogueChoice[];
  actions: DialogueAction[];
  nextNode?: string;
  endDialogue?: boolean;
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNode: string;
  condition?: string;
  action?: DialogueAction;
  skillCheck?: { skill: string; difficulty: number };
}

export interface DialogueAction {
  type: 'give_item' | 'remove_item' | 'start_quest' | 'complete_quest' | 'fail_quest' 
    | 'unlock_achievement' | 'give_experience' | 'give_gold' | 'change_reputation'
    | 'teleport' | 'open_shop' | 'open_inventory' | 'play_animation' | 'play_sound'
    | 'spawn_entity' | 'despawn_entity' | 'set_flag' | 'clear_flag' | 'custom';
  params: Record<string, any>;
}

export interface DialogueCondition {
  type: 'has_item' | 'has_quest' | 'completed_quest' | 'has_achievement' 
    | 'skill_level' | 'reputation' | 'time_of_day' | 'weather' | 'flag' | 'custom';
  params: Record<string, any>;
  invert?: boolean;
}

// Quest Types
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
  location?: Vec3;
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

// Interaction Types
export interface InteractionData {
  id: string;
  type: 'npc' | 'object' | 'area' | 'crafting' | 'shop' | 'teleport' | 'loot' | 'read' | 'custom';
  name: string;
  description: string;
  position: Vec3;
  radius: number;
  prompt: string;
  icon: string;
  requirements: InteractionRequirement[];
  cooldown: number;
  repeatable: boolean;
  action: InteractionAction;
}

export interface InteractionRequirement {
  type: 'item' | 'quest' | 'skill' | 'level' | 'achievement' | 'reputation' | 'flag' | 'time' | 'weather';
  target: string;
  value: any;
  invert: boolean;
}

export interface InteractionAction {
  type: 'dialogue' | 'quest' | 'shop' | 'crafting' | 'teleport' | 'loot' | 'animation' | 'sound' | 'custom';
  target: string;
  params: Record<string, any>;
}

// World Types
export interface WorldChunk {
  x: number;
  z: number;
  entities: string[];
  terrain: ChunkTerrain;
  loaded: boolean;
  loading: boolean;
  lastAccessed: number;
}

export interface ChunkTerrain {
  heightmap: Float32Array;
  textures: string[];
  splatmap?: string;
  vegetation: VegetationInstance[];
  waterLevel: number;
}

export interface VegetationInstance {
  type: string;
  position: Vec3;
  rotation: Euler;
  scale: Vec3;
  variant: number;
}

export interface LocationData {
  id: string;
  name: string;
  description: string;
  type: 'city' | 'town' | 'village' | 'dungeon' | 'landmark' | 'wilderness' | 'secret';
  position: Vec3;
  radius: number;
  connections: LocationConnection[];
  npcs: string[];
  quests: string[];
  discoverable: boolean;
  discovered: boolean;
  level: number;
  biome: string;
  music?: string;
  ambientSound?: string;
}

export interface LocationConnection {
  targetId: string;
  type: 'road' | 'path' | 'river' | 'teleport' | 'hidden';
  distance: number;
  travelTime: number;
  requirements: InteractionRequirement[];
}

// UI Types
export interface UIPanel {
  id: string;
  name: string;
  visible: boolean;
  priority: number;
  position: 'center' | 'left' | 'right' | 'top' | 'bottom' | 'custom';
  size: { width: number; height: number };
  draggable: boolean;
  closable: boolean;
  modal: boolean;
  zIndex: number;
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'quest' | 'loot' | 'system';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
  persistent?: boolean;
  action?: { label: string; callback: () => void };
  sound?: string;
}

export interface TooltipData {
  title: string;
  description: string;
  stats?: Record<string, string | number>;
  requirements?: Record<string, string>;
  flavor?: string;
  icon?: string;
  quality?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact';
}

// Settings Types
export interface GameSettings {
  graphics: GraphicsSettings;
  audio: AudioSettings;
  gameplay: GameplaySettings;
  controls: ControlSettings;
  accessibility: AccessibilitySettings;
  network: NetworkSettings;
}

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: { width: number; height: number };
  fullscreen: boolean;
  vsync: boolean;
  frameRateCap: number;
  fov: number;
  renderDistance: number;
  shadowQuality: 'off' | 'low' | 'medium' | 'high' | 'ultra';
  shadowDistance: number;
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  antiAliasing: 'off' | 'fxaa' | 'msaa2' | 'msaa4' | 'msaa8' | 'ta';
  anisotropicFiltering: 1 | 2 | 4 | 8 | 16;
  postProcessing: boolean;
  bloom: boolean;
  ssao: boolean;
  ssr: boolean;
  volumetricLighting: boolean;
  particleQuality: 'low' | 'medium' | 'high' | 'ultra';
  vegetationDensity: number;
  lodBias: number;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  uiVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  spatialAudio: boolean;
  muteOnFocusLoss: boolean;
}

export interface GameplaySettings {
  difficulty: 'easy' | 'normal' | 'hard' | 'custom';
  autoSave: boolean;
  autoSaveInterval: number;
  showDamageNumbers: boolean;
  showQuestMarkers: boolean;
  showObjectiveMarkers: boolean;
  autoLoot: boolean;
  confirmOnExit: boolean;
  pauseOnFocusLoss: boolean;
  tutorialHints: boolean;
}

export interface ControlSettings {
  keyBindings: Record<string, string>;
  mouseSensitivity: number;
  mouseInvertY: boolean;
  gamepadEnabled: boolean;
  gamepadSensitivity: number;
  gamepadVibration: boolean;
  cameraDistance: number;
  cameraFOV: number;
  autoRun: boolean;
  toggleCrouch: boolean;
  toggleSprint: boolean;
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  colorBlindMode: 'off' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontDyslexic: boolean;
  subtitles: boolean;
  subtitleSize: 'small' | 'medium' | 'large';
  subtitleBackground: boolean;
  screenReader: boolean;
  navigationAssist: boolean;
  interactionAssist: boolean;
  holdInsteadOfTap: boolean;
}

export interface NetworkSettings {
  region: string;
  pingLimit: number;
  bandwidthLimit: number;
  voiceChat: boolean;
  voiceChatVolume: number;
  pushToTalk: boolean;
  pushToTalkKey: string;
}

// Performance Types
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  textures: number;
  memory: {
    geometries: number;
    textures: number;
    shaders: number;
    jsHeapUsed: number;
    jsHeapTotal: number;
  };
  gpu: {
    memoryUsed: number;
    memoryTotal: number;
  };
}

export interface QualityPreset {
  name: string;
  settings: Partial<GraphicsSettings>;
}

// Event Types (for EventBus)
export interface GameEvents {
  // Player events
  'player:spawn': { position: Vec3; rotation: Euler };
  'player:move': { position: Vec3; velocity: Vec3 };
  'player:rotate': { rotation: Euler };
  'player:interact': { targetId: string; interactionId: string };
  'player:area-enter': { areaId: string };
  'player:area-exit': { areaId: string };
  'player:level-up': { level: number; skill?: string };
  'player:experience': { amount: number; source: string };
  'player:health-change': { current: number; max: number; delta: number };
  'player:stamina-change': { current: number; max: number; delta: number };
  'player:death': { cause: string };
  'player:respawn': { position: Vec3 };

  // NPC events
  'npc:spawn': { npcId: string; position: Vec3 };
  'npc:despawn': { npcId: string };
  'npc:dialogue-start': { npcId: string; nodeId: string };
  'npc:dialogue-end': { npcId: string };
  'npc:dialogue-next': { npcId: string; nodeId: string };
  'npc:interact': { npcId: string; interactionId: string };
  'npc:schedule-change': { npcId: string; activity: string };

  // Quest events
  'quest:start': { questId: string };
  'quest:progress': { questId: string; objectiveId: string; current: number; max: number };
  'quest:complete': { questId: string };
  'quest:fail': { questId: string; reason: string };
  'quest:turn-in': { questId: string; rewards: QuestReward[] };
  'quest:cancel': { questId: string };
  'quest:available': { questId: string };
  'quest:unavailable': { questId: string };

  // Achievement events
  'achievement:unlock': { achievementId: string };
  'achievement:progress': { achievementId: string; current: number; max: number };

  // Inventory events
  'inventory:add': { itemId: string; quantity: number; slot?: string };
  'inventory:remove': { itemId: string; quantity: number };
  'inventory:equip': { itemId: string; slot: string };
  'inventory:unequip': { slot: string };
  'inventory:swap': { fromSlot: string; toSlot: string };
  'inventory:use': { itemId: string; target?: string };
  'inventory:craft': { recipeId: string; result: string };
  'inventory:full': { itemId: string };

  // World events
  'world:chunk-load': { chunkX: number; chunkZ: number };
  'world:chunk-unload': { chunkX: number; chunkZ: number };
  'world:time-change': { timeOfDay: string; gameTime: number };
  'world:weather-change': { weather: string; previous: string };
  'world:location-discover': { locationId: string };
  'world:location-enter': { locationId: string };
  'world:location-exit': { locationId: string };

  // UI events
  'ui:panel-open': { panelId: string };
  'ui:panel-close': { panelId: string };
  'ui:notification': { notification: NotificationData };
  'ui:tooltip-show': { tooltip: TooltipData; position: Vec2 };
  'ui:tooltip-hide': void;
  'ui:modal-open': { modalId: string };
  'ui:modal-close': { modalId: string };

  // Settings events
  'settings:change': { category: string; key: string; value: any };
  'settings:reset': { category?: string };
  'settings:import': { data: GameSettings };
  'settings:export': void;

  // System events
  'game:save': { slot: number };
  'game:load': { slot: number };
  'game:new': void;
  'game:reset': void;
  'game:pause': void;
  'game:resume': void;
  'game:quit': void;
  'game:error': { error: Error; context: string };
  'asset:load': { id: string; url: string };
  'asset:progress': { id: string; progress: number };
  'asset:error': { id: string; error: Error };
  'performance:warning': { metric: string; value: number; threshold: number };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string & { readonly __brand: unique symbol };