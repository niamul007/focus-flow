import { useState, useContext, useEffect } from "react"; // Added useEffect
import { AuthContext } from "../context/AuthContext";
import Timer from "../components/Timer";
import TaskList from "../components/TaskList";
import API from "../api/axios"; // Added API import

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 1. Fetch Missions from Database on Load (Persistence Fix)
  // Inside Dashboard.jsx
  useEffect(() => {
    const fetchMissions = async () => {
      if (!user?.id) return;
      try {
        const response = await API.get("/tasks");

        // We need to go: response.data (Axios) -> .data (Your Controller) -> .tasks (The Array)
        const actualTasks = response.data?.data?.tasks;

        if (Array.isArray(actualTasks)) {
          setTasks(actualTasks);
        } else {
          console.error("Data received is not an array:", actualTasks);
          setTasks([]); // Stop the spinner even if data is weird
        }
      } catch (err) {
        console.error("Failed to fetch missions:", err);
        setTasks([]);
      }
    };

    fetchMissions();
  }, [user?.id]);
  // 2. Logic to handle auto-completion of tasks via the Timer
  // const handleTimerComplete = async () => {
  //   if (activeTaskId) {
  //     try {
  //       // Update status in Backend first
  //       await API.put(`/tasks/${activeTaskId}`, { status: "completed" });

  //       // Then update UI
  //       setTasks((prev) =>
  //         prev.map((t) =>
  //           t.id === activeTaskId ? { ...t, status: "completed" } : t,
  //         ),
  //       );
  //       setActiveTaskId(null);
  //       alert("Mission Accomplished!");
  //     } catch (err) {
  //       console.error("Failed to auto-complete task:", err);
  //     }
  //   }
  // };

  const handleTimerComplete = () => {
    // We stop the automatic API call here
    if (activeTaskId) {
      setShowModal(true); // Just show the pop-up
    }
  };

  const completeActiveTask = async () => {
    if (!activeTaskId) return;

    try {
      // This is your original logic, moved here to be intentional!
      await API.put(`/tasks/${activeTaskId}`, { status: "completed" });

      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTaskId ? { ...t, status: "completed" } : t,
        ),
      );

      setShowModal(false); // Close the pop-up
      setActiveTaskId(null); // Clear the focus
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* 1. TOP NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-blue-200 shadow-2xl">
            <span className="text-white text-xl">🚀</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">
            FocusFlow
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
              Pilot Status
            </p>
            <p className="text-sm font-bold text-slate-800">
              {user?.username || "Guest"}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-rose-500 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-200"
          >
            End Mission
          </button>
        </div>
      </nav>

      {/* 2. MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: THE ENGINE */}
        <aside className="lg:col-span-4">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-2xl shadow-slate-200/40 sticky top-32 text-center">
            <div className="flex justify-between items-center mb-8 text-left">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                Engines Hot
              </span>
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce delay-100"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-bounce delay-200"></div>
              </div>
            </div>

            <Timer
              onComplete={handleTimerComplete}
              isActiveTask={!!activeTaskId}
            />
          </div>
        </aside>

        {/* RIGHT COLUMN: THE MISSIONS */}
        <section className="lg:col-span-8">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              Command Center
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-2">
              Current Active Deployments and Objectives.
            </p>
          </div>

          <TaskList
            tasks={tasks}
            setTasks={setTasks}
            activeTaskId={activeTaskId}
            setActiveTaskId={setActiveTaskId}
            user={user} // Passed user so TaskList knows user.id for POST requests
          />
        </section>
      </main>
      
      {/* MISSION DEBRIEF MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📡</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Mission Time Up
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Focus session complete for:
                <br />
                <span className="text-blue-600 font-bold">
                  "
                  {tasks.find((t) => t.id === activeTaskId)?.title ||
                    "Active Mission"}
                  "
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={completeActiveTask}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                Mission Accomplished ✅
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-slate-50 text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all active:scale-95"
              >
                Need More Time ⏳
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
