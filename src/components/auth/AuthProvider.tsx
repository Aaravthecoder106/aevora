"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/supabase/types";
import {
  isReservedAdminEmail,
  isReservedAdminUsername,
} from "@/lib/validation/contests";

interface SignUpMetadata {
  username: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithGithub: () => Promise<{ error: any; setupRequired?: boolean; config?: any }>;
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
  isAdmin: false,
  isLoading: true,
  signInWithGithub: async () => ({ error: null }),
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
    let mounted = true;

    async function initAuth() {
      try {
        const [{ data: sessionData }, { data: userData }] = await Promise.all([
          supabase.auth.getSession(),
          supabase.auth.getUser(),
        ]);

        if (!mounted) return;
        setSession(sessionData.session);

        const verifiedUser = userData.user || sessionData.session?.user || null;
        if (verifiedUser) {
          setUser(verifiedUser);
          await fetchProfile(verifiedUser.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        setUser(nextSession.user);
        fetchProfile(nextSession.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGithub = async () => {
    try {
      const checkRes = await fetch("/api/auth/provider-status?provider=github");
      const statusData = await checkRes.json();

      if (!statusData.enabled) {
        return {
          error: {
            message:
              "GitHub OAuth is not configured on this Supabase project yet.",
          },
          setupRequired: true,
          config: statusData,
        };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error, setupRequired: false, config: null };
    } catch (err: any) {
      return {
        error: { message: err.message || "Failed to initiate GitHub authentication." },
        setupRequired: false,
      };
    }
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
    const cleanEmail = email.trim().toLowerCase();
    if (isReservedAdminEmail(cleanEmail)) {
      return {
        error: {
          message: "Administrator accounts must authenticate with password and 2FA.",
        },
      };
    }
    const res = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: res.error };
  };

  const signUpWithPassword = async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = metadata.username.replace("@", "").trim().toLowerCase();

    if (isReservedAdminEmail(cleanEmail)) {
      return {
        error: {
          message:
            "This email domain is reserved for Aevora administrators. Please use Sign In or register with your own email.",
        },
      };
    }

    if (isReservedAdminUsername(cleanUsername)) {
      return {
        error: {
          message: "This handle is reserved. Please pick a different @username.",
        },
      };
    }

    if (password.length < 8) {
      return {
        error: {
          message: "Password must be at least 8 characters long.",
        },
      };
    }

    const res = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: cleanUsername,
          full_name: metadata.fullName.trim(),
          role: metadata.role,
        },
      },
    });

    if (res.error) {
      const errMsg = res.error.message.toLowerCase();
      if (
        errMsg.includes("already registered") ||
        errMsg.includes("already exists") ||
        errMsg.includes("already in use")
      ) {
        return {
          error: {
            message: "An account with this email already exists. Please use Sign In.",
          },
        };
      }
      return { error: res.error };
    }

    if (!res.data.session) {
      const signInRes = await supabase.auth.signInWithPassword({
        email: cleanEmail,
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

    if (res.data.session && res.data.user) {
      setSession(res.data.session);
      setUser(res.data.user);
      await fetchProfile(res.data.user.id);
    }

    return { error: null };
  };

  const signInWithPassword = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await supabase.auth.signInWithPassword({
      email: cleanEmail,
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

  // Both tamper-proof app_metadata AND protected profile flag must agree for Admin UI visibility
  const isAdmin = Boolean(
    user &&
      (user.app_metadata as Record<string, unknown> | undefined)?.role === "admin" &&
      profile?.is_admin === true
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAdmin,
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
