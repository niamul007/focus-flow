/**
 * CONTEXT/AUTHCONTEXT.JSX — AUTHENTICATION STATE MANAGER
 * --------------------------------------------------------
 * This file creates and manages the global authentication state.
 * It exports two things that work as a pair:
 *
 * AuthContext  → the channel (created by createContext())
 *               a special React object with a .Provider component
 *               used by components to RECEIVE auth data via useContext()
 *
 * AuthProvider → the broadcaster component
 *               wraps the app in main.jsx
 *               manages user state and shares it through AuthContext
 *
 * Any component can access { user, login, logout, loading } by calling:
 * const { user, login, logout, loading } = useContext(AuthContext)
 */

import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

/**
 * createContext() — React function that creates the channel.
 * Returns a special object: { Provider, Consumer }
 * We only use .Provider to broadcast, and useContext() to receive.
 * The channel itself has no data — AuthProvider fills it with value={...}
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  /**
   * user — the logged-in user object or null
   * Stores: { id, email, username }
   * null = no one is logged in
   * Lives in React memory — wiped on page refresh (that's why we have useEffect)
   */
  const [user, setUser] = useState(null);

  /**
   * loading — whether auth verification is still in progress
   * Starts as true because we always check localStorage on startup.
   * Set to false after checkUser() completes — whether a user was found or not.
   * ProtectedRoute shows a spinner while this is true to prevent
   * false redirects to /login during the verification window.
   */
  const [loading, setLoading] = useState(true);

  /**
   * useEffect — runs checkUser() exactly ONCE on app startup.
   * The empty [] dependency array means "only run when component first mounts."
   *
   * WHY THIS IS NEEDED:
   * localStorage persists across refreshes but React state does not.
   * On every refresh user resets to null even if token exists.
   * checkUser() bridges this gap — finds the token and restores the user.
   */
  useEffect(() => {
    const checkUser = async () => {
      // Check if a token exists from a previous session
      const token = localStorage.getItem("token");

      if (token) {
        try {
          /**
           * Send token to backend for verification.
           * GET /api/auth/me — protect middleware verifies the token
           * and returns the full user object from the database.
           *
           * axios.js automatically adds the token to the Authorization
           * header via its request interceptor — we don't add it manually here.
           */
          const res = await API.get("/auth/me");
          setUser(res.data.user); // restore user to React memory
        } catch (err) {
          /**
           * Token was expired, invalid, or tampered with.
           * Backend returned 401 → remove the bad token from localStorage.
           * user stays null → ProtectedRoute will redirect to /login.
           */
          localStorage.removeItem("token");
        }
      }

      /**
       * Always set loading to false after checking — whether we found
       * a user or not. This tells ProtectedRoute it's safe to make a decision.
       * Must be outside the if(token) block so it runs even with no token.
       */
      setLoading(false);
    };

    checkUser();
  }, []); // [] = run once on mount only

  /**
   * login — authenticate user and establish session
   * ------------------------------------------------
   * @param {string} email
   * @param {string} password
   * @returns {Object} server response data
   * @throws {Error} if credentials are invalid or request fails
   *
   * Two types of storage used intentionally:
   * localStorage.setItem("token") → PERMANENT — survives refresh and browser close
   * setUser(userData)             → TEMPORARY — lives in React memory only
   *
   * We need both because:
   * token in localStorage → lets useEffect restore the session on next refresh
   * user in state         → lets components access user data instantly
   */
  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });

      /**
       * Response structure from backend:
       * res.data = {
       *   status: "success",
       *   token: "eyJhbG...",        ← JWT token
       *   data: {
       *     user: { id, email, username }  ← user object
       *   }
       * }
       *
       * res.data.data.user looks confusing because:
       * - Axios wraps all responses in its own .data
       * - Our backend also named its field 'data'
       * Result: res.data (axios) → .data (our backend) → .user
       */
      const token = res.data.token;
      const userData = res.data.data.user;

      if (token && userData) {
        localStorage.setItem("token", token); // save ticket permanently
        setUser(userData);                    // put user in active memory
        return res.data;
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (error) {
      console.error("🔥 Login Error:", error);
      throw error; // re-throw so the Login page can show an error message
    }
  };

  /**
   * logout — destroy the session completely
   * ----------------------------------------
   * Removes token from localStorage → next refresh won't restore user
   * Sets user to null → all protected routes immediately redirect to /login
   * No backend call needed — JWT is stateless, server keeps no session record
   */
  const logout = () => {
    localStorage.removeItem("token"); // delete the ticket
    setUser(null);                    // wipe React memory
  };

  /**
   * Broadcast auth state to the entire app through AuthContext.
   * value={...} is what every useContext(AuthContext) call receives.
   *
   * user    → current logged-in user or null
   * login   → function to authenticate
   * logout  → function to end session
   * loading → whether auth check is still in progress
   *
   * {children} renders everything wrapped in AuthProvider —
   * in main.jsx that's the entire app inside BrowserRouter
   */
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};