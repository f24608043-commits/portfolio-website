import { motion, useInView, useReducedMotion } from "framer-motion";
import { jobs } from "../data/experience";
import { staggerContainer, fadeUp, textRevealContainer, textReveal, staggerItem, slideInFromLeft, slideInFromRight } from "../animations/variants";

export default function Experience() {
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView({ once: true, margin: "-100px" });

  const headlineWords = ["Work", "Experience"];

  return (
    <section id="experience" className="bg-[#fcf8f1] py-28 px-6 rounded-[4rem] my-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.h2
            variants={textRevealContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-headline text-5xl md:text-7xl font-black text-on-surface tracking-tighter mb-3"
          >
            {headlineWords.map((word, index) => (
              <span key={index} className="inline-block overflow-hidden mr-3">
                <motion.span variants={shouldReduceMotion ? fadeUp : textReveal} className="inline-block">
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-body text-on-surface-variant max-w-2xl mx-auto text-base"
          >
            A chronological journey of where I&apos;ve worked and the impact I&apos;ve made. Building experiences, leading teams, and delivering results.
          </motion.p>
        </motion.header>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-28"
        >
          {jobs.map((job, index) => (
            <div
              key={job.id}
              className={`flex flex-col ${job.flip ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10`}
            >
              {/* Polaroid Card */}
              <motion.div
                variants={job.flip ? slideInFromRight : slideInFromLeft}
                whileHover={{ rotate: 0, y: -8, boxShadow: "0 30px 60px rgba(0,0,0,0.15)" }}
                className={`w-full lg:w-1/2 ${index === 0 ? "polaroid-tilt-1" : index === 1 ? "polaroid-tilt-2" : "polaroid-tilt-3"} transition-transform duration-500`}
              >
                <div className="bg-surface-container-lowest p-5 shadow-xl rounded-sm border-b-8 border-stone-200">
                  <motion.div className="overflow-hidden rounded-sm">
                    <motion.img
                      src={job.image}
                      alt={job.alt}
                      className="w-full aspect-video object-cover grayscale hover:grayscale-0 transition-all duration-500 rounded-sm"
                      loading="lazy"
                      decoding="async"
                      whileHover={{ scale: 1.02 }}
                    />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mt-5 font-headline font-black text-xl text-on-surface uppercase italic"
                  >
                    {job.company}
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className={`${job.roleColor} font-bold text-xs tracking-widest uppercase`}
                  >
                    {job.role} • {job.period}
                  </motion.div>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                variants={job.flip ? slideInFromLeft : slideInFromRight}
                className="w-full lg:w-1/2 px-2"
              >
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="font-headline italic text-tertiary text-lg mb-3 font-bold"
                >
                  Highlights //
                </motion.h3>

                <motion.ul
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-3 text-on-surface-variant leading-relaxed text-sm"
                >
                  {job.highlights.map((highlight, i) => (
                    <motion.li
                      key={i}
                      variants={staggerItem}
                      whileHover={{ x: 8 }}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <motion.span
                        animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                        className={`material-symbols-outlined ${job.highlightIconColor} text-lg mt-0.5`}
                      >
                        {job.highlightIcon}
                      </motion.span>
                      {highlight}
                    </motion.li>
                  ))}
                </motion.ul>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 flex gap-2 flex-wrap"
                >
                  {job.tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", delay: 0.6 + i * 0.1 }}
                      whileHover={{ scale: 1.1, backgroundColor: "#f8f4e1" }}
                      className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold border border-outline-variant/10 cursor-pointer"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
