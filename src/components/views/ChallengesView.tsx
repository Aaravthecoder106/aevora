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

  const filteredChallenges = challenges.filter((c) => {
    if (filter === "active") return c.status === "active";
    if (filter === "completed") return c.status === "completed";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium text-amber-700 bg-amber-50 border border-amber-200 mb-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>ACTIVE ENGINEERING SPRINT BOARD</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Community Build Challenges & Bounties
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Time-boxed proof-of-work challenges. Prototype real circuits, write systems code, and claim community grants.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-mono self-start sm:self-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                filter === "all"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All ({challenges.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                filter === "active"
                  ? "bg-white text-emerald-700 shadow-xs border border-slate-200 font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Active ({challenges.filter((c) => c.status === "active").length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                filter === "completed"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Archived ({challenges.filter((c) => c.status === "completed").length})
            </button>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {filteredChallenges.map((challenge) => {
          const isActive = challenge.status === "active";
          const progressPercent = challenge.maxSlots
            ? Math.min(100, Math.round((challenge.submissionsCount / challenge.maxSlots) * 100))
            : 60;

          return (
            <div
              key={challenge.id}
              className={`bg-white rounded-xl p-5 sm:p-6 border transition-all shadow-xs ${
                isActive
                  ? "border-emerald-200 hover:border-emerald-300"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>ACTIVE SPRINT</span>
                        </>
                      ) : (
                        <span>COMPLETED</span>
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{isActive ? formatCountdown(challenge.endsAt) : "Archived"}</span>
                    </span>

                    {challenge.sponsoredBy && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Grant Provider: {challenge.sponsoredBy}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-emerald-700 font-mono font-medium mt-0.5">
                      {challenge.tagline}
                    </p>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed font-sans">
                    {challenge.description}
                  </p>

                  {/* Rules Breakdown */}
                  {challenge.rules.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Sprint Rules & Verification Criteria:
                      </span>
                      <ul className="space-y-1 text-slate-600">
                        {challenge.rules.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Submission Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>Verified Submissions: {challenge.submissionsCount}</span>
                      {challenge.maxSlots && (
                        <span>Slot Quota: {challenge.maxSlots} builds</span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Action & Bounty Box */}
                <div className="lg:w-64 shrink-0 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Prize & Bounties
                    </span>
                    <p className="text-base font-bold font-mono text-slate-900">
                      {challenge.prizePool}
                    </p>
                  </div>

                  {isActive ? (
                    <button
                      onClick={() => onSubmitBuild(challenge)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-xs active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Submit Build</span>
                    </button>
                  ) : (
                    <div className="text-center py-2 px-3 rounded-lg bg-slate-200 text-slate-600 text-xs font-mono font-medium">
                      Sprint Closed
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
