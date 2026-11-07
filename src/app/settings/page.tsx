"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, X, Terminal, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setGithubUrl(profile.github_url || "");
      setDiscordHandle(profile.discord_handle || "");
      setTechStack(profile.tech_stack || []);
    }
  }, [profile]);

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const clean = newTech.trim();
      if (clean && !techStack.includes(clean)) {
        setTechStack([...techStack, clean]);
        setNewTech("");
      }
    }
  };

  const removeTech = (item: string) => {
    setTechStack(techStack.filter((t) => t !== item));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setSuccessMessage("");

    try {
      const updates = {
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
        github_url: githubUrl.trim(),
        discord_handle: discordHandle.trim(),
        tech_stack: techStack,
      };

      const { error } = await (supabase
        .from("profiles") as any)
        .update(updates)
        .eq("id", profile.id);

      if (error) {
        console.error("Failed to update profile:", error);
      } else {
        await refreshProfile();
        setSuccessMessage("Proof-of-work builder profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Feed</span>
      </Link>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>BUILDER IDENTITY</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Profile Settings
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Customize your public proof-of-work identity, tech stack badges, and verified links.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <img
              src={avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=builder"}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border border-zinc-700 shrink-0"
            />
            <div className="flex-1">
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Vance"
                className="w-full px-3 py-2 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Handle / Username
              </label>
              <div className="flex items-center glass-input rounded-xl px-3 py-2">
                <span className="text-zinc-500 font-mono text-xs mr-1">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alex_volt"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1">
              Builder Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Hardware hacker, embedded systems, CAD modeling..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm resize-none"
            />
          </div>

          {/* Social Handles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Discord Username
              </label>
              <input
                type="text"
                value={discordHandle}
                onChange={(e) => setDiscordHandle(e.target.value)}
                placeholder="builder#0001"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Tech Stack Tags */}
          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1">
              Tech Stack Badges
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-white/[0.05] text-zinc-200 border border-white/[0.08]"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={handleAddTech}
                placeholder="Add tech badge (e.g. KiCad, ESP32, Rust, Next.js) and press Enter..."
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (newTech.trim() && !techStack.includes(newTech.trim())) {
                    setTechStack([...techStack, newTech.trim()]);
                    setNewTech("");
                  }
                }}
                className="px-3 py-2 rounded-xl glass-pill text-xs font-mono text-emerald-400"
              >
                Add
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
