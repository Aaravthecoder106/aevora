"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { AuthModal } from "../auth/AuthModal";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <header className="glass-header sticky top-0 z-40 w-full backdrop-blur-md bg-zinc-950/85 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand & Workspace Indicator */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-emerald-500/40 flex items-center justify-center shadow-xs group-hover:border-emerald-400 transition-all duration-300">
                <span className="font-mono font-black text-xs text-emerald-400">A</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  AEVORA
                </span>
                <span className="text-zinc-600 font-mono text-xs">//</span>
                <span className="text-xs font-mono font-bold text-zinc-300">
                  FORGE
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  v2.5
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sprint #04 Active</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-500">Hardware & AI Node</span>
            </div>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-950/30 text-orange-400 border border-orange-500/30 text-xs font-mono font-medium">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>{profile?.streak_count || 1}d Streak</span>
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/40 transition-all border border-zinc-800 bg-zinc-900"
                >
                  <img
                    src={
                      profile?.avatar_url ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || user.email || "builder"}`
                    }
                    alt={profile?.username || "builder"}
                    className="w-7 h-7 rounded-full object-cover bg-zinc-800"
                  />
                  <span className="text-xs font-mono font-semibold text-zinc-200 pr-1 hidden sm:inline">
                    @{profile?.username || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-500 mr-1 hidden sm:inline" />
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 p-1.5 shadow-2xl border border-zinc-800 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                      <p className="font-semibold text-zinc-100 truncate text-xs">
                        {profile?.full_name || "Aevora Builder"}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        @{profile?.username || user.email?.split("@")[0]}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                        {profile?.role || "Hardware Hacker"}
                      </span>
                    </div>

                    <button
                      onClick={async () => {
                        await signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors text-xs font-mono text-left"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <span>Join Forge / Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
