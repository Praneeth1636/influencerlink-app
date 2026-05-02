"use client";

// Thin wrapper around next-themes' provider so the rest of the app imports
// from a single project-local module. Defaults to dark to match the existing
// design tokens; flipping the toggle adds .light to <html> which the css
// vars in globals.css respond to.

import type { FC, ReactNode } from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

// next-themes 0.4+ omits `children` from its public ThemeProviderProps even
// though the runtime accepts it. Cast through FC<…> to silence the type
// checker without losing the prop surface for the wrapper.
const Provider = NextThemesProvider as unknown as FC<ThemeProviderProps & { children: ReactNode }>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps & { children: ReactNode }) {
  return (
    <Provider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange {...props}>
      {children}
    </Provider>
  );
}
