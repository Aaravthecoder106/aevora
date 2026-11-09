"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";

interface GithubSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    callbackUrl?: string;
    dashboardUrl?: string;
    projectRef?: string;
  } | null;
  onSwitchToPassword?: () => void;
}

export function GithubSetupModal({
  isOpen,
  onClose,
  config,
  onSwitchToPassword,
}: GithubSetupModalProps) {
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [copiedHomepage, setCopiedHomepage] = useState(false);

  const callbackUrl =
    config?.callbackUrl ||
    "https://huvnuudknqbyjblksqwu.supabase.co/auth/v1/callback";
  const homepageUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const dashboardUrl =
    config?.dashboardUrl ||
    "https://supabase.com/dashboard/project/huvnuudknqbyjblksqwu/auth/providers";

  const copyToClipboard = (text: string, type: "callback" | "homepage") => {
    navigator.clipboard.writeText(text);
    if (type === "callback") {
      setCopiedCallback(true);
      setTimeout(() => setCopiedCallback(false), 2000);
    } else {
      setCopiedHomepage(true);
      setTimeout(() => setCopiedHomepage(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-7 shadow-2xl z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <GithubIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <span>GitHub OAuth Setup Required</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/40">
                    PROVIDER_DISABLED
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Supabase Project: {config?.projectRef || "huvnuudknqbyjblksqwu"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Explanation */}
          <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 font-mono flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              GitHub OAuth is not yet enabled in your Supabase project dashboard. Supabase requires your GitHub OAuth Client ID & Secret to redirect authentications.
            </div>
          </div>

          {/* 3 Step Setup Guide */}
          <div className="mt-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
              Complete Setup in 2 Minutes:
            </h4>

            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-200">
                <span className="font-semibold text-emerald-400">1. Register GitHub OAuth App</span>
                <a
                  href="https://github.com/settings/applications/new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  <span>Open GitHub Dev Settings</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">
                Set Application name to <span className="text-zinc-300">Aevora Forge</span>.
              </p>

              {/* Homepage URL */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
                <div className="truncate text-zinc-400">
                  <span className="text-zinc-600 mr-2">Homepage:</span>
                  <span className="text-zinc-200">{homepageUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(homepageUrl, "homepage")}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 shrink-0 text-[10px]"
                >
                  {copiedHomepage ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Callback URL */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
                <div className="truncate text-zinc-400">
                  <span className="text-zinc-600 mr-2">Callback URL:</span>
                  <span className="text-zinc-200">{callbackUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(callbackUrl, "callback")}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 shrink-0 text-[10px]"
                >
                  {copiedCallback ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-200">
                <span className="font-semibold text-emerald-400">2. Enable in Supabase Dashboard</span>
                <a
                  href={dashboardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  <span>Open Supabase Auth Providers</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                Toggle <span className="text-zinc-200 font-bold">GitHub</span> ON, paste your generated <span className="text-zinc-200">Client ID</span> & <span className="text-zinc-200">Client Secret</span>, and click Save.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-zinc-500 font-mono">
              Or sign in immediately without GitHub:
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSwitchToPassword) onSwitchToPassword();
              }}
              className="w-full sm:w-auto py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <span>Use Email & Password Sign-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
