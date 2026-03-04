import { useState } from "react";
import API from "../api/axios";

/**
 * TASKLIST COMPONENT
 * -------------------
 * This component handles the 'CRUD' (Create, Read, Update, Delete) operations
 * for the user's missions. It communicates directly with the Backend via the API tool.
 */
const TaskList = ({
  tasks = [], // Default to empty array to prevent .map() crashes
  setTasks, // Function to update the global task state
  activeTaskId, // The ID of the task currently in the Pomodoro timer
  setActiveTaskId, // Function to change the active timer task
  user, // Current logged-in pilot info
}) => {
  // 1. LOCAL FORM STATE: Temporary storage for what the user is typing
  const [inputValue, setInputValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [status, setStatus] = useState("todo");
  // 1. In your State definition (Top of Component)
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState(""); // We will use 'editTitle'
  const [editDesc, setEditDesc] = useState("");

  // 2. In your saveEdit function
  const saveEdit = async (id) => {
    try {
      const response = await API.patch(`/tasks/${id}`, {
        title: editTitle,
        description: editDesc,
      });

      // Extract the updated task from the nested data structure
      const updatedTask = response.data.data?.task || response.data;

      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save edit:", err);
    }
  };

  /**
   * 2. THE SAFETY GUARD (The Bouncer)
   * If 'tasks' isn't an array yet (loading or error), we show a
   * 'Synchronizing' spinner instead of crashing the app.
   */
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

  // 3. COMPUTED STATS: Derived data calculated on every render
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  /**
   * 4. PERSISTENT ADD (Create)
   * Sends the new mission to the database.
   */
  const addTask = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTaskData = {
      title: inputValue,
      description: descValue,
      status: status, // This will now send 'pending', 'in-progress', or 'completed'
    };

    try {
      const response = await API.post("/tasks", newTaskData);
      const newTask = response.data.data?.task || response.data;

      setTasks((prev) => [...prev, newTask]);
      setInputValue("");
      setDescValue("");
      console.log("Adding Task:", newTaskData); // Debug log
    } catch (err) {
      console.error("SQL Insert Error:", err);
    }
  };
  /**
   * 5. PERSISTENT TOGGLE (Update)
   * Flips the status between 'todo' and 'completed' on the server.
   */
  const toggleComplete = async (task) => {
    // Use 'pending' instead of 'todo' to match your SQL DEFAULT
    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      const response = await API.patch(`/tasks/${task.id}`, {
        status: newStatus,
      });

      // SQL/Express usually returns the row directly
      const updatedTask = response.data.data?.task || response.data;

      setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));

      if (newStatus === "completed" && activeTaskId === task.id) {
        setActiveTaskId(null);
      }
    } catch (err) {
      console.error("SQL Update Error:", err);
    }
  };
  /**
   * 6. PERSISTENT DELETE (Destroy)
   * Removes the mission from the database and the UI.
   */
  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      // Filter out the deleted task from the local state
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      // Clear the timer if we just deleted the active task
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
              className="bg-slate-900 text-white p-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      {/* LIST */}
      {/* LIST */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center py-10 text-slate-300 font-medium text-sm italic">
            No active deployments.
          </p>
        ) : (
          tasks.map((task) => {
            const isEditing = editingId === task.id;

            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-5 bg-white border rounded-[1.5rem] transition-all 
                ${activeTaskId === task.id ? "border-blue-500 ring-4 ring-blue-50 shadow-lg" : "border-slate-100"}`}
              >
                {/* LEFT SIDE: CONTENT */}
                <div className="flex-1">
                  {isEditing ? (
                    // --- EDIT MODE INPUTS ---
                    <div className="space-y-2 pr-4">
                      <input
                        className="w-full font-bold text-slate-800 border-b border-blue-400 outline-none"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                      />
                      <textarea
                        className="w-full text-[11px] text-slate-400 outline-none resize-none"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                    </div>
                  ) : (
                    // --- VIEW MODE TEXT ---
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                            task.status === "completed"
                              ? "bg-emerald-100 text-emerald-600"
                              : task.status === "in-progress"
                                ? "bg-amber-100 text-amber-600 animate-pulse"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {task.status}
                        </span>
                        <h4
                          className={`font-bold ${task.status === "completed" ? "line-through text-slate-300" : "text-slate-800"}`}
                        >
                          {task.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {task.description}
                      </p>
                    </>
                  )}
                </div>

                {/* RIGHT SIDE: ACTIONS */}
                <div className="flex items-center gap-2 ml-4">
                  {isEditing ? (
                    // --- EDIT MODE BUTTONS ---
                    <>
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-[10px] text-slate-400 font-bold uppercase"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    // --- VIEW MODE BUTTONS ---
                    <>
                      {task.status !== "completed" && (
                        <>
                          {/* TOGGLE COMPLETE */}
                          <button
                            onClick={() => toggleComplete(task)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all text-sm"
                            title="Complete Mission"
                          >
                            ✓
                          </button>

                          {/* FOCUS BUTTON (RESTORED) */}
                          <button
                            onClick={() =>
                              setActiveTaskId(
                                activeTaskId === task.id ? null : task.id,
                              )
                            }
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all 
                              ${
                                activeTaskId === task.id
                                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                              }`}
                          >
                            {activeTaskId === task.id ? "Active" : "Focus"}
                          </button>
                        </>
                      )}

                      {/* EDIT BUTTON */}
                      <button
                        onClick={() => {
                          setEditingId(task.id);
                          setEditTitle(task.title);
                          setEditDesc(task.description);
                        }}
                        className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
                        title="Edit Task"
                      >
                        ✎
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-200 hover:text-rose-500 text-xl font-light p-2"
                        title="Delete Task"
                      >
                        ×
                      </button>
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
