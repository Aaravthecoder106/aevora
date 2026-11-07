"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Trophy, Layers, Plus, LogOut, User as UserIcon, Terminal, ExternalLink } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { AuthModal } from "../auth/AuthModal";

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <header className="glass-header sticky top-0 z-40 w-full backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand & Left Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-950 border border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:border-emerald-500/60 transition-all duration-300">
                <span className="font-mono font-black text-sm text-emerald-400">R⚡</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  REMORPH
                </span>
                <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase -mt-0.5">
                  Proof of Work
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/"
                    ? "text-white bg-white/[0.08] shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                Feed
              </Link>
              <Link
                href="/challenges"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/challenges")
                    ? "text-white bg-white/[0.08] shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Challenges</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  2 LIVE
                </span>
              </Link>
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {user && profile ? (
              <div className="flex items-center gap-3">
                {/* Shipping Streak Badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill text-xs font-mono text-orange-400 border border-orange-500/20">
                  <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
                  <span>{profile.streak_count}d STREAK</span>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full glass-pill hover:ring-2 hover:ring-emerald-500/30 transition-all"
                  >
                    <img
                      src={profile.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=builder"}
                      alt={profile.username}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                    />
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 rounded-xl glass-panel p-1.5 shadow-2xl border border-white/[0.1] z-50 text-sm"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                        <p className="font-semibold text-white truncate">{profile.full_name || profile.username}</p>
                        <p className="text-xs text-zinc-400 font-mono truncate">@{profile.username}</p>
                      </div>

                      <Link
                        href={`/u/${profile.username}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-emerald-400" />
                        <span>My Proof-of-Work</span>
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Terminal className="w-4 h-4 text-zinc-400" />
                        <span>Profile Settings</span>
                      </Link>

                      <div className="my-1 border-t border-white/[0.06]" />

                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white glass-pill transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold text-black bg-emerald-400 hover:bg-emerald-300 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
                >
                  Join Forge
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
