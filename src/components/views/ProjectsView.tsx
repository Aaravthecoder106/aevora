"use client";

import React, { useState } from "react";
import {
  Rocket,
  Plus,
  Users,
  ExternalLink,
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
      {/* Top Banner & Actions */}
      <div className="bg-white dark:bg-[#0d0e13] rounded-lg p-5 border border-slate-200 dark:border-[#1e1f25] shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-blue-600 dark:text-[#adc6ff] bg-blue-50 dark:bg-[#292a2f] border border-blue-200/70 dark:border-transparent mb-1.5">
              <Rocket className="w-3.5 h-3.5" />
              <span>PROJECT SHOWCASE &amp; RECRUITMENT</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#e3e1e9] tracking-tight">
              Community Hardware &amp; AI Builds
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#8c909f] font-mono mt-1">
              Real open-source electronics, custom boards, and deep systems code. Team up with builders looking for specialized talent.
            </p>
          </div>

          <button
            onClick={onOpenListProjectModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>List Your Build</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#1e1f25]">
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
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all border ${
                  statusFilter === tab.id
                    ? "bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border-blue-200 dark:border-transparent font-semibold"
                    : "bg-slate-50 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border-slate-200 dark:border-[#292a2f] hover:text-slate-900 dark:hover:text-white"
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
            className="px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] placeholder:text-slate-400 dark:placeholder:text-[#8c909f] focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Projects Grid or Clean Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] flex items-center justify-center mx-auto">
            <Rocket className="w-6 h-6 text-blue-600 dark:text-[#adc6ff]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
              No builds found
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono max-w-md mx-auto leading-relaxed">
              No projects have been listed yet. Showcase your custom electronics, PCB schematic, or local AI pipeline and recruit teammates.
            </p>
          </div>
          <button
            onClick={onOpenListProjectModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md transition-colors shadow-xs"
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
              className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-[#292a2f] transition-all group"
            >
              <div>
                {/* Header: Status and Collab Indicator */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                      project.status === "Shipped"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                        : project.status === "Beta"
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-[#adc6ff] border-blue-200 dark:border-blue-500/30"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {project.status}
                  </span>

                  {project.lookingForCollab && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent font-medium">
                      <Users className="w-3 h-3" />
                      Recruiting Team
                    </span>
                  )}
                </div>

                {/* Title & Tagline */}
                <h3 className="text-base font-bold text-slate-900 dark:text-[#e3e1e9] group-hover:text-blue-600 dark:group-hover:text-[#adc6ff] transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#c2c6d6] font-mono mt-1 font-medium">
                  {project.tagline}
                </p>
                <p className="text-xs text-slate-500 dark:text-[#8c909f] mt-2 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Stack Chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b21] text-slate-700 dark:text-[#c2c6d6] border border-slate-200 dark:border-[#292a2f]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Open Collaborator Roles */}
                {project.lookingForCollab && project.openRoles.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
                      <span>Open Positions:</span>
                      <span className="text-blue-600 dark:text-[#adc6ff]">
                        {project.openRoles.length} Available
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {project.openRoles.map((role, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] text-xs"
                        >
                          <div>
                            <div className="font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
                              {role.role}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 dark:text-[#8c909f]">
                              Skills: {role.skills.join(", ")}
                            </div>
                          </div>

                          <button
                            onClick={() => onRequestCollab(project, role.role)}
                            className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-blue-50 dark:bg-[#292a2f] hover:bg-blue-600 dark:hover:bg-blue-600 text-blue-600 dark:text-[#adc6ff] hover:text-white border border-blue-200 dark:border-transparent rounded transition-colors"
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
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#1e1f25] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={project.owner.avatar}
                    alt={project.owner.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-[#424754] bg-slate-100 dark:bg-[#1a1b21]"
                  />
                  <span className="text-xs font-mono text-slate-500 dark:text-[#8c909f]">
                    by{" "}
                    <span className="text-slate-900 dark:text-[#e3e1e9] font-semibold">
                      @{project.owner.username}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded text-slate-400 hover:text-blue-600 dark:hover:text-[#adc6ff] hover:bg-slate-100 dark:hover:bg-[#1a1b21] transition-colors"
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
                      className="p-1.5 rounded text-slate-400 hover:text-blue-600 dark:hover:text-[#adc6ff] hover:bg-slate-100 dark:hover:bg-[#1a1b21] transition-colors"
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
