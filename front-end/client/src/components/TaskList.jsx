/**
 * COMPONENTS/TASKLIST.JSX — TASK MANAGEMENT UI
 * ----------------------------------------------
 * Renders the full task management interface:
 * - Add task form (title, description, status)
 * - List of all tasks with inline editing
 * - Toggle complete, focus link, edit, delete actions
 *
 * PROPS FROM DASHBOARD:
 * tasks         → array of task objects from database
 * setTasks      → updates task array in Dashboard state
 * activeTaskId  → which task is linked to the timer
 * setActiveTaskId → links/delinks tasks from timer
 * user          → logged-in user object (available if needed)
 *
 * WHY TASKS COME FROM PROPS NOT LOCAL STATE:
 * Tasks are shared with Timer — both need the same data.
 * State lives in Dashboard (shared parent) and flows down as props.
 */

import { useState } from "react";
import API from "../api/axios";

const TaskList = ({ tasks = [], setTasks, activeTaskId, setActiveTaskId, user }) => {

  // ── ADD TASK FORM STATE ──────────────────────────────────────────────────
  const [inputValue, setInputValue] = useState("");   // new task title
  const [descValue, setDescValue] = useState("");     // new task description
  const [status, setStatus] = useState("todo");       // new task status

  // ── EDIT STATE ───────────────────────────────────────────────────────────
  // editingId controls which task shows the edit form
  // null = no task being edited, task.id = that task shows edit inputs
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");     // edit form title value
  const [editDesc, setEditDesc] = useState("");       // edit form description value

  /**
   * saveEdit — save inline edit changes to database
   * -------------------------------------------------
   * API.put sends { title, description } to PUT /tasks/:id
   * Backend's COALESCE only updates fields that are provided —
   * status stays unchanged since we don't send it here.
   *
   * After API success, updates local state directly (no re-fetch):
   * map through tasks → replace matching task with updated version
   */
  const saveEdit = async (id) => {
    try {
      const response = await API.put(`/tasks/${id}`, {
        title: editTitle,
        description: editDesc
      });

      // Defensive fallback — tries nested structure first, falls back to full response
      const updatedTask = response.data.data?.task || response.data;

      // Replace only the edited task in the array — all others unchanged
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      setEditingId(null); // exit edit mode
    } catch (err) {
      console.error("Failed to save edit:", err);
    }
  };

  /**
   * Guard clause — if tasks is not an array for any reason, show loading state.
   * tasks={[]} default prop handles undefined but this catches other edge cases.
   * Placed before other functions so it returns early before any rendering.
   */
  if (!Array.isArray(tasks)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
        <div className="w-7 h-7 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-400 dark:text-slate-500 font-display font-black uppercase text-[10px] tracking-widest">Syncing...</p>
      </div>
    );
  }

  /**
   * addTask — create a new task
   * ----------------------------
   * e.preventDefault() stops page reload.
   * Guard: if title is empty/whitespace → do nothing.
   *
   * After API success, adds new task to local state:
   * [...prev, newTask] — spread existing tasks + append new one
   * Then clears the form inputs ready for next task.
   */
  const addTask = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return; // don't create empty tasks

    try {
      const response = await API.post("/tasks", {
        title: inputValue,
        description: descValue,
        status
      });

      const newTask = response.data.data?.task || response.data;

      setTasks(prev => [...prev, newTask]); // append to end of list
      setInputValue(""); // clear title input
      setDescValue("");  // clear description input
    } catch (err) {
      console.error("SQL Insert Error:", err);
    }
  };

  /**
   * toggleComplete — flip task between completed and pending
   * ---------------------------------------------------------
   * Reads current status → sends the OPPOSITE status to backend.
   * Click once → completed. Click again → pending. One function, both directions.
   *
   * Also delinks from timer if task is being completed:
   * No point keeping a completed task as the active focus task.
   */
  const toggleComplete = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      const response = await API.put(`/tasks/${task.id}`, { status: newStatus });
      const updatedTask = response.data.data?.task || response.data;

      // Replace the toggled task in local state
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));

      // Delink from timer if this task was the active focus task
      if (newStatus === "completed" && activeTaskId === task.id) {
        setActiveTaskId(null);
      }
    } catch (err) {
      console.error("SQL Update Error:", err);
    }
  };

  /**
   * deleteTask — remove a task permanently
   * ----------------------------------------
   * API.delete sends DELETE /tasks/:id to backend.
   * Backend checks ownership (user_id) before deleting.
   *
   * After success, removes from local state:
   * .filter() keeps all tasks EXCEPT the deleted one.
   *
   * Also delinks from timer — if the active focus task is deleted,
   * clear activeTaskId so timer doesn't point to a non-existent task.
   */
  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);

      // Remove deleted task from local state
      setTasks(prev => prev.filter(t => t.id !== taskId));

      // Clean up timer link if this was the active task
      if (activeTaskId === taskId) setActiveTaskId(null);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Shared input class — used by both add form inputs
  const inputClass = "w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors";

  return (
    <div className="w-full space-y-4">

      {/* ADD TASK FORM ─────────────────────────────────────────────────────
          Three inputs: title (required), description (optional), status select
          onSubmit → addTask handles the API call and state update */}
      <form onSubmit={addTask} className="border border-slate-100 dark:border-slate-700 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-800/30 hover:border-violet-200 dark:hover:border-violet-800/50 transition-colors">
        <div className="flex flex-col gap-3">
          <input
            className={`${inputClass} text-base font-bold border-b border-transparent focus:border-violet-400 dark:focus:border-violet-600 pb-1`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task..."
          />
          <textarea
            className={`${inputClass} text-sm text-slate-400 dark:text-slate-500 h-8 resize-none`}
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            placeholder="Description (optional)"
          />
          <div className="flex items-center gap-2 pt-1">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-3 py-2 rounded-xl text-[10px] font-display font-black uppercase outline-none cursor-pointer"
            >
              <option value="todo">📋 Todo</option>
              <option value="in-progress">⚡ In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:from-violet-500 hover:to-indigo-500 transition-all shadow-sm shadow-violet-200 dark:shadow-violet-950/40">
              + Add
            </button>
          </div>
        </div>
      </form>

      {/* TASK LIST ─────────────────────────────────────────────────────────*/}
      <div className="space-y-2.5">

        {/* Empty state — shown when no tasks exist */}
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-12 h-12 bg-violet-50 dark:bg-violet-950/40 rounded-2xl flex items-center justify-center mb-3 text-xl">📋</div>
            <h3 className="font-display font-black text-slate-600 dark:text-slate-400 text-base tracking-tight">No tasks yet</h3>
            <p className="text-slate-400 dark:text-slate-600 text-sm text-center mt-1 max-w-[220px]">Add your first task above to get started.</p>
          </div>
        ) : (
          /**
           * tasks.map() — renders one row per task
           * key={task.id} required — helps React identify which item
           * changed/added/removed without re-rendering the whole list
           */
          tasks.map((task) => {
            const isEditing = editingId === task.id;       // is THIS task in edit mode?
            const isActiveFocus = activeTaskId === task.id; // is THIS task linked to timer?

            return (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200
                  ${isActiveFocus
                    ? "bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/50 shadow-sm"
                    : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
              >
                {/* COMPLETE TOGGLE — circular checkbox button
                    Hidden during edit mode (isEditing check)
                    Green filled = completed, empty circle = not completed */}
                {!isEditing && (
                  <button
                    onClick={() => toggleComplete(task)}
                    className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${task.status === "completed"
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-600"
                      }`}
                  >
                    {/* Checkmark SVG — only visible when completed */}
                    {task.status === "completed" && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )}

                {/* TASK CONTENT ─────────────────────────────────────────────
                    Two modes controlled by isEditing:
                    Edit mode   → input + textarea for inline editing
                    Normal mode → status badge + title + description display */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    // EDIT MODE — inline inputs pre-filled with current values
                    <div className="space-y-1.5">
                      <input
                        className="w-full font-bold text-slate-800 dark:text-white border-b-2 border-violet-400 outline-none bg-transparent pb-0.5 text-sm"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus // automatically focuses this input when edit mode starts
                      />
                      <textarea
                        className="w-full text-xs text-slate-400 dark:text-slate-500 outline-none resize-none bg-transparent"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                      />
                    </div>
                  ) : (
                    // NORMAL MODE — status badge + title + optional description
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status pill badge — color changes based on status */}
                        <span className={`text-[8px] font-display font-black px-2 py-0.5 rounded-full uppercase tracking-wide
                          ${task.status === "completed"
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                            : task.status === "in-progress"
                            ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {task.status}
                        </span>
                        {/* Title — line-through + grey when completed */}
                        <span className={`font-bold text-sm truncate
                          ${task.status === "completed"
                            ? "line-through text-slate-300 dark:text-slate-600"
                            : "text-slate-800 dark:text-slate-100"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      {/* Description — only renders if it exists (conditional rendering) */}
                      {task.description && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS ───────────────────────────────────────────
                    Edit mode   → Save + Cancel buttons
                    Normal mode → Focus + Edit + Delete buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(task.id)} className="px-3 py-1.5 bg-violet-600 text-white text-[10px] font-display font-black uppercase rounded-lg hover:bg-violet-500 transition-colors">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-2 py-1.5 text-[10px] text-slate-400 font-display font-black uppercase hover:text-slate-600 dark:hover:text-slate-300 transition-colors">✕</button>
                    </>
                  ) : (
                    <>
                      {/* Focus button — hidden for completed tasks
                          Toggle: click once to link, click again to delink */}
                      {task.status !== "completed" && (
                        <button
                          onClick={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-display font-black uppercase tracking-wide transition-all
                            ${isActiveFocus
                              ? "bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-950/40"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                        >
                          {isActiveFocus ? "● Focus" : "Focus"}
                        </button>
                      )}
                      {/* Edit button — sets editingId + pre-fills edit state */}
                      <button
                        onClick={() => {
                          setEditingId(task.id)
                          setEditTitle(task.title)
                          setEditDesc(task.description || "")
                        }}
                        className="w-7 h-7 text-slate-300 dark:text-slate-600 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all flex items-center justify-center rounded-lg text-sm"
                      >✎</button>
                      {/* Delete button — permanently removes task */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="w-7 h-7 text-slate-200 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center justify-center rounded-lg text-lg leading-none"
                      >×</button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskList;