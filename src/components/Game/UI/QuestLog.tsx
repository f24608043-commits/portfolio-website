import { useGameStore } from '../../stores/gameStore';
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';
import { QUESTS } from '../../data/quests';

export const QuestLog = forwardRef<HTMLDivElement, { onClose: () => void }>(({ onClose }, ref) => {
  const { player, completeQuest } = useGameStore();
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

  const handleObjectiveClick = (questId: string, objectiveId: string) => {
    console.log(`Navigate to objective: ${objectiveId} in quest ${questId}`);
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        background: 'rgba(26, 26, 46, 0.98)',
        border: '2px solid #4ecdc4',
        borderRadius: '12px',
        padding: '24px',
        overflow: 'auto',
        zIndex: 1000,
        color: '#fff',
        fontFamily: 'monospace',
        boxShadow: '0 0 40px rgba(78, 205, 196, 0.2)',
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
        <h2 style={{ margin: 0, color: '#4ecdc4', textTransform: 'uppercase', letterSpacing: '2px' }}>
          📜 Quest Log
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

      {QUESTS.map((quest) => {
        const state = player.quests[quest.id] || { status: 'available', objectives: {}, progress: 0 };
        const completedObjectives = quest.objectives.filter(obj => state.objectives[obj.id]?.completed).length;
        const totalObjectives = quest.objectives.length;
        const isComplete = completedObjectives === totalObjectives;

        return (
          <div key={quest.id} style={{
            marginBottom: '24px',
            padding: '16px',
            background: isComplete ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${isComplete ? '#4ecdc4' : '#333'}`,
            borderRadius: '8px',
            transition: 'all 0.3s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: isComplete ? '#4ecdc4' : '#fff' }}>
                  {quest.title} {isComplete && ' ✅'}
                </h3>
                <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>{quest.description}</p>
              </div>
              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  {completedObjectives} / {totalObjectives}
                </div>
                <div style={{
                  width: '80px',
                  height: '6px',
                  background: '#333',
                  borderRadius: '3px',
                  marginTop: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(completedObjectives / totalObjectives) * 100}%`,
                    height: '100%',
                    background: isComplete ? '#4ecdc4' : '#ff6b6b',
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>
            </div>

            <div style={{ marginLeft: '16px' }}>
              {quest.objectives.map((objective) => {
                const isObjComplete = state.objectives[objective.id]?.completed;
                return (
                  <div
                    key={objective.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 0',
                      opacity: isObjComplete ? 0.6 : 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleObjectiveClick(quest.id, objective.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isObjComplete}
                      readOnly
                      style={{ width: '16px', height: '16px', accentColor: '#4ecdc4' }}
                    />
                    <span style={{
                      textDecoration: isObjComplete ? 'line-through' : 'none',
                      color: isObjComplete ? '#888' : '#fff',
                    }}>
                      {objective.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px dashed #333',
              fontSize: '0.85rem',
              color: '#4ecdc4',
            }}>
              🏆 Reward: {quest.rewards.map(r => `${r.type}: ${r.value}`).join(', ')}
            </div>
          </div>
        );
      })}

      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(78, 205, 196, 0.1)',
        border: '1px dashed #4ecdc4',
        borderRadius: '8px',
      }}>
        <div style={{ color: '#4ecdc4', fontWeight: 'bold' }}>
          Progress: {player.achievements.length} / 5 Achievements Unlocked
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
          {['Explorer', 'Scholar', 'Developer', 'Architect', 'Recruiter', 'Master'].map(a => (
            <span key={a} style={{
              display: 'inline-block',
              margin: '0 8px',
              padding: '4px 8px',
              borderRadius: '4px',
              background: player.achievements.includes(a.toLowerCase()) ? 'rgba(78, 205, 196, 0.3)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${player.achievements.includes(a.toLowerCase()) ? '#4ecdc4' : '#333'}`,
              color: player.achievements.includes(a.toLowerCase()) ? '#4ecdc4' : '#666',
            }}>
              {a} {player.achievements.includes(a.toLowerCase()) ? '✨' : '🔒'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}