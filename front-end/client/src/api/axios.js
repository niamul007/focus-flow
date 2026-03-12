/**
 * API/AXIOS.JS — CONFIGURED HTTP CLIENT
 * ---------------------------------------
 * Creates and exports a pre-configured Axios instance for all API calls.
 *
 * Two things set up here:
 * 1. baseURL — shared base for all requests so we never repeat the full URL
 * 2. Request interceptor — automatically attaches JWT token to every request
 *
 * Every file that needs to call the backend imports this API instance:
 * import API from "../api/axios"
 * API.get("/tasks") → GET https://focus-flow-x7gk.onrender.com/api/tasks
 */

import axios from "axios";

/**
 * axios.create() — creates a custom Axios instance with default settings.
 * Any request made with API automatically uses these defaults.
 *
 * baseURL — the shared prefix for all requests.
 * API.get("/tasks") becomes GET https://focus-flow-x7gk.onrender.com/api/tasks
 * API.post("/auth/login") becomes POST https://focus-flow-x7gk.onrender.com/api/auth/login
 *
 * Benefits:
 * - No need to repeat the full URL on every call
 * - Change the backend URL in ONE place if it ever changes
 * - Keeps all API calls clean and readable
 */
const API = axios.create({
  baseURL: "https://focus-flow-x7gk.onrender.com/api",
});

/**
 * Request Interceptor — runs automatically before EVERY request is sent.
 * Think of it as airport security — every request passes through here
 * before it reaches the server. Set up once, applies to everything.
 *
 * WHY AN INTERCEPTOR instead of adding the token manually each time?
 * Without it, every single API call would need:
 * API.get("/tasks", { headers: { Authorization: `Bearer ${token}` } })
 * With it, API.get("/tasks") is enough — token is added automatically.
 *
 * config — the request configuration object containing:
 * { url, method, baseURL, headers, data, params, ... }
 * We receive it, modify it, and MUST return it for the request to proceed.
 */
API.interceptors.request.use((config) => {
  // Read the current token from localStorage at request time
  // Reading at request time (not module load time) ensures we always
  // get the latest token — important after login/logout
  const token = localStorage.getItem("token");

  if (token) {
    /**
     * Attach token to the Authorization header in Bearer format.
     * "Bearer" is the standard prefix for JWT tokens in HTTP headers.
     * Format: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
     *
     * config.headers is the headers object for this specific request.
     * We add Authorization here — Axios merges it with default headers.
     * The backend's protect middleware reads this header to verify identity.
     */
    config.headers.Authorization = `Bearer ${token}`;
  }

  /**
   * MUST return config — this is what Axios actually sends.
   * If you forget to return config, Axios receives undefined
   * and the request fails completely.
   */
  return config;
});

// Export as default — imported as API throughout the app
export default API;