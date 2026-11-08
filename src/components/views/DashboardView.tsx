"use client";

import { useState } from "react";
import {
  UserDashboardData,
  ProjectItem,
  CollabApplication,
  AISpec,
} from "@/lib/types/community";
import {
  User,
  Flame,
  Rocket,
  Award,
  Sparkles,
  GitPullRequest,
  Check,
  X,
  Plus,
  ExternalLink,
  Layers,
  Code,
  Trash2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { GithubIcon, DiscordIcon } from "@/components/ui/Icons";

interface DashboardViewProps {
  userData: UserDashboardData;
  userProjects: ProjectItem[];
  collabApplications: CollabApplication[];
  onOpenListProject: () => void;
  onUpdateAppStatus: (appId: string, status: "Accepted" | "Declined") => void;
  onRemoveSavedSpec: (specId: string) => void;
}

export function DashboardView({
  userData,
  userProjects,
  collabApplications,
  onOpenListProject,
  onUpdateAppStatus,
  onRemoveSavedSpec,
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "collabs" | "specs">("projects");

  // Generate synthetic 12-week heatmap data (7 days x 12 weeks)
  const heatmapDays = Array.from({ length: 84 }, (_, i) => {
    // Generate realistic shipping density pattern
    const isWeekend = i % 7 === 0 || i % 7 === 6;
    const randomVal = (i * 17 + 23) % 10;
    let count = 0;
    if (randomVal > 7) count = 3;
    else if (randomVal > 4) count = 2;
    else if (randomVal > 2) count = 1;
    if (isWeekend && count > 0) count -= 1;
    return {
      dayIndex: i,
      count,
    };
  });

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-16 h-16 rounded-xl border-2 border-emerald-500/20 bg-slate-100 p-0.5"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{userData.name}</h2>
                <span className="text-xs font-mono text-slate-500">@{userData.username}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  {userData.role}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 max-w-xl leading-relaxed">
                {userData.bio}
              </p>

              {/* Tech Stack Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {userData.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links & CTA */}
          <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <a
                href={userData.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                title="GitHub Profile"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <div
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                title={`Discord: ${userData.discordHandle}`}
              >
                <DiscordIcon className="w-4 h-4" />
              </div>
            </div>

            <button
              onClick={onOpenListProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List Project</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Active Streak</span>
              <Flame className="w-4 h-4 text-orange-600 fill-orange-600" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {userData.streakCount} Days
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Total Ships</span>
              <Rocket className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {userData.totalShips} Logs
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Builder XP</span>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {userData.xpPoints} XP
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Collab Requests</span>
              <GitPullRequest className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {collabApplications.length} Pending
            </div>
          </div>
        </div>
      </div>

      {/* GitHub-style Proof-of-Work Contribution Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Proof-of-Work Activity Heatmap (Last 12 Weeks)
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
            <span>Less</span>
            <div className="w-2.5 h-2.5 bg-slate-100 rounded-xs border border-slate-200" />
            <div className="w-2.5 h-2.5 bg-emerald-200 rounded-xs" />
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-xs" />
            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-xs" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
            {heatmapDays.map((d) => {
              const bgClass =
                d.count === 0
                  ? "bg-slate-100 border border-slate-200/60"
                  : d.count === 1
                  ? "bg-emerald-200"
                  : d.count === 2
                  ? "bg-emerald-400"
                  : "bg-emerald-600";
              return (
                <div
                  key={d.dayIndex}
                  className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 ${bgClass}`}
                  title={`${d.count} ship logs`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Dashboard Section Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "projects"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>My Active Projects ({userProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("collabs")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "collabs"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Collab Requests ({collabApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("specs")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "specs"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Saved AI Specs ({userData.savedSpecs.length})</span>
        </button>
      </div>

      {/* TAB 1: MY ACTIVE PROJECTS */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {userProjects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <Rocket className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No active projects listed yet</p>
              <p className="text-xs text-slate-500 mt-1">List your hardware or software repo to find teammates</p>
              <button
                onClick={onOpenListProject}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                List Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        {proj.status}
                      </span>
                      {proj.lookingForCollab && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Recruiting Collaborators
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{proj.description}</p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-slate-500">
                      Shipped: {proj.shippedAt}
                    </span>
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-600 font-mono text-[11px] transition-colors"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>Source</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COLLAB APPLICATIONS */}
      {activeTab === "collabs" && (
        <div className="space-y-3">
          {collabApplications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <GitPullRequest className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No collaboration requests</p>
              <p className="text-xs text-slate-500 mt-1">
                When builders apply to join your projects, requests will appear here.
              </p>
            </div>
          ) : (
            collabApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={app.applicant.avatar}
                    alt={app.applicant.name}
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {app.applicant.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        @{app.applicant.username}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {app.applicant.roleTag}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        • {app.timestamp}
                      </span>
                    </div>

                    <div className="text-xs mt-1 text-slate-700">
                      Applied for <span className="font-bold text-slate-900">{app.roleApplied}</span> on{" "}
                      <span className="text-emerald-700 font-semibold">{app.projectTitle}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                      &quot;{app.pitch}&quot;
                    </p>
                  </div>
                </div>

                {/* Actions & Status */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {app.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => onUpdateAppStatus(app.id, "Accepted")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => onUpdateAppStatus(app.id, "Declined")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-medium ${
                        app.status === "Accepted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {app.status === "Accepted" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {app.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: SAVED AI BUILD SPECS */}
      {activeTab === "specs" && (
        <div className="space-y-4">
          {userData.savedSpecs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No saved build blueprints</p>
              <p className="text-xs text-slate-500 mt-1">
                Use the AI Idea & Spec Generator in the sidebar to architect a build plan and save it here.
              </p>
            </div>
          ) : (
            userData.savedSpecs.map((spec) => (
              <div
                key={spec.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {spec.domain}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {spec.difficulty}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Saved {spec.generatedAt}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{spec.title}</h4>
                  </div>

                  <button
                    onClick={() => onRemoveSavedSpec(spec.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="Remove from saved specs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {spec.problemStatement}
                </p>

                {/* BOM Summary */}
                <div>
                  <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Hardware BOM:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {spec.bom.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono"
                      >
                        <div className="font-bold text-slate-900">{b.item}</div>
                        <div className="text-slate-500 text-[10px] mt-0.5">{b.purpose}</div>
                        <div className="text-emerald-700 font-semibold mt-1">{b.estimatedCost}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
