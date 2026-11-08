"use client";

import { useState } from "react";
import { ChallengeItem, ShipPost } from "@/lib/types/community";
import { X, Zap, Terminal, Send, Check } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";

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
  const activeChallenges = challenges.filter((c) => c.status === "active");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    preselectedChallengeId || activeChallenges[0]?.id || ""
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [repoUrl, setRepoUrl] = useState("https://github.com/ay473671/remorph-sprint-build");
  const [demoUrl, setDemoUrl] = useState("");
  const [snippetTitle, setSnippetTitle] = useState("bench_telemetry.log");
  const [snippetBody, setSnippetBody] = useState(
    "[  +0.012] bootloader: validated CRC32 on image\n[  +0.045] sensors: I2C bus initialized at 400kHz\n[  +0.120] payload: telemetry frame dispatched (28 bytes)"
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const matchedChallenge = challenges.find((c) => c.id === selectedChallengeId);

    const newPost: ShipPost = {
      id: `ship-${Date.now()}`,
      type: "ship",
      author: {
        name: "Aarav Kumar",
        username: "ay473671",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ay473671",
        streak: 7,
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
      upvotes: 1,
      hasUpvoted: true,
      comments: [],
    };

    onSubmitBuild(newPost, selectedChallengeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Submit Sprint Build Log</h3>
              <p className="text-xs text-slate-500 font-mono">Log verified progress & claim milestone XP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Challenge */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Select Sprint / Challenge
            </label>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
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
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Ship Log & Technical Progress
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
              placeholder="What working milestone did you achieve today? Detail the circuit bringup, firmware patch, or bench test results..."
              required
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Repository / CAD Link
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono text-[11px]"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Demo Link / Video (Optional)
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono text-[11px]"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Terminal / Snippet proof */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-600" />
                <span>Proof of Work (Terminal / Telemetry Trace)</span>
              </label>
              <input
                type="text"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                placeholder="file or log name"
                className="text-[10px] font-mono px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600"
              />
            </div>
            <textarea
              value={snippetBody}
              onChange={(e) => setSnippetBody(e.target.value)}
              rows={3}
              className="w-full p-2.5 text-[11px] font-mono bg-slate-900 text-emerald-400 rounded-lg border border-slate-800 focus:outline-hidden"
              placeholder="Paste terminal log, compiler output, or logic analyzer serial frame..."
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
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
