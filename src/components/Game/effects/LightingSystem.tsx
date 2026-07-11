import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { DirectionalLight, AmbientLight, HemisphereLight, SpotLight, PointLight } from 'three';
import { useGameStore } from '../../stores/gameStore';

export function LightingSystem({ timeOfDay, weather }: { timeOfDay: GameState['timeOfDay']; weather: GameState['weather'] }) {
  const { settings } = useGameStore();

  // Calculate lighting based on time of day and weather
  const lighting = useMemo(() => {
    const configs = {
      dawn: { sunIntensity: 0.6, sunColor: '#ffaa66', ambientIntensity: 0.3, ambientColor: '#445588', hemisphereSky: '#ffaa66', hemisphereGround: '#223344' },
      day: { sunIntensity: 1.2, sunColor: '#fffef0', ambientIntensity: 0.4, ambientColor: '#88ccff', hemisphereSky: '#87ceeb', hemisphereGround: '#445566' },
      dusk: { sunIntensity: 0.5, sunColor: '#ff6644', ambientIntensity: 0.25, ambientColor: '#ff8866', hemisphereSky: '#ff6644', hemisphereGround: '#332233' },
      night: { sunIntensity: 0.05, sunColor: '#88aaff', ambientIntensity: 0.1, ambientColor: '#222244', hemisphereSky: '#111133', hemisphereGround: '#111122' },
    };
    
    let config = configs[timeOfDay];
    
    // Weather modifications
    if (weather === 'rain') {
      config = { ...config, sunIntensity: config.sunIntensity * 0.3, ambientIntensity: config.ambientIntensity * 0.5 };
    } else if (weather === 'fog') {
      config = { ...config, sunIntensity: config.sunIntensity * 0.5, ambientIntensity: config.ambientIntensity * 0.7 };
    } else if (weather === 'snow') {
      config = { ...config, sunIntensity: config.sunIntensity * 0.7, ambientIntensity: config.ambientIntensity * 0.8 };
    }
    
    return config;
  }, [timeOfDay, weather]);

  // Animate sun position
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const sunAngle = (time * 0.01) % (Math.PI * 2);
    // Sun position updated via light position
  });

  return (
    <group name="lighting">
      {/* Sun / Moon directional light */}
      <DirectionalLight
        castShadow
        intensity={lighting.sunIntensity}
        color={lighting.sunColor}
        position={[
          Math.sin(lighting.sunIntensity > 0.5 ? Math.PI / 4 : -Math.PI / 4) * 100,
          100,
          Math.cos(lighting.sunIntensity > 0.5 ? Math.PI / 4 : -Math.PI / 4) * 100,
        ]}
        shadow-mapSize-width={settings.quality === 'ultra' ? 4096 : settings.quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={settings.quality === 'ultra' ? 4096 : settings.quality === 'high' ? 2048 : 1024}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />
      
      {/* Ambient light */}
      <AmbientLight intensity={lighting.ambientIntensity} color={lighting.ambientColor} />
      
      {/* Hemisphere light for better ambient */}
      <HemisphereLight
        skyColor={lighting.hemisphereSky}
        groundColor={lighting.hemisphereGround}
        intensity={0.3}
      />
      
      {/* Town square lamps */}
      <PointLight position={[0, 8, 0]} color="#ffcc88" intensity={timeOfDay === 'night' ? 2 : 0} distance={30} decay={2} />
      <PointLight position={[-80, 8, 40]} color="#ffcc88" intensity={timeOfDay === 'night' ? 1.5 : 0} distance={25} decay={2} />
      <PointLight position={[60, 8, 30]} color="#ffcc88" intensity={timeOfDay === 'night' ? 1.5 : 0} distance={25} decay={2} />
      <PointLight position={[40, 8, -50]} color="#ffcc88" intensity={timeOfDay === 'night' ? 1.5 : 0} distance={25} decay={2} />
      <PointLight position={[-30, 8, -60]} color="#ffcc88" intensity={timeOfDay === 'night' ? 1.5 : 0} distance={25} decay={2} />
      <PointLight position={[-70, 8, -20]} color="#ffcc88" intensity={timeOfDay === 'night' ? 1.5 : 0} distance={25} decay={2} />
      <PointLight position={[70, 8, 60]} color="#ffcc88" intensity={timeOfDay === 'night' ? 1.5 : 0} distance={25} decay={2} />
      <PointLight position={[20, 8, 40]} color="#ffcc88" intensity={timeOfDay === 'night' ? 1.5 : 0} distance={25} decay={2} />
      <PointLight position={[80, 8, -40]} color="#ffcc88" intensity={timeOfDay === 'night' ? 1.5 : 0} distance={25} decay={2} />
      
      {/* Spotlight for key areas */}
      <SpotLight
        position={[0, 30, 0]}
        target={[0, 0, 0]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={timeOfDay === 'night' ? 3 : 0}
        color="#fff8e7"
        distance={100}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
}

interface GameState {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  weather: 'clear' | 'rain' | 'fog' | 'snow';
}