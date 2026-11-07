"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ship, Flame, Calendar, Tag } from "lucide-react";
import { Profile, ShipLog } from "@/lib/supabase/types";
import { SEED_PROFILES, SEED_SHIP_LOGS } from "@/lib/data/initialData";
import { BuilderStats } from "@/components/profile/BuilderStats";
import { ShipCard } from "@/components/feed/ShipCard";
import { createClient } from "@/lib/supabase/client";

function BuilderProfileContent() {
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<ShipLog[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "media">("all");
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadBuilder() {
      try {
        // Try fetching profile from Supabase
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        let currentProfile: Profile | null = (dbProfile as any) || null;

        if (!currentProfile) {
          // Check seed profiles
          const found = Object.values(SEED_PROFILES).find(
            (p) => p.username.toLowerCase() === username.toLowerCase()
          );
          currentProfile = found || SEED_PROFILES.alex_volt;
        }

        setProfile(currentProfile);

        // Fetch logs by author
        const { data: dbLogs } = await supabase
          .from("ship_logs")
          .select("*, author:profiles(*), challenge:challenges(*)")
          .eq("author_id", currentProfile.id)
          .order("created_at", { ascending: false });

        if (dbLogs && dbLogs.length > 0) {
          setLogs(dbLogs as any);
        } else {
          // Fallback to seed logs for this author
          const seedAuthorLogs = SEED_SHIP_LOGS.filter(
            (l) => l.author?.username.toLowerCase() === username.toLowerCase()
          );
          setLogs(seedAuthorLogs.length > 0 ? seedAuthorLogs : SEED_SHIP_LOGS.slice(0, 1));
        }
      } catch (err) {
        console.warn("Using fallback builder profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (username) {
      loadBuilder();
    }
  }, [username]);

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-zinc-500 font-mono text-sm">Locating builder in registry...</p>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    if (activeTab === "media") {
      return log.media_urls && log.media_urls.length > 0;
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Live Feed</span>
      </Link>

      {/* Builder Proof-of-Work Header & Stats */}
      <BuilderStats profile={profile} />

      {/* Timeline Controls */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
              activeTab === "all"
                ? "bg-white/[0.1] text-white border border-white/[0.15]"
                : "glass-pill text-zinc-400 hover:text-white"
            }`}
          >
            All Ships ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
              activeTab === "media"
                ? "bg-white/[0.1] text-white border border-white/[0.15]"
                : "glass-pill text-zinc-400 hover:text-white"
            }`}
          >
            Media & CAD Proofs (
            {logs.filter((l) => l.media_urls && l.media_urls.length > 0).length})
          </button>
        </div>

        <span className="text-xs font-mono text-zinc-500">
          Builder PoW Timeline
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => <ShipCard key={log.id} log={log} />)
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center border border-dashed border-zinc-800">
            <Ship className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-400">
              No proofs-of-work in this view yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuilderProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-zinc-500 font-mono text-sm">
          Loading builder profile...
        </div>
      }
    >
      <BuilderProfileContent />
    </Suspense>
  );
}
