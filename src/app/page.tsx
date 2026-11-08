"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/components/auth/AuthProvider";
import { AevoraAuthGate } from "@/components/auth/AevoraAuthGate";
import { supabase } from "@/lib/supabase";

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
  LeaderboardRank,
} from "@/lib/types/community";

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

export default function AevoraCommunityPage() {
  const { user, profile, session, isLoading: isAuthLoading, refreshProfile } = useAuth();

  // Active View State
  const [activeView, setActiveView] = useState<ViewMode>("feed");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Real Database States
  const [posts, setPosts] = useState<ShipPost[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [blueprints, setBlueprints] = useState<BlueprintItem[]>([]);
  const [resources, setResources] = useState<ResourceTool[]>([]);
  const [savedSpecs, setSavedSpecs] = useState<AISpec[]>([]);
  const [collabApplications, setCollabApplications] = useState<CollabApplication[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardRank[]>>({});

  // Loading state for database queries
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isListProjectOpen, setIsListProjectOpen] = useState(false);
  const [isSubmitBuildOpen, setIsSubmitBuildOpen] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [selectedCollabProject, setSelectedCollabProject] = useState<ProjectItem | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");

  // Countdown timer string (safe for SSR)
  const [activeSprintCountdown, setActiveSprintCountdown] = useState<string>("");

  // =========================================================================
  // SUPABASE REAL DATA FETCHING
  // =========================================================================
  const fetchAllData = useCallback(async () => {
    if (!user) return;
    setIsDataLoading(true);

    try {
      // 1. Fetch Ship Logs with Profiles
      const { data: logsData } = await supabase
        .from("ship_logs")
        .select(`
          id,
          content,
          snippet_title,
          snippet_body,
          github_url,
          demo_url,
          tags,
          upvotes_count,
          type,
          created_at,
          author_id,
          profiles:author_id (
            username,
            full_name,
            avatar_url,
            streak_count,
            role
          ),
          challenges:challenge_id (
            title
          )
        `)
        .order("created_at", { ascending: false });

      // Fetch user upvotes to mark hasUpvoted
      const { data: userUpvotes } = await supabase
        .from("ship_upvotes")
        .select("ship_log_id")
        .eq("user_id", user.id);

      const upvotedIds = new Set((userUpvotes || []).map((u) => u.ship_log_id));

      // Fetch ship comments
      const { data: commentsData } = await supabase
        .from("ship_comments")
        .select(`
          id,
          ship_log_id,
          content,
          created_at,
          profiles:author_id (
            username,
            full_name,
            avatar_url,
            streak_count
          )
        `)
        .order("created_at", { ascending: true });

      const commentsByLogId: Record<string, Comment[]> = {};
      if (commentsData) {
        commentsData.forEach((c: any) => {
          if (!commentsByLogId[c.ship_log_id]) {
            commentsByLogId[c.ship_log_id] = [];
          }
          const author = c.profiles || {};
          const authorUser = author.username || "builder";
          commentsByLogId[c.ship_log_id].push({
            id: c.id,
            author: {
              name: author.full_name || authorUser,
              username: authorUser,
              avatar: author.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${authorUser}`,
              streak: author.streak_count || 1,
            },
            content: c.content,
            timestamp: new Date(c.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            upvotes: 0,
            hasUpvoted: false,
          });
        });
      }

      if (logsData) {
        const mappedPosts: ShipPost[] = logsData.map((log: any) => {
          const authorProfile = log.profiles || {};
          const authorUser = authorProfile.username || "builder";
          return {
            id: log.id,
            type: (log.type as any) || "ship",
            author: {
              name: authorProfile.full_name || authorUser,
              username: authorUser,
              avatar:
                authorProfile.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${authorUser}`,
              streak: authorProfile.streak_count || 1,
              badge: authorProfile.role || "Builder",
            },
            content: log.content,
            timestamp: new Date(log.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            tags: log.tags || ["#hardware"],
            challengeTag: log.challenges?.title,
            githubUrl: log.github_url || undefined,
            demoUrl: log.demo_url || undefined,
            snippet: log.snippet_body
              ? {
                  type: "terminal",
                  title: log.snippet_title || "trace.log",
                  body: log.snippet_body,
                }
              : undefined,
            upvotes: log.upvotes_count || 0,
            hasUpvoted: upvotedIds.has(log.id),
            comments: commentsByLogId[log.id] || [],
          };
        });
        setPosts(mappedPosts);
      }

      // 2. Fetch Projects with Profiles
      const { data: projectsData } = await supabase
        .from("projects")
        .select(`
          id,
          name,
          slug,
          tagline,
          description,
          status,
          tech_stack,
          repo_url,
          demo_url,
          looking_for_collaborators,
          open_roles,
          created_at,
          profiles:owner_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (projectsData) {
        const mappedProjects: ProjectItem[] = projectsData.map((p: any) => {
          const ownerProfile = p.profiles || {};
          const ownerUser = ownerProfile.username || "builder";
          return {
            id: p.id,
            title: p.name,
            tagline: p.tagline,
            description: p.description || p.tagline,
            owner: {
              name: ownerProfile.full_name || ownerUser,
              username: ownerUser,
              avatar:
                ownerProfile.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${ownerUser}`,
            },
            status: p.status || "Prototype",
            techStack: p.tech_stack || [],
            repoUrl: p.repo_url || undefined,
            demoUrl: p.demo_url || undefined,
            lookingForCollab: p.looking_for_collaborators || false,
            openRoles: p.open_roles || [],
            starsCount: 0,
            shippedAt: new Date(p.created_at).toLocaleDateString(),
          };
        });
        setProjects(mappedProjects);
      }

      // 3. Fetch Challenges
      const { data: challengesData } = await supabase
        .from("challenges")
        .select("*")
        .order("starts_at", { ascending: false });

      if (challengesData) {
        const mappedChallenges: ChallengeItem[] = challengesData.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          tagline: c.tagline || c.title,
          description: c.description,
          prizePool: c.prize_pool || "$500 Grant",
          rules: c.rules ? c.rules.split("\n").filter(Boolean) : ["Zero vaporware"],
          status: c.status || "active",
          startsAt: c.starts_at,
          endsAt: c.ends_at,
          submissionsCount: 0,
          maxSlots: 50,
          sponsoredBy: "Aevora Grant Fund",
        }));
        setChallenges(mappedChallenges);
      }

      // 4. Fetch Blueprints
      const { data: blueprintsData } = await supabase
        .from("blueprints")
        .select("*")
        .order("stars", { ascending: false });

      if (blueprintsData && blueprintsData.length > 0) {
        setBlueprints(
          blueprintsData.map((b: any) => ({
            id: b.id,
            title: b.title,
            description: b.description,
            category: b.category,
            techStack: b.tech_stack || [],
            author: b.author,
            stars: b.stars || 0,
            license: b.license || "MIT",
            downloadUrl: b.download_url,
            repoUrl: b.repo_url || undefined,
            previewSnippet: b.preview_snippet || undefined,
            updatedAt: new Date(b.created_at).toLocaleDateString(),
          }))
        );
      }

      // 5. Fetch Saved Blueprints for Current User
      const { data: savedData } = await supabase
        .from("saved_blueprints")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (savedData) {
        setSavedSpecs(
          savedData.map((s: any) => ({
            id: s.id,
            title: s.title,
            domain: s.domain,
            difficulty: s.difficulty,
            problemStatement: s.problem_statement,
            bom: s.bom || [],
            techStack: s.tech_stack || [],
            architectureSteps: s.architecture_steps || [],
            roadmapDays: s.roadmap_days || [],
            generatedAt: new Date(s.created_at).toLocaleDateString(),
          }))
        );
      }

      // 6. Fetch Collab Requests
      const { data: collabData } = await supabase
        .from("collab_requests")
        .select(`
          id,
          project_id,
          role_applied,
          pitch,
          portfolio_url,
          status,
          created_at,
          profiles:applicant_id (
            username,
            full_name,
            avatar_url,
            role
          ),
          projects:project_id (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (collabData) {
        setCollabApplications(
          collabData.map((c: any) => {
            const applicant = c.profiles || {};
            const applicantUser = applicant.username || "builder";
            return {
              id: c.id,
              projectId: c.project_id,
              projectTitle: c.projects?.name || "Hardware Build",
              applicant: {
                name: applicant.full_name || applicantUser,
                username: applicantUser,
                avatar:
                  applicant.avatar_url ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${applicantUser}`,
                roleTag: applicant.role || "Hardware Hacker",
              },
              roleApplied: c.role_applied,
              pitch: c.pitch,
              portfolioUrl: c.portfolio_url || undefined,
              status: c.status || "Pending",
              timestamp: new Date(c.created_at).toLocaleDateString(),
            };
          })
        );
      }

      // 7. Calculate Real Leaderboard Rankings from Profiles
      const { data: profilesLeaderboard } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, role, ship_count, streak_count")
        .order("ship_count", { ascending: false })
        .limit(10);

      if (profilesLeaderboard && profilesLeaderboard.length > 0) {
        const currentMonth = "November 2026";
        const ranks: LeaderboardRank[] = profilesLeaderboard
          .filter((p) => (p.ship_count || 0) > 0 || (p.streak_count || 0) > 0)
          .map((p, index) => ({
            rank: index + 1,
            name: p.full_name || p.username,
            username: p.username,
            avatar:
              p.avatar_url ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`,
            monthlyXP: (p.ship_count || 0) * 100 + (p.streak_count || 0) * 50,
            streakDays: p.streak_count || 1,
            projectsShipped: p.ship_count || 0,
            upvotesReceived: 0,
            focusDomain: p.role || "Hardware & AI",
          }));

        setLeaderboardData({
          [currentMonth]: ranks,
        });
      }
    } catch (err) {
      console.error("Error fetching Aevora data from Supabase:", err);
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  // Initial load when user/session is present
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  // Countdown timer safely updated in useEffect
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

  // =========================================================================
  // SUPABASE MUTATION HANDLERS
  // =========================================================================
  const handleAddPost = async (newPost: ShipPost) => {
    if (!user) return;

    try {
      // Real database insert
      const { error } = await supabase.from("ship_logs").insert({
        author_id: user.id,
        content: newPost.content,
        snippet_title: newPost.snippet?.title || null,
        snippet_body: newPost.snippet?.body || null,
        github_url: newPost.githubUrl || null,
        demo_url: newPost.demoUrl || null,
        tags: newPost.tags,
        type: newPost.type,
      });

      if (!error) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#10b981", "#3b82f6", "#f59e0b"],
        });
        await fetchAllData();
        await refreshProfile();
      }
    } catch (e) {
      console.error("Error creating ship log:", e);
    }
  };

  const handleToggleUpvote = async (postId: string) => {
    if (!user) return;

    try {
      // Check if upvoted
      const { data: existing } = await supabase
        .from("ship_upvotes")
        .select("id")
        .eq("ship_log_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        await supabase.from("ship_upvotes").delete().eq("id", existing.id);
      } else {
        await supabase.from("ship_upvotes").insert({
          ship_log_id: postId,
          user_id: user.id,
        });
      }

      await fetchAllData();
    } catch (e) {
      console.error("Error toggling upvote:", e);
    }
  };

  const handleAddComment = async (postId: string, comment: Comment) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("ship_comments").insert({
        ship_log_id: postId,
        author_id: user.id,
        content: comment.content,
      });

      if (!error) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Error adding comment:", e);
    }
  };

  const handleListProject = async (newProject: ProjectItem) => {
    if (!user) return;

    try {
      const slug = `${newProject.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;
      const { error } = await supabase.from("projects").insert({
        owner_id: user.id,
        name: newProject.title,
        slug,
        tagline: newProject.tagline,
        description: newProject.description,
        status: newProject.status,
        tech_stack: newProject.techStack,
        repo_url: newProject.repoUrl || null,
        demo_url: newProject.demoUrl || null,
        looking_for_collaborators: newProject.lookingForCollab,
        open_roles: newProject.openRoles,
      });

      if (!error) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8 },
          colors: ["#10b981", "#6366f1"],
        });
        await fetchAllData();
      }
    } catch (e) {
      console.error("Error listing project:", e);
    }
  };

  const handleOpenCollabModal = (project: ProjectItem) => {
    setSelectedCollabProject(project);
    setIsCollabOpen(true);
  };

  const handleSubmitCollabApplication = async (application: CollabApplication) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("collab_requests").insert({
        project_id: application.projectId,
        applicant_id: user.id,
        role_applied: application.roleApplied,
        pitch: application.pitch,
        portfolio_url: application.portfolioUrl || null,
        status: "Pending",
      });

      if (!error) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Error submitting collab application:", e);
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: "Accepted" | "Declined") => {
    try {
      const { error } = await supabase
        .from("collab_requests")
        .update({ status })
        .eq("id", appId);

      if (!error) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Error updating collab status:", e);
    }
  };

  const handleSubmitBuildLog = async (post: ShipPost, challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("ship_logs").insert({
        author_id: user.id,
        challenge_id: challengeId || null,
        content: post.content,
        snippet_title: post.snippet?.title || null,
        snippet_body: post.snippet?.body || null,
        github_url: post.githubUrl || null,
        demo_url: post.demoUrl || null,
        tags: post.tags,
        type: "ship",
      });

      if (!error) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#10b981", "#f59e0b"],
        });
        await fetchAllData();
        await refreshProfile();
      }
    } catch (e) {
      console.error("Error submitting build log to challenge:", e);
    }
  };

  const handleSaveAISpec = async (spec: AISpec) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("saved_blueprints").insert({
        user_id: user.id,
        title: spec.title,
        domain: spec.domain,
        difficulty: spec.difficulty,
        problem_statement: spec.problemStatement,
        bom: spec.bom,
        tech_stack: spec.techStack,
        architecture_steps: spec.architectureSteps,
        roadmap_days: spec.roadmapDays,
      });

      if (!error) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Error saving AI spec:", e);
    }
  };

  const handleRemoveSavedSpec = async (specId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("saved_blueprints")
        .delete()
        .eq("id", specId);

      if (!error) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Error deleting saved spec:", e);
    }
  };

  // =========================================================================
  // 1. AUTHENTICATION GATE CHECK
  // =========================================================================
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-emerald-500/30 flex items-center justify-center animate-pulse">
          <span className="font-mono font-black text-sm text-emerald-400">A</span>
        </div>
        <p className="text-xs font-mono text-zinc-500">Connecting to Aevora Forge...</p>
      </div>
    );
  }

  // If not logged in, render the sleek dark-mode Auth & Onboarding Screen
  if (!user || !session) {
    return <AevoraAuthGate />;
  }

  // Current real user profile constructed from Supabase
  const currentUsername = profile?.username || user.email?.split("@")[0] || "builder";
  const currentUserData: UserDashboardData = {
    name: profile?.full_name || currentUsername,
    username: currentUsername,
    role: profile?.role || "Hardware Hacker",
    avatar:
      profile?.avatar_url ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`,
    streakCount: profile?.streak_count || 1,
    totalShips: profile?.ship_count || posts.filter((p) => p.author.username === currentUsername).length,
    xpPoints:
      ((profile?.ship_count || 0) * 100) +
      ((profile?.streak_count || 1) * 50),
    bio: profile?.bio || "Hardware and systems engineer logging verifiable proof of work on Aevora Forge.",
    techStack: profile?.tech_stack || ["ESP32", "KiCad", "Rust", "Next.js"],
    githubUrl: profile?.github_url || `https://github.com/${currentUsername}`,
    discordHandle: profile?.discord_handle || `${currentUsername}#0001`,
    savedSpecs: savedSpecs,
    collabApplications: collabApplications,
  };

  // Nav item list
  const navItems = [
    {
      id: "feed" as ViewMode,
      label: "Live Ship Feed & Forums",
      icon: Radio,
      badge: `${posts.length}`,
      accent: "text-emerald-400",
    },
    {
      id: "projects" as ViewMode,
      label: "Project Showcase & Collab",
      icon: Rocket,
      badge: `${projects.length}`,
      accent: "text-blue-400",
    },
    {
      id: "challenges" as ViewMode,
      label: "Sprints & Challenges",
      icon: Zap,
      badge: `${challenges.filter((c) => c.status === "active").length} Live`,
      accent: "text-amber-400",
    },
    {
      id: "blueprints" as ViewMode,
      label: "Blueprint Library & Tools",
      icon: Layers,
      badge: `${blueprints.length || 4}`,
      accent: "text-indigo-400",
    },
    {
      id: "ai-generator" as ViewMode,
      label: "AI Idea & Spec Engine",
      icon: Sparkles,
      badge: "AI",
      accent: "text-purple-400",
    },
    {
      id: "leaderboard" as ViewMode,
      label: "Monthly Leaderboards",
      icon: Trophy,
      badge: "#1",
      accent: "text-amber-400",
    },
    {
      id: "dashboard" as ViewMode,
      label: "My Builder Dashboard",
      icon: User,
      badge: `${currentUserData.streakCount}d`,
      accent: "text-emerald-400",
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-400">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* LEFT SIDEBAR: Persistent Module Navigation & Filters   */}
          {/* ======================================================== */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
            {/* Core View Switcher Card */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-2 shadow-xl space-y-1">
              <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>Workspace Modules</span>
                <span className="text-[10px] text-emerald-400">LIVE DB</span>
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                        isActive
                          ? "bg-zinc-800 text-zinc-100 font-bold border border-zinc-700 shadow-xs"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950"
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
                            ? "bg-zinc-900 text-emerald-400 border border-zinc-700"
                            : "bg-zinc-950 text-zinc-500"
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
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Telemetry Tags
                </span>
                {selectedTag !== "all" && (
                  <button
                    onClick={() => setSelectedTag("all")}
                    className="text-[10px] text-emerald-400 hover:underline capitalize"
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
                      ? "bg-zinc-800 text-emerald-400 border-zinc-700 font-semibold"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
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
                        ? "bg-zinc-800 text-emerald-400 border-zinc-700 font-semibold"
                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules & Manifesto Trigger Card */}
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Proof-of-Work Standards
                </h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                Rule #1: Post real commits & schematics, zero vaporware. Peer review over hype.
              </p>
              <button
                onClick={() => setIsRulesOpen(true)}
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-mono font-medium transition-colors border border-zinc-800 text-center"
              >
                Read Community Manifesto
              </button>
            </div>

            {/* Builder Account Pill */}
            <div
              onClick={() => setActiveView("dashboard")}
              className="bg-zinc-900 rounded-xl border border-zinc-800 p-3.5 shadow-xl flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={currentUserData.avatar}
                  alt={currentUserData.name}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                    {currentUserData.name}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 truncate">
                    @{currentUserData.username}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs font-bold text-orange-400 bg-orange-950/40 px-2 py-1 rounded border border-orange-500/30 shrink-0">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span>{currentUserData.streakCount}d</span>
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
                      name: currentUserData.name,
                      username: currentUserData.username,
                      avatar: currentUserData.avatar,
                      streak: currentUserData.streakCount,
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
                    savedSpecIds={savedSpecs.map((s) => s.id)}
                  />
                )}

                {/* 6. MONTHLY LEADERBOARD VIEW */}
                {activeView === "leaderboard" && (
                  <LeaderboardView monthlyData={leaderboardData} />
                )}

                {/* 7. BUILDER DASHBOARD & ACCOUNT VIEW */}
                {activeView === "dashboard" && (
                  <DashboardView
                    userData={currentUserData}
                    userProjects={projects.filter(
                      (p) => p.owner.username === currentUserData.username
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
          {/* RIGHT SIDEBAR: Active Sprint, Leaderboard, Actions       */}
          {/* ======================================================== */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
            {/* Active Sprint Widget */}
            {activeSprint && (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-950/40 text-amber-400 border border-amber-500/30">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Active Sprint
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {activeSprintCountdown || "Live"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-100 leading-snug">
                    {activeSprint.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 font-mono">
                    {activeSprint.tagline}
                  </p>
                </div>

                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">Prize Grant:</span>
                    <span className="font-bold text-amber-400">{activeSprint.prizePool}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">Logged Ships:</span>
                    <span className="font-bold text-emerald-400">
                      {posts.filter((p) => p.challengeTag).length} verified
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedChallengeId(activeSprint.id);
                    setIsSubmitBuildOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Sprint Build</span>
                </button>
              </div>
            )}

            {/* Quick Community Action Bar */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 shadow-xl space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Quick Actions
              </div>

              <button
                onClick={() => setIsListProjectOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-medium text-zinc-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Rocket className="w-3.5 h-3.5 text-blue-400" />
                  <span>+ List New Build</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </button>

              <button
                onClick={() => setActiveView("ai-generator")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-medium text-zinc-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Generate AI Spec</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </button>

              <button
                onClick={() => setActiveView("blueprints")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-medium text-zinc-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Browse Hardware Grants</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
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
    </div>
  );
}
