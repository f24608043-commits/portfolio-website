import { Environment, Stage, ContactShadows } from '@react-three/drei';
import { TownMap } from './World/TownMap';
import { Player } from './entities/Player';
import { NPCManager } from './entities/NPCManager';
import { WeatherSystem } from './effects/WeatherSystem';
import { LightingSystem } from './effects/LightingSystem';
import { useGameStore } from '../../stores/gameStore';

export function GameScene() {
  const { settings, player } = useGameStore();

  return (
    <>
      <LightingSystem timeOfDay={useGameStore.getState().timeOfDay} weather={useGameStore.getState().weather} />
      <WeatherSystem weather={useGameStore.getState().weather} intensity={settings.quality === 'low' ? 0.3 : 1} />
      
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