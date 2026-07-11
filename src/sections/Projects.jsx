import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../data/projects';

// Project Card Component - Pixar Funky Style
function ProjectCard({ project, onOpen, index }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const setImage = (idx) => (e) => {
    e.stopPropagation();
    setCurrentImageIndex(idx);
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.preview-btn') || e.target.closest('.gallery-dot')) {
      return;
    }
    onOpen(project);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={handleCardClick}
    >
      <motion.div
        whileHover={{ y: -8, rotate: index % 2 === 0 ? 1 : -1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-[#faf9f6] rounded-[2rem] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_48px_rgba(47,93,80,0.15)] border-2 border-[#e8e4df] transition-all duration-300"
      >
        {/* Hero Image Area */}
        <div className="relative h-56 rounded-[1.5rem] overflow-hidden mb-5">
          <motion.img
            src={project.images[currentImageIndex]}
            alt={project.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            loading="lazy"
          />
          
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-[#e8e4df]"
          >
            <span className="text-xs font-bold text-[#2f5d50]">{project.tags[0]}</span>
          </motion.div>
        </div>

        {/* Gallery Dots */}
        <div className="flex gap-2 mb-4">
          {project.images.map((img, idx) => (
            <button
              key={idx}
              onClick={setImage(idx)}
              className={`gallery-dot w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-200 ${
                idx === currentImageIndex 
                  ? 'border-[#2f5d50] ring-2 ring-[#2f5d50]/20' 
                  : 'border-[#e8e4df] hover:border-[#6a8f6b]'
              }`}
            >
              <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="font-headline font-bold text-xl text-[#2f5d50] group-hover:text-[#6a8f6b] transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-[#5a4a3a] leading-relaxed line-clamp-2">
            {project.description}
          </p>

          {/* Tags & Preview */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex gap-2 flex-wrap">
              {project.tags.slice(1).map((tag) => (
                <span 
                  key={tag} 
                  className="text-xs font-medium px-2.5 py-1 bg-[#e8f4f0] text-[#2f5d50] rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {project.preview ? (
              <motion.button
                whileHover={{ scale: 1.05, x: 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.preview, '_blank');
                }}
                className="preview-btn text-sm font-bold text-[#8b5e3c] hover:text-[#2f5d50] flex items-center gap-1 transition-colors"
              >
                View Project
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </motion.button>
            ) : (
              <span className="text-xs text-[#999] font-medium">Coming Soon</span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Modal Component - Pixar Style
function ProjectModal({ project, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#faf9f6] rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_32px_64px_rgba(0,0,0,0.2)]"
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#2f5d50] hover:bg-[#2f5d50] hover:text-white transition-all z-10"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Hero Image */}
        <div className="h-64 rounded-t-[2rem] overflow-hidden">
          <img
            src={project.images[currentImageIndex]}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gallery Strip */}
        <div className="flex gap-3 p-4 bg-[#f4efe6]">
          {project.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                idx === currentImageIndex 
                  ? 'border-[#2f5d50] ring-2 ring-[#2f5d50]/20' 
                  : 'border-white hover:border-[#6a8f6b]'
              }`}
            >
              <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <span className="inline-block px-3 py-1 bg-[#2f5d50] text-white text-xs font-bold rounded-full">
            {project.tags[0]}
          </span>
          
          <h2 className="font-headline font-bold text-2xl text-[#2f5d50]">
            {project.title}
          </h2>
          
          <p className="text-[#5a4a3a] leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span 
                key={tag} 
                className="text-xs font-medium px-3 py-1.5 bg-[#e8f4f0] text-[#2f5d50] rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            {project.preview ? (
              <motion.a
                href={project.preview}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-[#2f5d50] text-white py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-[#6a8f6b] transition-colors"
              >
                <span className="material-symbols-outlined">open_in_new</span>
                Live Preview
              </motion.a>
            ) : (
              <button
                disabled
                className="flex-1 bg-gray-200 text-gray-400 py-3 rounded-xl font-bold cursor-not-allowed"
              >
                No Preview Available
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 border-2 border-[#2f5d50] text-[#2f5d50] rounded-xl font-bold hover:bg-[#2f5d50] hover:text-white transition-all"
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Projects Component
export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section id="projects" className="bg-[#f4efe6] py-24 px-4 md:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-20 left-10 opacity-10">
        <span className="material-symbols-outlined text-[12rem] text-[#6a8f6b]">grid_view</span>
      </div>
      <div className="absolute bottom-20 right-10 opacity-10">
        <span className="material-symbols-outlined text-[10rem] text-[#8b5e3c]">widgets</span>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="font-headline font-black text-5xl md:text-7xl text-[#2f5d50] mb-4 flex justify-center flex-wrap gap-1">
            {'PROJECTS'.split('').map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: 50, opacity: 0, rotate: -10 }}
                whileInView={{ y: 0, opacity: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
                whileHover={{ y: -5, rotate: -3, color: '#8b5e3c' }}
                className="inline-block cursor-default"
              >
                {letter}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-lg text-[#5a4a3a] max-w-md mx-auto"
          >
            Where creativity meets code. Explore my latest digital adventures.
          </motion.p>
        </header>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={setSelectedProject}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
