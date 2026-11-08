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
  Users,
} from "lucide-react";

interface LeaderboardViewProps {
  monthlyData: Record<string, LeaderboardRank[]>;
}

export function LeaderboardView({ monthlyData }: LeaderboardViewProps) {
  const months = Object.keys(monthlyData).length > 0 ? Object.keys(monthlyData) : ["November 2026"];
  const [selectedMonth, setSelectedMonth] = useState<string>(months[0] || "November 2026");

  const ranks = monthlyData[selectedMonth] || [];

  const topBuilder = ranks[0];
  const mostShipped = ranks.length > 0
    ? [...ranks].sort((a, b) => b.projectsShipped - a.projectsShipped)[0]
    : null;
  const longestStreak = ranks.length > 0
    ? [...ranks].sort((a, b) => b.streakDays - a.streakDays)[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-950/40 text-amber-400 border border-amber-500/30">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Proof-of-Work Ranking
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
              Monthly Builder Leaderboard
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Rankings computed dynamically from verified ship logs, hardware commits, and shipping streaks.
            </p>
          </div>

          {/* Month Selector Buttons */}
          <div className="flex items-center p-1 bg-zinc-950 rounded-lg border border-zinc-800 shrink-0 self-start sm:self-auto">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  selectedMonth === m
                    ? "bg-zinc-800 text-zinc-100 shadow-xs font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Calendar className="w-3 h-3 text-zinc-500" />
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Stats Row (Only if builders exist) */}
        {ranks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-zinc-800">
            {topBuilder && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-950/40 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Medal className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                    #1 Top Builder
                  </div>
                  <div className="text-xs font-bold text-zinc-100 truncate">
                    {topBuilder.name} (@{topBuilder.username})
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    {topBuilder.monthlyXP} XP
                  </div>
                </div>
              </div>
            )}

            {longestStreak && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-950/40 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-orange-400">
                    Active Flame Streak
                  </div>
                  <div className="text-xs font-bold text-zinc-100 truncate">
                    {longestStreak.name} (@{longestStreak.username})
                  </div>
                  <div className="text-[11px] font-mono text-orange-400">
                    {longestStreak.streakDays}d Streak
                  </div>
                </div>
              </div>
            )}

            {mostShipped && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Rocket className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                    Most Shipped Builds
                  </div>
                  <div className="text-xs font-bold text-zinc-100 truncate">
                    {mostShipped.name} (@{mostShipped.username})
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400">
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Trophy className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-sm font-mono font-bold text-zinc-300">
            No ranked builders yet for {selectedMonth}
          </h3>
          <p className="text-xs text-zinc-500 font-mono max-w-md mx-auto leading-relaxed">
            The monthly leaderboard updates dynamically as builders ship verified logs. Start shipping to claim rank #1.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 text-zinc-400 text-[11px] border-b border-zinc-800">
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
              <tbody className="divide-y divide-zinc-800/80">
                {ranks.map((row) => (
                  <tr
                    key={row.username}
                    className="hover:bg-zinc-950/60 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          row.rank === 1
                            ? "bg-amber-950/40 text-amber-400 border border-amber-500/40"
                            : row.rank === 2
                            ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                            : row.rank === 3
                            ? "bg-amber-950/20 text-amber-300 border border-amber-500/20"
                            : "text-zinc-500"
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.avatar}
                          alt={row.name}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-800 bg-zinc-950"
                        />
                        <div>
                          <div className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                            {row.name}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            @{row.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                        {row.focusDomain}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 bg-orange-950/30 px-2 py-0.5 rounded border border-orange-500/30">
                        <Flame className="w-3.5 h-3.5 fill-orange-400" />
                        {row.streakDays}d
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-zinc-300">
                      <span className="inline-flex items-center gap-1">
                        <Rocket className="w-3 h-3 text-zinc-500" />
                        {row.projectsShipped}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-zinc-300">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-zinc-500" />
                        {row.upvotesReceived}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
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
