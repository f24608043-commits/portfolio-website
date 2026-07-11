import { useGameStore } from '../../stores/gameStore';

export function ClassicPortfolioView({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      background: '#fff',
      color: '#1a1a2e',
      zIndex: 200,
      overflow: 'auto',
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          padding: '8px 16px', background: '#ff6b6b', color: '#fff',
          border: 'none', borderRadius: '4px', cursor: 'pointer',
        }}
      >
        Return to Quest
      </button>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #4ecdc4', paddingBottom: '16px' }}>
          Muhammad Abubakar - Software Engineer
        </h1>
        
        <section style={{ marginTop: '32px' }}>
          <h2 style={{ color: '#4ecdc4' }}>🎓 Education</h2>
          <p>Bachelor of Science in Computer Science - Virtual University (2020-2024)</p>
          <p>Certifications: AWS Solutions Architect, Google Cloud Professional, CompTIA Security+</p>
        </section>
        
        <section style={{ marginTop: '32px' }}>
          <h2 style={{ color: '#4ecdc4' }}>💼 Experience</h2>
          <article style={{ marginBottom: '24px' }}>
            <h3>Senior Software Engineer @ TechCorp</h3>
            <p style={{ color: '#666' }}>2023 - Present</p>
            <ul>
              <li>Architected event-driven microservices reducing latency by 60%</li>
              <li>Mentored 5 engineers, established CI/CD standards</li>
              <li>Tech: Go, Kubernetes, gRPC, PostgreSQL, Redis, Prometheus</li>
            </ul>
          </article>
          <article style={{ marginBottom: '24px' }}>
            <h3>Software Engineer @ StartupXYZ</h3>
            <p style={{ color: '#666' }}>2021 - 2023</p>
            <ul>
              <li>Full-stack feature development for SaaS platform</li>
              <li>Built real-time analytics dashboard with WebSockets</li>
              <li>Tech: React, Node.js, TypeScript, PostgreSQL</li>
            </ul>
          </article>
        </section>

        <section style={{ marginTop: '32px' }}>
          <h2 style={{ color: '#4ecdc4' }}>🛠️ Projects</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <ProjectCard title="E-commerce Platform" desc="React, Node.js, PostgreSQL - 10k+ daily transactions" tech={['React', 'Node.js', 'PostgreSQL']} />
            <ProjectCard title="Real-time Analytics Dashboard" desc="WebSockets, Redis, D3.js - Live data visualization" tech={['React', 'Redis', 'D3.js']} />
            <ProjectCard title="AI Chatbot System" desc="NLP, Transformers, Python - Customer support automation" tech={['Python', 'TensorFlow', 'Transformers']} />
          </div>
        </section>

        <section style={{ marginTop: '32px' }}>
          <h2 style={{ color: '#4ecdc4' }}>🏆 Achievements</h2>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <li style={{ background: '#f0f0f0', padding: '8px 16px', borderRadius: '20px' }}>Hackathon Champion 2023</li>
            <li style={{ background: '#f0f0f0', padding: '8px 16px', borderRadius: '20px' }}>Best Paper ICSE 2024</li>
            <li style={{ background: '#f0f0f0', padding: '8px 16px', borderRadius: '20px' }}>Top 1% LeetCode</li>
            <li style={{ background: '#f0f0f0', padding: '8px 16px', borderRadius: '20px' }}>1000+ GitHub Stars</li>
          </ul>
        </section>

        <section style={{ marginTop: '32px' }}>
          <h2 style={{ color: '#4ecdc4' }}>📄 Resume</h2>
          <a href="/resume.pdf" download style={{ display: 'inline-block', padding: '12px 24px', background: '#4ecdc4', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            Download Resume
          </a>
        </section>

        <section style={{ marginTop: '32px' }}>
          <h2 style={{ color: '#4ecdc4' }}>🔗 Links</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="https://github.com/abubakar" target="_blank" style={{ color: '#4ecdc4' }}>GitHub</a>
            <a href="https://linkedin.com/in/abubakar" target="_blank" style={{ color: '#4ecdc4' }}>LinkedIn</a>
            <a href="https://twitter.com/abubakar" target="_blank" style={{ color: '#4ecdc4' }}>Twitter</a>
            <a href="mailto:abubakar@example.com" style={{ color: '#4ecdc4' }}>Email</a>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProjectCard({ title, desc, tech }: { title: string; desc: string; tech: string[] }) {
  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', background: '#fafafa' }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{title}</h3>
      <p style={{ margin: '0 0 12px 0', color: '#666' }}>{desc}</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tech.map(t => (
          <span key={t} style={{ background: '#4ecdc4', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}