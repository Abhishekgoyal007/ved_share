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
            className={`relative p-2 rounded-xl transition-all duration-300 ${isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } ${className}`}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ duration: 0.3 }}
            >
                {isDark ? (
                    <Sun size={20} className="text-yellow-400" />
                ) : (
                    <Moon size={20} className="text-gray-700" />
                )}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
