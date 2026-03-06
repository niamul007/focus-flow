import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext"; // <--- Check this import
import "./index.css";
import { Toaster } from "react-hot-toast";

/**
 * APPLICATION ENTRY POINT
 * -----------------------
 * This is where React connects to the real HTML 'root' element.
 * The order of the "Wrappers" (Providers) determines the data flow.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  // 1. StrictMode: A development-only tool that highlights potential problems in the code.
  <React.StrictMode>
    {/* 2. AuthProvider: The "Global Data Tower". 
      We wrap it OUTSIDE everything else so that:
      - The Router can use auth data to protect routes.
      - The entire App can access 'user', 'login', and 'logout'.
    */}
    <AuthProvider>
      {/* 3. BrowserRouter: Enables "Single Page Application" (SPA) routing.
        It must be inside AuthProvider if you want to redirect users 
        based on their login status (e.g., kicking them to /login).
      */}
      <BrowserRouter>
        {/* 4. App: The main container for your specific logic, 
          navigation, and UI components.
        */}
        <App />
        <Toaster position="top-center" reverseOrder={false} />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
