import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rules Builder — Next.js AI Agent Rules Generator",
  description: "Visually build project rules and export for Claude, Cursor, or any AI agent",
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
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
