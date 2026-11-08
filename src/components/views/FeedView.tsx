"use client";

import React, { useState } from "react";
import {
  Flame,
  Send,
  ExternalLink,
  Terminal,
  Code2,
  Trophy,
  MessageSquare,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Radio,
  ChevronDown,
  ChevronUp,
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
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [snippetTitle, setSnippetTitle] = useState("serial_trace.log");
  const [terminalSnippet, setTerminalSnippet] = useState("");
  const [showSnippetInput, setShowSnippetInput] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const availableTags = ["#hardware", "#nextjs", "#ai", "#pcb", "#cyberdeck", "#embedded", "#rust"];

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
        badge: composerType === "ship" ? "Active Builder" : "Discussion Lead",
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

  return (
    <div className="space-y-6">
      {/* Quick-Ship & Discussion Composer Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        {/* Type Toggle Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setComposerType("ship")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                composerType === "ship"
                  ? "bg-zinc-800 text-emerald-400 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Log Ship Update</span>
            </button>
            <button
              type="button"
              onClick={() => setComposerType("discussion")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                composerType === "discussion"
                  ? "bg-zinc-800 text-teal-400 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Start Discussion</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Posting as @{userProfile.username}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            value={composerContent}
            onChange={(e) => setComposerContent(e.target.value)}
            rows={3}
            placeholder={
              composerType === "ship"
                ? "What physical progress or systems code did you ship today? (cold boot, baud rate, PCB revision, standby draw)..."
                : "Ask for peer hardware/architecture review or discuss component constraints..."
            }
            className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-xs focus:outline-hidden focus:border-emerald-500 font-mono leading-relaxed"
            required
          />

          {/* Snippet Input Toggle */}
          {showSnippetInput && (
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Terminal / Logic Trace Snippet
                </span>
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="trace_name.log"
                  className="px-2 py-0.5 text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 rounded focus:outline-hidden"
                />
              </div>
              <textarea
                value={terminalSnippet}
                onChange={(e) => setTerminalSnippet(e.target.value)}
                rows={3}
                placeholder="[  +0.041] mipi_dsi: panel attached: waveshare_7_9..."
                className="w-full p-2.5 text-[11px] font-mono bg-zinc-900 text-emerald-400 rounded-lg border border-zinc-800 focus:outline-hidden"
              />
            </div>
          )}

          {/* Link Inputs & Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="relative">
              <GithubIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="GitHub repo link (optional)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono text-[11px]"
              />
            </div>
            <div className="relative">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="Demo link or video (optional)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Tag Selector & Submit Button */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Tag:</span>
              <div className="flex flex-wrap gap-1">
                {availableTags.slice(0, 4).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setComposerTag(tag)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                      composerTag === tag
                        ? "bg-zinc-800 text-emerald-400 border-zinc-700"
                        : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowSnippetInput(!showSnippetInput)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  showSnippetInput
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40"
                    : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>+ Trace</span>
              </button>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-colors shadow-lg shadow-emerald-950/40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ship to Feed</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feed Filter Sub-tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeedTab("all")}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${
              feedTab === "all"
                ? "bg-zinc-800 text-zinc-100 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All Activity ({posts.length})
          </button>
          <button
            onClick={() => setFeedTab("ship")}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${
              feedTab === "ship"
                ? "bg-zinc-800 text-zinc-100 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Ships Only
          </button>
          <button
            onClick={() => setFeedTab("discussion")}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${
              feedTab === "discussion"
                ? "bg-zinc-800 text-zinc-100 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Discussions
          </button>
        </div>

        {selectedTag !== "all" && (
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
            Filtered by {selectedTag}
          </span>
        )}
      </div>

      {/* POSTS FEED LIST OR CLEAN EMPTY STATE */}
      {filteredPosts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
            <Radio className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-sm font-mono font-bold text-zinc-300">
            No ships logged yet
          </h3>
          <p className="text-xs text-zinc-500 font-mono max-w-md mx-auto leading-relaxed">
            Be the first builder to post a proof-of-work update above. Every log creates verifiable history and builds your shipping streak.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 hover:border-zinc-700 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-zinc-100">
                        {post.author.name}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        @{post.author.username}
                      </span>
                      {post.author.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {post.author.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mt-0.5">
                      <span>{post.timestamp}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-orange-400">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        {post.author.streak}d streak
                      </span>
                      {post.challengeTag && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">{post.challengeTag}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-zinc-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <p className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
                {post.content}
              </p>

              {/* Terminal or Code snippet */}
              {post.snippet && (
                <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden font-mono text-[11px]">
                  <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-zinc-400 text-[10px]">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Terminal className="w-3 h-3" />
                      {post.snippet.title}
                    </span>
                    <span className="text-zinc-600">serial_io</span>
                  </div>
                  <pre className="p-3 text-emerald-400 overflow-x-auto leading-relaxed">
                    {post.snippet.body}
                  </pre>
                </div>
              )}

              {/* Links & Telemetry */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                <div className="flex items-center gap-3">
                  {post.githubUrl && (
                    <a
                      href={post.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 font-mono text-[11px] transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>Repo</span>
                    </a>
                  )}
                  {post.demoUrl && (
                    <a
                      href={post.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 font-mono text-[11px] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
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
                          colors: ["#10b981", "#f59e0b"],
                        });
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-all ${
                      post.hasUpvoted
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-xs"
                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <Flame
                      className={`w-3.5 h-3.5 ${
                        post.hasUpvoted ? "fill-emerald-400" : ""
                      }`}
                    />
                    <span>{post.upvotes}</span>
                  </button>

                  <button
                    onClick={() =>
                      setExpandedComments({
                        ...expandedComments,
                        [post.id]: !expandedComments[post.id],
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.comments.length}</span>
                    {expandedComments[post.id] ? (
                      <ChevronUp className="w-3 h-3 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-zinc-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Threaded Comments */}
              {expandedComments[post.id] && (
                <div className="pt-3 border-t border-zinc-800 space-y-3">
                  {post.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="font-bold text-zinc-300">@{c.author.username}</span>
                        <span>{c.timestamp}</span>
                      </div>
                      <p className="text-zinc-300 font-sans">{c.content}</p>
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
                      className="flex-1 px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono"
                    />
                    <button
                      onClick={() => handlePostComment(post.id)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded-lg transition-colors border border-zinc-700"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
