import { useState } from "react";
import API from "../api/axios";

const TaskList = ({
  tasks = [],
  setTasks,
  activeTaskId,
  setActiveTaskId,
  user,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [status, setStatus] = useState("todo");

  // SAFETY GUARD: If tasks is not an array (null or object), prevent crash
  if (!Array.isArray(tasks)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] border border-dashed border-slate-200">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
          Synchronizing Missions...
        </p>
      </div>
    );
  }

  // Stats logic (Now safe because of the guard above)
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // 1. PERSISTENT ADD
  const addTask = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // IMPORTANT: Your controller expects 'title', but your state is 'inputValue'
    const newTaskData = {
      title: inputValue,
      description: descValue,
    };

    try {
      const response = await API.post("/tasks", newTaskData);
      // Digging into the response:
      const newTask = response.data.data.task;
      setTasks((prev) => [...prev, newTask]);

      setInputValue("");
      setDescValue("");
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  // 2. PERSISTENT TOGGLE COMPLETE
  const toggleComplete = async (task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    try {
      const response = await API.patch(`/tasks/${task.id}`, {
        status: newStatus,
      });
      const updatedTask = response.data.data || response.data;

      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));

      if (newStatus === "completed" && activeTaskId === task.id) {
        setActiveTaskId(null);
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // 3. PERSISTENT DELETE
  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (activeTaskId === taskId) setActiveTaskId(null);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* STATS BAR */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center">
          <span className="text-3xl font-black text-slate-800">
            {totalTasks}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Missions
          </span>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center">
          <span className="text-3xl font-black text-blue-600">
            {completionRate}%
          </span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Success
          </span>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={addTask}
        className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-3">
            <input
              className="w-full text-lg font-bold outline-none border-b border-transparent focus:border-blue-500 pb-1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="New Mission..."
            />
            <textarea
              className="w-full text-sm text-slate-400 outline-none h-10 resize-none"
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              placeholder="Details..."
            />
          </div>
          <div className="flex flex-col gap-2 md:w-44">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-50 p-3 rounded-xl text-[10px] font-black uppercase outline-none border border-slate-100"
            >
              <option value="todo">📋 Todo</option>
              <option value="in-progress">⚡ In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
            <button
              type="submit"
              className="bg-slate-900 text-white p-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      {/* LIST */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center py-10 text-slate-300 font-medium text-sm italic">
            No active deployments.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-5 bg-white border rounded-[1.5rem] transition-all ${activeTaskId === task.id ? "border-blue-500 ring-4 ring-blue-50 shadow-lg" : "border-slate-100 hover:border-slate-200"}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${task.status === "completed" ? "bg-emerald-100 text-emerald-600" : task.status === "in-progress" ? "bg-amber-100 text-amber-600 animate-pulse" : "bg-slate-100 text-slate-400"}`}
                  >
                    {task.status}
                  </span>
                  <h4
                    className={`font-bold ${task.status === "completed" ? "line-through text-slate-300" : "text-slate-800"}`}
                  >
                    {task.text}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {task.description}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {task.status !== "completed" && (
                  <button
                    onClick={() => toggleComplete(task)}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all text-sm"
                  >
                    ✓
                  </button>
                )}
                {task.status !== "completed" && (
                  <button
                    onClick={() =>
                      setActiveTaskId(activeTaskId === task.id ? null : task.id)
                    }
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTaskId === task.id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                  >
                    {activeTaskId === task.id ? "Active" : "Focus"}
                  </button>
                )}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-200 hover:text-rose-500 text-xl font-light p-2"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
