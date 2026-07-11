import { eventBus, GameEvents } from './EventBus';
import { assetManager } from './AssetManager';
import { saveManager } from './SaveManager';
import { InputManager } from './InputManager';
import { PerformanceMonitor } from './PerformanceMonitor';
import { 
  Vec3, Euler, Entity, Component, PlayerState, NPCData, 
  QuestData, QuestState, LocationData, WorldChunk,
  GameSettings, QualityPreset
} from './types';

interface GameConfig {
  canvas: HTMLCanvasElement;
  settings: GameSettings;
  qualityPresets: Record<string, QualityPreset>;
}

interface System {
  name: string;
  priority: number;
  enabled: boolean;
  init(engine: GameEngine): Promise<void>;
  update(deltaTime: number): void;
  lateUpdate(deltaTime: number): void;
  shutdown(): void;
}

class GameEngine {
  private static instance: GameEngine | null = null;
  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      throw new Error('GameEngine not initialized. Call GameEngine.create() first.');
    }
    return GameEngine.instance;
  }

  public static create(config: GameConfig): GameEngine {
    if (GameEngine.instance) {
      console.warn('[GameEngine] Instance already exists, returning existing');
      return GameEngine.instance;
    }
    GameEngine.instance = new GameEngine(config);
    return GameEngine.instance;
  }

  private config: GameConfig;
  private systems = new Map<string, System>();
  private entities = new Map<string, Entity>();
  private systemsToAdd: System[] = [];
  private systemsToRemove: string[] = [];
  private running = false;
  private paused = false;
  private lastTime = 0;
  private accumulatedTime = 0;
  private fixedTimeStep = 1 / 60;
  private maxSubSteps = 5;
  private frameId: number | null = null;
  
  // Core managers
  public readonly input: InputManager;
  public readonly performance: PerformanceMonitor;
  
  // Game state
  public player: PlayerState | null = null;
  public currentArea: string = 'town-square';
  public gameTime: number = 0;
  public timeOfDay: 'dawn' | 'day' | 'dusk' | 'night' = 'day';
  public weather: 'clear' | 'rain' | 'fog' | 'snow' = 'clear';
  public loadedChunks = new Map<string, WorldChunk>();

  private constructor(config: GameConfig) {
    this.config = config;
    this.input = new InputManager();
    this.performance = new PerformanceMonitor();
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.on('game:pause', () => this.pause());
    eventBus.on('game:resume', () => this.resume());
    eventBus.on('game:save', () => this.saveGame());
    eventBus.on('game:load', () => this.loadGame());
    eventBus.on('game:reset', () => this.resetGame());
    eventBus.on('settings:change', ({ category, key, value }) => this.onSettingChange(category, key, value));
  }

  async initialize(): Promise<void> {
    console.log('[GameEngine] Initializing...');
    
    // Initialize core systems in priority order
    const coreSystems = [
      'asset',
      'input',
      'physics',
      'audio',
      'world',
      'entity',
      'player',
      'npc',
      'quest',
      'ui',
      'weather',
      'lighting',
    ];

    for (const systemName of coreSystems) {
      const system = this.systems.get(systemName);
      if (system) {
        console.log(`[GameEngine] Initializing ${systemName}...`);
        await system.init(this);
      }
    }

    // Load settings
    this.loadSettings();
    
    // Apply quality preset
    this.applyQualityPreset(this.config.settings.graphics.quality);
    
    console.log('[GameEngine] Initialized successfully');
    eventBus.emit('game:init', {});
  }

  registerSystem(system: System): void {
    if (this.systems.has(system.name)) {
      console.warn(`[GameEngine] System ${system.name} already registered`);
      return;
    }
    this.systemsToAdd.push(system);
    this.systemsToAdd.sort((a, b) => b.priority - a.priority);
  }

  unregisterSystem(name: string): void {
    this.systemsToRemove.push(name);
  }

  getSystem<T extends System>(name: string): T | null {
    return (this.systems.get(name) as T) || null;
  }

  private processSystemChanges(): void {
    for (const name of this.systemsToRemove) {
      const system = this.systems.get(name);
      if (system) {
        system.shutdown();
        this.systems.delete(name);
      }
    }
    this.systemsToRemove.length = 0;

    for (const system of this.systemsToAdd) {
      this.systems.set(system.name, system);
    }
    this.systemsToAdd.length = 0;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.gameLoop.bind(this));
    console.log('[GameEngine] Started');
    eventBus.emit('game:start', {});
  }

  stop(): void {
    this.running = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    console.log('[GameEngine] Stopped');
  }

  pause(): void {
    this.paused = true;
    eventBus.emit('game:pause', {});
  }

  resume(): void {
    this.paused = false;
    this.lastTime = performance.now();
    eventBus.emit('game:resume', {});
  }

  private gameLoop(currentTime: number): void {
    if (!this.running) return;

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
    this.lastTime = currentTime;

    if (!this.paused) {
      this.accumulatedTime += deltaTime;
      
      // Fixed timestep for physics
      let subSteps = 0;
      while (this.accumulatedTime >= this.fixedTimeStep && subSteps < this.maxSubSteps) {
        this.fixedUpdate(this.fixedTimeStep);
        this.accumulatedTime -= this.fixedTimeStep;
        subSteps++;
      }

      this.update(deltaTime);
      this.lateUpdate(deltaTime);
      
      this.gameTime += deltaTime;
      this.updateTimeOfDay();
    }

    this.performance.endFrame();
    this.frameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  private fixedUpdate(deltaTime: number): void {
    this.systems.forEach(system => {
      if (system.enabled && system.name === 'physics') {
        system.update(deltaTime);
      }
    });
  }

  private update(deltaTime: number): void {
    this.processSystemChanges();
    
    this.systems.forEach(system => {
      if (system.enabled && system.name !== 'physics') {
        const start = performance.now();
        system.update(deltaTime);
        this.performance.recordSystemTime(system.name, performance.now() - start);
      }
    });

    this.updateEntities(deltaTime);
    this.input.update();
  }

  private lateUpdate(deltaTime: number): void {
    this.systems.forEach(system => {
      if (system.enabled) {
        system.lateUpdate(deltaTime);
      }
    });
  }

  private updateEntities(deltaTime: number): void {
    this.entities.forEach(entity => {
      if (entity.active) {
        entity.components.forEach(component => {
          if (component.enabled && component.data.update) {
            component.data.update(deltaTime);
          }
        });
      }
    });
  }

  private updateTimeOfDay(): void {
    const dayLength = 24 * 60; // 24 minutes real time = 1 day game time
    const timeOfDayMinutes = (this.gameTime * 60) % dayLength;
    
    const newTimeOfDay = timeOfDayMinutes < 6 * 60 ? 'dawn' :
                        timeOfDayMinutes < 12 * 60 ? 'day' :
                        timeOfDayMinutes < 18 * 60 ? 'dusk' : 'night';
    
    if (newTimeOfDay !== this.timeOfDay) {
      this.timeOfDay = newTimeOfDay;
      eventBus.emit('world:time-change', { 
        timeOfDay: this.timeOfDay, 
        gameTime: this.gameTime 
      });
    }
  }

  // Entity Management
  createEntity(type: string, name: string, transform: any): Entity {
    const entity: Entity = {
      id: this.generateId(),
      type,
      name,
      transform: {
        position: transform.position || { x: 0, y: 0, z: 0 },
        rotation: transform.rotation || { x: 0, y: 0, z: 0 },
        scale: transform.scale || { x: 1, y: 1, z: 1 },
      },
      active: true,
      components: new Map(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    this.entities.set(entity.id, entity);
    return entity;
  }

  destroyEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.components.forEach(comp => {
        if (comp.data.onDestroy) comp.data.onDestroy();
      });
      this.entities.delete(id);
    }
  }

  getEntity(id: string): Entity | null {
    return this.entities.get(id) || null;
  }

  getEntitiesByType(type: string): Entity[] {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }

  addComponent(entityId: string, component: Component): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.components.set(component.type, component);
      entity.updatedAt = Date.now();
    }
  }

  removeComponent(entityId: string, componentType: string): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      const comp = entity.components.get(componentType);
      if (comp && comp.data.onDestroy) comp.data.onDestroy();
      entity.components.delete(componentType);
      entity.updatedAt = Date.now();
    }
  }

  getComponent<T>(entityId: string, componentType: string): T | null {
    const entity = this.entities.get(entityId);
    return entity?.components.get(componentType)?.data as T || null;
  }

  // Player Management
  setPlayer(player: PlayerState): void {
    this.player = player;
    eventBus.emit('player:spawn', { 
      position: player.position, 
      rotation: player.rotation 
    });
  }

  getPlayer(): PlayerState | null {
    return this.player;
  }

  // Area Management
  setCurrentArea(areaId: string): void {
    const previousArea = this.currentArea;
    this.currentArea = areaId;
    
    if (previousArea !== areaId) {
      eventBus.emit('player:area-exit', { areaId: previousArea });
      eventBus.emit('player:area-enter', { areaId });
    }
  }

  getCurrentArea(): string {
    return this.currentArea;
  }

  // Chunk Management
  loadChunk(x: number, z: number): WorldChunk | null {
    const key = `${x},${z}`;
    if (this.loadedChunks.has(key)) {
      const chunk = this.loadedChunks.get(key)!;
      chunk.lastAccessed = Date.now();
      return chunk;
    }
    
    // Create new chunk
    const chunk: WorldChunk = {
      x,
      z,
      entities: [],
      terrain: {
        heightmap: new Float32Array(256 * 256),
        textures: ['grass', 'dirt'],
        vegetation: [],
        waterLevel: 0,
      },
      loaded: true,
      loading: false,
      lastAccessed: Date.now(),
    };
    
    this.loadedChunks.set(key, chunk);
    eventBus.emit('world:chunk-load', { chunkX: x, chunkZ: z });
    return chunk;
  }

  unloadChunk(x: number, z: number): void {
    const key = `${x},${z}`;
    const chunk = this.loadedChunks.get(key);
    if (chunk) {
      chunk.entities.forEach(entityId => this.destroyEntity(entityId));
      this.loadedChunks.delete(key);
      eventBus.emit('world:chunk-unload', { chunkX: x, chunkZ: z });
    }
  }

  // Settings
  private onSettingChange(category: string, key: string, value: any): void {
    switch (category) {
      case 'graphics':
        this.applyGraphicsSetting(key, value);
        break;
      case 'audio':
        this.applyAudioSetting(key, value);
        break;
      case 'gameplay':
        this.applyGameplaySetting(key, value);
        break;
      case 'controls':
        this.applyControlSetting(key, value);
        break;
    }
  }

  private applyGraphicsSetting(key: string, value: any): void {
    // Apply to renderer
    eventBus.emit('renderer:setting', { key, value });
  }

  private applyAudioSetting(key: string, value: any): void {
    eventBus.emit('audio:setting', { key, value });
  }

  private applyGameplaySetting(key: string, value: any): void {
    // Apply gameplay settings
  }

  private applyControlSetting(key: string, value: any): void {
    if (key === 'keyBindings') {
      this.input.registerAction({
        id: value.action,
        keys: [value.key],
        type: 'digital',
      });
    }
  }

  applyQualityPreset(quality: string): void {
    const preset = this.config.qualityPresets[quality];
    if (!preset) return;
    
    Object.entries(preset.settings).forEach(([key, value]) => {
      this.applyGraphicsSetting(key, value);
    });
    
    this.config.settings.graphics.quality = quality as any;
    console.log(`[GameEngine] Applied quality preset: ${quality}`);
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('portfolio-quest-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.config.settings = { ...this.config.settings, ...settings };
      }
    } catch (e) {
      console.warn('[GameEngine] Failed to load settings:', e);
    }
  }

  saveSettings(): void {
    try {
      localStorage.setItem('portfolio-quest-settings', JSON.stringify(this.config.settings));
    } catch (e) {
      console.warn('[GameEngine] Failed to save settings:', e);
    }
  }

  // Save/Load
  saveGame(slot = 0): boolean {
    if (!this.player) return false;
    
    const saveData = {
      version: 1,
      timestamp: Date.now(),
      slot,
      player: this.player,
      currentArea: this.currentArea,
      gameTime: this.gameTime,
      timeOfDay: this.timeOfDay,
      weather: this.weather,
      entities: Array.from(this.entities.entries()).map(([id, entity]) => ({
        id,
        ...entity,
        components: Array.from(entity.components.entries()).map(([type, comp]) => ({
          type,
          ...comp,
        })),
      })),
    };
    
    try {
      localStorage.setItem(`portfolio-quest-save-${slot}`, JSON.stringify(saveData));
      eventBus.emit('game:save', { slot });
      return true;
    } catch (e) {
      console.error('[GameEngine] Save failed:', e);
      return false;
    }
  }

  loadGame(slot = 0): boolean {
    try {
      const saved = localStorage.getItem(`portfolio-quest-save-${slot}`);
      if (!saved) return false;
      
      const data = JSON.parse(saved);
      if (data.version !== 1) {
        console.warn('[GameEngine] Save version mismatch');
        return false;
      }
      
      this.player = data.player;
      this.currentArea = data.currentArea;
      this.gameTime = data.gameTime;
      this.timeOfDay = data.timeOfDay;
      this.weather = data.weather;
      
      // Restore entities
      this.entities.clear();
      data.entities.forEach((e: any) => {
        const entity: Entity = {
          ...e,
          components: new Map(e.components.map((c: any) => [c.type, c])),
        };
        this.entities.set(entity.id, entity);
      });
      
      eventBus.emit('game:load', { slot });
      return true;
    } catch (e) {
      console.error('[GameEngine] Load failed:', e);
      return false;
    }
  }

  resetGame(): void {
    this.entities.clear();
    this.player = null;
    this.currentArea = 'town-square';
    this.gameTime = 0;
    this.timeOfDay = 'day';
    this.weather = 'clear';
    this.loadedChunks.clear();
    
    // Reset systems
    this.systems.forEach(system => system.shutdown());
    this.systems.clear();
    
    localStorage.removeItem('portfolio-quest-save-0');
    eventBus.emit('game:reset', {});
  }

  // Utility
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getCanvas(): HTMLCanvasElement {
    return this.config.canvas;
  }

  getConfig(): GameConfig {
    return this.config;
  }

  isRunning(): boolean {
    return this.running;
  }

  isPaused(): boolean {
    return this.paused;
  }

  shutdown(): void {
    this.stop();
    
    this.systems.forEach(system => system.shutdown());
    this.systems.clear();
    this.entities.clear();
    this.loadedChunks.clear();
    
    assetManager.clear();
    saveManager.reset();
    eventBus.clear();
    
    GameEngine.instance = null;
    console.log('[GameEngine] Shutdown complete');
  }
}

export { GameEngine };