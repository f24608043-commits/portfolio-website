export function LoadingScreen() {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      background: '#1a1a2e', color: '#fff', fontFamily: 'monospace',
      zIndex: 100
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏰 Portfolio Quest</div>
        <div style={{ fontSize: '1.2rem' }}>Loading world...</div>
        <div style={{ width: '200px', height: '4px', background: '#333', borderRadius: '2px', margin: '1rem auto' }}>
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