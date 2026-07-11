import { motion } from "framer-motion";

const socialLinks = [
  { icon: "code", href: "#", color: "text-stone-500", hoverBg: "hover:bg-orange-100" },
  { icon: "account_circle", href: "#", color: "", highlight: true },
  { icon: "box", href: "#", color: "text-stone-500", hoverBg: "hover:bg-orange-100" },
  { icon: "mail", href: "#", color: "text-stone-500", hoverBg: "hover:bg-orange-100" },
];

export default function SideSocials() {
  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-3 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3 bg-stone-50/80 backdrop-blur-md rounded-full py-5 w-14 shadow-sm border border-stone-900/10"
    >
      {socialLinks.map((link, index) => (
        <motion.a
          key={link.icon}
          href={link.href}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
          whileHover={{ scale: 1.1, rotate: link.highlight ? 0 : 12 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-full transition-all ${
            link.highlight
              ? "bg-yellow-300 text-stone-900"
              : `${link.color} ${link.hoverBg}`
          }`}
        >
          <span className="material-symbols-outlined text-xl">{link.icon}</span>
        </motion.a>
      ))}
    </motion.aside>
  );
}
