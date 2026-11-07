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
  title: "Remorph — Proof-of-Work Hub for Builders",
  description:
    "Persistent feed, builder profiles, and community hardware & software challenges. Product Hunt meets GitHub activity feed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#f4f4f5] relative selection:bg-emerald-500 selection:text-black">
        {/* Subtle Ambient Mesh & Grid Background */}
        <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-40 z-0" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent)] pointer-events-none z-0" />
        <div className="fixed top-1/3 -right-40 w-[500px] h-[500px] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(249,115,22,0.04),transparent)] pointer-events-none z-0" />

        <AuthProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Suspense fallback={<div className="h-16 border-b border-white/[0.08]" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 pb-16">{children}</main>

            {/* Minimalist Footer */}
            <footer className="border-t border-white/[0.06] py-8 text-center text-xs font-mono text-zinc-500 relative z-10">
              <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">R⚡</span>
                  <span className="text-zinc-400">REMORPH FORGE</span>
                  <span>— Proof of Work for Builders</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                  <span>Supabase Powered</span>
                  <span>•</span>
                  <span>Hardware & Software</span>
                  <span>•</span>
                  <span>Zero AI Slop</span>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
