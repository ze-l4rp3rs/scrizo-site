"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "theme";

const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme | ((prev: Theme) => Theme)) => void;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  themes: typeof THEMES;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch {}
  }
  return "system";
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme, disableTransitionOnChange: boolean) {
  const root = document.documentElement;
  const resolved = resolve(theme);

  if (disableTransitionOnChange) {
    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode(
        "*,*::before,*::after{transition:none!important}",
      ),
    );
    document.head.appendChild(style);
    window.getComputedStyle(document.body);
    setTimeout(() => style.remove(), 1);
  }

  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  if (theme !== "system") {
    root.style.colorScheme = resolved;
  }
}

export function ThemeProvider({
  children,
  disableTransitionOnChange = false,
}: {
  children: ReactNode;
  disableTransitionOnChange?: boolean;
}) {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  useEffect(() => {
    applyTheme(theme, disableTransitionOnChange);
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system", disableTransitionOnChange);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, disableTransitionOnChange]);

  const setTheme = useCallback((next: Theme | ((prev: Theme) => Theme)) => {
    setThemeState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
      } catch {}
      return value;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const systemTheme = resolve("system");
    return {
      theme,
      setTheme,
      systemTheme,
      resolvedTheme: theme === "system" ? systemTheme : theme,
      themes: THEMES,
    };
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return (
    useContext(ThemeContext) ?? {
      theme: "system",
      setTheme: () => {},
      resolvedTheme: "light",
      systemTheme: "light",
      themes: THEMES,
    }
  );
}
