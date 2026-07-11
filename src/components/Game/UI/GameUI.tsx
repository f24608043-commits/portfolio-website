import { Html } from '@react-three/drei';
import { useGameStore } from '../../stores/gameStore';
import { MiniMap } from './MiniMap';
import { QuestLog } from './QuestLog';
import { Inventory } from './Inventory';
import { SettingsPanel } from './SettingsPanel';
import { useState } from 'react';

export function GameUI() {
  const { player } = useGameStore();
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [_showMiniMap] = useState(true);

  return (
    <>
      <Html
        transform
        position={[0, 3, 0]}
        scale={0.02}
        sprite
        distanceFactor={5}
        zIndexRange={[100, 200]}
      >
        <div style={{ pointerEvents: 'none' }}>
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 100,
            pointerEvents: 'auto',
          }}>
            {showMiniMap && <MiniMap />}
            
            <div style={{
              background: 'rgba(26, 26, 46, 0.9)',
              border: '1px solid #4ecdc4',
              borderRadius: '8px',
              padding: '12px',
              minWidth: '200px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ color: '#4ecdc4', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'monospace' }}>
                📍 {player.currentArea.replace('-', ' ').toUpperCase()}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowQuestLog(!showQuestLog)}
                  style={buttonStyle(showQuestLog)}
                >
                  📜 Quest Log
                </button>
                <button
                  onClick={() => setShowInventory(!showInventory)}
                  style={buttonStyle(showInventory)}
                >
                  🎒 Inventory
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  style={buttonStyle(showSettings)}
                >
                  ⚙️ Settings
                </button>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#888', fontFamily: 'monospace' }}>
                WASD / Arrows: Move | Mouse: Look | Click: Interact | Scroll: Zoom
              </div>
            </div>
          </div>
        </div>
      </Html>

      {showQuestLog && <QuestLog onClose={() => setShowQuestLog(false)} />}
      {showInventory && <Inventory onClose={() => setShowInventory(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}

function buttonStyle(active: boolean) {
  return {
    padding: '6px 12px',
    borderRadius: '4px',
    border: `1px solid ${active ? '#4ecdc4' : '#555'}`,
    background: active ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255,255,255,0.05)',
    color: active ? '#4ecdc4' : '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    transition: 'all 0.2s',
  };
}