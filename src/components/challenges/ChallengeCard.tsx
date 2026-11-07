"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Clock, ArrowRight, Zap, CheckCircle2, Award } from "lucide-react";
import { Challenge } from "@/lib/supabase/types";
import { formatCountdown } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const isActive = challenge.status === "active";
  const isCompleted = challenge.status === "completed";
  const [timeDisplay, setTimeDisplay] = React.useState("");

  React.useEffect(() => {
    if (isActive) {
      setTimeDisplay(formatCountdown(challenge.ends_at));
    } else {
      setTimeDisplay(new Date(challenge.ends_at).toLocaleDateString());
    }
  }, [isActive, challenge.ends_at]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl p-6 glass-panel border transition-all ${
        isActive
          ? "border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.08)] hover:border-emerald-500/50"
          : "border-white/[0.08] hover:border-white/[0.14]"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
            isActive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
              : isCompleted
              ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
              : "bg-blue-500/10 text-blue-400 border border-blue-500/25"
          }`}
        >
          {isActive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE SPRINT</span>
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-zinc-400" />
              <span>COMPLETED</span>
            </>
          ) : (
            <span>UPCOMING</span>
          )}
        </span>

        <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-zinc-500" />
          <span>{timeDisplay || (isActive ? "Active" : "Archived")}</span>
        </span>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">
        {challenge.title}
      </h3>

      <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3 mb-4">
        {challenge.description}
      </p>

      {/* Winner banner if completed */}
      {isCompleted && challenge.winner && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <Award className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
              Winning Builder
            </span>
            <p className="text-xs font-semibold text-white truncate">
              {challenge.winner.full_name} (@{challenge.winner.username})
            </p>
          </div>
        </div>
      )}

      {/* Rules excerpt */}
      {challenge.rules && (
        <div className="mb-5 p-3 rounded-xl bg-black/40 border border-white/[0.04] text-xs font-mono text-zinc-400">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">
            Core Rules:
          </span>
          <p className="line-clamp-2">{challenge.rules}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
        <span className="text-xs font-mono text-zinc-500">
          Slug: #{challenge.slug}
        </span>

        <Link
          href={`/challenges/${challenge.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 transition-all"
        >
          <span>View Challenge</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
