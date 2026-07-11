import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ThreeGSAP } from '../../core/game/animation/ThreeAnimationMixer';

gsap.registerPlugin(ScrollTrigger);

// Global animation configuration
export const AnimationConfig = {
  duration: {
    fast: 0.2,
    normal: 0.4,
    slow: 0.8,
  },
  ease: {
    smooth: 'power2.out',
    bounce: 'back.out(1.7)',
    elastic: 'elastic.out(1, 0.5)',
    sharp: 'power3.inOut',
  },
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.2,
  },
};

// UI Animation Helpers
export const UIAnimations = {
  // Fade in element
  fadeIn(element: HTMLElement | string, options: {
    duration?: number;
    delay?: number;
    ease?: string;
    y?: number;
    x?: number;
    scale?: number;
    onComplete?: () => void;
  } = {}) {
    return gsap.fromTo(element,
      { opacity: 0, y: options.y ?? 20, x: options.x ?? 0, scale: options.scale ?? 1 },
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration: options.duration ?? AnimationConfig.duration.normal,
        delay: options.delay ?? 0,
        ease: options.ease ?? AnimationConfig.ease.smooth,
        onComplete: options.onComplete,
      }
    );
  },

  // Fade out element
  fadeOut(element: HTMLElement | string, options: {
    duration?: number;
    delay?: number;
    ease?: string;
    y?: number;
    onComplete?: () => void;
  } = {}) {
    return gsap.to(element, {
      opacity: 0,
      y: options.y ?? -20,
      duration: options.duration ?? AnimationConfig.duration.fast,
      delay: options.delay ?? 0,
      ease: options.ease ?? AnimationConfig.ease.smooth,
      onComplete: options.onComplete,
    });
  },

  // Slide in from direction
  slideIn(element: HTMLElement | string, direction: 'left' | 'right' | 'up' | 'down', options: {
    duration?: number;
    delay?: number;
    ease?: string;
    distance?: number;
    onComplete?: () => void;
  } = {}) {
    const distance = options.distance ?? 100;
    const fromVars: any = { opacity: 0 };
    
    switch (direction) {
      case 'left': fromVars.x = -distance; break;
      case 'right': fromVars.x = distance; break;
      case 'up': fromVars.y = -distance; break;
      case 'down': fromVars.y = distance; break;
    }

    return gsap.fromTo(element, fromVars, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: options.duration ?? AnimationConfig.duration.normal,
      delay: options.delay ?? 0,
      ease: options.ease ?? AnimationConfig.ease.smooth,
      onComplete: options.onComplete,
    });
  },

  // Scale animation
  scaleIn(element: HTMLElement | string, options: {
    duration?: number;
    delay?: number;
    ease?: string;
    fromScale?: number;
    onComplete?: () => void;
  } = {}) {
    return gsap.fromTo(element,
      { scale: options.fromScale ?? 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: options.duration ?? AnimationConfig.duration.normal,
        delay: options.delay ?? 0,
        ease: options.ease ?? AnimationConfig.ease.bounce,
        onComplete: options.onComplete,
      }
    );
  },

  // Stagger multiple elements
  staggerIn(elements: HTMLElement[] | string, options: {
    duration?: number;
    stagger?: number;
    ease?: string;
    fromVars?: any;
    toVars?: any;
    onComplete?: () => void;
  } = {}) {
    return gsap.fromTo(elements,
      options.fromVars ?? { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: options.duration ?? AnimationConfig.duration.normal,
        stagger: options.stagger ?? AnimationConfig.stagger.normal,
        ease: options.ease ?? AnimationConfig.ease.smooth,
        ...options.toVars,
        onComplete: options.onComplete,
      }
    );
  },

  // Pulse animation
  pulse(element: HTMLElement | string, options: {
    scale?: number;
    duration?: number;
    repeat?: number;
    ease?: string;
  } = {}) {
    return gsap.to(element, {
      scale: options.scale ?? 1.1,
      duration: options.duration ?? 0.5,
      repeat: options.repeat ?? -1,
      yoyo: true,
      ease: options.ease ?? 'power2.inOut',
    });
  },

  // Shake animation
  shake(element: HTMLElement | string, options: {
    intensity?: number;
    duration?: number;
    axis?: 'x' | 'y' | 'both';
  } = {}) {
    const intensity = options.intensity ?? 10;
    const duration = options.duration ?? 0.5;
    const axis = options.axis ?? 'both';
    
    const timeline = gsap.timeline();
    const shakes = Math.ceil(duration / 0.05);
    
    for (let i = 0; i < shakes; i++) {
      const vars: any = { duration: 0.05, ease: 'rough({strength: 3, points: 10, template: none, taper: out, randomize: true})' };
      if (axis === 'x' || axis === 'both') vars.x = `+=${(Math.random() - 0.5) * intensity * 2}`;
      if (axis === 'y' || axis === 'both') vars.y = `+=${(Math.random() - 0.5) * intensity * 2}`;
      
      timeline.to({}, vars, i * 0.05);
    }
    
    return timeline;
  },

  // Morph between values
  morph(element: HTMLElement | string, property: string, toValue: any, options: {
    duration?: number;
    ease?: string;
    onUpdate?: (value: any) => void;
    onComplete?: () => void;
  } = {}) {
    return gsap.to(element, {
      [property]: toValue,
      duration: options.duration ?? AnimationConfig.duration.normal,
      ease: options.ease ?? AnimationConfig.ease.smooth,
      onUpdate: options.onUpdate,
      onComplete: options.onComplete,
    });
  },

  // Timeline for complex sequences
  createTimeline(options: {
    defaults?: gsap.TweenVars;
    onComplete?: () => void;
    onUpdate?: () => void;
  } = {}) {
    return gsap.timeline({
      defaults: options.defaults,
      onComplete: options.onComplete,
      onUpdate: options.onUpdate,
    });
  },
};

// Scroll-triggered animations
export const ScrollAnimations = {
  // Reveal on scroll
  revealOnScroll(elements: HTMLElement[] | string, options: {
    trigger?: HTMLElement | string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
    onEnter?: () => void;
    onLeave?: () => void;
    onEnterBack?: () => void;
    onLeaveBack?: () => void;
  } = {}) {
    return gsap.fromTo(elements,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: options.trigger ?? elements[0],
          start: options.start ?? 'top 80%',
          end: options.end ?? 'bottom 20%',
          scrub: options.scrub ?? false,
          markers: options.markers ?? false,
          onEnter: options.onEnter,
          onLeave: options.onLeave,
          onEnterBack: options.onEnterBack,
          onLeaveBack: options.onLeaveBack,
        },
      }
    );
  },

  // Pin element during scroll
  pin(element: HTMLElement | string, options: {
    start?: string;
    end?: string;
    pinSpacing?: boolean;
    markers?: boolean;
  } = {}) {
    return ScrollTrigger.create({
      trigger: element,
      start: options.start ?? 'top top',
      end: options.end ?? '+=500',
      pin: true,
      pinSpacing: options.pinSpacing ?? true,
      markers: options.markers ?? false,
    });
  },

  // Parallax effect
  parallax(element: HTMLElement | string, options: {
    speed?: number;
    start?: string;
    end?: string;
  } = {}) {
    return gsap.to(element, {
      yPercent: -50 * (options.speed ?? 1),
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: options.start ?? 'top bottom',
        end: options.end ?? 'bottom top',
        scrub: true,
      },
    });
  },
};

// Game-specific animations
export const GameAnimations = {
  // Player level up
  levelUp(element: HTMLElement | string) {
    return gsap.timeline()
      .to(element, { scale: 1.5, duration: 0.2, ease: 'back.out(3)' })
      .to(element, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' })
      .to(element, { rotation: 360, duration: 0.5, ease: 'power2.out' }, '<');
  },

  // Quest complete
  questComplete(element: HTMLElement | string) {
    return gsap.timeline()
      .to(element, { scale: 1.2, rotation: -10, duration: 0.15, ease: 'back.out(2)' })
      .to(element, { scale: 1, rotation: 0, duration: 0.3, ease: 'elastic.out(1, 0.5)' })
      .to(element, { y: -20, opacity: 0, duration: 0.5, ease: 'power2.out' }, '+=0.5');
  },

  // Item pickup
  itemPickup(element: HTMLElement | string) {
    return gsap.timeline()
      .to(element, { scale: 0, rotation: 180, duration: 0.2, ease: 'power2.in' })
      .to(element, { scale: 1.3, rotation: 0, duration: 0.2, ease: 'back.out(2)' })
      .to(element, { scale: 1, duration: 0.2, ease: 'power2.out' });
  },

  // Damage flash
  damageFlash(element: HTMLElement | string, color: string = '#ff0000') {
    return gsap.timeline()
      .to(element, { 
        filter: `drop-shadow(0 0 10px ${color})`, 
        duration: 0.05 
      })
      .to(element, { 
        filter: 'none', 
        duration: 0.2,
        ease: 'power2.out'
      });
  },

  // Heal flash
  healFlash(element: HTMLElement | string) {
    return gsap.timeline()
      .to(element, { 
        filter: 'drop-shadow(0 0 15px #00ff00)', 
        duration: 0.1 
      })
      .to(element, { 
        filter: 'none', 
        duration: 0.3,
        ease: 'power2.out'
      });
  },

  // Coin/item collect
  collectItem(element: HTMLElement | string) {
    return gsap.timeline()
      .to(element, { 
        y: -50, 
        scale: 1.5, 
        rotation: 360, 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power2.out' 
      });
  },

  // Dialogue appear
  dialogueAppear(element: HTMLElement | string) {
    return gsap.fromTo(element,
      { opacity: 0, scale: 0.8, y: 20 },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 0.3, 
        ease: 'back.out(1.7)' 
      }
    );
  },

  // Notification toast
  toastIn(element: HTMLElement | string) {
    return gsap.fromTo(element,
      { opacity: 0, x: 400, scale: 0.9 },
      { 
        opacity: 1, 
        x: 0, 
        scale: 1, 
        duration: 0.4, 
        ease: 'back.out(1.7)' 
      }
    );
  },

  toastOut(element: HTMLElement | string) {
    return gsap.to(element, { 
      opacity: 0, 
      x: 400, 
      scale: 0.9, 
      duration: 0.3, 
      ease: 'power2.in' 
    });
  },
};

// Three.js specific GSAP animations
export const ThreeAnimations = {
  // Move object to position
  moveTo(object: any, position: { x: number; y: number; z: number }, options: {
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}) {
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
  rotateTo(object: any, rotation: { x: number; y: number; z: number }, options: {
    duration?: number;
    ease?: string;
    useQuaternion?: boolean;
    onComplete?: () => void;
  } = {}) {
    if (options.useQuaternion) {
      const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z));
      return gsap.to(object.quaternion, {
        x: quat.x,
        y: quat.y,
        z: quat.z,
        w: quat.w,
        duration: options.duration ?? 1,
        ease: options.ease ?? 'power2.out',
        onComplete: options.onComplete,
      });
    }
    return gsap.to(object.rotation, {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z,
      duration: options.duration ?? 1,
      ease: options.ease ?? 'power2.out',
      onComplete: options.onComplete,
    });
  },

  // Scale object
  scaleTo(object: any, scale: number | { x: number; y: number; z: number }, options: {
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}) {
    const targetScale = typeof scale === 'number' 
      ? { x: scale, y: scale, z: scale } 
      : { x: scale.x, y: scale.y, z: scale.z };
    
    return gsap.to(object.scale, {
      ...targetScale,
      duration: options.duration ?? 1,
      ease: options.ease ?? 'power2.out',
      onComplete: options.onComplete,
    });
  },

  // Fade material
  fadeMaterial(material: any, opacity: number, options: {
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}) {
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

  // Color tween
  colorTo(material: any, color: number | string, options: {
    duration?: number;
    ease?: string;
    property?: string;
    onComplete?: () => void;
  } = {}) {
    const targetColor = new THREE.Color(color);
    const property = options.property ?? 'color';
    
    return gsap.to(material, {
      [property]: targetColor.getHex(),
      duration: options.duration ?? 1,
      ease: options.ease ?? 'power2.out',
      onComplete: options.onComplete,
    });
  },

  // Pulse animation
  pulse(object: any, options: {
    scale?: number;
    duration?: number;
    repeat?: number;
    yoyo?: boolean;
    ease?: string;
  } = {}) {
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
  shake(object: any, options: {
    intensity?: number;
    duration?: number;
    axis?: 'x' | 'y' | 'z' | 'all';
  } = {}) {
    const intensity = options.intensity ?? 0.1;
    const duration = options.duration ?? 0.5;
    const axis = options.axis ?? 'all';
    
    const timeline = gsap.timeline();
    const shakes = Math.ceil(duration / 0.05);
    
    for (let i = 0; i < shakes; i++) {
      const vars: any = { duration: 0.05, ease: 'rough({strength: 3, points: 10, template: none, taper: out, randomize: true})' };
      
      if (axis === 'x' || axis === 'all') vars.x = `+=${(Math.random() - 0.5) * intensity * 2}`;
      if (axis === 'y' || axis === 'all') vars.y = `+=${(Math.random() - 0.5) * intensity * 2}`;
      if (axis === 'z' || axis === 'all') vars.z = `+=${(Math.random() - 0.5) * intensity * 2}`;
      
      timeline.to(object.position, vars, i * 0.05);
    }
    
    return timeline;
  },

  // Orbit around point
  orbitAround(object: any, target: THREE.Vector3, options: {
    radius?: number;
    duration?: number;
    startAngle?: number;
    ease?: string;
  } = {}) {
    const radius = options.radius ?? 10;
    const duration = options.duration ?? 10;
    const startAngle = options.startAngle ?? 0;
    
    return gsap.to({}, {
      duration,
      ease: options.ease ?? 'none',
      repeat: -1,
      onUpdate: function() {
        const angle = startAngle + this.progress() * Math.PI * 2;
        object.position.x = target.x + Math.cos(angle) * radius;
        object.position.z = target.z + Math.sin(angle) * radius;
        object.lookAt(target);
      },
    });
  },
};

// Reduced motion support
export const ReducedMotion = {
  // Check if user prefers reduced motion
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Conditionally animate
  maybeAnimate(condition: boolean, animation: () => gsap.core.Tween | gsap.core.Timeline) {
    if (this.prefersReducedMotion() && !condition) {
      // Return a completed timeline if reduced motion
      return gsap.timeline().to({}, { duration: 0 });
    }
    return animation();
  },

  // Get duration respecting reduced motion
  getDuration(normalDuration: number): number {
    return this.prefersReducedMotion() ? 0 : normalDuration;
  },
};

export { gsap };