import { eventBus, GameEvents } from './EventBus';

export interface InputAction {
  id: string;
  keys: string[];
  gamepadButtons?: number[];
  gamepadAxes?: { axis: number; threshold: number; direction: 1 | -1 }[];
  type: 'digital' | 'analog';
}

export interface InputState {
  actions: Map<string, { pressed: boolean; value: number }>;
  mouse: { x: number; y: number; deltaX: number; deltaY: number; buttons: number };
  gamepads: Gamepad[];
}

const DEFAULT_ACTIONS: InputAction[] = [
  { id: 'move_forward', keys: ['KeyW', 'ArrowUp'], type: 'digital' },
  { id: 'move_backward', keys: ['KeyS', 'ArrowDown'], type: 'digital' },
  { id: 'move_left', keys: ['KeyA', 'ArrowLeft'], type: 'digital' },
  { id: 'move_right', keys: ['KeyD', 'ArrowRight'], type: 'digital' },
  { id: 'run', keys: ['ShiftLeft', 'ShiftRight'], type: 'digital' },
  { id: 'jump', keys: ['Space'], type: 'digital' },
  { id: 'interact', keys: ['KeyE'], type: 'digital' },
  { id: 'camera_left', keys: [], gamepadAxes: [{ axis: 0, threshold: 0.1, direction: -1 }], type: 'analog' },
  { id: 'camera_right', keys: [], gamepadAxes: [{ axis: 0, threshold: 0.1, direction: 1 }], type: 'analog' },
  { id: 'camera_up', keys: [], gamepadAxes: [{ axis: 1, threshold: 0.1, direction: -1 }], type: 'analog' },
  { id: 'camera_down', keys: [], gamepadAxes: [{ axis: 1, threshold: 0.1, direction: 1 }], type: 'analog' },
];

class InputManager {
  private actions = new Map<string, InputAction>();
  private keyState = new Map<string, boolean>();
  private actionState = new Map<string, { pressed: boolean; value: number }>();
  private mouse = { x: 0, y: 0, deltaX: 0, deltaY: 0, buttons: 0 };
  private pointerLocked = false;
  private gamepadIndex = -1;
  private rafId: number | null = null;
  private lastGamepadState: Gamepad[] = [];

  constructor() {
    this.registerDefaults();
    this.bindEvents();
  }

  private registerDefaults(): void {
    DEFAULT_ACTIONS.forEach(action => this.registerAction(action));
  }

  registerAction(action: InputAction): void {
    this.actions.set(action.id, action);
    this.actionState.set(action.id, { pressed: false, value: 0 });
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    window.addEventListener('blur', this.onBlur);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keyState.set(e.code, true);
    this.updateActions();
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keyState.set(e.code, false);
    this.updateActions();
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.pointerLocked) {
      this.mouse.deltaX = e.movementX;
      this.mouse.deltaY = e.movementY;
    }
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  };

  private onMouseDown = (e: MouseEvent): void => {
    this.mouse.buttons |= (1 << e.button);
    if (e.button === 0 && !this.pointerLocked) {
      this.requestPointerLock();
    }
  };

  private onMouseUp = (e: MouseEvent): void => {
    this.mouse.buttons &= ~(1 << e.button);
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    eventBus.emit(GameEvents.PLAYER_INTERACT, { type: 'wheel', delta: e.deltaY });
  };

  private onGamepadConnected = (e: GamepadEvent): void => {
    console.log('[InputManager] Gamepad connected:', e.gamepad.id);
    this.gamepadIndex = e.gamepad.index;
  };

  private onGamepadDisconnected = (e: GamepadEvent): void => {
    console.log('[InputManager] Gamepad disconnected:', e.gamepad.id);
    if (this.gamepadIndex === e.gamepad.index) {
      this.gamepadIndex = -1;
    }
  };

  private onBlur = (): void => {
    this.keyState.clear();
    this.updateActions();
    if (this.pointerLocked) {
      document.exitPointerLock();
    }
  };

  private updateActions(): void {
    this.actions.forEach((action, id) => {
      let pressed = false;
      let value = 0;

      if (action.type === 'digital') {
        pressed = action.keys.some(key => this.keyState.get(key) === true);
        value = pressed ? 1 : 0;
      } else if (action.type === 'analog' && action.gamepadAxes) {
        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        if (gamepad) {
          action.gamepadAxes.forEach(axisConfig => {
            const axisValue = gamepad.axes[axisConfig.axis] || 0;
            if (Math.abs(axisValue) >= axisConfig.threshold) {
              const dirValue = axisValue * axisConfig.direction;
              if (dirValue > 0) {
                pressed = true;
                value = Math.max(value, dirValue);
              }
            }
          });
        }
      }

      const currentState = this.actionState.get(id)!;
      if (currentState.pressed !== pressed) {
        if (pressed) {
          eventBus.emit(GameEvents.PLAYER_INTERACT, { action: id, type: 'press' });
        } else {
          eventBus.emit(GameEvents.PLAYER_INTERACT, { action: id, type: 'release' });
        }
      }
      
      currentState.pressed = pressed;
      currentState.value = value;
    });
  }

  requestPointerLock(): void {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.requestPointerLock();
    }
  }

  exitPointerLock(): void {
    document.exitPointerLock();
  }

  onPointerLockChange = (): void => {
    this.pointerLocked = document.pointerLockElement === document.querySelector('canvas');
  };

  getActionValue(actionId: string): number {
    return this.actionState.get(actionId)?.value || 0;
  }

  isActionPressed(actionId: string): boolean {
    return this.actionState.get(actionId)?.pressed || false;
  }

  getMovementVector(): { x: number; z: number } {
    const forward = this.getActionValue('move_forward');
    const backward = this.getActionValue('move_backward');
    const left = this.getActionValue('move_left');
    const right = this.getActionValue('move_right');
    
    return {
      x: right - left,
      z: backward - forward,
    };
  }

  getCameraDelta(): { x: number; y: number } {
    const delta = { x: this.mouse.deltaX, y: this.mouse.deltaY };
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    return delta;
  }

  update(): void {
    if (this.gamepadIndex >= 0) {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[this.gamepadIndex];
      if (gamepad) {
        this.lastGamepadState[this.gamepadIndex] = gamepad;
      }
    }
    this.updateActions();
  }

  start(): void {
    if (this.rafId) return;
    const loop = (): void => {
      this.update();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy(): void {
    this.stop();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
  }
}

export const inputManager = new InputManager();