import { motion } from "framer-motion";

const footerLinks = [
  { label: "Home", id: "home" },
  { label: "Education", id: "education" },
  { label: "Experience", id: "experience" },
  { label: "Skills", id: "skills" },
  { label: "Honors", id: "awards" },
  { label: "Projects", id: "projects" },
  { label: "Contact", id: "contact" },
];

const socialIcons = [
  { icon: "code", href: "#" },
  { icon: "account_circle", href: "#" },
  { icon: "box", href: "#" },
  { icon: "mail", href: "#" },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-surface-container-lowest pt-16 pb-8 px-6 rounded-t-[4rem]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          {/* Logo & Copyright */}
          <div className="space-y-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-2xl font-black italic tracking-tighter text-orange-900 cursor-pointer"
              onClick={scrollToTop}
            >
              Abubakar.anim
            </motion.div>
            <p className="text-on-surface-variant text-sm">
              © 2024 Muhammad Abubakar. All rights reserved.
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <motion.a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                whileHover={{ y: -2 }}
                className="text-on-surface-variant text-sm hover:text-primary transition-colors"
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Social & Scroll to Top */}
          <div className="flex items-center gap-4">
            {socialIcons.map((social) => (
              <motion.a
                key={social.icon}
                href={social.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">{social.icon}</span>
              </motion.a>
            ))}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="ml-2 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined">arrow_upward</span>
            </motion.button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-outline-variant/20 text-center">
          <p className="text-on-surface-variant/60 text-xs">
            Built with React, Tailwind CSS, and lots of ☕
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
