import { createClient as createBrowserSupabaseClient } from "./supabase/client";

// Unified @supabase/ssr cookie-synced browser client shared across client components
export const supabase = createBrowserSupabaseClient();
