"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "chronomagica:theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "dark" || stored === "light") return stored;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  // Initialize theme on mount
  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    if (initial === "dark") document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, []);

  // Keep body class and storage in sync
  useEffect(() => {
    if (theme === "dark") document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore write errors */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      className="dark-mode-toggle"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

