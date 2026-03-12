/**
 * PAGES/REGISTER.JSX — REGISTRATION PAGE
 * ----------------------------------------
 * Handles new user account creation.
 * Calls the API directly (not through AuthContext) because
 * registration doesn't establish a session — user must login after.
 *
 * Key differences from Login.jsx:
 * 1. Single formData object manages all 4 fields with one onChange handler
 * 2. Client-side password match validation before any API call
 * 3. Uses API directly instead of AuthContext
 * 4. Two class variables extracted — inputClass AND labelClass
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-hot-toast";

const Register = () => {
  /**
   * Single formData object instead of 4 separate useState calls.
   * All fields managed together — cleaner for forms with many inputs.
   * Each field is destructured below for easy access in JSX and API call.
   */
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Destructure for clean access in JSX and the API call
  const { username, email, password, confirmPassword } = formData;

  /**
   * Single onChange handler for ALL four inputs.
   * Works because each input has a matching name="" attribute.
   *
   * [e.target.name] — computed property key:
   * When email input changes → e.target.name = "email"
   * { ...formData, ["email"]: "niamul@test.com" }
   * → spreads all existing fields, overwrites just the changed one
   *
   * This replaces four separate handlers:
   * setUsername, setEmail, setPassword, setConfirmPassword
   */
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  /**
   * handleSubmit — form submission handler
   * ----------------------------------------
   * Three layers of validation:
   * 1. Client-side password match check (before API call)
   * 2. API call with Zod schema validation on backend
   * 3. Duplicate email check in database
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    setError("");

    /**
     * Client-side validation — check passwords match BEFORE API call.
     * return stops execution immediately — no loading state, no API call.
     * Saves a network request for a simple check we can do locally.
     */
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setIsLoading(true);

    try {
      /**
       * Call API directly — not through AuthContext.
       * Registration doesn't create a session — no token to save.
       * User must login separately to get their JWT token.
       */
      await API.post("/auth/register", { username, email, password });
      // confirmPassword is intentionally NOT sent — backend doesn't need it

      // Show success notification via react-hot-toast
      toast.success("Account created! Please sign in. 🎉");

      // Redirect to login — user needs to authenticate to get a token
      navigate("/login");

    } catch (err) {
      // err.response?.data?.message — optional chaining for safe access
      // Catches: duplicate email (409), validation errors (400), server errors (500)
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setIsLoading(false); // always turn off spinner
    }
  };

  /**
   * Two class variables extracted here (Login only had one).
   * inputClass — shared by all four inputs
   * labelClass — shared by all four labels
   * Both used 4 times each — extracting saves repetition and makes
   * style changes easy to apply in one place.
   */
  const inputClass = "w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 dark:focus:border-violet-600 font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 text-sm transition-all";
  const labelClass = "block text-[10px] font-display font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1117] px-4 py-10">

      {/* Ambient glow blobs — decorative only, pointer-events-none prevents interaction */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-violet-400/10 dark:bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 p-9 border border-slate-100 dark:border-slate-800">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 mb-4 text-xl select-none">✨</div>
            <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Create account
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
              Join FocusFlow and start being productive
            </p>
          </div>

          {/* Error message — only renders when error state is not empty */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username input — name="username" matches formData key */}
            <div>
              <label className={labelClass}>Username</label>
              <input
                name="username"
                type="text"
                value={username}
                onChange={onChange}
                required
                placeholder="Your name"
                className={inputClass}
              />
            </div>

            {/* Email input — name="email" matches formData key */}
            <div>
              <label className={labelClass}>Email</label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={onChange}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {/* Password + Confirm — side by side using CSS grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Password</label>
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={onChange}
                  required
                  placeholder="••••"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm</label>
                {/* name="confirmPassword" matches formData key exactly */}
                <input
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={onChange}
                  required
                  placeholder="••••"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Submit button — same loading pattern as Login */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-display font-black text-[11px] uppercase tracking-[0.2em] text-white transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5 mt-2 shadow-md
                ${isLoading
                  ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-200 dark:shadow-indigo-950/50"
                }`}
            >
              {isLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : "Create Account →"}
            </button>
          </form>

          {/* Footer — link back to login */}
          <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-violet-600 dark:text-violet-400 hover:text-violet-500 font-bold transition-colors">
                Sign in
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

export default Register;