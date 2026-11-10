"use client";

import { useState } from "react";
import {
  UserDashboardData,
  ProjectItem,
  CollabApplication,
  ContestApplicationItem,
} from "@/lib/types/community";
import {
  Flame,
  Rocket,
  Award,
  Sparkles,
  GitPullRequest,
  Check,
  X,
  Plus,
  ExternalLink,
  Trash2,
  Calendar,
  CheckCircle2,
  LogOut,
  Trophy,
  XCircle,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { useAuth } from "@/components/auth/AuthProvider";

interface DashboardViewProps {
  userData: UserDashboardData;
  userProjects: ProjectItem[];
  userShipDates?: string[];
  collabApplications: CollabApplication[];
  contestApplications?: ContestApplicationItem[];
  onOpenListProject: () => void;
  onUpdateAppStatus: (appId: string, status: "Accepted" | "Declined") => void;
  onWithdrawContestApp?: (contestId: string) => void;
  onRemoveSavedSpec: (specId: string) => void;
}

export function DashboardView({
  userData,
  userProjects,
  userShipDates = [],
  collabApplications,
  contestApplications = [],
  onOpenListProject,
  onUpdateAppStatus,
  onWithdrawContestApp,
  onRemoveSavedSpec,
}: DashboardViewProps) {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "projects" | "contests" | "collabs" | "specs"
  >("projects");

  const today = new Date();
  const dateCounts: Record<string, number> = {};
  userShipDates.forEach((rawDate) => {
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      const key = parsed.toISOString().slice(0, 10);
      dateCounts[key] = (dateCounts[key] || 0) + 1;
    }
  });

  const heatmapDays = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (83 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      dayIndex: i,
      date: key,
      count: dateCounts[key] || 0,
    };
  });

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-16 h-16 rounded-xl ring-2 ring-blue-500/30 bg-slate-50 dark:bg-[#1a1b21] p-0.5 object-cover"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-[#e3e1e9]">
                  {userData.name}
                </h2>
                <span className="text-xs font-mono text-slate-500 dark:text-[#8c909f]">
                  @{userData.username}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent font-medium">
                  {userData.role}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#c2c6d6] mt-2 max-w-xl leading-relaxed">
                {userData.bio ||
                  "Hardware and systems engineer logging verifiable proof of work on Aevora Forge."}
              </p>

              {/* Tech Stack Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {userData.techStack.length > 0 ? (
                  userData.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b21] text-slate-700 dark:text-[#c2c6d6] border border-slate-200 dark:border-[#292a2f]"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 dark:text-[#8c909f]">
                    No stack tags defined yet
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links & Sign Out */}
          <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {userData.githubUrl && (
                <a
                  href={userData.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-500 hover:text-blue-600 dark:hover:text-[#adc6ff] transition-colors"
                  title="GitHub Profile"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={onOpenListProject}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List Build</span>
              </button>
            </div>

            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors border border-rose-200 dark:border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-[#1e1f25]">
          <div className="p-3 bg-slate-50 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f]">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#8c909f] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Active Streak</span>
              <Flame className="w-4 h-4 text-blue-600 dark:text-[#adc6ff]" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-[#e3e1e9] tabular-nums">
              {userData.streakCount} Days
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f]">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#8c909f] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Logged Ships</span>
              <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-[#e3e1e9] tabular-nums">
              {userData.totalShips} Logs
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f]">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#8c909f] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Builder XP</span>
              <Award className="w-4 h-4 text-blue-600 dark:text-[#adc6ff]" />
            </div>
            <div className="text-lg font-bold font-mono text-blue-600 dark:text-[#adc6ff] tabular-nums">
              {userData.xpPoints} XP
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f]">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#8c909f] mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Collab Requests</span>
              <GitPullRequest className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-[#e3e1e9] tabular-nums">
              {collabApplications.length} Active
            </div>
          </div>
        </div>
      </div>

      {/* Proof-of-Work Activity Heatmap */}
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-[#adc6ff]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-[#c2c6d6]">
              Proof-of-Work Activity Heatmap (Last 12 Weeks)
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-[#8c909f]">
            <span>Less</span>
            <div className="w-2.5 h-2.5 bg-slate-100 dark:bg-[#1a1b21] rounded-xs border border-slate-200 dark:border-[#292a2f]" />
            <div className="w-2.5 h-2.5 bg-blue-200 dark:bg-blue-950 rounded-xs border border-blue-300 dark:border-blue-800" />
            <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-blue-600 rounded-xs" />
            <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-[#adc6ff] rounded-xs" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
            {heatmapDays.map((d) => {
              const bgClass =
                d.count === 0
                  ? "bg-slate-100 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f]"
                  : d.count === 1
                  ? "bg-blue-200 dark:bg-blue-950 border border-blue-300 dark:border-blue-800"
                  : d.count === 2
                  ? "bg-blue-500 dark:bg-blue-600"
                  : "bg-blue-600 dark:bg-[#adc6ff]";
              return (
                <div
                  key={d.dayIndex}
                  className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 ${bgClass}`}
                  title={`${d.date}: ${d.count} verified ships`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Dashboard Section Switcher */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-[#1e1f25] pb-2">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === "projects"
              ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-slate-200 dark:border-transparent font-semibold shadow-xs"
              : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>My Listed Builds ({userProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("contests")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === "contests"
              ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-slate-200 dark:border-transparent font-semibold shadow-xs"
              : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Contest Applications ({contestApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("collabs")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === "collabs"
              ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-slate-200 dark:border-transparent font-semibold shadow-xs"
              : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Collab Requests ({collabApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("specs")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === "specs"
              ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-slate-200 dark:border-transparent font-semibold shadow-xs"
              : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
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
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-8 text-center space-y-2 shadow-xs">
              <Rocket className="w-8 h-8 text-blue-600 dark:text-[#adc6ff] mx-auto" />
              <p className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
                No builds listed yet
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono">
                List your hardware or systems repo to find teammates and recruit collaborators.
              </p>
              <button
                onClick={onOpenListProject}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
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
                  className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent font-medium">
                        {proj.status}
                      </span>
                      {proj.lookingForCollab && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border border-slate-200 dark:border-[#292a2f]">
                          Recruiting Collaborators
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-[#8c909f] mt-1 line-clamp-2">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b21] text-slate-700 dark:text-[#c2c6d6] border border-slate-200 dark:border-[#292a2f]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1e1f25] flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-slate-500 dark:text-[#8c909f]">
                      Shipped: {proj.shippedAt}
                    </span>
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-[#adc6ff] font-mono text-[11px] transition-colors"
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

      {/* TAB 2: CONTEST APPLICATIONS */}
      {activeTab === "contests" && (
        <div className="space-y-3">
          {contestApplications.length === 0 ? (
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-8 text-center space-y-2 shadow-xs">
              <Trophy className="w-8 h-8 text-blue-600 dark:text-[#adc6ff] mx-auto" />
              <p className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
                No contest applications yet
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono">
                Open Contests &amp; Sprints in the sidebar to submit a project proposal for admin review.
              </p>
            </div>
          ) : (
            contestApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                        {app.projectTitle}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                          app.status === "approved"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                            : app.status === "rejected" || app.status === "withdrawn"
                            ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                            : app.status === "waitlisted"
                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
                            : "bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border-blue-200 dark:border-blue-500/30"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-blue-600 dark:text-[#adc6ff] mt-0.5">
                      Contest: {app.contestTitle || app.contestId}
                      {app.teamName ? ` · Team: ${app.teamName}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.repoUrl && (
                      <a
                        href={app.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-[11px] font-mono text-slate-600 dark:text-[#c2c6d6] hover:text-blue-600"
                      >
                        <span>Repo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {app.status === "pending" && onWithdrawContestApp && (
                      <button
                        onClick={() => onWithdrawContestApp(app.contestId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1a1b21] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-[#c2c6d6] hover:text-rose-600 text-[11px] font-mono border border-slate-200 dark:border-[#292a2f]"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs font-mono text-slate-600 dark:text-[#c2c6d6] bg-slate-50 dark:bg-[#1a1b21] p-3 rounded-md border border-slate-200 dark:border-[#292a2f] whitespace-pre-wrap">
                  {app.pitch}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COLLAB APPLICATIONS */}
      {activeTab === "collabs" && (
        <div className="space-y-3">
          {collabApplications.length === 0 ? (
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-8 text-center space-y-2 shadow-xs">
              <GitPullRequest className="w-8 h-8 text-blue-600 dark:text-[#adc6ff] mx-auto" />
              <p className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
                No collaboration requests
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono">
                When fellow builders apply to join your projects, requests will appear here for your review.
              </p>
            </div>
          ) : (
            collabApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={app.applicant.avatar}
                    alt={app.applicant.name}
                    className="w-10 h-10 rounded-full ring-1 ring-slate-200 dark:ring-[#424754] object-cover bg-slate-50 dark:bg-[#1a1b21] mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-[#e3e1e9]">
                        {app.applicant.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-[#8c909f]">
                        @{app.applicant.username}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border border-slate-200 dark:border-[#292a2f]">
                        {app.applicant.roleTag}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-[#8c909f]">
                        • {app.timestamp}
                      </span>
                    </div>

                    <div className="text-xs mt-1 text-slate-700 dark:text-[#c2c6d6] font-mono">
                      Applied for{" "}
                      <span className="font-bold text-blue-600 dark:text-[#adc6ff]">
                        {app.roleApplied}
                      </span>{" "}
                      on{" "}
                      <span className="text-slate-900 dark:text-[#e3e1e9] font-semibold">
                        {app.projectTitle}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-[#c2c6d6] mt-2 bg-slate-50 dark:bg-[#1a1b21] p-2.5 rounded-md border border-slate-200 dark:border-[#292a2f] font-mono">
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => onUpdateAppStatus(app.id, "Declined")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-[#1a1b21] hover:bg-slate-200 dark:hover:bg-[#292a2f] text-slate-700 dark:text-[#c2c6d6] text-xs font-medium rounded-md transition-colors border border-slate-200 dark:border-[#292a2f]"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium ${
                        app.status === "Accepted"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                          : "bg-slate-100 dark:bg-[#1a1b21] text-slate-500 dark:text-[#8c909f] border border-slate-200 dark:border-[#292a2f]"
                      }`}
                    >
                      {app.status === "Accepted" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
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
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-8 text-center space-y-2 shadow-xs">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-[#adc6ff] mx-auto" />
              <p className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
                No saved build blueprints
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono">
                Use the AI Idea Generator in the sidebar to architect a build plan and save it directly to Supabase.
              </p>
            </div>
          ) : (
            userData.savedSpecs.map((spec) => (
              <div
                key={spec.id}
                className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent font-medium">
                        {spec.domain}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border border-slate-200 dark:border-[#292a2f]">
                        {spec.difficulty}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-[#8c909f]">
                        Saved in Supabase
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                      {spec.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => onRemoveSavedSpec(spec.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                    title="Remove from saved specs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 dark:text-[#c2c6d6] font-mono bg-[#e8eef5]/60 dark:bg-[#1a1b21] p-3 rounded-md border border-slate-300/60 dark:border-[#292a2f]">
                  {spec.problemStatement}
                </p>

                {/* BOM Summary */}
                <div>
                  <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-[#8c909f] uppercase tracking-wider mb-1.5">
                    Hardware BOM:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {spec.bom.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f] text-[11px] font-mono"
                      >
                        <div className="font-bold text-slate-900 dark:text-[#e3e1e9]">
                          {b.item}
                        </div>
                        <div className="text-slate-500 dark:text-[#8c909f] text-[10px] mt-0.5">
                          {b.purpose}
                        </div>
                        <div className="text-blue-600 dark:text-[#adc6ff] font-semibold mt-1 tabular-nums">
                          {b.estimatedCost}
                        </div>
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
