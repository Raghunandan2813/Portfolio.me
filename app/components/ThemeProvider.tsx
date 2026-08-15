"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * next-themes injects a tiny blocking script that sets `data-theme` on <html>
 * before first paint, which is what prevents the white flash a naive
 * useEffect-based toggle produces on every page load in dark mode.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemeProvider>
  );
}
