"use client";

import { useState } from "react";
import { LeaderboardRank } from "@/lib/types/community";
import {
  Trophy,
  Flame,
  Rocket,
  ThumbsUp,
  Award,
  Calendar,
  Medal,
  ExternalLink,
} from "lucide-react";

interface LeaderboardViewProps {
  monthlyData: Record<string, LeaderboardRank[]>;
}

export function LeaderboardView({ monthlyData }: LeaderboardViewProps) {
  const months = Object.keys(monthlyData);
  const [selectedMonth, setSelectedMonth] = useState<string>(months[0] || "November 2026");

  const ranks = monthlyData[selectedMonth] || [];

  const topBuilder = ranks[0];
  const mostShipped = [...ranks].sort((a, b) => b.projectsShipped - a.projectsShipped)[0];
  const longestStreak = [...ranks].sort((a, b) => b.streakDays - a.streakDays)[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                Proof-of-Work Ranking
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Monthly Builder Leaderboard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked dynamically by verified ship logs, hardware commits, code review karma, and active shipping streaks.
            </p>
          </div>

          {/* Month Selector Buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedMonth === m
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar className="w-3 h-3 text-slate-400" />
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          {topBuilder && (
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Medal className="w-4 h-4 text-amber-700" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-800">
                  #1 Top Builder ({selectedMonth})
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {topBuilder.name} (@{topBuilder.username})
                </div>
                <div className="text-[11px] font-mono text-amber-900 font-semibold">
                  {topBuilder.monthlyXP} XP
                </div>
              </div>
            </div>
          )}

          {longestStreak && (
            <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-orange-600 fill-orange-600" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-orange-800">
                  Longest Streak
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {longestStreak.name} (@{longestStreak.username})
                </div>
                <div className="text-[11px] font-mono text-orange-700 font-semibold">
                  {longestStreak.streakDays} Consecutive Days
                </div>
              </div>
            </div>
          )}

          {mostShipped && (
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Rocket className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-800">
                  Most Shipped Projects
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {mostShipped.name} (@{mostShipped.username})
                </div>
                <div className="text-[11px] font-mono text-emerald-700 font-semibold">
                  {mostShipped.projectsShipped} Verified Releases
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Builder</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4 text-center">Active Streak</th>
                <th className="py-3 px-4 text-center">Shipped</th>
                <th className="py-3 px-4 text-center">Upvotes</th>
                <th className="py-3 px-4 text-right">Monthly XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ranks.map((row) => {
                const isTop3 = row.rank <= 3;
                return (
                  <tr
                    key={row.username}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-bold ${
                          row.rank === 1
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : row.rank === 2
                            ? "bg-slate-200 text-slate-800 border border-slate-300"
                            : row.rank === 3
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : "text-slate-500 font-mono"
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>

                    {/* Builder Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.avatar}
                          alt={row.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {row.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            @{row.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Focus Domain */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {row.focusDomain}
                      </span>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                        <Flame className="w-3.5 h-3.5 fill-orange-600" />
                        {row.streakDays}d
                      </span>
                    </td>

                    {/* Shipped */}
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Rocket className="w-3 h-3 text-slate-400" />
                        {row.projectsShipped}
                      </span>
                    </td>

                    {/* Upvotes */}
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-slate-400" />
                        {row.upvotesReceived}
                      </span>
                    </td>

                    {/* Monthly XP */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {row.monthlyXP.toLocaleString()} XP
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
