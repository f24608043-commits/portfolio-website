import { useRef, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { milestones, certifications } from "../data/education";
import { staggerContainer, fadeUp, textRevealContainer, textReveal, slideInFromLeft, slideInFromRight, popIn } from "../animations/variants";

gsap.registerPlugin(ScrollTrigger);

export default function Education() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (shouldReduceMotion || !timelineRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        timelineRef.current,
        { height: 0 },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  const headlineWords = ["Milestone", "Map"];

  return (
    <section
      id="education"
      ref={containerRef}
      className="py-28 px-6 max-w-5xl mx-auto relative overflow-hidden"
    >
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <motion.h2
          variants={textRevealContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-headline text-5xl md:text-7xl font-black text-on-surface tracking-tighter mb-3 inline-block relative"
        >
          {headlineWords.map((word, index) => (
            <span key={index} className="inline-block overflow-hidden mr-3">
              <motion.span
                variants={shouldReduceMotion ? fadeUp : textReveal}
                className={`inline-block ${word === "Map" ? "text-primary italic" : ""}`}
              >
                {word}
              </motion.span>
            </span>
          ))}
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "100%" } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -bottom-1 left-0 h-3 bg-tertiary-container/40 -z-10 rounded-full rotate-1"
          />
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto mt-5"
        >
          A visual journey through my academic adventures and technical growth.
        </motion.p>
      </motion.header>

      <div className="relative space-y-24">
        {/* Animated Timeline Line */}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px hidden md:block overflow-hidden">
          <div
            ref={timelineRef}
            className="w-full border-l-2 border-dashed border-tertiary/30 h-0"
          />
        </div>

        {milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            className="relative flex flex-col md:flex-row items-center justify-between group"
          >
            {/* Left Content */}
            <motion.div
              variants={milestone.side === "left" ? slideInFromLeft : slideInFromRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className={`md:w-5/12 ${milestone.side === "left" ? "order-1" : "order-3 md:order-3"}`}
            >
              {milestone.side === "left" ? (
                <motion.div
                  whileHover={{ rotate: 0, y: -4 }}
                  className="bg-surface-container-lowest p-7 rounded-xl shadow-lg relative -rotate-2 group-hover:rotate-0 transition-transform"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-primary"
                  >
                    <span className="material-symbols-outlined text-3xl">push_pin</span>
                  </motion.div>
                  <span className="font-headline font-bold text-tertiary uppercase tracking-widest text-xs block mb-2">
                    {milestone.period}
                  </span>
                  <h3 className="font-headline text-2xl font-black text-on-surface mb-2">
                    {milestone.school}
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">
                    {milestone.description}
                  </p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {milestone.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-container px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="font-doodle text-tertiary text-xl inline-block"
                >
                  {milestone.doodle}
                </motion.span>
              )}
            </motion.div>

            {/* Timeline Node */}
            <motion.div
              variants={popIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, rotate: 360 }}
              className={`relative z-10 flex items-center justify-center bg-white rounded-full shadow-xl my-8 md:my-0 order-2 ${
                index === 2 ? "w-20 h-20 border-4 border-secondary" : "w-16 h-16 border-4 border-tertiary-container"
              }`}
            >
              <motion.span
                animate={shouldReduceMotion ? {} : { rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                className={`material-symbols-outlined ${milestone.doodleColor} ${
                  index === 2 ? "text-4xl" : "text-3xl"
                }`}
              >
                {milestone.icon}
              </motion.span>
            </motion.div>

            {/* Right Content */}
            <motion.div
              variants={milestone.side === "left" ? slideInFromRight : slideInFromLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className={`md:w-5/12 ${milestone.side === "left" ? "order-3" : "order-1 md:order-1"}`}
            >
              {milestone.side === "left" ? (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="font-doodle text-tertiary text-xl inline-block"
                >
                  {milestone.doodle}
                </motion.span>
              ) : (
                <motion.div
                  whileHover={{ rotate: 0, y: -4 }}
                  className="bg-surface-container-lowest p-7 rounded-xl shadow-lg relative rotate-2 group-hover:rotate-0 transition-transform"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-primary"
                  >
                    <span className="material-symbols-outlined text-3xl">push_pin</span>
                  </motion.div>
                  <span className="font-headline font-bold text-tertiary uppercase tracking-widest text-xs block mb-2">
                    {milestone.period}
                  </span>
                  <h3 className="font-headline text-2xl font-black text-on-surface mb-2">
                    {milestone.school}
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">
                    {milestone.description}
                  </p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {milestone.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-container px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-24"
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-10"
        >
          <motion.span
            animate={shouldReduceMotion ? {} : { rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="material-symbols-outlined text-tertiary text-3xl"
          >
            edit_note
          </motion.span>
          <h2 className="font-headline text-3xl font-black text-on-surface">
            Sketchy <span className="text-primary italic">Notes</span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              variants={fadeUp}
              whileHover={{ scale: 1.02, rotate: 0 }}
              className={`bg-surface-container p-7 rounded-xl border-2 border-dashed border-outline-variant/30 relative cursor-pointer ${
                index === 0 ? "rotate-2" : "-rotate-2"
              } hover:rotate-0 transition-transform`}
            >
              <motion.div
                initial={{ scale: 0, rotate: index === 0 ? 12 : -12 }}
                whileInView={{ scale: 1, rotate: index === 0 ? 12 : -12 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, rotate: 0 }}
                className={`absolute -right-3 -top-3 w-10 h-10 ${cert.iconBg} rounded-full flex items-center justify-center shadow-md`}
              >
                <span className={`material-symbols-outlined ${cert.iconColor} text-sm`}>
                  {cert.icon}
                </span>
              </motion.div>
              <h4 className="font-headline font-bold text-lg mb-1">{cert.title}</h4>
              <p className="text-on-surface-variant text-sm italic mb-4">{cert.description}</p>
              <span className="text-xs font-bold text-on-surface-variant/60">{cert.badge}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
