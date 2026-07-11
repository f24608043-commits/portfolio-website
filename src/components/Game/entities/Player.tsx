import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../stores/gameStore';
import { useRef, useEffect, useState } from 'react';
import { Vector3, Euler } from 'three';
import { LOCATIONS } from '../../data/locations';
import { gsap } from 'gsap';

export function Player() {
  const { camera, gl } = useThree();
  const { player, updatePlayerPosition, updatePlayerRotation, visitArea } = useGameStore();
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [mouseDelta, setMouseDelta] = useState({ x: 0, y: 0 });
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  
  const playerRef = useRef(new Vector3());
  const velocityRef = useRef(new Vector3());
  const directionRef = useRef(new Vector3());
  const rotationRef = useRef(new Euler(0, 0, 0, 'YXZ'));
  const cameraOffset = new Vector3(0, 3, 8);
  const targetRotation = new Euler(0, 0, 0, 'YXZ');
  
  const moveSpeed = 0.15;
  const runSpeed = 0.3;
  const rotationSpeed = 0.002;
  const damping = 0.85;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys(k => ({ ...k, [e.code]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys(k => ({ ...k, [e.code]: false }));
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse look
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked) return;
      setMouseDelta({ x: e.movementX, y: e.movementY });
    };

    const handleClick = () => {
      if (document.pointerLockElement !== gl.domElement) {
        gl.domElement.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === gl.domElement);
    };

    gl.domElement.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      gl.domElement.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [gl, isPointerLocked]);

  // Movement logic
  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    
    // Calculate movement direction from keys
    directionRef.current.set(0, 0, 0);
    
    if (keys.KeyW || keys.ArrowUp) directionRef.current.z -= 1;
    if (keys.KeyS || keys.ArrowDown) directionRef.current.z += 1;
    if (keys.KeyA || keys.ArrowLeft) directionRef.current.x -= 1;
    if (keys.KeyD || keys.ArrowRight) directionRef.current.x += 1;
    
    const isRunning = keys.ShiftLeft;
    const currentSpeed = isRunning ? runSpeed : moveSpeed;
    
    if (directionRef.current.length() > 0) {
      directionRef.current.normalize();
      
      // Rotate direction by player Y rotation
      directionRef.current.applyEuler(new Euler(0, rotationRef.current.y, 0));
      
      // Apply velocity with acceleration
      velocityRef.current.lerp(directionRef.current.multiplyScalar(currentSpeed), 0.15);
    } else {
      // Deceleration
      velocityRef.current.multiplyScalar(damping);
    }
    
    // Update position
    playerRef.current.add(velocityRef.current);
    
    // Boundary checks (keep player within world bounds)
    playerRef.current.x = Math.max(-240, Math.min(240, playerRef.current.x));
    playerRef.current.z = Math.max(-240, Math.min(240, playerRef.current.z));
    playerRef.current.y = 0.5; // Ground level
    
    // Update rotation from mouse
    if (mouseDelta.x !== 0 || mouseDelta.y !== 0) {
      targetRotation.y -= mouseDelta.x * rotationSpeed;
      targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 6, targetRotation.x - mouseDelta.y * rotationSpeed));
      setMouseDelta({ x: 0, y: 0 });
    }
    
    // Smooth rotation interpolation
    rotationRef.current.y += (targetRotation.y - rotationRef.current.y) * 0.1;
    rotationRef.current.x += (targetRotation.x - rotationRef.current.x) * 0.1;
    
    // Update player mesh rotation (only Y axis for movement direction)
    if (velocityRef.current.length() > 0.01) {
      const moveAngle = Math.atan2(velocityRef.current.x, velocityRef.current.z);
      // Smoothly rotate player to face movement direction
      const diff = moveAngle - rotationRef.current.y;
      rotationRef.current.y += diff * 0.1;
    }
    
    // Update camera position (third-person follow)
    const cameraTarget = playerRef.current.clone().add(new Vector3(0, 2, 0));
    const offset = cameraOffset.clone().applyEuler(new Euler(0, rotationRef.current.y, 0));
    const desiredCameraPos = cameraTarget.clone().add(offset);
    
    // Smooth camera follow
    camera.position.lerp(desiredCameraPos, 0.1);
    camera.lookAt(cameraTarget.x, cameraTarget.y + 1, cameraTarget.z);
    
    // Update store
    updatePlayerPosition(playerRef.current.toArray() as [number, number, number]);
    updatePlayerRotation(rotationRef.current.toArray() as [number, number, number]);
    
    // Check area transitions
    checkAreaTransition();
  });

  const checkAreaTransition = () => {
    for (const loc of LOCATIONS) {
      const dx = playerRef.current.x - loc.position[0];
      const dz = playerRef.current.z - loc.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < 15 && loc.interactable) {
        if (player.currentArea !== loc.id) {
          visitArea(loc.id);
        }
        break;
      }
    }
  };

  return (
    <group position={playerRef.current.toArray()} rotation={rotationRef.current.toArray()}>
      <PlayerCharacter />
      {/* Collision capsule for physics */}
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
  
  // Simple animated pixel knight
  return (
    <group name="player-character" scale={settings.quality === 'low' ? 0.8 : 1}>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#fdbcb4" roughness={0.8} />
      </mesh>
      
      {/* Helmet */}
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.3, 0.55]} />
        <meshStandardMaterial color="#34495e" roughness={0.5} metalness={0.6} />
      </mesh>
      
      {/* Cape */}
      <mesh position={[0, 0.6, -0.25]} castShadow receiveShadow>
        <planeGeometry args={[0.7, 1.2]} />
        <meshStandardMaterial 
          color="#e74c3c" 
          side={2} 
          transparent 
          opacity={0.9}
          roughness={0.8}
        />
      </mesh>
      
      {/* Sword on back */}
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
      
      {/* Shield on back */}
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
      
      {/* Backpack */}
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
      
      {/* Legs animation */}
      <Legs time={time} />
      
      {/* Arms animation */}
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