"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Clock, ArrowRight, Zap, Flame, ShieldAlert } from "lucide-react";
import { Challenge } from "@/lib/supabase/types";
import { formatCountdown } from "@/lib/utils";

interface ActiveChallengeBannerProps {
  challenge: Challenge;
  onQuickShipClick?: (challengeId: string, slug: string) => void;
}

export function ActiveChallengeBanner({ challenge, onQuickShipClick }: ActiveChallengeBannerProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    setTimeLeft(formatCountdown(challenge.ends_at));
    const timer = setInterval(() => {
      setTimeLeft(formatCountdown(challenge.ends_at));
    }, 60000);
    return () => clearInterval(timer);
  }, [challenge.ends_at]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl glass-panel-glow p-5 sm:p-6 mb-8"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ACTIVE CHALLENGE</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.06]">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{timeLeft || "Active sprint"}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {challenge.title}
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed line-clamp-2">
            {challenge.description}
          </p>
        </div>

        <div className="flex sm:flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto shrink-0">
          <Link
            href={`/challenges/${challenge.slug}`}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-pill hover:bg-white/[0.08] text-xs font-mono uppercase tracking-wider text-white border border-white/[0.12] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View Brief & Submissions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {onQuickShipClick && (
            <button
              onClick={() => onQuickShipClick(challenge.id, challenge.slug)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Submit Ship-Log</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
