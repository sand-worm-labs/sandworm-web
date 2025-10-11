// "use client";

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useMemo,
//   useCallback,
//   useState,
// } from "react";

// type Theme = "dark" | "light" | "system";

// type ThemeProviderProps = {
//   children: React.ReactNode;
//   defaultTheme?: Theme;
//   storageKey?: string;
// };

// type ThemeProviderState = {
//   theme: Theme;
//   setTheme: (theme: Theme) => void;
// };

// const initialState: ThemeProviderState = {
//   theme: "system",
//   setTheme: () => null,
// };

// const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// export function ThemeProvider({
//   children,
//   defaultTheme = "system",
//   storageKey = "vite-ui-theme",
//   ...props
// }: ThemeProviderProps) {
//   const [theme, setThemeState] = useState<Theme>(defaultTheme);

//   useEffect(() => {
//     const storedTheme =
//       typeof window !== "undefined"
//         ? (localStorage.getItem(storageKey) as Theme)
//         : null;

//     if (storedTheme) {
//       setThemeState(storedTheme);
//     }
//   }, [storageKey]);

//   useEffect(() => {
//     const root = window.document.documentElement;

//     root.classList.remove("light", "dark");

//     if (theme === "system") {
//       const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
//         .matches
//         ? "dark"
//         : "light";

//       root.classList.add(systemTheme);
//       return;
//     }

//     root.classList.add(theme);
//   }, [theme]);

//   const setTheme = useCallback(
//     (newTheme: Theme) => {
//       localStorage.setItem(storageKey, newTheme);
//       setThemeState(newTheme);
//     },
//     [storageKey]
//   );

//   const value = useMemo(
//     () => ({
//       theme,
//       setTheme,
//     }),
//     [theme, setTheme]
//   );

//   return (
//     <ThemeProviderContext.Provider {...props} value={value}>
//       {children}
//     </ThemeProviderContext.Provider>
//   );
// }

// export const useTheme = () => {
//   const context = useContext(ThemeProviderContext);

//   if (context === undefined)
//     throw new Error("useTheme must be used within a ThemeProvider");

//   return context;
// };

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
