import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  verifySameOrigin,
  checkRateLimit,
  getClientIp,
  isMigrationMissingError,
} from "@/lib/auth/admin";
import { validateContestApplicationInput } from "@/lib/validation/contests";
import { DUMMY_SEED_CHALLENGE_IDS } from "@/lib/data/initialData";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json(
      { error: "Cross-origin requests are not allowed." },
      { status: 403 }
    );
  }

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit(`apply-ip:${ip}`, 30, 60_000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many application requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } }
    );
  }

  const { id: contestId } = await context.params;
  if (!UUID_REGEX.test(contestId) || DUMMY_SEED_CHALLENGE_IDS.includes(contestId)) {
    return NextResponse.json({ error: "Invalid contest ID." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Please sign in to apply to a contest." },
      { status: 401 }
    );
  }

  const userLimit = checkRateLimit(`apply-user:${user.id}`, 15, 60_000);
  if (!userLimit.allowed) {
    return NextResponse.json(
      { error: "Application rate limit exceeded." },
      { status: 429, headers: { "Retry-After": String(userLimit.retryAfterSeconds) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = validateContestApplicationInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    // Always enforce applicant_id and status='pending' server-side regardless of payload
    const { data, error } = await (supabase.from("contest_applications") as any)
      .insert({
        contest_id: contestId,
        applicant_id: user.id,
        ...parsed.data,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      if (isMigrationMissingError(error)) {
        return NextResponse.json(
          { error: "Contest applications table is not initialized yet.", migrationRequired: true },
          { status: 503 }
        );
      }
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You have already applied to this contest." },
          { status: 409 }
        );
      }
      const msg = String(error.message || "");
      const knownValidation = [
        "Application deadline has passed",
        "Contest applications are closed",
        "This contest is not published",
        "Contest not found",
        "Invalid repository URL",
        "Invalid portfolio URL",
        "confirm the contest rules",
      ];
      const matchedMsg = knownValidation.find((k) => msg.includes(k));
      if (matchedMsg) {
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      console.error("[contests/apply POST] error:", error);
      return NextResponse.json(
        { error: "Unable to submit contest application." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { application: data },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[contests/apply POST] exception:", err);
    return NextResponse.json(
      { error: "Unexpected error submitting application." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json(
      { error: "Cross-origin requests are not allowed." },
      { status: 403 }
    );
  }

  const { id: contestId } = await context.params;
  if (!UUID_REGEX.test(contestId)) {
    return NextResponse.json({ error: "Invalid contest ID." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (body.action !== "withdraw") {
    return NextResponse.json({ error: "Unsupported application action." }, { status: 400 });
  }

  try {
    const { data, error } = await (supabase.from("contest_applications") as any)
      .update({ status: "withdrawn" })
      .eq("contest_id", contestId)
      .eq("applicant_id", user.id)
      .eq("status", "pending")
      .select()
      .maybeSingle();

    if (error) {
      console.error("[contests/apply PATCH] error:", error);
      return NextResponse.json(
        { error: "Unable to withdraw application." },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Only pending applications can be withdrawn." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { application: data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[contests/apply PATCH] exception:", err);
    return NextResponse.json(
      { error: "Unexpected error updating application." },
      { status: 500 }
    );
  }
}
