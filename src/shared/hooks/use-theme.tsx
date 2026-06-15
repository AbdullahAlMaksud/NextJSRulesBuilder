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
    bg: "#080806",
    bgSecondary: "rgba(255,255,255,0.045)",
    surface: "rgba(255,255,255,0.064)",
    surfaceBorder: "rgba(255,255,255,0.12)",
    text: "#f6f0e6",
    textMuted: "rgba(246,240,230,0.46)",
    accent: "#e0b130",
    accentLight: "rgba(224,177,48,0.16)",
    accentFg: "#090806",
    previewBg: "rgba(0,0,0,0.28)",
    previewText: "rgba(246,240,230,0.68)",
    orbColors: ["#e0b130", "#8b6b1c", "#fff4c2"],
    wave: "rgba(28,22,12,0.88)",
    shadow: "rgba(224,177,48,0.18)",
  },
  dark: {
    id: "dark",
    name: "Graphite",
    label: "GR",
    bg: "#080a0e",
    bgSecondary: "rgba(255,255,255,0.045)",
    surface: "rgba(255,255,255,0.062)",
    surfaceBorder: "rgba(255,255,255,0.12)",
    text: "#eef2f7",
    textMuted: "rgba(238,242,247,0.46)",
    accent: "#94a3b8",
    accentLight: "rgba(148,163,184,0.17)",
    accentFg: "#06080d",
    previewBg: "rgba(0,0,0,0.3)",
    previewText: "rgba(238,242,247,0.68)",
    orbColors: ["#94a3b8", "#475569", "#dbeafe"],
    wave: "rgba(17,24,39,0.9)",
    shadow: "rgba(148,163,184,0.16)",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    label: "MN",
    bg: "#050714",
    bgSecondary: "rgba(96,165,250,0.06)",
    surface: "rgba(96,165,250,0.07)",
    surfaceBorder: "rgba(147,197,253,0.15)",
    text: "#e7f0ff",
    textMuted: "rgba(231,240,255,0.45)",
    accent: "#60a5fa",
    accentLight: "rgba(96,165,250,0.18)",
    accentFg: "#020617",
    previewBg: "rgba(2,6,23,0.48)",
    previewText: "rgba(231,240,255,0.68)",
    orbColors: ["#60a5fa", "#2563eb", "#93c5fd"],
    wave: "rgba(8,18,44,0.92)",
    shadow: "rgba(96,165,250,0.18)",
  },
  forest: {
    id: "forest",
    name: "Forest",
    label: "FR",
    bg: "#06100a",
    bgSecondary: "rgba(74,222,128,0.055)",
    surface: "rgba(74,222,128,0.065)",
    surfaceBorder: "rgba(134,239,172,0.15)",
    text: "#e7f8e7",
    textMuted: "rgba(231,248,231,0.43)",
    accent: "#4ade80",
    accentLight: "rgba(74,222,128,0.17)",
    accentFg: "#031007",
    previewBg: "rgba(2,12,6,0.44)",
    previewText: "rgba(231,248,231,0.68)",
    orbColors: ["#4ade80", "#16a34a", "#bbf7d0"],
    wave: "rgba(8,31,16,0.9)",
    shadow: "rgba(74,222,128,0.16)",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    label: "OC",
    bg: "#041016",
    bgSecondary: "rgba(34,211,238,0.055)",
    surface: "rgba(34,211,238,0.065)",
    surfaceBorder: "rgba(103,232,249,0.16)",
    text: "#e4fbff",
    textMuted: "rgba(228,251,255,0.43)",
    accent: "#22d3ee",
    accentLight: "rgba(34,211,238,0.17)",
    accentFg: "#021014",
    previewBg: "rgba(2,16,23,0.46)",
    previewText: "rgba(228,251,255,0.68)",
    orbColors: ["#22d3ee", "#0284c7", "#a5f3fc"],
    wave: "rgba(5,32,43,0.9)",
    shadow: "rgba(34,211,238,0.16)",
  },
  light: {
    id: "light",
    name: "Frost",
    label: "FS",
    bg: "#edf1f7",
    bgSecondary: "rgba(255,255,255,0.64)",
    surface: "rgba(255,255,255,0.62)",
    surfaceBorder: "rgba(15,23,42,0.1)",
    text: "#111827",
    textMuted: "rgba(17,24,39,0.48)",
    accent: "#4f46e5",
    accentLight: "rgba(79,70,229,0.12)",
    accentFg: "#ffffff",
    previewBg: "rgba(255,255,255,0.58)",
    previewText: "rgba(17,24,39,0.72)",
    orbColors: ["#4f46e5", "#93c5fd", "#ffffff"],
    wave: "rgba(255,255,255,0.62)",
    shadow: "rgba(79,70,229,0.14)",
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
  theme: THEMES.warm,
  themeId: "warm",
  setTheme: () => {},
  cycleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("warm");

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
