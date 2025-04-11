"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from localStorage if available, otherwise use system preference
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      return savedTheme || "system";
    }
    return "system";
  });

  // Apply theme to document
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    // Remove all theme classes first
    htmlElement.classList.remove("light", "dark");
    
    if (theme === "system") {
      // Check system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      htmlElement.classList.add(systemTheme);
      htmlElement.setAttribute("data-theme", systemTheme);
    } else {
      htmlElement.classList.add(theme);
      htmlElement.setAttribute("data-theme", theme);
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system preference changes when using "system" theme
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      const htmlElement = document.documentElement;
      htmlElement.classList.remove("light", "dark");
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      htmlElement.classList.add(systemTheme);
      htmlElement.setAttribute("data-theme", systemTheme);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => setTheme(newTheme),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}