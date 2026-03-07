import { useState } from "react";
import API from "../api/axios";

const TaskList = ({ tasks = [], setTasks, activeTaskId, setActiveTaskId, user }) => {
  const [inputValue, setInputValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [status, setStatus] = useState("todo");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const saveEdit = async (id) => {
    try {
      const response = await API.put(`/tasks/${id}`, { title: editTitle, description: editDesc });
      const updatedTask = response.data.data?.task || response.data;
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save edit:", err);
    }
  };

  if (!Array.isArray(tasks)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
        <div className="w-7 h-7 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-400 dark:text-slate-500 font-display font-black uppercase text-[10px] tracking-widest">
          Syncing...
        </p>
      </div>
    );
  }

  const addTask = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    try {
      const response = await API.post("/tasks", { title: inputValue, description: descValue, status });
      const newTask = response.data.data?.task || response.data;
      setTasks((prev) => [...prev, newTask]);
      setInputValue("");
      setDescValue("");
    } catch (err) {
      console.error("SQL Insert Error:", err);
    }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const response = await API.put(`/tasks/${task.id}`, { status: newStatus });
      const updatedTask = response.data.data?.task || response.data;
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
      if (newStatus === "completed" && activeTaskId === task.id) setActiveTaskId(null);
    } catch (err) {
      console.error("SQL Update Error:", err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (activeTaskId === taskId) setActiveTaskId(null);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const inputClass = "w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors";

  return (
    <div className="w-full space-y-4">

      {/* ADD TASK FORM */}
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
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:from-violet-500 hover:to-indigo-500 transition-all shadow-sm shadow-violet-200 dark:shadow-violet-950/40"
            >
              + Add
            </button>
          </div>
        </div>
      </form>

      {/* TASK LIST */}
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-12 h-12 bg-violet-50 dark:bg-violet-950/40 rounded-2xl flex items-center justify-center mb-3 text-xl">📋</div>
            <h3 className="font-display font-black text-slate-600 dark:text-slate-400 text-base tracking-tight">No tasks yet</h3>
            <p className="text-slate-400 dark:text-slate-600 text-sm text-center mt-1 max-w-[220px]">
              Add your first task above to get started.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isEditing = editingId === task.id;
            const isActiveFocus = activeTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200
                  ${isActiveFocus
                    ? "bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/50 shadow-sm"
                    : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
              >
                {/* Status dot */}
                {!isEditing && (
                  <button
                    onClick={() => toggleComplete(task)}
                    className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${task.status === "completed"
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-600"
                      }`}
                    title="Toggle complete"
                  >
                    {task.status === "completed" && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        className="w-full font-bold text-slate-800 dark:text-white border-b-2 border-violet-400 outline-none bg-transparent pb-0.5 text-sm"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                      />
                      <textarea
                        className="w-full text-xs text-slate-400 dark:text-slate-500 outline-none resize-none bg-transparent"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
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
                        <span className={`font-bold text-sm truncate
                          ${task.status === "completed" ? "line-through text-slate-300 dark:text-slate-600" : "text-slate-800 dark:text-slate-100"}`}
                        >
                          {task.title}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{task.description}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(task.id)} className="px-3 py-1.5 bg-violet-600 text-white text-[10px] font-display font-black uppercase rounded-lg hover:bg-violet-500 transition-colors">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-2 py-1.5 text-[10px] text-slate-400 font-display font-black uppercase hover:text-slate-600 dark:hover:text-slate-300 transition-colors">✕</button>
                    </>
                  ) : (
                    <>
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
                      <button
                        onClick={() => { setEditingId(task.id); setEditTitle(task.title); setEditDesc(task.description || ""); }}
                        className="w-7 h-7 text-slate-300 dark:text-slate-600 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all flex items-center justify-center rounded-lg text-sm"
                        title="Edit"
                      >✎</button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="w-7 h-7 text-slate-200 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center justify-center rounded-lg text-lg leading-none"
                        title="Delete"
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