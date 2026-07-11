import { useMemo } from 'react';
import { LOCATIONS } from '../../data/locations';
import { LocationBuilding } from './LocationBuilding';
import { Terrain } from './Terrain';
import { useGameStore } from '../../stores/gameStore';

export function TownMap() {
  const { settings, player } = useGameStore();

  return (
    <group name="world">
      <Terrain />
      {LOCATIONS.map(location => (
        <LocationBuilding
          key={location.id}
          location={location}
          isVisited={player.visitedAreas.includes(location.id)}
          isCurrent={player.currentArea === location.id}
        />
      ))}
    </group>
  );
}