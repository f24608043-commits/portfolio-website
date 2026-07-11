import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, BufferGeometry, BufferAttribute, PointsMaterial, Color, Vector3 } from 'three';
import { useGameStore } from '../../stores/gameStore';

interface WeatherSystemProps {
  weather: 'clear' | 'rain' | 'fog' | 'snow';
  intensity: number;
}

export function WeatherSystem({ weather, intensity }: WeatherSystemProps) {
  const { scene } = useThree();
  const { settings } = useGameStore();
  const particlesRef = useRef<Points | null>(null);
  const particleCount = Math.floor(2000 * intensity * (settings.quality === 'low' ? 0.3 : 1));

  useEffect(() => {
    if (weather === 'clear') {
      if (particlesRef.current) {
        scene.remove(particlesRef.current);
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as PointsMaterial).dispose();
        particlesRef.current = null;
      }
      return;
    }

    // Create particle system
    const geometry = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Random position in a box around camera
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 50 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      
      // Velocity
      if (weather === 'rain') {
        velocities[i * 3] = (Math.random() - 0.5) * 0.5;
        velocities[i * 3 + 1] = -Math.random() * 30 - 20;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      } else if (weather === 'snow') {
        velocities[i * 3] = (Math.random() - 0.5) * 1;
        velocities[i * 3 + 1] = -Math.random() * 3 - 1;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 1;
      } else if (weather === 'fog') {
        velocities[i * 3] = (Math.random() - 0.5) * 0.2;
        velocities[i * 3 + 1] = 0;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      }
      
      sizes[i] = weather === 'rain' ? Math.random() * 0.1 + 0.05 : Math.random() * 0.3 + 0.1;
      lifetimes[i] = Math.random() * 100;
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));
    geometry.setAttribute('lifetime', new BufferAttribute(lifetimes, 1));

    const material = new PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: weather === 'fog' ? 0.1 : 0.6,
      depthWrite: false,
      blending: weather === 'fog' ? 1 : 0, // Additive for rain/snow
      sizeAttenuation: true,
    });

    // Colors
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      if (weather === 'rain') {
        colors[i * 3] = 0.5;
        colors[i * 3 + 1] = 0.7;
        colors[i * 3 + 2] = 1.0;
      } else if (weather === 'snow') {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 0.6;
        colors[i * 3 + 1] = 0.6;
        colors[i * 3 + 2] = 0.7;
      }
    }
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    const points = new Points(geometry, material);
    particlesRef.current = points;
    scene.add(points);

    return () => {
      if (particlesRef.current) {
        scene.remove(particlesRef.current);
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as PointsMaterial).dispose();
        particlesRef.current = null;
      }
    };
  }, [weather, intensity, scene, settings.quality]);

  // Animate particles
  useFrame((state, delta) => {
    if (!particlesRef.current || weather === 'clear') return;
    
    const geometry = particlesRef.current.geometry as BufferGeometry;
    const positions = geometry.getAttribute('position') as BufferAttribute;
    const velocities = geometry.getAttribute('velocity') as BufferAttribute;
    const lifetimes = geometry.getAttribute('lifetime') as BufferAttribute;
    
    const cameraPos = state.camera.position;
    
    for (let i = 0; i < particleCount; i++) {
      // Update position
      positions.setX(i, positions.getX(i) + velocities.getX(i) * delta * 60);
      positions.setY(i, positions.getY(i) + velocities.getY(i) * delta * 60);
      positions.setZ(i, positions.getZ(i) + velocities.getZ(i) * delta * 60);
      
      // Respawn if below ground or too far
      if (positions.getY(i) < 0 || 
          Math.abs(positions.getX(i) - cameraPos.x) > 150 ||
          Math.abs(positions.getZ(i) - cameraPos.z) > 150) {
        // Respawn above camera
        positions.setX(i, cameraPos.x + (Math.random() - 0.5) * 200);
        positions.setY(i, cameraPos.y + 30 + Math.random() * 40);
        positions.setZ(i, cameraPos.z + (Math.random() - 0.5) * 200);
      }
    }
    
    positions.needsUpdate = true;
  });

  return null;
}