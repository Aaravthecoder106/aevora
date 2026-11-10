"use client";

import React, { useState, useEffect } from "react";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { Challenge } from "@/lib/supabase/types";
import { DUMMY_SEED_CHALLENGE_IDS } from "@/lib/data/initialData";
import { createClient } from "@/lib/supabase/client";
import { Trophy } from "lucide-react";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const supabase = createClient();

  useEffect(() => {
    async function loadChallenges() {
      try {
        const { data } = await supabase
          .from("challenges")
          .select("*, winner:profiles(*)")
          .order("starts_at", { ascending: false });

        if (data && data.length > 0) {
          const realChallenges = (data as any[]).filter(
            (c) =>
              !DUMMY_SEED_CHALLENGE_IDS.includes(c.id) && c.is_published !== false
          );
          setChallenges(realChallenges);
        }
      } catch (err) {
        console.warn("Failed to load challenges:", err);
      }
    }
    loadChallenges();
  }, []);

  const filteredChallenges = challenges.filter((c) => {
    if (filter === "active") return c.status === "active";
    if (filter === "completed") return c.status === "completed";
    return true;
  });

  const activeCount = challenges.filter((c) => c.status === "active").length;
  const completedCount = challenges.filter((c) => c.status === "completed").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>COMMUNITY SPRINT BOARD</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Hardware & Software Challenges
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Prove your engineering grit. Build working hardware prototypes, embedded nodes, or lean software utilities before the countdown expires.
        </p>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
              filter === "all"
                ? "bg-white/[0.1] text-white border border-white/[0.15]"
                : "glass-pill text-zinc-400 hover:text-white"
            }`}
          >
            All Sprints ({challenges.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
              filter === "active"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "glass-pill text-zinc-400 hover:text-white"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
              filter === "completed"
                ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                : "glass-pill text-zinc-400 hover:text-white"
            }`}
          >
            Past Archive ({completedCount})
          </button>
        </div>
      </div>

      {/* Grid of Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}
