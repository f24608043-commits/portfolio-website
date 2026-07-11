import { 
  Entity, 
  Component, 
  Transform, 
  Vec3, 
  Euler,
  InventoryState,
  InventoryItem,
} from '../../types';
import { eventBus, GameEvents } from '../EventBus';
import { assetManager } from '../AssetManager';

export interface InventoryConfig {
  maxSlots: number;
  maxStackSize: number;
  autoStack: boolean;
  autoSort: boolean;
  weightLimit: number;
}

const DEFAULT_CONFIG: InventoryConfig = {
  maxSlots: 30,
  maxStackSize: 99,
  autoStack: true,
  autoSort: false,
  weightLimit: 100,
};

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

const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  { id: 'weapon_main', name: 'Main Hand', allowedTypes: ['weapon'] },
  { id: 'weapon_off', name: 'Off Hand', allowedTypes: ['weapon', 'shield'] },
  { id: 'head', name: 'Head', allowedTypes: ['armor'], allowedSubtypes: ['helmet'] },
  { id: 'chest', name: 'Chest', allowedTypes: ['armor'], allowedSubtypes: ['chest'] },
  { id: 'legs', name: 'Legs', allowedTypes: ['armor'], allowedSubtypes: ['legs'] },
  { id: 'feet', name: 'Feet', allowedTypes: ['armor'], allowedSubtypes: ['boots'] },
  { id: 'hands', name: 'Hands', allowedTypes: ['armor'], allowedSubtypes: ['gloves'] },
  { id: 'neck', name: 'Neck', allowedTypes: ['armor', 'accessory'], allowedSubtypes: ['necklace'] },
  { id: 'ring1', name: 'Ring 1', allowedTypes: ['accessory'], allowedSubtypes: ['ring'] },
  { id: 'ring2', name: 'Ring 2', allowedTypes: ['accessory'], allowedSubtypes: ['ring'] },
  { id: 'back', name: 'Back', allowedTypes: ['armor', 'accessory'], allowedSubtypes: ['cloak'] },
  { id: 'waist', name: 'Waist', allowedTypes: ['armor', 'accessory'], allowedSubtypes: ['belt'] },
];

export class InventorySystem {
  private items = new Map<string, ItemDefinition>();
  private entityInventories = new Map<string, InventoryState>();
  private config: InventoryConfig;
  private itemCounter = 0;

  constructor(config: Partial<InventoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.bindEvents();
  }

  private bindEvents(): void {
    eventBus.on('inventory:add', (data: { itemId: string; quantity: number; entityId?: string }) => {
      this.addItem(data.entityId || 'player', data.itemId, data.quantity);
    });

    eventBus.on('inventory:remove', (data: { itemId: string; quantity: number; entityId?: string }) => {
      this.removeItem(data.entityId || 'player', data.itemId, data.quantity);
    });

    eventBus.on('inventory:equip', (data: { itemId: string; slot: string; entityId?: string }) => {
      this.equipItem(data.entityId || 'player', data.itemId, data.slot);
    });

    eventBus.on('inventory:unequip', (data: { slot: string; entityId?: string }) => {
      this.unequipItem(data.entityId || 'player', data.slot);
    });

    eventBus.on('inventory:use', (data: { itemId: string; target?: string; entityId?: string }) => {
      this.useItem(data.entityId || 'player', data.itemId, data.target);
    });

    eventBus.on('game:save', () => this.save());
    eventBus.on('game:load', (data: { slot: number }) => this.load(data.slot));
  }

  registerItem(item: ItemDefinition): void {
    this.items.set(item.id, item);
  }

  getItemDefinition(id: string): ItemDefinition | undefined {
    return this.items.get(id);
  }

  getInventory(entityId: string = 'player'): InventoryState {
    let inv = this.entityInventories.get(entityId);
    if (!inv) {
      inv = this.createInventory();
      this.entityInventories.set(entityId, inv);
    }
    return inv;
  }

  private createInventory(): InventoryState {
    return {
      items: [],
      capacity: this.config.maxSlots,
      equipped: {},
      gold: 0,
    };
  }

  // Item Management
  addItem(entityId: string, itemId: string, quantity: number = 1): boolean {
    const itemDef = this.items.get(itemId);
    if (!itemDef) {
      console.warn(`[InventorySystem] Unknown item: ${itemId}`);
      return false;
    }

    const inv = this.getInventory(entityId);
    
    // Check weight
    const totalWeight = this.getTotalWeight(inv) + itemDef.weight * quantity;
    if (totalWeight > this.config.weightLimit) {
      eventBus.emit('ui:notification', { 
        type: 'warning', 
        message: 'Inventory too heavy!' 
      });
      return false;
    }

    // Try to stack
    if (this.config.autoStack && itemDef.stackSize > 1) {
      const existing = inv.items.find(i => i.itemId === itemId && !i.slot);
      if (existing) {
        const canAdd = Math.min(quantity, itemDef.stackSize - existing.quantity);
        if (canAdd > 0) {
          existing.quantity += canAdd;
          quantity -= canAdd;
          if (quantity <= 0) return true;
        }
      }
    }

    // Add new stacks
    while (quantity > 0) {
      if (inv.items.filter(i => !i.slot).length >= this.config.capacity) {
        eventBus.emit('ui:notification', { 
          type: 'warning', 
          message: 'Inventory full!' 
        });
        return false;
      }

      const addQty = Math.min(quantity, itemDef.stackSize);
      inv.items.push({
        id: `item-${Date.now()}-${this.itemCounter++}`,
        itemId,
        quantity: addQty,
        durability: itemDef.properties.maxDurability,
        maxDurability: itemDef.properties.maxDurability,
      });
      quantity -= addQty;
    }

    eventBus.emit('inventory:changed', { entityId, action: 'add', itemId, quantity });
    return true;
  }

  removeItem(entityId: string, itemId: string, quantity: number = 1): boolean {
    const inv = this.getInventory(entityId);
    const items = inv.items.filter(i => i.itemId === itemId && !i.slot);
    
    let remaining = quantity;
    for (const item of items) {
      const removeQty = Math.min(item.quantity, remaining);
      item.quantity -= removeQty;
      remaining -= removeQty;
      
      if (item.quantity <= 0) {
        const idx = inv.items.indexOf(item);
        if (idx >= 0) inv.items.splice(idx, 1);
      }
      
      if (remaining <= 0) break;
    }

    if (remaining > 0) return false;

    eventBus.emit('inventory:changed', { entityId, action: 'remove', itemId, quantity });
    return true;
  }

  hasItem(entityId: string, itemId: string, quantity: number = 1): boolean {
    const inv = this.getInventory(entityId);
    const total = inv.items
      .filter(i => i.itemId === itemId && !i.slot)
      .reduce((sum, i) => sum + i.quantity, 0);
    return total >= quantity;
  }

  getItemCount(entityId: string, itemId: string): number {
    const inv = this.getInventory(entityId);
    return inv.items
      .filter(i => i.itemId === itemId && !i.slot)
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  // Equipment
  equipItem(entityId: string, itemId: string, slotId: string): boolean {
    const inv = this.getInventory(entityId);
    const slot = EQUIPMENT_SLOTS.find(s => s.id === slotId);
    if (!slot) return false;

    // Find item in inventory
    const itemIndex = inv.items.findIndex(i => i.itemId === itemId && !i.slot);
    if (itemIndex === -1) return false;

    const item = inv.items[itemIndex];
    const itemDef = this.items.get(itemId);
    if (!itemDef) return false;

    // Check if item can go in slot
    if (!slot.allowedTypes.includes(itemDef.type)) return false;
    if (slot.allowedSubtypes && !slot.allowedSubtypes.includes(itemDef.subtype || '')) return false;

    // Check requirements
    if (itemDef.requirements) {
      // Would check level, skills, stats here
    }

    // Unequip current item in slot
    if (inv.equipped[slotId]) {
      this.unequipItem(entityId, slotId);
    }

    // Equip
    const itemInstance = inv.items.splice(itemIndex, 1)[0];
    itemInstance.slot = slotId;
    inv.equipped[slotId] = itemInstance.id;

    eventBus.emit('inventory:equip_change', { entityId, slot: slotId, itemId, action: 'equip' });
    return true;
  }

  unequipItem(entityId: string, slotId: string): boolean {
    const inv = this.getInventory(entityId);
    const equippedId = inv.equipped[slotId];
    if (!equippedId) return false;

    // Find the equipped item (it should be tracked somewhere)
    // For now, we'll create a placeholder
    const itemDef = this.items.get('placeholder'); // Would need proper tracking
    
    // In a real implementation, we'd have a separate equipped items map
    delete inv.equipped[slotId];

    eventBus.emit('inventory:equip_change', { entityId, slot: slotId, action: 'unequip' });
    return true;
  }

  getEquippedItem(entityId: string, slotId: string): InventoryItem | null {
    const inv = this.getInventory(entityId);
    const equippedId = inv.equipped[slotId];
    if (!equippedId) return null;
    
    // Would look up the actual item
    return null;
  }

  getEquippedItems(entityId: string): Record<string, InventoryItem> {
    const inv = this.getInventory(entityId);
    const result: Record<string, InventoryItem> = {};
    
    Object.entries(inv.equipped).forEach(([slot, itemId]) => {
      // Would look up actual item
      result[slot] = { id: itemId, itemId: '', quantity: 1, slot } as any;
    });
    
    return result;
  }

  // Item Usage
  useItem(entityId: string, itemId: string, target?: string): boolean {
    const inv = this.getInventory(entityId);
    const itemIndex = inv.items.findIndex(i => i.itemId === itemId && !i.slot);
    if (itemIndex === -1) return false;

    const item = inv.items[itemIndex];
    const itemDef = this.items.get(itemId);
    if (!itemDef || !itemDef.effects) return false;

    // Apply effects
    itemDef.effects.forEach(effect => {
      this.applyEffect(entityId, effect, target);
    });

    // Consume if consumable
    if (itemDef.type === 'consumable') {
      item.quantity--;
      if (item.quantity <= 0) {
        inv.items.splice(itemIndex, 1);
      }
    }

    // Apply durability damage
    if (itemDef.properties.durabilityLoss) {
      item.durability = Math.max(0, (item.durability || 100) - itemDef.properties.durabilityLoss);
      if (item.durability <= 0) {
        // Item breaks
        inv.items.splice(itemIndex, 1);
        eventBus.emit('ui:notification', { 
          type: 'warning', 
          message: `${itemDef.name} has broken!` 
        });
      }
    }

    eventBus.emit('inventory:item_used', { entityId, itemId, target });
    return true;
  }

  private applyEffect(entityId: string, effect: ItemEffect, target?: string): void {
    // Would apply the actual effect to the entity
    console.log(`[InventorySystem] Applying effect ${effect.type} to ${entityId}`);
  }

  // Utility
  private getTotalWeight(inv: InventoryState): number {
    let weight = 0;
    for (const item of inv.items) {
      const def = this.items.get(item.itemId);
      if (def) {
        weight += def.weight * item.quantity;
      }
    }
    return weight;
  }

  getFreeSlots(entityId: string): number {
    const inv = this.getInventory(entityId);
    return this.config.capacity - inv.items.filter(i => !i.slot).length;
  }

  getTotalValue(entityId: string): number {
    const inv = this.getInventory(entityId);
    let value = 0;
    for (const item of inv.items) {
      const def = this.items.get(item.itemId);
      if (def) value += def.value * item.quantity;
    }
    return value;
  }

  sortInventory(entityId: string): void {
    const inv = this.getInventory(entityId);
    inv.items.sort((a, b) => {
      // Sort by: equipped first, then by type, then by name
      if (a.slot && !b.slot) return -1;
      if (!a.slot && b.slot) return 1;
      const defA = this.items.get(a.itemId);
      const defB = this.items.get(b.itemId);
      if (defA && defB && defA.type !== defB.type) {
        return defA.type.localeCompare(defB.type);
      }
      return (defA?.name || '').localeCompare(defB?.name || '');
    });
  }

  // Gold/Currency
  addGold(entityId: string, amount: number): void {
    const inv = this.getInventory(entityId);
    inv.gold += amount;
    eventBus.emit('inventory:gold_changed', { entityId, amount, total: inv.gold });
  }

  removeGold(entityId: string, amount: number): boolean {
    const inv = this.getInventory(entityId);
    if (inv.gold < amount) return false;
    inv.gold -= amount;
    eventBus.emit('inventory:gold_changed', { entityId, amount: -amount, total: inv.gold });
    return true;
  }

  getGold(entityId: string): number {
    return this.getInventory(entityId).gold;
  }

  // Save/Load
  save(): void {
    const data: Record<string, any> = {};
    this.entityInventories.forEach((inv, entityId) => {
      data[entityId] = {
        items: inv.items,
        equipped: inv.equipped,
        gold: inv.gold,
        capacity: inv.capacity,
      };
    });
    localStorage.setItem('portfolio-quest-inventory', JSON.stringify(data));
  }

  load(slot: number): void {
    try {
      const data = JSON.parse(localStorage.getItem('portfolio-quest-inventory') || '{}');
      this.entityInventories.clear();
      Object.entries(data).forEach(([entityId, inv]: [string, any]) => {
        this.entityInventories.set(entityId, {
          items: inv.items || [],
          capacity: inv.capacity || this.config.maxSlots,
          equipped: inv.equipped || {},
          gold: inv.gold || 0,
        });
      });
    } catch (e) {
      console.error('[InventorySystem] Failed to load:', e);
    }
  }

  destroy(): void {
    this.entityInventories.clear();
    this.items.clear();
  }
}

export { InventorySystem, DEFAULT_CONFIG, EQUIPMENT_SLOTS };
export type { ItemDefinition, ItemEffect, EquipmentSlot, InventoryConfig };