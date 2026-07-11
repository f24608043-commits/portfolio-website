import { useState, useEffect, useRef } from 'react';
import { NPC, DialogueNode, DialogueOption, DialogueAction } from '../../data/npcs';
import { useGameStore } from '../../stores/gameStore';

interface DialogueUIProps {
  npc: NPC;
  currentNodeId: string;
  setCurrentNodeId: (id: string) => void;
  onClose: () => void;
}

export function DialogueUI({ npc, currentNodeId, setCurrentNodeId, onClose }: DialogueUIProps) {
  const [displayText, setDisplayText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const { settings } = useGameStore();
  const textRef = useRef(currentNodeId);

  useEffect(() => {
    textRef.current = currentNodeId;
  }, [currentNodeId]);

  const node = npc.dialogue.find(n => n.id === currentNodeId);

  useEffect(() => {
    if (!node) return;
    
    setDisplayText('');
    setShowOptions(false);
    setTypewriterIndex(0);
    
    const fullText = node.text;
    const speed = settings.reducedMotion ? 0 : 25;
    
    if (speed === 0) {
      setDisplayText(fullText);
      setShowOptions(true);
      return;
    }
    
    const timer = setInterval(() => {
      setTypewriterIndex(prev => {
        const next = prev + 1;
        setDisplayText(fullText.slice(0, next));
        if (next >= fullText.length) {
          clearInterval(timer);
          setShowOptions(true);
          return prev;
        }
        return next;
      });
    }, speed);
    
    return () => clearInterval(timer);
  }, [currentNodeId, node, settings.reducedMotion]);

  const handleOptionClick = (option: DialogueOption) => {
    // Check conditions
    if (option.conditions && !option.conditions.every(c => checkCondition(c))) {
      return;
    }
    
    // Execute actions
    if (option.actions) {
      option.actions.forEach(action => executeAction(action));
    }
    
    setCurrentNodeId(option.nextNodeId);
  };

  const checkCondition = (condition: string): boolean => {
    const state = useGameStore.getState();
    if (condition.startsWith('hasItem:')) return state.player.inventory.includes(condition.split(':')[1]);
    if (condition.startsWith('completedQuest:')) return state.player.completedQuests.includes(condition.split(':')[1]);
    if (condition.startsWith('hasAchievement:')) return state.player.achievements.includes(condition.split(':')[1]);
    if (condition.startsWith('visited:')) return state.player.visitedAreas.includes(condition.split(':')[1]);
    return true;
  };

  const executeAction = (action: DialogueAction) => {
    const state = useGameStore.getState();
    switch (action.type) {
      case 'giveItem':
        state.addToInventory(action.value);
        break;
      case 'startQuest':
        state.startQuest(action.value);
        break;
      case 'completeQuest':
        state.completeQuest(action.value);
        break;
      case 'unlockAchievement':
        state.unlockAchievement(action.value);
        break;
      case 'showPortfolio':
        window.dispatchEvent(new CustomEvent('show-portfolio', { detail: action.value }));
        break;
      case 'teleport':
        // Handle teleport
        break;
    }
  };

  if (!node) return null;

  const icons: Record<string, string> = {
    professor: '🎓', merchant: '💰', knight: '⚔️', blacksmith: '🔨',
    scientist: '🧪', scholar: '📚', guard: '🛡️', child: '🧒',
    king: '👑', traveler: '🧭', librarian: '📖', curator: '🏺',
    trainer: '🏋️', captain: '⚓', mage: '🔮', priest: '⛪',
    gardener: '🌱', archaeologist: '🏺', watchman: '🔭',
    'lead-scientist': '🧬', apprentice: '🔨', student: '🎓',
    clerk: '📋', navigator: '🧭', scribe: '✍️', volunteer: '❤️',
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '700px',
      background: 'rgba(26, 26, 46, 0.98)',
      border: '2px solid #4ecdc4',
      borderRadius: '12px',
      padding: '24px',
      zIndex: 1000,
      color: '#fff',
      fontFamily: 'monospace',
      boxShadow: '0 0 40px rgba(78, 205, 196, 0.2)',
      animation: 'slideUp 0.3s ease-out',
    }}>
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ecdc4, #2980b9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}>
            {icons[npc.model]}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: '#4ecdc4', fontSize: '1.1rem' }}>{npc.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>{npc.title}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid #ff6b6b',
            color: '#ff6b6b',
            padding: '4px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{
        minHeight: '60px',
        padding: '16px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '8px',
        border: '1px solid #333',
        marginBottom: '16px',
        lineHeight: '1.6',
        fontSize: '0.95rem',
      }}>
        {displayText}
        {typewriterIndex < (node.text.length - 1) && <span style={{ animation: 'blink 1s infinite' }}>▌</span>}
        <style jsx>{`
          @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        `}</style>
      </div>

      {showOptions && node.options && node.options.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {node.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={option.conditions && !option.conditions.every(c => checkCondition(c))}
              style={{
                padding: '12px 16px',
                background: option.conditions && !option.conditions.every(c => checkCondition(c)) 
                  ? 'rgba(255,255,255,0.02)' 
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${option.conditions && !option.conditions.every(c => checkCondition(c)) ? '#333' : '#444'}`,
                borderRadius: '6px',
                color: option.conditions && !option.conditions.every(c => checkCondition(c)) ? '#666' : '#fff',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                textAlign: 'left',
                cursor: option.conditions && !option.conditions.every(c => checkCondition(c)) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = '#4ecdc4'; }}
              onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = '#444'; }}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {(!node.options || node.options.length === 0) && (
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '10px',
            background: 'rgba(78, 205, 196, 0.2)',
            border: '1px solid #4ecdc4',
            borderRadius: '6px',
            color: '#4ecdc4',
            fontFamily: 'monospace',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Continue...
        </button>
      )}
    </div>
  );
}