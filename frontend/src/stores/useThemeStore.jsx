import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check localStorage or system preference
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem("vedshare-theme");
        if (savedTheme) return savedTheme;

        // Check system preference
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
            return "light";
        }
        return "dark"; // Default to dark
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        // Apply theme to document
        const root = document.documentElement;

        if (theme === "light") {
            root.classList.remove("dark");
            root.classList.add("light");
        } else {
            root.classList.remove("light");
            root.classList.add("dark");
        }

        // Save to localStorage
        localStorage.setItem("vedshare-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const setDarkMode = () => setTheme("dark");
    const setLightMode = () => setTheme("light");

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setDarkMode, setLightMode, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
