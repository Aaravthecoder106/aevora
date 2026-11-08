"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Trophy,
  Layers,
  Plus,
  LogOut,
  User as UserIcon,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Compass,
  Cpu,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { AuthModal } from "../auth/AuthModal";

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <header className="glass-header sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand & Workspace Indicator */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-emerald-500/30 flex items-center justify-center shadow-sm group-hover:border-emerald-500/80 transition-all duration-300">
                <span className="font-mono font-black text-xs text-emerald-400">R</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  REMORPH
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  FORGE v2.4
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sprint #04 Active</span>
              <span className="text-slate-300">/</span>
              <span>24 Ships Today</span>
            </div>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Shipping Streak Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-mono font-medium">
              <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
              <span>{profile?.streak_count || 6}d Streak</span>
            </div>

            {user || profile ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/40 transition-all border border-slate-200 bg-white"
                >
                  <img
                    src={
                      profile?.avatar_url ||
                      "https://api.dicebear.com/7.x/bottts/svg?seed=ay473671"
                    }
                    alt={profile?.username || "ay473671"}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-700 pr-2 hidden sm:inline">
                    @{profile?.username || "ay473671"}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-white p-1.5 shadow-xl border border-slate-200 z-50 text-sm"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="font-semibold text-slate-900 truncate">
                        {profile?.full_name || "Aarav Kumar"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono truncate">
                        @{profile?.username || "ay473671"}
                      </p>
                    </div>

                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors text-xs font-mono"
                    >
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      <span>Profile Settings</span>
                    </Link>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left text-xs font-mono"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
