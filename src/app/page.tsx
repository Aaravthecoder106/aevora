"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Zap,
  Trophy,
  Filter,
  Send,
  Globe,
  Tag,
  Clock,
  ExternalLink,
  Terminal,
  Code2,
  CheckCircle2,
  Radio,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Bookmark,
  Share2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { GithubIcon } from "@/components/ui/Icons";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { createClient } from "@/lib/supabase/client";

interface BuilderPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    streak: number;
  };
  content: string;
  timestamp: string;
  tags: string[];
  snippet?: {
    type: "terminal" | "code";
    title: string;
    body: string;
  };
  image?: string;
  githubUrl?: string;
  demoUrl?: string;
  challengeTag?: string;
  upvotes: number;
  hasUpvoted?: boolean;
}

const INITIAL_POSTS: BuilderPost[] = [
  {
    id: "post-1",
    author: {
      name: "Alex Vance",
      username: "alex_volt",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      streak: 14,
    },
    content: "Finished routing the MIPI DSI display ribbon around the battery compartment on the Cyberdeck prototype. Cold booted onto Debian 12 with Compute Module 4 + custom e-ink secondary display. Standby draw 180mA at 5V.",
    timestamp: "18m ago",
    tags: ["#hardware", "#pcb", "#cyberdeck"],
    challengeTag: "7-Day Hardware Sprint",
    githubUrl: "https://github.com/alexvolt/ortho-cyberdeck-v2",
    snippet: {
      type: "terminal",
      title: "serial_console.log",
      body: "[  +0.041] mipi_dsi 3f980000.dsi: panel attached: waveshare_7_9\n[  +0.120] eink_epd spi0.0: panel initialized (250x122 monochrome)\n[  +0.412] systemd[1]: Reached target Graphical Interface.\n[  +0.415] cyberdeck-shell: display driver active on /dev/fb0",
    },
    upvotes: 42,
    hasUpvoted: false,
  },
  {
    id: "post-2",
    author: {
      name: "Elena Rostova",
      username: "elena_core",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      streak: 9,
    },
    content: "Shipped v0.4 of `hyperdrive-agent`: single static 8.2MB binary that parses git diffs and runs automated multi-file semantic edits in <110ms using local llama.cpp bindings. Replaced 4 python scripts with zero external dependencies.",
    timestamp: "1h ago",
    tags: ["#ai", "#rust", "#nextjs"],
    challengeTag: "Local AI Hack",
    githubUrl: "https://github.com/elenarostova/hyperdrive-agent",
    snippet: {
      type: "terminal",
      title: "hyperdrive bench --target ./core/ast.rs",
      body: "$ hyperdrive bench --target ./core/ast.rs\nBenchmarking AST parse throughput...\nParsed 480,210 lines/sec (alloc: 14.2MB RSS)\nZero telemetry. All AST edits verified in 84ms.",
    },
    upvotes: 68,
    hasUpvoted: true,
  },
  {
    id: "post-3",
    author: {
      name: "Marcus Thorne",
      username: "marcus_rf",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      streak: 7,
    },
    content: "Field test successful for the IP67 solar telemetry rig. Deep sleep current measured at 14.8µA on 3.3V bus via Keithley DMM. Transmitted 48 packets over 12km without dropped frames. PCB layout v2 committed to repo.",
    timestamp: "3h ago",
    tags: ["#hardware", "#pcb", "#embedded"],
    githubUrl: "https://github.com/marcusthorne/solarpulse-lora",
    demoUrl: "https://solarpulse.live",
    snippet: {
      type: "terminal",
      title: "lora_field_rig.log",
      body: "[LoRa Node 0x4A] TX freq: 868.1MHz SF7 BW125 CR4/5 PWR: +14dBm\n[LoRa Node 0x4A] RSSI: -84dBm SNR: +8.5dB (Gateway #01 acknowledged)\n[LoRa Node 0x4A] Sleep enter: 14.81 uA (ext wakeup on RTC 300s)",
    },
    upvotes: 53,
    hasUpvoted: false,
  },
  {
    id: "post-4",
    author: {
      name: "Dev Patel",
      username: "dev_kernel",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      streak: 5,
    },
    content: "Ported Zephyr RTOS v3.7 to the custom RP2350 dual-core RISC-V board. Inter-core FIFO IPC benchmarked at 28ns roundtrip latency. Schematic rev B sent to fabrication today.",
    timestamp: "5h ago",
    tags: ["#embedded", "#hardware"],
    githubUrl: "https://github.com/devpatel/rp2350-zephyr",
    snippet: {
      type: "code",
      title: "main.c (Zephyr IPC)",
      body: "*** Booting Zephyr OS build v3.7.0 ***\nrp2350_m33: Core 0 active (150MHz)\nrp2350_hazard3: Core 1 started IPC bridge\n[IPC] Loopback test: 28ns avg latency (1,000,000 iterations)",
    },
    upvotes: 31,
    hasUpvoted: false,
  },
];

const LEADERBOARD_BUILDERS = [
  { name: "Alex Vance", username: "alex_volt", streak: 14, role: "Hardware / ESP32" },
  { name: "Elena Rostova", username: "elena_core", streak: 9, role: "Rust & Local AI" },
  { name: "Marcus Thorne", username: "marcus_rf", streak: 7, role: "LoRa / Solar" },
  { name: "Dev Patel", username: "dev_kernel", streak: 5, role: "Zephyr RTOS" },
  { name: "Kai Tanaka", username: "kai_mech", streak: 4, role: "6061 CNC CAD" },
];

const AVAILABLE_TAGS = [
  { id: "all", label: "All Topics" },
  { id: "#hardware", label: "#hardware" },
  { id: "#pcb", label: "#pcb" },
  { id: "#ai", label: "#ai" },
  { id: "#embedded", label: "#embedded" },
  { id: "#nextjs", label: "#nextjs" },
  { id: "#rust", label: "#rust" },
];

export default function WorkspaceDashboard() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<BuilderPost[]>(INITIAL_POSTS);
  const [filterMode, setFilterMode] = useState<"latest" | "top">("latest");
  const [selectedTag, setSelectedTag] = useState("all");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Composer Form State
  const [content, setContent] = useState("");
  const [selectedProjectTag, setSelectedProjectTag] = useState("#hardware");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [terminalSnippet, setTerminalSnippet] = useState("");
  const [showSnippetInput, setShowSnippetInput] = useState(false);
  const [showUrlInputs, setShowUrlInputs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const composerInputRef = useRef<HTMLTextAreaElement>(null);

  const supabase = createClient();

  // Load real Supabase posts if any exist
  useEffect(() => {
    async function fetchDatabasePosts() {
      try {
        const { data, error } = await supabase
          .from("ship_logs")
          .select("*, author:profiles(*), challenge:challenges(*)")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          const formattedDbPosts: BuilderPost[] = data.map((item: any) => ({
            id: item.id,
            author: {
              name: item.author?.full_name || item.author?.username || "Builder",
              username: item.author?.username || "builder",
              avatar: item.author?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=builder",
              streak: item.author?.streak_count || 1,
            },
            content: item.content,
            timestamp: "Just now",
            tags: item.tags || ["#hardware"],
            challengeTag: item.challenge?.title,
            githubUrl: item.github_url,
            demoUrl: item.demo_url,
            upvotes: item.upvotes_count || 0,
            hasUpvoted: false,
          }));

          // Merge db posts with realistic community feed
          setPosts([...formattedDbPosts, ...INITIAL_POSTS]);
        }
      } catch (err) {
        console.warn("Using local workspace feed state:", err);
      }
    }
    fetchDatabasePosts();
  }, []);

  const handlePostShip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    const newPost: BuilderPost = {
      id: `local-${Date.now()}`,
      author: {
        name: profile?.full_name || (user?.email ? user.email.split("@")[0] : "You (Builder)"),
        username: profile?.username || "you",
        avatar: profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=you",
        streak: (profile?.streak_count || 0) + 1,
      },
      content: content.trim(),
      timestamp: "Just now",
      tags: [selectedProjectTag],
      githubUrl: githubUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      snippet: terminalSnippet.trim()
        ? {
            type: "terminal",
            title: "output.log",
            body: terminalSnippet.trim(),
          }
        : undefined,
      upvotes: 1,
      hasUpvoted: true,
    };

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#f59e0b"],
      });
    } catch {}

    // Prepend immediately to live feed state
    setPosts([newPost, ...posts]);

    // If authenticated, persist to Supabase
    if (user) {
      try {
        await (supabase.from("ship_logs") as any).insert({
          author_id: user.id,
          content: content.trim(),
          tags: [selectedProjectTag],
          github_url: githubUrl.trim() || null,
          demo_url: demoUrl.trim() || null,
          upvotes_count: 1,
        });
      } catch (err) {
        console.warn("Failed persisting to Supabase:", err);
      }
    }

    // Reset Form
    setContent("");
    setGithubUrl("");
    setDemoUrl("");
    setTerminalSnippet("");
    setShowSnippetInput(false);
    setShowUrlInputs(false);
    setIsSubmitting(false);
  };

  const handleToggleUpvote = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const nextUpvoted = !post.hasUpvoted;
          return {
            ...post,
            hasUpvoted: nextUpvoted,
            upvotes: nextUpvoted ? post.upvotes + 1 : Math.max(0, post.upvotes - 1),
          };
        }
        return post;
      })
    );
  };

  const handleFocusComposer = (challengeTag?: string) => {
    if (challengeTag) {
      setSelectedProjectTag("#hardware");
      setContent((prev) => (prev ? prev : `[${challengeTag}] `));
    }
    composerInputRef.current?.focus();
    composerInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (selectedTag === "all") return true;
    return post.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (filterMode === "top") return b.upvotes - a.upvotes;
    return 0; // maintain chronological order
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================================================================= */}
          {/* LEFT COLUMN: COMPACT NAVIGATION & TOPIC FILTERS                   */}
          {/* ================================================================= */}
          <aside className="lg:col-span-3 space-y-5 lg:sticky lg:top-20">
            {/* Quick Navigation Card */}
            <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 shadow-sm text-xs font-mono space-y-1">
              <div className="px-2 py-1.5 text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                Forge Workspace
              </div>

              <button
                onClick={() => {
                  setSelectedTag("all");
                  setFilterMode("latest");
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                  selectedTag === "all"
                    ? "bg-zinc-800 text-white font-semibold border border-zinc-700/80"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Ship Feed</span>
                </div>
                <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                  {posts.length}
                </span>
              </button>

              <Link
                href="/challenges"
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sprints & Challenges</span>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  2 ACTIVE
                </span>
              </Link>
            </div>

            {/* Topic / Tag Filter List */}
            <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between px-2 pt-1 text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                <span>Filter by Topic</span>
                {selectedTag !== "all" && (
                  <button
                    onClick={() => setSelectedTag("all")}
                    className="text-emerald-400 hover:text-emerald-300 font-normal capitalize"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs font-mono">
                {AVAILABLE_TAGS.map((tag) => {
                  const count =
                    tag.id === "all"
                      ? posts.length
                      : posts.filter((p) => p.tags.includes(tag.id)).length;

                  const isSelected = selectedTag === tag.id;

                  return (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTag(tag.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all text-left ${
                        isSelected
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-zinc-400" />
                        <span>{tag.label}</span>
                      </span>
                      <span className="text-[11px] text-zinc-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Metric Telemetry */}
            <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                <span>Daily Ship Velocity</span>
                <span className="text-emerald-400 font-semibold">+24 ships</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                <span>Global Streak Record</span>
                <span className="text-orange-400 font-semibold">28 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Auth & Backend</span>
                <span className="text-zinc-300">Supabase DB</span>
              </div>
            </div>
          </aside>

          {/* ================================================================= */}
          {/* CENTER COLUMN: QUICK-SHIP COMPOSER & LIVE SHIP-LOG FEED           */}
          {/* ================================================================= */}
          <main className="lg:col-span-6 space-y-4">
            
            {/* Quick-Ship Composer Input Box */}
            <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 shadow-md p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold text-emerald-400">
                    ⚡
                  </div>
                  <span className="text-xs font-mono font-semibold text-white tracking-tight">
                    QUICK-SHIP COMPOSER
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  500 chars max • Markdown enabled
                </span>
              </div>

              <form onSubmit={handlePostShip} className="space-y-3">
                <textarea
                  ref={composerInputRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, 500))}
                  placeholder="What did you build today? Share schematic progress, breadboard tests, commit diffs, or benchmark outputs..."
                  rows={3}
                  className="w-full bg-zinc-950/60 border border-zinc-800/90 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 transition-colors resize-none font-sans"
                />

                {/* Optional Collapsible Snippet Input */}
                {showSnippetInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1"
                  >
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                      Terminal Output / Bench Log Snippet:
                    </label>
                    <textarea
                      value={terminalSnippet}
                      onChange={(e) => setTerminalSnippet(e.target.value)}
                      placeholder="Paste terminal log or build command output here..."
                      rows={3}
                      className="w-full bg-black/80 border border-zinc-800 rounded-lg p-2.5 text-xs text-emerald-400 font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500/60"
                    />
                  </motion.div>
                )}

                {/* Optional Links Input */}
                {showUrlInputs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono"
                  >
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                      <GithubIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="GitHub repo URL..."
                        className="bg-transparent text-white placeholder-zinc-500 w-full focus:outline-none text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                      <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="url"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        placeholder="Live demo / video URL..."
                        className="bg-transparent text-white placeholder-zinc-500 w-full focus:outline-none text-xs"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Controls & Submit Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-zinc-400 text-[11px] hidden sm:inline">Tag:</span>
                    <select
                      value={selectedProjectTag}
                      onChange={(e) => setSelectedProjectTag(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="#hardware">#hardware</option>
                      <option value="#pcb">#pcb</option>
                      <option value="#ai">#ai</option>
                      <option value="#embedded">#embedded</option>
                      <option value="#nextjs">#nextjs</option>
                      <option value="#rust">#rust</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowSnippetInput(!showSnippetInput)}
                      className={`px-2 py-1 rounded-lg border text-[11px] transition-colors ${
                        showSnippetInput
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      + Terminal Log
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInputs(!showUrlInputs)}
                      className={`px-2 py-1 rounded-lg border text-[11px] transition-colors ${
                        showUrlInputs
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      + Links
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-sm active:scale-95"
                  >
                    <Send className="w-3 h-3" />
                    <span>Ship Update</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Feed Filter Bar */}
            <div className="flex items-center justify-between px-1 py-1 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterMode("latest")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    filterMode === "latest"
                      ? "bg-zinc-800 text-white border border-zinc-700"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Latest Ships ({sortedPosts.length})
                </button>
                <button
                  onClick={() => setFilterMode("top")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                    filterMode === "top"
                      ? "bg-zinc-800 text-orange-400 border border-zinc-700"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Flame className="w-3 h-3 fill-current" />
                  <span>Top Upvoted</span>
                </button>
              </div>

              {selectedTag !== "all" && (
                <span className="text-[11px] text-zinc-400">
                  Tag: <span className="text-emerald-400 font-semibold">{selectedTag}</span>
                </span>
              )}
            </div>

            {/* Live Chronological Ship-Log Feed */}
            <div className="space-y-3.5">
              {sortedPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-zinc-900/90 rounded-xl p-4 sm:p-5 border border-zinc-800/90 shadow-sm hover:border-zinc-700/80 transition-all space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Link href={`/u/${post.author.username}`} className="shrink-0 relative">
                        <img
                          src={post.author.avatar}
                          alt={post.author.username}
                          className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                        />
                        {post.author.streak > 0 && (
                          <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-orange-500 text-black text-[9px] font-mono font-bold flex items-center justify-center">
                            🔥{post.author.streak}
                          </span>
                        )}
                      </Link>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/u/${post.author.username}`}
                            className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors truncate"
                          >
                            {post.author.name}
                          </Link>
                          <span className="text-xs font-mono text-zinc-400 truncate">
                            @{post.author.username}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                          <span>{post.timestamp}</span>
                          {post.challengeTag && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-medium truncate flex items-center gap-1">
                                <Trophy className="w-3 h-3 shrink-0" />
                                {post.challengeTag}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Upvote Reaction Button */}
                    <button
                      onClick={() => handleToggleUpvote(post.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${
                        post.hasUpvoted
                          ? "bg-orange-500/15 border-orange-500/40 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.15)]"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-orange-400 hover:border-orange-500/30"
                      }`}
                    >
                      <Flame
                        className={`w-3.5 h-3.5 ${
                          post.hasUpvoted ? "fill-orange-500 text-orange-500" : ""
                        }`}
                      />
                      <span>{post.upvotes}</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <p className="text-sm text-zinc-200 leading-relaxed font-normal whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Terminal / Code Snippet Artifact */}
                  {post.snippet && (
                    <div className="rounded-lg overflow-hidden border border-zinc-800 bg-black/90">
                      <div className="px-3 py-1.5 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-emerald-400" />
                          <span>{post.snippet.title}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 uppercase">TELEMETRY</span>
                      </div>
                      <pre className="p-3 text-xs font-mono text-emerald-400/90 overflow-x-auto leading-relaxed">
                        <code>{post.snippet.body}</code>
                      </pre>
                    </div>
                  )}

                  {/* Card Footer: Tags & External Links */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/60">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {post.tags.map((t) => (
                        <span
                          key={t}
                          onClick={() => setSelectedTag(t)}
                          className="cursor-pointer text-[11px] font-mono text-zinc-400 hover:text-emerald-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 transition-colors"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      {post.githubUrl && (
                        <a
                          href={post.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                        >
                          <GithubIcon className="w-3 h-3" />
                          <span>Repo</span>
                          <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                        </a>
                      )}
                      {post.demoUrl && (
                        <a
                          href={post.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Live Demo</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: ACTIVE CHALLENGE & STREAKS LEADERBOARD             */}
          {/* ================================================================= */}
          <aside className="lg:col-span-3 space-y-5 lg:sticky lg:top-20">
            
            {/* Active Challenge Card */}
            <div className="bg-zinc-900/90 rounded-xl p-4 border border-emerald-500/30 shadow-md space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE SPRINT
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>4d 18h left</span>
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  7-Day Hardware & Local AI Hack
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Design, wire, and prototype an ultra-compact cyberdeck, ESP32 rig, or quantized local AI terminal utility.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1">
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span>Prize:</span>
                  <span className="text-white">$500 Hardware Grant</span>
                </div>
                <p className="text-[10px] text-zinc-400">Requires 2 progressive ship-logs with photos or terminal proof.</p>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={() => handleFocusComposer("7-Day Hardware Sprint")}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all text-center"
                >
                  Submit Build
                </button>
                <Link
                  href="/challenges/cyberdeck-hardware-hack-2026"
                  className="px-2.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono"
                  title="View Full Brief"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Top Shipping Streaks Mini-Leaderboard */}
            <div className="bg-zinc-900/90 rounded-xl p-4 border border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-500" />
                  <span className="text-xs font-mono font-bold text-white tracking-tight">
                    TOP SHIPPING STREAKS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">ACTIVE DAYS</span>
              </div>

              <div className="space-y-2">
                {LEADERBOARD_BUILDERS.map((builder, idx) => (
                  <Link
                    key={builder.username}
                    href={`/u/${builder.username}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs text-zinc-400 w-4 text-center">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                          {builder.name}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-400 truncate">
                          @{builder.username} • {builder.role}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-xs font-semibold flex items-center gap-0.5">
                      🔥{builder.streak}d
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Proof-of-Work Standard Manifesto */}
            <div className="bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                Proof of Work Standard:
              </span>
              <ul className="space-y-1 text-zinc-400 text-[10px]">
                <li>• Raw progress over polished decks</li>
                <li>• Breadboards & commits over talk</li>
                <li>• Max 500 characters per ship</li>
              </ul>
            </div>
          </aside>

        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
