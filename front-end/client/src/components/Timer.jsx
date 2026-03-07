import { useState, useEffect } from "react";

const Timer = ({ onComplete, isActiveTask }) => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const playSuccessSound = () => {
    const audio = new Audio("/success.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((prev) => prev - 1), 1000);
    } else if (seconds === 0 && isActive) {
      playSuccessSound();
      clearInterval(interval);
      setIsActive(false);
      onComplete();
      setSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, onComplete]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const totalSeconds = 25 * 60;
  const progress = (totalSeconds - seconds) / totalSeconds;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      {/* Clock face */}
      <div className="relative flex items-center justify-center w-52 h-52">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="80" fill="none" strokeWidth="5"
            className="stroke-slate-100 dark:stroke-slate-800" />
          <circle cx="90" cy="90" r="80" fill="none" strokeWidth="5"
            strokeLinecap="round"
            stroke={isActive ? "#7c3aed" : "#ddd6fe"}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>
        {isActive && (
          <div className="absolute inset-6 rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-lg" />
        )}
        <div className="relative text-center z-10">
          <span className="font-display text-5xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter leading-none">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <p className="text-[10px] font-display font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">
            {isActive ? "In Focus" : "Ready"}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="h-8 mt-4 flex items-center">
        {!isActiveTask ? (
          <p className="text-rose-400 dark:text-rose-500 text-xs font-bold animate-pulse">
            ⚠️ Select a task to begin
          </p>
        ) : (
          <p className="text-violet-600 dark:text-violet-400 text-xs font-display font-black uppercase tracking-widest">
            {isActive ? "● Session Running" : "✦ Ready"}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full mt-3">
        <button
          disabled={!isActiveTask}
          onClick={() => setIsActive(!isActive)}
          className={`flex-1 py-3.5 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all duration-200 active:scale-[0.97] shadow-md
            ${isActive
              ? "bg-amber-500 text-white shadow-amber-200 dark:shadow-amber-950/40 hover:bg-amber-400"
              : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-200 dark:shadow-violet-950/40 hover:from-violet-500 hover:to-indigo-500"
            }
            disabled:opacity-25 disabled:shadow-none disabled:cursor-not-allowed`}
        >
          {isActive ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => { setIsActive(false); setSeconds(25 * 60); }}
          className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;