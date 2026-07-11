import { Html } from '@react-three/drei';
import { useGameStore } from '../../stores/gameStore';
import { MiniMap } from './MiniMap';
import { QuestLog } from './QuestLog';
import { Inventory } from './Inventory';
import { SettingsPanel } from './SettingsPanel';
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export function GameUI() {
  const { player } = useGameStore();
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMiniMap] = useState(true);
  
  const questLogRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Animate panel open/close with GSAP
  useEffect(() => {
    if (!questLogRef.current) return;
    if (showQuestLog) {
      gsap.fromTo(questLogRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(questLogRef.current, { opacity: 0, scale: 0.9, y: 20, duration: 0.2, ease: 'power2.in' });
    }
  }, [showQuestLog]);

  useEffect(() => {
    if (!inventoryRef.current) return;
    if (showInventory) {
      gsap.fromTo(inventoryRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(inventoryRef.current, { opacity: 0, scale: 0.9, y: 20, duration: 0.2, ease: 'power2.in' });
    }
  }, [showInventory]);

  useEffect(() => {
    if (!settingsRef.current) return;
    if (showSettings) {
      gsap.fromTo(settingsRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(settingsRef.current, { opacity: 0, scale: 0.9, y: 20, duration: 0.2, ease: 'power2.in' });
    }
  }, [showSettings]);

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

      {showQuestLog && (
        <QuestLog 
          ref={questLogRef} 
          onClose={() => setShowQuestLog(false)} 
        />
      )}
      {showInventory && (
        <Inventory 
          ref={inventoryRef} 
          onClose={() => setShowInventory(false)} 
        />
      )}
      {showSettings && (
        <SettingsPanel 
          ref={settingsRef} 
          onClose={() => setShowSettings(false)} 
        />
      )}
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