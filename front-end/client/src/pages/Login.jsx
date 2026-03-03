import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

/**
 * LOGIN COMPONENT
 * ---------------
 * The 'Entry Gate' for existing Pilots.
 * This component manages the form state and communicates with the AuthContext.
 */
const Login = () => {
  // 1. LOCAL STATE: Tracks what the user types in real-time.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Stores error messages from the Backend.
  const [isLoading, setIsLoading] = useState(false); // Disables the button while 'talking' to the server.

  // 2. EXTERNAL TOOLS:
  // We grab the 'login' function from our Global Provider (The Battery).
  const { login } = useContext(AuthContext);
  // 'navigate' allows us to redirect the user after a successful login.
  const navigate = useNavigate();

  /**
   * 3. THE FORM HANDLER (Submission Logic)
   * This function runs when the Pilot clicks "Submit" or presses Enter.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from refreshing (SPA behavior).
    setError(""); // Clear old errors before a new attempt.
    setIsLoading(true); // Start the loading spinner/state.

    try {
      console.log("🚀 Attempting Login...");

      // A. The Handshake: We call the login function from AuthContext.
      // This function handles the API call and saves the Token to LocalStorage.
      await login(email, password);

      console.log("✅ Success! Redirecting to Dashboard...");

      // B. The Redirect: Since we are now logged in, we move to the private area.
      navigate("/dashboard");
    } catch (err) {
      // C. Error Handling: We look into the Axios error object for a message.
      // If the backend is down, we show a fallback "Check server" message.
      setError(
        err.response?.data?.message ||
          "Login failed. Check server/credentials.",
      );
    } finally {
      // D. The Cleanup: Stop the loading state whether we succeeded or failed.
      setIsLoading(false);
    }
  };

  // ... (JSX for the form follows)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans">
      {/* --- LOGIN CARD --- */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-50 relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-50 rounded-full blur-3xl"></div>

        <div className="text-center mb-10 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-4 text-2xl">
            🚀
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-2 tracking-tight">
            Enter your credentials to access FocusFlow
          </p>
        </div>

        {/* --- ERROR BANNER --- */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl text-center animate-shake">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="pilot@focusflow.com"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all font-medium text-slate-700 placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all font-medium text-slate-700 placeholder:text-slate-300"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
              ${isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-blue-600 shadow-slate-200 hover:shadow-blue-200"}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              "Launch Session"
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            New Pilot?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
