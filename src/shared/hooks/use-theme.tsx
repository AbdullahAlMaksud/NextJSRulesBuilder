"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeId = "warm" | "dark" | "midnight" | "forest" | "ocean" | "light";

export interface Theme {
  id: ThemeId;
  name: string;
  label: string;
  bg: string;
  bgSecondary: string;
  surface: string;
  surfaceBorder: string;
  text: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentFg: string;
  previewBg: string;
  previewText: string;
  orbColors: string[];
  wave: string;
  shadow: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  warm: {
    id: "warm",
    name: "Warm Focus",
    label: "WF",
    bg: "#fbfaf7",
    bgSecondary: "#f4f1ea",
    surface: "#ffffff",
    surfaceBorder: "#e6e1d5",
    text: "#1c1917",
    textMuted: "#78716c",
    accent: "#d97706",
    accentLight: "#fef3c7",
    accentFg: "#ffffff",
    previewBg: "#fcfbfa",
    previewText: "#44403c",
    orbColors: ["#d97706", "#f59e0b", "#fef3c7"],
    wave: "#f4f1ea",
    shadow: "rgba(0,0,0,0.02)",
  },
  dark: {
    id: "dark",
    name: "Graphite",
    label: "GR",
    bg: "#09090b",
    bgSecondary: "#18181b",
    surface: "#18181b",
    surfaceBorder: "#27272a",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    accent: "#fafafa",
    accentLight: "#27272a",
    accentFg: "#09090b",
    previewBg: "#09090b",
    previewText: "#d4d4d8",
    orbColors: ["#27272a", "#3f3f46", "#52525b"],
    wave: "#18181b",
    shadow: "rgba(0,0,0,0.2)",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    label: "MN",
    bg: "#020617",
    bgSecondary: "#0f172a",
    surface: "#0f172a",
    surfaceBorder: "#1e293b",
    text: "#f8fafc",
    textMuted: "#64748b",
    accent: "#3b82f6",
    accentLight: "#1e293b",
    accentFg: "#ffffff",
    previewBg: "#020617",
    previewText: "#cbd5e1",
    orbColors: ["#1e293b", "#2563eb", "#3b82f6"],
    wave: "#0f172a",
    shadow: "rgba(0,0,0,0.2)",
  },
  forest: {
    id: "forest",
    name: "Forest",
    label: "FR",
    bg: "#022c22",
    bgSecondary: "#064e3b",
    surface: "#064e3b",
    surfaceBorder: "#0f766e",
    text: "#f0fdf4",
    textMuted: "#4ade80",
    accent: "#10b981",
    accentLight: "#064e3b",
    accentFg: "#ffffff",
    previewBg: "#022c22",
    previewText: "#a7f3d0",
    orbColors: ["#064e3b", "#0f766e", "#10b981"],
    wave: "#064e3b",
    shadow: "rgba(0,0,0,0.2)",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    label: "OC",
    bg: "#082f49",
    bgSecondary: "#0c4a6e",
    surface: "#0c4a6e",
    surfaceBorder: "#0369a1",
    text: "#f0f9ff",
    textMuted: "#38bdf8",
    accent: "#0ea5e9",
    accentLight: "#0c4a6e",
    accentFg: "#ffffff",
    previewBg: "#082f49",
    previewText: "#bae6fd",
    orbColors: ["#0c4a6e", "#0369a1", "#0ea5e9"],
    wave: "#0c4a6e",
    shadow: "rgba(0,0,0,0.2)",
  },
  light: {
    id: "light",
    name: "Frost",
    label: "FS",
    bg: "#ffffff",
    bgSecondary: "#ffffff",
    surface: "#ffffff",
    surfaceBorder: "#e4e4e7",
    text: "#18181b",
    textMuted: "#71717a",
    accent: "#4f46e5",
    accentLight: "#e0e7ff",
    accentFg: "#ffffff",
    previewBg: "#f4f4f5",
    previewText: "#27272a",
    orbColors: ["#e4e4e7", "#e0e7ff", "#ffffff"],
    wave: "#ffffff",
    shadow: "rgba(0,0,0,0.02)",
  },
};

const themeOrder: ThemeId[] = ["warm", "dark", "midnight", "forest", "ocean", "light"];

interface ThemeCtx {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: THEMES.light,
  themeId: "light",
  setTheme: () => {},
  cycleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("light");

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem("rules-theme", id);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeId((current) => {
      const next = themeOrder[(themeOrder.indexOf(current) + 1) % themeOrder.length];
      localStorage.setItem("rules-theme", next);
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("rules-theme") as ThemeId | null;
      if (saved && THEMES[saved]) setThemeId(saved);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const currentTheme = THEMES[themeId];
    const root = document.documentElement;
    root.style.setProperty("--theme-bg", currentTheme.bg);
    root.style.setProperty("--theme-surface", currentTheme.surface);
    root.style.setProperty("--theme-border", currentTheme.surfaceBorder);
    root.style.setProperty("--theme-text", currentTheme.text);
    root.style.setProperty("--theme-muted", currentTheme.textMuted);
    root.style.setProperty("--theme-accent", currentTheme.accent);
    root.style.setProperty("--theme-accent-light", currentTheme.accentLight);
    root.style.setProperty("--theme-accent-fg", currentTheme.accentFg);
    root.style.setProperty("--theme-preview-bg", currentTheme.previewBg);
    root.style.setProperty("--theme-preview-text", currentTheme.previewText);
    root.style.setProperty("--theme-shadow", currentTheme.shadow);
    root.style.color = currentTheme.text;
  }, [themeId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "d") return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      cycleTheme();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cycleTheme]);

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeId], themeId, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
