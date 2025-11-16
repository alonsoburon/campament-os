"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

interface Theme {
  name: string;
  icon: React.ReactNode;
}

const themes: Theme[] = [
  { name: "light", icon: <Sun className="h-4 w-4" /> },
  { name: "dark", icon: <Moon className="h-4 w-4" /> },
];

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = async () => {
    const currentIndex = themes.findIndex((t) => t.name === theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length]!.name;

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    await transition.ready;
  };

  if (!isMounted) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-muted/50 transition-colors">
        <Sun className="h-4 w-4 animate-pulse text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div
      className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-muted/50 p-2 transition-colors hover:bg-muted"
      role="button"
      tabIndex={0}
      aria-label="Cambiar tema"
      onClick={() => void toggleTheme()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void toggleTheme();
        }
      }}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </div>
  );
}
