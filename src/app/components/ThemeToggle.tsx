"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import "@theme-toggles/react/css/Within.css";
import { Within } from "@theme-toggles/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [optimisticTheme, setOptimisticTheme] = React.useState<string | null>(
    null,
  );
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (optimisticTheme && optimisticTheme === resolvedTheme) {
      setOptimisticTheme(null);
    }
  }, [optimisticTheme, resolvedTheme]);

  const currentTheme = optimisticTheme ?? resolvedTheme;
  const isDark = currentTheme === "dark";

  const toggleTheme = async () => {
    const button = buttonRef.current;
    const nextTheme = isDark ? "light" : "dark";
    setOptimisticTheme(nextTheme);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const startTransition = (document as any).startViewTransition?.bind(
      document,
    );

    if (!button || !startTransition || prefersReducedMotion) {
      setTheme(nextTheme);
      return;
    }

    const transition = startTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    try {
      await transition.ready;
    } catch {
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const right = window.innerWidth - rect.left;
    const bottom = window.innerHeight - rect.top;

    const radius = Math.hypot(
      Math.max(rect.left, right),
      Math.max(rect.top, bottom),
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center">
        <div className="h-9 w-9 rounded-full bg-(--surface-hover)" />
      </div>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Cambiar tema"
      onClick={toggleTheme}
      className="theme-toggle-button group relative flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--card) text-(--text-primary) shadow-s transition-all duration-300 hover:-translate-y-0.5 hover:shadow-m focus:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)/40 focus-visible:ring-offset-2 focus-visible:ring-offset-(--card)"
    >
      <Within duration={750} toggled={isDark} />
    </button>
  );
}

