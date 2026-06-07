"use client";

// Thin wrapper around next-themes' provider so the rest of the app imports
// from a single project-local module. The product surface is light-only
// (Notion theme), so we force `light` — this applies the `.light` token block
// in globals.css everywhere, ensuring token-based components never fall back
// to the legacy dark `:root` values.

import type { FC, ReactNode } from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

// next-themes 0.4+ omits `children` from its public ThemeProviderProps even
// though the runtime accepts it. Cast through FC<…> to silence the type
// checker without losing the prop surface for the wrapper.
const Provider = NextThemesProvider as unknown as FC<ThemeProviderProps & { children: ReactNode }>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps & { children: ReactNode }) {
  return (
    <Provider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange {...props}>
      {children}
    </Provider>
  );
}
