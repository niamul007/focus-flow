import axios from "axios";

/**
 * 1. THE BASE STATION (Axios Instance)
 * Instead of typing 'http://localhost:5000/api' in every file,
 * we create a 'pre-configured' version of axios called API.
 */
const API = axios.create({
  // This is the 'Home Address' of your Backend server.
  baseURL: "http://localhost:5000/api", 
});

/**
 * 2. THE REQUEST INTERCEPTOR (The Security Guard)
 * This function 'intercepts' every single outgoing request 
 * BEFORE it leaves your computer and hits the internet.
 */
API.interceptors.request.use((config) => {
  // A. Check the 'LocalStorage' drawer for the Golden Ticket (Token)
  const token = localStorage.getItem("token");

  // B. If a token exists, 'GLUE' it to the Authorization Header.
  // We use the 'Bearer' scheme, which is the industry standard.
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // C. Return the 'config' (The Manifest) to let the request continue its journey.
  return config;
});

/**
 * 3. EXPORTING THE TOOL
 * Now, in any other file, you can just do:
 * API.get('/tasks') instead of the full axios.get(...) URL.
 */
export default API;