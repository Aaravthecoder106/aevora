"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/supabase/types";

interface SignUpMetadata {
  username: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGithub: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<{ error: any }>;
  signUpWithPassword: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: any }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
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
  signInWithOtp: async () => ({ error: null }),
  signUpWithPassword: async () => ({ error: null }),
  signInWithPassword: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string, retries = 2) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data && !error) {
        setProfile(data as Profile);
      } else if (retries > 0) {
        setTimeout(() => fetchProfile(userId, retries - 1), 350);
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
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithOtp = async (email: string) => {
    const res = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: res.error };
  };

  const signUpWithPassword = async (email: string, password: string, metadata: SignUpMetadata) => {
    const cleanUsername = metadata.username.replace("@", "").trim().toLowerCase();
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
          full_name: metadata.fullName.trim(),
          role: metadata.role,
        },
      },
    });

    // Case 1: Sign up failed
    if (res.error) {
      const errMsg = res.error.message.toLowerCase();
      // If already registered, attempt seamless sign in
      if (errMsg.includes("already registered") || errMsg.includes("already exists") || errMsg.includes("already in use")) {
        const signInRes = await supabase.auth.signInWithPassword({ email, password });
        if (signInRes.data.session && signInRes.data.user) {
          setSession(signInRes.data.session);
          setUser(signInRes.data.user);
          await fetchProfile(signInRes.data.user.id);
          return { error: null };
        }
        return { error: signInRes.error || res.error };
      }
      return { error: res.error };
    }

    // Case 2: Sign up succeeded, but no session returned yet
    // Because PostgreSQL trigger automatically confirmed email_confirmed_at, sign in immediately!
    if (!res.data.session) {
      const signInRes = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInRes.data.session && signInRes.data.user) {
        setSession(signInRes.data.session);
        setUser(signInRes.data.user);
        await fetchProfile(signInRes.data.user.id);
        return { error: null };
      }
      if (signInRes.error) {
        return { error: signInRes.error };
      }
    }

    // Case 3: Session is directly available
    if (res.data.session && res.data.user) {
      setSession(res.data.session);
      setUser(res.data.user);
      await fetchProfile(res.data.user.id);
    }

    return { error: null };
  };

  const signInWithPassword = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (res.data.session && res.data.user && !res.error) {
      setSession(res.data.session);
      setUser(res.data.user);
      await fetchProfile(res.data.user.id);
    }
    return { error: res.error };
  };

  const signOut = async () => {
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
        signInWithOtp,
        signUpWithPassword,
        signInWithPassword,
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
