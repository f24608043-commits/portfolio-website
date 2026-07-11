import { 
  Entity, 
  Component, 
  Transform, 
  Vec3, 
  Euler,
  QuestData,
  QuestObjective,
  QuestReward,
  QuestFailureCondition,
  QuestState,
} from '../../types';
import { eventBus, GameEvents } from '../EventBus';
import { saveManager } from '../SaveManager';

export interface QuestManagerConfig {
  autoSave: boolean;
  autoSaveInterval: number;
  maxActiveQuests: number;
  showQuestMarkers: boolean;
  trackOnlyActive: boolean;
}

const DEFAULT_CONFIG: QuestManagerConfig = {
  autoSave: true,
  autoSaveInterval: 30000,
  maxActiveQuests: 20,
  showQuestMarkers: true,
  trackOnlyActive: false,
};

export class QuestManager {
  private questDefinitions = new Map<string, QuestData>();
  private playerQuests = new Map<string, QuestState>();
  private config: QuestManagerConfig;
  private saveTimer: number | null = null;

  constructor(config: Partial<QuestManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.bindEvents();
    
    if (this.config.autoSave) {
      this.startAutoSave();
    }
  }

  private bindEvents(): void {
    eventBus.on(GameEvents.QUEST_START, (data: { questId: string }) => {
      this.startQuest(data.questId);
    });

    eventBus.on(GameEvents.QUEST_COMPLETE, (data: { questId: string }) => {
      this.completeQuest(data.questId);
    });

    eventBus.on(GameEvents.QUEST_UPDATE, (data: { questId: string; objectiveId: string }) => {
      this.updateObjective(data.questId, data.objectiveId);
    });

    eventBus.on(GameEvents.PLAYER_INTERACT, (data: any) => {
      if (data.type === 'objective') {
        this.updateObjective(data.questId, data.objectiveId, data.count);
      }
    });

    eventBus.on('game:save', () => this.save());
    eventBus.on('game:load', (data: { slot: number }) => this.load(data.slot));
  }

  registerQuest(quest: QuestData): void {
    if (this.questDefinitions.has(quest.id)) {
      console.warn(`[QuestManager] Quest ${quest.id} already registered`);
      return;
    }

    // Validate quest
    if (!this.validateQuest(quest)) {
      console.error(`[QuestManager] Invalid quest: ${quest.id}`);
      return;
    }

    this.questDefinitions.set(quest.id, quest);
    console.log(`[QuestManager] Registered quest: ${quest.id} (${quest.name})`);
  }

  registerQuests(quests: QuestData[]): void {
    quests.forEach(q => this.registerQuest(q));
  }

  private validateQuest(quest: QuestData): boolean {
    if (!quest.id || !quest.name) return false;
    if (!quest.objectives || quest.objectives.length === 0) return false;
    
    for (const obj of quest.objectives) {
      if (!obj.id || !obj.type || obj.count <= 0) return false;
    }
    
    return true;
  }

  getQuestDefinition(id: string): QuestData | null {
    return this.questDefinitions.get(id) || null;
  }

  getAllDefinitions(): QuestData[] {
    return Array.from(this.questDefinitions.values());
  }

  getPlayerQuest(id: string): QuestState | null {
    return this.playerQuests.get(id) || null;
  }

  getActiveQuests(): QuestState[] {
    return Array.from(this.playerQuests.values()).filter(q => 
      q.status === 'active' || (this.config.trackOnlyActive && q.status === 'available')
    );
  }

  getCompletedQuests(): QuestState[] {
    return Array.from(this.playerQuests.values()).filter(q => 
      q.status === 'completed' || q.status === 'turned_in'
    );
  }

  getAvailableQuests(): QuestData[] {
    const completedIds = new Set(
      Array.from(this.playerQuests.values())
        .filter(q => q.status === 'completed' || q.status === 'turned_in')
        .map(q => q.id)
    );

    return Array.from(this.questDefinitions.values()).filter(quest => {
      if (completedIds.has(quest.id)) return false;
      if (this.playerQuests.has(quest.id)) return false;
      if (quest.hidden) return false;
      
      // Check prerequisites
      return quest.prerequisites.every(prereq => 
        completedIds.has(prereq) || this.isQuestCompleted(prereq)
      );
    });
  }

  isQuestCompleted(id: string): boolean {
    const state = this.playerQuests.get(id);
    return state?.status === 'completed' || state?.status === 'turned_in';
  }

  isQuestActive(id: string): boolean {
    const state = this.playerQuests.get(id);
    return state?.status === 'active';
  }

  isQuestAvailable(id: string): boolean {
    const state = this.playerQuests.get(id);
    if (!state) return this.getAvailableQuests().some(q => q.id === id);
    return state.status === 'available';
  }

  startQuest(questId: string): boolean {
    const definition = this.questDefinitions.get(questId);
    if (!definition) {
      console.error(`[QuestManager] Quest not found: ${questId}`);
      return false;
    }

    if (this.playerQuests.has(questId)) {
      const existing = this.playerQuests.get(questId)!;
      if (existing.status === 'active') return true;
      if (existing.status === 'completed' || existing.status === 'turned_in') return false;
    }

    // Check prerequisites
    if (!definition.prerequisites.every(p => this.isQuestCompleted(p))) {
      console.warn(`[QuestManager] Prerequisites not met for ${questId}`);
      return false;
    }

    const state: QuestState = {
      id: questId,
      status: 'active',
      objectives: {},
      startedAt: Date.now(),
      progress: 0,
    };

    definition.objectives.forEach(obj => {
      state.objectives[obj.id] = {
        current: 0,
        completed: false,
      };
    });

    this.playerQuests.set(questId, state);
    
    eventBus.emit(GameEvents.QUEST_START, { questId });
    eventBus.emit('ui:notification', {
      type: 'quest',
      title: 'Quest Started',
      message: definition.name,
      icon: '📜',
    });

    console.log(`[QuestManager] Started quest: ${questId}`);
    return true;
  }

  updateObjective(questId: string, objectiveId: string, amount: number = 1): boolean {
    const state = this.playerQuests.get(questId);
    if (!state || state.status !== 'active') return false;

    const definition = this.questDefinitions.get(questId);
    if (!definition) return false;

    const objective = definition.objectives.find(o => o.id === objectiveId);
    if (!objective) return false;

    const objState = state.objectives[objectiveId];
    if (!objState || objState.completed) return false;

    objState.current = Math.min(objState.current + amount, objective.count);
    
    if (objState.current >= objective.count && !objState.completed) {
      objState.completed = true;
      objState.current = objective.count;
      
      eventBus.emit(GameEvents.OBJECTIVE_COMPLETE, { 
        questId, 
        objectiveId 
      });
      
      eventBus.emit('ui:notification', {
        type: 'success',
        title: 'Objective Complete',
        message: objective.description,
        icon: '✅',
      });
    }

    this.updateProgress(state, definition);
    
    // Check if all objectives complete
    if (this.allObjectivesComplete(state, definition)) {
      this.completeQuest(questId);
    }

    if (this.config.autoSave) {
      this.save();
    }

    return true;
  }

  private updateProgress(state: QuestState, definition: QuestData): void {
    const total = definition.objectives.length;
    const completed = definition.objectives.filter(o => state.objectives[o.id]?.completed).length;
    state.progress = total > 0 ? completed / total : 1;
  }

  private allObjectivesComplete(state: QuestState, definition: QuestData): boolean {
    return definition.objectives.every(obj => {
      if (obj.optional) return true;
      return state.objectives[obj.id]?.completed === true;
    });
  }

  completeQuest(questId: string): boolean {
    const state = this.playerQuests.get(questId);
    if (!state || state.status === 'completed' || state.status === 'turned_in') return false;

    const definition = this.questDefinitions.get(questId);
    if (!definition) return false;

    state.status = 'completed';
    state.completedAt = Date.now();
    state.progress = 1;

    // Grant rewards
    this.grantRewards(definition.rewards);

    eventBus.emit(GameEvents.QUEST_COMPLETE, { questId });
    eventBus.emit('ui:notification', {
      type: 'quest',
      title: 'Quest Completed',
      message: definition.name,
      icon: '🏆',
    });

    console.log(`[QuestManager] Completed quest: ${questId}`);
    return true;
  }

  turnInQuest(questId: string): boolean {
    const state = this.playerQuests.get(questId);
    if (!state || state.status !== 'completed') return false;

    state.status = 'turned_in';
    state.turnedInAt = Date.now();

    eventBus.emit('quest:turned_in', { questId });
    return true;
  }

  failQuest(questId: string): boolean {
    const state = this.playerQuests.get(questId);
    if (!state || state.status === 'failed') return false;

    const definition = this.questDefinitions.get(questId);
    if (!definition) return false;

    state.status = 'failed';

    // Check failure conditions
    if (definition.failureConditions) {
      // Apply failure penalties
    }

    eventBus.emit('quest:fail', { questId });
    eventBus.emit('ui:notification', {
      type: 'error',
      title: 'Quest Failed',
      message: definition.name,
      icon: '❌',
    });

    return true;
  }

  abandonQuest(questId: string): boolean {
    const state = this.playerQuests.get(questId);
    if (!state || state.status !== 'active') return false;

    state.status = 'available';
    // Reset objectives
    Object.values(state.objectives).forEach(obj => {
      obj.current = 0;
      obj.completed = false;
    });
    state.progress = 0;

    eventBus.emit('quest:abandon', { questId });
    return true;
  }

  private grantRewards(rewards: QuestReward[]): void {
    rewards.forEach(reward => {
      switch (reward.type) {
        case 'experience':
          eventBus.emit('player:experience', { amount: reward.value });
          break;
        case 'gold':
          eventBus.emit('inventory:add', { 
            itemId: 'gold', 
            quantity: reward.quantity || reward.value 
          });
          break;
        case 'item':
          eventBus.emit('inventory:add', { 
            itemId: reward.value, 
            quantity: reward.quantity || 1 
          });
          break;
        case 'skill':
          eventBus.emit('skill:grant', { 
            skillId: reward.value, 
            level: reward.quantity || 1 
          });
          break;
        case 'reputation':
          eventBus.emit('reputation:change', { 
            faction: reward.value, 
            amount: reward.quantity || 0 
          });
          break;
        case 'achievement':
          eventBus.emit('achievement:unlock', { 
            achievementId: reward.value 
          });
          break;
        case 'unlock':
          eventBus.emit('unlock', { 
            type: reward.value.type, 
            id: reward.value.id 
          });
          break;
      }
    });
  }

  // Objective helpers
  killCount(questId: string, enemyType: string, count: number = 1): void {
    this.updateObjective(questId, `kill_${enemyType}`, count);
  }

  collectItem(questId: string, itemId: string, count: number = 1): void {
    this.updateObjective(questId, `collect_${itemId}`, count);
  }

  visitLocation(questId: string, locationId: string): void {
    this.updateObjective(questId, `visit_${locationId}`, 1);
  }

  talkToNPC(questId: string, npcId: string): void {
    this.updateObjective(questId, `talk_${npcId}`, 1);
  }

  craftItem(questId: string, itemId: string, count: number = 1): void {
    this.updateObjective(questId, `craft_${itemId}`, count);
  }

  useItem(questId: string, itemId: string): void {
    this.updateObjective(questId, `use_${itemId}`, 1);
  }

  // Save/Load
  save(): void {
    try {
      const data = {
        version: 1,
        timestamp: Date.now(),
        quests: Array.from(this.playerQuests.entries()).map(([id, state]) => ({
          id: state.id,
          status: state.status,
          objectives: state.objectives,
          startedAt: state.startedAt,
          completedAt: state.completedAt,
          turnedInAt: state.turnedInAt,
          progress: state.progress,
        })),
      };

      localStorage.setItem('portfolio-quest-quests', JSON.stringify(data));
    } catch (e) {
      console.error('[QuestManager] Failed to save:', e);
    }
  }

  load(): void {
    try {
      const saved = localStorage.getItem('portfolio-quest-quests');
      if (!saved) return;

      const data = JSON.parse(saved);
      if (data.version !== 1) {
        console.warn('[QuestManager] Save version mismatch');
        return;
      }

      data.quests.forEach((q: any) => {
        const state: QuestState = {
          id: q.id,
          status: q.status,
          objectives: q.objectives,
          startedAt: q.startedAt,
          completedAt: q.completedAt,
          turnedInAt: q.turnedInAt,
          progress: q.progress,
        };
        this.playerQuests.set(q.id, state);
      });

      console.log(`[QuestManager] Loaded ${data.quests.length} quests`);
    } catch (e) {
      console.error('[QuestManager] Failed to load:', e);
    }
  }

  private startAutoSave(): void {
    this.saveTimer = window.setInterval(() => {
      this.save();
    }, this.config.autoSaveInterval);
  }

  stopAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
  }

  // Utility
  getQuestProgress(questId: string): number {
    const state = this.playerQuests.get(questId);
    return state?.progress || 0;
  }

  getObjectiveProgress(questId: string, objectiveId: string): { current: number; target: number; completed: boolean } | null {
    const state = this.playerQuests.get(questId);
    const definition = this.questDefinitions.get(questId);
    if (!state || !definition) return null;

    const objDef = definition.objectives.find(o => o.id === objectiveId);
    const objState = state.objectives[objectiveId];
    if (!objDef || !objState) return null;

    return {
      current: objState.current,
      target: objDef.count,
      completed: objState.completed,
    };
  }

  resetQuest(questId: string): void {
    this.playerQuests.delete(questId);
  }

  resetAll(): void {
    this.playerQuests.clear();
    this.save();
  }

  destroy(): void {
    this.stopAutoSave();
    this.questDefinitions.clear();
    this.playerQuests.clear();
  }
}

export { QuestManager, DEFAULT_CONFIG };