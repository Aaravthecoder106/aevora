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
  title: "Remorph Forge — Engineering Proof-of-Work Platform",
  description:
    "Community workspace for hardware and software builders. Proof-of-work feed, collaborative projects, engineering blueprints, and timed challenges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 relative selection:bg-emerald-200 selection:text-emerald-950">
        {/* Subtle Ambient Engineering Grid & Radiance Background */}
        <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-60 z-0" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.06),transparent)] pointer-events-none z-0" />

        <AuthProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Suspense fallback={<div className="h-14 border-b border-slate-200 bg-white" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1">{children}</main>

            {/* Engineering Footer */}
            <footer className="border-t border-slate-200 bg-white/80 backdrop-blur py-5 text-center text-xs font-mono text-slate-500 relative z-10">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600">REMORPH FORGE</span>
                  <span>/</span>
                  <span>Verifiable Proof of Work</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <span>Hardware & Systems Software</span>
                  <span>•</span>
                  <span>Community Standards</span>
                  <span>•</span>
                  <span>v2.4.0</span>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
