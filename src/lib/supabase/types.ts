export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role?: string | null;
  bio: string | null;
  tech_stack: string[];
  github_url: string | null;
  discord_handle: string | null;
  ship_count: number;
  streak_count: number;
  last_shipped_at: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  rules: string | null;
  status: "upcoming" | "active" | "completed";
  starts_at: string;
  ends_at: string;
  winner_profile_id: string | null;
  created_at: string;
  winner?: Profile | null;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  tagline: string | null;
  repo_url: string | null;
  demo_url: string | null;
  looking_for_collaborators: boolean;
  created_at: string;
}

export interface ShipLog {
  id: string;
  author_id: string;
  project_id: string | null;
  challenge_id: string | null;
  content: string;
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
}

export interface ShipUpvote {
  id: string;
  ship_log_id: string;
  user_id: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
      };
      challenges: {
        Row: Challenge;
        Insert: Partial<Challenge> & { slug: string; title: string; description: string; starts_at: string; ends_at: string };
        Update: Partial<Challenge>;
      };
      projects: {
        Row: Project;
        Insert: Partial<Project> & { owner_id: string; name: string; slug: string };
        Update: Partial<Project>;
      };
      ship_logs: {
        Row: ShipLog;
        Insert: Partial<ShipLog> & { author_id: string; content: string };
        Update: Partial<ShipLog>;
      };
      ship_upvotes: {
        Row: ShipUpvote;
        Insert: { ship_log_id: string; user_id: string };
        Update: Partial<ShipUpvote>;
      };
    };
  };
}
