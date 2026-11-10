"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, AlertCircle, Cpu } from "lucide-react";
import { GithubIcon } from "../ui/Icons";
import { useAuth } from "./AuthProvider";
import { GithubSetupModal } from "./GithubSetupModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGithub, signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Hardware Hacker");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isGithubSetupOpen, setIsGithubSetupOpen] = useState(false);
  const [githubConfig, setGithubConfig] = useState<any>(null);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const handleGithubClick = async () => {
    setErrorMessage("");
    setIsGithubLoading(true);
    try {
      const res = await signInWithGithub();
      if (res?.setupRequired) {
        setGithubConfig(res.config);
        setIsGithubSetupOpen(true);
      } else if (res?.error) {
        setErrorMessage(res.error.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate GitHub authentication.");
    } finally {
      setIsGithubLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (mode === "signup") {
        if (!username.trim()) {
          setErrorMessage("Please choose an @handle username.");
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUpWithPassword(email, password, {
          username: username.replace("@", ""),
          fullName: fullName || username,
          role,
        });

        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage("Account created successfully!");
          setTimeout(() => onClose(), 800);
        }
      } else {
        const { error } = await signInWithPassword(email, password);
        if (error) {
          setErrorMessage(error.message);
        } else {
          onClose();
        }
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
            className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#102034] border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl z-10 overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">AEVORA // FORGE</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Proof-of-Work Authentication
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-[#000f21] rounded-lg border border-slate-200 dark:border-slate-800 my-4">
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage("");
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === "signup"
                    ? "bg-white dark:bg-[#1b2b3f] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage("");
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === "signin"
                    ? "bg-white dark:bg-[#1b2b3f] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Feedback */}
            {errorMessage && (
              <div className="mb-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ada Lovelace"
                      className="w-full px-3 py-2 bg-white dark:bg-[#000f21] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Username (@handle)
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="lovelace"
                      className="w-full px-3 py-2 bg-white dark:bg-[#000f21] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Primary Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#000f21] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-hidden focus:border-blue-600"
                    >
                      <option value="Hardware Hacker">Hardware Hacker</option>
                      <option value="AI Engineer">AI Engineer</option>
                      <option value="Full-Stack Dev">Full-Stack Dev</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="builder@aevora.dev"
                  className="w-full px-3 py-2 bg-white dark:bg-[#000f21] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  minLength={6}
                  className="w-full px-3 py-2 bg-white dark:bg-[#000f21] border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm shadow-blue-600/25 font-sans"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{mode === "signup" ? "Join Aevora Forge" : "Sign In to Workspace"}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700/80" />
              </div>
              <div className="relative flex justify-center text-[10px] font-mono uppercase">
                <span className="bg-white dark:bg-[#102034] px-2 text-slate-400 dark:text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* GitHub OAuth */}
            <button
              type="button"
              disabled={isGithubLoading}
              onClick={handleGithubClick}
              className="w-full py-2.5 px-4 bg-slate-50 dark:bg-[#000f21] hover:bg-slate-100 dark:hover:bg-slate-800/80 disabled:opacity-50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <GithubIcon className="w-4 h-4" />
              <span>{isGithubLoading ? "Checking GitHub Provider..." : "Continue with GitHub"}</span>
            </button>
          </motion.div>

          {/* GitHub OAuth Setup Instructions Modal */}
          <GithubSetupModal
            isOpen={isGithubSetupOpen}
            onClose={() => setIsGithubSetupOpen(false)}
            config={githubConfig}
            onSwitchToPassword={() => {
              setMode("signin");
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
