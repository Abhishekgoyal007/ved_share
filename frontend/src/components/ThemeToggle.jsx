import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../stores/useThemeStore";

const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`relative p-2.5 rounded-full transition-all duration-300 ${isDark
                    ? "bg-slate-900 border border-slate-800 text-amber-400 hover:border-amber-400/50"
                    : "bg-slate-100 border border-slate-200 text-slate-600 hover:border-primary-500/50"
                } ${className} shadow-sm`}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            <motion.div
                initial={false}
                animate={{ 
                    rotate: isDark ? 0 : 45,
                    scale: isDark ? 1 : 0.9
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {isDark ? (
                    <Sun size={18} strokeWidth={2.5} />
                ) : (
                    <Moon size={18} strokeWidth={2.5} />
                )}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
