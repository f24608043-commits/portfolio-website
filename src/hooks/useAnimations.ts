import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { UIAnimations, ReducedMotion } from '../../core/game/animation';

interface PanelAnimationProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export function AnimatedPanel({ isOpen, children, className = '', onClose }: PanelAnimationProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current || !overlayRef.current) return;

    if (ReducedMotion.prefersReducedMotion()) {
      // No animations for reduced motion
      gsap.set(panelRef.current, { scale: 1, opacity: 1 });
      gsap.set(overlayRef.current, { opacity: 1 });
      return;
    }

    if (isOpen) {
      gsap.fromTo(overlayRef.current!, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
      );
      
      gsap.fromTo(panelRef.current!,
        { scale: 0.9, opacity: 0, y: 20 },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          ease: 'back.out(1.7)' 
        }
      );
    } else {
      gsap.to(overlayRef.current!, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
      });
      
      gsap.to(panelRef.current!, {
        scale: 0.9,
        opacity: 0,
        y: 20,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      });
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        style={{ opacity: 0 }}
      />
      <div 
        ref={panelRef}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] overflow-auto ${className}`}
        style={{ transform: 'scale(0.9)', opacity: 0 }}
      >
        {children}
      </div>
    </>
  );
}

export function AnimatedTooltip({ 
  isVisible, 
  children, 
  position = { x: 0, y: 0 },
  className = ''
}: { 
  isVisible: boolean; 
  children: React.ReactNode; 
  position?: { x: number; y: number };
  className?: string;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tooltipRef.current) return;

    if (ReducedMotion.prefersReducedMotion()) {
      gsap.set(tooltipRef.current, { opacity: 1, scale: 1, y: 0 });
      return;
    }

    if (isVisible) {
      gsap.fromTo(tooltipRef.current,
        { opacity: 0, scale: 0.8, y: 10 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.15, 
          ease: 'back.out(1.7)' 
        }
      );
    } else {
      gsap.to(tooltipRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 10,
        duration: 0.1,
        ease: 'power2.in',
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      ref={tooltipRef}
      className={`fixed z-50 pointer-events-none ${className}`}
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {children}
    </div>
  );
}

export function StaggeredList({ 
  items, 
  renderItem, 
  className = '',
  stagger = 0.1,
  fromProps = { opacity: 0, y: 20 },
  toProps = { opacity: 1, y: 0 }
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
  stagger?: number;
  fromProps?: any;
  toProps?: any;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (ReducedMotion.prefersReducedMotion()) {
      return;
    }

    gsap.fromTo(
      itemsRef.current.filter(Boolean),
      fromProps,
      {
        ...toProps,
        stagger,
        duration: 0.4,
        ease: 'power2.out',
      }
    );
  }, [items, fromProps, toProps, stagger]);

  return (
    <div ref={containerRef} className={className}>
      {items.map((item, index) => (
        <div key={index} ref={(el) => { itemsRef.current[index] = el; }}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export function useAnimatedValue(initialValue: number, targetValue: number, options: {
  duration?: number;
  ease?: string;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
} = {}) {
  const valueRef = useRef(initialValue);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.kill();
    }

    if (ReducedMotion.prefersReducedMotion()) {
      valueRef.current = targetValue;
      options.onUpdate?.(targetValue);
      options.onComplete?.();
      return;
    }

    animationRef.current = gsap.to(valueRef, {
      current: targetValue,
      duration: options.duration ?? 1,
      ease: options.ease ?? 'power2.out',
      onUpdate: () => options.onUpdate?.(valueRef.current),
      onComplete: options.onComplete,
    });

    return () => {
      animationRef.current?.kill();
    };
  }, [targetValue, options.duration, options.ease]);

  return valueRef;
}

export function useSpringValue(initialValue: number, options: {
  stiffness?: number;
  damping?: number;
  mass?: number;
  onUpdate?: (value: number) => void;
} = {}) {
  const valueRef = useRef(initialValue);
  const targetRef = useRef(initialValue);
  const velocityRef = useRef(0);
  const animationIdRef = useRef<number>();

  const stiffness = options.stiffness ?? 150;
  const damping = options.damping ?? 15;
  const mass = options.mass ?? 1;

  const step = () => {
    const displacement = targetRef.current - valueRef.current;
    const acceleration = (displacement * stiffness) / mass - velocityRef.current * damping / mass;
    velocityRef.current += acceleration * (1 / 60);
    valueRef.current += velocityRef.current * (1 / 60);
    
    if (Math.abs(velocityRef.current) > 0.001 || Math.abs(displacement) > 0.001) {
      options.onUpdate?.(valueRef.current);
      animationIdRef.current = requestAnimationFrame(step);
    }
  };

  const setValue = (value: number) => {
    targetRef.current = value;
    if (!animationIdRef.current) {
      step();
    }
  };

  const setValueImmediate = (value: number) => {
    targetRef.current = value;
    valueRef.current = value;
    velocityRef.current = 0;
    options.onUpdate?.(value);
  };

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return { value: valueRef, setValue, setValueImmediate };
}

export function useScrollProgress(elementRef: React.RefObject<HTMLElement>) {
  const progressRef = useRef(0);

  useEffect(() => {
    if (!elementRef.current) return;

    const updateProgress = () => {
      const rect = elementRef.current!.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.bottom < 0 || rect.top > windowHeight) {
        progressRef.current = rect.top < 0 ? 1 : 0;
      } else {
        progressRef.current = 1 - rect.bottom / (windowHeight + rect.height);
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, [elementRef]);

  return progressRef;
}

export function useParallax(speed: number = 0.5) {
  const transformRef = useRef('translate3d(0, 0, 0)');

  useEffect(() => {
    const handleScroll = () => {
      if (ReducedMotion.prefersReducedMotion()) return;
      
      const yOffset = window.scrollY * speed;
      transformRef.current = `translate3d(0, ${yOffset}px, 0)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return transformRef;
}