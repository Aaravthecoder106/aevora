import type { Metadata } from "next";
import { Geist, Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased light`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('aevora_theme');
                  if (t === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8fafc] dark:bg-[#121318] text-slate-900 dark:text-[#e3e1e9] tech-grid relative selection:bg-blue-600/20 selection:text-blue-700 dark:selection:bg-blue-500/30 dark:selection:text-[#adc6ff]">
        {/* Ambient Engineering Radial Glow */}
        <div className="fixed inset-0 pointer-events-none opacity-80 dark:opacity-40 [background-image:radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(37,99,235,0.10),transparent_70%)] dark:[background-image:radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(77,142,255,0.12),transparent_70%)] z-0" />

        <ThemeProvider>
          <AuthProvider>
            <div className="relative z-10 flex flex-col min-h-screen">
              <Suspense
                fallback={
                  <div className="h-16 border-b border-slate-200 dark:border-[#1e1f25] bg-white/90 dark:bg-[#0d0e13]/85" />
                }
              >
                <Navbar />
              </Suspense>

              <main className="flex-1">{children}</main>

              {/* Precision Engineering Footer */}
              <footer className="border-t border-slate-200 dark:border-[#1e1f25] bg-white/80 dark:bg-[#0d0e13] py-4 px-6 text-[11px] font-mono text-slate-500 dark:text-[#8c909f] relative z-10 transition-colors">
                <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 tracking-wide">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800 dark:text-[#c2c6d6]">
                      AEVORA // FORGE
                    </span>
                    <span className="text-slate-300 dark:text-[#424754]">·</span>
                    <span>Supabase Realtime Database</span>
                    <span className="text-slate-300 dark:text-[#424754]">·</span>
                    <span className="text-emerald-600 dark:text-emerald-400">CONNECTED</span>
                  </div>
                  <div>
                    <span>Proof-of-Work Hardware &amp; AI Community</span>
                  </div>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
