"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-11 h-11 rounded-2xl bg-surface flex items-center justify-center text-foreground border border-border hover:border-primary/30 transition-all active:scale-95 shadow-sm group"
      aria-label="Toggle Theme"
    >
      {theme === "light" ? (
        <Moon className="w-5.5 h-5.5 text-slate-500 group-hover:text-primary transition-colors" />
      ) : (
        <Sun className="w-5.5 h-5.5 text-amber-400 group-hover:text-amber-500 transition-colors" />
      )}
    </button>
  );
}
