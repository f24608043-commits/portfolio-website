import { motion, useInView, useReducedMotion } from "framer-motion";
import { awards } from "../data/awards";
import { staggerContainer, fadeUp, textRevealContainer, textReveal, slideInFromLeft, slideInFromRight, scaleIn } from "../animations/variants";

export default function Awards() {
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView({ once: true, margin: "-100px" });

  const headlineWords = ["Victories", "&", "Doodles"];

  return (
    <section id="awards" className="py-28 px-6 max-w-6xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          whileInView={{ scale: 1, rotate: -2 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          whileHover={{ scale: 1.05, rotate: 0 }}
          className="inline-block px-5 py-1 marker-highlight mb-5 cursor-pointer"
        >
          <span className="font-headline font-black text-primary text-lg uppercase tracking-widest">
            The Wall of Fame
          </span>
        </motion.div>

        <motion.h1
          variants={textRevealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="font-headline font-black text-5xl md:text-7xl text-on-surface leading-none"
        >
          {headlineWords.map((word, index) => (
            <span key={index} className="inline-block overflow-hidden mr-3">
              <motion.span
                variants={shouldReduceMotion ? fadeUp : textReveal}
                className={`inline-block ${word === "Doodles" ? "italic" : ""}`}
                animate={
                  word === "Doodles" && !shouldReduceMotion
                    ? {
                        color: ["#b5381d", "#fdd400", "#b5381d"],
                      }
                    : {}
                }
                transition={{ duration: 3, repeat: Infinity }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto mt-4"
        >
          A collection of moments where hard work met creativity.
        </motion.p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
        {/* Award 1: Poetry */}
        <motion.div
          initial={{ opacity: 0, x: -50, rotate: 0 }}
          whileInView={{ opacity: 1, x: 0, rotate: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring", delay: 0.3 }}
          whileHover={{ rotate: 0, scale: 1.02, boxShadow: "0 30px 60px rgba(0,0,0,0.1)" }}
          className="lg:col-span-7 bg-surface-container rounded-xl p-7 shadow-xl relative group cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, x: -20, y: -20 }}
            whileInView={{ scale: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.5 }}
            whileHover={{ scale: 1.1, rotate: 360 }}
            className="absolute -top-4 -left-4 z-30 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-lg w-11 h-11"
          >
            <span className="material-symbols-outlined text-lg">emoji_events</span>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="w-full md:w-1/3 aspect-[3/4] bg-surface-container-highest rounded-lg overflow-hidden border-4 border-white shadow-inner paper-cutout"
            >
              <motion.img
                src={awards[0].image}
                alt="Trophy"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
                loading="lazy"
                decoding="async"
              />
            </motion.div>

            <div className="flex-1">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="font-headline font-extrabold text-2xl text-on-surface mb-2 italic"
              >
                {awards[0].title}
              </motion.h3>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 mb-3 text-tertiary"
              >
                <motion.span
                  animate={shouldReduceMotion ? {} : { rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="material-symbols-outlined text-base"
                >
                  star
                </motion.span>
                <span className="font-bold uppercase tracking-widest text-xs">{awards[0].subtitle}</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="font-body text-on-surface-variant leading-relaxed text-sm"
              >
                {awards[0].description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="flex gap-3 mt-5 flex-wrap"
              >
                {awards[0].tags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: 0.9 + i * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    className={`px-3 py-1 rounded-full font-bold text-xs ${
                      i === 0
                        ? "bg-tertiary-container/30 text-on-tertiary-container"
                        : "bg-secondary-container/30 text-on-secondary-container"
                    }`}
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Award 2: Innovista */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotate: 0 }}
          whileInView={{ opacity: 1, x: 0, rotate: -1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring", delay: 0.4 }}
          whileHover={{ rotate: 0, scale: 1.02 }}
          className="lg:col-span-5 bg-surface-container-low rounded-xl p-7 shadow-xl relative border-2 border-dashed border-outline-variant cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, x: 20, y: -20 }}
            whileInView={{ scale: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.6 }}
            whileHover={{ scale: 1.1, rotate: -360 }}
            className="absolute -top-4 -right-4 z-30 bg-secondary rounded-full flex items-center justify-center text-on-secondary shadow-lg w-11 h-11"
          >
            <span className="material-symbols-outlined text-base">verified</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="w-full h-40 bg-white rounded-lg shadow-sm border border-stone-100 p-3 flex items-center justify-center overflow-hidden mb-5"
          >
            <motion.img
              src={awards[1].image}
              alt="Certificate"
              className="w-full h-full object-contain"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="font-headline font-extrabold text-xl text-on-surface mb-2"
          >
            {awards[1].title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="font-body text-on-surface-variant leading-relaxed text-sm"
          >
            {awards[1].description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between items-center"
          >
            <div className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-tighter">
              {awards[1].subtitle}
            </div>
            <motion.span
              animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="material-symbols-outlined text-primary"
            >
              volunteer_activism
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Quote Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ scale: 1.02, rotate: 1 }}
          className="lg:col-span-5 bg-tertiary-container rounded-xl p-7 shadow-lg relative overflow-hidden group cursor-pointer"
        >
          <motion.div
            initial={{ x: -20 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <motion.span
              animate={shouldReduceMotion ? {} : { rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="material-symbols-outlined text-3xl mb-3 text-on-tertiary-container block"
            >
              lightbulb
            </motion.span>
            <h4 className="font-headline font-black text-xl text-on-tertiary-container mb-3 italic">
              The Fuel for Doodles
            </h4>
            <p className="text-on-tertiary-container font-medium opacity-90 text-sm">
              &ldquo;Every honor is just a doodle waiting to happen. These certificates aren&apos;t just
              paper; they&apos;re the stories that keep my creative engines running.&rdquo;
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.2, rotate: 15 }}
            className="absolute -bottom-8 -right-8 opacity-20"
          >
            <span className="material-symbols-outlined text-[8rem]">history_edu</span>
          </motion.div>
        </motion.div>

        {/* Sparkle */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", delay: 0.7 }}
          className="lg:col-span-7 flex items-center justify-center py-8"
        >
          <motion.span
            animate={
              shouldReduceMotion
                ? {}
                : {
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }
            }
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity },
            }}
            className="font-doodle text-4xl text-primary"
          >
            ⭐ Bravo! ⭐
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
