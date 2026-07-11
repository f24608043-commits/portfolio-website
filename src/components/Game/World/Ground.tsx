import { useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping, SRGBColorSpace } from 'three';
import { useGameStore } from '../../stores/gameStore';

export function Ground() {
  const { settings } = useGameStore();
  
  const grassTexture = useLoader(TextureLoader, '/textures/grass.jpg');
  const dirtTexture = useLoader(TextureLoader, '/textures/dirt.jpg');
  const pathTexture = useLoader(TextureLoader, '/textures/path.jpg');
  
  useMemo(() => {
    [grassTexture, dirtTexture, pathTexture].forEach(t => {
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
      t.colorSpace = SRGBColorSpace;
      t.repeat.set(50, 50);
    });
  }, [grassTexture, dirtTexture, pathTexture]);

  return (
    <group name="ground">
      {/* Main grass plane */}
      <mesh name="grass-plane" receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[500, 500, 50, 50]} />
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
                key={`${loc.id}-${conn.id}`}
                name={`path-${loc.id}-${conn.id}`}
                receiveShadow
                rotation={[-Math.PI / 2, angle, 0]}
                position={[midX, 0.01, midZ]}
              >
                <planeGeometry args={[length, 8]} />
                <meshStandardMaterial
                  map={pathTexture}
                  roughness={0.8}
                  metalness={0.1}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            );
          })
      )}
      
      {/* Building foundations */}
      {LOCATIONS.filter(l => l.type === 'building').map(loc => (
        <mesh
          key={loc.id}
          name={`foundation-${loc.id}`}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[loc.position[0], 0, loc.position[2]]}
        >
          <circleGeometry args={[12, 32]} />
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

import { useMemo } from 'react';
import { LOCATIONS } from '../../data/locations';