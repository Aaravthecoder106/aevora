"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Clock,
  Zap,
  ShieldCheck,
  Send,
  CheckCircle2,
  XCircle,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { ChallengeItem, ContestApplicationItem } from "@/lib/types/community";
import { formatCountdown } from "@/lib/utils";

interface ChallengesViewProps {
  challenges: ChallengeItem[];
  myApplications?: ContestApplicationItem[];
  onApplyContest: (challenge: ChallengeItem) => void;
  onWithdrawApplication: (contestId: string) => void;
  onSubmitBuild: (challenge: ChallengeItem) => void;
}

export function ChallengesView({
  challenges,
  myApplications = [],
  onApplyContest,
  onWithdrawApplication,
  onSubmitBuild,
}: ChallengesViewProps) {
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "completed">("all");
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredChallenges = challenges.filter((c) => {
    if (filter === "active") return c.status === "active";
    if (filter === "upcoming") return c.status === "upcoming";
    if (filter === "completed") return c.status === "completed";
    return true;
  });

  const appByContestId: Record<string, ContestApplicationItem> = {};
  myApplications.forEach((app) => {
    appByContestId[app.contestId] = app;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0d0e13] rounded-lg p-5 border border-slate-200 dark:border-[#1e1f25] shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-blue-600 dark:text-[#adc6ff] bg-blue-50 dark:bg-[#292a2f] border border-blue-200/70 dark:border-transparent mb-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>CONTESTS, GRANTS &amp; ENGINEERING SPRINTS</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#e3e1e9] tracking-tight">
              Aevora Contests &amp; Builder Applications
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#8c909f] font-mono mt-1">
              Admin-curated engineering contests. Submit your project proposal to apply, get approved by platform admins, and ship verifiable hardware or AI builds.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1a1b21] p-1 rounded-md border border-slate-200 dark:border-[#292a2f] self-start sm:self-auto shrink-0">
            {(["all", "active", "upcoming", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded text-xs font-mono capitalize transition-all ${
                  filter === tab
                    ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] font-semibold shadow-xs"
                    : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab === "all" ? `All (${challenges.length})` : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contests List or Clean Empty State */}
      {filteredChallenges.length === 0 ? (
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6 text-blue-600 dark:text-[#adc6ff]" />
          </div>
          <h3 className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
            No published contests found
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono max-w-md mx-auto leading-relaxed">
            There are currently no published contests in this category. New contests published by admins will appear here for member applications.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChallenges.map((challenge) => {
            const isActive = challenge.status === "active";
            const isUpcoming = challenge.status === "upcoming";
            const isCompleted = challenge.status === "completed";
            const timeRemaining = now ? formatCountdown(challenge.endsAt) : "Calculating...";

            const myApp = challenge.myApplication || appByContestId[challenge.id] || null;
            const applyCutoff = new Date(challenge.applicationDeadline || challenge.endsAt).getTime();
            const isDeadlineOpen = !now || now <= applyCutoff;
            const isOpenForApply = (isActive || isUpcoming) && isDeadlineOpen;

            const requireApproval = challenge.requireApprovalToSubmit ?? true;
            const canSubmitBuild =
              isActive && (!requireApproval || myApp?.status === "approved");

            return (
              <div
                key={challenge.id}
                className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-6 shadow-xs space-y-5 hover:border-slate-300 dark:hover:border-[#292a2f] transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${
                        isActive
                          ? "bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border-blue-200 dark:border-transparent"
                          : isUpcoming
                          ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30"
                          : "bg-slate-100 dark:bg-[#1a1b21] text-slate-500 dark:text-[#8c909f] border-slate-200 dark:border-[#292a2f]"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {isActive ? "ACTIVE CONTEST" : isUpcoming ? "OPEN FOR REGISTRATION" : "COMPLETED"}
                    </span>

                    {challenge.sponsoredBy && (
                      <span className="text-xs font-mono text-slate-500 dark:text-[#8c909f]">
                        via {challenge.sponsoredBy}
                      </span>
                    )}

                    {myApp && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                          myApp.status === "approved"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                            : myApp.status === "rejected" || myApp.status === "withdrawn"
                            ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                            : myApp.status === "waitlisted"
                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
                            : "bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border-blue-200 dark:border-blue-500/30"
                        }`}
                      >
                        Your Application: {myApp.status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-[#8c909f]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
                      {isCompleted ? "Contest Concluded" : `Ends in: ${timeRemaining}`}
                    </span>
                    <Link
                      href={`/challenges/${challenge.slug}`}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-[#adc6ff] hover:underline"
                    >
                      <span>Brief</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Contest Info */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-[#e3e1e9]">
                    {challenge.title}
                  </h3>
                  {challenge.tagline && (
                    <p className="text-xs text-slate-600 dark:text-[#c2c6d6] font-mono mt-1 font-medium">
                      {challenge.tagline}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-[#8c909f] mt-2 leading-relaxed whitespace-pre-line">
                    {challenge.description}
                  </p>
                </div>

                {/* Rules & Requirements Box */}
                {challenge.rules.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md space-y-2 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-[#c2c6d6] text-[11px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
                      <span>Contest Rules &amp; Proof Requirements:</span>
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
                )}

                {/* Footer Metrics & Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-[#1e1f25] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6">
                    {challenge.prizePool && (
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
                          Prize Grant
                        </div>
                        <div className="text-sm font-bold font-mono text-blue-600 dark:text-[#adc6ff] tabular-nums">
                          {challenge.prizePool}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
                        Applications
                      </div>
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-[#e3e1e9] tabular-nums flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {challenge.approvedCount ?? 0} Approved
                          {challenge.maxSlots ? ` / ${challenge.maxSlots} Slots` : ""}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          ({challenge.applicationsCount ?? 0} total)
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
                        Verified Ships
                      </div>
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-[#e3e1e9] tabular-nums">
                        {challenge.submissionsCount}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Member hasn't applied yet */}
                    {!myApp && isOpenForApply && (
                      <button
                        onClick={() => onApplyContest(challenge)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-colors shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply to Contest</span>
                      </button>
                    )}

                    {/* Pending application -> allow withdraw */}
                    {myApp?.status === "pending" && (
                      <button
                        onClick={() => onWithdrawApplication(challenge.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-[#1a1b21] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-[#c2c6d6] hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-[#292a2f] font-mono text-xs rounded-md transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Withdraw Pending Application</span>
                      </button>
                    )}

                    {/* Approved or open-submission active contest -> allow Submit Build */}
                    {canSubmitBuild && (
                      <button
                        onClick={() => onSubmitBuild(challenge)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md transition-colors shadow-xs"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Submit Contest Build</span>
                      </button>
                    )}

                    {/* Approved upcoming indicator */}
                    {myApp?.status === "approved" && isUpcoming && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approved — Starts {new Date(challenge.startsAt).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
