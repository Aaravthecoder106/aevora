"use client";

import React, { useState, useEffect } from "react";
import { ActiveChallengeBanner } from "@/components/challenges/ActiveChallengeBanner";
import { ShipComposer } from "@/components/feed/ShipComposer";
import { ShipCard } from "@/components/feed/ShipCard";
import { FeedFilter, FilterMode } from "@/components/feed/FeedFilter";
import { Challenge, ShipLog } from "@/lib/supabase/types";
import { SEED_CHALLENGES } from "@/lib/data/initialData";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Terminal, Flame, Zap } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

export default function FeedPage() {
  const [challenges, setChallenges] = useState<Challenge[]>(SEED_CHALLENGES);
  const [logs, setLogs] = useState<ShipLog[]>([]);
  const [filter, setFilter] = useState<FilterMode>("latest");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useAuth();

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

        // Fetch real ship logs
        const { data: dbLogs } = await supabase
          .from("ship_logs")
          .select("*, author:profiles(*), challenge:challenges(*)")
          .order("created_at", { ascending: false });

        if (dbLogs) {
          setLogs(dbLogs as any);
        }
      } catch (err) {
        console.warn("Error loading feed logs:", err);
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
    <>
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
        {isLoading ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-white/[0.08]">
            <p className="text-sm font-mono text-zinc-500 animate-pulse">
              Syncing live proof-of-work feed...
            </p>
          </div>
        ) : sortedLogs.length > 0 ? (
          <div className="space-y-4">
            {sortedLogs.map((log) => (
              <ShipCard
                key={log.id}
                log={log}
                onUpvoteToggle={handleUpvoteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center border border-dashed border-zinc-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                The Forge is Live — Ready for Proof #1
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                No logs have been shipped yet. Be the founding builder on the feed by submitting your prototype, firmware build, or code commit above.
              </p>
            </div>
            {!user && (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
              >
                <span>Authenticate to Ship</span>
              </button>
            )}
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
