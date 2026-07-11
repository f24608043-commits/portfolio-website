import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, RenderPixelatedPass } from '@react-three/postprocessing';
import { GameScene } from './components/Game/GameScene';
import { GameUI } from './components/Game/UI/GameUI';
import { useGameStore } from './components/Game/stores/gameStore';
import { Suspense, useEffect } from 'react';

export function GameCanvas() {
  const { settings } = useGameStore();

  useEffect(() => {
    const handleResize = () => {
      // Canvas auto-resizes
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
<Canvas
      camera={{ position: [0, 3, 8], fov: 60 }}
      gl={{ antialias: settings.quality !== 'low', preserveDrawingBuffer: true }}
      shadows={settings.quality !== 'low'}
      dpr={Math.min(window.devicePixelRatio, settings.quality === 'ultra' ? 2 : 1.5)}
      onCreated={(gl) => {
        gl.toneMapping = 1;
        gl.toneMappingExposure = 1;
      }}
    >
      <Suspense fallback={<LoadingScreen />}>
        <EffectComposer multisampling={settings.quality !== 'low'}>
          <GameScene />
          {(settings.quality === 'high' || settings.quality === 'ultra') && <Bloom intensity={0.3} />}
          {settings.quality === 'ultra' && <RenderPixelatedPass pixelSize={1} />}
        </EffectComposer>
      </Suspense>
      <GameUI />
    </Canvas>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: '#1a1a2e', color: '#fff', fontFamily: 'monospace',
      zIndex: 100
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏰 Portfolio Quest</div>
        <div style={{ fontSize: '1.2rem' }}>Loading world...</div>
        <div style={{ marginTop: '1rem', width: '200px', height: '4px', background: '#333', borderRadius: '2px', margin: '1rem auto' }}>
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)', borderRadius: '2px', animation: 'load 1.5s infinite' }} />
        </div>
        <style jsx>{`
          @keyframes load {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
}