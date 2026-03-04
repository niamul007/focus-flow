import { useState, useEffect } from 'react';

/**
 * TIMER COMPONENT
 * ---------------
 * Purpose: A high-precision countdown engine for Pomodoro sessions.
 * @param {Function} onComplete - Callback triggered when the clock hits 00:00.
 * @param {Boolean} isActiveTask - Prevents the timer from starting if no mission is selected.
 */
const Timer = ({ onComplete, isActiveTask }) => {
  // 1. STATE: We track time in TOTAL SECONDS (easier for math than tracking mins/secs separately).
  const [seconds, setSeconds] = useState(25 * 60); 
  const [isActive, setIsActive] = useState(false);

  /**
   * 2. THE ENGINE (useEffect)
   * This is the "Gravity" of the app. It pulls the time down every 1000ms.
   */
  useEffect(() => {
    let interval = null;

    // A. The Countdown Logic
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } 
    // B. The Finish Line
    else if (seconds === 0) {
      setIsActive(false);
      onComplete(); // Tells the parent (Dashboard) the mission is accomplished
    }

    // C. THE CLEANUP: Extremely important! 
    // This kills the interval when the component disappears to prevent memory leaks.
    return () => clearInterval(interval);
  }, [isActive, seconds, onComplete]);

  /**
   * 3. THE "PILOT MATH" (Formatting)
   * We take the raw seconds and turn them into a human-readable format.
   */
  
  // Math.floor chops off the decimals to give us whole minutes.
  const mins = Math.floor(seconds / 60); 
  
  // The Modulo (%) gives us the remaining seconds after minutes are taken out.
  const secs = seconds % 60; 

  // ... (JSX to display the mins and secs follows)

  return (
    <div className="flex flex-col items-center py-4">
      {/* 1. THE CLOCK FACE */}
      <div className={`relative flex items-center justify-center w-56 h-56 rounded-full border-4 transition-all duration-700 
        ${isActive ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-slate-100'}`}>
        
        <div className="text-center">
          <span className="text-6xl font-black text-slate-800 tabular-nums tracking-tighter">
            {mins}:{secs < 10 ? '0' : ''}{secs}
          </span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            Minutes Left
          </p>
        </div>
      </div>

      {/* 2. WARNING MESSAGE */}
      <div className="h-8 mt-6">
        {!isActiveTask ? (
          <p className="text-rose-500 text-xs font-semibold animate-pulse">
            ⚠️ Select a task to begin
          </p>
        ) : (
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest">
            Ready for Flow
          </p>
        )}
      </div>

      {/* 3. CONTROL BUTTONS */}
      <div className="flex gap-4 w-full mt-2">
        <button 
          disabled={!isActiveTask}
          onClick={() => setIsActive(!isActive)}
          className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg
            ${isActive 
              ? 'bg-amber-500 text-white shadow-amber-200' 
              : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
            } 
            disabled:opacity-20 disabled:shadow-none disabled:grayscale disabled:cursor-not-allowed`}
        >
          {isActive ? 'Pause' : 'Start Session'}
        </button>
        
        <button 
          onClick={() => { setIsActive(false); setSeconds(25*60); }}
          className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase hover:bg-slate-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;