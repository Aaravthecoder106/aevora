"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/supabase/types";
import { SEED_PROFILES } from "@/lib/data/initialData";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGithub: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signInAsDemo: (profileKey?: keyof typeof SEED_PROFILES) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  signInWithGithub: async () => {},
  signInWithDiscord: async () => {},
  signInAsDemo: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load demo user if set in localStorage
  useEffect(() => {
    const demoUser = localStorage.getItem("remorph_demo_user");
    if (demoUser && SEED_PROFILES[demoUser]) {
      const demoProfile = SEED_PROFILES[demoUser];
      setProfile(demoProfile);
      setUser({
        id: demoProfile.id,
        email: `${demoProfile.username}@remorph.build`,
        user_metadata: {
          username: demoProfile.username,
          full_name: demoProfile.full_name,
          avatar_url: demoProfile.avatar_url,
        },
      } as any);
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data && !error) {
        setProfile(data as Profile);
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else if (!localStorage.getItem("remorph_demo_user")) {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGithub = async () => {
    localStorage.removeItem("remorph_demo_user");
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithDiscord = async () => {
    localStorage.removeItem("remorph_demo_user");
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInAsDemo = (profileKey: keyof typeof SEED_PROFILES = "alex_volt") => {
    const demoProfile = SEED_PROFILES[profileKey];
    localStorage.setItem("remorph_demo_user", profileKey);
    setProfile(demoProfile);
    setUser({
      id: demoProfile.id,
      email: `${demoProfile.username}@remorph.build`,
      user_metadata: {
        username: demoProfile.username,
        full_name: demoProfile.full_name,
        avatar_url: demoProfile.avatar_url,
      },
    } as any);
  };

  const signOut = async () => {
    localStorage.removeItem("remorph_demo_user");
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signInWithGithub,
        signInWithDiscord,
        signInAsDemo,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
