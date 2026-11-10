import {
  ShipPost,
  ProjectItem,
  ChallengeItem,
  BlueprintItem,
  ResourceTool,
  LeaderboardRank,
  UserDashboardData,
} from "../types/community";

// ZERO FAKE DATA — All lists initialized empty, driven exclusively by real Supabase queries.
export const INITIAL_COMMUNITY_POSTS: ShipPost[] = [];

export const INITIAL_PROJECTS: ProjectItem[] = [];

export const INITIAL_CHALLENGES: ChallengeItem[] = [];

export const INITIAL_BLUEPRINTS: BlueprintItem[] = [];

export const INITIAL_RESOURCES: ResourceTool[] = [];

export const MONTHLY_LEADERBOARD: Record<string, LeaderboardRank[]> = {};

export const INITIAL_USER_DASHBOARD: UserDashboardData = {
  name: "Builder",
  username: "builder",
  role: "Hardware Hacker",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=builder",
  streakCount: 0,
  totalShips: 0,
  xpPoints: 0,
  bio: "",
  techStack: [],
  githubUrl: "",
  discordHandle: "",
  savedSpecs: [],
  collabApplications: [],
};
