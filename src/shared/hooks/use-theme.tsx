"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type ThemeId = "warm" | "light" | "dark" | "midnight" | "forest" | "ocean";

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
}

export const THEMES: Record<ThemeId, Theme> = {
  warm: {
    id: "warm",
    name: "Warm",
    label: "🌅",
    bg: "#F0EDE8",
    bgSecondary: "#E8E4DD",
    surface: "#FDFCFA",
    surfaceBorder: "#E2DDD6",
    text: "#2C2416",
    textMuted: "#9C8E7A",
    accent: "#C9851A",
    accentLight: "#FDF3E1",
    accentFg: "#ffffff",
    previewBg: "#1A1410",
    previewText: "#E8DFD0",
    orbColors: ["#C9851A40", "#D4A03040", "#B8720020"],
  },
  light: {
    id: "light",
    name: "Light",
    label: "☀️",
    bg: "#F8F9FB",
    bgSecondary: "#F1F3F6",
    surface: "#FFFFFF",
    surfaceBorder: "#E4E4E7",
    text: "#111218",
    textMuted: "#71717A",
    accent: "#6366F1",
    accentLight: "#EEF2FF",
    accentFg: "#ffffff",
    previewBg: "#0F1117",
    previewText: "#E2E8F0",
    orbColors: ["#6366F130", "#818CF840", "#4F46E520"],
  },
  dark: {
    id: "dark",
    name: "Dark",
    label: "🌙",
    bg: "#111218",
    bgSecondary: "#0F1015",
    surface: "#1A1B23",
    surfaceBorder: "#2A2B35",
    text: "#E2E8F0",
    textMuted: "#6B7280",
    accent: "#818CF8",
    accentLight: "#1E1F3A",
    accentFg: "#ffffff",
    previewBg: "#0A0A0F",
    previewText: "#C8D0E0",
    orbColors: ["#818CF840", "#6366F130", "#4F46E520"],
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    label: "🌌",
    bg: "#0A0D1A",
    bgSecondary: "#080B15",
    surface: "#111525",
    surfaceBorder: "#1E2440",
    text: "#C8D8F8",
    textMuted: "#4A5580",
    accent: "#4F8EF7",
    accentLight: "#0F1A35",
    accentFg: "#ffffff",
    previewBg: "#05080F",
    previewText: "#A8C0E8",
    orbColors: ["#4F8EF740", "#2563EB30", "#1D4ED820"],
  },
  forest: {
    id: "forest",
    name: "Forest",
    label: "🌿",
    bg: "#0F1A12",
    bgSecondary: "#0C1610",
    surface: "#162019",
    surfaceBorder: "#243528",
    text: "#D4E8D0",
    textMuted: "#4A7055",
    accent: "#4CAF72",
    accentLight: "#102018",
    accentFg: "#ffffff",
    previewBg: "#080F0A",
    previewText: "#B0D4A8",
    orbColors: ["#4CAF7240", "#22C55E30", "#16A34A20"],
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    label: "🌊",
    bg: "#0A1520",
    bgSecondary: "#080F18",
    surface: "#0F1D2C",
    surfaceBorder: "#1A3045",
    text: "#C0D8F0",
    textMuted: "#3A6080",
    accent: "#22A8D4",
    accentLight: "#0A1E30",
    accentFg: "#ffffff",
    previewBg: "#050C14",
    previewText: "#A0C8E8",
    orbColors: ["#22A8D440", "#0EA5E930", "#0284C720"],
  },
};

const THEME_ORDER: ThemeId[] = ["warm", "light", "dark", "midnight", "forest", "ocean"];

interface ThemeCtx {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: THEMES.warm,
  themeId: "warm",
  setTheme: () => {},
  cycleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("warm");

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem("rb-theme", id);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeId((cur) => {
      const idx = THEME_ORDER.indexOf(cur);
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      localStorage.setItem("rb-theme", next);
      return next;
    });
  }, []);

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("rb-theme") as ThemeId | null;
    if (saved && THEMES[saved]) setThemeId(saved);
  }, []);

  // D key = cycle theme
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "d" || e.key === "D") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        cycleTheme();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
