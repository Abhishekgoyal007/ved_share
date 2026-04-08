import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const getInitialTheme = () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedTheme = window.localStorage.getItem("vedshare-theme");
            if (savedTheme) return savedTheme;
            
            if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
                return "light";
            }
        }
        return "dark";
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        const applyTheme = (currentTheme) => {
            const root = window.document.documentElement;
            if (currentTheme === "dark") {
                root.classList.add("dark");
                root.classList.remove("light");
            } else {
                root.classList.add("light");
                root.classList.remove("dark");
            }
            localStorage.setItem("vedshare-theme", currentTheme);
        };

        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
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
