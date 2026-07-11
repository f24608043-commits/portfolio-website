import { useRef, useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Mesh, Group, BoxGeometry, MeshStandardMaterial, ConeGeometry, CylinderGeometry, SphereGeometry } from 'three';
import { Location } from '../../data/locations';
import { useIntersect } from '@react-three/drei';

interface LocationBuildingProps {
  location: Location;
  isVisited: boolean;
  isCurrent: boolean;
}

export function LocationBuilding({ location, isVisited, isCurrent }: LocationBuildingProps) {
  const [showLabel, setShowLabel] = useState(false);
  const groupRef = useRef<Group>(null);
  const { pointerOver, intersectDistance } = useIntersect({
    onPointerOver: () => setShowLabel(true),
    onPointerOut: () => setShowLabel(false),
    onClick: (e) => {
      e.stopPropagation();
      // Trigger interaction
      window.dispatchEvent(new CustomEvent('location-interact', { detail: location.id }));
    },
  });

  // Load GLTF model if available
  const gltf = useLoader(GLTFLoader, location.model || '/models/placeholder.glb');

  // Simple procedural building if no model
  const building = useRef<Group>(new Group());
  
  useEffect(() => {
    if (gltf && location.model) {
      building.current.clear();
      building.current.add(gltf.scene);
      gltf.scene.scale.setScalar(location.scale || 1);
      gltf.scene.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    } else {
      // Generate procedural building
      generateProceduralBuilding(building.current, location);
    }
  }, [gltf, location]);

  // Rotation animation for current location
  useEffect(() => {
    if (!isCurrent) return;
    // Handled in useFrame
  }, [isCurrent]);

  return (
    <group
      ref={groupRef}
      name={`location-${location.id}`}
      position={location.position}
      onPointerOver={() => setShowLabel(true)}
      onPointerOut={() => setShowLabel(false)}
    >
      <primitive object={building.current} />
      
      {/* Interaction highlight */}
      {pointerOver && (
        <mesh>
          <sphereGeometry args={[20, 16, 16]} />
          <meshBasicMaterial
            color="#4ecdc4"
            transparent
            opacity={0.05}
            side={2}
            wireframe
          />
        </mesh>
      )}
      
      {/* Floating label */}
      {showLabel && (
        <LocationLabel
          name={location.name}
          description={location.description}
          type={location.type}
          isVisited={isVisited}
          isCurrent={isCurrent}
        />
      )}
    </group>
  );
}

function generateProceduralBuilding(group: Group, location: Location) {
  group.clear();
  const scale = location.scale || 1;
  const height = 8 * scale;
  const width = 12 * scale;
  
  const materials = {
    wall: new MeshStandardMaterial({ color: getBuildingColor(location.type), roughness: 0.8, metalness: 0.2 }),
    roof: new MeshStandardMaterial({ color: '#2c3e50', roughness: 0.6, metalness: 0.3 }),
    accent: new MeshStandardMaterial({ color: '#f1c40f', roughness: 0.4, metalness: 0.6 }),
    window: new MeshStandardMaterial({ color: '#3498db', transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.9 }),
    door: new MeshStandardMaterial({ color: '#8b4513', roughness: 0.9, metalness: 0.1 }),
  };

  // Main building
  const main = new Mesh(
    new BoxGeometry(width, height, width),
    materials.wall
  );
  main.position.y = height / 2;
  main.castShadow = true;
  main.receiveShadow = true;
  group.add(main);

  // Roof
  const roof = new Mesh(
    new ConeGeometry(width * 0.7, height * 0.5, 4),
    materials.roof
  );
  roof.position.y = height + height * 0.25;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  // Windows
  for (let side = 0; side < 4; side++) {
    for (let floor = 0; floor < 2; floor++) {
      const window = new Mesh(
        new BoxGeometry(width * 0.3, height * 0.25, 0.1),
        materials.window
      );
      const angle = (side * Math.PI / 2) + Math.PI / 4;
      window.position.set(
        Math.sin(angle) * (width / 2 + 0.05),
        height * 0.3 + floor * height * 0.35,
        Math.cos(angle) * (width / 2 + 0.05)
      );
      window.rotation.y = angle;
      window.castShadow = true;
      group.add(window);
    }
  }

  // Door
  const door = new Mesh(
    new BoxGeometry(width * 0.25, height * 0.5, 0.1),
    materials.door
  );
  door.position.set(0, height * 0.25, width / 2 + 0.05);
  door.castShadow = true;
  group.add(door);

  // Type-specific decorations
  addTypeDecoration(group, location.type, width, height);

  // Scale the whole group
  group.scale.setScalar(scale);
}

function getBuildingColor(type: Location['type']): string {
  switch (type) {
    case 'building': return '#8b7355';
    case 'landmark': return '#95a5a6';
    case 'secret': return '#2c2c54';
    default: return '#7f8c8d';
  }
}

function addTypeDecoration(group: Group, type: Location['type'], width: number, height: number) {
  const materials = {
    accent: new MeshStandardMaterial({ color: '#f1c40f', roughness: 0.4, metalness: 0.6 }),
    magic: new MeshStandardMaterial({ color: '#8e44ad', transparent: true, opacity: 0.8, roughness: 0.2, metalness: 0.8 }),
  };

  switch (type) {
    case 'building':
      // Chimney
      const chimney = new Mesh(new BoxGeometry(1, 4, 1), materials.accent);
      chimney.position.set(width * 0.3, height + 2, width * 0.3);
      chimney.castShadow = true;
      group.add(chimney);
      break;
    case 'landmark':
      // Spire
      const spire = new Mesh(new ConeGeometry(0.5, 6, 8), materials.accent);
      spire.position.set(0, height + 3, 0);
      spire.castShadow = true;
      group.add(spire);
      break;
    case 'secret':
      // Glowing crystals
      for (let i = 0; i < 3; i++) {
        const crystal = new Mesh(
          new ConeGeometry(0.5, 2, 6),
          materials.magic
        );
        crystal.position.set(
          (Math.random() - 0.5) * width * 0.8,
          height * 0.5 + Math.random() * height * 0.5,
          (Math.random() - 0.5) * width * 0.8
        );
        crystal.castShadow = true;
        group.add(crystal);
      }
      break;
  }
}

function LocationLabel({ name, description, type, isVisited, isCurrent }: {
  name: string;
  description: string;
  type: Location['type'];
  isVisited: boolean;
  isCurrent: boolean;
}) {
  const icons: Record<Location['type'], string> = {
    building: '🏛️',
    landmark: '🏔️',
    secret: '🔮',
    area: '🌲',
  };

  return (
    <html position={[0, 15, 0]} transform scale={0.02} sprite distanceFactor={10}>
      <div style={{
        background: 'rgba(26, 26, 46, 0.95)',
        border: `2px solid ${isCurrent ? '#ff6b6b' : isVisited ? '#4ecdc4' : '#555'}`,
        borderRadius: '8px',
        padding: '12px 16px',
        minWidth: '200px',
        maxWidth: '280px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'monospace',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>{icons[type]}</span>
          <div>
            <div style={{ fontWeight: 'bold', color: isCurrent ? '#ff6b6b' : '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'capitalize' }}>{type}</div>
          </div>
        </div>
        <p style={{ margin: 0, color: '#ccc', fontSize: '0.85rem', lineHeight: '1.4' }}>{description}</p>
        {isCurrent && <div style={{ marginTop: '8px', color: '#ff6b6b', fontSize: '0.7rem', fontWeight: 'bold' }}>📍 YOU ARE HERE</div>}
        {isVisited && !isCurrent && <div style={{ marginTop: '8px', color: '#4ecdc4', fontSize: '0.7rem' }}>✅ Visited</div>}
      </div>
    </html>
  );
}