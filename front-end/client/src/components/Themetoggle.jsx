import { useTheme } from "../context/Themecontext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  console.log("Current theme:", theme); // Debug log

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        fixed bottom-6 right-6 z-[200]
        w-12 h-12 rounded-2xl
        flex items-center justify-center
        border shadow-lg transition-all duration-200 active:scale-90
        ${isDark
          ? "bg-slate-800 border-slate-700 hover:bg-slate-700 shadow-black/30"
          : "bg-white border-slate-200 hover:bg-slate-50 shadow-slate-200/80"
        }
      `}
    >
      <span className="text-lg select-none leading-none">
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
};

export default ThemeToggle;