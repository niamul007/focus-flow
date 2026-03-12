/**
 * PAGES/DASHBOARD.JSX — MAIN APPLICATION PAGE
 * ---------------------------------------------
 * The core of FocusFlow. Manages task state and coordinates
 * communication between Timer and TaskList components.
 *
 * STATE OWNED HERE (lifted up):
 * tasks         → full task list, shared between Timer and TaskList
 * activeTaskId  → which task is linked to the timer
 * showModal     → timer complete modal visibility
 * isSaving      → loading state for modal's complete button
 * isLoadingTasks → loading state while fetching tasks
 * networkError  → true if API fetch failed
 *
 * WHY TASKS LIVE HERE AND NOT IN TASKLIST:
 * Timer and TaskList are siblings — both need task data.
 * State must live in their shared parent (Dashboard) so both
 * can access and update it. This is called "lifting state up."
 */

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import Timer from "../components/Timer";
import TaskList from "../components/TaskList";
import API from "../api/axios";
import { toast } from "react-hot-toast";

/**
 * getGreeting — returns time-appropriate greeting
 * Defined OUTSIDE Dashboard so it's not recreated on every render.
 * Pure function — no props, no state, same output for same hour.
 */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

/**
 * ClockWidget — live clock display
 * Defined outside Dashboard — not recreated on every Dashboard render.
 * Has its own internal state (now) updated every second via setInterval.
 *
 * CLEANUP: returns () => clearInterval(t) to stop the interval
 * when the component unmounts — prevents memory leaks.
 */
const ClockWidget = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // setInterval fires every 1000ms, updating the clock
    const t = setInterval(() => setNow(new Date()), 1000);
    // cleanup — stop interval when component unmounts
    return () => clearInterval(t);
  }, []); // [] = set up once on mount

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
  const date = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-200 dark:shadow-violet-950/40 flex flex-col justify-between min-h-[110px]">
      <p className="text-violet-200 text-[10px] font-display font-black uppercase tracking-widest">
        Local Time
      </p>
      <div>
        <p className="font-display text-3xl font-black tracking-tight leading-none">{time}</p>
        <p className="text-violet-200 text-xs font-medium mt-1">{date}</p>
      </div>
    </div>
  );
};

/**
 * StatWidget — reusable stat display card
 * Defined outside Dashboard — not recreated on every render.
 * Accepts props for full customization: label, value, colors, icon.
 * Used 3 times in the widget row with different colors and data.
 */
const StatWidget = ({ label, value, accent, bg, icon }) => (
  <div className={`${bg} rounded-2xl p-5 border shadow-sm flex flex-col justify-between min-h-[110px]`}>
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <span className="text-lg">{icon}</span>
    </div>
    <p className={`font-display text-3xl font-black tracking-tight ${accent}`}>
      {value}
    </p>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  // Task state — lives here because both Timer and TaskList need it
  const [tasks, setTasks] = useState([]);

  // Which task is currently linked to the Pomodoro timer
  // null = no task selected, number = task id
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Controls the "Time's Up!" modal after timer completes
  const [showModal, setShowModal] = useState(false);

  // Loading state for the modal's "Mark as Complete" button
  const [isSaving, setIsSaving] = useState(false);

  // Loading state while tasks are being fetched from API
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // True if the API fetch failed — shows error screen with retry button
  const [networkError, setNetworkError] = useState(false);

  /**
   * Fetch tasks on mount and whenever user.id changes.
   *
   * WHY [user?.id] not []:
   * On page refresh, user starts as null (AuthContext is still verifying).
   * If we used [], fetchTasks would run before user exists → API returns 401.
   * By watching user?.id, the effect re-runs once user is restored by AuthContext.
   *
   * user?.id — optional chaining: if user is null, returns undefined (no crash)
   */
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) {
        setIsLoadingTasks(false);
        return; // user not ready yet — wait for next render
      }
      setIsLoadingTasks(true);
      try {
        const response = await API.get("/tasks");
        // response.data?.data?.tasks — optional chaining for safe access
        // Falls back to [] if structure is unexpected
        setTasks(response.data?.data?.tasks || []);
        setNetworkError(false);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setNetworkError(true);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [user?.id]);

  /**
   * handleTimerComplete — called by Timer when countdown reaches zero.
   * Only shows modal if a task is linked to the timer.
   */
  const handleTimerComplete = () => {
    if (activeTaskId) setShowModal(true);
  };

  /**
   * completeActiveTask — marks the active task as completed.
   * Called when user clicks "Mark as Complete" in the modal.
   *
   * OPTIMISTIC UPDATE PATTERN:
   * 1. Update database via API call
   * 2. Update local React state directly (no re-fetch needed)
   * Faster than re-fetching all tasks — avoids an extra API call.
   */
  const completeActiveTask = async () => {
    if (!activeTaskId) return;
    setIsSaving(true);
    try {
      // Update in database
      await API.put(`/tasks/${activeTaskId}`, { status: "completed" });

      // Update local state — map through tasks, update only the matching one
      // { ...t, status: "completed" } — spread keeps all fields, overwrites status
      setTasks(prev =>
        prev.map(t =>
          t._id === activeTaskId || t.id === activeTaskId
            ? { ...t, status: "completed" }
            : t
        )
      );

      toast.success("Task completed! 🎉");
      setShowModal(false);
      setActiveTaskId(null); // delink task from timer
    } catch (err) {
      toast.error("Could not update task status.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── COMPUTED STATS ─────────────────────────────────────────────────────────
  // Derived from tasks array — recalculated on every render automatically
  // No separate state needed — always in sync with tasks

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;
  // Avoid division by zero — show 0% when no tasks exist
  const completionRate = totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100);

  // ── EARLY RETURNS ──────────────────────────────────────────────────────────
  // These render alternative UIs before the main return
  // React checks these top to bottom — first match renders, rest skipped

  // Network error screen — shown if API fetch failed
  if (networkError) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-[#0f1117] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/50 rounded-2xl flex items-center justify-center mb-5 text-2xl">📡</div>
        <h1 className="font-display font-black text-rose-500 text-xl uppercase tracking-widest">Connection Lost</h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Cannot reach the server.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 text-xs font-display font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-5 py-2.5 rounded-xl hover:border-slate-300 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading screen — shown while tasks are being fetched
  if (isLoadingTasks) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-[#0f1117] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Loading...</p>
      </div>
    );
  }

  // ── MAIN RENDER ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] font-body">

      {/* NAVBAR — sticky top so it stays visible while scrolling
          backdrop-blur-md gives the frosted glass effect */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f1117]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/60 px-6 md:px-10 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-violet-950/50 text-base select-none">🚀</div>
          <span className="font-display text-lg font-black text-slate-900 dark:text-white tracking-tight">FocusFlow</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Avatar + username — hidden on mobile (hidden md:flex) */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Avatar shows first letter of username */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-black select-none shadow-sm">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {user?.username || "Guest"}
            </span>
          </div>
          {/* logout calls AuthContext.logout() → clears token + user state */}
          <button onClick={logout} className="px-4 py-2 text-[10px] font-display font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-200">
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* GREETING HERO ─────────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-7 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-display font-black uppercase tracking-widest mb-2">
                {getGreeting()} {/* Good Morning / Afternoon / Evening */}
              </p>
              <h1 className="font-display text-4xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {user?.username || "there"} 👋
              </h1>

              {/**
               * Dynamic subtitle — nested ternary (if/else if/else inline)
               * Checks conditions in order, first match renders:
               * 1. No tasks at all → encourage adding first task
               * 2. All tasks done → celebrate 🎉
               * 3. Over 50% done → encourage momentum 💪
               * 4. Default → show remaining task count
               */}
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-3 max-w-md">
                {completedTasks === 0 && totalTasks === 0
                  ? "Add your first task and let's get things moving."
                  : completedTasks === totalTasks && totalTasks > 0
                    ? "Every task is done. Outstanding work today! 🎉"
                    : completionRate >= 50
                      ? "You're over halfway there! Keep the momentum going. 💪"
                      : `You have ${totalTasks - completedTasks} task${totalTasks - completedTasks !== 1 ? "s" : ""} to get through today.`}
              </p>
            </div>

            {/**
             * Mini stat badges — array.map() pattern
             * Instead of copy-pasting 3 identical divs with different colors,
             * define data as an array of objects and map to JSX.
             * key={label} required — helps React identify each item in the list.
             */}
            <div className="flex gap-2 flex-wrap md:flex-nowrap shrink-0">
              {[
                { val: totalTasks, label: "Total", bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/50", text: "text-violet-600 dark:text-violet-400", sub: "text-violet-400 dark:text-violet-500" },
                { val: completedTasks, label: "Done", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50", text: "text-emerald-600 dark:text-emerald-400", sub: "text-emerald-400 dark:text-emerald-500" },
                { val: inProgressTasks, label: "Active", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50", text: "text-amber-600 dark:text-amber-400", sub: "text-amber-400 dark:text-amber-500" },
              ].map(({ val, label, bg, text, sub }) => (
                <div key={label} className={`px-5 py-3 ${bg} border rounded-xl text-center min-w-[76px]`}>
                  <p className={`font-display text-2xl font-black ${text}`}>{val}</p>
                  <p className={`text-[9px] font-display font-black uppercase tracking-wider ${sub}`}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WIDGET ROW ─────────────────────────────────────────────────────── */}
        {/* 2 cols on mobile, 4 cols on md+ screens */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ClockWidget />
          <StatWidget label="Completion" value={`${completionRate}%`} accent="text-indigo-600 dark:text-indigo-400" bg="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800" icon="📊" />
          <StatWidget label="Tasks Done" value={`${completedTasks}/${totalTasks}`} accent="text-emerald-600 dark:text-emerald-400" bg="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800" icon="✅" />
          <StatWidget label="In Progress" value={inProgressTasks} accent="text-amber-500 dark:text-amber-400" bg="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800" icon="⚡" />
        </div>

        {/* CONTENT GRID ───────────────────────────────────────────────────── */}
        {/* 12-column grid — Timer takes 4 cols, TaskList takes 8 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Timer — sticky so it stays visible while scrolling tasks */}
          <aside className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-7 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">Focus Timer</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Pomodoro session</p>
                </div>
                {/* Animated bouncing dots decoration */}
                <div className="flex gap-1">
                  {[0, 100, 200].map(d => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
              {/* onComplete → called when timer hits zero → shows modal if task active
                  isActiveTask → Timer uses this to show which task is linked */}
              <Timer onComplete={handleTimerComplete} isActiveTask={!!activeTaskId} />
            </div>
          </aside>

          {/* TaskList — receives tasks state and setters as props */}
          <section className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-7">
              <div className="mb-6">
                <h2 className="font-display font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">My Tasks</h2>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Manage your work for today</p>
              </div>
              <TaskList
                tasks={tasks}
                setTasks={setTasks}
                activeTaskId={activeTaskId}
                setActiveTaskId={setActiveTaskId}
                user={user}
              />
            </div>
          </section>
        </div>
      </main>

      {/* MODAL ──────────────────────────────────────────────────────────────
          Only renders when showModal is true (conditional rendering)
          Two layers: dark overlay behind + white card on top
          Clicking the overlay closes the modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay — clicking this closes modal */}
          <div
            className="absolute inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          {/* Modal card — relative so it sits on top of absolute overlay */}
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-6 animate-slide-up">
            <div>
              <div className="w-14 h-14 bg-violet-50 dark:bg-violet-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">⏱️</div>
              <h2 className="font-display text-2xl font-black text-slate-800 dark:text-white tracking-tight">Time's Up!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mt-2">
                Focus session complete for{" "}
                <span className="text-violet-600 dark:text-violet-400 font-bold">
                  "{tasks.find(t => t.id === activeTaskId)?.title || "your task"}"
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {/* Primary action — mark task complete */}
              <button
                onClick={completeActiveTask}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3.5 rounded-xl font-display font-black uppercase text-[10px] tracking-widest hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-950/50 active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  : "Mark as Complete ✅"}
              </button>
              {/* Secondary action — dismiss modal, keep working */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-3.5 rounded-xl font-display font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
              >
                Keep Working ⏳
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;