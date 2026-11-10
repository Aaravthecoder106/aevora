"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Clock,
  Zap,
  ShieldCheck,
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
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0d0e13] rounded-lg p-5 border border-slate-200 dark:border-[#1e1f25] shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-blue-600 dark:text-[#adc6ff] bg-blue-50 dark:bg-[#292a2f] border border-blue-200/70 dark:border-transparent mb-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>ACTIVE ENGINEERING SPRINTS &amp; BOUNTIES</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#e3e1e9] tracking-tight">
              Hardware Proof Sprints &amp; Community Grants
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#8c909f] font-mono mt-1">
              Time-boxed build sprints. Ship functional breadboards, micro-kernels, or local AI tools to claim community hardware vouchers and bounties.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1a1b21] p-1 rounded-md border border-slate-200 dark:border-[#292a2f] self-start sm:self-auto shrink-0">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                filter === "all"
                  ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] font-semibold shadow-xs"
                  : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({challenges.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                filter === "active"
                  ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] font-semibold shadow-xs"
                  : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Active Sprints
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                filter === "completed"
                  ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] font-semibold shadow-xs"
                  : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </div>

      {/* Challenges List or Clean Empty State */}
      {filteredChallenges.length === 0 ? (
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6 text-blue-600 dark:text-[#adc6ff]" />
          </div>
          <h3 className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
            No sprints found
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono max-w-md mx-auto leading-relaxed">
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
                className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-6 shadow-xs space-y-5 hover:border-slate-300 dark:hover:border-[#292a2f] transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${
                        isActive
                          ? "bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border-blue-200 dark:border-transparent"
                          : "bg-slate-100 dark:bg-[#1a1b21] text-slate-500 dark:text-[#8c909f] border-slate-200 dark:border-[#292a2f]"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {isActive ? "ACTIVE SPRINT" : "COMPLETED"}
                    </span>

                    {challenge.sponsoredBy && (
                      <span className="text-xs font-mono text-slate-500 dark:text-[#8c909f]">
                        via {challenge.sponsoredBy}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-[#8c909f]">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
                    <span>{isActive ? `Ends in: ${timeRemaining}` : "Sprint Concluded"}</span>
                  </div>
                </div>

                {/* Challenge Info */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-[#e3e1e9]">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#c2c6d6] font-mono mt-1 font-medium">
                    {challenge.tagline}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#8c909f] mt-2 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                {/* Rules & Requirements Box */}
                <div className="p-4 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-[#c2c6d6] text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
                    <span>Proof of Work Requirements:</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 dark:text-[#c2c6d6] text-[11px]">
                    {challenge.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-[#adc6ff] font-bold">›</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Metrics & Submit Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-[#1e1f25] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
                        Sprint Prize Grant
                      </div>
                      <div className="text-sm font-bold font-mono text-blue-600 dark:text-[#adc6ff] tabular-nums">
                        {challenge.prizePool}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
                        Verified Ships
                      </div>
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-[#e3e1e9] tabular-nums">
                        {challenge.submissionsCount} {challenge.maxSlots ? `/ ${challenge.maxSlots}` : ""}
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <button
                      onClick={() => onSubmitBuild(challenge)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-colors shadow-xs"
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
