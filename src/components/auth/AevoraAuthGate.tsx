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
  Flame,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";

export function AevoraAuthGate() {
  const {
    signInWithPassword,
    signUpWithPassword,
    signInWithGithub,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Hardware Hacker");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live platform stats
  const [stats, setStats] = useState({
    activeSprints: 2,
    totalShips: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [shipsRes, projectsRes, sprintsRes] = await Promise.all([
          supabase.from("ship_logs").select("id", { count: "exact", head: true }),
          supabase.from("projects").select("id", { count: "exact", head: true }),
          supabase.from("challenges").select("id", { count: "exact", head: true }).eq("status", "active"),
        ]);

        setStats({
          totalShips: shipsRes.count || 0,
          activeProjects: projectsRes.count || 0,
          activeSprints: sprintsRes.count || 2,
        });
      } catch (e) {
        // Silent fallback
      }
    }
    fetchCounts();
  }, []);

  const roles = [
    { id: "Hardware Hacker", label: "Hardware Hacker", icon: Cpu },
    { id: "AI Engineer", label: "AI Engineer", icon: Sparkles },
    { id: "Full-Stack Dev", label: "Full-Stack Dev", icon: Layers },
  ];

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
          setSuccessMessage("Account created successfully! Connecting your workspace...");
        }
      } else {
        const { error } = await signInWithPassword(email, password);
        if (error) {
          setErrorMessage(error.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Manifesto & Proof Metrics */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AEVORA // FORGE GATEWAY</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100 leading-tight">
              The Proof-of-Work Hub for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                Hardware & AI Builders
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              Zero vaporware. Zero marketing slides. An uncompromising workshop where builders log serial console outputs, logic analyzer traces, quantized on-device models, and collaborate on real silicon.
            </p>
          </div>

          {/* Live Proof Stats */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Active Sprints
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {stats.activeSprints} Live
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Logged Ships
              </div>
              <div className="text-lg font-bold font-mono text-zinc-200 mt-0.5">
                {stats.totalShips} Proofs
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Listed Builds
              </div>
              <div className="text-lg font-bold font-mono text-zinc-200 mt-0.5">
                {stats.activeProjects} Repos
              </div>
            </div>
          </div>

          {/* Core Engineering Rules */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-start gap-2.5 text-zinc-300">
              <span className="text-emerald-400 font-bold shrink-0">01 /</span>
              <span>Post real commits, breadboards & telemetry. No vaporware SaaS brochures.</span>
            </div>
            <div className="flex items-start gap-2.5 text-zinc-300">
              <span className="text-emerald-400 font-bold shrink-0">02 /</span>
              <span>Peer review schematics & firmware. Help fellow engineers debug hard faults.</span>
            </div>
            <div className="flex items-start gap-2.5 text-zinc-300">
              <span className="text-emerald-400 font-bold shrink-0">03 /</span>
              <span>Recruit specialized collaborators by opening verified project roles.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Real Supabase Auth Form */}
        <div className="lg:col-span-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient edge glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Switcher Tabs */}
            <div className="flex items-center p-1 bg-zinc-950 rounded-xl border border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                  mode === "signup"
                    ? "bg-zinc-800 text-zinc-100 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
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
                className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                  mode === "signin"
                    ? "bg-zinc-800 text-zinc-100 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  {/* Full Name & Username */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ada Lovelace"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                        Username (@handle)
                      </label>
                      <div className="relative">
                        <span className="text-xs text-zinc-500 font-mono absolute left-3 top-2.5">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="lovelace"
                          className="w-full pl-7 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Primary Specialization */}
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                      Primary Engineering Domain
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
                            className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                              isSelected
                                ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-300"
                                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                            }`}
                          >
                            <Icon className="w-4 h-4 mb-1" />
                            <span className="text-[11px] font-mono leading-tight">{r.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="builder@aevora.dev"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span>Authenticating with Forge...</span>
                ) : (
                  <>
                    <span>{mode === "signup" ? "Join Aevora Forge" : "Sign In to Workspace"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] font-mono uppercase">
                <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
              </div>
            </div>

            {/* GitHub OAuth Button */}
            <button
              type="button"
              onClick={() => signInWithGithub()}
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-mono font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Continue with GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
