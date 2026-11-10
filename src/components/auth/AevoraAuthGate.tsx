"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import { DUMMY_SEED_CHALLENGE_IDS } from "@/lib/data/initialData";
import { GithubSetupModal } from "./GithubSetupModal";

export function AevoraAuthGate() {
  const { signInWithPassword, signUpWithPassword, signInWithGithub } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Hardware Hacker");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // GitHub OAuth setup modal state
  const [isGithubSetupOpen, setIsGithubSetupOpen] = useState(false);
  const [githubConfig, setGithubConfig] = useState<any>(null);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  // Live platform stats from Supabase
  const [stats, setStats] = useState({
    activeSprints: 0,
    totalShips: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [shipsRes, projectsRes, sprintsRes] = await Promise.all([
          supabase.from("ship_logs").select("id", { count: "exact", head: true }),
          supabase.from("projects").select("id", { count: "exact", head: true }),
          supabase
            .from("challenges")
            .select("id")
            .eq("status", "active"),
        ]);

        const realActiveSprints = (sprintsRes.data || []).filter(
          (c: { id: string }) => !DUMMY_SEED_CHALLENGE_IDS.includes(c.id)
        ).length;

        setStats({
          totalShips: shipsRes.count || 0,
          activeProjects: projectsRes.count || 0,
          activeSprints: realActiveSprints,
        });
      } catch {
        // Silent fallback
      }
    }
    fetchCounts();
  }, []);

  const roles = [
    { id: "Hardware Hacker", label: "Hardware Hacker", icon: Cpu },
    { id: "AI Engineer", label: "AI Systems", icon: Sparkles },
    { id: "Full-Stack Dev", label: "Full-Stack Dev", icon: Layers },
  ];

  const handleGeneratePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    const randomValues = new Uint32Array(16);
    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(randomValues);
    }
    let generated = "";
    for (let i = 0; i < 16; i++) {
      generated += chars.charAt(randomValues[i] % chars.length);
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (!username.trim()) {
          setErrorMessage("Please enter an @handle username.");
          setIsLoading(false);
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
          setSuccessMessage("Authenticated successfully! Connecting your workspace...");
        }
      } else {
        const { error } = await signInWithPassword(email, password);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage("Authenticated successfully! Connecting your workspace...");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubClick = async () => {
    setErrorMessage(null);
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

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8 px-6 sm:px-8 relative z-10">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Manifesto & Live Engineering Metrics */}
        <div className="lg:col-span-7 flex flex-col space-y-8 pt-2">
          {/* Node Status Badge */}
          <div className="flex items-center space-x-2.5 w-fit bg-white/80 dark:bg-[#0b1c30] border border-slate-200/80 dark:border-slate-800/80 px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-mono text-[11px] font-medium text-blue-600 dark:text-blue-400 tracking-wider uppercase">
              AEVORA // FORGE GATEWAY
            </span>
            <span className="text-slate-300 dark:text-slate-700 text-xs">/</span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              LIVE REGISTRY
            </span>
          </div>

          {/* Hero Headline */}
          <div className="flex flex-col space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              The Proof-of-Work Hub for{" "}
              <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                Hardware &amp; AI Builders
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed pt-1">
              Zero vaporware. Zero marketing slides. An uncompromised engineering workshop where builders log serial console outputs, logic analyzer traces, quantized on-device models, and collaborate on real silicon.
            </p>
          </div>

          {/* Live Proof Stats Container */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-slate-100/70 dark:bg-[#000f21]/80 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 rounded-xl backdrop-blur-xs">
            <div className="flex flex-col space-y-1">
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                ACTIVE SPRINTS
              </span>
              <div className="flex items-baseline space-x-1.5 tabular-nums">
                <span className="font-mono text-xl sm:text-2xl text-blue-600 dark:text-blue-400 font-semibold">
                  {stats.activeSprints}
                </span>
                <span className="text-[11px] font-mono uppercase font-semibold text-emerald-600 dark:text-emerald-400">
                  LIVE
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                Supabase Challenges
              </span>
            </div>

            <div className="flex flex-col space-y-1 border-l border-slate-200 dark:border-slate-800/80 pl-3 sm:pl-4">
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                LOGGED SHIPS
              </span>
              <div className="flex items-baseline space-x-1.5 tabular-nums">
                <span className="font-mono text-xl sm:text-2xl text-slate-900 dark:text-white font-semibold">
                  {stats.totalShips.toLocaleString()}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  PROOFS
                </span>
              </div>
              <span className="font-mono text-[11px] text-blue-600/80 dark:text-blue-400/80">
                Verified Ship Logs
              </span>
            </div>

            <div className="flex flex-col space-y-1 border-l border-slate-200 dark:border-slate-800/80 pl-3 sm:pl-4">
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                LISTED BUILDS
              </span>
              <div className="flex items-baseline space-x-1.5 tabular-nums">
                <span className="font-mono text-xl sm:text-2xl text-slate-900 dark:text-white font-semibold">
                  {stats.activeProjects.toLocaleString()}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  REPOS
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                Community Registry
              </span>
            </div>
          </div>

          {/* Engineering Principles 01 / 02 / 03 */}
          <div className="flex flex-col space-y-4 pt-1">
            <div className="flex items-start space-x-3.5 group">
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-2 py-0.5 rounded font-medium mt-0.5 shrink-0">
                01 /
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Post real commits, breadboards &amp; telemetry
                </span>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Validated logic analyzer captures, direct flashing scripts, and bare-metal benchmarks. No boilerplate landing pages.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 group">
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-2 py-0.5 rounded font-medium mt-0.5 shrink-0">
                02 /
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Peer review schematics &amp; firmware traces
                </span>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Collaborative pinout validation, signal integrity reviews, and runtime memory fault triage with seasoned architects.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 group">
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-2 py-0.5 rounded font-medium mt-0.5 shrink-0">
                03 /
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Recruit specialized collaborators via proof
                </span>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Assemble hardware teams based on verifiable commit history, edge tensor kernels, and board design portfolios.
                </span>
              </div>
            </div>
          </div>

          {/* Protocol Badges Footer */}
          <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Supabase Row-Level Security</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
              <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Live Postgres Telemetry</span>
            </div>
          </div>
        </div>

        {/* Right Column: Elevated Dual-Theme Auth Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white dark:bg-[#102034] p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200/90 dark:border-slate-800/90 relative overflow-hidden backdrop-blur-md">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            {/* Mode Segmented Toggle */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#000f21] rounded-lg mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-3 rounded-md text-center text-xs font-semibold transition-all duration-150 ${
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
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-3 rounded-md text-center text-xs font-semibold transition-all duration-150 ${
                  mode === "signin"
                    ? "bg-white dark:bg-[#1b2b3f] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              {mode === "signup" && (
                <>
                  {/* Full Name & Handle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                        FULL NAME
                      </label>
                      <div className="relative flex items-center">
                        <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ada Lovelace"
                          className="w-full bg-white dark:bg-[#000f21] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-sm pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <label className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                        HANDLE
                      </label>
                      <div className="relative flex items-center">
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none">
                          @
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="lovelace"
                          className="w-full bg-white dark:bg-[#000f21] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 font-mono text-xs pl-8 pr-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Primary Engineering Domain */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                      PRIMARY ENGINEERING DOMAIN
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((r) => {
                        const Icon = r.icon;
                        const isSelected = role === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all group ${
                              isSelected
                                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                                : "bg-slate-50 dark:bg-[#000f21] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 mb-1 ${
                                isSelected
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                              }`}
                            />
                            <span className="text-[11px] font-semibold leading-tight text-center">
                              {r.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="flex flex-col space-y-1.5">
                <label className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                  WORK EMAIL / PUBLIC KEY
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="builder@aevora.dev"
                    className="w-full bg-white dark:bg-[#000f21] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-sm pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                    SECRET PASSKEY
                  </label>
                  {mode === "signup" && (
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="font-mono text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Generate Strong
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    minLength={6}
                    className="w-full bg-white dark:bg-[#000f21] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 font-mono text-xs pl-9 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide passkey" : "Show passkey"}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-600/25 active:scale-[0.99]"
              >
                <span>
                  {isLoading
                    ? "Authenticating with Forge..."
                    : mode === "signup"
                    ? "Join Aevora Forge"
                    : "Sign In to Workspace"}
                </span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700/80" />
                </div>
                <span className="relative bg-white dark:bg-[#102034] px-3 font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* GitHub OAuth Button */}
              <button
                type="button"
                disabled={isGithubLoading}
                onClick={handleGithubClick}
                className="w-full py-2.5 px-4 bg-slate-50 dark:bg-[#000f21] hover:bg-slate-100 dark:hover:bg-slate-800/80 disabled:opacity-50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-xs"
              >
                <GithubIcon className="w-4 h-4" />
                <span>
                  {isGithubLoading
                    ? "Checking GitHub Provider..."
                    : "Continue with GitHub"}
                </span>
              </button>
            </form>

            {/* Card Footer Strip */}
            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 py-3 bg-slate-50/70 dark:bg-[#000f21]/60 flex items-center justify-between font-mono text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Supabase Auth Secured</span>
              </span>
              <span>AEVORA // FORGE</span>
            </div>
          </div>
        </div>
      </div>

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
  );
}
