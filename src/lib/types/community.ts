export type ViewMode =
  | "feed"
  | "projects"
  | "challenges"
  | "blueprints"
  | "ai-generator"
  | "leaderboard"
  | "dashboard";

export interface Comment {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    streak: number;
  };
  content: string;
  timestamp: string;
  upvotes: number;
  hasUpvoted?: boolean;
}

export interface ShipPost {
  id: string;
  type: "ship" | "discussion";
  author: {
    name: string;
    username: string;
    avatar: string;
    streak: number;
    badge?: string;
  };
  content: string;
  timestamp: string;
  tags: string[];
  snippet?: {
    type: "terminal" | "code" | "schematic";
    title: string;
    body: string;
  };
  githubUrl?: string;
  demoUrl?: string;
  challengeTag?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  comments: Comment[];
  category?: string;
}

export type CollabRole = {
  role: string;
  skills: string[];
  slotsAvailable: number;
};

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  owner: {
    name: string;
    username: string;
    avatar: string;
  };
  status: "Prototype" | "Beta" | "Shipped";
  techStack: string[];
  repoUrl?: string;
  demoUrl?: string;
  lookingForCollab: boolean;
  openRoles: CollabRole[];
  starsCount: number;
  shippedAt: string;
}

export interface CollabApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  applicant: {
    name: string;
    username: string;
    avatar: string;
    roleTag: string;
  };
  roleApplied: string;
  pitch: string;
  portfolioUrl?: string;
  status: "Pending" | "Accepted" | "Declined";
  timestamp: string;
}

export type ContestApplicationStatus =
  | "pending"
  | "approved"
  | "waitlisted"
  | "rejected"
  | "withdrawn";

export interface ContestApplicationItem {
  id: string;
  contestId: string;
  contestTitle?: string;
  contestSlug?: string;
  applicantId: string;
  teamName?: string;
  projectTitle: string;
  track?: string;
  pitch: string;
  repoUrl?: string;
  portfolioUrl?: string;
  status: ContestApplicationStatus;
  acceptedRules: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  prizePool: string;
  rules: string[];
  status: "active" | "upcoming" | "completed";
  startsAt: string;
  endsAt: string;
  applicationDeadline?: string;
  submissionsCount: number;
  applicationsCount?: number;
  approvedCount?: number;
  maxSlots?: number;
  requireApprovalToSubmit?: boolean;
  isPublished?: boolean;
  sponsoredBy?: string;
  myApplication?: ContestApplicationItem | null;
}

export interface AdminContestApplicationRow {
  id: string;
  contestId: string;
  contestTitle: string;
  contestStatus: "upcoming" | "active" | "completed";
  contestMaxSlots: number | null;
  contestApprovedCount: number;
  applicantId: string;
  applicantName: string;
  applicantUsername: string;
  applicantAvatar: string;
  applicantRole: string;
  applicantShipCount: number;
  applicantGithubUrl: string | null;
  teamName: string | null;
  projectTitle: string;
  track: string | null;
  pitch: string;
  repoUrl: string | null;
  portfolioUrl: string | null;
  status: ContestApplicationStatus;
  adminNotes: string;
  reviewedAt: string | null;
  createdAt: string;
}

export interface AdminAuditLogItem {
  id: string;
  actorId: string | null;
  actorUsername: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface BlueprintItem {
  id: string;
  title: string;
  description: string;
  category: "Firmware" | "CAD/Chassis" | "Edge AI" | "Next.js/Full-Stack" | "PCB Schematic";
  techStack: string[];
  author: string;
  stars: number;
  license: string;
  downloadUrl: string;
  repoUrl?: string;
  previewSnippet?: string;
  updatedAt: string;
}

export interface ResourceTool {
  id: string;
  name: string;
  category: "Hardware Grants" | "GPU & Cloud Credits" | "CAD & Simulation" | "Embedded Tooling" | "DevDocs";
  description: string;
  accessType: "Free Tier" | "Open Source" | "Grant" | "Discount";
  url: string;
  provider: string;
}

export interface AISpecInput {
  domain: string;
  difficulty: string;
  availableHardware: string[];
}

export interface AISpec {
  id: string;
  title: string;
  domain: string;
  difficulty: string;
  problemStatement: string;
  bom: { item: string; purpose: string; estimatedCost: string }[];
  techStack: string[];
  architectureSteps: string[];
  roadmapDays: { day: string; task: string; deliverable: string }[];
  generatedAt: string;
}

export interface LeaderboardRank {
  rank: number;
  name: string;
  username: string;
  avatar: string;
  monthlyXP: number;
  streakDays: number;
  projectsShipped: number;
  upvotesReceived: number;
  focusDomain: string;
}

export interface UserDashboardData {
  name: string;
  username: string;
  role: string;
  avatar: string;
  streakCount: number;
  totalShips: number;
  xpPoints: number;
  bio: string;
  techStack: string[];
  githubUrl: string;
  discordHandle: string;
  savedSpecs: AISpec[];
  collabApplications: CollabApplication[];
}
