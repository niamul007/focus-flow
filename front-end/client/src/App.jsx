/**
 * APP.JSX — ROUTE CONFIGURATION
 * -------------------------------
 * This file defines the entire routing structure of the application.
 * It maps URLs to components and controls which routes are public
 * and which require authentication.
 *
 * React Router works client-side — it intercepts URL changes and
 * renders the matching component without reloading the page.
 *
 * <Routes> renders only ONE matching route at a time.
 * <ThemeToggle> sits outside Routes so it appears on every page.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// ProtectedRoute — wrapper component that checks for a valid token
// before allowing access to its children
import ProtectedRoute from "./components/ProtectedRoute";

// ThemeToggle — floating dark/light mode button
// Lives outside Routes so it appears on every page regardless of URL
import ThemeToggle from "./components/Themetoggle";

function App() {
  return (
    <>
      {/**
       * Routes — renders the first Route that matches the current URL.
       * Order matters — routes are checked top to bottom.
       * Only ONE route renders at a time.
       */}
      <Routes>

        {/* ── PUBLIC ROUTES ────────────────────────────────────────────
            No authentication required — anyone can access these.
            These are the entry points where users get their token. */}

        {/* /login → renders the Login page */}
        <Route path="/login" element={<Login />} />

        {/* /register → renders the Register page */}
        <Route path="/register" element={<Register />} />

        {/* ── PROTECTED ROUTES ─────────────────────────────────────────
            Wrapped in ProtectedRoute which checks for a valid JWT token.
            Has token → renders the child component (Dashboard)
            No token  → redirects to /login */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />  {/* only renders if ProtectedRoute allows it */}
            </ProtectedRoute>
          }
        />

        {/* ── REDIRECTS ────────────────────────────────────────────────*/}

        {/* / (root) → redirect to /dashboard
            ProtectedRoute then decides: show dashboard or redirect to login
            This means visiting the bare URL always goes somewhere useful */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* * (catch-all) → redirect unknown URLs to /login
            Matches any path that didn't match the routes above.
            e.g. /about, /xyz, /anything → goes to /login
            This also handles the Vercel 404 case as a backup to vercel.json */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>

      {/**
       * ThemeToggle — dark/light mode toggle button.
       * Positioned OUTSIDE <Routes> so it renders on every page —
       * Login, Register, and Dashboard all show the toggle button.
       * If it were inside Routes it would only appear on one specific route.
       *
       * Renders as a fixed button in the bottom-right corner of the screen
       * via its own CSS positioning — it doesn't affect page layout.
       */}
      <ThemeToggle />
    </>
  );
}

export default App;