"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="rounded-full font-bold px-4 h-10 transition-all hover:scale-105 active:scale-95 border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
    >
      {theme === "dark" ? (
        <>
          <Sun className="mr-2 h-4 w-4 text-amber-400" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="mr-2 h-4 w-4 text-indigo-500" />
          <span>Dark Mode</span>
        </>
      )}
    </Button>
  );
}
