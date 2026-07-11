import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useIntersect } from '@react-three/drei';
import { NPC } from '../../data/npcs';
import { useGameStore } from '../../stores/gameStore';
import { DialogueUI } from '../UI/DialogueUI';

interface NPCProps {
  npc: NPC;
}

export function NPCComponent({ npc }: NPCProps) {
  const { player, visitArea } = useGameStore();
  const [showDialogue, setShowDialogue] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const groupRef = useRef<THREE.Group>(null);
  const { pointerOver, intersectDistance } = useIntersect({
    onPointerOver: () => {},
    onClick: (e) => {
      e.stopPropagation();
      setShowDialogue(true);
      setCurrentNodeId('start');
    },
  });

  // Simple idle animation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Bobbing
    groupRef.current.position.y = Math.sin(time * 2) * 0.05;
    
    // Rotate to face player when close
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
      // Wandering
      groupRef.current.rotation.y += (Math.sin(time * 0.5) * 0.01);
      groupRef.current.position.x = npc.position[0] + Math.sin(time) * npc.wanderRadius * 0.3;
      groupRef.current.position.z = npc.position[2] + Math.cos(time * 0.7) * npc.wanderRadius * 0.3;
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

function getNPCModel(modelType: NPC['model'], highlighted = false) {
  const colors = {
    skin: '#fdbcb4',
    cloth: highlighted ? '#ff6b6b' : '#34495e',
    metal: '#7f8c8d',
    leather: '#8b4513',
    gold: '#f1c40f',
  };

  const baseModel = (
    <group scale={1.2}>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[0.5, 1, 0.3]} />
        <meshStandardMaterial color={colors.cloth} roughness={0.8} />
      </mesh>
      
      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 1.7, 0]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color={colors.skin} roughness={0.9} />
      </mesh>
      
      {/* Hat/Helmet based on type */}
      <mesh castShadow position={[0, 2.0, 0]}>
        {getHatGeometry(modelType)}
        <meshStandardMaterial color={getHatColor(modelType)} roughness={0.6} metalness={0.3} />
      </mesh>
      
      {/* Legs */}
      <mesh castShadow receiveShadow position={[-0.15, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color="#1a252f" roughness={0.8} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.15, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color="#1a252f" roughness={0.8} />
      </mesh>
      
      {/* Arms */}
      <mesh castShadow receiveShadow position={[-0.35, 1.0, 0]} rotation={[-0.3, 0, -0.2]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color={colors.skin} roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.35, 1.0, 0]} rotation={[-0.3, 0, 0.2]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color={colors.skin} roughness={0.9} />
      </mesh>
      
      {/* Profession indicator */}
      <mesh position={[0, 2.5, 0]} scale={0.5}>
        <textGeometry text={getProfessionIcon(modelType)} font={null} size={1} height={0.1} />
        <meshBasicMaterial color="#4ecdc4" transparent opacity={0.8} />
      </mesh>
    </group>
  );

  return baseModel;
}

function getHatGeometry(type: NPC['model']) {
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

function getHatColor(type: NPC['model']) {
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

function getProfessionIcon(type: NPC['model']) {
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

import * as THREE from 'three';
import { textGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';