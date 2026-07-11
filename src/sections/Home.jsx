import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { staggerContainer, fadeUp, textReveal, textRevealContainer } from "../animations/variants";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Forest SVG Background Component
const ForestBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Gradient Sky */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#e8f4f0] via-[#f4efe6] to-[#d4e5d8]" />
    
    {/* SVG Layer 1: Far Background Trees */}
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ duration: 1.5 }}
      className="absolute bottom-0 left-0 w-full h-[60%]"
      viewBox="0 0 1440 400"
      preserveAspectRatio="none"
    >
      <path
        d="M0,400 L0,250 Q60,200 120,250 T240,220 Q300,180 360,230 T480,200 Q540,160 600,210 T720,190 Q780,150 840,200 T960,180 Q1020,140 1080,190 T1200,170 Q1260,130 1320,180 T1440,160 L1440,400 Z"
        fill="#6a8f6b"
        opacity="0.4"
      />
    </motion.svg>

    {/* SVG Layer 2: Mid Trees */}
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.8 }}
      transition={{ duration: 1.5, delay: 0.3 }}
      className="absolute bottom-0 left-0 w-full h-[50%]"
      viewBox="0 0 1440 350"
      preserveAspectRatio="none"
    >
      <path
        d="M0,350 L0,180 Q80,120 160,180 T320,150 Q400,100 480,160 T640,130 Q720,80 800,140 T960,110 Q1040,60 1120,120 T1280,100 Q1360,50 1440,110 L1440,350 Z"
        fill="#4a7a5c"
        opacity="0.6"
      />
    </motion.svg>

    {/* SVG Layer 3: Near Trees */}
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      className="absolute bottom-0 left-0 w-full h-[35%]"
      viewBox="0 0 1440 250"
      preserveAspectRatio="none"
    >
      <path
        d="M-50,250 L-50,100 Q30,50 110,110 T230,80 Q310,30 390,90 T550,70 Q630,20 710,80 T870,60 Q950,10 1030,70 T1190,50 Q1270,0 1350,60 T1510,80 L1510,250 Z"
        fill="#2f5d50"
      />
    </motion.svg>

    {/* Light Rays */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ duration: 2, delay: 0.8 }}
      className="absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b from-yellow-100 via-transparent to-transparent rotate-12 origin-top"
      style={{ filter: "blur(20px)" }}
    />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.12 }}
      transition={{ duration: 2, delay: 1 }}
      className="absolute top-0 left-1/2 w-3 h-full bg-gradient-to-b from-amber-100 via-transparent to-transparent -rotate-6 origin-top"
      style={{ filter: "blur(25px)" }}
    />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
      transition={{ duration: 2, delay: 1.2 }}
      className="absolute top-0 right-1/3 w-2 h-full bg-gradient-to-b from-yellow-50 via-transparent to-transparent rotate-6 origin-top"
      style={{ filter: "blur(18px)" }}
    />

    {/* Grain Texture Overlay */}
    <div 
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  </div>
);

// Doodle Arrow Component
const DoodleArrow = ({ direction, className, delay = 0 }) => {
  const paths = {
    left: "M20,10 Q5,20 20,30 L25,25",
    right: "M5,10 Q20,20 5,30 L0,25",
    up: "M10,25 Q20,10 30,25 L25,20",
    down: "M10,5 Q20,20 30,5 L25,10",
    curved: "M5,25 Q15,5 30,15 Q40,25 30,35",
  };
  
  return (
    <motion.svg
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay, ease: "easeInOut" }}
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
    >
      <motion.path
        d={paths[direction] || paths.curved}
        stroke="#8b5e3c"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.svg>
  );
};

// Handwritten Label Component
const HandwrittenLabel = ({ text, position, rotate = 0, delay = 0, color = "#8b5e3c" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, rotate: rotate - 5 }}
    animate={{ opacity: 1, scale: 1, rotate }}
    transition={{ delay, type: "spring", stiffness: 200 }}
    whileHover={{ scale: 1.1, rotate: rotate + 5 }}
    className="absolute font-doodle text-sm md:text-base pointer-events-auto cursor-pointer"
    style={{ color, top: position.top, left: position.left, right: position.right, bottom: position.bottom }}
  >
    <span className="relative inline-block bg-white/80 px-3 py-1.5 rounded-xl shadow-sm backdrop-blur-sm border border-[#8b5e3c]/20">
      {text}
      <svg className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-3" viewBox="0 0 48 12">
        <path
          d="M4,8 Q12,4 24,6 Q36,8 44,4"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </span>
  </motion.div>
);

// Floating Leaf Component
const FloatingLeaf = ({ delay, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ 
      opacity: 0.6, 
      y: [0, -30, 0],
      x: [0, 15, -10, 0],
      rotate: [0, 10, -10, 0]
    }}
    transition={{ 
      opacity: { duration: 1, delay },
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      x: { duration: 5, repeat: Infinity, ease: "easeInOut", delay },
      rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay }
    }}
    className={className}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#6a8f6b">
      <path d="M12,2 Q16,8 20,12 Q16,16 12,22 Q8,16 4,12 Q8,8 12,2 Z" />
    </svg>
  </motion.div>
);

// Scribble Circle Component
const ScribbleCircle = ({ className, delay = 0 }) => (
  <motion.svg
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 0.4 }}
    transition={{ duration: 1.5, delay }}
    className={className}
    width="60"
    height="60"
    viewBox="0 0 60 60"
  >
    <motion.path
      d="M30,5 Q45,5 50,20 Q55,35 45,45 Q35,55 20,50 Q5,45 5,30 Q5,15 20,10 Q30,5 30,5"
      stroke="#8b5e3c"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </motion.svg>
);

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const layer3Ref = useRef(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.to(layer1Ref.current, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      gsap.to(layer2Ref.current, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      gsap.to(layer3Ref.current, {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  const headlineWords = ["Crafting", "Stories", "Through", "Design", "&", "Motion"];

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-4 overflow-hidden"
      style={{ backgroundColor: "#f4efe6" }}
    >
      {/* Illustrated Forest Background */}
      <ForestBackground />
      
      {/* Parallax Forest Layers Refs */}
      <div ref={layer1Ref} className="absolute bottom-0 left-0 w-full h-[60%] pointer-events-none" />
      <div ref={layer2Ref} className="absolute bottom-0 left-0 w-full h-[50%] pointer-events-none" />
      <div ref={layer3Ref} className="absolute bottom-0 left-0 w-full h-[35%] pointer-events-none" />

      {/* Floating Doodle Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Leaves */}
        <FloatingLeaf delay={0.5} className="absolute top-1/4 left-[10%]" />
        <FloatingLeaf delay={1} className="absolute top-1/3 right-[15%]" />
        <FloatingLeaf delay={1.5} className="absolute top-2/3 left-[20%]" />
        
        {/* Scribble Circles */}
        <ScribbleCircle className="absolute top-[20%] left-[5%]" delay={0.8} />
        <ScribbleCircle className="absolute bottom-[30%] right-[8%]" delay={1.2} />
        <ScribbleCircle className="absolute top-[60%] right-[12%]" delay={1.5} />

        {/* Handwritten Labels with Arrows - Container with relative positioning */}
        <div className="relative w-full h-full max-w-6xl mx-auto">
          {/* That's me! Label */}
          <HandwrittenLabel 
            text="That's me! 👋" 
            position={{ top: "15%", left: "5%", right: "auto", bottom: "auto" }}
            rotate={-8}
            delay={1.5}
          />
          <DoodleArrow 
            direction="right" 
            className="absolute top-[20%] left-[18%]"
            delay={1.7}
          />

          {/* Animation Expert */}
          <HandwrittenLabel 
            text="Animation Expert" 
            position={{ top: "25%", left: "auto", right: "3%", bottom: "auto" }}
            rotate={6}
            delay={1.8}
            color="#2f5d50"
          />
          <DoodleArrow 
            direction="left" 
            className="absolute top-[30%] right-[22%]"
            delay={2}
          />

          {/* Creative Engineer */}
          <HandwrittenLabel 
            text="Creative Engineer" 
            position={{ top: "auto", left: "8%", right: "auto", bottom: "35%" }}
            rotate={4}
            delay={2.1}
            color="#8b5e3c"
          />
          <DoodleArrow 
            direction="up" 
            className="absolute bottom-[42%] left-[25%]"
            delay={2.3}
          />

          {/* Call me! */}
          <HandwrittenLabel 
            text="Call me Abubakar!" 
            position={{ top: "auto", left: "auto", right: "5%", bottom: "20%" }}
            rotate={-5}
            delay={2.4}
            color="#2f5d50"
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
        {/* Hero Text - Centered */}
        <div className="text-center max-w-4xl px-4">
          <motion.h1
            variants={textRevealContainer}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6"
            style={{ color: "#2f5d50" }}
          >
            {headlineWords.map((word, index) => (
              <span key={index} className="inline-block overflow-hidden mr-2 md:mr-3">
                <motion.span
                  variants={shouldReduceMotion ? fadeUp : textReveal}
                  className={`inline-block font-headline ${
                    word === "Stories" || word === "Motion" 
                      ? "italic text-[#8b5e3c]" 
                      : ""
                  }`}
                  style={{
                    textShadow: word === "Stories" || word === "Motion" 
                      ? "2px 2px 0px rgba(139, 94, 60, 0.1)" 
                      : "none"
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          {/* Underline scribble */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex justify-center mb-6 origin-center"
          >
            <svg width="200" height="12" viewBox="0 0 200 12" className="text-[#8b5e3c]">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                d="M5,8 Q50,2 100,6 Q150,10 195,4"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body"
            style={{ color: "#5a4a3a" }}
          >
            Bringing ideas to life with playful precision. 
            Where whimsical design meets thoughtful engineering.
          </motion.p>

          {/* CTA Buttons - Forest Styled */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href="#projects"
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(47, 93, 80, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all text-white"
              style={{ backgroundColor: "#2f5d50" }}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined">forest</span>
                Explore My Work
              </span>
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ y: -4, backgroundColor: "#e8f4f0" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 rounded-2xl font-bold text-lg transition-all"
              style={{ 
                backgroundColor: "#f4efe6",
                borderColor: "#6a8f6b",
                color: "#2f5d50"
              }}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined">send</span>
                Say Hello
              </span>
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* Metrics Cards - Forest Styled */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 w-full max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 px-4"
      >
        {[
          {
            icon: "auto_awesome",
            title: "48+ Projects",
            desc: "Crafted with love and code",
            bg: "#e8f4f0",
            accent: "#2f5d50",
            rotate: "-rotate-2",
          },
          {
            icon: "palette",
            title: "Design & Motion",
            desc: "Where creativity meets tech",
            bg: "#f4efe6",
            accent: "#8b5e3c",
            rotate: "rotate-1",
          },
          {
            icon: "emoji_objects",
            title: "Always Curious",
            desc: "Learning something new daily",
            bg: "#d4e5d8",
            accent: "#6a8f6b",
            rotate: "rotate-2",
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            variants={fadeUp}
            whileHover={{ rotate: 0, y: -8, scale: 1.02 }}
            className={`p-6 rounded-2xl shadow-lg ${metric.rotate} transition-all cursor-pointer border-2`}
            style={{ 
              backgroundColor: metric.bg,
              borderColor: `${metric.accent}20`
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${metric.accent}15`, color: metric.accent }}
            >
              <span className="material-symbols-outlined text-2xl">{metric.icon}</span>
            </motion.div>
            <h3 className="text-lg font-black mb-1" style={{ color: metric.accent }}>
              {metric.title}
            </h3>
            <p className="text-sm" style={{ color: "#5a4a3a" }}>{metric.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Ambient Glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center bottom, rgba(106, 143, 107, 0.15) 0%, transparent 70%)",
        }}
      />
    </section>
  );
}
