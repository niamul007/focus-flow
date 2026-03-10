/**
 * MAIN.JSX — APPLICATION ENTRY POINT
 * ------------------------------------
 * This is the first React file that runs. It mounts the entire
 * application into the HTML page and wraps everything in the
 * providers that the app needs to function.
 *
 * ReactDOM.createRoot finds the <div id="root"> in index.html
 * and renders the entire React app inside it.
 *
 * PROVIDER ORDER MATTERS — outer providers are available to inner ones.
 * ThemeProvider is outermost so even AuthProvider can access theme if needed.
 * AuthProvider wraps BrowserRouter so auth state is available on all routes.
 */

import React from "react";
import ReactDOM from "react-dom/client";

// BrowserRouter enables client-side routing — React Router intercepts
// URL changes and renders components without full page reloads
import { BrowserRouter } from "react-router-dom";

import App from "./App";

// AuthProvider — makes login state, user object, and auth functions
// (login, logout, register) available to any component in the app
import { AuthProvider } from "./context/AuthContext";

// ThemeProvider — makes dark/light mode state and toggleTheme()
// available to any component in the app
import { ThemeProvider } from "./context/Themecontext";

// Global styles — Tailwind imports, custom fonts, dark mode variants,
// color variables, and smooth transition rules
import "./index.css";

// Toaster — the display container for toast notifications.
// Must be rendered once at the top level so toast() calls from
// ANY component in the app can display notifications here.
import { Toaster } from "react-hot-toast";

/**
 * Mount the React app into the DOM.
 * document.getElementById("root") finds the <div id="root"> in index.html.
 * Everything React renders lives inside that div.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  /**
   * React.StrictMode — development helper only, has no effect in production.
   * It intentionally double-invokes functions to help detect side effects
   * and warns about deprecated React patterns in the console.
   * You may notice useEffect running twice in dev — this is why.
   */
  <React.StrictMode>

    {/* ThemeProvider — outermost so dark/light mode is available everywhere */}
    <ThemeProvider>

      {/* AuthProvider — makes auth state available to all routes and components */}
      <AuthProvider>

        {/* BrowserRouter — enables React Router's client-side navigation.
            Intercepts link clicks and URL changes, renders the matching
            component without reloading the page from the server. */}
        <BrowserRouter>
          <App />

          {/**
           * Toaster — react-hot-toast notification display component.
           *
           * HOW IT WORKS:
           * This component listens for toast() calls made anywhere in the app.
           * When toast.success("Task created!") is called in TaskList,
           * this Toaster picks up the signal and displays the notification.
           * They communicate through react-hot-toast's internal shared state —
           * no props needed between them.
           *
           * position="top-center" — notifications appear at top center of screen
           *
           * reverseOrder={false} — new toasts stack on top of older ones
           *
           * toastOptions.className — custom Tailwind styles applied to every toast:
           * - Light mode: white background, dark text
           * - Dark mode: slate-800 background, white text
           * - Consistent border, shadow, rounded corners, and font size
           * - ! prefix = Tailwind !important, overrides react-hot-toast defaults
           */}
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