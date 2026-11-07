"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Zap,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  GitCommit,
  ExternalLink,
  Clock,
  Code2,
} from "lucide-react";
import { GithubIcon, DiscordIcon } from "@/components/ui/Icons";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { Challenge } from "@/lib/supabase/types";
import { SEED_CHALLENGES } from "@/lib/data/initialData";
import { createClient } from "@/lib/supabase/client";
import { formatCountdown } from "@/lib/utils";

export default function LandingPage() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"hardware" | "software" | "cad">("hardware");
  const [challenges, setChallenges] = useState<Challenge[]>(SEED_CHALLENGES);
  const [countdownText, setCountdownText] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function fetchChallenges() {
      try {
        const { data } = await supabase
          .from("challenges")
          .select("*")
          .eq("status", "active")
          .order("ends_at", { ascending: true });

        if (data && data.length > 0) {
          setChallenges(data as any);
        }
      } catch (err) {
        console.warn("Using template challenges:", err);
      }
    }
    fetchChallenges();
  }, []);

  const activeSprint = challenges.find((c) => c.status === "active") || challenges[0];

  useEffect(() => {
    if (activeSprint) {
      setCountdownText(formatCountdown(activeSprint.ends_at));
      const interval = setInterval(() => {
        setCountdownText(formatCountdown(activeSprint.ends_at));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [activeSprint]);

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 max-w-6xl mx-auto text-center">
        {/* Top Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PROOF-OF-WORK PLATFORM FOR BUILDERS</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]"
        >
          Stop losing your builds in{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Discord chat scrollback
          </span>
          .
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Product Hunt meets GitHub activity feed. A permanent, verifiable proof-of-work stream, shipping streak engine, and community engineering sprints for hardware hackers and software engineers.
        </motion.p>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          {user ? (
            <Link
              href="/feed"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm font-mono uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Enter Live Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm font-mono uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Join the Forge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <Link
            href="/feed"
            className="px-6 py-3.5 rounded-xl glass-pill hover:bg-white/[0.08] text-white font-medium text-sm font-mono uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-white/[0.12]"
          >
            <span>Browse Public Feed</span>
          </Link>

          <Link
            href="/challenges"
            className="px-5 py-3.5 rounded-xl glass-pill hover:bg-white/[0.08] text-amber-300 font-medium text-sm font-mono transition-all flex items-center gap-2 border border-amber-500/20"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Active Sprints</span>
          </Link>
        </motion.div>

        {/* Technical telemetry ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-zinc-500"
        >
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Zero Marketing Fluff</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>500-Char Punchy Updates</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Verifiable CAD & Code Diff</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Postgres & Supabase Auth</span>
          </div>
        </motion.div>
      </section>

      {/* Interactive Proof-of-Work Showcase */}
      <section className="px-4 max-w-4xl mx-auto mb-28">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Proof of Work Specification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Builders Document Real Engineering
          </h2>
        </div>

        {/* Showcase Switcher */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl relative overflow-hidden">
          {/* Subtle glow orb inside card */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Tab Selector */}
          <div className="flex items-center gap-2 p-1 rounded-xl glass-panel-subtle mb-6 text-xs font-mono max-w-md">
            <button
              onClick={() => setActiveTab("hardware")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                activeTab === "hardware"
                  ? "bg-white/[0.1] text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Hardware / IoT
            </button>
            <button
              onClick={() => setActiveTab("software")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                activeTab === "software"
                  ? "bg-white/[0.1] text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Systems Software
            </button>
            <button
              onClick={() => setActiveTab("cad")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                activeTab === "cad"
                  ? "bg-white/[0.1] text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              CAD & Enclosures
            </button>
          </div>

          {/* Interactive Simulated Proof-of-Work Card */}
          <AnimatePresence mode="wait">
            {activeTab === "hardware" && (
              <motion.div
                key="hardware"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                      HW
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Solar LoRa Telemetry Node v2</p>
                      <p className="text-xs text-zinc-400 font-mono">ESP32-S3 • 14.8µA Sleep Current • KiCad v8</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                    <span>54 Ships</span>
                  </span>
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed font-normal">
                  Field bench test verified: Replaced the standard LDO with a low quiescent TPS7A02 regulator. Deep sleep standby current dropped from 82µA to 14.8µA on the 3.3V power bus. 12km LoRa transmission packet delivered with zero frame drops.
                </p>

                <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <span>commit 7f3a9e: Update PCB BOM & power rail routing</span>
                  <span className="text-zinc-500 text-[11px]">2h ago</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">#esp32</span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">#lorawan</span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">#lowpower</span>
                </div>
              </motion.div>
            )}

            {activeTab === "software" && (
              <motion.div
                key="software"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs text-cyan-400">
                      SW
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Local Agentic CLI Kernel</p>
                      <p className="text-xs text-zinc-400 font-mono">Rust • Zero Dependency • 8.2MB Binary</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                    <span>81 Ships</span>
                  </span>
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed font-normal">
                  Cut memory footprint by 70% by eliminating Python runtimes in favor of a statically linked Rust binary. Microsecond AST parser runs multi-file diff validations in &lt;110ms with zero telemetry overhead.
                </p>

                <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-xs text-cyan-400 flex items-center justify-between">
                  <span>bench: AST parse throughput 480k lines/sec</span>
                  <span className="text-zinc-500 text-[11px]">4h ago</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">#rust</span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">#systems</span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">#cli</span>
                </div>
              </motion.div>
            )}

            {activeTab === "cad" && (
              <motion.div
                key="cad"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
                      CAD
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Machined Cyberdeck Enclosure v3</p>
                      <p className="text-xs text-zinc-400 font-mono">6061 Aluminum • CNC Toolpaths • FreeCAD</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                    <span>39 Ships</span>
                  </span>
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed font-normal">
                  Chassis rev 3 finished milling. Integrated internal heat-pipe recess directly into the bottom plate to passive-cool the Raspberry Pi Compute Module 4. Ribbon cable pass-through for the 7.9-inch bar display tested with zero stress.
                </p>

                <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-xs text-amber-400 flex items-center justify-between">
                  <span>STEP export v3.2 & toolpath G-code released</span>
                  <span className="text-zinc-500 text-[11px]">Yesterday</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">#cyberdeck</span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">#machining</span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">#cad</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* The Discord Problem vs Remorph Solution */}
      <section className="px-4 max-w-5xl mx-auto mb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* The Discord Problem */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-red-500/20 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-widest">
              <span>✕ The Discord Problem</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Where Engineering Progress Goes to Die
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-mono mt-0.5">•</span>
                <span>Breadboard snapshots and firmware benchmarks drown under general chat noise within 10 minutes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-mono mt-0.5">•</span>
                <span>Zero persistence or discoverability—nobody can find the revision you shipped last Tuesday.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-mono mt-0.5">•</span>
                <span>No verifiable shipping streak or permanent engineering portfolio attached to your handle.</span>
              </li>
            </ul>
          </div>

          {/* The Remorph Standard */}
          <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 border border-emerald-500/30 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <span>✓ The Remorph Standard</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Public, Persistent Proof-of-Work
            </h3>
            <ul className="space-y-3 text-sm text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono mt-0.5">•</span>
                <span>A permanent public feed where hardware and software prototypes are indexed and searchable.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono mt-0.5">•</span>
                <span>Shipping streaks that measure raw builder consistency rather than follower counts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono mt-0.5">•</span>
                <span>Structured community challenges (7-Day Cyberdeck, Local AI Sprint) with live countdowns.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="px-4 max-w-6xl mx-auto mb-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Engineered for Builders, Not Marketers
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl mx-auto">
            Everything you need to prove your engineering velocity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Quick-Ship Composer</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Post high-density build updates in seconds. Max 500 characters, Markdown formatting, image/CAD attachments, and repository links.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Shipping Streaks</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Track consecutive daily ships. Build momentum, showcase consistency, and let your cumulative output speak for itself.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Timed Sprints & Bounties</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Participate in 7-day hardware and local AI challenges. Submit progressive ship logs and get recognized by fellow builders.
            </p>
          </div>
        </div>
      </section>

      {/* Live Challenge Banner Teaser */}
      {activeSprint && (
        <section className="px-4 max-w-4xl mx-auto mb-28">
          <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CURRENT COMMUNITY SPRINT
                </span>
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{countdownText || "Active sprint"}</span>
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{activeSprint.title}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                {activeSprint.description}
              </p>
            </div>

            <Link
              href={`/challenges/${activeSprint.slug}`}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0"
            >
              Enter Sprint
            </Link>
          </div>
        </section>
      )}

      {/* Final Call to Action */}
      <section className="px-4 max-w-3xl mx-auto pb-24 text-center">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/[0.1] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 relative z-10">
            Start Shipping Proof-of-Work
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8 relative z-10 leading-relaxed">
            Join hardware hackers and software crafters building real prototypes in the open.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            {user ? (
              <Link
                href="/feed"
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2"
              >
                <span>Go to Live Feed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2"
              >
                <span>Create Builder Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <Link
              href="/feed"
              className="px-6 py-3.5 rounded-xl glass-pill text-white font-medium text-sm font-mono uppercase tracking-wider border border-white/[0.12] hover:bg-white/[0.08]"
            >
              Explore Feed
            </Link>
          </div>
        </div>
      </section>

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
