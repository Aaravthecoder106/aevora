"use client";

import React, { useState } from "react";
import { X, Trophy, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { ChallengeItem } from "@/lib/types/community";
import { useAuth } from "@/components/auth/AuthProvider";

interface ApplyContestModalProps {
  isOpen: boolean;
  contest: ChallengeItem | null;
  onClose: () => void;
  onApplied: () => Promise<void> | void;
}

export function ApplyContestModal({
  isOpen,
  contest,
  onClose,
  onApplied,
}: ApplyContestModalProps) {
  const { profile } = useAuth();
  const [projectTitle, setProjectTitle] = useState("");
  const [teamName, setTeamName] = useState("");
  const [track, setTrack] = useState("");
  const [pitch, setPitch] = useState("");
  const [repoUrl, setRepoUrl] = useState(profile?.github_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [acceptedRules, setAcceptedRules] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !contest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (projectTitle.trim().length < 3) {
      setErrorMsg("Project title must be at least 3 characters.");
      return;
    }
    if (pitch.trim().length < 15) {
      setErrorMsg("Technical proposal must be at least 15 characters.");
      return;
    }
    if (!acceptedRules) {
      setErrorMsg("Please confirm that you agree to the contest rules.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/contests/${contest.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle: projectTitle.trim(),
          teamName: teamName.trim() || undefined,
          track: track.trim() || undefined,
          pitch: pitch.trim(),
          repoUrl: repoUrl.trim() || undefined,
          portfolioUrl: portfolioUrl.trim() || undefined,
          acceptedRules,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Unable to submit contest application.");
        return;
      }

      setIsSuccess(true);
      await onApplied();
      setTimeout(() => {
        setIsSuccess(false);
        setProjectTitle("");
        setTeamName("");
        setTrack("");
        setPitch("");
        setPortfolioUrl("");
        setAcceptedRules(false);
        onClose();
      }, 900);
    } catch {
      setErrorMsg("Network error submitting contest application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e1f25] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                Apply to Contest
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono truncate max-w-[260px]">
                {contest.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-blue-600 dark:text-[#adc6ff] mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900 dark:text-[#e3e1e9]">
              Contest Application Submitted
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono">
              Your proposal is queued for Admin review. Track approval status in Contests or your Builder Dashboard.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs font-mono"
          >
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 flex items-start gap-2 text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
                Project / Entry Title *
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={140}
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Deterministic CAN-Bus Telemetry Node"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
                  Team Name (Leave blank if Solo)
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Solo Builder"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
                  Primary Hardware / Tech Stack
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  placeholder="e.g. RP2350, Rust, Next.js"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
                Technical Proposal &amp; Milestones *
              </label>
              <textarea
                rows={4}
                required
                minLength={15}
                maxLength={2000}
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Describe what you will engineer, hardware/AI components, and measurable proof-of-work deliverables..."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
                  GitHub / Repo URL (Optional)
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
                  Prior Build / Portfolio URL (Optional)
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] cursor-pointer text-slate-700 dark:text-[#c2c6d6]">
              <input
                type="checkbox"
                checked={acceptedRules}
                onChange={(e) => setAcceptedRules(e.target.checked)}
                className="accent-blue-600 mt-0.5"
                required
              />
              <span className="leading-relaxed">
                I agree to submit verifiable engineering proof-of-work and follow all rules listed for this contest.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#292a2f] text-slate-600 dark:text-[#c2c6d6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
