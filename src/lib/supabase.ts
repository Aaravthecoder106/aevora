import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://huvnuudknqbyjblksqwu.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dm51dWRrbnFieWpibGtzcXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNzU5MTgsImV4cCI6MjEwOTY1MTkxOH0.0pgMlQixSAx9trx6cy3Hy9fFfgVX2tNn7a2cSzAQPQI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
