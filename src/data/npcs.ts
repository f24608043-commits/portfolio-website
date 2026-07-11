import { NPC, DialogueNode, DialogueOption, DialogueAction, QuestData } from '../../types';

export const NPCS: NPC[] = [
  {
    id: 'professor',
    name: 'Professor Aldric',
    title: 'Dean of Computer Science',
    locationId: 'academy',
    position: [-78, 0, 42],
    rotation: [0, Math.PI / 4, 0],
    model: 'professor',
    dialogue: {
      startNode: 'start',
      nodes: {
        start: {
          id: 'start',
          text: 'Ah, a traveler seeking knowledge! Welcome to the Academy. I\'m Professor Aldric, Dean of Computer Science. What brings you to our halls?',
          speaker: 'npc',
          options: [
            { text: 'Tell me about your education programs', nextNodeId: 'education', action: { type: 'show_portfolio', value: 'education' } },
            { text: 'Show me your certificates', nextNodeId: 'certificates', action: { type: 'show_portfolio', value: 'certificates' } },
            { text: 'I\'m just exploring', nextNodeId: 'explore' },
          ],
        },
        education: {
          id: 'education',
          text: 'Excellent! Our curriculum covers the full spectrum of software engineering. Bachelor of Science in Computer Science from Virtual University (2020-2024), with honors in Algorithms and Distributed Systems. We also offer specialized certifications in Cloud Architecture, Cybersecurity, and AI/ML.',
          speaker: 'npc',
          options: [
            { text: 'What about your research?', nextNodeId: 'research' },
            { text: 'Impressive! Tell me more.', nextNodeId: 'more' },
          ],
          actions: [{ type: 'show_portfolio', value: 'education' }],
        },
        certificates: {
          id: 'certificates',
          text: 'Of course! Here are the official scrolls... AWS Certified Solutions Architect, Google Cloud Professional, CompTIA Security+, and several specialized credentials. Each represents mastery of a domain.',
          speaker: 'npc',
          options: [
            { text: 'Can I see the details?', nextNodeId: 'cert-details' },
            { text: 'Thank you, Professor.', nextNodeId: 'end' },
          ],
          actions: [{ type: 'show_portfolio', value: 'certificates' }],
        },
        explore: {
          id: 'explore',
          text: 'Take your time. The library is to the north, and the training grounds south. Knowledge awaits those who seek it.',
          speaker: 'npc',
          options: [
            { text: 'Goodbye.', nextNodeId: 'end' },
          ],
        },
        end: {
          id: 'end',
          text: 'Farewell, scholar. May your code compile on the first try!',
          speaker: 'npc',
        },
      },
    },
    questGiver: true,
  },
  {
    id: 'blacksmith',
    name: 'Garrick the Forge-Master',
    title: 'Master Project Craftsman',
    locationId: 'blacksmith',
    position: [42, 0, -48],
    rotation: [0, -Math.PI / 2, 0],
    model: 'blacksmith',
    dialogue: {
      startNode: 'start',
      nodes: {
        start: {
          id: 'start',
          text: '*CLANG* *CLANG* "Hmm? Oh, a visitor! I\'m Garrick, and this is where raw ideas become forged steel. Each project here is a weapon crafted for a purpose."',
          speaker: 'npc',
          options: [
            { text: 'Show me your finest works', nextNodeId: 'projects', action: { type: 'show_portfolio', value: 'projects' } },
            { text: 'How do you forge a project?', nextNodeId: 'process' },
            { text: 'I seek a specific tool', nextNodeId: 'specific' },
          ],
        },
        projects: {
          id: 'projects',
          text: 'Step right up! The E-commerce Platform - forged with React, Node.js, PostgreSQL. Handles 10k+ transactions daily. The Real-time Analytics Dashboard - tempered with WebSockets and Redis. The AI-Powered Chatbot - enchanted with NLP and Transformers. Each has its GitHub scroll!',
          speaker: 'npc',
          options: [
            { text: 'Show me the E-commerce Platform', nextNodeId: 'project-ecommerce' },
            { text: 'Show me the Analytics Dashboard', nextNodeId: 'project-analytics' },
            { text: 'Show me the AI Chatbot', nextNodeId: 'project-chatbot' },
          ],
          actions: [{ type: 'show_portfolio', value: 'projects' }],
        },
        process: {
          id: 'process',
          text: 'Ah, the ancient art! First, Requirements Gathering - mining the ore. Then Architecture Design - the blueprint. Implementation - hammer on anvil. Testing - quenching in ice water. Deployment - sharpening the edge. Maintenance - keeping it rust-free!',
          speaker: 'npc',
          options: [
            { text: 'Fascinating! Show me a project', nextNodeId: 'projects' },
            { text: 'What challenges do you face?', nextNodeId: 'challenges' },
          ],
        },
        challenges: {
          id: 'challenges',
          text: 'Many! Legacy code - like brittle iron. Scaling - tempering for greater loads. Security - proofing against dark magic. But every challenge makes the steel stronger.',
          speaker: 'npc',
          options: [
            { text: 'Wise words. Goodbye.', nextNodeId: 'end' },
          ],
        },
        end: {
          id: 'end',
          text: 'Come back anytime, traveler. The forge is always hot!',
          speaker: 'npc',
        },
      },
    },
    questGiver: true,
  },
  {
    id: 'trainer',
    name: 'Captain Varian',
    title: 'Master of Skills',
    locationId: 'training-grounds',
    position: [-32, 0, -58],
    rotation: [0, Math.PI, 0],
    model: 'knight',
    dialogue: {
      startNode: 'start',
      nodes: {
        start: {
          id: 'start',
          text: 'Halt! You wish to test your mettle? I am Captain Varian, and these grounds forge the skills of legends. Choose your discipline!',
          speaker: 'npc',
          options: [
            { text: 'Frontend Combat (React, Vue, TypeScript)', nextNodeId: 'frontend', action: { type: 'show_portfolio', value: 'skills-frontend' } },
            { text: 'Backend Warfare (Node, Go, Databases)', nextNodeId: 'backend', action: { type: 'show_portfolio', value: 'skills-backend' } },
            { text: 'DevOps Siege (Docker, K8s, CI/CD)', nextNodeId: 'devops', action: { type: 'show_portfolio', value: 'skills-devops' } },
            { text: 'Cybersecurity Defense', nextNodeId: 'security', action: { type: 'show_portfolio', value: 'skills-security' } },
            { text: 'AI/ML Arcane Arts', nextNodeId: 'ai', action: { type: 'show_portfolio', value: 'skills-ai' } },
          ],
        },
        frontend: {
          id: 'frontend',
          text: 'Frontend! The art of the visible realm. React 18, Next.js 14, TypeScript, Tailwind, Framer Motion, Three.js. Your mastery meter shows 90%. Impressive blade work!',
          speaker: 'npc',
          options: [
            { text: 'Train Backend', nextNodeId: 'backend' },
            { text: 'View my skill tree', nextNodeId: 'skills' },
          ],
          actions: [{ type: 'show_portfolio', value: 'skills-frontend' }],
        },
        backend: {
          id: 'backend',
          text: 'Backend! The hidden foundation. Node.js, Express, Go, PostgreSQL, MongoDB, Redis, GraphQL, REST. Mastery at 85%. Strong, but room to grow.',
          speaker: 'npc',
          options: [
            { text: 'Train DevOps', nextNodeId: 'devops' },
            { text: 'View my skill tree', nextNodeId: 'skills' },
          ],
          actions: [{ type: 'show_portfolio', value: 'skills-backend' }],
        },
        devops: {
          id: 'devops',
          text: 'DevOps! The siege engines. Docker, Kubernetes, GitHub Actions, AWS, Terraform, Prometheus. Mastery at 80%. Your pipelines flow like rivers.',
          speaker: 'npc',
          options: [
            { text: 'Train Security', nextNodeId: 'security' },
            { text: 'View my skill tree', nextNodeId: 'skills' },
          ],
          actions: [{ type: 'show_portfolio', value: 'skills-devops' }],
        },
        security: {
          id: 'security',
          text: 'Cybersecurity! The shield. OWASP, Penetration Testing, JWT/OAuth, Encryption, Security Auditing. Mastery at 88%. A formidable defense!',
          speaker: 'npc',
          options: [
            { text: 'Train AI/ML', nextNodeId: 'ai' },
            { text: 'View my skill tree', nextNodeId: 'skills' },
          ],
          actions: [{ type: 'show_portfolio', value: 'skills-security' }],
        },
        ai: {
          id: 'ai',
          text: 'AI/ML! The arcane arts. TensorFlow, PyTorch, Transformers, Computer Vision, NLP, MLOps. Mastery at 75%. Your neural pathways are forming.',
          speaker: 'npc',
          options: [
            { text: 'View complete skill tree', nextNodeId: 'skills' },
            { text: 'Enough training for today', nextNodeId: 'end' },
          ],
          actions: [{ type: 'show_portfolio', value: 'skills-ai' }],
        },
        skills: {
          id: 'skills',
          text: 'Here is your complete skill compendium. Each discipline has its own mastery meter. Continue training to reach 100% in all!',
          speaker: 'npc',
          options: [
            { text: 'Return to training', nextNodeId: 'start' },
            { text: 'Farewell, Captain', nextNodeId: 'end' },
          ],
          actions: [{ type: 'show_portfolio', value: 'skills-all' }],
        },
        end: {
          id: 'end',
          text: 'Dismissed! Remember: a dull blade cuts nothing. Keep sharpening!',
          speaker: 'npc',
        },
      },
    },
    questGiver: true,
  },
  {
    id: 'librarian',
    name: 'Archivist Mirelle',
    title: 'Keeper of Research Scrolls',
    locationId: 'library',
    position: [-72, 0, -18],
    rotation: [0, Math.PI / 2, 0],
    model: 'scholar',
    dialogue: {
      startNode: 'start',
      nodes: {
        start: {
          id: 'start',
          text: 'Welcome to the Grand Library. I am Mirelle, and these floating tomes contain the research of a lifetime. Each book opens to reveal its secrets.',
          speaker: 'npc',
          options: [
            { text: 'Show me the research papers', nextNodeId: 'papers', action: { type: 'show_portfolio', value: 'research-papers' } },
            { text: 'What topics are covered?', nextNodeId: 'topics' },
            { text: 'Can I download them?', nextNodeId: 'download' },
          ],
        },
        papers: {
          id: 'papers',
          text: 'The shelves hold: "Optimizing Neural Network Inference on Edge Devices" (2023), "Secure Microservice Communication Patterns" (2022), "Real-time Collaborative Editing Algorithms" (2021), and "Automated Vulnerability Detection in CI/CD" (2024). Each glows with knowledge.',
          speaker: 'npc',
          options: [
            { text: 'Read the Edge AI paper', nextNodeId: 'paper-edge' },
            { text: 'Read the Security paper', nextNodeId: 'paper-security' },
            { text: 'Read the Collaboration paper', nextNodeId: 'paper-collab' },
            { text: 'Read the CI/CD paper', nextNodeId: 'paper-cicd' },
          ],
          actions: [{ type: 'show_portfolio', value: 'research-papers' }],
        },
        topics: {
          id: 'topics',
          text: 'Computer Vision, Distributed Systems, Security, Human-Computer Interaction, DevOps Automation. The collection grows with each passing moon.',
          speaker: 'npc',
          options: [
            { text: 'Show me the papers', nextNodeId: 'papers' },
            { text: 'How do I download?', nextNodeId: 'download' },
          ],
        },
        download: {
          id: 'download',
          text: 'Of course! Each tome has a portal link. Touch the sigil on the cover, and the PDF shall manifest in your realm.',
          speaker: 'npc',
          options: [
            { text: 'View papers', nextNodeId: 'papers' },
            { text: 'Thank you, Archivist', nextNodeId: 'end' },
          ],
        },
        end: {
          id: 'end',
          text: 'Knowledge shared is knowledge multiplied. Safe travels, seeker.',
          speaker: 'npc',
        },
      },
    },
    questGiver: true,
  },
  {
    id: 'curator',
    name: 'Curator Valen',
    title: 'Guardian of Achievements',
    locationId: 'museum',
    position: [72, 0, 58],
    rotation: [0, -Math.PI / 4, 0],
    model: 'curator',
    dialogue: {
      startNode: 'start',
      nodes: {
        start: {
          id: 'start',
          text: 'Welcome to the Hall of Achievements. I am Curator Valen. Each pedestal holds a testament to excellence. Observe the artifacts of distinction.',
          speaker: 'npc',
          options: [
            { text: 'Show me the awards', nextNodeId: 'awards', action: { type: 'show_portfolio', value: 'awards' } },
            { text: 'What about certifications?', nextNodeId: 'certs' },
            { text: 'Volunteer work?', nextNodeId: 'volunteer' },
          ],
        },
        awards: {
          id: 'awards',
          text: 'Behold! Hackathon Champion 2023 (1st place, 500+ teams). Best Paper Award at ICSE 2024. Innovation Grant Recipient - $50k for AI Research. Top 1% on LeetCode. GitHub Star Collector - 1000+ stars across repos.',
          speaker: 'npc',
          options: [
            { text: 'View certifications', nextNodeId: 'certs' },
            { text: 'View volunteer work', nextNodeId: 'volunteer' },
          ],
          actions: [{ type: 'show_portfolio', value: 'awards' }],
        },
        certs: {
          id: 'certs',
          text: 'The certification gallery: AWS Solutions Architect Professional. Google Cloud Architect. CKAD. OSCP (in progress). Each framed in golden light.',
          speaker: 'npc',
          options: [
            { text: 'View volunteer work', nextNodeId: 'volunteer' },
            { text: 'Thank you, Curator', nextNodeId: 'end' },
          ],
          actions: [{ type: 'show_portfolio', value: 'certifications' }],
        },
        volunteer: {
          id: 'volunteer',
          text: 'The community wing: Mentor at CodeForYouth (200+ students). Organizer of DevConf Local. Open Source Contributor to 50+ repos. STEM Ambassador for schools. True wealth is measured in lives touched.',
          speaker: 'npc',
          options: [
            { text: 'Inspiring. Goodbye.', nextNodeId: 'end' },
          ],
          actions: [{ type: 'show_portfolio', value: 'volunteer' }],
        },
        end: {
          id: 'end',
          text: 'May your own hall grow ever larger. Farewell!',
          speaker: 'npc',
        },
      },
    },
    questGiver: true,
  },
  {
    id: 'mayor',
    name: 'Mayor Hendrick',
    title: 'Keeper of Professional Records',
    locationId: 'town-hall',
    position: [58, 0, 28],
    rotation: [0, -Math.PI / 3, 0],
    model: 'king',
    dialogue: {
      startNode: 'start',
      nodes: {
        start: {
          id: 'start',
          text: 'Citizen! Welcome to the Town Hall. I am Mayor Hendrick. Here we archive the official chronicles of professional endeavor. Each room, a chapter.',
          speaker: 'npc',
          options: [
            { text: 'Show me the experience timeline', nextNodeId: 'experience', action: { type: 'show_portfolio', value: 'experience' } },
            { text: 'What companies are recorded?', nextNodeId: 'companies' },
            { text: 'I seek the Royal Archives', nextNodeId: 'archives' },
          ],
        },
        experience: {
          id: 'experience',
          text: 'The Great Hall displays: Senior Software Engineer at TechCorp (2023-Present) - Leading microservices migration. Software Engineer at StartupXYZ (2021-2023) - Full-stack feature development. Junior Developer at DevShop (2020-2021) - Learning the craft. Intern at CodeBase (2019) - First steps.',
          speaker: 'npc',
          options: [
            { text: 'Detail on TechCorp', nextNodeId: 'techcorp' },
            { text: 'Detail on StartupXYZ', nextNodeId: 'startupxyz' },
            { text: 'Detail on DevShop', nextNodeId: 'devshop' },
          ],
          actions: [{ type: 'show_portfolio', value: 'experience' }],
        },
        techcorp: {
          id: 'techcorp',
          text: 'TechCorp: Architected event-driven system reducing latency 60%. Mentored 5 engineers. Established CI/CD standards. Technologies: Go, Kubernetes, gRPC, PostgreSQL, Redis, Prometheus.',
          speaker: 'npc',
          options: [
            { text: 'View other roles', nextNodeId: 'experience' },
            { text: 'Seek the Archives', nextNodeId: 'archives' },
          ],
        },
        archives: {
          id: 'archives',
          text: 'The Royal Archives... ah, yes. The Resume Scroll. It lies in the sealed chamber. Only those who complete the Main Quest may enter. You must visit all major districts first.',
          speaker: 'npc',
          options: [
            { text: 'I accept the challenge', nextNodeId: 'accept' },
            { text: 'I shall return when ready', nextNodeId: 'end' },
          ],
          actions: [{ type: 'start_quest', value: 'main-quest' }],
        },
        accept: {
          id: 'accept',
          text: 'Then go forth! The Academy, Blacksmith, Training Grounds, Library, Museum, Marketplace, and Harbor await your presence. Return when all are illuminated!',
          speaker: 'npc',
          options: [
            { text: 'I will not fail!', nextNodeId: 'end' },
          ],
        },
        end: {
          id: 'end',
          text: 'The town prospers through your journey. Good luck!',
          speaker: 'npc',
        },
      },
    },
    questGiver: true,
  },
  {
    id: 'captain',
    name: 'Captain Aurora',
    title: 'Navigator of Future Horizons',
    locationId: 'harbor',
    position: [78, 0, -38],
    rotation: [0, -2 * Math.PI / 3, 0],
    model: 'captain',
    dialogue: {
      startNode: 'start',
      nodes: {
        start: {
          id: 'start',
          text: 'Ahoy! Captain Aurora at your service. My ships sail toward tomorrow. The winds speak of Cybersecurity, AI, Cloud, and Open Source. Which horizon calls to you?',
          speaker: 'npc',
          options: [
            { text: 'Cybersecurity seas', nextNodeId: 'security-sea', action: { type: 'show_portfolio', value: 'goals-security' } },
            { text: 'AI/ML waters', nextNodeId: 'ai-sea', action: { type: 'show_portfolio', value: 'goals-ai' } },
            { text: 'Cloud oceans', nextNodeId: 'cloud-sea', action: { type: 'show_portfolio', value: 'goals-cloud' } },
            { text: 'Open Source archipelago', nextNodeId: 'oss-sea', action: { type: 'show_portfolio', value: 'goals-oss' } },
          ],
        },
        'security-sea': {
          id: 'security-sea',
          text: 'The Security Seas! Rough waters but rich rewards. OSCP certification voyage planned. Red Team exercises on the map. Zero Trust architecture - the new compass. Bug bounty hunting - treasure for the bold!',
          speaker: 'npc',
          options: [
            { text: 'Chart AI course', nextNodeId: 'ai-sea' },
            { text: 'Return to port', nextNodeId: 'end' },
          ],
          actions: [{ type: 'show_portfolio', value: 'goals-security' }],
        },
        'ai-sea': {
          id: 'ai-sea',
          text: 'The AI Waters! Mysterious depths. LLM fine-tuning expeditions. Computer Vision coral reefs. MLOps pipeline currents. Research publication voyages. The horizon glows with transformers!',
          speaker: 'npc',
          options: [
            { text: 'Chart Cloud course', nextNodeId: 'cloud-sea' },
            { text: 'Return to port', nextNodeId: 'end' },
          ],
          actions: [{ type: 'show_portfolio', value: 'goals-ai' }],
        },
        'cloud-sea': {
          id: 'cloud-sea',
          text: 'The Cloud Oceans! Vast and ever-expanding. AWS Solutions Architect Professional - next port. Kubernetes mastery - taming the leviathans. Serverless archipelagos. Multi-cloud navigation.',
          speaker: 'npc',
          options: [
            { text: 'Chart OSS course', nextNodeId: 'oss-sea' },
            { text: 'Return to port', nextNodeId: 'end' },
          ],
          actions: [{ type: 'show_portfolio', value: 'goals-cloud' }],
        },
        'oss-sea': {
          id: 'oss-sea',
          text: 'The Open Source Archipelago! Many islands of contribution. Core maintainer aspirations. Community building. Documentation lighthouses. Mentoring new sailors. The tide rises all ships!',
          speaker: 'npc',
          options: [
            { text: 'A grand vision, Captain!', nextNodeId: 'end' },
          ],
          actions: [{ type: 'show_portfolio', value: 'goals-oss' }],
        },
        end: {
          id: 'end',
          text: 'Fair winds and following seas, traveler. May your deployments be ever green!',
          speaker: 'npc',
        },
      },
    },
    questGiver: true,
  },
  {
    id: 'scientist',
    name: 'Dr. Vex',
    title: 'Lead Experimentalist',
    locationId: 'secret-lab',
    position: [-88, -10, -78],
    rotation: [0, Math.PI / 2, 0],
    model: 'scientist',
    dialogue: {
      startNode: 'start',
      nodes: {
        start: {
          id: 'start',
          text: '*adjusts goggles* Ah, a Developer with the Achievement... welcome to the Secret Laboratory. I am Dr. Vex. Here we push boundaries. Computer Vision. Face Recognition. Automation. Prototypes that may change the world... or explode.',
          speaker: 'npc',
          options: [
            { text: 'Show me the Face Recognition project', nextNodeId: 'face-rec', action: { type: 'show_portfolio', value: 'experimental-face' } },
            { text: 'What about Computer Vision?', nextNodeId: 'cv' },
            { text: 'Automation prototypes?', nextNodeId: 'automation' },
          ],
        },
        'face-rec': {
          id: 'face-rec',
          text: 'Project: VISAGE. Real-time face detection, recognition, and emotion analysis. 99.2% accuracy on LFW. Runs on edge devices. Privacy-preserving architecture. The eyes see all... ethically.',
          speaker: 'npc',
          options: [
            { text: 'View Computer Vision', nextNodeId: 'cv' },
            { text: 'View Automation', nextNodeId: 'automation' },
          ],
          actions: [{ type: 'show_portfolio', value: 'experimental-face' }],
        },
        cv: {
          id: 'cv',
          text: 'Project: OCULUS. Object detection, segmentation, pose estimation. YOLOv8 custom training. Real-time 60fps on Jetson. Applications: security, retail analytics, robotics vision.',
          speaker: 'npc',
          options: [
            { text: 'View Face Recognition', nextNodeId: 'face-rec' },
            { text: 'View Automation', nextNodeId: 'automation' },
          ],
          actions: [{ type: 'show_portfolio', value: 'experimental-cv' }],
        },
        automation: {
          id: 'automation',
          text: 'Project: AUTOMATON. RPA bots, workflow orchestration, intelligent scraping. 10,000+ hours saved annually. Self-healing selectors. AI-enhanced decision nodes. The machines serve us!',
          speaker: 'npc',
          options: [
            { text: 'Impressive madness!', nextNodeId: 'end' },
          ],
          actions: [{ type: 'show_portfolio', value: 'experimental-auto' }],
        },
        end: {
          id: 'end',
          text: 'Science waits for no one. Return when you have the Master Achievement... the Deep Lab awaits.',
          speaker: 'npc',
        },
      },
    },
    questGiver: true,
    requiredAchievements: ['developer'],
  },
  // Atmosphere NPCs
  {
    id: 'traveler',
    name: 'Wandering Traveler',
    title: 'Explorer',
    locationId: 'town-square',
    position: [5, 0, 3],
    rotation: [0, 0, 0],
    model: 'traveler',
    dialogue: [
      {
        id: 'start',
        text: 'Greetings! I\'ve walked many paths. This town holds secrets in every building. The Academy teaches, the Blacksmith forges, the Library remembers. Where will you go first?',
        speaker: 'npc',
        options: [
          { text: 'Thanks for the guidance', nextNodeId: 'end' },
        ],
      },
      { id: 'end', text: 'Safe travels, friend!', speaker: 'npc' },
    ],
    wanderRadius: 10,
  },
  {
    id: 'child-1',
    name: 'Little Timmy',
    title: 'Aspiring Coder',
    locationId: 'town-square',
    position: [-3, 0, -4],
    rotation: [0, Math.PI / 2, 0],
    model: 'child',
    dialogue: [
      {
        id: 'start',
        text: 'I wanna make games when I grow up! 🎮 Do you know how to code?',
        speaker: 'npc',
        options: [
          { text: 'Yes! It\'s like magic', nextNodeId: 'magic' },
          { text: 'Start with Scratch or Python', nextNodeId: 'advice' },
        ],
      },
      { id: 'magic', text: 'Wow! Can you teach me?', speaker: 'npc', options: [{ text: 'Maybe later, little one', nextNodeId: 'end' }] },
      { id: 'advice', text: 'Okay! I\'ll ask my dad! Thanks! 😊', speaker: 'npc', options: [{ text: 'Good luck!', nextNodeId: 'end' }] },
      { id: 'end', text: 'Bye bye! 👋', speaker: 'npc' },
    ],
    wanderRadius: 5,
  },
  {
    id: 'merchant-1',
    name: 'Merchant Kael',
    title: 'Service Provider',
    locationId: 'marketplace',
    position: [18, 0, 38],
    rotation: [0, -Math.PI / 4, 0],
    model: 'merchant',
    dialogue: [
      {
        id: 'start',
        text: 'Fine services for sale! Custom software development. Cloud migration consulting. Security audits. Automation solutions. Best prices in the realm!',
        speaker: 'npc',
        options: [
          { text: 'Tell me more', nextNodeId: 'services' },
          { text: 'Just browsing', nextNodeId: 'end' },
        ],
      },
      { id: 'services', text: 'Full-stack apps from 5000 gold. Cloud setup from 3000. Security audit 2000. Automation scripts 1000. Bulk discounts for guilds!', speaker: 'npc', options: [{ text: 'Interesting', nextNodeId: 'end' }] },
      { id: 'end', text: 'Come back if you need anything!', speaker: 'npc' },
    ],
    wanderRadius: 8,
  },
  {
    id: 'apprentice',
    name: 'Apprentice Finn',
    title: 'Junior Craftsman',
    locationId: 'blacksmith',
    position: [38, 0, -52],
    rotation: [0, Math.PI, 0],
    model: 'apprentice',
    dialogue: [
      {
        id: 'start',
        text: '*wiping soot* Master Garrick says every bug is a lesson. I\'m learning React... the hooks are tricky but useEffect is my friend!',
        speaker: 'npc',
        options: [
          { text: 'Keep practicing!', nextNodeId: 'end' },
        ],
      },
      { id: 'end', text: 'Thanks! Back to the forge! ⚒️', speaker: 'npc' },
    ],
    wanderRadius: 5,
  },
];

export function getNPCById(id: string): NPC | undefined {
  return NPCS.find(npc => npc.id === id);
}