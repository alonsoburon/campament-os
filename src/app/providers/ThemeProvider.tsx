"use client";

import * as React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system" // Cambiar a "system" para que detecte el tema del SO
      enableColorScheme
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}

