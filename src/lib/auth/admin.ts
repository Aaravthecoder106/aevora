import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Sliding-window in-memory rate limiter (defense-in-depth per serverless/node instance)
const rateBuckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests = 40,
  windowMs = 60_000
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (rateBuckets.get(key) || []).filter((ts) => ts > cutoff);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    rateBuckets.set(key, timestamps);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export function verifySameOrigin(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (!host) return false;

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      return originHost === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refHost = new URL(referer).host;
      return refHost === host;
    } catch {
      return false;
    }
  }

  return false;
}

export type AdminSessionState =
  | { status: "unauthenticated" }
  | { status: "forbidden"; user: User }
  | { status: "mfa_enroll_required"; user: User }
  | { status: "mfa_verify_required"; user: User; factorId: string }
  | { status: "authorized"; user: User; aal: "aal2" };

export async function getAdminSessionState(): Promise<AdminSessionState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "unauthenticated" };
  }

  const appMetaRole = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (appMetaRole !== "admin") {
    return { status: "forbidden", user };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile as { is_admin?: boolean }).is_admin !== true) {
    return { status: "forbidden", user };
  }

  const [{ data: factorsData }, { data: aalData }] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  const verifiedTotp = (factorsData?.totp || []).filter(
    (f) => f.status === "verified"
  );

  if (verifiedTotp.length === 0) {
    return { status: "mfa_enroll_required", user };
  }

  if (aalData?.currentLevel !== "aal2") {
    return {
      status: "mfa_verify_required",
      user,
      factorId: verifiedTotp[0].id,
    };
  }

  return { status: "authorized", user, aal: "aal2" };
}

export async function requireVerifiedAdminAPI(request: Request) {
  if (!verifySameOrigin(request)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "CSRF protection: cross-origin state mutation blocked." },
        { status: 403 }
      ),
    };
  }

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit(`admin-ip:${ip}`, 90, 60_000);
  if (!ipLimit.allowed) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Rate limit exceeded. Slow down admin requests." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        }
      ),
    };
  }

  const state = await getAdminSessionState();

  if (state.status === "unauthenticated") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  if (state.status === "forbidden") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Forbidden: verified administrator privileges required." },
        { status: 403 }
      ),
    };
  }

  if (
    state.status === "mfa_enroll_required" ||
    state.status === "mfa_verify_required"
  ) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            "Two-Factor Authentication (AAL2) verification is required for admin actions.",
          code: state.status,
        },
        { status: 403 }
      ),
    };
  }

  const supabase = await createClient();
  return {
    ok: true as const,
    user: state.user,
    supabase,
  };
}

export function isMigrationMissingError(error: any): boolean {
  const code = String(error?.code || "");
  const msg = String(error?.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "42703" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the")
  );
}
