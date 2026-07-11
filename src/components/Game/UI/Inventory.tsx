import { useGameStore } from '../../stores/gameStore';
import { ITEMS } from '../../data/items';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';

export const Inventory = forwardRef<HTMLDivElement, { onClose: () => void }>(({ onClose }, ref) => {
  const { player } = useGameStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    animateIn() {
      if (!panelRef.current) return;
      gsap.fromTo(panelRef.current, 
        { scale: 0.8, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    },
    animateOut() {
      if (!panelRef.current) return;
      return gsap.to(panelRef.current, { 
        scale: 0.8, opacity: 0, y: -30, duration: 0.2, ease: 'power2.in' 
      });
    }
  }, []);

  const { player } = useGameStore();
  const ownedItems = ITEMS.filter(item => 
    player.inventory.items.includes(item.id) || 
    (item.id === 'code-sword' && player.skills.frontend > 0) ||
    (item.id === 'security-shield' && player.skills.cybersecurity > 0) ||
    (item.id === 'project-backpack' && player.projectsViewed > 0) ||
    (item.id === 'achievement-cape' && player.achievements.length > 0) ||
    (item.id === 'archive-key' && player.completedQuests.includes('main-quest')) ||
    (item.id === 'focus-potion')
  );

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '80vh',
        background: 'rgba(26, 26, 46, 0.98)',
        border: '2px solid #ff6b6b',
        borderRadius: '12px',
        padding: '24px',
        overflow: 'auto',
        zIndex: 1000,
        color: '#fff',
        fontFamily: 'monospace',
        boxShadow: '0 0 40px rgba(255, 107, 107, 0.2)',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #333',
      }}>
        <h2 style={{ margin: 0, color: '#ff6b6b', textTransform: 'uppercase', letterSpacing: '2px' }}>
          🎒 Inventory
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid #ff6b6b',
            color: '#ff6b6b',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          ✕ Close
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {ITEMS.map((item) => {
          const owned = ownedItems.includes(item);
          const equipped = player.inventory.equipped[item.type] === item.id;

          return (
            <div
              key={item.id}
              style={{
                padding: '16px',
                background: owned ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${owned ? (equipped ? '#4ecdc4' : '#555') : '#333'}`,
                borderRadius: '8px',
                opacity: owned ? 1 : 0.4,
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              <div style={{
                fontSize: '3rem',
                textAlign: 'center',
                marginBottom: '12px',
                filter: owned ? 'none' : 'grayscale(1)',
              }}>
                {item.icon}
              </div>
              <h4 style={{ margin: '0 0 8px 0', textAlign: 'center', color: owned ? '#fff' : '#666' }}>
                {item.name}
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#aaa', textAlign: 'center', minHeight: '40px' }}>
                {item.description}
              </p>
              
              {item.stats && owned && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  marginBottom: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #333',
                }}>
                  {Object.entries(item.stats).map(([stat, value]) => (
                    <div key={stat} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ecdc4' }}>{value}</div>
                      <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>{stat}</div>
                    </div>
                  ))}
                </div>
              )}

              {equipped && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#4ecdc4',
                  color: '#000',
                  fontSize: '0.6rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                }}>
                  EQUIPPED
                </div>
              )}

              {!owned && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.8)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  color: '#666',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}>
                  🔒 Locked
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(255, 107, 107, 0.1)',
        border: '1px dashed #ff6b6b',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <div style={{ color: '#ff6b6b', fontWeight: 'bold', marginBottom: '8px' }}>
          Equipment Slots
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {['weapon', 'shield', 'cape', 'artifact'].map(slot => (
            <div key={slot} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: `2px dashed ${player.inventory.equipped[slot] ? '#4ecdc4' : '#555'}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: player.inventory.equipped[slot] ? 'rgba(78, 205, 196, 0.1)' : 'transparent',
              }}>
                {player.inventory.equipped[slot] && ITEMS.find(i => i.id === player.inventory.equipped[slot])?.icon || '❓'}
              </div>
              <span style={{ fontSize: '0.7rem', textTransform: 'capitalize', color: '#888' }}>
                {slot}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}