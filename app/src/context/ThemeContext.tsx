import React from 'react'
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        return saved ?? "dark";
      });
  
    useEffect(() => {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }, [theme]);
  
    function toggleTheme() {
      setTheme((prev) => (prev === "light" ? "dark" : "light"));
    }
  
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }
  
  // eslint-disable-next-line react-refresh/only-export-components
  export function useTheme() {
    const context = useContext(ThemeContext);
  
    if (!context) {
      throw new Error("useTheme must be used inside ThemeProvider");
    }
  
    return context;
  }