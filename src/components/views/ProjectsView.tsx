"use client";

import React, { useState } from "react";
import {
  Rocket,
  Plus,
  Users,
  Globe,
  ExternalLink,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Layers,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { ProjectItem } from "@/lib/types/community";

interface ProjectsViewProps {
  projects: ProjectItem[];
  onRequestCollab: (project: ProjectItem, roleTitle: string) => void;
  onOpenListProjectModal: () => void;
}

export function ProjectsView({
  projects,
  onRequestCollab,
  onOpenListProjectModal,
}: ProjectsViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((project) => {
    if (statusFilter === "collab" && !project.lookingForCollab) return false;
    if (statusFilter === "Prototype" && project.status !== "Prototype") return false;
    if (statusFilter === "Beta" && project.status !== "Beta") return false;
    if (statusFilter === "Shipped" && project.status !== "Shipped") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = project.title.toLowerCase().includes(q);
      const matchTech = project.techStack.some((t) => t.toLowerCase().includes(q));
      const matchDesc = project.description.toLowerCase().includes(q);
      if (!matchTitle && !matchTech && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium text-blue-400 bg-blue-950/40 border border-blue-500/30 mb-1.5">
              <Rocket className="w-3.5 h-3.5 text-blue-400" />
              <span>PROJECT SHOWCASE & RECRUITMENT</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
              Community Hardware & AI Builds
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Real open-source electronics, custom boards, and deep systems code. Team up with builders looking for specialized talent.
            </p>
          </div>

          <button
            onClick={onOpenListProjectModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-colors shadow-lg shadow-emerald-950/40 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ List Your Build</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Builds" },
              { id: "collab", label: "Open Roles" },
              { id: "Prototype", label: "Prototypes" },
              { id: "Beta", label: "Beta" },
              { id: "Shipped", label: "Shipped" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all border ${
                  statusFilter === tab.id
                    ? "bg-zinc-800 text-zinc-100 border-zinc-700 font-semibold"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, stack (ESP32, Rust, KiCad)..."
            className="px-3 py-1.5 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Projects Grid or Clean Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Rocket className="w-6 h-6 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-mono font-bold text-zinc-300">
              No builds found
            </h3>
            <p className="text-xs text-zinc-500 font-mono max-w-md mx-auto leading-relaxed">
              No projects have been listed yet. Showcase your custom electronics, PCB schematic, or local AI pipeline and recruit teammates.
            </p>
          </div>
          <button
            onClick={onOpenListProjectModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>List Your Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-zinc-700 transition-all group"
            >
              <div>
                {/* Header: Status and Collab Indicator */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                      project.status === "Shipped"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                        : project.status === "Beta"
                        ? "bg-blue-950/40 text-blue-400 border-blue-500/30"
                        : "bg-amber-950/40 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {project.status}
                  </span>

                  {project.lookingForCollab && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/40 text-purple-300 border border-purple-500/30">
                      <Users className="w-3 h-3 text-purple-400" />
                      Recruiting Team
                    </span>
                  )}
                </div>

                {/* Title & Tagline */}
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-zinc-300 font-mono mt-1 font-medium">
                  {project.tagline}
                </p>
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed font-sans">
                  {project.description}
                </p>

                {/* Tech Stack Chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Open Collaborator Roles */}
                {project.lookingForCollab && project.openRoles.length > 0 && (
                  <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      <span>Open Positions:</span>
                      <span className="text-purple-400">{project.openRoles.length} Available</span>
                    </div>

                    <div className="space-y-1.5">
                      {project.openRoles.map((role, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 text-xs"
                        >
                          <div>
                            <div className="font-mono font-bold text-zinc-200">
                              {role.role}
                            </div>
                            <div className="text-[10px] font-mono text-zinc-500">
                              Skills: {role.skills.join(", ")}
                            </div>
                          </div>

                          <button
                            onClick={() => onRequestCollab(project, role.role)}
                            className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 rounded transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer: Owner info & Source links */}
              <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={project.owner.avatar}
                    alt={project.owner.name}
                    className="w-6 h-6 rounded-full object-cover border border-zinc-800 bg-zinc-950"
                  />
                  <span className="text-xs font-mono text-zinc-400">
                    by <span className="text-zinc-200 font-semibold">@{project.owner.username}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                      title="GitHub Repository"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
