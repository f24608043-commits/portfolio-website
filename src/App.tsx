import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Environment, Stage, ContactShadows, Html } from '@react-three/drei';
import { GameEngine } from './core/GameEngine';
import { eventBus, GameEvents } from './core/EventBus';
import { assetManager } from './core/AssetManager';
import { saveManager } from './core/SaveManager';
import { inputManager } from './core/InputManager';
import { performanceMonitor } from './core/PerformanceMonitor';
import { PlayerController } from './core/game/player/PlayerController';
import { NPCSystem } from './core/game/npc/NPCSystem';
import { QuestManager } from './core/game/quests/QuestManager';
import { InventorySystem } from './core/game/inventory/InventorySystem';
import { LOCATIONS } from './data/locations';
import { NPCS } from './data/npcs';
import { QUESTS } from './data/quests';
import { ITEMS } from './data/items';
import { DialogueSystem } from './core/game/dialogue/DialogueSystem';
import { DialogueUI } from './components/Game/UI/DialogueUI';
import { GameUI } from './components/Game/UI/GameUI';
import { MiniMap } from './components/Game/UI/MiniMap';
import { QuestLog } from './components/Game/UI/QuestLog';
import { Inventory } from './components/Game/UI/Inventory';
import { SettingsPanel } from './components/Game/UI/SettingsPanel';
import { ClassicPortfolioView } from './components/ClassicPortfolioView';
import { LoadingScreen } from './components/LoadingScreen';
import { useGameStore } from './stores/gameStore';
import { LocationData } from './data/locations';
import { NPCData } from './data/npcs';
import './App.css';

interface AppState {
  gameEngine: GameEngine | null;
  isLoading: boolean;
  loadingProgress: number;
  showClassicView: boolean;
}

function GameCanvas() {
  const { player, settings, isLoading } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 5, 10], fov: 60 }}
      gl={{ 
        antialias: settings.quality !== 'low', 
        preserveDrawingBuffer: true 
      }}
      shadows={settings.quality !== 'low'}
      dpr={Math.min(window.devicePixelRatio, settings.quality === 'ultra' ? 2 : 1.5)}
      onCreated={({ gl }) => {
        gl.toneMapping = 1; // ACESFilmicToneMapping
        gl.toneMappingExposure = 1;
      }}
    >
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Suspense fallback={<LoadingScreen />}>
            <EffectComposer multisampling={settings.quality !== 'low'}>
              <GameScene />
              {(settings.quality === 'high' || settings.quality === 'ultra') && <Bloom intensity={0.3} />}
              {settings.quality === 'ultra' && <RenderPixelatedPass pixelSize={1} />}
            </EffectComposer>
          </Suspense>
          <GameUI />
        </>
      )}
    </Canvas>
  );
}

function GameScene() {
  const { settings, player } = useGameStore();
  
  return (
    <>
      <Environment
        preset={settings.quality === 'low' ? 'warehouse' : 'sunset'}
        background={settings.quality !== 'low'}
        ground={settings.quality !== 'low'}
      >
        {(props) => (
          <>
            <prime>
              {props.scene.environment && (props.scene.environment.rotation.y = Math.PI * 0.5)}
            </prime>
          </>
        )}
      </Environment>

      <Stage
        contactShadows={settings.quality !== 'low' && { opacity: 0.3, scale: 20, blur: settings.quality === 'ultra' ? 2 : 1 }}
        environment="city"
        shadows={settings.quality !== 'low'}
        grid={settings.showFPS}
      >
        <TownMap />
        <Player />
        <NPCManager />
      </Stage>

      <ContactShadows
        opacity={0.4}
        scale={30}
        blur={settings.quality === 'ultra' ? 2 : 1}
        far={50}
        resolution={settings.quality === 'ultra' ? 1024 : 512}
      />
    </>
  );
}

function TownMap() {
  const { player } = useGameStore();

  return (
    <>
      <Terrain />
      <Props />
      <AmbientSounds />
      {LOCATIONS.map(location => {
          return (
            <LocationBuilding
              key={location.id}
              location={location}
              isVisited={player.visitedAreas.includes(location.id)}
              isCurrent={player.currentArea === location.id}
            />
          );
        })}
    </>
  );
}

function Terrain() {
  const { settings } = useGameStore();
  
  const grassTexture = useLoader(TextureLoader, '/textures/grass.jpg');
  const dirtTexture = useLoader(TextureLoader, '/textures/dirt.jpg');
  const pathTexture = useLoader(TextureLoader, '/textures/path.jpg');
  
  useMemo(() => {
    [grassTexture, dirtTexture, pathTexture].forEach(t => {
      if (t) {
        t.wrapS = RepeatWrapping;
        t.wrapT = RepeatWrapping;
        t.colorSpace = SRGBColorSpace;
        t.repeat.set(50, 50);
      }
    });
  }, [grassTexture, dirtTexture, pathTexture]);

  return (
    <group name="terrain">
      <mesh name="grass-plane" receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[500, 500, 50, 50]} />
        <meshStandardMaterial map={grassTexture} roughness={0.9} metalness={0.1} />
      </mesh>
      
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
                <meshStandardMaterial map={pathTexture} roughness={0.8} metalness={0.1} transparent opacity={0.8} />
              </mesh>
            );
          })
      )}
      
      {LOCATIONS.filter(l => l.type === 'building').map(loc => (
        <mesh
          key={`foundation-${loc.id}`}
          name={`foundation-${loc.id}`}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[loc.position[0], 0, loc.position[2]]}
        >
          <circleGeometry args={[15, 32]} />
          <meshStandardMaterial map={dirtTexture} roughness={0.9} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function Props() {
  return (
    <group name="props">
      {LOCATIONS.map(loc => 
        loc.type === 'landmark' && (
          <LocationMarker key={loc.id} position={loc.position} />
        )
      )}
    </group>
  );
}

function LocationMarker({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} scale={0.5}>
      <coneGeometry args={[2, 4, 8]} />
      <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.3} />
    </mesh>
  );
}

function AmbientSounds() {
  return (
    <group name="ambient-sounds">
      {/* Positional audio would be added here */}
    </group>
  );
}

function LocationBuilding({ 
  location, 
  isVisited, 
  isCurrent 
}: { 
  location: LocationData; 
  isVisited: boolean; 
  isCurrent: boolean; 
}) {
  const [showLabel, setShowLabel] = useState(false);
  const { pointerOver } = useIntersect({
    onPointerOver: () => setShowLabel(true),
    onPointerOut: () => setShowLabel(false),
    onClick: (e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent('location-interact', { detail: location.id }));
    },
  });

  const gltf = useLoader(GLTFLoader, location.model);
  const building = useRef<Group>(new Group());
  
  useEffect(() => {
    if (gltf) {
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

  return (
    <group
      ref={building}
      name={`location-${location.id}`}
      position={location.position}
      onPointerOver={() => setShowLabel(true)}
      onPointerOut={() => setShowLabel(false)}
    >
      <primitive object={building.current} />
      
      {pointerOver && (
        <mesh>
          <sphereGeometry args={[20, 16, 16]} />
          <meshBasicMaterial color="#4ecdc4" transparent opacity={0.05} side={2} wireframe />
        </mesh>
      )}
      
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

function LocationLabel({ name, description, type, isVisited, isCurrent }: {
  name: string;
  description: string;
  type: LocationData['type'];
  isVisited: boolean;
  isCurrent: boolean;
}) {
  const icons: Record<LocationData['type'], string> = {
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
            <div style={{ 
              fontWeight: 'bold', 
              color: isCurrent ? '#ff6b6b' : '#fff', 
              textTransform: 'uppercase', 
              letterSpacing: '1px' 
            }}>
              {name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'capitalize' }}>
              {type}
            </div>
          </div>
        </div>
        <p style={{ margin: 0, color: '#ccc', fontSize: '0.85rem', lineHeight: '1.4' }}>
          {description}
        </p>
        {isCurrent && <div style={{ marginTop: '8px', color: '#ff6b6b', fontSize: '0.7rem', fontWeight: 'bold' }}>
          📍 YOU ARE HERE
        </div>}
        {isVisited && !isCurrent && <div style={{ marginTop: '8px', color: '#4ecdc4', fontSize: '0.7rem' }}>
          ✅ Visited
        </div>}
      </div>
    </html>
  );
}

function generateProceduralBuilding(group: Group, location: LocationData) {
  group.clear();
  const scale = location.scale || 1;
  const height = 8 * scale;
  const width = 12 * scale;

  const materials = {
    wall: new MeshStandardMaterial({ color: '#8b7355', roughness: 0.8, metalness: 0.2 }),
    roof: new MeshStandardMaterial({ color: '#2c3e50', roughness: 0.6, metalness: 0.3 }),
    accent: new MeshStandardMaterial({ color: '#f1c40f', roughness: 0.4, metalness: 0.6 }),
    window: new MeshStandardMaterial({ color: '#3498db', transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.9 }),
    door: new MeshStandardMaterial({ color: '#8b4513', roughness: 0.9, metalness: 0.1 }),
  };

  // Main building
  const main = new Mesh(new BoxGeometry(width, height, width), materials.wall);
  main.position.y = height / 2;
  main.castShadow = true;
  main.receiveShadow = true;
  group.add(main);

  // Roof
  const roof = new Mesh(new ConeGeometry(width * 0.7, height * 0.5, 4), materials.roof);
  roof.position.y = height + height * 0.25;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  // Windows
  for (let side = 0; side < 4; side++) {
    for (let floor = 0; floor < 2; floor++) {
      const window = new Mesh(new BoxGeometry(width * 0.3, height * 0.25, 0.1), materials.window);
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
  const door = new Mesh(new BoxGeometry(width * 0.25, height * 0.5, 0.1), materials.door);
  door.position.set(0, height * 0.25, width / 2 + 0.05);
  door.castShadow = true;
  group.add(door);

  // Type-specific decorations
  switch (location.type) {
    case 'building':
      const chimney = new Mesh(new BoxGeometry(1, 4, 1), materials.accent);
      chimney.position.set(width * 0.3, height + 2, width * 0.3);
      chimney.castShadow = true;
      group.add(chimney);
      break;
    case 'landmark':
      const spire = new Mesh(new ConeGeometry(0.5, 6, 8), materials.accent);
      spire.position.set(0, height + 3, 0);
      spire.castShadow = true;
      group.add(spire);
      break;
    case 'secret':
      for (let i = 0; i < 3; i++) {
        const crystal = new Mesh(new ConeGeometry(0.5, 2, 6), 
          new MeshStandardMaterial({ color: '#8e44ad', transparent: true, opacity: 0.8, roughness: 0.2, metalness: 0.8 }));
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

  group.scale.setScalar(scale);
}

function Player() {
  const { player } = useGameStore();
  return (
    <group position={player.position} rotation={[0, player.rotation.y, 0]}>
      <PlayerCharacter />
      <mesh visible={false}>
        <capsuleGeometry args={[0.6, 1.2, 4, 8]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}

function PlayerCharacter() {
  const { settings } = useGameStore();
  const time = useFrame((state) => state.clock.getElapsedTime());
  
  const walkSpeed = 8;
  const walkAmount = Math.sin(time * walkSpeed) * 0.4;

  return (
    <group name="player-character" scale={settings.quality === 'low' ? 0.8 : 1}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.7} metalness={0.3} />
      </mesh>
      
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#fdbcb4" roughness={0.8} />
      </mesh>
      
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.3, 0.55]} />
        <meshStandardMaterial color="#34495e" roughness={0.5} metalness={0.6} />
      </mesh>
      
      <mesh position={[0, 0.6, -0.25]} castShadow receiveShadow>
        <planeGeometry args={[0.7, 1.2]} />
        <meshStandardMaterial color="#e74c3c" side={2} transparent opacity={0.9} roughness={0.8} />
      </mesh>
      
      <group position={[-0.4, 0.6, 0.3]} rotation={[0, 0, -Math.PI / 6]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 4]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.12, 0.12, 0.1]} />
          <meshStandardMaterial color="#ecf0f1" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      
      <group position={[0.4, 0.4, 0.35]} rotation={[0, 0, Math.PI / 6]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 8]} />
          <meshStandardMaterial color="#2980b9" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.03]} castShadow>
          <circleGeometry args={[0.15, 8]} />
          <meshStandardMaterial color="#3498db" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>
      
      <group position={[0, 0.2, -0.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.5, 0.3]} />
          <meshStandardMaterial color="#8b4513" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.25, 0.16]} castShadow>
          <boxGeometry args={[0.35, 0.1, 0.1]} />
          <meshStandardMaterial color="#a0522d" roughness={0.9} />
        </mesh>
      </group>
      
      <Legs time={time} />
      <Arms time={time} />
    </group>
  );
}

function Legs({ time }: { time: number }) {
  const walkSpeed = 8;
  const walkAmount = Math.sin(time * walkSpeed) * 0.4;
  
  return (
    <>
      <group position={[-0.2, -0.6, 0]} rotation={[walkAmount, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color="#1a252f" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color="#1a252f" roughness={0.8} />
        </mesh>
      </group>
      <group position={[0.2, -0.6, 0]} rotation={[-walkAmount, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color="#1a252f" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color="#1a252f" roughness={0.8} />
        </mesh>
      </group>
    </>
  );
}

function Arms({ time }: { time: number }) {
  const walkSpeed = 8;
  const walkAmount = Math.sin(time * walkSpeed) * 0.3;
  
  return (
    <>
      <group position={[-0.4, 0.4, 0]} rotation={[-walkAmount, 0, -0.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color="#fdbcb4" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#fdbcb4" roughness={0.8} />
        </mesh>
      </group>
      <group position={[0.4, 0.4, 0]} rotation={[walkAmount, 0, 0.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color="#fdbcb4" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#fdbcb4" roughness={0.8} />
        </mesh>
      </group>
    </>
  );
}

function NPCManager() {
  const { player } = useGameStore();
  
  const activeNpcs = NPCS.filter(npc => 
    (npc.locationId === player.currentArea || 
     (npc.wanderRadius && player.visitedAreas.includes(npc.locationId))) &&
    (!npc.requiresQuest || player.completedQuests.includes(npc.requiresQuest))
  );

  return (
    <group name="npcs">
      {activeNpcs.map(npc => (
        <NPCComponent key={npc.id} npc={npc} />
      ))}
    </group>
  );
}

function NPCComponent({ npc }: { npc: NPCData }) {
  const { player } = useGameStore();
  const [showDialogue, setShowDialogue] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const groupRef = useRef<Group>(null);
  const { pointerOver, intersectDistance } = useIntersect({
    onPointerOver: () => {},
    onClick: (e) => {
      e.stopPropagation();
      setShowDialogue(true);
      setCurrentNodeId('start');
    },
  });

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    
    groupRef.current.position.y = Math.sin(t * 2) * 0.05;
    
    const dx = player.position[0] - npc.position[0];
    const dz = player.position[2] - npc.position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < 8) {
      const targetRot = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRot,
        0.05
      );
    } else if (npc.wanderRadius) {
      groupRef.current.rotation.y += (Math.sin(t * 0.5) * 0.01);
      groupRef.current.position.x = npc.position[0] + Math.sin(t) * npc.wanderRadius * 0.3;
      groupRef.current.position.z = npc.position[2] + Math.cos(t * 0.7) * npc.wanderRadius * 0.3;
    }
  });

  if (showDialogue) {
    return (
      <>
        <group ref={groupRef} position={npc.position} rotation={npc.rotation}>
          {getNPCModel(npc.model)}
        </group>
        <DialogueUI
          npc={npc}
          currentNodeId={currentNodeId}
          setCurrentNodeId={setCurrentNodeId}
          onClose={() => setShowDialogue(false)}
        />
      </>
    );
  }

  return (
    <group ref={groupRef} position={npc.position} rotation={npc.rotation}>
      {getNPCModel(npc.model, pointerOver)}
    </group>
  );
}

function getNPCModel(modelType: NPCData['model'], highlighted = false) {
  const colors = {
    skin: '#fdbcb4',
    cloth: highlighted ? '#ff6b6b' : '#34495e',
    metal: '#7f8c8d',
    leather: '#8b4513',
    gold: '#f1c40f',
  };

  return (
    <group scale={1.2}>
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[0.5, 1, 0.3]} />
        <meshStandardMaterial color={colors.cloth} roughness={0.8} />
      </mesh>
      
      <mesh castShadow receiveShadow position={[0, 1.7, 0]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color={colors.skin} roughness={0.9} />
      </mesh>
      
      <mesh castShadow position={[0, 2.0, 0]}>
        {getHatGeometry(modelType)}
        <meshStandardMaterial color={getHatColor(modelType)} roughness={0.6} metalness={0.3} />
      </mesh>
      
      <mesh castShadow receiveShadow position={[-0.15, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color="#1a252f" roughness={0.8} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.15, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color="#1a252f" roughness={0.8} />
      </mesh>
      
      <mesh castShadow receiveShadow position={[-0.35, 1.0, 0]} rotation={[-0.3, 0, -0.2]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color={colors.skin} roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.35, 1.0, 0]} rotation={[-0.3, 0, 0.2]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color={colors.skin} roughness={0.9} />
      </mesh>
      
      <mesh position={[0, 2.5, 0]} scale={0.5}>
        <textGeometry text={getProfessionIcon(modelType)} font={null} size={1} height={0.1} />
        <meshBasicMaterial color="#4ecdc4" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function getHatGeometry(type: NPCData['model']) {
  switch (type) {
    case 'professor':
    case 'scholar':
    case 'mage':
    case 'scribe':
      return <coneGeometry args={[0.5, 0.7, 4]} />;
    case 'knight':
    case 'guard':
    case 'watchman':
      return <cylinderGeometry args={[0.5, 0.5, 0.3, 8]} />;
    case 'blacksmith':
    case 'apprentice':
      return <cylinderGeometry args={[0.4, 0.5, 0.2, 8]} />;
    case 'king':
    case 'mayor':
      return <torusGeometry args={[0.4, 0.08, 8, 16]} />;
    case 'captain':
      return <coneGeometry args={[0.45, 0.5, 4]} />;
    case 'scientist':
    case 'lead-scientist':
      return <boxGeometry args={[0.5, 0.3, 0.5]} />;
    case 'librarian':
    case 'curator':
      return <cylinderGeometry args={[0.4, 0.35, 0.4, 8]} />;
    case 'priest':
      return <coneGeometry args={[0.3, 0.8, 4]} />;
    default:
      return <boxGeometry args={[0.5, 0.3, 0.5]} />;
  }
}

function getHatColor(type: NPCData['model']) {
  const colors: Record<string, string> = {
    professor: '#2c3e50',
    scholar: '#2c3e50',
    mage: '#8e44ad',
    scribe: '#34495e',
    knight: '#7f8c8d',
    guard: '#7f8c8d',
    watchman: '#7f8c8d',
    blacksmith: '#8b4513',
    apprentice: '#8b4513',
    king: '#f1c40f',
    mayor: '#f1c40f',
    captain: '#2980b9',
    scientist: '#27ae60',
    'lead-scientist': '#27ae60',
    librarian: '#8e44ad',
    curator: '#8e44ad',
    priest: '#c0392b',
  };
  return colors[type] || '#34495e';
}

function getProfessionIcon(type: NPCData['model']) {
  const icons: Record<string, string> = {
    professor: '🎓',
    merchant: '💰',
    knight: '⚔️',
    blacksmith: '🔨',
    scientist: '🧪',
    scholar: '📚',
    guard: '🛡️',
    child: '🧒',
    king: '👑',
    traveler: '🧭',
    librarian: '📖',
    curator: '🏺',
    trainer: '🏋️',
    captain: '⚓',
    mage: '🔮',
    priest: '⛪',
    gardener: '🌱',
    archaeologist: '🏺',
    watchman: '🔭',
    'lead-scientist': '🧬',
    apprentice: '🔨',
    student: '🎓',
    clerk: '📋',
    navigator: '🧭',
    scribe: '✍️',
    volunteer: '❤️',
  };
  return icons[type] || '👤';
}

function App() {
  const [gameState, setGameState] = useState<AppState>({
    gameEngine: null,
    isLoading: true,
    loadingProgress: 0,
    showClassicView: false,
  });

  useEffect(() => {
    const initGame = async () => {
      const engine = GameEngine.create({
        canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
        settings: {
          graphics: {
            quality: 'high',
            resolution: { width: window.innerWidth, height: window.innerHeight },
            fullscreen: false,
            vsync: true,
            frameRateCap: 120,
            fov: 75,
            renderDistance: 200,
            shadowQuality: 'high',
            shadowDistance: 100,
            textureQuality: 'high',
            antiAliasing: 'ta',
            anisotropicFiltering: 16,
            postProcessing: true,
            bloom: true,
            ssao: true,
            ssr: false,
            volumetricLighting: false,
            particleQuality: 'high',
            vegetationDensity: 1,
            lodBias: 1,
          },
          audio: {
            masterVolume: 1,
            musicVolume: 0.5,
            sfxVolume: 0.7,
            uiVolume: 1,
            voiceVolume: 1,
            ambientVolume: 0.5,
            spatialAudio: true,
            muteOnFocusLoss: true,
          },
          gameplay: {
            difficulty: 'normal',
            autoSave: true,
            autoSaveInterval: 30000,
            showDamageNumbers: true,
            showQuestMarkers: true,
            showObjectiveMarkers: true,
            autoLoot: false,
            confirmOnExit: true,
            pauseOnFocusLoss: true,
            tutorialHints: true,
          },
          controls: {
            keyBindings: {},
            mouseSensitivity: 0.002,
            invertY: false,
            gamepadEnabled: true,
            gamepadSensitivity: 1,
            gamepadVibration: true,
            cameraDistance: 8,
            cameraFOV: 75,
            autoRun: false,
            toggleCrouch: false,
            toggleSprint: false,
          },
          accessibility: {
            reducedMotion: false,
            highContrast: false,
            colorBlindMode: 'off',
            fontSize: 'medium',
            fontDyslexic: false,
            subtitles: true,
            subtitleSize: 'medium',
            subtitleBackground: true,
            screenReader: false,
            navigationAssist: false,
            interactionAssist: false,
            holdInsteadOfTap: false,
          },
          network: {
            region: 'auto',
            pingLimit: 100,
            bandwidthLimit: 0,
            voiceChat: false,
            voiceChatVolume: 1,
            pushToTalk: true,
            pushToTalkKey: 'KeyV',
          },
        },
        qualityPresets: {
          low: { name: 'Low', settings: { shadowQuality: 'off', postProcessing: false, particleQuality: 'low' } },
          medium: { name: 'Medium', settings: { shadowQuality: 'medium', postProcessing: true, particleQuality: 'medium' } },
          high: { name: 'High', settings: { shadowQuality: 'high', postProcessing: true, particleQuality: 'high', bloom: true } },
          ultra: { name: 'Ultra', settings: { shadowQuality: 'ultra', postProcessing: true, particleQuality: 'ultra', bloom: true, ssao: true, ssr: true, volumetricLighting: true } },
        },
      });

      await engine.initialize();
      engine.start();

      // Initialize systems
      const playerController = new PlayerController(engine.createEntity('player', 'Player', { position: [0, 1, 0] }));
      engine.setPlayer(playerController.getState());

      const npcSystem = new NPCSystem();
      await npcSystem.initialize(NPCS);

      const questManager = new QuestManager();
      questManager.registerQuests(QUESTS);

      const inventorySystem = new InventorySystem();
      // Would register items here

      // Load save
      const save = saveManager.loadAutoSave();
      if (save) {
        // Apply save data
      }

      setGameState({
        gameEngine: engine,
        isLoading: false,
        loadingProgress: 1,
        showClassicView: false,
      });
    };

    initGame().catch(console.error);

    return () => {
      gameState.gameEngine?.shutdown();
    };
  }, []);

  if (gameState.isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="loading-title">🏰 Portfolio Quest</div>
          <div className="loading-text">Loading world...</div>
          <div className="loading-bar">
            <div className="loading-progress" style={{ width: `${gameState.loadingProgress * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas id="game-canvas" style={{ width: '100%', height: '100%', display: 'block' }} />
      <GameCanvas />
      
      {gameState.showClassicView && (
        <ClassicPortfolioView onClose={() => setGameState(s => ({ ...s, showClassicView: false }))} />
      )}
      
      <button
        className="view-toggle"
        onClick={() => setGameState(s => ({ ...s, showClassicView: !s.showClassicView }))}
        aria-label="Toggle Classic Portfolio View"
      >
        {gameState.showClassicView ? '🏰 Enter Quest' : '📄 Classic View'}
      </button>
    </div>
  );
}

export default App;