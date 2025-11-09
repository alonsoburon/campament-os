"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-16 rounded-full bg-(--surface-hover)" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SwitchPrimitive.Root
        checked={isDark}
        onCheckedChange={handleToggle}
        className="relative inline-flex h-10 w-20 items-center rounded-full bg-(--surface-hover) px-2 transition-colors data-[state=checked]:bg-(--surface-active)"
        aria-label="Cambiar tema"
      >
        <Sun className="h-4 w-4 text-(--text-secondary)" />
        <SwitchPrimitive.Thumb
          className="absolute left-2 inline-flex h-6 w-6 translate-x-0 items-center justify-center rounded-full bg-(--background) text-(--text-primary) transition-transform duration-200 data-[state=checked]:translate-x-9"
        >
          {isDark ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </SwitchPrimitive.Thumb>
        <Moon className="ml-auto h-4 w-4 text-(--text-secondary)" />
      </SwitchPrimitive.Root>
    </div>
  );
}

