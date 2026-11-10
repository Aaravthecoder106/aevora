"use client";

import { useState } from "react";
import { ChallengeItem, ShipPost } from "@/lib/types/community";
import { X, Zap, Terminal, Check } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface SubmitBuildModalProps {
  isOpen: boolean;
  challenges: ChallengeItem[];
  preselectedChallengeId?: string;
  onClose: () => void;
  onSubmitBuild: (post: ShipPost, challengeId: string) => void;
}

export function SubmitBuildModal({
  isOpen,
  challenges,
  preselectedChallengeId,
  onClose,
  onSubmitBuild,
}: SubmitBuildModalProps) {
  const { user, profile } = useAuth();
  const activeChallenges = challenges.filter((c) => c.status === "active");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    preselectedChallengeId || activeChallenges[0]?.id || ""
  );
  const [content, setContent] = useState("");
  const [repoUrl, setRepoUrl] = useState(profile?.github_url || "");
  const [demoUrl, setDemoUrl] = useState("");
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetBody, setSnippetBody] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const matchedChallenge = challenges.find((c) => c.id === selectedChallengeId);
    const authorUsername = profile?.username || user?.email?.split("@")[0] || "builder";
    const authorName = profile?.full_name || authorUsername;

    const newPost: ShipPost = {
      id: `ship-${Date.now()}`,
      type: "ship",
      author: {
        name: authorName,
        username: authorUsername,
        avatar:
          profile?.avatar_url ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${authorUsername}`,
        streak: profile?.streak_count ?? 0,
        badge: "Sprint Contender",
      },
      content: content.trim(),
      timestamp: "Just now",
      tags: ["#sprint", "#hardware", matchedChallenge ? `#${matchedChallenge.slug}` : "#hack"],
      challengeTag: matchedChallenge ? matchedChallenge.title : "Community Sprint",
      githubUrl: repoUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      snippet: snippetBody.trim()
        ? {
            type: "terminal",
            title: snippetTitle.trim() || "serial.log",
            body: snippetBody.trim(),
          }
        : undefined,
      upvotes: 0,
      hasUpvoted: false,
      comments: [],
    };

    onSubmitBuild(newPost, selectedChallengeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e1f25] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                Submit Sprint Build Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono">
                Log verified progress &amp; claim milestone XP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs"
        >
          {/* Target Challenge */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
              Select Sprint / Challenge
            </label>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500 font-medium"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.prizePool}) - {c.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Build Log Content */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
              Ship Log &amp; Technical Progress
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              placeholder="What working milestone did you achieve today? Detail the circuit bringup, firmware patch, or bench test results..."
              required
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
                Repository / CAD Link
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500 text-[11px]"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
                Demo Link / Video (Optional)
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500 text-[11px]"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Terminal / Snippet proof */}
          <div className="p-3.5 bg-[#e8eef5]/60 dark:bg-[#1a1b21] border border-slate-300/60 dark:border-[#292a2f] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-[#c2c6d6] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
                <span>Proof of Work (Terminal / Telemetry Trace)</span>
              </label>
              <input
                type="text"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                placeholder="file or log name"
                className="text-[10px] px-2 py-0.5 bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#292a2f] rounded text-slate-600 dark:text-[#8c909f]"
              />
            </div>
            <textarea
              value={snippetBody}
              onChange={(e) => setSnippetBody(e.target.value)}
              rows={3}
              className="w-full p-2.5 text-[11px] bg-white dark:bg-[#0d0e13] text-blue-700 dark:text-[#adc6ff] rounded-md border border-slate-200 dark:border-[#292a2f] focus:outline-none focus:border-blue-500 leading-relaxed"
              placeholder="Paste terminal log, compiler output, or logic analyzer serial frame..."
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-[#1e1f25]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors shadow-xs font-sans"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Submit to Sprint</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
