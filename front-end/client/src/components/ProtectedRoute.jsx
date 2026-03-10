/**
 * COMPONENTS/PROTECTEDROUTE.JSX — AUTHENTICATION GATE
 * -----------------------------------------------------
 * A wrapper component that guards private pages.
 * It checks authentication state before deciding what to render.
 *
 * Used in App.jsx like this:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * <Dashboard /> is received as the 'children' prop — React automatically
 * passes anything between opening and closing tags as props.children.
 * ProtectedRoute doesn't know or care what children is — it just
 * decides whether to render it or redirect.
 *
 * THREE POSSIBLE OUTCOMES:
 * 1. Still loading → show spinner (prevents flash redirect on refresh)
 * 2. No user       → redirect to /login
 * 3. User exists   → render children (Dashboard)
 */

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  /**
   * Pull auth state from AuthContext.
   * user    → the logged-in user object ({ id, email, username }) or null
   * loading → true while AuthContext is verifying the token on page refresh
   *
   * useContext reaches up through the component tree to find the nearest
   * AuthProvider and returns whatever it's sharing — no props needed.
   */
  const { user, loading } = useContext(AuthContext);

  /**
   * CASE 1: Still verifying auth — show loading spinner.
   *
   * WHY THIS MUST COME FIRST:
   * On page refresh, user starts as null before the token is verified.
   * If we checked !user before loading, every refresh would redirect
   * to /login even for logged-in users — a false redirect.
   *
   * The spinner shows while AuthContext calls GET /api/auth/me to
   * verify the stored token. Once that resolves, loading becomes false
   * and we fall through to the next checks.
   *
   * The spinner is centered on screen with a subtle "Verifying Identity..."
   * label — matches the app's dark/light theme via dark: variants.
   */
  if (loading) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        {/* Spinning circle — border-t creates the rotating arc effect */}
        <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Verifying Identity...
        </p>
      </div>
    );
  }

  /**
   * CASE 2: Auth verified but no user found — redirect to login.
   *
   * This happens when:
   * - User has never logged in (no token in localStorage)
   * - Token existed but was expired or invalid (AuthContext set user to null)
   *
   * <Navigate> is React Router's redirect component — it immediately
   * sends the user to /login without rendering anything else.
   */
  if (!user) {
    return <Navigate to="/login" />;
  }

  /**
   * CASE 3: Auth verified and user exists — render the protected page.
   *
   * children is whatever was passed between the ProtectedRoute tags:
   * <ProtectedRoute><Dashboard /></ProtectedRoute>
   * → children = <Dashboard />
   *
   * At this point req.user is available throughout the app via AuthContext
   * and the Dashboard can safely render user-specific data.
   */
  return children;
};

export default ProtectedRoute;