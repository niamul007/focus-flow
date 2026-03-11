/**
 * CONTEXT/THEMECONTEXT.JSX — DARK/LIGHT MODE MANAGER
 * ----------------------------------------------------
 * Manages the app's theme state with three layers of priority:
 *
 * 1. User's explicit choice (localStorage) — highest priority
 * 2. System preference (OS dark/light mode) — auto-detected
 * 3. Live system changes — watched while app is open
 *
 * Exports three things:
 * ThemeContext → the channel (used with useContext in components)
 * ThemeProvider → the broadcaster (wraps app in main.jsx)
 * useTheme → a convenience hook (shortcut for useContext(ThemeContext))
 */

import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

  /**
   * Initialize theme state with a function (lazy initialization).
   * Passing a function to useState means it only runs ONCE on mount —
   * not on every re-render. Good for expensive operations like
   * reading localStorage or checking system preferences.
   *
   * Priority order:
   * 1. Check localStorage for a previously saved explicit choice
   * 2. Fall back to system preference detection
   */
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("focusflow-theme");

    /**
     * Safety check — only accept exactly "dark" or "light".
     * localStorage could contain null (first visit), corrupted data,
     * or values set by other apps. This prevents invalid theme states.
     */
    if (saved === "dark" || saved === "light") return saved;

    /**
     * No valid saved preference — auto-detect from OS/browser setting.
     * window.matchMedia() lets JavaScript check CSS media queries.
     * "(prefers-color-scheme: dark)" matches when OS is in dark mode.
     * .matches → true = dark mode, false = light mode
     */
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  /**
   * Apply theme to the DOM whenever theme state changes.
   * Runs on mount and every time theme changes.
   *
   * WHY document.documentElement (the <html> element)?
   * Tailwind's dark mode works by checking if any ancestor has class="dark".
   * <html> is the ancestor of everything — adding "dark" here activates
   * ALL dark: variants across the entire app simultaneously.
   *
   * Also saves the choice to localStorage so it persists across sessions.
   */
  useEffect(() => {
    const root = document.documentElement; // always the <html> element

    if (theme === "dark") {
      root.classList.add("dark");    // <html class="dark"> → all dark: styles activate
    } else {
      root.classList.remove("dark"); // <html class=""> → dark: styles deactivate
    }

    // Persist explicit choice — read back on next visit in useState initializer
    localStorage.setItem("focusflow-theme", theme);
  }, [theme]); // re-runs whenever theme changes

  /**
   * Watch for live OS theme changes while the app is open.
   * e.g. user switches Mac from light to dark in System Preferences
   * while FocusFlow is open — app responds instantly.
   *
   * Only follows system changes if user has NOT manually chosen a theme.
   * User's explicit toggle always takes priority over system changes.
   *
   * CLEANUP FUNCTION (the return):
   * Removes the event listener when ThemeProvider unmounts.
   * Prevents memory leaks — without this the listener keeps
   * running in memory even after the component is gone.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = (e) => {
      const saved = localStorage.getItem("focusflow-theme");

      /**
       * !saved means no explicit user choice exists.
       * Only then do we follow the system change.
       * If user manually toggled the theme, we respect their choice
       * and ignore OS changes.
       */
      if (!saved) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);

    // Cleanup — remove listener when component unmounts
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []); // [] = set up listener once on mount only

  /**
   * toggleTheme — flip between dark and light
   * ------------------------------------------
   * Uses functional update (prev => ...) to always base the new
   * state on the current state — safer than reading theme directly
   * when state updates might be batched by React.
   *
   * Calling this always overrides system preference — the choice
   * gets saved to localStorage in the useEffect above.
   */
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  /**
   * Broadcast theme and toggleTheme to the entire app.
   * theme → current theme string: "dark" or "light"
   * toggleTheme → function to flip the theme
   */
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme — convenience hook
 * ----------------------------
 * A shortcut so components don't need to import both useContext
 * and ThemeContext separately. Instead of:
 *
 * import { useContext } from "react"
 * import { ThemeContext } from "../context/ThemeContext"
 * const { theme, toggleTheme } = useContext(ThemeContext)
 *
 * They can just do:
 * import { useTheme } from "../context/ThemeContext"
 * const { theme, toggleTheme } = useTheme()
 *
 * Same result — just cleaner and less imports.
 */
export const useTheme = () => useContext(ThemeContext);