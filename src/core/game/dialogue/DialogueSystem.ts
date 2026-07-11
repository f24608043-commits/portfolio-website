import { 
  DialogueTree,
  DialogueNode,
  DialogueChoice,
  DialogueAction,
  DialogueCondition,
  Entity,
  NPCData
} from '../../types';
import { eventBus, GameEvents } from '../EventBus';

export interface DialogueState {
  npcId: string;
  currentNode: string;
  history: string[];
  variables: Record<string, any>;
  active: boolean;
  participantId: string; // player ID
}

export interface DialogueSystemConfig {
  typewriterSpeed: number;
  skipOnClick: boolean;
  autoAdvanceDelay: number;
  showPortraits: boolean;
  voiceEnabled: boolean;
}

const DEFAULT_CONFIG: DialogueSystemConfig = {
  typewriterSpeed: 30, // ms per character
  skipOnClick: true,
  autoAdvanceDelay: 3000,
  showPortraits: true,
  voiceEnabled: false,
};

export class DialogueSystem {
  private dialogues = new Map<string, DialogueTree>();
  private activeDialogue: DialogueState | null = null;
  private config: DialogueSystemConfig;
  private typewriterTimer: number | null = null;
  private autoAdvanceTimer: number | null = null;
  private currentText = '';
  private targetText = '';
  private typewriterIndex = 0;
  private onCompleteCallback: (() => void) | null = null;

  constructor(config: Partial<DialogueSystemConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  registerDialogue(tree: DialogueTree): void {
    this.dialogues.set(tree.startNode, tree); // Using startNode as key
  }

  registerNPCDialogue(npc: NPCData): void {
    if (npc.dialogue) {
      this.dialogues.set(npc.id, npc.dialogue);
    }
  }

  startDialogue(npcId: string, participantId: string = 'player', startNode?: string): DialogueState | null {
    const dialogue = this.dialogues.get(npcId);
    if (!dialogue) {
      console.warn(`[DialogueSystem] No dialogue found for NPC: ${npcId}`);
      return null;
    }

    if (this.activeDialogue) {
      this.endDialogue();
    }

    const state: DialogueState = {
      npcId,
      currentNode: startNode || dialogue.startNode,
      history: [],
      variables: {},
      active: true,
      participantId,
    };

    this.activeDialogue = state;
    
    eventBus.emit(GameEvents.NPC_DIALOGUE_START, { 
      npcId, 
      nodeId: state.currentNode,
      participantId 
    });

    this.displayNode(state.currentNode);
    return state;
  }

  advanceDialogue(choiceId?: string): boolean {
    if (!this.activeDialogue) return false;

    const dialogue = this.dialogues.get(this.activeDialogue.npcId);
    if (!dialogue) return false;

    const node = dialogue.nodes[this.activeDialogue.currentNode];
    if (!node) return false;

    // If we're in the middle of typewriter, skip to end
    if (this.typewriterIndex < this.targetText.length) {
      this.skipTypewriter();
      return true;
    }

    // Handle choice
    if (choiceId) {
      const choice = node.choices.find(c => c.id === choiceId);
      if (!choice) return false;

      // Check conditions
      if (choice.condition && !this.evaluateCondition(choice.condition)) {
        return false;
      }

      // Execute choice actions
      if (choice.action) {
        this.executeAction(choice.action);
      }
      if (node.actions) {
        node.actions.forEach(action => this.executeAction(action));
      }

      // Advance to next node
      if (choice.nextNode) {
        this.activeDialogue.history.push(this.activeDialogue.currentNode);
        this.activeDialogue.currentNode = choice.nextNode;
        this.displayNode(choice.nextNode);
        return true;
      }
    } else if (!node.choices || node.choices.length === 0) {
      // Auto-advance for nodes without choices
      if (node.nextNode) {
        this.activeDialogue.history.push(this.activeDialogue.currentNode);
        this.activeDialogue.currentNode = node.nextNode;
        this.displayNode(node.nextNode);
        return true;
      } else if (node.endDialogue) {
        this.endDialogue();
        return true;
      }
    }

    return false;
  }

  goBack(): boolean {
    if (!this.activeDialogue || this.activeDialogue.history.length === 0) return false;

    const previousNode = this.activeDialogue.history.pop()!;
    this.activeDialogue.currentNode = previousNode;
    this.displayNode(previousNode);
    return true;
  }

  endDialogue(): void {
    if (!this.activeDialogue) return;

    const { npcId, participantId } = this.activeDialogue;
    
    this.clearTimers();
    this.activeDialogue.active = false;
    this.activeDialogue = null;

    eventBus.emit(GameEvents.NPC_DIALOGUE_END, { npcId, participantId });
  }

  private displayNode(nodeId: string): void {
    const dialogue = this.dialogues.get(this.activeDialogue!.npcId);
    if (!dialogue) return;

    const node = dialogue.nodes[nodeId];
    if (!node) return;

    // Set target text for typewriter
    this.targetText = node.text;
    this.typewriterIndex = 0;
    this.currentText = '';

    // Start typewriter
    this.startTypewriter();

    // Set up auto-advance if no choices
    if (!node.choices || node.choices.length === 0) {
      this.startAutoAdvance();
    }

    // Execute node entry actions
    if (node.actions) {
      node.actions.forEach(action => this.executeAction(action));
    }

    // Emit UI event
    eventBus.emit('ui:dialogue-node', {
      npcId: this.activeDialogue!.npcId,
      nodeId,
      text: this.targetText,
      choices: node.choices,
      portrait: node.portrait,
      voice: node.voice,
      speaker: node.speaker,
    });
  }

  private startTypewriter(): void {
    this.clearTypewriter();
    
    const typeChar = () => {
      if (this.typewriterIndex < this.targetText.length) {
        this.currentText += this.targetText[this.typewriterIndex];
        this.typewriterIndex++;
        
        eventBus.emit('ui:dialogue-text', { 
          text: this.currentText, 
          complete: false 
        });

        this.typewriterTimer = window.setTimeout(typeChar, this.config.typewriterSpeed);
      } else {
        this.onTypewriterComplete();
      }
    };

    typeChar();
  }

  private onTypewriterComplete(): void {
    this.typewriterTimer = null;
    eventBus.emit('ui:dialogue-text', { 
      text: this.currentText, 
      complete: true 
    });
  }

  private skipTypewriter(): void {
    this.clearTypewriter();
    this.currentText = this.targetText;
    this.typewriterIndex = this.targetText.length;
    eventBus.emit('ui:dialogue-text', { 
      text: this.currentText, 
      complete: true 
    });
  }

  private clearTypewriter(): void {
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }
  }

  private startAutoAdvance(): void {
    this.clearAutoAdvance();
    this.autoAdvanceTimer = window.setTimeout(() => {
      if (this.activeDialogue) {
        this.advanceDialogue();
      }
    }, this.config.autoAdvanceDelay);
  }

  private clearAutoAdvance(): void {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearTypewriter();
    this.clearAutoAdvance();
  }

  private executeAction(action: DialogueAction): void {
    switch (action.type) {
      case 'give_item':
        eventBus.emit('inventory:add', { 
          itemId: action.params.itemId, 
          quantity: action.params.quantity || 1 
        });
        break;
      case 'remove_item':
        eventBus.emit('inventory:remove', { 
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
      case 'give_experience':
        eventBus.emit('player:experience', { amount: action.params.amount });
        break;
      case 'give_gold':
        eventBus.emit('inventory:add', { 
          itemId: 'gold', 
          quantity: action.params.amount 
        });
        break;
      case 'open_shop':
        eventBus.emit('ui:panel-open', { panelId: 'shop', shopId: action.params.shopId });
        break;
      case 'set_flag':
        if (this.activeDialogue) {
          this.activeDialogue.variables[action.params.flag] = true;
        }
        break;
      case 'clear_flag':
        if (this.activeDialogue) {
          this.activeDialogue.variables[action.params.flag] = false;
        }
        break;
      case 'teleport':
        eventBus.emit('player:teleport', { 
          position: action.params.position 
        });
        break;
      case 'custom':
        eventBus.emit('dialogue:custom_action', action.params);
        break;
    }
  }

  private evaluateCondition(condition: DialogueCondition): boolean {
    let result = false;

    switch (condition.type) {
      case 'has_item':
        // Would check inventory
        result = true; // Placeholder
        break;
      case 'has_quest':
        // Would check quest state
        result = true;
        break;
      case 'completed_quest':
        // Would check quest completion
        result = true;
        break;
      case 'has_achievement':
        // Would check achievements
        result = true;
        break;
      case 'skill_level':
        // Would check skill
        result = true;
        break;
      case 'flag':
        if (this.activeDialogue) {
          result = !!this.activeDialogue.variables[condition.params.flag];
        }
        break;
      case 'custom':
        result = eventBus.hasListeners(`dialogue:condition:${condition.params.id}`) ? 
          true : condition.params.default || false;
        break;
    }

    return condition.invert ? !result : result;
  }

  // Public API
  getCurrentNode(): string | null {
    return this.activeDialogue?.currentNode || null;
  }

  getCurrentText(): string {
    return this.currentText;
  }

  isActive(): boolean {
    return this.activeDialogue !== null;
  }

  getActiveNPC(): string | null {
    return this.activeDialogue?.npcId || null;
  }

  getAvailableChoices(): any[] {
    if (!this.activeDialogue) return [];
    
    const dialogue = this.dialogues.get(this.activeDialogue.npcId);
    if (!dialogue) return [];

    const node = dialogue.nodes[this.activeDialogue.currentNode];
    if (!node || !node.choices) return [];

    return node.choices.filter(choice => {
      if (!choice.condition) return true;
      return this.evaluateCondition(choice.condition);
    });
  }

  setVariable(key: string, value: any): void {
    if (this.activeDialogue) {
      this.activeDialogue.variables[key] = value;
    }
  }

  getVariable(key: string): any {
    return this.activeDialogue?.variables[key];
  }

  onDialogueComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  setConfig(config: Partial<DialogueSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  destroy(): void {
    this.clearTimers();
    this.activeDialogue = null;
    this.dialogues.clear();
  }
}

export { DialogueSystem, DEFAULT_CONFIG };