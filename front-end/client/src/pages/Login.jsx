/**
 * PAGES/LOGIN.JSX — LOGIN PAGE
 * -----------------------------
 * Handles user authentication — collects email/password,
 * calls AuthContext login function, and navigates to dashboard on success.
 *
 * State managed here:
 * email, password → controlled inputs (form data)
 * error           → error message shown to user
 * isLoading       → controls button state during API call
 */

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  // Controlled input state — every keystroke updates these
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error message — shown in the red error box when login fails
  const [error, setError] = useState("");

  // Loading state — true while API call is in progress
  // Controls button appearance, disabled state, and spinner visibility
  const [isLoading, setIsLoading] = useState(false);

  // Pull login function from AuthContext
  // login() makes the API call, saves token, sets user in global state
  const { login } = useContext(AuthContext);

  // useNavigate — programmatic navigation without <Link>
  // navigate("/dashboard") redirects after successful login
  const navigate = useNavigate();

  /**
   * handleSubmit — form submission handler
   * ----------------------------------------
   * e.preventDefault() stops the browser's default form behaviour
   * (page reload) so React can handle the submission instead.
   *
   * try/catch/finally pattern:
   * try     → attempt the login API call
   * catch   → handle any error (wrong credentials, network issues)
   * finally → always runs — turns off loading spinner whether success or fail
   */
  const handleSubmit = async (e) => {
    e.preventDefault();  // prevent page reload on form submit
    setError("");        // clear any previous error message
    setIsLoading(true);  // show spinner, disable button

    try {
      await login(email, password); // AuthContext handles API call + token storage
      navigate("/dashboard");       // success → go to dashboard
    } catch (err) {
      /**
       * err.response?.data?.message — optional chaining for safe access
       * The ?. means: if err.response is undefined, don't crash — return undefined
       * Falls back to generic message if server didn't send a specific one
       *
       * Without optional chaining:
       * err.response.data.message → crashes if err.response is undefined ❌
       * With optional chaining:
       * err.response?.data?.message → safely returns undefined ✅
       */
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setIsLoading(false); // always turn off spinner — success or error
    }
  };

  /**
   * inputClass — shared Tailwind classes for both input fields
   * Extracted to a variable because it's used twice (email + password).
   * Change it here once → both inputs update automatically.
   * Includes dark: variants for both light and dark mode styling.
   */
  const inputClass = "w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 dark:focus:border-violet-600 font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 text-sm transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1117] px-4">

      {/* Ambient glow blobs — decorative background elements
          pointer-events-none → can't be clicked or interacted with
          fixed inset-0 → covers the entire viewport always
          blur-3xl → extreme blur creates soft glow effect */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-violet-400/10 dark:bg-violet-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 p-9 border border-slate-100 dark:border-slate-800">

          {/* Header — logo icon + title + subtitle */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-lg shadow-violet-200 dark:shadow-violet-950/50 mb-4 text-xl select-none">🚀</div>
            <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
              Sign in to your FocusFlow account
            </p>
          </div>

          {/* Error message — only renders when error state is not empty
              Conditional rendering: {error && <div>} means
              "only show this div if error is truthy" */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email input — controlled component
                value={email} → input always shows React state
                onChange → every keystroke updates email state */}
            <div>
              <label className="block text-[10px] font-display font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {/* Password input — same controlled pattern as email */}
            <div>
              <label className="block text-[10px] font-display font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {/* Submit button — three states controlled by isLoading:
                1. disabled={isLoading} → prevents double-clicking during API call
                2. className changes → grey when loading, violet gradient when ready
                3. content changes → spinner + text when loading, arrow when ready */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-display font-black text-[11px] uppercase tracking-[0.2em] text-white transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5 mt-2 shadow-md
                ${isLoading
                  ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-200 dark:shadow-violet-950/50"
                }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : "Sign In →"}
            </button>
          </form>

          {/* Footer — link to register page */}
          <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
              Don't have an account?{" "}
              {/* Link — client-side navigation, no page reload
                  React Router intercepts the click and renders Register */}
              <Link to="/register" className="text-violet-600 dark:text-violet-400 hover:text-violet-500 font-bold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-300 dark:text-slate-700 font-display font-black uppercase tracking-widest mt-5">
          FocusFlow · Stay in flow.
        </p>
      </div>
    </div>
  );
};

export default Login;