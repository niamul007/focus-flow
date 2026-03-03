import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

/** * 1. THE RADIO TOWER (Context)
 * This creates the 'channel' through which we broadcast user data.
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- STATE MANAGEMENT ---
  // 'user' holds the profile data (name, email) from the DB
  const [user, setUser] = useState(null);
  
  // 'loading' prevents the app from showing the Login page 
  // for a split second while we check if a token exists.
  const [loading, setLoading] = useState(true);

  /**
   * 2. THE AUTO-CHECKER (Persistence)
   * Runs exactly ONCE when the browser tab is first opened.
   */
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Send the token to the Backend to prove who we are
          const res = await API.get("/auth/me"); 
          setUser(res.data.user); // Restore the user to memory
        } catch (err) {
          // If the token is fake or expired, clean up the trash
          localStorage.removeItem("token");
        }
      }
      // Whether we found a user or not, we are done checking!
      setLoading(false);
    };
    checkUser();
  }, []); // Empty array [] means "Only run on startup"

  /**
   * 3. THE LOGIN FUNCTION (The Gatekeeper)
   * Sends credentials to Backend and saves the 'Golden Ticket'.
   */
  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });

      // Extracting data from the nested JSON boxes (res.data.data.user)
      const token = res.data.token;
      const userData = res.data.data.user; 

      if (token && userData) {
        // PERMANENT: Save token in browser storage
        localStorage.setItem("token", token);
        
        // TEMPORARY: Put user data in React's active memory
        setUser(userData);
        
        return res.data;
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (error) {
      console.error("🔥 Login Error:", error);
      throw error;
    }
  };

  /**
   * 4. THE LOGOUT FUNCTION (The Cleanup)
   * Destroys all evidence of the session.
   */
  const logout = () => {
    localStorage.removeItem("token"); // Delete the ticket
    setUser(null);                   // Wipe the memory
  };

  return (
    /**
     * 5. THE BROADCASTER
     * Everything in 'value' is what children (like Dashboard) can use.
     */
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};