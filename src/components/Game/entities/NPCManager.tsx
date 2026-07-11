import { NPCS } from '../../data/npcs';
import { NPC } from './NPC';
import { useGameStore } from '../../stores/gameStore';

export function NPCManager() {
  const { player } = useGameStore();
  
  // Filter NPCs based on current area and visited areas
  const activeNpcs = NPCS.filter(npc => 
    (npc.locationId === player.currentArea || 
     (npc.wanderRadius && player.visitedAreas.includes(npc.locationId))) &&
    (!npc.requiresQuest || player.completedQuests.includes(npc.requiresQuest))
  );

  return (
    <group name="npcs">
      {activeNpcs.map(npc => (
        <NPC key={npc.id} npc={npc} />
      ))}
    </group>
  );
}