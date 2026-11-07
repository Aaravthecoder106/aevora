"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Ship,
  Trophy,
  Calendar,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
} from "lucide-react";
import { GithubIcon } from "../ui/Icons";
import { Profile } from "@/lib/supabase/types";

interface BuilderStatsProps {
  profile: Profile;
  totalUpvotes?: number;
}

export function BuilderStats({ profile, totalUpvotes = 0 }: BuilderStatsProps) {
  const [lastShipped, setLastShipped] = React.useState("");

  React.useEffect(() => {
    if (profile.last_shipped_at) {
      setLastShipped(new Date(profile.last_shipped_at).toLocaleDateString());
    } else {
      setLastShipped("Never");
    }
  }, [profile.last_shipped_at]);
  return (
    <div className="space-y-6 mb-8">
      {/* Proof-of-Work Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden"
      >
        {/* Subtle radial ambient */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={
                  profile.avatar_url ||
                  "https://api.dicebear.com/7.x/bottts/svg?seed=builder"
                }
                alt={profile.username}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-zinc-700/80 shadow-xl"
              />
              {profile.streak_count > 0 && (
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-orange-500 text-black font-mono font-bold text-xs flex items-center gap-1 shadow-lg border border-black">
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  <span>{profile.streak_count}d</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {profile.full_name || profile.username}
                </h1>
                {profile.is_admin && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    CORE FORGE
                  </span>
                )}
              </div>

              <p className="text-sm font-mono text-zinc-400">@{profile.username}</p>

              {profile.bio && (
                <p className="text-sm text-zinc-300 max-w-xl pt-1 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-pill text-xs font-mono text-zinc-300 hover:text-white transition-all"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
                <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
              </a>
            )}

            {profile.discord_handle && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-pill text-xs font-mono text-zinc-400">
                <span className="text-[#8ea1e1]">Discord:</span>
                <span className="text-white">{profile.discord_handle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack Pills */}
        {profile.tech_stack && profile.tech_stack.length > 0 && (
          <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 mr-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>STACK:</span>
            </span>
            {profile.tech_stack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/[0.04] text-zinc-200 border border-white/[0.08]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-white/[0.07]">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <Ship className="w-3.5 h-3.5 text-emerald-400" />
            <span>TOTAL SHIPS</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {profile.ship_count || 0}
          </p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/[0.07]">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>ACTIVE STREAK</span>
          </div>
          <p className="text-2xl font-bold font-mono text-orange-400">
            {profile.streak_count || 0}{" "}
            <span className="text-xs font-normal text-zinc-400">days</span>
          </p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/[0.07]">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>CHALLENGES</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {profile.ship_count > 5 ? "2 Won" : "1 Active"}
          </p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/[0.07]">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>LAST SHIPPED</span>
          </div>
          <p className="text-sm font-semibold font-mono text-zinc-200 truncate mt-1">
            {lastShipped || "Recently"}
          </p>
        </div>
      </div>
    </div>
  );
}
