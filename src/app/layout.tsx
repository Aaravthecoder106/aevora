import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AEVORA // FORGE — Proof-of-Work Platform for Hardware & AI Builders",
  description:
    "The Proof-of-Work Hub for Hardware & AI Builders. Live chronological ship feed, open collaborator matching, engineering blueprints, and timed build sprints.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 cyber-grid relative selection:bg-emerald-500/20 selection:text-emerald-400">
        {/* Subtle Ambient Engineering Radiance Background */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[350px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent)] pointer-events-none z-0" />

        <AuthProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Suspense fallback={<div className="h-14 border-b border-zinc-800 bg-zinc-950" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1">{children}</main>

            {/* Engineering Footer */}
            <footer className="border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md py-5 text-center text-xs font-mono text-zinc-500 relative z-10">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400">AEVORA // FORGE</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-400">The Proof-of-Work Hub for Hardware & AI</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                  <span>Hardware & AI Systems</span>
                  <span className="text-zinc-700">•</span>
                  <span>Zero Vaporware</span>
                  <span className="text-zinc-700">•</span>
                  <span>v2.5.0</span>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
