import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUTRA (सूत्र) — AI Event Planner",
  description:
    "Deterministic DAG & GenAI Event Orchestration Harness. Plan weddings, birthdays, and community events with intelligent budgets, timelines, and vendor analysis.",
  keywords: [
    "event planner",
    "AI",
    "wedding planner",
    "budget calculator",
    "GenAI",
    "SUTRA",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-obsidian text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}

