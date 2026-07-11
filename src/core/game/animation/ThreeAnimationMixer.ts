import * as THREE from 'three';
import { gsap } from 'gsap';
import { AnimationMixer as GSAPAnimationMixer, AnimationState } from './AnimationMixer';

export interface KeyframeTrack {
  name: string;
  times: number[];
  values: number[];
  interpolation?: THREE.InterpolationModes;
}

export interface MorphTargetTrack {
  name: string;
  times: number[];
  values: number[];
}

export interface AnimationClipData {
  name: string;
  duration: number;
  tracks: KeyframeTrack[];
  morphTargets?: MorphTargetTrack[];
}

export class ThreeAnimationMixer {
  private mixer: THREE.AnimationMixer | null = null;
  private actions = new Map<string, THREE.AnimationAction>();
  private clips = new Map<string, THREE.AnimationClip>();
  private gsapMixer: GSAPAnimationMixer;

  constructor(private object: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(object);
    this.gsapMixer = new GSAPAnimationMixer();
  }

  // Load clip from glTF or create procedurally
  addClip(clip: THREE.AnimationClip): void {
    this.clips.set(clip.name, clip);
  }

  addClips(clips: THREE.AnimationClip[]): void {
    clips.forEach((clip) => this.clips.set(clip.name, clip));
  }

  // Play animation by name
  play(name: string, options?: {
    loop?: THREE.LoopMode;
    clampWhenFinished?: boolean;
    weight?: number;
    fadeIn?: number;
    timeScale?: number;
    repetitions?: number;
  }): THREE.AnimationAction | null {
    const clip = this.clips.get(name);
    if (!clip) {
      console.warn(`Animation clip "${name}" not found`);
      return null;
    }

    const existingAction = this.actions.get(name);
    if (existingAction) {
      existingAction.stop();
    }

    const action = this.mixer!.clipAction(clip);
    
    if (options?.loop !== undefined) action.loop = options.loop;
    if (options?.clampWhenFinished !== undefined) action.clampWhenFinished = options.clampWhenFinished;
    if (options?.weight !== undefined) action.setEffectiveWeight(options.weight);
    if (options?.timeScale !== undefined) action.timeScale = options.timeScale;
    if (options?.repetitions !== undefined) action.repetitions = options.repetitions;

    if (options?.fadeIn && options.fadeIn > 0) {
      action.fadeIn(options.fadeIn).play();
    } else {
      action.play();
    }

    this.actions.set(name, action);
    return action;
  }

  crossFadeFrom(name: string, fromName: string, duration: number = 0.5): void {
    const fromAction = this.actions.get(fromName);
    const toAction = this.actions.get(name);
    if (fromAction && toAction) {
      fromAction.crossFadeTo(toAction, duration, true);
    }
  }

  stop(name: string, fadeOut: number = 0): void {
    const action = this.actions.get(name);
    if (action) {
      if (fadeOut > 0) {
        action.fadeOut(fadeOut);
      } else {
        action.stop();
      }
      this.actions.delete(name);
    }
  }

  stopAll(fadeOut: number = 0): void {
    this.actions.forEach((action, name) => this.stop(name, fadeOut));
  }

  // GSAP-driven property animations
  animateProperty(
    target: THREE.Object3D | THREE.Material | any,
    property: string,
    toValue: number | number[],
    options: {
      duration?: number;
      ease?: string;
      delay?: number;
      onUpdate?: (value: number) => void;
      onComplete?: () => void;
    } = {}
  ): gsap.core.Tween {
    const duration = options.duration ?? 1;
    const ease = options.ease ?? 'power2.out';
    const delay = options.delay ?? 0;

    if (Array.isArray(toValue)) {
      // Vector/Color animation
      return gsap.to(target[property], {
        x: toValue[0],
        y: toValue[1],
        z: toValue[2],
        w: toValue[3],
        duration: options.duration,
        ease: options.ease,
        delay: options.delay,
        onUpdate: options.onUpdate,
        onComplete: options.onComplete,
      });
    } else {
      return gsap.to(target, {
        [property]: toValue,
        duration: options.duration,
        ease: options.ease,
        delay: options.delay,
        onUpdate: options.onUpdate,
        onComplete: options.onComplete,
      });
    }
  }

  // Morph target animation
  animateMorphTarget(mesh: THREE.Mesh, targetName: string, targetValue: number, options: {
    duration?: number;
    ease?: string;
    delay?: number;
  } = {}): gsap.core.Tween | null {
    const morphIndex = mesh.morphTargetDictionary?.[targetName];
    if (morphIndex === undefined) {
      console.warn(`Morph target "${targetName}" not found`);
      return null;
    }

    return gsap.to(mesh.morphTargetInfluences, {
      [morphIndex]: targetValue,
      duration: options.duration ?? 1,
      ease: options.ease ?? 'power2.out',
      delay: options.delay ?? 0,
    });
  }

  // Camera animation
  animateCamera(camera: THREE.Camera, options: {
    position?: THREE.Vector3;
    target?: THREE.Vector3;
    fov?: number;
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  }): gsap.core.Tween {
    const duration = options.duration ?? 2;
    const ease = options.ease ?? 'power2.inOut';

    const timeline = gsap.timeline({ onComplete: options.onComplete });

    if (options.position) {
      timeline.to(camera.position, {
        x: options.position.x,
        y: options.position.y,
        z: options.position.z,
        duration,
        ease,
      }, 0);
    }

    if (options.target && 'lookAt' in camera) {
      // For cameras with controls
      timeline.to({}, {
        duration,
        ease,
        onUpdate: () => {
          // Camera will look at target
        }
      }, 0);
    }

    if (options.fov !== undefined) {
      timeline.to(camera, {
        fov: options.fov,
        duration,
        ease,
        onUpdate: () => camera.updateProjectionMatrix(),
      }, 0);
    }

    return timeline;
  }

  // Particle system animation
  animateParticles(particles: THREE.Points, options: {
    position?: { x?: number; y?: number; z?: number };
    scale?: number;
    opacity?: number;
    color?: THREE.Color;
    rotation?: { x?: number; y?: number; z?: number };
    duration?: number;
    ease?: string;
    stagger?: number;
    onComplete?: () => void;
  }): gsap.core.Timeline {
    const geometry = particles.geometry;
    const positions = geometry.attributes.position;
    const count = positions.count;

    const timeline = gsap.timeline({ onComplete: options.onComplete });

    if (options.position) {
      // Animate all particles to a position
      for (let i = 0; i < count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        timeline.to({ x, y, z }, {
          x: options.position.x ?? x,
          y: options.position.y ?? y,
          z: options.position.z ?? z,
          duration: options.duration ?? 2,
          ease: options.ease ?? 'power2.out',
          stagger: options.stagger ?? 0.01,
          onUpdate: () => {
            positions.setX(i, x);
            positions.setY(i, y);
            positions.setZ(i, z);
          },
        }, 0);
      }
      positions.needsUpdate = true;
    }

    if (options.scale !== undefined) {
      timeline.to(particles.scale, {
        x: options.scale,
        y: options.scale,
        z: options.scale,
        duration: options.duration ?? 1,
        ease: options.ease ?? 'power2.out',
      }, 0);
    }

    if (options.opacity !== undefined) {
      const material = particles.material as THREE.PointsMaterial;
      timeline.to(material, {
        opacity: options.opacity,
        duration: options.duration ?? 1,
        ease: options.ease ?? 'power2.out',
      }, 0);
    }

    if (options.color) {
      const material = particles.material as THREE.PointsMaterial;
      const color = new THREE.Color();
      timeline.to(material.color, {
        r: options.color.r,
        g: options.color.g,
        b: options.color.b,
        duration: options.duration ?? 1,
        ease: options.ease ?? 'power2.out',
        onUpdate: () => material.color.setRGB(color.r, color.g, color.b),
      }, 0);
    }

    return timeline;
  }

  // Update mixer (call in render loop)
  update(deltaTime: number): void {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  // Get action state
  getAction(name: string): THREE.AnimationAction | undefined {
    return this.actions.get(name);
  }

  isPlaying(name: string): boolean {
    const action = this.actions.get(name);
    return action?.isRunning() ?? false;
  }

  // Cleanup
  dispose(): void {
    this.stopAll(0);
    this.actions.clear();
    this.clips.clear();
    if (this.mixer) {
      this.mixer.uncacheRoot(this.object);
      this.mixer = null;
    }
  }
}

// GSAP helper for Three.js objects
export const ThreeGSAP = {
  // Animate object position
  moveTo(object: THREE.Object3D, position: THREE.Vector3, options: {
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}): gsap.core.Tween {
    return gsap.to(object.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: options.duration ?? 1,
      ease: options.ease ?? 'power2.out',
      onComplete: options.onComplete,
    });
  },

  // Rotate object
  rotateTo(object: THREE.Object3D, rotation: THREE.Euler | THREE.Vector3, options: {
    duration?: number;
    ease?: string;
    useQuaternion?: boolean;
    onComplete?: () => void;
  } = {}): gsap.core.Tween {
    if (options.useQuaternion) {
      const quat = new THREE.Quaternion().setFromEuler(
        rotation instanceof THREE.Euler ? rotation : new THREE.Euler().setFromVector3(rotation)
      );
      return gsap.to(object.quaternion, {
        x: quat.x,
        y: quat.y,
        z: quat.z,
        w: quat.w,
        duration: options.duration ?? 1,
        ease: options.ease ?? 'power2.out',
      });
    }
    return gsap.to(object.rotation, {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z,
      duration: options.duration ?? 1,
      ease: options.ease ?? 'power2.out',
    });
  },

  // Scale object
  scaleTo(object: THREE.Object3D, scale: number | THREE.Vector3, options: {
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}): gsap.core.Tween {
    const targetScale = typeof scale === 'number' 
      ? { x: scale, y: scale, z: scale } 
      : { x: scale.x, y: scale.y, z: scale.z };
    
    return gsap.to(object.scale, {
      ...targetScale,
      duration: options.duration ?? 1,
      ease: options.ease ?? 'power2.out',
    });
  },

  // Fade material
  fadeMaterial(material: THREE.Material, opacity: number, options: {
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}): gsap.core.Tween {
    if (!material.transparent) {
      material.transparent = true;
    }
    return gsap.to(material, {
      opacity: opacity,
      duration: options.duration ?? 0.5,
      ease: options.ease ?? 'power2.out',
      onComplete: options.onComplete,
    });
  },

  // Animate color
  colorTo(material: THREE.Material, color: THREE.Color | number | string, options: {
    duration?: number;
    ease?: string;
    property?: string;
  } = {}): gsap.core.Tween {
    const targetColor = new THREE.Color(color);
    const property = options.property ?? 'color';
    
    return gsap.to(material, {
      [property]: targetColor.getHex(),
      duration: options.duration ?? 1,
      ease: options.ease ?? 'power2.out',
      onUpdate: () => {
        if (material[property] instanceof THREE.Color) {
          material[property].setHex((material as any)[property]);
        }
      },
    });
  },

  // Pulse animation
  pulse(object: THREE.Object3D, options: {
    scale?: number;
    duration?: number;
    repeat?: number;
    yoyo?: boolean;
    ease?: string;
  } = {}): gsap.core.Tween {
    const targetScale = options.scale ?? 1.2;
    return gsap.to(object.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: options.duration ?? 0.5,
      ease: options.ease ?? 'power2.inOut',
      repeat: options.repeat ?? -1,
      yoyo: options.yoyo ?? true,
    });
  },

  // Shake animation
  shake(object: THREE.Object3D, options: {
    intensity?: number;
    duration?: number;
    axis?: 'x' | 'y' | 'z' | 'all';
  } = {}): gsap.core.Timeline {
    const intensity = options.intensity ?? 0.1;
    const duration = options.duration ?? 0.5;
    const axis = options.axis ?? 'all';
    
    const timeline = gsap.timeline();
    const shakes = Math.ceil(duration / 0.05);
    
    for (let i = 0; i < shakes; i++) {
      const offset = (Math.random() - 0.5) * intensity * 2;
      const vars: any = { duration: 0.05, ease: 'rough({strength: 3, points: 10, template: none, taper: out, randomize: true})' };
      
      if (axis === 'x' || axis === 'all') vars.x = `+=${offset}`;
      if (axis === 'y' || axis === 'all') vars.y = `+=${offset}`;
      if (axis === 'z' || axis === 'all') vars.z = `+=${offset}`;
      
      timeline.to({ x: 0, y: 0, z: 0 }, vars, i * 0.05);
    }
    
    return timeline;
  },
};

export { GSAPAnimationMixer } from './AnimationMixer';