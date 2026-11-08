"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Zap,
  Trophy,
  Filter,
  Layers,
  Sparkles,
  Rocket,
  User,
  ShieldCheck,
  Radio,
  Tag,
  Plus,
  Clock,
  ExternalLink,
  Terminal,
  Compass,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import confetti from "canvas-confetti";
import { GithubIcon } from "@/components/ui/Icons";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

// Types
import {
  ViewMode,
  ShipPost,
  Comment,
  ProjectItem,
  ChallengeItem,
  BlueprintItem,
  ResourceTool,
  AISpec,
  CollabApplication,
  UserDashboardData,
} from "@/lib/types/community";

// Mock Data
import {
  INITIAL_COMMUNITY_POSTS,
  INITIAL_PROJECTS,
  INITIAL_CHALLENGES,
  INITIAL_BLUEPRINTS,
  INITIAL_RESOURCES,
  MONTHLY_LEADERBOARD,
  INITIAL_USER_DASHBOARD,
} from "@/lib/data/mockCommunityData";

// View Components
import { FeedView } from "@/components/views/FeedView";
import { ProjectsView } from "@/components/views/ProjectsView";
import { ChallengesView } from "@/components/views/ChallengesView";
import { BlueprintsView } from "@/components/views/BlueprintsView";
import { AIGeneratorView } from "@/components/views/AIGeneratorView";
import { LeaderboardView } from "@/components/views/LeaderboardView";
import { DashboardView } from "@/components/views/DashboardView";

// Modal Components
import { RulesModal } from "@/components/modals/RulesModal";
import { CollabModal } from "@/components/modals/CollabModal";
import { ListProjectModal } from "@/components/modals/ListProjectModal";
import { SubmitBuildModal } from "@/components/modals/SubmitBuildModal";
import { formatCountdown } from "@/lib/utils";

export default function CommunityPage() {
  const { user, profile } = useAuth();

  // Active View State
  const [activeView, setActiveView] = useState<ViewMode>("feed");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // State with LocalStorage fallbacks
  const [posts, setPosts] = useState<ShipPost[]>(INITIAL_COMMUNITY_POSTS);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [challenges, setChallenges] = useState<ChallengeItem[]>(INITIAL_CHALLENGES);
  const [blueprints] = useState<BlueprintItem[]>(INITIAL_BLUEPRINTS);
  const [resources] = useState<ResourceTool[]>(INITIAL_RESOURCES);
  const [userData, setUserData] = useState<UserDashboardData>(INITIAL_USER_DASHBOARD);
  const [collabApplications, setCollabApplications] = useState<CollabApplication[]>(
    INITIAL_USER_DASHBOARD.collabApplications
  );

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isListProjectOpen, setIsListProjectOpen] = useState(false);
  const [isSubmitBuildOpen, setIsSubmitBuildOpen] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [selectedCollabProject, setSelectedCollabProject] = useState<ProjectItem | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");

  // Countdown timer string (safe for SSR)
  const [activeSprintCountdown, setActiveSprintCountdown] = useState<string>("");

  // Hydrate state from localStorage on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedPosts = localStorage.getItem("remorph_posts");
      if (storedPosts) setPosts(JSON.parse(storedPosts));

      const storedProjects = localStorage.getItem("remorph_projects");
      if (storedProjects) setProjects(JSON.parse(storedProjects));

      const storedChallenges = localStorage.getItem("remorph_challenges");
      if (storedChallenges) setChallenges(JSON.parse(storedChallenges));

      const storedUser = localStorage.getItem("remorph_user");
      if (storedUser) setUserData(JSON.parse(storedUser));

      const storedApps = localStorage.getItem("remorph_collab_apps");
      if (storedApps) setCollabApplications(JSON.parse(storedApps));
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
  }, []);

  // Update countdown timer safely on client
  useEffect(() => {
    const activeChallenge = challenges.find((c) => c.status === "active");
    if (activeChallenge) {
      setActiveSprintCountdown(formatCountdown(activeChallenge.endsAt));
      const interval = setInterval(() => {
        setActiveSprintCountdown(formatCountdown(activeChallenge.endsAt));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [challenges]);

  // Sync state helpers
  const savePosts = (newPosts: ShipPost[]) => {
    setPosts(newPosts);
    if (typeof window !== "undefined") {
      localStorage.setItem("remorph_posts", JSON.stringify(newPosts));
    }
  };

  const saveProjects = (newProjects: ProjectItem[]) => {
    setProjects(newProjects);
    if (typeof window !== "undefined") {
      localStorage.setItem("remorph_projects", JSON.stringify(newProjects));
    }
  };

  const saveUserData = (newData: UserDashboardData) => {
    setUserData(newData);
    if (typeof window !== "undefined") {
      localStorage.setItem("remorph_user", JSON.stringify(newData));
    }
  };

  const saveCollabApplications = (newApps: CollabApplication[]) => {
    setCollabApplications(newApps);
    if (typeof window !== "undefined") {
      localStorage.setItem("remorph_collab_apps", JSON.stringify(newApps));
    }
  };

  // HANDLERS
  const handleAddPost = (newPost: ShipPost) => {
    const updated = [newPost, ...posts];
    savePosts(updated);

    // Update user stats
    const updatedUser = {
      ...userData,
      totalShips: userData.totalShips + 1,
      xpPoints: userData.xpPoints + 50,
      streakCount: userData.streakCount + 1,
    };
    saveUserData(updatedUser);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#10b981", "#3b82f6", "#f59e0b"],
    });
  };

  const handleToggleUpvote = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const hasUpvoted = !p.hasUpvoted;
        return {
          ...p,
          hasUpvoted,
          upvotes: hasUpvoted ? p.upvotes + 1 : p.upvotes - 1,
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const handleAddComment = (postId: string, comment: Comment) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, comment],
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const handleListProject = (newProject: ProjectItem) => {
    const updated = [newProject, ...projects];
    saveProjects(updated);

    const updatedUser = {
      ...userData,
      xpPoints: userData.xpPoints + 100,
    };
    saveUserData(updatedUser);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 },
      colors: ["#10b981", "#6366f1"],
    });
  };

  const handleOpenCollabModal = (project: ProjectItem) => {
    setSelectedCollabProject(project);
    setIsCollabOpen(true);
  };

  const handleSubmitCollabApplication = (application: CollabApplication) => {
    const updatedApps = [application, ...collabApplications];
    saveCollabApplications(updatedApps);

    const updatedUser = {
      ...userData,
      collabApplications: [application, ...userData.collabApplications],
    };
    saveUserData(updatedUser);
  };

  const handleUpdateAppStatus = (appId: string, status: "Accepted" | "Declined") => {
    const updated = collabApplications.map((app) =>
      app.id === appId ? { ...app, status } : app
    );
    saveCollabApplications(updated);

    const updatedUser = {
      ...userData,
      collabApplications: updated,
    };
    saveUserData(updatedUser);
  };

  const handleSubmitBuildLog = (post: ShipPost, challengeId: string) => {
    // Append to feed
    handleAddPost(post);

    // Increment challenge submission count
    const updatedChallenges = challenges.map((c) =>
      c.id === challengeId ? { ...c, submissionsCount: c.submissionsCount + 1 } : c
    );
    setChallenges(updatedChallenges);
    if (typeof window !== "undefined") {
      localStorage.setItem("remorph_challenges", JSON.stringify(updatedChallenges));
    }
  };

  const handleSaveAISpec = (spec: AISpec) => {
    if (userData.savedSpecs.some((s) => s.id === spec.id)) return;
    const updatedSpecs = [spec, ...userData.savedSpecs];
    const updatedUser = {
      ...userData,
      savedSpecs: updatedSpecs,
      xpPoints: userData.xpPoints + 25,
    };
    saveUserData(updatedUser);
  };

  const handleRemoveSavedSpec = (specId: string) => {
    const updatedSpecs = userData.savedSpecs.filter((s) => s.id !== specId);
    const updatedUser = {
      ...userData,
      savedSpecs: updatedSpecs,
    };
    saveUserData(updatedUser);
  };

  // Nav item list
  const navItems = [
    {
      id: "feed" as ViewMode,
      label: "Live Ship Feed & Forums",
      icon: Radio,
      badge: `${posts.length}`,
      accent: "text-emerald-600",
    },
    {
      id: "projects" as ViewMode,
      label: "Project Showcase & Collab",
      icon: Rocket,
      badge: `${projects.length}`,
      accent: "text-blue-600",
    },
    {
      id: "challenges" as ViewMode,
      label: "Sprints & Challenges",
      icon: Zap,
      badge: "Active",
      accent: "text-amber-600",
    },
    {
      id: "blueprints" as ViewMode,
      label: "Blueprint Library & Tools",
      icon: Layers,
      badge: `${blueprints.length}`,
      accent: "text-indigo-600",
    },
    {
      id: "ai-generator" as ViewMode,
      label: "AI Idea & Spec Engine",
      icon: Sparkles,
      badge: "New",
      accent: "text-purple-600",
    },
    {
      id: "leaderboard" as ViewMode,
      label: "Monthly Leaderboards",
      icon: Trophy,
      badge: "#1",
      accent: "text-amber-600",
    },
    {
      id: "dashboard" as ViewMode,
      label: "My Builder Dashboard",
      icon: User,
      badge: `${userData.streakCount}d`,
      accent: "text-emerald-600",
    },
  ];

  const popularTags = [
    "#hardware",
    "#nextjs",
    "#ai",
    "#pcb",
    "#cyberdeck",
    "#embedded",
    "#rust",
  ];

  const activeSprint = challenges.find((c) => c.status === "active") || challenges[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* LEFT SIDEBAR: Persistent Module Navigation & Filters   */}
          {/* ======================================================== */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
            {/* Core View Switcher Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs space-y-1">
              <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Workspace Modules
              </div>
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-emerald-400" : item.accent
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                          isActive
                            ? "bg-slate-800 text-emerald-400"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Tag Filter Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Telemetry Tags
                </span>
                {selectedTag !== "all" && (
                  <button
                    onClick={() => setSelectedTag("all")}
                    className="text-[10px] text-emerald-700 hover:underline capitalize"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    setSelectedTag("all");
                    setActiveView("feed");
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md font-mono transition-all border ${
                    selectedTag === "all"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  #all
                </button>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setActiveView("feed");
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md font-mono transition-all border ${
                      selectedTag === tag
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules & Manifesto Trigger Card */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Proof-of-Work Standards
                </h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                Rule #1: Post real commits & schematics, zero vaporware. Peer review over hype.
              </p>
              <button
                onClick={() => setIsRulesOpen(true)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono font-medium transition-colors border border-slate-700 text-center"
              >
                Read Community Manifesto
              </button>
            </div>

            {/* Builder Account Pill */}
            <div
              onClick={() => setActiveView("dashboard")}
              className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                    {userData.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    @{userData.username}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200 shrink-0">
                <Flame className="w-3.5 h-3.5 fill-orange-600" />
                <span>{userData.streakCount}d</span>
              </div>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* CENTER COLUMN: Interactive Multi-View Main Workspace     */}
          {/* ======================================================== */}
          <main className="lg:col-span-6 space-y-6 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {/* 1. FEED & DISCUSSION VIEW */}
                {activeView === "feed" && (
                  <FeedView
                    posts={posts}
                    onAddPost={handleAddPost}
                    onToggleUpvote={handleToggleUpvote}
                    onAddComment={handleAddComment}
                    selectedTag={selectedTag}
                    onSelectTag={setSelectedTag}
                    userProfile={{
                      name: userData.name,
                      username: userData.username,
                      avatar: userData.avatar,
                      streak: userData.streakCount,
                    }}
                  />
                )}

                {/* 2. PROJECT SHOWCASE & TEAM COLLAB VIEW */}
                {activeView === "projects" && (
                  <ProjectsView
                    projects={projects}
                    onRequestCollab={handleOpenCollabModal}
                    onOpenListProjectModal={() => setIsListProjectOpen(true)}
                  />
                )}

                {/* 3. SPRINTS & CHALLENGES VIEW */}
                {activeView === "challenges" && (
                  <ChallengesView
                    challenges={challenges}
                    onSubmitBuild={(ch) => {
                      setSelectedChallengeId(ch.id);
                      setIsSubmitBuildOpen(true);
                    }}
                  />
                )}

                {/* 4. BLUEPRINT LIBRARY & RESOURCES VIEW */}
                {activeView === "blueprints" && (
                  <BlueprintsView blueprints={blueprints} resources={resources} />
                )}

                {/* 5. AI IDEA & SPEC GENERATOR VIEW */}
                {activeView === "ai-generator" && (
                  <AIGeneratorView
                    onSaveSpec={handleSaveAISpec}
                    savedSpecIds={userData.savedSpecs.map((s) => s.id)}
                  />
                )}

                {/* 6. MONTHLY LEADERBOARD VIEW */}
                {activeView === "leaderboard" && (
                  <LeaderboardView monthlyData={MONTHLY_LEADERBOARD} />
                )}

                {/* 7. BUILDER DASHBOARD & ACCOUNT VIEW */}
                {activeView === "dashboard" && (
                  <DashboardView
                    userData={userData}
                    userProjects={projects.filter(
                      (p) => p.owner.username === userData.username
                    )}
                    collabApplications={collabApplications}
                    onOpenListProject={() => setIsListProjectOpen(true)}
                    onUpdateAppStatus={handleUpdateAppStatus}
                    onRemoveSavedSpec={handleRemoveSavedSpec}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* ======================================================== */}
          {/* RIGHT SIDEBAR: Active Sprint, Top Streaks, Actions       */}
          {/* ======================================================== */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
            {/* Active Sprint Widget */}
            {activeSprint && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    Active Sprint
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activeSprintCountdown || "Calculating..."}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {activeSprint.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {activeSprint.tagline}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Prize Grant:</span>
                    <span className="font-bold text-slate-900">{activeSprint.prizePool}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Verified Ships:</span>
                    <span className="font-bold text-emerald-700">
                      {activeSprint.submissionsCount} / {activeSprint.maxSlots || 50}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (activeSprint.submissionsCount / (activeSprint.maxSlots || 50)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedChallengeId(activeSprint.id);
                    setIsSubmitBuildOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Sprint Build</span>
                </button>
              </div>
            )}

            {/* Top Shipping Streaks Mini-Leaderboard */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  <Flame className="w-4 h-4 text-orange-600 fill-orange-600" />
                  <span>Top Shipping Streaks</span>
                </div>
                <button
                  onClick={() => setActiveView("leaderboard")}
                  className="text-[11px] font-mono text-emerald-700 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {(MONTHLY_LEADERBOARD["November 2026"] || []).slice(0, 5).map((row) => (
                  <div
                    key={row.username}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11px] font-mono font-bold text-slate-400 w-4">
                        #{row.rank}
                      </span>
                      <img
                        src={row.avatar}
                        alt={row.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {row.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">
                          @{row.username}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 shrink-0">
                      <Flame className="w-3 h-3 fill-orange-600" />
                      {row.streakDays}d
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Community Action Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Quick Actions
              </div>

              <button
                onClick={() => setIsListProjectOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Rocket className="w-3.5 h-3.5 text-blue-600" />
                  <span>List New Project</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveView("ai-generator")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Generate Build Blueprint</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveView("blueprints")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Browse Free Grants & Tools</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE MODALS                                       */}
      {/* ======================================================== */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      <CollabModal
        isOpen={isCollabOpen}
        project={selectedCollabProject}
        onClose={() => {
          setIsCollabOpen(false);
          setSelectedCollabProject(null);
        }}
        onSubmitApplication={handleSubmitCollabApplication}
      />

      <ListProjectModal
        isOpen={isListProjectOpen}
        onClose={() => setIsListProjectOpen(false)}
        onListProject={handleListProject}
      />

      <SubmitBuildModal
        isOpen={isSubmitBuildOpen}
        challenges={challenges}
        preselectedChallengeId={selectedChallengeId}
        onClose={() => setIsSubmitBuildOpen(false)}
        onSubmitBuild={handleSubmitBuildLog}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
