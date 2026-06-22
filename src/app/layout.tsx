import type { Metadata } from "next";

import LenisProvider from "@/components/common/lenis-provider";
import Navbar from "@/components/common/navbar";
import ThemeWrapper from "@/components/common/theme-wrapper";
import { ThemeProvider } from "@/shared/hooks/use-theme";
import { RulesProvider } from "@/shared/contexts/rules-context";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rulekit.abdullahalmaksud.com"),
  title: "RuleKit — Personlized rule maker for AI AGENTS",
  description: "Build clean, personalized system instructions and rules for AI agents like Claude, Cursor, Copilot, and more.",
  openGraph: {
    title: "RuleKit — Personlized rule maker for AI AGENTS",
    description: "Build clean, personalized system instructions and rules for AI agents like Claude, Cursor, Copilot, and more.",
    type: "website",
    locale: "en_US",
    siteName: "RuleKit",
  },
  twitter: {
    card: "summary_large_image",
    title: "RuleKit — Personlized rule maker for AI AGENTS",
    description: "Build clean, personalized system instructions and rules for AI agents like Claude, Cursor, Copilot, and more.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <RulesProvider>
            <LenisProvider>
              <ThemeWrapper>
                <Navbar />
                {children}
              </ThemeWrapper>
            </LenisProvider>
          </RulesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
