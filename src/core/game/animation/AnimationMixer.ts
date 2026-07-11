import { gsap } from 'gsap';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { Vector3, Euler, Quaternion, Mesh, Group, Object3D } from 'three';

export interface AnimationClip {
  name: string;
  duration: number;
  loop: boolean;
  easing?: string;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

export interface AnimationState {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
}

export class AnimationMixer {
  private animations = new Map<string, AnimationClip>();
  private activeAnimations = new Map<string, gsap.core.Timeline>();
  private globalTimeline: gsap.core.Timeline;
  private timeScale = 1;
  private isPaused = false;

  constructor() {
    this.globalTimeline = gsap.timeline({ paused: true });
    this.globalTimeline.timeScale(1);
  }

  registerAnimation(clip: AnimationClip): void {
    this.animations.set(clip.name, clip);
  }

  play(name: string, options?: { delay?: number; timeScale?: number; onComplete?: () => void }): gsap.core.Timeline | null {
    const clip = this.animations.get(name);
    if (!clip) {
      console.warn(`Animation "${name}" not found`);
      return null;
    }

    const existing = this.activeAnimations.get(name);
    if (existing) {
      existing.kill();
    }

    const timeline = gsap.timeline({
      paused: false,
      onStart: clip.onStart,
      onUpdate: () => clip.onUpdate?.(timeline.progress()),
      onComplete: () => {
        this.activeAnimations.delete(name);
        clip.onComplete?.();
        options?.onComplete?.();
      },
    });

    if (clip.duration > 0) {
      timeline.duration(clip.duration);
    }

    if (clip.loop) {
      timeline.repeat(-1);
    }

    if (options?.timeScale) {
      timeline.timeScale(options.timeScale);
    }

    if (options?.delay) {
      timeline.delay(options.delay);
    }

    this.activeAnimations.set(name, timeline);
    return timeline;
  }

  stop(name: string): void {
    const timeline = this.activeAnimations.get(name);
    if (timeline) {
      timeline.kill();
      this.activeAnimations.delete(name);
    }
  }

  stopAll(): void {
    this.activeAnimations.forEach((timeline) => timeline.kill());
    this.activeAnimations.clear();
  }

  pause(name?: string): void {
    if (name) {
      const timeline = this.activeAnimations.get(name);
      timeline?.pause();
    } else {
      this.activeAnimations.forEach((tl) => tl.pause());
    }
  }

  resume(name?: string): void {
    if (name) {
      const timeline = this.activeAnimations.get(name);
      timeline?.resume();
    } else {
      this.activeAnimations.forEach((tl) => tl.resume());
    }
  }

  setTimeScale(scale: number): void {
    this.timeScale = scale;
    this.activeAnimations.forEach((tl) => tl.timeScale(scale));
  }

  getState(name: string): AnimationState | null {
    const timeline = this.activeAnimations.get(name);
    if (!timeline) return null;
    return {
      isPlaying: !timeline.paused(),
      progress: timeline.progress(),
      currentTime: timeline.time(),
      duration: timeline.duration(),
    };
  }

  to(
    target: any,
    vars: gsap.TweenVars,
    options?: { duration?: number; ease?: string; delay?: number }
  ): gsap.core.Tween {
    return gsap.to(target, {
      ...vars,
      duration: options?.duration ?? 1,
      ease: options?.ease ?? 'power2.out',
      delay: options?.delay ?? 0,
    });
  }

  from(
    target: any,
    vars: gsap.TweenVars,
    options?: { duration?: number; ease?: string; delay?: number }
  ): gsap.core.Tween {
    return gsap.from(target, {
      ...vars,
      duration: options?.duration ?? 1,
      ease: options?.ease ?? 'power2.out',
      delay: options?.delay ?? 0,
    });
  }

  fromTo(
    target: any,
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars,
    options?: { duration?: number; ease?: string; delay?: number }
  ): gsap.core.Tween {
    return gsap.fromTo(target, fromVars, {
      ...toVars,
      duration: options?.duration ?? 1,
      ease: options?.ease ?? 'power2.out',
      delay: options?.delay ?? 0,
    });
  }

  timeline(): gsap.core.Timeline {
    return gsap.timeline();
  }

  killTweensOf(target: any): void {
    gsap.killTweensOf(target);
  }

  destroy(): void {
    this.stopAll();
    this.animations.clear();
  }
}

export const animationMixer = new AnimationMixer();

// React hook for GSAP animations in R3F components
export function useGSAPAnimation(
  target: Object3D | null,
  animation: {
    name: string;
    properties: gsap.TweenVars;
    duration?: number;
    ease?: string;
    delay?: number;
    loop?: boolean;
    yoyo?: boolean;
    onComplete?: () => void;
  } | null,
  deps: any[] = []
) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!target || !animation) return;

    const tl = gsap.timeline({
      repeat: animation.loop ? -1 : 0,
      yoyo: animation.yoyo ?? false,
      onComplete: animation.onComplete,
    });

    tl.to(target, {
      ...animation.properties,
      duration: animation.duration ?? 1,
      ease: animation.ease ?? 'power2.out',
      delay: animation.delay ?? 0,
    });

    if (animation.loop) {
      tl.repeat(-1);
    }

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, deps);

  return timelineRef;
}

// Hook for smooth value interpolation using GSAP
export function useSmoothValue(initialValue: number, duration = 0.3, ease = 'power2.out') {
  const valueRef = useRef(initialValue);
  const targetRef = useRef(initialValue);

  const setValue = (value: number, options?: { duration?: number; ease?: string }) => {
    targetRef.current = value;
    gsap.to(valueRef, {
      current: value,
      duration: options?.duration ?? duration,
      ease: options?.ease ?? ease,
    });
  };

  const getValue = () => valueRef.current;

  return { valueRef, targetRef, setValue, getValue };
}

// Spring physics using GSAP
export function useSpring(
  target: Object3D,
  config: {
    stiffness?: number;
    damping?: number;
    mass?: number;
    velocity?: Vector3;
  } = {}
) {
  const { stiffness = 100, damping = 10, mass = 1 } = config;
  const velocityRef = useRef(new Vector3());
  const targetRef = useRef(new Vector3());

  useFrame((state, delta) => {
    if (!target) return;

    const displacement = new Vector3().subVectors(targetRef.current, target.position);
    const force = displacement.multiplyScalar(stiffness / mass);
    const dampingForce = velocityRef.current.clone().multiplyScalar(-damping / mass);
    
    velocityRef.current.add(force.add(dampingForce).multiplyScalar(state.delta));
    target.position.add(velocityRef.current.clone().multiplyScalar(state.delta));
  });

  return { targetRef, velocityRef };
}

// Cape/cloth simulation with GSAP
export function useCapePhysics(
  capeMesh: Mesh | null,
  rootBone: Object3D,
  config: {
    segments?: number;
    gravity?: number;
    stiffness?: number;
    damping?: number;
  } = {}
) {
  const { segments = 8, gravity = -9.8, stiffness = 0.1, damping = 0.98 } = config;
  const pointsRef = useRef<Vector3[]>([]);

  useEffect(() => {
    if (!capeMesh) return;

    // Initialize cape points
    const geometry = capeMesh.geometry;
    const position = geometry.getAttribute('position');
    const count = position.count;

    pointsRef.current = [];
    for (let i = 0; i < count; i++) {
      const v = new Vector3();
      v.fromBufferAttribute(position, i);
      pointsRef.current.push(v.clone());
    }
  }, [capeMesh]);

  useFrame((state, delta) => {
    if (!capeMesh || !rootBone) return;

    // Simple wind simulation using GSAP
    const windStrength = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    
    const geometry = capeMesh.geometry;
    const position = geometry.getAttribute('position');
    
    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i);
      const wave = Math.sin(y * 5 + state.clock.getElapsedTime() * 3) * 0.02;
      position.setX(i, position.getX(i) + wave + windStrength * delta);
    }
    
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });
}

// GSAP-based particle system
export function useParticleSystem(
  particleCount: number,
  config: {
    spawnRate?: number;
    lifetime?: number;
    size?: number;
    color?: string;
    velocity?: Vector3;
    gravity?: number;
  } = {}
) {
  const { spawnRate = 10, lifetime = 3, size = 0.1, color = '#ffffff', velocity = new Vector3(0, 1, 0), gravity = -9.8 } = config;
  const particlesRef = useRef<{ position: Vector3; velocity: Vector3; life: number; age: number }[]>([]);
  const spawnTimerRef = useRef(0);

  useFrame((state, delta) => {
    spawnTimerRef.current += delta;
    
    // Spawn new particles
    while (spawnTimerRef.current >= 1 / spawnRate && particlesRef.current.length < particleCount) {
      particlesRef.current.push({
        position: new Vector3(
          (Math.random() - 0.5) * 2,
          0,
          (Math.random() - 0.5) * 2
        ),
        velocity: velocity.clone().add(new Vector3(
          (Math.random() - 0.5) * 0.5,
          0,
          (Math.random() - 0.5) * 0.5
        )),
        life: lifetime * (0.5 + Math.random() * 0.5),
        age: 0,
      });
      spawnTimerRef.current -= 1 / spawnRate;
    }

    // Update particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.age += delta;
      p.velocity.y += gravity * delta;
      p.position.add(p.velocity.clone().multiplyScalar(delta));
      return p.age < p.life;
    });
  });

  return particlesRef;
}

// Page transition animations with GSAP
export function usePageTransition(
  onEnter: () => void,
  onLeave: () => void,
  duration = 0.5
) {
  const isTransitioning = useRef(false);

  const enter = () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    
    const tl = gsap.timeline({
      onComplete: () => {
        onEnter();
        isTransitioning.current = false;
      },
    });

    tl.fromTo('body', 
      { opacity: 0 },
      { opacity: 1, duration, ease: 'power2.out' }
    );
  };

  const leave = () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    
    const tl = gsap.timeline({
      onComplete: () => {
        onLeave();
        isTransitioning.current = false;
      },
    });

    tl.to('body', {
      opacity: 0,
      duration,
      ease: 'power2.in',
    });
  };

  return { enter, leave, isTransitioning: isTransitioning.current };
}

export function useScrollAnimation(
  target: Object3D,
  config: {
    trigger?: 'scroll' | 'mouse';
    axis?: 'x' | 'y' | 'z';
    range?: [number, number];
    speed?: number;
  } = {}
) {
  const { axis = 'y', range = [-10, 10], speed = 1 } = config;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      const value = gsap.utils.mapRange(0, 1, range[0], range[1], progress);
      
      gsap.to(target.position, {
        [axis]: value,
        duration: 1 / speed,
        ease: 'power2.out',
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}