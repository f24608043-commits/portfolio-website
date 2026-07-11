type EventCallback<T = any> = (data: T) => void;
type EventMap = Record<string, EventCallback[]>;

class EventBus {
  private events: EventMap = {};
  private onceEvents: EventMap = {};
  private history: { event: string; data: any; timestamp: number }[] = [];
  private maxHistory = 100;

  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    return () => this.off(event, callback);
  }

  once<T = any>(event: string, callback: EventCallback<T>): void {
    if (!this.onceEvents[event]) {
      this.onceEvents[event] = [];
    }
    this.onceEvents[event].push(callback);
  }

  off<T = any>(event: string, callback: EventCallback<T>): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    if (this.onceEvents[event]) {
      this.onceEvents[event] = this.onceEvents[event].filter(cb => cb !== callback);
    }
  }

  emit<T = any>(event: string, data?: T): void {
    this.history.push({ event, data, timestamp: Date.now() });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    if (this.events[event]) {
      this.events[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[EventBus] Error in handler for ${event}:`, e);
        }
      });
    }

    if (this.onceEvents[event]) {
      this.onceEvents[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[EventBus] Error in once handler for ${event}:`, e);
        }
      });
      delete this.onceEvents[event];
    }
  }

  clear(event?: string): void {
    if (event) {
      delete this.events[event];
      delete this.onceEvents[event];
    } else {
      this.events = {};
      this.onceEvents = {};
    }
  }

  getHistory(): typeof this.history {
    return [...this.history];
  }

  hasListeners(event: string): boolean {
    return !!this.events[event]?.length || !!this.onceEvents[event]?.length;
  }

  listenerCount(event: string): number {
    return (this.events[event]?.length || 0) + (this.onceEvents[event]?.length || 0);
  }
}

export const eventBus = new EventBus();

export const GameEvents = {
  // Game lifecycle
  INIT: 'game:init',
  START: 'game:start',
  PAUSE: 'game:pause',
  RESUME: 'game:resume',
  RESET: 'game:reset',
  SAVE: 'game:save',
  LOAD: 'game:load',
  
  // Player
  PLAYER_MOVE: 'player:move',
  PLAYER_INTERACT: 'player:interact',
  PLAYER_LEVEL_UP: 'player:level_up',
  PLAYER_HEALTH_CHANGED: 'player:health_changed',
  PLAYER_EXPERIENCE_CHANGED: 'player:experience_changed',
  
  // World
  AREA_ENTER: 'world:area_enter',
  AREA_EXIT: 'world:area_exit',
  TIME_CHANGED: 'world:time_changed',
  WEATHER_CHANGED: 'world:weather_changed',
  
  // Quests
  QUEST_START: 'quest:start',
  QUEST_COMPLETE: 'quest:complete',
  QUEST_UPDATE: 'quest:update',
  OBJECTIVE_COMPLETE: 'objective:complete',
  
  // NPC
  NPC_INTERACT: 'npc:interact',
  NPC_DIALOGUE_START: 'npc:dialogue_start',
  NPC_DIALOGUE_END: 'npc:dialogue_end',
  
  // Inventory
  ITEM_PICKUP: 'inventory:pickup',
  ITEM_DROP: 'inventory:drop',
  ITEM_USE: 'inventory:use',
  EQUIPMENT_CHANGE: 'inventory:equip_change',
  
  // UI
  UI_OPEN: 'ui:open',
  UI_CLOSE: 'ui:close',
  SETTINGS_CHANGED: 'ui:settings_changed',
  
  // Performance
  FPS_UPDATE: 'performance:fps_update',
  QUALITY_CHANGED: 'performance:quality_changed',
} as const;