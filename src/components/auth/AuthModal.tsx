"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Terminal, Flame, ShieldCheck } from "lucide-react";
import { GithubIcon, DiscordIcon } from "../ui/Icons";
import { useAuth } from "./AuthProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGithub, signInWithDiscord, signInAsDemo } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl glass-panel p-6 shadow-2xl z-10 border border-white/[0.12]"
          >
            {/* Ambient accent inside modal */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>BUILDER VERIFICATION</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Enter the Forge
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Log your daily proofs-of-work, track shipping streaks, and enter engineering sprints.
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  signInWithGithub();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-white font-medium text-sm border border-zinc-700/60 transition-all hover:border-zinc-500 hover:shadow-lg active:scale-[0.98]"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Continue with GitHub</span>
              </button>

              <button
                onClick={() => {
                  signInWithDiscord();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#8ea1e1] hover:text-white font-medium text-sm border border-[#5865F2]/40 transition-all hover:shadow-lg active:scale-[0.98]"
              >
                <DiscordIcon className="w-4 h-4" />
                <span>Continue with Discord</span>
              </button>
            </div>

            {/* Instant Demo Sandbox */}
            <div className="mt-6 pt-5 border-t border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Instant Test Personas
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">1-CLICK LOGIN</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    signInAsDemo("alex_volt");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs font-mono text-emerald-400">
                    AV
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate group-hover:text-emerald-400">
                      Alex Vance
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono truncate">Hardware / CAD</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    signInAsDemo("elena_core");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-orange-500/40 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-xs font-mono text-orange-400">
                    ER
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate group-hover:text-orange-400">
                      Elena Rostova
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono truncate">Rust & Inference</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
