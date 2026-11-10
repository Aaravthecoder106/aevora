"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  LogOut,
  ChevronDown,
  Cpu,
  Sun,
  Moon,
  Bell,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useTheme } from "../theme/ThemeProvider";
import { AuthModal } from "../auth/AuthModal";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Unauthenticated Gateway Header (Matches minimal blue gateway design)
  if (!user) {
    return (
      <>
        <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between relative z-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:bg-blue-700 transition-colors">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-xs font-semibold tracking-wider text-slate-900 dark:text-white uppercase">
                AEVORA
              </span>
              <span className="text-slate-400 dark:text-slate-600 text-xs font-mono">
                /
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                FORGE GATEWAY
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/70 dark:bg-[#102034]/70 border border-slate-200/80 dark:border-slate-800 rounded-full text-[11px] font-mono text-slate-500 dark:text-slate-400 backdrop-blur-sm shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SILICON_NODE_04</span>
            </div>

            {/* Light/Dark Switch Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle visual mode"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#102034] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              {theme === "light" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-mono text-[11px] tracking-tight">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono text-[11px] tracking-tight">Dark</span>
                </>
              )}
            </button>
          </div>
        </header>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  // Authenticated Workspace Header
  return (
    <>
      <header className="glass-header sticky top-0 z-40 w-full transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Node Telemetry Pill */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:bg-blue-700 transition-colors">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-wider text-slate-900 dark:text-[#e3e1e9]">
                  AEVORA
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-[#c2c6d6] bg-[#e8eef5] dark:bg-[#1e1f25] border border-slate-300/50 dark:border-transparent px-1.5 py-0.5 rounded">
                  / FORGE v2.5
                </span>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] px-2.5 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#4d8eff] animate-pulse" />
              <span className="font-mono text-[11px] text-slate-500 dark:text-[#c2c6d6]">
                Sprint #04 Active · Hardware &amp; AI Node
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Segmented Theme Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-[#1a1b21] border border-slate-300/60 dark:border-[#34343a] p-0.5 rounded-md shadow-xs">
              <button
                type="button"
                onClick={() => setTheme("light")}
                aria-label="Switch to Light Mode"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition-all font-medium ${
                  theme === "light"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                aria-label="Switch to Dark Mode"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition-all font-medium ${
                  theme === "dark"
                    ? "bg-[#292a2f] text-[#adc6ff] shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-[#c2c6d6]"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dark</span>
              </button>
            </div>

            {/* Streak Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] px-2.5 py-1 rounded text-xs font-mono font-medium">
              <Flame className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
              <span className="text-slate-900 dark:text-[#e3e1e9] tabular-nums">
                {profile?.streak_count || 1}d Streak
              </span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="p-1.5 text-slate-500 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e1f25] rounded transition-colors hidden sm:flex items-center justify-center"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#1a1b21] transition-all border border-transparent hover:border-slate-200 dark:hover:border-[#292a2f]"
              >
                <span className="text-xs font-mono text-slate-600 dark:text-[#c2c6d6] hidden lg:inline">
                  @{profile?.username || user.email?.split("@")[0]}
                </span>
                <img
                  src={
                    profile?.avatar_url ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || user.email || "builder"}`
                  }
                  alt={profile?.username || "builder"}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-[#424754] bg-slate-100 dark:bg-[#1a1b21]"
                />
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#8c909f]" />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#161A22] p-1.5 shadow-xl border border-slate-200 dark:border-[#292a2f] z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-[#232733] mb-1">
                    <p className="font-semibold text-slate-900 dark:text-[#e3e1e9] truncate text-xs">
                      {profile?.full_name || "Aevora Builder"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-[#8c909f] font-mono truncate">
                      @{profile?.username || user.email?.split("@")[0]}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/60 dark:border-transparent font-medium">
                      {profile?.role || "Hardware Hacker"}
                    </span>
                  </div>

                  <button
                    onClick={async () => {
                      await signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-xs font-mono text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
