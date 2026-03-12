/**
 * COMPONENTS/TIMER.JSX — POMODORO COUNTDOWN TIMER
 * -------------------------------------------------
 * A 25-minute focus timer with an SVG progress ring.
 * Communicates with Dashboard via props:
 *
 * onComplete   → called when timer hits zero → Dashboard shows modal
 * isActiveTask → true if a task is linked → enables Start button
 *
 * Internal state only:
 * seconds  → countdown value (starts at 25 * 60 = 1500)
 * isActive → whether timer is currently running
 *
 * Timer is self-contained — Dashboard doesn't need to know about
 * seconds or isActive, only that the timer completed.
 */

import { useState, useEffect } from "react";

const Timer = ({ onComplete, isActiveTask }) => {

  // seconds — countdown in seconds, starts at 25 minutes
  const [seconds, setSeconds] = useState(25 * 60);

  // isActive — true = timer running, false = paused/stopped
  const [isActive, setIsActive] = useState(false);

  /**
   * playSuccessSound — plays audio notification on timer complete
   * Creates a new Audio object pointing to /success.mp3 in public folder.
   * volume 0.5 = 50% volume
   * .catch(() => {}) silently ignores browser autoplay restrictions
   * — browsers block audio that plays without prior user interaction
   */
  const playSuccessSound = () => {
    const audio = new Audio("/success.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  /**
   * Timer useEffect — the core countdown logic
   * -------------------------------------------
   * Re-runs whenever isActive, seconds, or onComplete changes.
   * Since seconds changes every second, this effect checks state every second.
   *
   * TWO CONDITIONS:
   *
   * 1. isActive && seconds > 0 → timer running, not finished
   *    setInterval ticks every 1000ms, decrements seconds by 1
   *    setSeconds(prev => prev - 1) uses functional update for fresh state
   *
   * 2. seconds === 0 && isActive → timer just hit zero
   *    Runs the completion sequence:
   *    - plays sound
   *    - stops interval
   *    - sets isActive to false
   *    - calls onComplete() → Dashboard shows modal
   *    - resets seconds for next session
   *
   * CLEANUP: return () => clearInterval(interval)
   * Runs before every re-render and on unmount.
   * Prevents multiple intervals stacking up — without this,
   * each re-render would add a NEW interval without stopping the old one.
   */
  useEffect(() => {
    let interval = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((prev) => prev - 1), 1000);

    } else if (seconds === 0 && isActive) {
      playSuccessSound();
      clearInterval(interval);
      setIsActive(false);
      onComplete();        // notify Dashboard → triggers modal if task is linked
      setSeconds(25 * 60); // reset for next Pomodoro session
    }

    return () => clearInterval(interval); // cleanup on every re-render
  }, [isActive, seconds, onComplete]);

  // ── DISPLAY CALCULATIONS ─────────────────────────────────────────────────

  // Split seconds into minutes and remaining seconds for display
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  /**
   * SVG Progress Ring Calculations
   * --------------------------------
   * The ring is an SVG circle with a dashed stroke.
   * strokeDasharray = total circumference (full circle length)
   * strokeDashoffset = how much of the stroke to hide from the start
   *
   * circumference = 2 * π * radius = 2 * π * 80 ≈ 502px
   *
   * progress goes from 0 (start) to 1 (complete)
   * strokeDashoffset goes from circumference (empty ring) to 0 (full ring)
   *
   * At start:    offset = circumference * 1 = full circle hidden → empty ring
   * Halfway:     offset = circumference * 0.5 = half hidden → half ring
   * At complete: offset = circumference * 0 = nothing hidden → full ring
   *
   * CSS transition: "stroke-dashoffset 1s linear" makes it animate smoothly
   */
  const totalSeconds = 25 * 60;
  const progress = (totalSeconds - seconds) / totalSeconds; // 0 to 1
  const circumference = 2 * Math.PI * 80;                   // circle circumference
  const strokeDashoffset = circumference * (1 - progress);  // shrinks as time passes

  return (
    <div className="flex flex-col items-center">

      {/* SVG CLOCK FACE ─────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center w-52 h-52">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 180 180">

          {/* Background track — static grey ring always visible */}
          <circle cx="90" cy="90" r="80" fill="none" strokeWidth="5"
            className="stroke-slate-100 dark:stroke-slate-800" />

          {/* Progress ring — fills as timer counts down
              stroke color: violet when active, light violet when paused
              strokeDashoffset animates with CSS transition */}
          <circle cx="90" cy="90" r="80" fill="none" strokeWidth="5"
            strokeLinecap="round"
            stroke={isActive ? "#7c3aed" : "#ddd6fe"}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>

        {/* Ambient glow — subtle violet blur inside ring when active */}
        {isActive && (
          <div className="absolute inset-6 rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-lg" />
        )}

        {/* TIME DISPLAY ───────────────────────────────────────────────────
            padStart(2, "0") ensures two digits always: 5 → "05", 0 → "00"
            tabular-nums — monospace number rendering prevents layout shift
            as digits change width */}
        <div className="relative text-center z-10">
          <span className="font-display text-5xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter leading-none">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <p className="text-[10px] font-display font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">
            {isActive ? "In Focus" : "Ready"}
          </p>
        </div>
      </div>

      {/* STATUS MESSAGE ─────────────────────────────────────────────────── */}
      <div className="h-8 mt-4 flex items-center">
        {!isActiveTask ? (
          // No task linked — warn user to select a task first
          <p className="text-rose-400 dark:text-rose-500 text-xs font-bold animate-pulse">
            ⚠️ Select a task to begin
          </p>
        ) : (
          // Task linked — show running or ready status
          <p className="text-violet-600 dark:text-violet-400 text-xs font-display font-black uppercase tracking-widest">
            {isActive ? "● Session Running" : "✦ Ready"}
          </p>
        )}
      </div>

      {/* CONTROL BUTTONS ────────────────────────────────────────────────── */}
      <div className="flex gap-3 w-full mt-3">

        {/* Start/Pause button
            disabled when no task is linked — prevents starting without a task
            color changes: violet gradient when ready, amber when running
            onClick toggles isActive — same button handles both start and pause */}
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

        {/* Reset button — stops timer and resets to 25:00
            Always available regardless of task link status */}
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