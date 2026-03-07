import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // If user previously chose a theme, use that
    const saved = localStorage.getItem("focusflow-theme");
    if (saved === "dark" || saved === "light") return saved;
    // Otherwise auto-detect from system
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Apply dark class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Save user's explicit choice
    localStorage.setItem("focusflow-theme", theme);
  }, [theme]);

  // Watch for system changes — but only when user has NOT manually set a preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e) => {
      // Only follow system changes if user hasn't explicitly chosen
      const saved = localStorage.getItem("focusflow-theme");
      if (!saved) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  // This is what the toggle button calls — always overrides system preference
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);