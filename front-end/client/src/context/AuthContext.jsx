import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app starts
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await API.get("/auth/me"); // Backend must have this route!
          setUser(res.data.user);
        } catch (err) {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });

      // DEBUG: This will now show you the nested 'user'
      console.log("🎯 Found User:", res.data.data.user);

      const token = res.data.token;
      const userData = res.data.data.user; // REACHING INTO THE DOUBLE DATA BOX

      if (token && userData) {
        localStorage.setItem("token", token);
        setUser(userData);
        return res.data;
      } else {
        console.error(
          "❌ Still missing something! Token:",
          !!token,
          "User:",
          !!userData,
        );
        throw new Error("Invalid response structure from server");
      }
    } catch (error) {
      console.error("🔥 Login Error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
