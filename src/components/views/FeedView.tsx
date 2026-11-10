"use client";

import React, { useState } from "react";
import {
  Flame,
  Send,
  ExternalLink,
  Terminal,
  MessageSquare,
  Cpu,
  Radio,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Code2,
  Link as LinkIcon,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { GithubIcon } from "@/components/ui/Icons";
import { ShipPost, Comment } from "@/lib/types/community";

interface FeedViewProps {
  posts: ShipPost[];
  onAddPost: (post: ShipPost) => void;
  onToggleUpvote: (postId: string) => void;
  onAddComment: (postId: string, comment: Comment) => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  userProfile: {
    name: string;
    username: string;
    avatar: string;
    streak: number;
  };
}

export function FeedView({
  posts,
  onAddPost,
  onToggleUpvote,
  onAddComment,
  selectedTag,
  userProfile,
}: FeedViewProps) {
  const [feedTab, setFeedTab] = useState<"all" | "ship" | "discussion">("all");
  const [composerType, setComposerType] = useState<"ship" | "discussion">("ship");
  const [composerContent, setComposerContent] = useState("");
  const [composerTag, setComposerTag] = useState("#hardware");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [snippetTitle, setSnippetTitle] = useState("ttyUSB0 · UART SERIAL READOUT");
  const [terminalSnippet, setTerminalSnippet] = useState("");
  const [showSnippetInput, setShowSnippetInput] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const availableTags = ["#hardware", "#stm32", "#rust", "#ai", "#pcb", "#cyberdeck", "#embedded"];

  const filteredPosts = posts.filter((p) => {
    if (feedTab !== "all" && p.type !== feedTab) return false;
    if (selectedTag !== "all" && !p.tags.includes(selectedTag)) return false;
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerContent.trim()) return;

    const newPost: ShipPost = {
      id: `ship-${Date.now()}`,
      type: composerType,
      author: {
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        streak: userProfile.streak || 1,
        badge: composerType === "ship" ? "VERIFIED COMMIT" : "DISCUSSION",
      },
      content: composerContent.trim(),
      timestamp: "Just now",
      tags: [composerTag],
      githubUrl: githubUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      snippet: terminalSnippet.trim()
        ? {
            type: "terminal",
            title: snippetTitle.trim() || "trace.log",
            body: terminalSnippet.trim(),
          }
        : undefined,
      upvotes: 0,
      hasUpvoted: false,
      comments: [],
    };

    onAddPost(newPost);
    setComposerContent("");
    setGithubUrl("");
    setDemoUrl("");
    setTerminalSnippet("");
    setShowSnippetInput(false);
  };

  const handlePostComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      author: {
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        streak: userProfile.streak || 1,
      },
      content: text,
      timestamp: "Just now",
      upvotes: 0,
      hasUpvoted: false,
    };

    onAddComment(postId, newComment);
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const shipCount = posts.filter((p) => p.type === "ship").length;
  const discussionCount = posts.filter((p) => p.type === "discussion").length;

  return (
    <div className="space-y-4">
      {/* Ship Composer Section */}
      <section className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] p-4 rounded-lg shadow-xs flex flex-col gap-3 transition-colors">
        {/* Mode Switcher & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center bg-slate-100 dark:bg-[#1a1b21] p-0.5 rounded-md border border-slate-200 dark:border-[#292a2f]">
            <button
              type="button"
              onClick={() => setComposerType("ship")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                composerType === "ship"
                  ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] shadow-xs"
                  : "text-slate-500 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-[#e3e1e9]"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Log Ship Update</span>
            </button>
            <button
              type="button"
              onClick={() => setComposerType("discussion")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                composerType === "discussion"
                  ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] shadow-xs"
                  : "text-slate-500 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-[#e3e1e9]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Start Discussion</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#adc6ff]" />
            <span className="font-mono text-[11px] text-slate-500 dark:text-[#8c909f]">
              Posting as{" "}
              <span className="text-slate-900 dark:text-[#c2c6d6] font-medium">
                @{userProfile.username}
              </span>
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreatePost} className="space-y-2.5">
          <div className="relative w-full">
            <textarea
              value={composerContent}
              onChange={(e) => setComposerContent(e.target.value)}
              rows={3}
              placeholder={
                composerType === "ship"
                  ? "What physical progress, systems code, or silicon did you ship today? (cold boot timing, baud rate calibration, PCB revision v2, standby draw, kernel patch)..."
                  : "Ask for peer hardware/architecture review or discuss component tolerances and firmware bottlenecks..."
              }
              className="w-full bg-slate-50 dark:bg-[#1a1b21] text-slate-900 dark:text-[#e3e1e9] placeholder:text-slate-400 dark:placeholder:text-[#8c909f]/70 font-mono text-xs p-3 pb-7 rounded-md border border-slate-200 dark:border-[#292a2f] resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all leading-relaxed"
              required
            />
            <div className="absolute bottom-2 right-3 font-mono text-[10px] text-slate-400 dark:text-[#8c909f] pointer-events-none">
              Markdown / Telemetry syntax enabled
            </div>
          </div>

          {/* Snippet Input Toggle */}
          {showSnippetInput && (
            <div className="p-3 bg-[#e8eef5]/60 dark:bg-[#1a1b21] border border-slate-300/70 dark:border-[#292a2f] rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-blue-600 dark:text-[#adc6ff] flex items-center gap-1.5 font-medium">
                  <Terminal className="w-3.5 h-3.5" />
                  Terminal / Logic Trace Snippet
                </span>
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="trace_name.log"
                  className="px-2 py-0.5 text-[10px] font-mono bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#292a2f] text-slate-700 dark:text-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <textarea
                value={terminalSnippet}
                onChange={(e) => setTerminalSnippet(e.target.value)}
                rows={3}
                placeholder="[BOOT] PLL clock synchronized at 400.00MHz ± 0.02%..."
                className="w-full p-2.5 text-[11px] font-mono bg-white dark:bg-[#0d0e13] text-blue-700 dark:text-[#adc6ff] rounded border border-slate-200 dark:border-[#292a2f] focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Attachments Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] px-3 py-1.5 rounded-md focus-within:border-blue-500">
              <Code2 className="w-4 h-4 text-slate-400 dark:text-[#8c909f] shrink-0" />
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="github.com/org/repo/commit..."
                className="w-full bg-transparent font-mono text-[11px] text-slate-900 dark:text-[#e3e1e9] placeholder:text-slate-400 dark:placeholder:text-[#8c909f] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] px-3 py-1.5 rounded-md focus-within:border-blue-500">
              <LinkIcon className="w-4 h-4 text-slate-400 dark:text-[#8c909f] shrink-0" />
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="Schematic, serial trace, or demo URL..."
                className="w-full bg-transparent font-mono text-[11px] text-slate-900 dark:text-[#e3e1e9] placeholder:text-slate-400 dark:placeholder:text-[#8c909f] focus:outline-none"
              />
            </div>
          </div>

          {/* Tags & Dispatch Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="font-mono text-[10px] text-slate-500 dark:text-[#8c909f] uppercase tracking-wider">
                Tags:
              </span>
              {availableTags.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setComposerTag(tag)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] border transition-colors ${
                    composerTag === tag
                      ? "bg-blue-50 dark:bg-[#292a2f] border-blue-200 dark:border-transparent text-blue-600 dark:text-[#adc6ff] font-medium"
                      : "bg-slate-100 dark:bg-[#1e1f25] border-slate-200 dark:border-transparent text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowSnippetInput(!showSnippetInput)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] border transition-colors flex items-center gap-1 ${
                  showSnippetInput
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-[#adc6ff] border-blue-300 dark:border-blue-700"
                    : "bg-slate-50 dark:bg-[#1a1b21] border-slate-200 dark:border-transparent text-slate-500 dark:text-[#8c909f] hover:text-blue-600 dark:hover:text-[#adc6ff]"
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>+ Trace</span>
              </button>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs active:scale-[0.99]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ship to Feed</span>
            </button>
          </div>
        </form>
      </section>

      {/* Feed Control & Filter Header */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFeedTab("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                feedTab === "all"
                  ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-slate-200 dark:border-transparent font-semibold shadow-xs"
                  : "text-slate-500 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-[#e3e1e9] hover:bg-white dark:hover:bg-[#1a1b21]"
              }`}
            >
              All Activity{" "}
              <span className="ml-1 font-mono text-[11px] opacity-80">({posts.length})</span>
            </button>
            <button
              onClick={() => setFeedTab("ship")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                feedTab === "ship"
                  ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-slate-200 dark:border-transparent font-semibold shadow-xs"
                  : "text-slate-500 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-[#e3e1e9] hover:bg-white dark:hover:bg-[#1a1b21]"
              }`}
            >
              Verified Ships{" "}
              <span className="ml-1 font-mono text-[11px] opacity-80">({shipCount})</span>
            </button>
            <button
              onClick={() => setFeedTab("discussion")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                feedTab === "discussion"
                  ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-slate-200 dark:border-transparent font-semibold shadow-xs"
                  : "text-slate-500 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-[#e3e1e9] hover:bg-white dark:hover:bg-[#1a1b21]"
              }`}
            >
              Discussions{" "}
              <span className="ml-1 font-mono text-[11px] opacity-80">({discussionCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedTag !== "all" && (
              <span className="text-[11px] font-mono text-blue-600 dark:text-[#adc6ff] bg-blue-50 dark:bg-[#292a2f] px-2 py-0.5 rounded border border-blue-200 dark:border-transparent">
                Filtered: {selectedTag}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#8c909f] font-mono text-[11px]">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
              <span className="hidden sm:inline">Live Supabase Sync</span>
            </div>
          </div>
        </div>

        {/* POSTS FEED LIST OR CLEAN EMPTY STATE */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] flex items-center justify-center mx-auto">
              <Radio className="w-6 h-6 text-blue-600 dark:text-[#adc6ff]" />
            </div>
            <h3 className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
              No ships logged yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono max-w-md mx-auto leading-relaxed">
              Be the first builder to post a proof-of-work update above. Every log creates verifiable history and builds your shipping streak.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] p-4 rounded-lg shadow-xs flex flex-col gap-3 hover:border-slate-300 dark:hover:border-[#292a2f] transition-all"
              >
                {/* Top Row: Author & Verification Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-[#424754] bg-slate-100 dark:bg-[#1a1b21] shrink-0"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-900 dark:text-[#e3e1e9]">
                          {post.author.name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-[#8c909f]">
                          @{post.author.username}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-[#8c909f]" />
                        <span className="font-mono text-[11px] text-slate-500 dark:text-[#8c909f]">
                          {post.timestamp}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-600 dark:text-[#adc6ff] ml-1">
                          <Flame className="w-3 h-3" />
                          {post.author.streak}d
                        </span>
                      </div>
                      {post.challengeTag && (
                        <span className="font-mono text-[11px] text-blue-600 dark:text-[#adc6ff]">
                          Sprint: {post.challengeTag}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-[#1e1f25] border border-blue-200/70 dark:border-transparent px-2 py-1 rounded shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
                    <span className="font-mono text-[10px] text-blue-700 dark:text-[#adc6ff] font-medium tracking-tight uppercase">
                      {post.type === "ship" ? "VERIFIED SHIP" : "DISCUSSION"}
                    </span>
                  </div>
                </div>

                {/* Content Description */}
                <p className="text-sm text-slate-800 dark:text-[#e3e1e9] leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Terminal / Serial Readout Box */}
                {post.snippet && (
                  <div className="bg-[#e8eef5]/70 dark:bg-[#1a1b21] border border-slate-300/60 dark:border-[#292a2f] p-3 rounded-md flex flex-col gap-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-slate-500 dark:text-[#8c909f] pb-1 border-b border-slate-300/40 dark:border-[#292a2f]">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>{post.snippet.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-[#8c909f]">
                        serial_io
                      </span>
                    </div>
                    <pre className="pt-1 text-blue-700 dark:text-[#adc6ff] overflow-x-auto leading-relaxed">
                      {post.snippet.body}
                    </pre>
                  </div>
                )}

                {/* Bottom Links, Tags & Upvote/Comment Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#1e1f25]">
                  <div className="flex items-center flex-wrap gap-1.5">
                    {post.githubUrl && (
                      <a
                        href={post.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1e1f25] border border-slate-200 dark:border-transparent text-slate-700 dark:text-[#c2c6d6] hover:text-blue-600 dark:hover:text-[#adc6ff] font-mono text-[11px] transition-colors"
                      >
                        <GithubIcon className="w-3 h-3" />
                        <span>Repo</span>
                      </a>
                    )}
                    {post.demoUrl && (
                      <a
                        href={post.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1e1f25] border border-slate-200 dark:border-transparent text-slate-700 dark:text-[#c2c6d6] hover:text-blue-600 dark:hover:text-[#adc6ff] font-mono text-[11px] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Demo</span>
                      </a>
                    )}
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-600 dark:text-[#c2c6d6]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Upvotes & Comments */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onToggleUpvote(post.id);
                        if (!post.hasUpvoted) {
                          confetti({
                            particleCount: 25,
                            spread: 50,
                            origin: { y: 0.8 },
                            colors: ["#2563eb", "#60a5fa", "#38bdf8"],
                          });
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border transition-all ${
                        post.hasUpvoted
                          ? "bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border-blue-200 dark:border-blue-500/40"
                          : "bg-slate-50 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border-slate-200 dark:border-[#292a2f] hover:text-blue-600 dark:hover:text-[#adc6ff]"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{post.upvotes}</span>
                    </button>

                    <button
                      onClick={() =>
                        setExpandedComments({
                          ...expandedComments,
                          [post.id]: !expandedComments[post.id],
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-slate-600 dark:text-[#c2c6d6] bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{post.comments.length} comments</span>
                      {expandedComments[post.id] ? (
                        <ChevronUp className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Threaded Comments */}
                {expandedComments[post.id] && (
                  <div className="pt-3 border-t border-slate-100 dark:border-[#1e1f25] space-y-2.5">
                    {post.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200/80 dark:border-[#292a2f] rounded-md text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#8c909f]">
                          <span className="font-semibold text-slate-900 dark:text-[#e3e1e9]">
                            @{c.author.username}
                          </span>
                          <span>{c.timestamp}</span>
                        </div>
                        <p className="text-slate-700 dark:text-[#c2c6d6]">{c.content}</p>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handlePostComment(post.id);
                        }}
                        placeholder="Write technical feedback or debug query..."
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] placeholder:text-slate-400 dark:placeholder:text-[#8c909f] focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <button
                        onClick={() => handlePostComment(post.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
