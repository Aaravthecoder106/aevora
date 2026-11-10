export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  bio: string | null;
  tech_stack: string[];
  github_url: string | null;
  discord_handle: string | null;
  ship_count: number;
  streak_count: number;
  last_shipped_at: string | null;
  is_admin: boolean;
  created_at: string;
};

export type Challenge = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  prize_pool: string | null;
  rules: string | null;
  status: "upcoming" | "active" | "completed";
  starts_at: string;
  ends_at: string;
  application_deadline: string | null;
  max_slots: number | null;
  require_approval_to_submit: boolean;
  is_published: boolean;
  sponsored_by: string | null;
  created_by: string | null;
  applications_count: number;
  approved_count: number;
  winner_profile_id: string | null;
  created_at: string;
  winner?: Profile | null;
};

export type ContestApplicationStatus =
  | "pending"
  | "approved"
  | "waitlisted"
  | "rejected"
  | "withdrawn";

export type ContestApplication = {
  id: string;
  contest_id: string;
  applicant_id: string;
  team_name: string | null;
  project_title: string;
  track: string | null;
  pitch: string;
  repo_url: string | null;
  portfolio_url: string | null;
  status: ContestApplicationStatus;
  accepted_rules: boolean;
  created_at: string;
  updated_at: string;
  applicant?: Profile | null;
  contest?: Challenge | null;
};

export type ContestApplicationReview = {
  application_id: string;
  reviewer_id: string | null;
  decision: "pending" | "approved" | "waitlisted" | "rejected";
  admin_notes: string | null;
  reviewed_at: string;
};

export type AdminAuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Json;
  created_at: string;
  actor?: Profile | null;
};

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  status: string | null;
  tech_stack: string[];
  repo_url: string | null;
  demo_url: string | null;
  looking_for_collaborators: boolean;
  open_roles: Json;
  created_at: string;
};

export type ShipLog = {
  id: string;
  author_id: string;
  project_id: string | null;
  challenge_id: string | null;
  type: string | null;
  content: string;
  snippet_title: string | null;
  snippet_body: string | null;
  media_urls: string[];
  github_url: string | null;
  demo_url: string | null;
  tags: string[];
  upvotes_count: number;
  created_at: string;
  author?: Profile;
  project?: Project | null;
  challenge?: Challenge | null;
  user_has_upvoted?: boolean;
};

export type ShipUpvote = {
  id: string;
  ship_log_id: string;
  user_id: string;
  created_at: string;
};

export type ShipComment = {
  id: string;
  ship_log_id: string;
  author_id: string;
  content: string;
  created_at: string;
};

export type CollabRequest = {
  id: string;
  project_id: string;
  applicant_id: string;
  role_applied: string;
  pitch: string;
  portfolio_url: string | null;
  status: string;
  created_at: string;
};

export type BlueprintRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  tech_stack: string[];
  author: string;
  stars: number;
  license: string;
  download_url: string;
  repo_url: string | null;
  preview_snippet: string | null;
  created_at: string;
};

export type SavedBlueprintRow = {
  id: string;
  user_id: string;
  title: string;
  domain: string;
  difficulty: string;
  problem_statement: string;
  bom: Json;
  tech_stack: string[];
  architecture_steps: string[];
  roadmap_days: Json;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      challenges: {
        Row: Challenge;
        Insert: Partial<Challenge> & {
          slug: string;
          title: string;
          description: string;
          starts_at: string;
          ends_at: string;
        };
        Update: Partial<Challenge>;
        Relationships: [
          {
            foreignKeyName: "challenges_winner_profile_id_fkey";
            columns: ["winner_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      contest_applications: {
        Row: ContestApplication;
        Insert: Partial<ContestApplication> & {
          contest_id: string;
          applicant_id: string;
          project_title: string;
          pitch: string;
          accepted_rules: boolean;
        };
        Update: Partial<ContestApplication>;
        Relationships: [
          {
            foreignKeyName: "contest_applications_contest_id_fkey";
            columns: ["contest_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contest_applications_applicant_id_fkey";
            columns: ["applicant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      contest_application_reviews: {
        Row: ContestApplicationReview;
        Insert: Partial<ContestApplicationReview> & {
          application_id: string;
          decision: "pending" | "approved" | "waitlisted" | "rejected";
        };
        Update: Partial<ContestApplicationReview>;
        Relationships: [
          {
            foreignKeyName: "contest_application_reviews_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: true;
            referencedRelation: "contest_applications";
            referencedColumns: ["id"];
          }
        ];
      };
      admin_audit_logs: {
        Row: AdminAuditLog;
        Insert: Partial<AdminAuditLog> & {
          action: string;
          target_type: string;
        };
        Update: Partial<AdminAuditLog>;
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: Project;
        Insert: Partial<Project> & { owner_id: string; name: string; slug: string };
        Update: Partial<Project>;
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      ship_logs: {
        Row: ShipLog;
        Insert: Partial<ShipLog> & { author_id: string; content: string };
        Update: Partial<ShipLog>;
        Relationships: [
          {
            foreignKeyName: "ship_logs_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ship_logs_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ship_logs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      ship_upvotes: {
        Row: ShipUpvote;
        Insert: { ship_log_id: string; user_id: string };
        Update: Partial<ShipUpvote>;
        Relationships: [
          {
            foreignKeyName: "ship_upvotes_ship_log_id_fkey";
            columns: ["ship_log_id"];
            isOneToOne: false;
            referencedRelation: "ship_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ship_upvotes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      ship_comments: {
        Row: ShipComment;
        Insert: Partial<ShipComment> & {
          ship_log_id: string;
          author_id: string;
          content: string;
        };
        Update: Partial<ShipComment>;
        Relationships: [
          {
            foreignKeyName: "ship_comments_ship_log_id_fkey";
            columns: ["ship_log_id"];
            isOneToOne: false;
            referencedRelation: "ship_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ship_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      collab_requests: {
        Row: CollabRequest;
        Insert: Partial<CollabRequest> & {
          project_id: string;
          applicant_id: string;
          role_applied: string;
          pitch: string;
        };
        Update: Partial<CollabRequest>;
        Relationships: [
          {
            foreignKeyName: "collab_requests_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collab_requests_applicant_id_fkey";
            columns: ["applicant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      blueprints: {
        Row: BlueprintRow;
        Insert: Partial<BlueprintRow> & {
          title: string;
          description: string;
          category: string;
          author: string;
          download_url: string;
        };
        Update: Partial<BlueprintRow>;
        Relationships: [];
      };
      saved_blueprints: {
        Row: SavedBlueprintRow;
        Insert: Partial<SavedBlueprintRow> & {
          user_id: string;
          title: string;
          domain: string;
          difficulty: string;
          problem_statement: string;
        };
        Update: Partial<SavedBlueprintRow>;
        Relationships: [
          {
            foreignKeyName: "saved_blueprints_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
