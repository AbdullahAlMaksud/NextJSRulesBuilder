"use client";

import { useTheme } from "@/shared/hooks/use-theme";
import React from "react";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  const themeVars = {
    "--theme-bg": theme.bg,
    "--theme-surface": theme.surface,
    "--theme-border": theme.surfaceBorder,
    "--theme-text": theme.text,
    "--theme-muted": theme.textMuted,
    "--theme-accent": theme.accent,
    "--theme-accent-light": theme.accentLight,
    "--theme-accent-fg": theme.accentFg,
    "--theme-preview-bg": theme.previewBg,
    "--theme-preview-text": theme.previewText,
    "--theme-shadow": theme.shadow,
    color: theme.text,
  } as React.CSSProperties;

  return (
    <div style={themeVars} className="min-h-screen transition-colors duration-300">
      {children}
    </div>
  );
}
