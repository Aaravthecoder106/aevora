"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  Globe,
  Trophy,
  ExternalLink,
  MessageSquare,
  Share2,
  Sparkles,
} from "lucide-react";
import { GithubIcon } from "../ui/Icons";
import { ShipLog } from "@/lib/supabase/types";
import { formatTimeAgo } from "@/lib/utils";
import { useAuth } from "../auth/AuthProvider";
import { AuthModal } from "../auth/AuthModal";
import { createClient } from "@/lib/supabase/client";

interface ShipCardProps {
  log: ShipLog;
  onUpvoteToggle?: (logId: string, newUpvoted: boolean, newCount: number) => void;
}

export function ShipCard({ log, onUpvoteToggle }: ShipCardProps) {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(log.user_has_upvoted || false);
  const [upvotesCount, setUpvotesCount] = useState(log.upvotes_count || 0);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    setTimeAgo(formatTimeAgo(log.created_at));
  }, [log.created_at]);

  const supabase = createClient();
  const author = log.author;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (isUpvoting) return;
    setIsUpvoting(true);

    const nextUpvoted = !hasUpvoted;
    const nextCount = nextUpvoted ? upvotesCount + 1 : Math.max(0, upvotesCount - 1);

    // Optimistic UI update
    setHasUpvoted(nextUpvoted);
    setUpvotesCount(nextCount);
    if (onUpvoteToggle) {
      onUpvoteToggle(log.id, nextUpvoted, nextCount);
    }

    try {
      if (nextUpvoted) {
        await (supabase.from("ship_upvotes") as any).insert({
          ship_log_id: log.id,
          user_id: user.id,
        });
      } else {
        await (supabase.from("ship_upvotes") as any)
          .delete()
          .match({ ship_log_id: log.id, user_id: user.id });
      }
    } catch (err) {
      console.error("Upvote toggle failed:", err);
      // Revert if request failed
      setHasUpvoted(!nextUpvoted);
      setUpvotesCount(upvotesCount);
    } finally {
      setIsUpvoting(false);
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel rounded-2xl p-5 border border-white/[0.08] hover:border-white/[0.14] transition-all duration-300 shadow-xl group relative overflow-hidden"
      >
        {/* Subtle accent hover reflection */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Card Header: Author & Metadata */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/u/${author?.username || "builder"}`}
              className="shrink-0 relative group/avatar"
            >
              <img
                src={
                  author?.avatar_url ||
                  "https://api.dicebear.com/7.x/bottts/svg?seed=builder"
                }
                alt={author?.username || "builder"}
                className="w-10 h-10 rounded-full object-cover border border-zinc-700/80 group-hover/avatar:border-emerald-500/60 transition-colors"
              />
              {author?.streak_count && author.streak_count > 0 ? (
                <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-orange-500 text-[9px] font-mono font-bold text-black border border-black flex items-center justify-center">
                  🔥{author.streak_count}
                </span>
              ) : null}
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/u/${author?.username || "builder"}`}
                  className="font-semibold text-sm text-white hover:text-emerald-400 transition-colors truncate"
                >
                  {author?.full_name || author?.username || "Anonymous Builder"}
                </Link>
                <span className="text-xs text-zinc-500 font-mono">
                  @{author?.username || "builder"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span>{timeAgo || "recent"}</span>

                {log.challenge && (
                  <>
                    <span>•</span>
                    <Link
                      href={`/challenges/${log.challenge.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 truncate"
                    >
                      <Trophy className="w-3 h-3 shrink-0" />
                      <span className="truncate">{log.challenge.title}</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Upvote Micro-interaction */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-medium border transition-all ${
              hasUpvoted
                ? "bg-orange-500/15 border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-orange-400 hover:border-orange-500/30 hover:bg-white/[0.06]"
            }`}
          >
            <motion.div
              animate={hasUpvoted ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Flame
                className={`w-4 h-4 ${
                  hasUpvoted ? "fill-orange-500 text-orange-500" : ""
                }`}
              />
            </motion.div>
            <span className="font-semibold">{upvotesCount}</span>
          </motion.button>
        </div>

        {/* Content Body */}
        <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line mb-3 font-normal">
          {log.content}
        </p>

        {/* Media Gallery */}
        {log.media_urls && log.media_urls.length > 0 && (
          <div
            className={`grid gap-2 mb-3.5 rounded-xl overflow-hidden ${
              log.media_urls.length === 1
                ? "grid-cols-1"
                : log.media_urls.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {log.media_urls.map((url, idx) => (
              <div
                key={idx}
                onClick={() => setActiveMediaIndex(idx)}
                className="relative cursor-pointer aspect-video bg-zinc-950/60 rounded-lg overflow-hidden border border-white/[0.08] group/img"
              >
                <img
                  src={url}
                  alt={`Proof artifact ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-2 py-1 rounded bg-black/70 text-[10px] font-mono text-zinc-300">
                    Click to inspect
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tags and Links Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            {log.tags &&
              log.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05]"
                >
                  {tag}
                </span>
              ))}
          </div>

          {/* External Links */}
          <div className="flex items-center gap-2">
            {log.github_url && (
              <a
                href={log.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>Repo</span>
                <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
              </a>
            )}

            {log.demo_url && (
              <a
                href={log.demo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Demo</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Media Lightbox */}
        {activeMediaIndex !== null && log.media_urls?.[activeMediaIndex] && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setActiveMediaIndex(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={log.media_urls[activeMediaIndex]}
                alt="Enlarged proof"
                className="max-w-full max-h-[85vh] object-contain rounded-xl border border-white/[0.1]"
              />
              <p className="text-center font-mono text-xs text-zinc-400 mt-2">
                Click anywhere to close
              </p>
            </div>
          </div>
        )}
      </motion.article>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
