import { useGameStore } from '../../stores/gameStore';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';

export const SettingsPanel = forwardRef<HTMLDivElement, { onClose: () => void }>(({ onClose }, ref) => {
  const { settings, updateSettings } = useGameStore();
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

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '600px',
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
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #333',
      }}>
        <h2 style={{ margin: 0, color: '#4ecdc4', textTransform: 'uppercase', letterSpacing: '2px' }}>
          ⚙️ Settings
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Graphics Quality */}
        <section style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            🎮 Graphics Quality
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            {(['low', 'medium', 'high', 'ultra'] as const).map(quality => (
              <button
                key={quality}
                onClick={() => updateSettings({ quality })}
                style={{
                  padding: '12px',
                  background: settings.quality === quality ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${settings.quality === quality ? '#4ecdc4' : '#333'}`,
                  borderRadius: '8px',
                  color: settings.quality === quality ? '#4ecdc4' : '#fff',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {quality}
              </button>
            ))}
          </div>
          <p style={{ margin: '12px 0 0 0', fontSize: '0.8rem', color: '#888' }}>
            Low: Reduced shadows, no post-processing, lower DPR
            {settings.quality !== 'low' && ' | Higher: Better shadows, bloom, pixelation effects'}
          </p>
        </section>

        {/* Audio */}
        <section style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            🔊 Audio
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={(e) => updateSettings({ musicEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#4ecdc4' }}
              />
              <span>🎵 Background Music</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.sfxEnabled}
                onChange={(e) => updateSettings({ sfxEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#4ecdc4' }}
              />
              <span>🔊 Sound Effects (Footsteps, UI, Ambient)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.showFPS}
                onChange={(e) => updateSettings({ showFPS: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#4ecdc4' }}
              />
              <span>📊 Show FPS Counter</span>
            </label>
          </div>
        </section>

        {/* Accessibility */}
        <section style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            ♿ Accessibility
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#4ecdc4' }}
              />
              <span>🌊 Reduced Motion (Disable camera sway, particle animations)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                style={{ width: '18px', height: '18px', accentColor: '#4ecdc4' }}
              />
              <span>🎮 Classic Portfolio View (Traditional layout for recruiters)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={true}
                onChange={() => {}}
                style={{ width: '18px', height: '18px', accentColor: '#4ecdc4' }}
              />
              <span>⌨️ Keyboard Navigation Support</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={true}
                onChange={() => {}}
                style={{ width: '18px', height: '18px', accentColor: '#4ecdc4' }}
              />
              <span>📖 Screen Reader Compatible</span>
            </label>
          </div>
        </section>

        {/* Controls */}
        <section style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            🎮 Controls
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ color: '#aaa' }}>Move Forward</span>
              <kbd style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#4ecdc4' }}>W / ↑</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ color: '#aaa' }}>Move Backward</span>
              <kbd style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#4ecdc4' }}>S / ↓</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ color: '#aaa' }}>Strafe Left</span>
              <kbd style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#4ecdc4' }}>A / ←</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ color: '#aaa' }}>Strafe Right</span>
              <kbd style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#4ecdc4' }}>D / →</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ color: '#aaa' }}>Run</span>
              <kbd style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#4ecdc4' }}>Shift</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ color: '#aaa' }}>Interact</span>
              <kbd style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#4ecdc4' }}>E / Click</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ color: '#aaa' }}>Jump</span>
              <kbd style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#4ecdc4' }}>Space</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ color: '#aaa' }}>Camera Rotate</span>
              <kbd style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#4ecdc4' }}>Mouse Drag</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ color: '#aaa' }}>Zoom</span>
              <kbd style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#4ecdc4' }}>Scroll Wheel</kbd>
            </div>
          </div>
        </section>

        {/* Performance */}
        <section style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            📊 Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa' }}>Target FPS</span>
              <span style={{ color: '#4ecdc4', fontWeight: 'bold' }}>60 / 120</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa' }}>Adaptive Quality</span>
              <span style={{ color: '#4ecdc4', fontWeight: 'bold' }}>Enabled</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa' }}>Frustum Culling</span>
              <span style={{ color: '#4ecdc4', fontWeight: 'bold' }}>Enabled</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa' }}>Instanced Rendering</span>
              <span style={{ color: '#4ecdc4', fontWeight: 'bold' }}>Enabled</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa' }}>Texture Compression</span>
              <span style={{ color: '#4ecdc4', fontWeight: 'bold' }}>KTX2 + BasisU</span>
            </div>
          </div>
        </section>

        {/* Reset */}
        <section style={{ padding: '16px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', border: '1px solid #ff6b6b' }}>
          <button
            onClick={() => {
              if (confirm('Reset all progress? This cannot be undone.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255, 107, 107, 0.2)',
              border: '1px solid #ff6b6b',
              borderRadius: '8px',
              color: '#ff6b6b',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            🗑️ Reset All Progress (Dangerous)
          </button>
        </section>
      </div>
    </div>
  );
}