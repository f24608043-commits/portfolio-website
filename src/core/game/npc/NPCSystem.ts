import { 
  Entity, 
  Component, 
  Transform, 
  Vec3, 
  Euler,
  NPCData,
  NPCTimetable,
  DialogueTree,
  DialogueNode,
  DialogueChoice,
  DialogueAction,
  DialogueCondition,
  InteractionData
} from '../../types';
import { eventBus, GameEvents } from '../EventBus';
import { assetManager } from '../AssetManager';

export interface NPCState {
  id: string;
  data: NPCData;
  currentNode: string;
  dialogueState: Record<string, any>;
  schedule: NPCTimetable[];
  currentActivity: string;
  targetPosition: Vec3 | null;
  path: Vec3[];
  pathIndex: number;
  lastInteraction: number;
  interactionCooldown: number;
  flags: Record<string, boolean>;
  relationship: number; // -100 to 100
  discovered: boolean;
  greeted: boolean;
}

export interface NPCAIConfig {
  wanderRadius: number;
  wanderInterval: { min: number; max: number };
  walkSpeed: number;
  runSpeed: number;
  turnSpeed: number;
  interactionRadius: number;
  fov: number;
  viewDistance: number;
  hearingRadius: number;
  reactionTime: number;
}

const DEFAULT_AI_CONFIG: NPCAIConfig = {
  wanderRadius: 10,
  wanderInterval: { min: 5, max: 15 },
  walkSpeed: 2,
  runSpeed: 4,
  turnSpeed: 3,
  interactionRadius: 3,
  fov: 120,
  viewDistance: 20,
  hearingRadius: 10,
  reactionTime: 0.5,
};

export class NPCSystem {
  private npcs = new Map<string, NPCState>();
  private config: NPCAIConfig;
  private updateInterval: number = 100; // ms
  private lastUpdate: number = 0;
  private playerPosition: Vec3 = { x: 0, y: 0, z: 0 };

  constructor(config: Partial<NPCAIConfig> = {}) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
  }

  async initialize(npcDatas: NPCData[]): Promise<void> {
    for (const data of npcDatas) {
      await this.registerNPC(data);
    }
    console.log(`[NPCSystem] Initialized ${this.npcs.size} NPCs`);
  }

  async registerNPC(data: NPCData): Promise<void> {
    const state: NPCState = {
      id: data.id,
      data,
      currentNode: data.dialogue.startNode,
      dialogueState: {},
      schedule: data.schedule || [],
      currentActivity: 'idle',
      targetPosition: null,
      path: [],
      pathIndex: 0,
      lastInteraction: 0,
      interactionCooldown: 1000,
      flags: {},
      relationship: 0,
      discovered: false,
      greeted: false,
    };

    this.npcs.set(data.id, state);

    // Load model if specified
    if (data.model) {
      try {
        await assetManager.loadGLTF(data.model, data.model);
      } catch (e) {
        console.warn(`[NPCSystem] Failed to load model for ${data.id}:`, e);
      }
    }

    eventBus.emit('npc:spawn', { 
      npcId: data.id, 
      position: data.position 
    });
  }

  unregisterNPC(id: string): void {
    const npc = this.npcs.get(id);
    if (npc) {
      this.npcs.delete(id);
      eventBus.emit('npc:despawn', { npcId: id });
    }
  }

  update(deltaTime: number, playerPos: Vec3): void {
    this.playerPosition = playerPos;
    const now = performance.now();

    if (now - this.lastUpdate < this.updateInterval) return;
    this.lastUpdate = now;

    this.npcs.forEach((npc, id) => {
      this.updateNPC(npc, deltaTime);
    });
  }

  private updateNPC(npc: NPCState, deltaTime: number): void {
    // Update schedule
    this.updateSchedule(npc);

    // Update activity
    this.updateActivity(npc, deltaTime);

    // Handle movement
    if (npc.targetPosition) {
      this.moveTowards(npc, deltaTime);
    }

    // Check player interaction
    this.checkPlayerInteraction(npc);

    // Update dialogue state
    this.updateDialogueState(npc);
  }

  private updateSchedule(npc: NPCState): void {
    if (!npc.schedule.length) return;

    // Get current game time (in minutes from midnight)
    // This would come from the world system
    const gameTimeMinutes = this.getGameTimeMinutes();
    
    for (const entry of npc.schedule) {
      if (gameTimeMinutes >= entry.timeStart && gameTimeMinutes < entry.timeEnd) {
        if (npc.currentActivity !== entry.activity) {
          npc.currentActivity = entry.activity;
          npc.targetPosition = entry.position;
          
          if (entry.targetId) {
            // Set interaction target
          }
        }
        break;
      }
    }
  }

  private updateActivity(npc: NPCState, deltaTime: number): void {
    switch (npc.currentActivity) {
      case 'idle':
        this.handleIdle(npc, deltaTime);
        break;
      case 'walk':
        this.handleWalk(npc, deltaTime);
        break;
      case 'work':
        this.handleWork(npc, deltaTime);
        break;
      case 'sleep':
        // Stay in bed position
        break;
      case 'social':
        this.handleSocial(npc, deltaTime);
        break;
    }
  }

  private handleIdle(npc: NPCState, deltaTime: number): void {
    // Random chance to start wandering
    if (Math.random() < 0.001 * deltaTime * 60) {
      const angle = Math.random() * Math.PI * 2;
      const distance = this.config.wanderRadius * (0.5 + Math.random() * 0.5);
      
      npc.targetPosition = {
        x: npc.data.position.x + Math.cos(angle) * distance,
        y: npc.data.position.y,
        z: npc.data.position.z + Math.sin(angle) * distance,
      };
      npc.currentActivity = 'walk';
    }
  }

  private handleWalk(npc: NPCState, deltaTime: number): void {
    if (!npc.targetPosition) return;

    const dx = npc.targetPosition.x - npc.data.position.x;
    const dz = npc.targetPosition.z - npc.data.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.5) {
      // Reached destination
      npc.targetPosition = null;
      npc.currentActivity = 'idle';
      
      // Schedule next wander
      const nextWander = this.config.wanderInterval.min + 
        Math.random() * (this.config.wanderInterval.max - this.config.wanderInterval.min);
      // Would use a timer system
    }
  }

  private handleWork(npc: NPCState, deltaTime: number): void {
    // Perform work animation/activity at position
    if (npc.targetPosition) {
      const dx = npc.targetPosition.x - npc.data.position.x;
      const dz = npc.targetPosition.z - npc.data.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist > 1) {
        // Move to work position
        this.moveTowards(npc, deltaTime);
      }
    }
  }

  private handleSocial(npc: NPCState, deltaTime: number): void {
    // Look for nearby NPCs to interact with
    if (npc.targetPosition) {
      this.moveTowards(npc, deltaTime);
    }
  }

  private moveTowards(npc: NPCState, deltaTime: number): void {
    if (!npc.targetPosition) return;

    const speed = npc.currentActivity === 'run' ? this.config.runSpeed : this.config.walkSpeed;
    const dx = npc.targetPosition.x - npc.data.position.x;
    const dz = npc.targetPosition.z - npc.data.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.1) {
      npc.data.position.x = npc.targetPosition.x;
      npc.data.position.z = npc.targetPosition.z;
      npc.targetPosition = null;
      return;
    }

    const moveX = (dx / dist) * speed * deltaTime;
    const moveZ = (dz / dist) * speed * deltaTime;

    npc.data.position.x += moveX;
    npc.data.position.z += moveZ;

    // Rotate towards target
    const targetAngle = Math.atan2(dx, dz);
    npc.data.rotation.y = this.lerpAngle(npc.data.rotation.y, targetAngle, this.config.turnSpeed * deltaTime);
  }

  private checkPlayerInteraction(npc: NPCState): void {
    const dx = this.playerPosition.x - npc.data.position.x;
    const dz = this.playerPosition.z - npc.data.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist <= this.config.interactionRadius) {
      if (!npc.discovered) {
        npc.discovered = true;
        eventBus.emit('world:location-discover', { locationId: npc.id });
      }

      // Check if player is looking at NPC
      // This would use the camera direction
    }
  }

  private updateDialogueState(npc: NPCState): void {
    // Update dialogue flags, conditions, etc.
  }

  private getGameTimeMinutes(): number {
    // This would come from the world system
    return 12 * 60; // Default to noon
  }

  private lerpAngle(from: number, to: number, t: number): number {
    let diff = to - from;
    diff = (diff + Math.PI) % (2 * Math.PI) - Math.PI;
    return from + diff * t;
  }

  // Public API
  getNPC(id: string): NPCState | null {
    return this.npcs.get(id) || null;
  }

  getAllNPCs(): NPCState[] {
    return Array.from(this.npcs.values());
  }

  getNPCsInRadius(position: Vec3, radius: number): NPCState[] {
    return Array.from(this.npcs.values()).filter(npc => {
      const dx = position.x - npc.data.position.x;
      const dz = position.z - npc.data.position.z;
      return dx * dx + dz * dz <= radius * radius;
    });
  }

  interactWithNPC(npcId: string): NPCState | null {
    const npc = this.npcs.get(npcId);
    if (!npc) return null;

    const now = performance.now();
    if (now - npc.lastInteraction < npc.interactionCooldown) {
      return null;
    }

    npc.lastInteraction = now;
    
    if (!npc.greeted) {
      npc.greeted = true;
      npc.currentNode = npc.data.dialogue.startNode;
    }

    eventBus.emit('npc:interact', { npcId: npcId });
    eventBus.emit('npc:dialogue-start', { npcId: npcId, nodeId: npc.currentNode });

    return npc;
  }

  advanceDialogue(npcId: string, choiceId: string): NPCState | null {
    const npc = this.npcs.get(npcId);
    if (!npc) return null;

    const node = npc.data.dialogue.nodes[npc.currentNode];
    if (!node) return null;

    const choice = node.choices.find(c => c.id === choiceId);
    if (!choice) return null;

    // Check conditions
    if (choice.condition && !this.checkCondition(npc, choice.condition)) {
      return null;
    }

    // Execute actions
    if (choice.action) {
      this.executeAction(npc, choice.action);
    }
    if (node.actions) {
      node.actions.forEach(action => this.executeAction(npc, action));
    }

    // Advance to next node
    if (choice.nextNode) {
      npc.currentNode = choice.nextNode;
    } else if (node.nextNode) {
      npc.currentNode = node.nextNode;
    } else {
      // End dialogue
      eventBus.emit('npc:dialogue-end', { npcId: npcId });
      return npc;
    }

    eventBus.emit('npc:dialogue-next', { npcId: npcId, nodeId: npc.currentNode });
    return npc;
  }

  private checkCondition(npc: NPCState, condition: DialogueCondition): boolean {
    // Implementation would check various conditions
    return true;
  }

  private executeAction(npc: NPCState, action: DialogueAction): void {
    switch (action.type) {
      case 'give_item':
        eventBus.emit('inventory:add', { 
          itemId: action.params.itemId, 
          quantity: action.params.quantity || 1 
        });
        break;
      case 'start_quest':
        eventBus.emit('quest:start', { questId: action.params.questId });
        break;
      case 'complete_quest':
        eventBus.emit('quest:complete', { questId: action.params.questId });
        break;
      case 'unlock_achievement':
        eventBus.emit('achievement:unlock', { achievementId: action.params.achievementId });
        break;
      case 'open_shop':
        eventBus.emit('ui:panel-open', { panelId: 'shop', shopId: action.params.shopId });
        break;
      case 'set_flag':
        npc.flags[action.params.flag] = true;
        break;
      case 'clear_flag':
        npc.flags[action.params.flag] = false;
        break;
    }
  }

  setRelationship(npcId: string, value: number): void {
    const npc = this.npcs.get(npcId);
    if (npc) {
      npc.relationship = Math.max(-100, Math.min(100, value));
    }
  }

  getRelationship(npcId: string): number {
    return this.npcs.get(npcId)?.relationship || 0;
  }

  setFlag(npcId: string, flag: string, value: boolean): void {
    const npc = this.npcs.get(npcId);
    if (npc) {
      npc.flags[flag] = value;
    }
  }

  getFlag(npcId: string, flag: string): boolean {
    return this.npcs.get(npcId)?.flags[flag] || false;
  }

  destroy(): void {
    this.npcs.clear();
  }
}

export { NPCSystem, DEFAULT_AI_CONFIG };