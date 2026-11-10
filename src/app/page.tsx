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
  Send,
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
  ContestApplicationItem,
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
import { ApplyContestModal } from "@/components/modals/ApplyContestModal";
import { formatCountdown } from "@/lib/utils";
import { DUMMY_SEED_CHALLENGE_IDS } from "@/lib/data/initialData";

export default function AevoraCommunityPage() {
  const { user, profile, session, isLoading: isAuthLoading, refreshProfile } = useAuth();

  // Active View State
  const [activeView, setActiveView] = useState<ViewMode>("feed");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Real Database States
  const [posts, setPosts] = useState<ShipPost[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [contestApplications, setContestApplications] = useState<ContestApplicationItem[]>([]);
  const [blueprints, setBlueprints] = useState<BlueprintItem[]>([]);
  const [resources, setResources] = useState<ResourceTool[]>([]);
  const [savedSpecs, setSavedSpecs] = useState<AISpec[]>([]);
  const [collabApplications, setCollabApplications] = useState<CollabApplication[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardRank[]>>({});
  const [userShipDates, setUserShipDates] = useState<string[]>([]);
  const [buildersCount, setBuildersCount] = useState<number>(0);

  // Loading state for database queries
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isListProjectOpen, setIsListProjectOpen] = useState(false);
  const [isSubmitBuildOpen, setIsSubmitBuildOpen] = useState(false);
  const [isApplyContestOpen, setIsApplyContestOpen] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [selectedCollabProject, setSelectedCollabProject] = useState<ProjectItem | null>(null);
  const [selectedApplyContest, setSelectedApplyContest] = useState<ChallengeItem | null>(null);
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
          challenge_id,
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
              streak: author.streak_count ?? 0,
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
        const myDates = logsData
          .filter((log: any) => log.author_id === user.id && log.created_at)
          .map((log: any) => log.created_at);
        setUserShipDates(myDates);

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
              streak: authorProfile.streak_count ?? 0,
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

      // 3. Fetch Contests / Challenges (published only, excluding legacy dummy seeds)
      // Also fetch current user's contest applications gracefully
      let myAppMap: Record<string, ContestApplicationItem> = {};
      try {
        const { data: myAppsData, error: myAppsErr } = await (
          supabase.from("contest_applications") as any
        )
          .select("*, contest:challenges(title, slug)")
          .eq("applicant_id", user.id)
          .order("created_at", { ascending: false });

        if (!myAppsErr && Array.isArray(myAppsData)) {
          const mappedApps: ContestApplicationItem[] = myAppsData.map((a: any) => ({
            id: a.id,
            contestId: a.contest_id,
            contestTitle: a.contest?.title || undefined,
            contestSlug: a.contest?.slug || undefined,
            applicantId: a.applicant_id,
            teamName: a.team_name || undefined,
            projectTitle: a.project_title,
            track: a.track || undefined,
            pitch: a.pitch,
            repoUrl: a.repo_url || undefined,
            portfolioUrl: a.portfolio_url || undefined,
            status: a.status,
            acceptedRules: Boolean(a.accepted_rules),
            createdAt: a.created_at,
            updatedAt: a.updated_at,
          }));
          setContestApplications(mappedApps);
          mappedApps.forEach((app) => {
            myAppMap[app.contestId] = app;
          });
        }
      } catch {
        // Ignore gracefully if migration has not run yet
      }

      const { data: challengesData } = await supabase
        .from("challenges")
        .select("*")
        .order("starts_at", { ascending: false });

      if (challengesData) {
        const realChallenges = challengesData.filter(
          (c: any) =>
            !DUMMY_SEED_CHALLENGE_IDS.includes(c.id) && c.is_published !== false
        );
        const mappedChallenges: ChallengeItem[] = realChallenges.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          tagline: c.tagline || c.description,
          description: c.description,
          prizePool: c.prize_pool || "",
          rules: c.rules ? c.rules.split("\n").filter(Boolean) : [],
          status: c.status || "active",
          startsAt: c.starts_at,
          endsAt: c.ends_at,
          applicationDeadline: c.application_deadline || undefined,
          submissionsCount: logsData
            ? logsData.filter((l: any) => l.challenge_id === c.id).length
            : 0,
          applicationsCount: c.applications_count ?? 0,
          approvedCount: c.approved_count ?? 0,
          maxSlots: c.max_slots ?? undefined,
          requireApprovalToSubmit: c.require_approval_to_submit ?? true,
          isPublished: c.is_published ?? true,
          sponsoredBy: c.sponsored_by || "",
          myApplication: myAppMap[c.id] || null,
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

      // 7. Calculate Real Leaderboard Rankings & Builder Count from Profiles
      const { data: profilesLeaderboard } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, role, ship_count, streak_count")
        .order("ship_count", { ascending: false })
        .limit(50);

      if (profilesLeaderboard && profilesLeaderboard.length > 0) {
        const realProfiles = profilesLeaderboard.filter(
          (p) => p.id !== "980def6d-4feb-47f2-ad37-ec3cbafe04d3"
        );
        setBuildersCount(realProfiles.length);

        const currentMonth = "November 2026";
        const ranks: LeaderboardRank[] = realProfiles
          .filter((p) => (p.ship_count || 0) > 0 || (p.streak_count || 0) > 0)
          .map((p, index) => ({
            rank: index + 1,
            name: p.full_name || p.username,
            username: p.username,
            avatar:
              p.avatar_url ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`,
            monthlyXP: (p.ship_count || 0) * 100 + (p.streak_count || 0) * 50,
            streakDays: p.streak_count ?? 0,
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

  const handleWithdrawContestApp = async (contestId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/contests/${contestId}/apply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw" }),
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error("Error withdrawing contest application:", e);
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
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 animate-pulse">
          <span className="font-mono font-black text-sm">A</span>
        </div>
        <p className="text-xs font-mono text-slate-500 dark:text-[#8c909f]">
          Connecting to Aevora Forge...
        </p>
      </div>
    );
  }

  // If not logged in, render the calibrated Light/Dark Minimalist Blue Gateway
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
    streakCount: profile?.streak_count ?? 0,
    totalShips:
      profile?.ship_count || posts.filter((p) => p.author.username === currentUsername).length,
    xpPoints:
      (profile?.ship_count || 0) * 100 +
      (profile?.streak_count || 0) * 50,
    bio: profile?.bio || "",
    techStack: profile?.tech_stack || [],
    githubUrl: profile?.github_url || "",
    discordHandle: profile?.discord_handle || "",
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
    },
    {
      id: "projects" as ViewMode,
      label: "Project Showcase & Collab",
      icon: Rocket,
      badge: `${projects.length}`,
    },
    {
      id: "challenges" as ViewMode,
      label: "Contests & Sprints",
      icon: Zap,
      badge: `${
        challenges.filter((c) => c.status === "active" || c.status === "upcoming")
          .length
      } Open`,
    },
    {
      id: "blueprints" as ViewMode,
      label: "Blueprint Library & Tools",
      icon: Layers,
      badge: `${blueprints.length}`,
    },
    {
      id: "ai-generator" as ViewMode,
      label: "AI Idea Generator",
      icon: Sparkles,
      badge: "AI",
    },
    {
      id: "leaderboard" as ViewMode,
      label: "Monthly Leaderboards",
      icon: Trophy,
      badge: "#1",
    },
    {
      id: "dashboard" as ViewMode,
      label: "My Builder Dashboard",
      icon: User,
      badge: `${currentUserData.streakCount}d`,
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

  const activeSprint =
    challenges.find((c) => c.status === "active") ||
    challenges.find((c) => c.status === "upcoming") ||
    challenges[0];

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#121318] text-slate-900 dark:text-[#e3e1e9] transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* ======================================================== */}
          {/* LEFT RAIL: WORKSPACE MODULES                             */}
          {/* ======================================================== */}
          <aside className="xl:col-span-3 flex flex-col gap-3 xl:sticky xl:top-20">
            {/* Navigation Module Card */}
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] p-3.5 rounded-lg shadow-xs flex flex-col gap-2 transition-colors">
              <div className="flex items-center justify-between px-1 py-0.5">
                <span className="font-mono text-[11px] text-slate-500 dark:text-[#c2c6d6] uppercase tracking-widest font-semibold">
                  Workspace
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#adc6ff] animate-pulse" />
                  <span className="font-mono text-[10px] text-blue-600 dark:text-[#adc6ff] font-medium tracking-tight">
                    LIVE NODE
                  </span>
                </div>
              </div>

              <nav className="flex flex-col gap-1 mt-1">
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
                      className={`group relative w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-all ${
                        isActive
                          ? "bg-blue-50/80 dark:bg-[#292a2f]/60 text-blue-600 dark:text-[#adc6ff] font-medium border border-blue-100 dark:border-transparent"
                          : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-[#e3e1e9] hover:bg-slate-50 dark:hover:bg-[#1a1b21]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 dark:bg-[#adc6ff] rounded-full" />
                      )}
                      <div className={`flex items-center gap-2.5 truncate ${isActive ? "pl-1" : ""}`}>
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? "text-blue-600 dark:text-[#adc6ff]"
                              : "text-slate-400 dark:text-[#8c909f] group-hover:text-blue-600 dark:group-hover:text-[#adc6ff]"
                          }`}
                        />
                        <span
                          className={`text-[13px] truncate ${
                            isActive ? "text-slate-900 dark:text-[#e3e1e9] font-semibold" : "font-medium"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-[11px] px-1.5 py-0.5 rounded shrink-0 tabular-nums ${
                          isActive
                            ? "bg-blue-100 dark:bg-[#34343a] text-blue-700 dark:text-[#adc6ff] font-semibold"
                            : "bg-slate-100 dark:bg-[#1e1f25] text-slate-500 dark:text-[#c2c6d6]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Telemetry Filter Tags */}
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] p-3.5 rounded-lg shadow-xs flex flex-col gap-2 transition-colors">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[11px] text-slate-500 dark:text-[#c2c6d6] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Telemetry Tags
                </span>
                {selectedTag !== "all" && (
                  <button
                    onClick={() => setSelectedTag("all")}
                    className="font-mono text-[11px] text-blue-600 dark:text-[#adc6ff] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-1">
                <button
                  onClick={() => {
                    setSelectedTag("all");
                    setActiveView("feed");
                  }}
                  className={`px-2 py-1 rounded font-mono text-[11px] transition-colors flex items-center gap-1 border ${
                    selectedTag === "all"
                      ? "bg-blue-50 dark:bg-[#292a2f] border-blue-200 dark:border-transparent text-blue-600 dark:text-[#adc6ff] font-medium"
                      : "bg-slate-50 dark:bg-[#1e1f25] border-slate-200 dark:border-transparent text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-[#e3e1e9]"
                  }`}
                >
                  <span>#all</span>
                  <span className="text-[10px] opacity-70 tabular-nums">{posts.length}</span>
                </button>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setActiveView("feed");
                    }}
                    className={`px-2 py-1 rounded font-mono text-[11px] transition-colors border ${
                      selectedTag === tag
                        ? "bg-blue-50 dark:bg-[#292a2f] border-blue-200 dark:border-transparent text-blue-600 dark:text-[#adc6ff] font-medium"
                        : "bg-slate-50 dark:bg-[#1e1f25] border-slate-200 dark:border-transparent text-slate-600 dark:text-[#c2c6d6] hover:border-slate-300 dark:hover:bg-[#292a2f] hover:text-slate-900 dark:hover:text-[#e3e1e9]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Proof-of-Work Standards Card */}
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] p-3.5 rounded-lg shadow-xs flex flex-col gap-2 transition-colors">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-[#adc6ff]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                  Proof-of-Work Standards
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#c2c6d6] leading-relaxed">
                Rule #1: Commit verification, serial traces, zero vaporware. All architecture logs must include verified commits or physical silicon revisions. Peer review over hype.
              </p>
              <button
                onClick={() => setIsRulesOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-[#adc6ff] hover:text-blue-700 dark:hover:text-[#a4c9ff] transition-colors mt-0.5 text-left"
              >
                <span>Read Protocol Manifesto</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Mini Footer Card */}
            <div
              onClick={() => setActiveView("dashboard")}
              className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] p-2.5 rounded-lg shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-[#292a2f] transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUserData.avatar}
                  alt={currentUserData.name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-[#424754] bg-slate-100 dark:bg-[#1a1b21] shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-[#e3e1e9] truncate group-hover:text-blue-600 dark:group-hover:text-[#adc6ff] transition-colors">
                    {currentUserData.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-[#8c909f] truncate">
                    @{currentUserData.username}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1e1f25] border border-slate-200 dark:border-transparent px-2 py-1 rounded shrink-0">
                <Flame className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
                <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-[#e3e1e9] tabular-nums">
                  {currentUserData.streakCount}d
                </span>
              </div>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* CENTER WORK AREA: COMPOSER & MULTI-VIEW                  */}
          {/* ======================================================== */}
          <main className="xl:col-span-6 space-y-4 min-w-0">
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

                {/* 3. CONTESTS & SPRINTS VIEW */}
                {activeView === "challenges" && (
                  <ChallengesView
                    challenges={challenges}
                    myApplications={contestApplications}
                    onApplyContest={(ch) => {
                      setSelectedApplyContest(ch);
                      setIsApplyContestOpen(true);
                    }}
                    onWithdrawApplication={handleWithdrawContestApp}
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
                    userShipDates={userShipDates}
                    collabApplications={collabApplications}
                    contestApplications={contestApplications}
                    onOpenListProject={() => setIsListProjectOpen(true)}
                    onUpdateAppStatus={handleUpdateAppStatus}
                    onWithdrawContestApp={handleWithdrawContestApp}
                    onRemoveSavedSpec={handleRemoveSavedSpec}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* ======================================================== */}
          {/* RIGHT RAIL: ACTIVE CONTEST, ACTIONS & FORGE TELEMETRY    */}
          {/* ======================================================== */}
          <aside className="xl:col-span-3 flex flex-col gap-3 xl:sticky xl:top-20">
            {/* Active Contest Widget */}
            {activeSprint ? (
              <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] p-4 rounded-lg shadow-xs space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" />
                    {activeSprint.status === "upcoming"
                      ? "OPEN REGISTRATION"
                      : activeSprint.status === "completed"
                      ? "CONTEST ENDED"
                      : "ACTIVE CONTEST"}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-[#8c909f] flex items-center gap-1 tabular-nums">
                    <Clock className="w-3.5 h-3.5" />
                    {activeSprintCountdown || "Live"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9] leading-snug">
                    {activeSprint.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#8c909f] mt-1 line-clamp-2 leading-relaxed">
                    {activeSprint.tagline}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f] space-y-2">
                  {activeSprint.prizePool && (
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-500 dark:text-[#8c909f] text-[11px]">
                        PRIZE GRANT:
                      </span>
                      <span className="font-bold text-blue-600 dark:text-[#adc6ff] text-sm tabular-nums">
                        {activeSprint.prizePool}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500 dark:text-[#8c909f] text-[11px]">
                      APPLICANTS:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-[#e3e1e9] text-[11px] tabular-nums">
                      {activeSprint.approvedCount ?? 0} Approved
                      {activeSprint.maxSlots ? ` / ${activeSprint.maxSlots}` : ""} (
                      {activeSprint.applicationsCount ?? 0} total)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500 dark:text-[#8c909f] text-[11px]">
                      LOGGED SHIPS:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-[#e3e1e9] text-[11px] tabular-nums flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#adc6ff]" />
                      {activeSprint.submissionsCount} Verified
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-[#292a2f] rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-blue-600 dark:bg-[#adc6ff] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (activeSprint.applicationsCount ?? 0) * 10
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {activeSprint.myApplication ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 rounded-md bg-blue-50 dark:bg-[#292a2f] border border-blue-200 dark:border-blue-500/30 text-[11px] font-mono text-blue-700 dark:text-[#adc6ff] flex items-center justify-between">
                      <span>Application Status:</span>
                      <strong className="uppercase">{activeSprint.myApplication.status}</strong>
                    </div>

                    {activeSprint.status === "active" &&
                      (!(activeSprint.requireApprovalToSubmit ?? true) ||
                        activeSprint.myApplication.status === "approved") && (
                        <button
                          onClick={() => {
                            setSelectedChallengeId(activeSprint.id);
                            setIsSubmitBuildOpen(true);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Submit Contest Build</span>
                        </button>
                      )}
                  </div>
                ) : activeSprint.status !== "completed" ? (
                  <button
                    onClick={() => {
                      setSelectedApplyContest(activeSprint);
                      setIsApplyContestOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors shadow-xs active:scale-[0.99]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Apply to Contest</span>
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] p-4 rounded-lg shadow-xs space-y-3 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 dark:bg-[#1a1b21] text-slate-600 dark:text-[#8c909f] border border-slate-200 dark:border-[#292a2f] uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" />
                    CONTESTS
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-[#8c909f]">
                    0 Open
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e3e1e9]">
                    No Active Contests
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8c909f] mt-1 leading-relaxed">
                    No published contests right now. Admins publish new contests from the protected Admin Console.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Community Action Bar */}
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] p-3.5 rounded-lg shadow-xs space-y-2 transition-colors">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-500 dark:text-[#c2c6d6] px-1">
                Quick Actions
              </div>

              <button
                onClick={() => setIsListProjectOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-[#1a1b21] hover:bg-slate-100 dark:hover:bg-[#292a2f] border border-slate-200 dark:border-[#292a2f] text-xs font-medium text-slate-800 dark:text-[#e3e1e9] transition-colors text-left group"
              >
                <div className="flex items-center gap-2">
                  <Rocket className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
                  <span>List New Build</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-[#adc6ff] transition-colors" />
              </button>

              <button
                onClick={() => setActiveView("ai-generator")}
                className="w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-[#1a1b21] hover:bg-slate-100 dark:hover:bg-[#292a2f] border border-slate-200 dark:border-[#292a2f] text-xs font-medium text-slate-800 dark:text-[#e3e1e9] transition-colors text-left group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
                  <span>AI Idea Generator</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-[#adc6ff] transition-colors" />
              </button>

              <button
                onClick={() => setActiveView("blueprints")}
                className="w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-[#1a1b21] hover:bg-slate-100 dark:hover:bg-[#292a2f] border border-slate-200 dark:border-[#292a2f] text-xs font-medium text-slate-800 dark:text-[#e3e1e9] transition-colors text-left group"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
                  <span>Browse Blueprint Library</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-[#adc6ff] transition-colors" />
              </button>
            </div>

            {/* Forge Telemetry Metrics Card */}
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] p-3.5 rounded-lg shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between px-0.5">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-[#c2c6d6]">
                  Live Database Metrics
                </span>
                <span className="font-mono text-[10px] text-blue-600 dark:text-[#adc6ff] font-medium">
                  SUPABASE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f]">
                  <div className="font-mono text-[10px] text-slate-500 dark:text-[#8c909f] uppercase">
                    Verified Ships
                  </div>
                  <div className="font-mono text-base font-bold text-blue-600 dark:text-[#adc6ff] mt-0.5 tabular-nums">
                    {posts.length}
                  </div>
                </div>
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f]">
                  <div className="font-mono text-[10px] text-slate-500 dark:text-[#8c909f] uppercase">
                    Listed Builds
                  </div>
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-[#e3e1e9] mt-0.5 tabular-nums">
                    {projects.length}
                  </div>
                </div>
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f]">
                  <div className="font-mono text-[10px] text-slate-500 dark:text-[#8c909f] uppercase">
                    Open Contests
                  </div>
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-[#e3e1e9] mt-0.5 tabular-nums">
                    {
                      challenges.filter(
                        (c) => c.status === "active" || c.status === "upcoming"
                      ).length
                    }
                  </div>
                </div>
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f]">
                  <div className="font-mono text-[10px] text-slate-500 dark:text-[#8c909f] uppercase">
                    Builders
                  </div>
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-[#e3e1e9] mt-0.5 tabular-nums">
                    {buildersCount}
                  </div>
                </div>
              </div>
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
        challenges={challenges.filter(
          (c) =>
            c.status === "active" &&
            (!(c.requireApprovalToSubmit ?? true) ||
              c.myApplication?.status === "approved")
        )}
        preselectedChallengeId={selectedChallengeId}
        onClose={() => setIsSubmitBuildOpen(false)}
        onSubmitBuild={handleSubmitBuildLog}
      />

      <ApplyContestModal
        isOpen={isApplyContestOpen}
        contest={selectedApplyContest}
        onClose={() => {
          setIsApplyContestOpen(false);
          setSelectedApplyContest(null);
        }}
        onApplied={fetchAllData}
      />
    </div>
  );
}
