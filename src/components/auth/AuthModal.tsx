"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { GithubIcon, DiscordIcon } from "../ui/Icons";
import { useAuth } from "./AuthProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGithub, signInWithDiscord, signInWithOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await signInWithOtp(email.trim());
      if (error) {
        setErrorMessage(error.message || "Failed to send magic link. Try again.");
      } else {
        setEmailSent(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="relative w-full max-w-md overflow-hidden rounded-2xl glass-panel p-6 sm:p-7 shadow-2xl z-10 border border-white/[0.12]"
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
                <span>BUILDER REGISTRY</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Enter Remorph Forge
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Log your daily proofs-of-work, track shipping streaks, and enter engineering sprints.
              </p>
            </div>

            {emailSent ? (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-base">Check your inbox</h3>
                <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                  We sent a secure magic sign-in link to <span className="text-emerald-400">{email}</span>. Click the link to authenticate.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="text-xs font-mono text-zinc-400 hover:text-white underline pt-2 block mx-auto"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
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

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-white/[0.08]" />
                  <span className="text-[11px] font-mono text-zinc-500 uppercase">
                    Or passwordless email
                  </span>
                  <div className="flex-1 h-[1px] bg-white/[0.08]" />
                </div>

                {/* Email Magic Link Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  {errorMessage && (
                    <p className="text-xs text-red-400 font-mono bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                      {errorMessage}
                    </p>
                  )}

                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl glass-input text-xs font-mono">
                    <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@domain.com"
                      required
                      className="bg-transparent text-white placeholder-zinc-500 w-full focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>Send Magic Link</span>
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
