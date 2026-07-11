import { 
  Entity, 
  Component, 
  Transform, 
  Vec3, 
  Euler,
  PlayerState,
  SkillState,
  InventoryState,
  InventoryItem,
  PlayerSettings,
  PlayerStats
} from '../types';
import { eventBus, GameEvents } from './EventBus';
import { inputManager } from './InputManager';
import { performanceMonitor } from './PerformanceMonitor';

export interface PlayerControllerConfig {
  walkSpeed: number;
  runSpeed: number;
  jumpForce: number;
  gravity: number;
  airControl: number;
  groundCheckDistance: number;
  slopeLimit: number;
  stepHeight: number;
  cameraOffset: Vec3;
  cameraDistance: number;
  cameraMinDistance: number;
  cameraMaxDistance: number;
  cameraFOV: number;
  cameraSensitivity: number;
  cameraSmoothing: number;
  invertY: boolean;
}

const DEFAULT_CONFIG: PlayerControllerConfig = {
  walkSpeed: 4,
  runSpeed: 8,
  jumpForce: 10,
  gravity: 30,
  airControl: 0.3,
  groundCheckDistance: 0.5,
  slopeLimit: 45,
  stepHeight: 0.5,
  cameraOffset: { x: 0, y: 1.7, z: 0 },
  cameraDistance: 5,
  cameraMinDistance: 2,
  cameraMaxDistance: 15,
  cameraFOV: 75,
  cameraSensitivity: 0.002,
  cameraSmoothing: 0.1,
  invertY: false,
};

export class PlayerController {
  private entity: Entity;
  private config: PlayerControllerConfig;
  private velocity: Vec3 = { x: 0, y: 0, z: 0 };
  private onGround = false;
  private groundedFrames = 0;
  private wasOnGround = false;
  private cameraTarget: Vec3 = { x: 0, y: 0, z: 0 };
  private cameraCurrent: Vec3 = { x: 0, y: 0, z: 0 };
  private yaw = 0;
  private pitch = 0;
  private targetYaw = 0;
  private targetPitch = 0;
  private moveInput: Vec2 = { x: 0, y: 0 };
  private runPressed = false;
  private jumpPressed = false;
  private jumpReleased = true;
  private state: PlayerState;

  constructor(entity: Entity, config: Partial<PlayerControllerConfig> = {}) {
    this.entity = entity;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.createInitialState();
    this.initializeComponents();
    this.bindInputs();
  }

  private createInitialState(): PlayerState {
    return {
      id: this.entity.id,
      position: { ...this.entity.transform.position },
      rotation: { ...this.entity.transform.rotation },
      velocity: { x: 0, y: 0, z: 0 },
      speed: this.config.walkSpeed,
      runSpeed: this.config.runSpeed,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      skills: {},
      inventory: {
        items: [],
        capacity: 30,
        equipped: {},
        gold: 0,
      },
      quests: [],
      achievements: [],
      settings: {
        quality: 'high',
        musicVolume: 0.5,
        sfxVolume: 0.7,
        reducedMotion: false,
        showFPS: false,
        cameraDistance: this.config.cameraDistance,
        cameraFOV: this.config.cameraFOV,
        invertY: this.config.invertY,
        sensitivity: this.config.cameraSensitivity,
        keyBindings: {},
      },
    };
  }

  private initializeComponents(): void {
    // Transform component
    this.entity.components.set('transform', {
      type: 'transform',
      enabled: true,
      data: this.entity.transform,
    });

    // Physics component
    this.entity.components.set('physics', {
      type: 'physics',
      enabled: true,
      data: {
        mass: 80,
        drag: 0.1,
        angularDrag: 0.05,
        useGravity: true,
        isKinematic: false,
        collider: {
          type: 'capsule',
          radius: 0.5,
          height: 1.8,
          center: { x: 0, y: 1, z: 0 },
        },
      },
    });

    // Player controller component
    this.entity.components.set('playerController', {
      type: 'playerController',
      enabled: true,
      data: {
        walkSpeed: this.config.walkSpeed,
        runSpeed: this.config.runSpeed,
        jumpForce: this.config.jumpForce,
        gravity: this.config.gravity,
      },
    });

    // Camera component
    this.entity.components.set('camera', {
      type: 'camera',
      enabled: true,
      data: {
        fov: this.config.cameraFOV,
        near: 0.1,
        far: 1000,
        offset: this.config.cameraOffset,
        distance: this.config.cameraDistance,
        minDistance: this.config.cameraMinDistance,
        maxDistance: this.config.cameraMaxDistance,
        sensitivity: this.config.cameraSensitivity,
        smoothing: this.config.cameraSmoothing,
        invertY: this.config.invertY,
      },
    });

    // Stats component
    this.entity.components.set('stats', {
      type: 'stats',
      enabled: true,
      data: {
        health: 100,
        maxHealth: 100,
        stamina: 100,
        maxStamina: 100,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        strength: 10,
        agility: 10,
        intelligence: 10,
        vitality: 10,
        luck: 10,
      },
    });
  }

  private bindInputs(): void {
    // Movement
    inputManager.registerAction({
      id: 'move_forward',
      keys: ['KeyW', 'ArrowUp'],
      type: 'digital',
    });
    inputManager.registerAction({
      id: 'move_backward',
      keys: ['KeyS', 'ArrowDown'],
      type: 'digital',
    });
    inputManager.registerAction({
      id: 'move_left',
      keys: ['KeyA', 'ArrowLeft'],
      type: 'digital',
    });
    inputManager.registerAction({
      id: 'move_right',
      keys: ['KeyD', 'ArrowRight'],
      type: 'digital',
    });
    inputManager.registerAction({
      id: 'run',
      keys: ['ShiftLeft', 'ShiftRight'],
      type: 'digital',
    });
    inputManager.registerAction({
      id: 'jump',
      keys: ['Space'],
      type: 'digital',
    });
    inputManager.registerAction({
      id: 'interact',
      keys: ['KeyE'],
      type: 'digital',
    });
    inputManager.registerAction({
      id: 'camera',
      keys: [],
      gamepadAxes: [
        { axis: 2, threshold: 0.1, direction: 1 },
        { axis: 3, threshold: 0.1, direction: 1 },
      ],
      type: 'analog',
    });
  }

  update(deltaTime: number): void {
    performanceMonitor.recordSystemTime('PlayerController', performance.now());
    
    this.readInputs();
    this.updateMovement(deltaTime);
    this.updateCamera(deltaTime);
    this.updateGroundCheck();
    this.updateState();
    
    performanceMonitor.recordSystemTime('PlayerController', performance.now());
  }

  private readInputs(): void {
    this.moveInput.x = (inputManager.isActionPressed('move_right') ? 1 : 0) - 
                       (inputManager.isActionPressed('move_left') ? 1 : 0);
    this.moveInput.y = (inputManager.isActionPressed('move_forward') ? 1 : 0) - 
                       (inputManager.isActionPressed('move_backward') ? 1 : 0);
    
    this.runPressed = inputManager.isActionPressed('run');
    
    const jumpPressed = inputManager.isActionPressed('jump');
    if (jumpPressed && this.jumpReleased) {
      this.jumpPressed = true;
      this.jumpReleased = false;
    } else if (!jumpPressed) {
      this.jumpReleased = true;
    }

    // Camera input
    const cameraDelta = inputManager.getCameraDelta();
    this.targetYaw -= cameraDelta.x * this.config.cameraSensitivity;
    this.targetPitch += cameraDelta.y * this.config.cameraSensitivity * (this.config.invertY ? 1 : -1);
    this.targetPitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.targetPitch));
  }

  private updateMovement(deltaTime: number): void {
    const speed = this.runPressed ? this.config.runSpeed : this.config.walkSpeed;
    
    // Calculate movement direction relative to camera yaw
    const forward = new Vec3(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw)
    );
    const right = new Vec3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    );

    // Calculate target velocity
    const targetVelocity = new Vec3(
      forward.x * this.moveInput.y + right.x * this.moveInput.x,
      this.velocity.y,
      forward.z * this.moveInput.y + right.z * this.moveInput.x
    );

    // Normalize if moving diagonally
    const horizontalLength = Math.sqrt(targetVelocity.x ** 2 + targetVelocity.z ** 2);
    if (horizontalLength > 1) {
      targetVelocity.x /= horizontalLength;
      targetVelocity.z /= horizontalLength;
    }

    targetVelocity.x *= speed;
    targetVelocity.z *= speed;

    // Apply air control
    const control = this.onGround ? 1 : this.config.airControl;
    this.velocity.x += (targetVelocity.x - this.velocity.x) * control * 10 * deltaTime;
    this.velocity.z += (targetVelocity.z - this.velocity.z) * control * 10 * deltaTime;

    // Apply gravity
    this.velocity.y -= this.config.gravity * deltaTime;

    // Jump
    if (this.jumpPressed && this.onGround) {
      this.velocity.y = this.config.jumpForce;
      this.jumpPressed = false;
      this.onGround = false;
      this.groundedFrames = 0;
      
      eventBus.emit(GameEvents.PLAYER_INTERACT, { 
        type: 'jump', 
        position: this.entity.transform.position 
      });
    }

    // Update position
    this.entity.transform.position.x += this.velocity.x * deltaTime;
    this.entity.transform.position.y += this.velocity.y * deltaTime;
    this.entity.transform.position.z += this.velocity.z * deltaTime;

    // Update rotation to face movement direction
    if (horizontalLength > 0.1) {
      this.targetYaw = Math.atan2(targetVelocity.x, targetVelocity.z);
    }
  }

  private updateCamera(deltaTime: number): void {
    // Smooth camera rotation
    this.yaw += (this.targetYaw - this.yaw) * this.config.cameraSmoothing;
    this.pitch += (this.targetPitch - this.pitch) * this.config.cameraSmoothing;

    // Calculate camera position
    const offset = new Vec3(
      Math.sin(this.yaw) * this.config.cameraDistance,
      this.config.cameraOffset.y,
      Math.cos(this.yaw) * this.config.cameraDistance
    );
    
    // Apply pitch offset
    offset.y += Math.sin(this.pitch) * this.config.cameraDistance * 0.5;

    this.cameraTarget.x = this.entity.transform.position.x + this.config.cameraOffset.x;
    this.cameraTarget.y = this.entity.transform.position.y + this.config.cameraOffset.y;
    this.cameraTarget.z = this.entity.transform.position.z + this.config.cameraOffset.z;

    this.cameraCurrent.x += (this.cameraTarget.x + offset.x - this.cameraCurrent.x) * this.config.cameraSmoothing;
    this.cameraCurrent.y += (this.cameraTarget.y + offset.y - this.cameraCurrent.y) * this.config.cameraSmoothing;
    this.cameraCurrent.z += (this.cameraTarget.z + offset.z - this.cameraCurrent.z) * this.config.cameraSmoothing;

    // Update entity rotation
    this.entity.transform.rotation.y = this.yaw;
    
    // Update camera component
    const cameraComp = this.entity.components.get('camera');
    if (cameraComp) {
      cameraComp.data.distance = this.config.cameraDistance;
    }
  }

  private updateGroundCheck(): void {
    // Raycast down to check ground
    // This would integrate with physics engine
    // For now, simple ground check
    if (this.entity.transform.position.y <= 1) {
      this.entity.transform.position.y = 1;
      this.velocity.y = 0;
      this.onGround = true;
      this.groundedFrames++;
    } else {
      this.onGround = false;
      this.groundedFrames = 0;
    }
  }

  private updateState(): void {
    this.state.position = { ...this.entity.transform.position };
    this.state.rotation = { ...this.entity.transform.rotation };
    this.state.velocity = { ...this.velocity };
    this.state.speed = this.runPressed ? this.config.runSpeed : this.config.walkSpeed;
  }

  // Public API
  getState(): PlayerState {
    return { ...this.state };
  }

  getCameraPosition(): Vec3 {
    return { ...this.cameraCurrent };
  }

  getCameraTarget(): Vec3 {
    return { ...this.cameraTarget };
  }

  getYaw(): number {
    return this.yaw;
  }

  getPitch(): number {
    return this.pitch;
  }

  isOnGround(): boolean {
    return this.onGround;
  }

  getVelocity(): Vec3 {
    return { ...this.velocity };
  }

  takeDamage(amount: number, source?: string): void {
    const statsComp = this.entity.components.get('stats');
    if (!statsComp) return;

    statsComp.data.health = Math.max(0, statsComp.data.health - amount);
    
    eventBus.emit(GameEvents.PLAYER_INTERACT, { 
      type: 'damage', 
      amount, 
      source,
      health: statsComp.data.health 
    });

    if (statsComp.data.health <= 0) {
      this.die();
    }
  }

  heal(amount: number): void {
    const statsComp = this.entity.components.get('stats');
    if (!statsComp) return;

    statsComp.data.health = Math.min(statsComp.data.maxHealth, statsComp.data.health + amount);
  }

  addExperience(amount: number): void {
    const statsComp = this.entity.components.get('stats');
    if (!statsComp) return;

    statsComp.data.experience += amount;
    while (statsComp.data.experience >= statsComp.data.experienceToNext) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    const statsComp = this.entity.components.get('stats');
    if (!statsComp) return;

    statsComp.data.level++;
    statsComp.data.experience -= statsComp.data.experienceToNext;
    statsComp.data.experienceToNext = Math.floor(statsComp.data.experienceToNext * 1.5);
    statsComp.data.maxHealth += 10;
    statsComp.data.health = statsComp.data.maxHealth;
    statsComp.data.maxStamina += 5;
    statsComp.data.stamina = statsComp.data.maxStamina;

    eventBus.emit(GameEvents.PLAYER_LEVEL_UP, { 
      level: statsComp.data.level 
    });
  }

  private die(): void {
    eventBus.emit(GameEvents.PLAYER_INTERACT, { type: 'death' });
    // Respawn logic
    this.respawn();
  }

  respawn(position?: Vec3): void {
    if (position) {
      this.entity.transform.position = position;
    } else {
      // Find nearest spawn point
      this.entity.transform.position = { x: 0, y: 2, z: 0 };
    }
    
    this.velocity = { x: 0, y: 0, z: 0 };
    
    const statsComp = this.entity.components.get('stats');
    if (statsComp) {
      statsComp.data.health = statsComp.data.maxHealth;
    }
    
    eventBus.emit(GameEvents.PLAYER_INTERACT, { type: 'respawn' });
  }

  addItem(itemId: string, quantity: number = 1): boolean {
    const invComp = this.entity.components.get('inventory');
    if (!invComp) return false;

    const existing = invComp.data.items.find((i: InventoryItem) => i.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      if (invComp.data.items.length >= invComp.data.capacity) {
        return false;
      }
      invComp.data.items.push({
        id: `item-${Date.now()}`,
        itemId,
        quantity,
      });
    }
    return true;
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const invComp = this.entity.components.get('inventory');
    if (!invComp) return false;

    const index = invComp.data.items.findIndex((i: InventoryItem) => i.itemId === itemId);
    if (index === -1) return false;

    const item = invComp.data.items[index];
    if (item.quantity <= quantity) {
      invComp.data.items.splice(index, 1);
    } else {
      item.quantity -= quantity;
    }
    return true;
  }

  hasItem(itemId: string, quantity: number = 1): boolean {
    const invComp = this.entity.components.get('inventory');
    if (!invComp) return false;
    const item = invComp.data.items.find((i: InventoryItem) => i.itemId === itemId);
    return item ? item.quantity >= quantity : false;
  }

  equipItem(itemId: string, slot: string): boolean {
    const invComp = this.entity.components.get('inventory');
    if (!invComp) return false;

    const item = invComp.data.items.find((i: InventoryItem) => i.itemId === itemId);
    if (!item) return false;

    if (invComp.data.equipped[slot]) {
      this.unequipItem(slot);
    }

    invComp.data.equipped[slot] = itemId;
    item.slot = slot;
    return true;
  }

  unequipItem(slot: string): string | null {
    const invComp = this.entity.components.get('inventory');
    if (!invComp || !invComp.data.equipped[slot]) return null;

    const itemId = invComp.data.equipped[slot];
    const item = invComp.data.items.find((i: InventoryItem) => i.itemId === itemId);
    if (item) item.slot = undefined;

    delete invComp.data.equipped[slot];
    return itemId;
  }

  getEquippedItem(slot: string): string | null {
    const invComp = this.entity.components.get('inventory');
    return invComp?.data.equipped[slot] || null;
  }

  setSetting<K extends keyof PlayerSettings>(key: K, value: PlayerSettings[K]): void {
    this.state.settings[key] = value;
    this.applySetting(key, value);
  }

  private applySetting(key: string, value: any): void {
    switch (key) {
      case 'cameraDistance':
        this.config.cameraDistance = value;
        break;
      case 'cameraFOV':
        this.config.cameraFOV = value;
        const cameraComp = this.entity.components.get('camera');
        if (cameraComp) cameraComp.data.fov = value;
        break;
      case 'invertY':
        this.config.invertY = value;
        break;
      case 'sensitivity':
        this.config.cameraSensitivity = value;
        break;
      case 'keyBindings':
        this.rebindKeys(value);
        break;
    }
  }

  private rebindKeys(bindings: Record<string, string>): void {
    // Re-register actions with new keys
    Object.entries(bindings).forEach(([action, key]) => {
      // Implementation would re-register input actions
    });
  }

  // Animation callbacks
  onAnimationEvent(event: string): void {
    eventBus.emit(GameEvents.PLAYER_INTERACT, { 
      type: 'animation', 
      event 
    });
  }

  destroy(): void {
    // Cleanup
  }
}

export { PlayerController, DEFAULT_CONFIG, Vec3 };