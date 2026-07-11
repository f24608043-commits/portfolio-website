import { useGameStore } from '../../stores/gameStore';
import { LOCATIONS } from '../../data/locations';

export function MiniMap() {
  const { player, visitedAreas, visitArea } = useGameStore();
  const currentLoc = LOCATIONS.find(l => l.id === player.currentArea);
  const centerX = currentLoc?.position[0] || 0;
  const centerZ = currentLoc?.position[2] || 0;

  return (
    <div style={{
      width: '200px',
      height: '200px',
      background: 'rgba(0, 0, 0, 0.7)',
      border: '1px solid #4ecdc4',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <canvas
        ref={(canvas) => {
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          const scale = 8;
          const offsetX = 100;
          const offsetY = 100;
          
          canvas.width = 200;
          canvas.height = 200;
          
          // Clear
          ctx.fillStyle = '#0a0a1a';
          ctx.fillRect(0, 0, 200, 200);
          
          // Draw locations
          LOCATIONS.forEach(loc => {
            const x = offsetX + (loc.position[0] - centerX) * scale;
            const y = offsetY - (loc.position[2] - centerZ) * scale;
            const visited = visitedAreas.includes(loc.id);
            const current = loc.id === player.currentArea;
            
            if (x < 0 || x > 200 || y < 0 || y > 200) return;
            
            // Connection lines
            if (loc.connections) {
              ctx.strokeStyle = visited ? '#4ecdc444' : '#333';
              ctx.lineWidth = 1;
              loc.connections.forEach(connId => {
                const conn = LOCATIONS.find(l => l.id === connId);
                if (conn) {
                  const cx = offsetX + (conn.position[0] - centerX) * scale;
                  const cy = offsetY - (conn.position[2] - centerZ) * scale;
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  ctx.lineTo(cx, cy);
                  ctx.stroke();
                }
              });
            }
          });
          
          // Draw location markers
          LOCATIONS.forEach(loc => {
            const x = offsetX + (loc.position[0] - centerX) * scale;
            const y = offsetY - (loc.position[2] - centerZ) * scale;
            const visited = visitedAreas.includes(loc.id);
            const current = loc.id === player.currentArea;
            
            if (x < -10 || x > 210 || y < -10 || y > 210) return;
            
            ctx.beginPath();
            ctx.arc(x, y, current ? 8 : (visited ? 5 : 3), 0, Math.PI * 2);
            ctx.fillStyle = current ? '#ff6b6b' : (visited ? '#4ecdc4' : '#555');
            ctx.fill();
            ctx.strokeStyle = current ? '#fff' : (visited ? '#fff' : '#333');
            ctx.lineWidth = current ? 2 : 1;
            ctx.stroke();
            
            // Label
            if (visited || current) {
              ctx.fillStyle = current ? '#ff6b6b' : '#fff';
              ctx.font = '8px monospace';
              ctx.textAlign = 'center';
              ctx.fillText(loc.name.substring(0, 8), x, y - 12);
            }
          });
        }}
      />
      
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        right: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.65rem',
        color: '#888',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      }}>
        <span>N</span>
        <span>E</span>
        <span>S</span>
        <span>W</span>
      </div>
    </div>
  );
}