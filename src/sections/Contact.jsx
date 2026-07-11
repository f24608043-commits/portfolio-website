import { useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { staggerContainer, fadeUp, textRevealContainer, textReveal, slideInFromLeft, slideInFromRight } from "../animations/variants";

export default function Contact() {
  const shouldReduceMotion = useReducedMotion();
  const { ref, isInView } = useScrollAnimation(0.1);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const headlineWords = ["Let's", "Build", "Something", "Fun!"];

  return (
    <section id="contact" ref={ref} className="py-28 px-6 relative overflow-hidden bg-white">
      {/* Background Decorations */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -20, 0], rotate: [12, 15, 12], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute -top-10 -right-10 text-tertiary hidden md:block"
      >
        <span className="material-symbols-outlined text-8xl">cloud</span>
      </motion.div>

      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, 20, 0], rotate: [-12, -15, -12], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute -bottom-10 -left-10 text-secondary hidden md:block"
      >
        <span className="material-symbols-outlined text-8xl">send</span>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, type: "spring" }}
          className="lg:col-span-5 flex flex-col gap-7"
        >
          <motion.h1
            variants={textRevealContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="font-headline text-4xl md:text-6xl font-black text-on-surface tracking-tighter leading-none"
          >
            {headlineWords.map((word, index) => (
              <span key={index} className="inline-block overflow-hidden mr-3">
                <motion.span
                  variants={shouldReduceMotion ? fadeUp : textReveal}
                  className={`inline-block ${word === "Fun!" ? "text-primary italic sketch-underline" : ""}`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="text-base text-on-surface-variant font-medium"
          >
            I&apos;m currently looking for new adventures and 3D mischief. Send a paper airplane my way!
          </motion.p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-col gap-4 mt-2"
          >
            {[
              {
                icon: "mail",
                color: "bg-secondary-container",
                textColor: "text-secondary",
                label: "Email Me",
                value: "hello@abubakar.anim",
                rotation: -1,
                hoverRotation: 1,
              },
              {
                icon: "call",
                color: "bg-tertiary-container",
                textColor: "text-on-tertiary-container",
                label: "Ring Me",
                value: "+1 (555) DOODLE-01",
                rotation: 1.5,
                hoverRotation: -1.5,
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                whileHover={{
                  rotate: item.hoverRotation,
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
                style={{ rotate: item.rotation }}
                className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border-2 border-dashed border-outline-variant/30 flex items-center gap-4 cursor-pointer transition-all"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`${item.color} p-3 rounded-full ${item.textColor}`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                </motion.div>
                <div>
                  <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">
                    {item.label}
                  </p>
                  <p className="text-lg font-bold font-headline">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50, y: 60 }}
          animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{ duration: 0.6, type: "spring", delay: 0.3 }}
          className="lg:col-span-7 relative"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ delay: 0.4 }}
            whileHover={{ boxShadow: "0 30px 60px rgba(0,0,0,0.15)" }}
            className="bg-surface-container-low rounded-xl p-8 md:p-10 shadow-2xl relative border-b-8 border-r-8 border-stone-200"
          >
            {/* Form Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-5 left-1/2 -translate-x-1/2 bg-surface-container-high px-7 py-2 rounded-t-2xl border-t-2 border-x-2 border-outline-variant/20 font-headline font-black text-on-surface-variant tracking-widest text-xs"
            >
              NEW MESSAGE
            </motion.div>

            {isSubmitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-10"
              >
                <motion.div
                  animate={shouldReduceMotion ? {} : { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h3 className="font-headline font-black text-2xl text-primary mb-2">Message Sent!</h3>
                <p className="text-on-surface-variant">Thanks for reaching out. I&apos;ll get back to you soon!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 text-secondary font-bold underline"
                >
                  Send another message
                </motion.button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { name: "name", label: "WHO ARE YOU?", placeholder: "Your Name", type: "text" },
                    { name: "email", label: "WHERE TO REPLY?", placeholder: "email@example.com", type: "email" },
                  ].map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="space-y-1"
                    >
                      <label className="font-headline font-black text-xs text-on-surface/60 ml-1">
                        {field.label}
                      </label>
                      <motion.input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required
                        whileFocus={{ scale: 1.02, borderColor: "#006a9c" }}
                        className="w-full bg-surface-container-lowest border-2 border-outline-variant/30 rounded-lg px-5 py-3 outline-none text-on-surface font-bold text-sm transition-all focus:border-secondary"
                      />
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8 }}
                  className="space-y-1"
                >
                  <label className="font-headline font-black text-xs text-on-surface/60 ml-1">
                    WHAT&apos;S ON YOUR MIND?
                  </label>
                  <motion.textarea
                    name="message"
                    rows="5"
                    placeholder="Let's make some magic..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    whileFocus={{ scale: 1.01, borderColor: "#b5381d" }}
                    className="w-full bg-surface-container-lowest border-2 border-outline-variant/30 rounded-lg px-5 py-3 outline-none text-on-surface font-bold resize-none text-sm transition-all focus:border-primary"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.9 }}
                  className="relative group"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileHover={{ opacity: 1, x: -60 }}
                    className="absolute -left-16 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block"
                  >
                    <span className="font-headline font-black text-tertiary text-2xl italic tracking-tighter">
                      ZIP!!
                    </span>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 15px 30px rgba(181,56,29,0.3)",
                      y: -2,
                    }}
                    whileTap={{ scale: 0.98, y: 2, boxShadow: "0 5px 0 0 #4a0800" }}
                    animate={isSubmitting ? { scale: 0.95 } : {}}
                    className="w-full bg-primary text-on-primary py-5 rounded-xl font-headline font-black text-xl flex items-center justify-center gap-3 shadow-[0_8px_0_0_#4a0800] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden relative"
                  >
                    {isSubmitting ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="material-symbols-outlined text-3xl"
                      >
                        sync
                      </motion.span>
                    ) : (
                      <>
                        <span>SEND MESSAGE</span>
                        <motion.span
                          animate={shouldReduceMotion ? {} : { x: [0, 5, 0], y: [0, -2, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="material-symbols-outlined text-3xl"
                        >
                          send
                        </motion.span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
