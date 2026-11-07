"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Image as ImageIcon,
  Globe,
  Tag,
  Trophy,
  X,
  Sparkles,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { GithubIcon } from "../ui/Icons";
import confetti from "canvas-confetti";
import { useAuth } from "../auth/AuthProvider";
import { AuthModal } from "../auth/AuthModal";
import { Challenge, ShipLog } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";

interface ShipComposerProps {
  challenges: Challenge[];
  onShipSuccess: (newLog: ShipLog) => void;
  selectedChallengeId?: string | null;
  onClearChallenge?: () => void;
}

export function ShipComposer({
  challenges,
  onShipSuccess,
  selectedChallengeId,
  onClearChallenge,
}: ShipComposerProps) {
  const { user, profile } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [content, setContent] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [challengeId, setChallengeId] = useState<string>(selectedChallengeId || "");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showLinkInputs, setShowLinkInputs] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const supabase = createClient();
  const maxChars = 500;
  const charsRemaining = maxChars - content.length;

  // React to prop change
  React.useEffect(() => {
    if (selectedChallengeId) {
      setChallengeId(selectedChallengeId);
      setIsExpanded(true);
    }
  }, [selectedChallengeId]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, "");
      if (cleanTag && !tags.includes(`#${cleanTag}`)) {
        setTags([...tags, `#${cleanTag}`]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("ship-media")
        .upload(fileName, file);

      if (error) {
        console.error("Storage upload error:", error);
        // Fallback to local object URL for instant preview
        const localUrl = URL.createObjectURL(file);
        setMediaUrls([...mediaUrls, localUrl]);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("ship-media")
          .getPublicUrl(fileName);
        setMediaUrls([...mediaUrls, publicUrlData.publicUrl]);
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddManualMedia = () => {
    if (newMediaUrl.trim()) {
      setMediaUrls([...mediaUrls, newMediaUrl.trim()]);
      setNewMediaUrl("");
      setShowMediaInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setIsAuthOpen(true);
      return;
    }

    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const activeChallenge = challenges.find((c) => c.id === challengeId) || null;

      const payload = {
        author_id: user.id,
        content: content.trim(),
        media_urls: mediaUrls,
        github_url: githubUrl.trim() || null,
        demo_url: demoUrl.trim() || null,
        tags: tags,
        challenge_id: challengeId || null,
        upvotes_count: 0,
      };

      // Insert to Supabase
      const { data, error } = await (supabase
        .from("ship_logs") as any)
        .insert(payload)
        .select("*, author:profiles(*), challenge:challenges(*)")
        .single();

      // Trigger builder celebration confetti!
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#34d399", "#f59e0b", "#38bdf8"],
        });
      } catch (e) {
        // Safe confetti fallback
      }

      // If database insert succeeded, use live object; otherwise optimistic local fallback
      const createdLog: ShipLog = data || {
        id: `local-${Date.now()}`,
        author_id: user.id,
        project_id: null,
        content: content.trim(),
        media_urls: mediaUrls,
        github_url: githubUrl.trim() || null,
        demo_url: demoUrl.trim() || null,
        tags: tags,
        challenge_id: challengeId || null,
        upvotes_count: 0,
        created_at: new Date().toISOString(),
        author: profile,
        challenge: activeChallenge,
        user_has_upvoted: false,
      };

      onShipSuccess(createdLog);

      // Reset form
      setContent("");
      setGithubUrl("");
      setDemoUrl("");
      setTags([]);
      setMediaUrls([]);
      setChallengeId("");
      setIsExpanded(false);
      if (onClearChallenge) onClearChallenge();
    } catch (err) {
      console.error("Error creating ship log:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-xl mb-8 relative">
        {!user && !isExpanded && (
          <div
            onClick={() => setIsAuthOpen(true)}
            className="cursor-pointer flex items-center justify-between gap-3 text-zinc-400 hover:text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-400">
                ⚡
              </div>
              <span className="text-sm font-medium">
                Ship today's proof of work... What did you build?
              </span>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              LOG SHIP
            </span>
          </div>
        )}

        {(!user && isExpanded || user) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-3">
              <img
                src={
                  profile?.avatar_url ||
                  "https://api.dicebear.com/7.x/bottts/svg?seed=builder"
                }
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0 mt-0.5"
              />

              <div className="flex-1 min-w-0">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
                  placeholder="What did you build today? Share prototype updates, breadboard tests, commit logs, or CAD snapshots..."
                  rows={isExpanded ? 3 : 2}
                  onFocus={() => setIsExpanded(true)}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 resize-none focus:outline-none"
                />

                {/* Character Counter & Challenge Pill */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-1 border-t border-white/[0.04]">
                  {challengeId ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>
                        Tagging:{" "}
                        {challenges.find((c) => c.id === challengeId)?.title || "Challenge"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setChallengeId("");
                          if (onClearChallenge) onClearChallenge();
                        }}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span>Markdown supported</span>
                  )}

                  <span
                    className={charsRemaining < 50 ? "text-amber-400" : "text-zinc-500"}
                  >
                    {charsRemaining} chars left
                  </span>
                </div>
              </div>
            </div>

            {/* Media previews */}
            {mediaUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {mediaUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/[0.1]"
                  >
                    <img
                      src={url}
                      alt="Upload"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tags display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Expanded Toolbar */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-2 border-t border-white/[0.06]"
                >
                  {/* Secondary Inputs: URL Inputs */}
                  {showLinkInputs && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-input">
                        <GithubIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <input
                          type="url"
                          placeholder="GitHub repo URL..."
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          className="bg-transparent text-white placeholder-zinc-500 w-full focus:outline-none text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-input">
                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                        <input
                          type="url"
                          placeholder="Live demo / video URL..."
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          className="bg-transparent text-white placeholder-zinc-500 w-full focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Manual Media URL Input */}
                  {showMediaInput && (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Paste image or GIF URL directly..."
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddManualMedia();
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualMedia}
                        className="px-3 py-2 rounded-xl glass-pill text-xs font-mono text-emerald-400"
                      >
                        Add URL
                      </button>
                    </div>
                  )}

                  {/* Tag Input */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-input text-xs font-mono">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Add tag (e.g. #hardware-mod, #esp32) and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="bg-transparent text-white placeholder-zinc-500 w-full focus:outline-none"
                    />
                  </div>

                  {/* Challenge Selector */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <select
                      value={challengeId}
                      onChange={(e) => setChallengeId(e.target.value)}
                      className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-emerald-500 text-xs w-full sm:w-auto"
                    >
                      <option value="">No Challenge (Standard Ship)</option>
                      {challenges.map((c) => (
                        <option key={c.id} value={c.id}>
                          Submit to: {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {/* Upload Image Button */}
                <label className="cursor-pointer p-2 rounded-lg glass-pill text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </label>

                <button
                  type="button"
                  onClick={() => setShowMediaInput(!showMediaInput)}
                  className="px-2.5 py-1.5 rounded-lg glass-pill text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  + Image URL
                </button>

                <button
                  type="button"
                  onClick={() => setShowLinkInputs(!showLinkInputs)}
                  className={`p-2 rounded-lg glass-pill transition-colors ${
                    showLinkInputs ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isExpanded && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Ship Log</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
