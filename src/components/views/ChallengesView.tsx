"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { ChallengeItem } from "@/lib/types/community";
import { formatCountdown } from "@/lib/utils";

interface ChallengesViewProps {
  challenges: ChallengeItem[];
  onSubmitBuild: (challenge: ChallengeItem) => void;
}

export function ChallengesView({ challenges, onSubmitBuild }: ChallengesViewProps) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredChallenges = challenges.filter((c) => {
    if (filter === "active") return c.status === "active";
    if (filter === "completed") return c.status === "completed";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium text-amber-400 bg-amber-950/40 border border-amber-500/30 mb-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>ACTIVE ENGINEERING SPRINTS & BOUNTIES</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
              Hardware Proof Sprints & Community Grants
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Time-boxed build sprints. Ship functional breadboards, micro-kernels, or local AI tools to claim community hardware vouchers and bounties.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                filter === "all"
                  ? "bg-zinc-800 text-zinc-100 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({challenges.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                filter === "active"
                  ? "bg-zinc-800 text-zinc-100 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Active Sprints
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                filter === "completed"
                  ? "bg-zinc-800 text-zinc-100 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </div>

      {/* Challenges List or Clean Empty State */}
      {filteredChallenges.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Trophy className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-sm font-mono font-bold text-zinc-300">
            No sprints found
          </h3>
          <p className="text-xs text-zinc-500 font-mono max-w-md mx-auto leading-relaxed">
            There are currently no challenges in this category. New community sprints are deployed bi-weekly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChallenges.map((challenge) => {
            const isActive = challenge.status === "active";
            const timeRemaining = now ? formatCountdown(challenge.endsAt) : "Calculating...";

            return (
              <div
                key={challenge.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-5 hover:border-zinc-700 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                        isActive
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                          : "bg-zinc-950 text-zinc-500 border-zinc-800"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {isActive ? "ACTIVE SPRINT" : "COMPLETED"}
                    </span>

                    {challenge.sponsoredBy && (
                      <span className="text-xs font-mono text-zinc-500">
                        via {challenge.sponsoredBy}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isActive ? `Ends in: ${timeRemaining}` : "Sprint Concluded"}</span>
                  </div>
                </div>

                {/* Challenge Info */}
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{challenge.title}</h3>
                  <p className="text-xs text-zinc-300 font-mono mt-1 font-semibold">
                    {challenge.tagline}
                  </p>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans">
                    {challenge.description}
                  </p>
                </div>

                {/* Rules & Requirements Box */}
                <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Proof of Work Requirements:</span>
                  </div>
                  <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                    {challenge.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">›</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Metrics & Submit Action */}
                <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        Sprint Prize Grant
                      </div>
                      <div className="text-sm font-bold font-mono text-amber-400">
                        {challenge.prizePool}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        Verified Ships
                      </div>
                      <div className="text-sm font-bold font-mono text-emerald-400">
                        {challenge.submissionsCount} {challenge.maxSlots ? `/ ${challenge.maxSlots}` : ""}
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <button
                      onClick={() => onSubmitBuild(challenge)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-colors shadow-lg shadow-emerald-950/50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Submit Sprint Build</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
