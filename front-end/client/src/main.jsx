import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/Themecontext";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ThemeProvider is outermost so every component can access dark/light mode */}
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              className:
                "!bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !border !border-slate-100 dark:!border-slate-700 !shadow-xl !rounded-2xl !text-xs !font-bold",
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);