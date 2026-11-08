"use client";

import { useState } from "react";
import { ProjectItem, CollabRole } from "@/lib/types/community";
import { X, Plus, Rocket, ExternalLink, Check } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface ListProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListProject: (project: ProjectItem) => void;
}

export function ListProjectModal({
  isOpen,
  onClose,
  onListProject,
}: ListProjectModalProps) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Prototype" | "Beta" | "Shipped">("Prototype");
  const [techStackInput, setTechStackInput] = useState("ESP32-S3, KiCad, C++, Next.js");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [lookingForCollab, setLookingForCollab] = useState(true);
  const [openRoleTitle, setOpenRoleTitle] = useState("Firmware Kernel Dev");
  const [openRoleSkills, setOpenRoleSkills] = useState("FreeRTOS, SPI, C");
  const [openRoleSlots, setOpenRoleSlots] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tagline.trim()) return;

    const techStack = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const openRoles: CollabRole[] = lookingForCollab
      ? [
          {
            role: openRoleTitle.trim(),
            skills: openRoleSkills.split(",").map((s) => s.trim()).filter(Boolean),
            slotsAvailable: openRoleSlots,
          },
        ]
      : [];

    const ownerUsername = profile?.username || user?.email?.split("@")[0] || "builder";
    const ownerName = profile?.full_name || ownerUsername;

    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim() || tagline.trim(),
      owner: {
        name: ownerName,
        username: ownerUsername,
        avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${ownerUsername}`,
      },
      status,
      techStack,
      repoUrl: repoUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      lookingForCollab,
      openRoles,
      starsCount: 0,
      shippedAt: "Just now",
    };

    onListProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">List Engineering Build</h3>
              <p className="text-xs text-zinc-400 font-mono">Showcase your project & recruit collaborators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
          {/* Project Title */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-hidden focus:border-emerald-500 font-bold"
              placeholder="e.g. OrthoDeck CM4 Portable"
              required
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
              One-Line Summary / Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-emerald-500 font-sans"
              placeholder="e.g. Ultra-low power field terminal with e-ink secondary display"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
              Technical Description & Hardware Specs
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-emerald-500 font-sans leading-relaxed"
              placeholder="Detail the architecture, MCU/SBC chosen, board revision, power draw..."
            />
          </div>

          {/* Status & Tech Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                Build Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Prototype">Prototype (Bench)</option>
                <option value="Beta">Beta (Revision)</option>
                <option value="Shipped">Shipped (Production)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                Tech Stack (Comma-separated)
              </label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-emerald-500"
                placeholder="KiCad, ESP32, Rust, Next.js"
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                GitHub / Git Repo URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-emerald-500"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                Live Demo / Video URL (Optional)
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-emerald-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Looking for Collaborators section */}
          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lookingForCollab}
                onChange={(e) => setLookingForCollab(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-500 bg-zinc-900 border-zinc-700"
              />
              <span className="text-xs font-bold text-zinc-200">
                Recruit Collaborators for this build
              </span>
            </label>

            {lookingForCollab && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-500 mb-1">
                      Role Title
                    </label>
                    <input
                      type="text"
                      value={openRoleTitle}
                      onChange={(e) => setOpenRoleTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-200 focus:outline-hidden"
                      placeholder="e.g. PCB Layout Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-500 mb-1">
                      Required Skills
                    </label>
                    <input
                      type="text"
                      value={openRoleSkills}
                      onChange={(e) => setOpenRoleSkills(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-200 focus:outline-hidden"
                      placeholder="KiCad, High-Speed RF"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Publish to Showcase</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
