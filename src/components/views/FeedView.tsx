"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Send,
  Globe,
  Tag,
  Clock,
  ExternalLink,
  Terminal,
  Code2,
  Trophy,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  HelpCircle,
  Hash,
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
  onSelectTag,
  userProfile,
}: FeedViewProps) {
  const [feedTab, setFeedTab] = useState<"all" | "ship" | "discussion">("all");
  const [composerType, setComposerType] = useState<"ship" | "discussion">("ship");
  const [composerContent, setComposerContent] = useState("");
  const [composerTag, setComposerTag] = useState("#hardware");
  const [composerCategory, setComposerCategory] = useState("hardware-help");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [terminalSnippet, setTerminalSnippet] = useState("");
  const [showSnippetInput, setShowSnippetInput] = useState(false);
  const [showLinksInput, setShowLinksInput] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    "post-101": true,
  });
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerContent.trim()) return;

    const newPost: ShipPost = {
      id: `post-${Date.now()}`,
      type: composerType,
      author: {
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        streak: userProfile.streak,
        badge: composerType === "ship" ? "Builder" : "Discussion",
      },
      content: composerContent.trim(),
      timestamp: "Just now",
      tags: [composerTag],
      category: composerType === "discussion" ? composerCategory : undefined,
      githubUrl: githubUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      snippet: terminalSnippet.trim()
        ? {
            type: "terminal",
            title: "telemetry.log",
            body: terminalSnippet.trim(),
          }
        : undefined,
      upvotes: 1,
      hasUpvoted: true,
      comments: [],
    };

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#059669", "#f59e0b"],
      });
    } catch {}

    onAddPost(newPost);
    setComposerContent("");
    setGithubUrl("");
    setDemoUrl("");
    setTerminalSnippet("");
    setShowSnippetInput(false);
    setShowLinksInput(false);
  };

  const handlePostComment = (postId: string) => {
    const text = replyInputs[postId]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: {
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        streak: userProfile.streak,
      },
      content: text,
      timestamp: "Just now",
      upvotes: 1,
      hasUpvoted: true,
    };

    onAddComment(postId, newComment);
    setReplyInputs({ ...replyInputs, [postId]: "" });
    setExpandedComments({ ...expandedComments, [postId]: true });
  };

  const toggleComments = (postId: string) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId],
    });
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (feedTab !== "all" && post.type !== feedTab) return false;
    if (selectedTag !== "all" && !post.tags.includes(selectedTag)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Quick-Ship & Discussion Composer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => setComposerType("ship")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                composerType === "ship"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Log Ship
            </button>
            <button
              type="button"
              onClick={() => setComposerType("discussion")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                composerType === "discussion"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Start Discussion
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            500 chars max • Markdown supported
          </span>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            value={composerContent}
            onChange={(e) => setComposerContent(e.target.value.slice(0, 500))}
            placeholder={
              composerType === "ship"
                ? "What did you build or test today? Share hardware bench notes, schematic iterations, or commit diffs..."
                : "Ask an engineering question, share an architectural comparison, or start a technical discussion..."
            }
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors resize-none font-sans"
          />

          {/* Optional Terminal Log Snippet */}
          {showSnippetInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1"
            >
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Terminal Output / Code Snippet:
              </label>
              <textarea
                value={terminalSnippet}
                onChange={(e) => setTerminalSnippet(e.target.value)}
                placeholder="Paste compiler output, serial log, or code lines here..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-400 font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </motion.div>
          )}

          {/* Optional Repo & Demo Links */}
          {showLinksInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="GitHub repo URL..."
                  className="bg-transparent text-slate-900 placeholder-slate-400 w-full focus:outline-none text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="Live demo / video URL..."
                  className="bg-transparent text-slate-900 placeholder-slate-400 w-full focus:outline-none text-xs"
                />
              </div>
            </motion.div>
          )}

          {/* Controls & Submit Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Tag:</span>
              <select
                value={composerTag}
                onChange={(e) => setComposerTag(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 text-xs focus:outline-none focus:border-emerald-600"
              >
                <option value="#hardware">#hardware</option>
                <option value="#pcb">#pcb</option>
                <option value="#ai">#ai</option>
                <option value="#embedded">#embedded</option>
                <option value="#nextjs">#nextjs</option>
                <option value="#rust">#rust</option>
              </select>

              {composerType === "discussion" && (
                <select
                  value={composerCategory}
                  onChange={(e) => setComposerCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 text-xs focus:outline-none focus:border-emerald-600"
                >
                  <option value="hardware-help">Channel: #hardware-help</option>
                  <option value="architecture">Channel: #architecture</option>
                  <option value="general">Channel: #general</option>
                </select>
              )}

              <button
                type="button"
                onClick={() => setShowSnippetInput(!showSnippetInput)}
                className={`px-2 py-1 rounded-lg border text-[11px] transition-colors ${
                  showSnippetInput
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800"
                }`}
              >
                + Snippet
              </button>

              <button
                type="button"
                onClick={() => setShowLinksInput(!showLinksInput)}
                className={`px-2 py-1 rounded-lg border text-[11px] transition-colors ${
                  showLinksInput
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800"
                }`}
              >
                + Links
              </button>
            </div>

            <button
              type="submit"
              disabled={!composerContent.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium text-xs font-mono uppercase tracking-wider transition-all shadow-xs active:scale-95"
            >
              <Send className="w-3 h-3" />
              <span>{composerType === "ship" ? "Ship Update" : "Publish Thread"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feed Sub-tabs & Tag Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs font-mono">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFeedTab("all")}
            className={`px-3 py-1 rounded-md transition-colors ${
              feedTab === "all"
                ? "bg-white text-slate-900 border border-slate-200 font-semibold shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All Activity ({posts.length})
          </button>
          <button
            onClick={() => setFeedTab("ship")}
            className={`px-3 py-1 rounded-md transition-colors ${
              feedTab === "ship"
                ? "bg-white text-slate-900 border border-slate-200 font-semibold shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Ships ({posts.filter((p) => p.type === "ship").length})
          </button>
          <button
            onClick={() => setFeedTab("discussion")}
            className={`px-3 py-1 rounded-md transition-colors ${
              feedTab === "discussion"
                ? "bg-white text-slate-900 border border-slate-200 font-semibold shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Discussions ({posts.filter((p) => p.type === "discussion").length})
          </button>
        </div>

        {selectedTag !== "all" && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Tag:</span>
            <span className="text-emerald-700 font-medium">{selectedTag}</span>
            <button
              onClick={() => onSelectTag("all")}
              className="text-slate-400 hover:text-slate-700 text-[10px]"
            >
              (Clear)
            </button>
          </div>
        )}
      </div>

      {/* Posts Stream */}
      <div className="space-y-3.5">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
          >
            {/* Header: Author + Streak + Post Type */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  {post.author.streak > 0 && (
                    <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-orange-50 text-orange-700 text-[9px] font-mono font-bold border border-orange-200 flex items-center justify-center">
                      <Flame className="w-2.5 h-2.5 text-orange-600 fill-orange-600 inline mr-0.5" />
                      {post.author.streak}d
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {post.author.name}
                    </span>
                    <span className="text-xs font-mono text-slate-400 truncate">
                      @{post.author.username}
                    </span>
                    {post.author.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {post.author.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>{post.timestamp}</span>
                    {post.challengeTag && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 font-medium truncate flex items-center gap-1">
                          <Trophy className="w-3 h-3 shrink-0" />
                          {post.challengeTag}
                        </span>
                      </>
                    )}
                    {post.category && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">#{post.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Upvote Button (Zero emojis) */}
              <button
                onClick={() => onToggleUpvote(post.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${
                  post.hasUpvoted
                    ? "bg-orange-50 border-orange-300 text-orange-700 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200"
                }`}
              >
                <Flame
                  className={`w-3.5 h-3.5 ${
                    post.hasUpvoted ? "text-orange-600 fill-orange-600" : "text-slate-400"
                  }`}
                />
                <span>{post.upvotes}</span>
              </button>
            </div>

            {/* Post Content */}
            <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
              {post.content}
            </p>

            {/* Snippet Artifact */}
            {post.snippet && (
              <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 text-slate-200">
                <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    <span>{post.snippet.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">TELEMETRY</span>
                </div>
                <pre className="p-3 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                  <code>{post.snippet.body}</code>
                </pre>
              </div>
            )}

            {/* Footer: Tags, Links, and Comments Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    onClick={() => onSelectTag(t)}
                    className="cursor-pointer text-[11px] font-mono text-slate-600 hover:text-emerald-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                {post.githubUrl && (
                  <a
                    href={post.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <GithubIcon className="w-3 h-3" />
                    <span>Repo</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </a>
                )}
                {post.demoUrl && (
                  <a
                    href={post.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Live Demo</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}

                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>{post.comments.length} replies</span>
                  {expandedComments[post.id] ? (
                    <ChevronUp className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Threaded Comments / Discussion Replies */}
            {expandedComments[post.id] && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                {post.comments.length > 0 && (
                  <div className="space-y-2 pl-3 border-l-2 border-slate-200">
                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={comment.author.avatar}
                              alt={comment.author.username}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-semibold text-slate-800">
                              {comment.author.name}
                            </span>
                            <span className="font-mono text-slate-400">
                              @{comment.author.username}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-sans pl-6">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={replyInputs[post.id] || ""}
                    onChange={(e) =>
                      setReplyInputs({ ...replyInputs, [post.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handlePostComment(post.id);
                      }
                    }}
                    placeholder="Reply with debugging advice or feedback..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <button
                    onClick={() => handlePostComment(post.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-medium"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
