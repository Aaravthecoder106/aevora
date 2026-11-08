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
    <div className="space-y-4">
      {/* Top Header & Action Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-600" />
              <span>Project Showcase & Team Collaboration</span>
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Verified hardware prototypes, firmware builds, and open-source systems seeking co-builders.
            </p>
          </div>

          <button
            onClick={onOpenListProjectModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>List Project</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white font-medium"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter("collab")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                statusFilter === "collab"
                  ? "bg-emerald-700 text-white font-medium"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <Users className="w-3 h-3 text-emerald-600" />
              <span>Open Roles ({projects.filter((p) => p.lookingForCollab).length})</span>
            </button>
            <button
              onClick={() => setStatusFilter("Prototype")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "Prototype"
                  ? "bg-slate-900 text-white font-medium"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              Prototypes
            </button>
            <button
              onClick={() => setStatusFilter("Shipped")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "Shipped"
                  ? "bg-slate-900 text-white font-medium"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              Shipped
            </button>
          </div>

          <div className="w-full sm:w-52">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stack, title..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header: Title, Status Pill, Owner */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                      {project.title}
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                        project.status === "Shipped"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : project.status === "Beta"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                    {project.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <img
                    src={project.owner.avatar}
                    alt={project.owner.username}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-700 leading-relaxed font-sans line-clamp-3">
                {project.description}
              </p>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Open Roles & Collaboration Callout */}
              {project.lookingForCollab && project.openRoles.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      <span>OPEN ROLES FOR CO-BUILDERS</span>
                    </span>
                    <span className="text-[10px] text-emerald-700">Apply to join</span>
                  </div>

                  <div className="space-y-1.5">
                    {project.openRoles.map((role) => (
                      <div
                        key={role.role}
                        className="flex items-center justify-between gap-2 p-1.5 rounded bg-white border border-emerald-100 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-[11px] truncate">
                            {role.role}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 truncate">
                            Skills: {role.skills.join(", ")}
                          </p>
                        </div>
                        <button
                          onClick={() => onRequestCollab(project, role.role)}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-medium shrink-0 shadow-xs"
                        >
                          Request to Collab
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer: Repo Link, Stars, Date */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
              <div className="flex items-center gap-3">
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>Repository</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Clock className="w-3 h-3" />
                <span>{project.shippedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
