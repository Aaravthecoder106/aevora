"use client";

import React, { useState, useEffect } from "react";
import { ActiveChallengeBanner } from "@/components/challenges/ActiveChallengeBanner";
import { ShipComposer } from "@/components/feed/ShipComposer";
import { ShipCard } from "@/components/feed/ShipCard";
import { FeedFilter, FilterMode } from "@/components/feed/FeedFilter";
import { Challenge, ShipLog } from "@/lib/supabase/types";
import { SEED_CHALLENGES, SEED_SHIP_LOGS } from "@/lib/data/initialData";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Sparkles, Terminal, Activity, Layers } from "lucide-react";

export default function HomePage() {
  const [challenges, setChallenges] = useState<Challenge[]>(SEED_CHALLENGES);
  const [logs, setLogs] = useState<ShipLog[]>(SEED_SHIP_LOGS);
  const [filter, setFilter] = useState<FilterMode>("latest");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch challenges
        const { data: dbChallenges } = await supabase
          .from("challenges")
          .select("*, winner:profiles(*)")
          .order("created_at", { ascending: false });

        if (dbChallenges && dbChallenges.length > 0) {
          setChallenges(dbChallenges as any);
        }

        // Fetch ship logs
        const { data: dbLogs } = await supabase
          .from("ship_logs")
          .select("*, author:profiles(*), challenge:challenges(*)")
          .order("created_at", { ascending: false });

        if (dbLogs && dbLogs.length > 0) {
          // Merge with initial rich seed logs so community always looks active
          const existingIds = new Set(dbLogs.map((l: any) => l.id));
          const merged = [
            ...dbLogs,
            ...SEED_SHIP_LOGS.filter((sl) => !existingIds.has(sl.id)),
          ];
          setLogs(merged as any);
        }
      } catch (err) {
        console.warn("Using local proof-of-work feed fallback:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleShipSuccess = (newLog: ShipLog) => {
    setLogs([newLog, ...logs]);
  };

  const handleUpvoteToggle = (logId: string, newUpvoted: boolean, newCount: number) => {
    setLogs(
      logs.map((l) =>
        l.id === logId
          ? { ...l, user_has_upvoted: newUpvoted, upvotes_count: newCount }
          : l
      )
    );
  };

  const handleQuickShipToChallenge = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const sortedLogs = [...logs].sort((a, b) => {
    if (filter === "top") {
      return (b.upvotes_count || 0) - (a.upvotes_count || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const activeChallenge = challenges.find((c) => c.status === "active") || challenges[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Banner: Active Challenge */}
      {activeChallenge && (
        <ActiveChallengeBanner
          challenge={activeChallenge}
          onQuickShipClick={handleQuickShipToChallenge}
        />
      )}

      {/* Quick-Ship Composer */}
      <ShipComposer
        challenges={challenges.filter((c) => c.status === "active")}
        onShipSuccess={handleShipSuccess}
        selectedChallengeId={selectedChallengeId}
        onClearChallenge={() => setSelectedChallengeId(null)}
      />

      {/* Feed Filter (Latest vs Top Shipped) */}
      <FeedFilter
        currentFilter={filter}
        onFilterChange={setFilter}
        count={sortedLogs.length}
      />

      {/* Live Activity Stream */}
      <div className="space-y-4">
        {sortedLogs.map((log) => (
          <ShipCard
            key={log.id}
            log={log}
            onUpvoteToggle={handleUpvoteToggle}
          />
        ))}
      </div>
    </div>
  );
}
