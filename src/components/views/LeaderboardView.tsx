"use client";

import { useState } from "react";
import { LeaderboardRank } from "@/lib/types/community";
import {
  Trophy,
  Flame,
  Rocket,
  ThumbsUp,
  Calendar,
  Medal,
} from "lucide-react";

interface LeaderboardViewProps {
  monthlyData: Record<string, LeaderboardRank[]>;
}

export function LeaderboardView({ monthlyData }: LeaderboardViewProps) {
  const months =
    Object.keys(monthlyData).length > 0 ? Object.keys(monthlyData) : ["November 2026"];
  const [selectedMonth, setSelectedMonth] = useState<string>(months[0] || "November 2026");

  const ranks = monthlyData[selectedMonth] || [];

  const topBuilder = ranks[0];
  const mostShipped =
    ranks.length > 0
      ? [...ranks].sort((a, b) => b.projectsShipped - a.projectsShipped)[0]
      : null;
  const longestStreak =
    ranks.length > 0
      ? [...ranks].sort((a, b) => b.streakDays - a.streakDays)[0]
      : null;

  return (
    <div className="space-y-4">
      {/* Top Banner & Month Selector */}
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent">
                <Trophy className="w-3.5 h-3.5" />
                Proof-of-Work Ranking
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#e3e1e9] tracking-tight">
              Monthly Builder Leaderboard
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#8c909f] font-mono mt-1">
              Rankings computed dynamically from verified ship logs, hardware commits, and shipping streaks.
            </p>
          </div>

          {/* Month Selector Buttons */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f] shrink-0 self-start sm:self-auto">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                  selectedMonth === m
                    ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] shadow-xs font-semibold"
                    : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Calendar className="w-3 h-3" />
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Stats Row */}
        {ranks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-[#1e1f25]">
            {topBuilder && (
              <div className="p-3 bg-slate-50 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center shrink-0">
                  <Medal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
                    #1 Top Builder
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#e3e1e9] truncate">
                    {topBuilder.name} (@{topBuilder.username})
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-[#8c909f] tabular-nums">
                    {topBuilder.monthlyXP} XP
                  </div>
                </div>
              </div>
            )}

            {longestStreak && (
              <div className="p-3 bg-slate-50 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-[#292a2f] border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-blue-600 dark:text-[#adc6ff]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-[#adc6ff] font-semibold">
                    Active Flame Streak
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#e3e1e9] truncate">
                    {longestStreak.name} (@{longestStreak.username})
                  </div>
                  <div className="text-[11px] font-mono text-blue-600 dark:text-[#adc6ff] tabular-nums">
                    {longestStreak.streakDays}d Streak
                  </div>
                </div>
              </div>
            )}

            {mostShipped && (
              <div className="p-3 bg-slate-50 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                    Most Shipped Builds
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#e3e1e9] truncate">
                    {mostShipped.name} (@{mostShipped.username})
                  </div>
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {mostShipped.projectsShipped} Releases
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Table or Clean Empty State */}
      {ranks.length === 0 ? (
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6 text-blue-600 dark:text-[#adc6ff]" />
          </div>
          <h3 className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
            No ranked builders yet for {selectedMonth}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono max-w-md mx-auto leading-relaxed">
            The monthly leaderboard updates dynamically as builders ship verified logs. Start shipping to claim rank #1.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-[#1a1b21] text-slate-500 dark:text-[#8c909f] text-[11px] border-b border-slate-200 dark:border-[#292a2f]">
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
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e1f25]">
                {ranks.map((row) => (
                  <tr
                    key={row.username}
                    className="hover:bg-slate-50 dark:hover:bg-[#1a1b21]/50 transition-colors group"
                  >
                    <td className="py-3 px-4 text-center tabular-nums">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                          row.rank === 1
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40"
                            : row.rank === 2
                            ? "bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200 dark:border-transparent"
                            : row.rank === 3
                            ? "bg-slate-100 dark:bg-[#1e1f25] text-slate-700 dark:text-[#c2c6d6] border border-slate-200 dark:border-transparent"
                            : "text-slate-500 dark:text-[#8c909f]"
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.avatar}
                          alt={row.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-[#424754] bg-slate-100 dark:bg-[#1a1b21]"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-[#e3e1e9] group-hover:text-blue-600 dark:group-hover:text-[#adc6ff] transition-colors font-sans">
                            {row.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-[#8c909f]">
                            @{row.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border border-slate-200 dark:border-[#292a2f]">
                        {row.focusDomain}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center tabular-nums">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-[#adc6ff] bg-blue-50 dark:bg-[#292a2f] px-2 py-0.5 rounded border border-blue-200/70 dark:border-transparent">
                        <Flame className="w-3.5 h-3.5" />
                        {row.streakDays}d
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-[#c2c6d6] tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Rocket className="w-3 h-3 text-slate-400" />
                        {row.projectsShipped}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-[#c2c6d6] tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-slate-400" />
                        {row.upvotesReceived}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums">
                      <span className="text-xs font-bold text-blue-600 dark:text-[#adc6ff] bg-blue-50 dark:bg-[#292a2f] px-2.5 py-1 rounded border border-blue-200/70 dark:border-transparent">
                        {row.monthlyXP.toLocaleString()} XP
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
