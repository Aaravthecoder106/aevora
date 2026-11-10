"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  ArrowLeft,
  Zap,
  CheckCircle2,
  Award,
  BookOpen,
  Filter,
} from "lucide-react";
import { Challenge, ShipLog } from "@/lib/supabase/types";
import { DUMMY_SEED_CHALLENGE_IDS } from "@/lib/data/initialData";
import { formatCountdown } from "@/lib/utils";
import { ShipCard } from "@/components/feed/ShipCard";
import { ShipComposer } from "@/components/feed/ShipComposer";
import { createClient } from "@/lib/supabase/client";

function ChallengeDetailContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<ShipLog[]>([]);
  const [filter, setFilter] = useState<"latest" | "top">("top");
  const [showComposer, setShowComposer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadChallengeData() {
      try {
        // Try to fetch challenge by slug
        const { data: dbChallenge } = await supabase
          .from("challenges")
          .select("*, winner:profiles(*)")
          .eq("slug", slug)
          .single();

        if (
          !dbChallenge ||
          DUMMY_SEED_CHALLENGE_IDS.includes((dbChallenge as any).id) ||
          (dbChallenge as any).is_published === false
        ) {
          setChallenge(null);
          setSubmissions([]);
          return;
        }

        const activeChallenge = dbChallenge as Challenge;
        setChallenge(activeChallenge);

        // Fetch submissions for this challenge
        const { data: dbLogs } = await supabase
          .from("ship_logs")
          .select("*, author:profiles(*), challenge:challenges(*)")
          .eq("challenge_id", activeChallenge.id);

        if (dbLogs && dbLogs.length > 0) {
          setSubmissions(dbLogs as any);
        } else {
          setSubmissions([]);
        }
      } catch (err) {
        console.warn("Failed to load challenge data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      loadChallengeData();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 dark:text-zinc-500 font-mono text-sm">Loading sprint brief...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <p className="text-slate-700 dark:text-zinc-300 font-mono text-sm font-semibold">
          Sprint not found
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Workspace</span>
        </Link>
      </div>
    );
  }

  const isActive = challenge.status === "active";
  const isCompleted = challenge.status === "completed";

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (filter === "top") {
      return (b.upvotes_count || 0) - (a.upvotes_count || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleShipSuccess = (newLog: ShipLog) => {
    setSubmissions([newLog, ...submissions]);
    setShowComposer(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/challenges"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Sprint Board</span>
      </Link>

      {/* Challenge Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-glow rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
              isActive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
            }`}
          >
            {isActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE SPRINT</span>
              </>
            ) : (
              <span>ARCHIVED SPRINT</span>
            )}
          </span>

          <span className="text-xs font-mono text-zinc-300 flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-lg border border-white/[0.06]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isActive
                ? formatCountdown(challenge.ends_at)
                : `Closed ${new Date(challenge.ends_at).toLocaleDateString()}`}
            </span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
          {challenge.title}
        </h1>

        <p className="text-base text-zinc-300 leading-relaxed mb-6">
          {challenge.description}
        </p>

        {/* Rules Box */}
        {challenge.rules && (
          <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08] mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
              <BookOpen className="w-4 h-4" />
              <span>SUBMISSION GUIDELINES</span>
            </div>
            <p className="text-xs text-zinc-300 font-mono whitespace-pre-line leading-relaxed">
              {challenge.rules}
            </p>
          </div>
        )}

        {/* Action Button */}
        {isActive && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComposer(!showComposer)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                {showComposer ? "Close Composer" : "Submit Ship-Log to Sprint"}
              </span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Embedded Composer if triggered */}
      {showComposer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-8"
        >
          <ShipComposer
            challenges={[challenge]}
            onShipSuccess={handleShipSuccess}
            selectedChallengeId={challenge.id}
          />
        </motion.div>
      )}

      {/* Submissions Section Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Sprint Submissions</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">
              {submissions.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl glass-panel-subtle text-xs font-mono">
          <button
            onClick={() => setFilter("top")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === "top" ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Most Upvoted
          </button>
          <button
            onClick={() => setFilter("latest")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === "latest" ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Newest
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {sortedSubmissions.length > 0 ? (
          sortedSubmissions.map((log) => <ShipCard key={log.id} log={log} />)
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center border border-dashed border-zinc-800">
            <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-400">
              No submissions logged for this sprint yet.
            </p>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              Be the first builder to claim proof-of-work in this sprint!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChallengeDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-zinc-500 font-mono text-sm">
          Loading sprint brief...
        </div>
      }
    >
      <ChallengeDetailContent />
    </Suspense>
  );
}
