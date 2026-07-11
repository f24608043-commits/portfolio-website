import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { useGameStore } from '../../stores/gameStore';
import { LOCATIONS } from '../../data/locations';

function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Base grass color
  ctx.fillStyle = '#2d5a27';
  ctx.fillRect(0, 0, 256, 256);
  
  // Add grass variation
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = Math.random() * 2 + 1;
    const green = 180 + Math.random() * 60;
    ctx.fillStyle = `rgb(${Math.random()*20}, ${green}, ${Math.random()*30})`;
    ctx.fillRect(x, y, size, size);
  }
  
  // Darker patches
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = Math.random() * 8 + 4;
    ctx.fillStyle = `rgba(20, 60, 15, ${Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.repeat.set(40, 40);
  return texture;
}

function createDirtTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(0, 0, 256, 256);
  
  // Add dirt variation
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = Math.random() * 3 + 1;
    const brown = 80 + Math.random() * 60;
    ctx.fillStyle = `rgb(${brown}, ${brown * 0.6}, ${brown * 0.3})`;
    ctx.fillRect(x, y, size, size);
  }
  
  // Rocks/pebbles
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = Math.random() * 4 + 2;
    const gray = 60 + Math.random() * 40;
    ctx.fillStyle = `rgb(${gray}, ${gray * 0.9}, ${gray * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.repeat.set(40, 40);
  return texture;
}

function createPathTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(0, 0, 256, 256);
  
  // Path stones
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const w = Math.random() * 30 + 15;
    const h = Math.random() * 20 + 10;
    const gray = 100 + Math.random() * 50;
    ctx.fillStyle = `rgb(${gray}, ${gray * 0.95}, ${gray * 0.9})`;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = `rgba(60, 40, 30, 0.3)`;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
  
  // Wear marks
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillStyle = `rgba(80, 50, 30, ${Math.random() * 0.15})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 8 + 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.repeat.set(8, 1);
  return texture;
}

export function Terrain() {
  const { _settings } = useGameStore();
  
  const grassTexture = useMemo(() => createGrassTexture(), []);
  const dirtTexture = useMemo(() => createDirtTexture(), []);
  const pathTexture = useMemo(() => createPathTexture(), []);
    <group name="terrain">
      {/* Main grass plane */}
      <mesh
        name="grass-plane"
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
      >
        <planeGeometry args={[500, 500, 80, 80]} />
        <meshStandardMaterial
          map={grassTexture}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Paths between locations */}
      {LOCATIONS.flatMap(loc => 
        loc.connections
          .filter(connId => loc.id < connId)
          .map(connId => {
            const conn = LOCATIONS.find(l => l.id === connId);
            if (!conn) return null;
            
            const midX = (loc.position[0] + conn.position[0]) / 2;
            const midZ = (loc.position[2] + conn.position[2]) / 2;
            const dx = conn.position[0] - loc.position[0];
            const dz = conn.position[2] - loc.position[2];
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dx, dz);
            
            return (
              <mesh
                key={`path-${loc.id}-${conn.id}`}
                name={`path-${loc.id}-${conn.id}`}
                receiveShadow
                rotation={[-Math.PI / 2, angle, 0]}
                position={[midX, 0.01, midZ]}
              >
                <planeGeometry args={[length, 6]} />
                <meshStandardMaterial
                  map={pathTexture}
                  roughness={0.8}
                  metalness={0.1}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            );
          })
      )}
      
      {/* Building foundations */}
      {LOCATIONS.filter(l => l.type === 'building').map(loc => (
        <mesh
          key={`foundation-${loc.id}`}
          name={`foundation-${loc.id}`}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[loc.position[0], 0, loc.position[2]]}
        >
          <circleGeometry args={[15, 32]} />
          <meshStandardMaterial
            map={dirtTexture}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}