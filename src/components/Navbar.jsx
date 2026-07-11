import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveSection } from "../hooks/useActiveSection";

const navLinks = [
  { id: "home", label: "Home" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "awards", label: "Honors" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection(navLinks.map((link) => link.id));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-10 py-3 glass-nav bg-white/85 shadow-[0_8px_32px_rgba(57,56,45,0.08)] rounded-b-[2rem] transition-all duration-300 ${
          scrolled ? "shadow-lg" : ""
        }`}
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="text-xl font-black italic tracking-tighter text-orange-900 cursor-pointer"
          onClick={(e) => handleNavClick(e, "home")}
        >
          Abubakar.anim
        </motion.div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 font-headline font-bold text-base">
          {navLinks.map((link) => (
            <motion.a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              whileHover={{ y: -2 }}
              className={`nav-link transition-all ${
                activeSection === link.id
                  ? "text-primary"
                  : "text-stone-600 hover:text-primary"
              }`}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* Say Hi Button (Desktop) */}
        <motion.a
          href="#contact"
          onClick={(e) => handleNavClick(e, "contact")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden lg:block bg-primary text-on-primary px-5 py-2 rounded-full font-bold shadow-md text-sm hover:brightness-110 transition-all"
        >
          Say Hi!
        </motion.a>

        {/* Mobile Hamburger */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-surface-container"
        >
          <span className="material-symbols-outlined">
            {isMobileMenuOpen ? "close" : "menu"}
          </span>
        </motion.button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-16 left-0 right-0 z-40 glass-nav bg-white/95 shadow-lg rounded-b-2xl py-4 px-6 flex flex-col gap-3 font-headline font-bold overflow-hidden"
          >
            {navLinks.map((link, index) => (
              <motion.a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`py-2 border-b border-stone-100 last:border-0 ${
                  activeSection === link.id
                    ? "text-primary"
                    : "text-stone-700 hover:text-primary"
                }`}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
