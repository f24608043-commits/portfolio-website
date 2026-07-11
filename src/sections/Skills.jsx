import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { technicalSkills, softSkills, tools } from "../data/skills";
import { staggerContainer, fadeUp, staggerItem, textRevealContainer, textReveal } from "../animations/variants";

export default function Skills() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [skillProgress, setSkillProgress] = useState(
    technicalSkills.map(() => 0)
  );

  useEffect(() => {
    if (isInView) {
      const timers = technicalSkills.map((skill, index) => {
        return setTimeout(() => {
          setSkillProgress((prev) => {
            const newProgress = [...prev];
            newProgress[index] = skill.percent;
            return newProgress;
          });
        }, 300 + index * 300);
      });

      return () => timers.forEach(clearTimeout);
    }
  }, [isInView]);

  const headlineWords = ["Pixels", "&", "Logic"];

  return (
    <section id="skills" ref={containerRef} className="py-28 px-6 max-w-6xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <motion.h2
          variants={textRevealContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-headline font-black text-5xl md:text-7xl tracking-tight text-on-surface mb-3"
        >
          {headlineWords.map((word, index) => (
            <span key={index} className="inline-block overflow-hidden mr-3">
              <motion.span
                variants={shouldReduceMotion ? fadeUp : textReveal}
                className={`inline-block ${word === "Logic" ? "text-primary italic" : ""}`}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex justify-center origin-center"
        >
          <svg fill="none" height="16" viewBox="0 0 280 16" width="280">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
              d="M5 12C45 12 90 4 140 8C190 12 235 12 275 4"
              stroke="#fdd400"
              strokeLinecap="round"
              strokeWidth="7"
            />
          </svg>
        </motion.div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Technical Core */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, type: "spring" }}
          className="md:col-span-7 bg-surface-container-lowest p-8 rounded-xl shadow-xl border-t-8 border-primary relative overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-7"
          >
            <motion.div
              animate={shouldReduceMotion ? {} : { rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-primary text-on-primary p-3 rounded-lg rotate-3"
            >
              <span className="material-symbols-outlined">terminal</span>
            </motion.div>
            <h2 className="font-headline font-black text-2xl tracking-tight uppercase">
              Technical Core
            </h2>
          </motion.div>

          <div className="space-y-7">
            {technicalSkills.map((skill, index) => (
              <motion.div
                key={skill.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ x: 5 }}
                className="group"
              >
                <div className="flex justify-between items-end mb-2">
                  <span className="font-headline font-bold text-lg">{skill.label}</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-on-surface-variant text-xs uppercase tracking-widest"
                  >
                    {skill.percent}% Mastery
                  </motion.span>
                </div>
                <div className="w-full bg-surface-container h-5 rounded-full overflow-hidden p-1 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skillProgress[index]}%` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full ${skill.color} rounded-full relative`}
                  >
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? {}
                          : {
                              backgroundPosition: ["0% 0%", "20px 20px"],
                            }
                      }
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Personal Dynamics */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, type: "spring", delay: 0.2 }}
          className="md:col-span-5 bg-surface-container p-8 rounded-xl relative overflow-hidden"
        >
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="font-headline font-black text-xl mb-7 flex items-center gap-2 text-secondary"
          >
            <motion.span
              animate={shouldReduceMotion ? {} : { rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="material-symbols-outlined"
            >
              bolt
            </motion.span>
            Personal Dynamics
          </motion.h2>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-4"
          >
            {softSkills.map((item, index) => (
              <motion.li
                key={item.num}
                variants={staggerItem}
                whileHover={{ x: 8, scale: 1.02 }}
                className="flex items-start gap-4 p-4 bg-white/40 rounded-lg cursor-pointer backdrop-blur-sm transition-all"
              >
                <motion.span
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className={`${item.numBg} px-2 py-1 rounded-lg font-bold text-sm`}
                >
                  {item.num}
                </motion.span>
                <div>
                  <h3 className="font-headline font-bold text-sm">{item.title}</h3>
                  <p className="text-xs text-on-surface-variant">{item.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Design & Tools */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="md:col-span-12 bg-white p-8 rounded-xl shadow-lg border-2 border-dashed border-outline-variant relative"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-10"
          >
            <div>
              <h2 className="font-headline font-black text-3xl tracking-tighter uppercase italic text-on-surface">
                Design & Tools
              </h2>
              <p className="text-on-surface-variant font-medium text-sm">
                The artisan&apos;s palette for digital worlds.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {tools.map((tool, index) => (
              <motion.div
                key={tool.name}
                variants={fadeUp}
                whileHover={{
                  rotate: index % 2 === 0 ? 2 : -2,
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className={`text-center p-5 bg-surface-container-low rounded-xl cursor-pointer group ${
                  index % 2 === 0 ? "rotate-1" : "-rotate-1"
                }`}
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 mx-auto mb-3 bg-white rounded-2xl flex items-center justify-center shadow-sm"
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${tool.color} transition-colors duration-300`}
                  >
                    {tool.icon}
                  </span>
                </motion.div>
                <h4 className="font-headline font-bold text-sm">{tool.name}</h4>
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                  className={`mt-2 h-1 mx-auto rounded-full ${tool.barColor}`}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1 }}
            className="mt-10 text-center"
          >
            <motion.span
              initial={{ rotate: -4 }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="font-headline font-bold text-base px-4 py-2 border-2 border-primary rotate-[-2deg] inline-block bg-white cursor-pointer"
            >
              Always learning. Always doodling.
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
