import { NextResponse } from "next/server";
import { requireVerifiedAdminAPI, isMigrationMissingError } from "@/lib/auth/admin";
import { validateContestInput } from "@/lib/validation/contests";
import { DUMMY_SEED_CHALLENGE_IDS } from "@/lib/data/initialData";

export async function GET(request: Request) {
  const auth = await requireVerifiedAdminAPI(request);
  if (!auth.ok) return auth.response;

  try {
    const { data, error } = await auth.supabase
      .from("challenges")
      .select("*, winner:profiles!challenges_winner_profile_id_fkey(id, username, full_name)")
      .order("created_at", { ascending: false });

    if (error) {
      if (isMigrationMissingError(error)) {
        return NextResponse.json(
          {
            error:
              "Database schema upgrade required. Run supabase/migrations/20261110_admin_contests_security.sql in Supabase SQL Editor.",
            migrationRequired: true,
          },
          { status: 503 }
        );
      }
      console.error("[admin/contests GET] error:", error);
      return NextResponse.json({ error: "Failed to load contests." }, { status: 500 });
    }

    const { data: shipCountsData } = await auth.supabase
      .from("ship_logs")
      .select("challenge_id")
      .not("challenge_id", "is", null);

    const submissionsMap: Record<string, number> = {};
    (shipCountsData || []).forEach((row: any) => {
      if (row.challenge_id) {
        submissionsMap[row.challenge_id] = (submissionsMap[row.challenge_id] || 0) + 1;
      }
    });

    const contests = (data || [])
      .filter((c: any) => !DUMMY_SEED_CHALLENGE_IDS.includes(c.id))
      .map((c: any) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        tagline: c.tagline || "",
        description: c.description,
        prizePool: c.prize_pool || "",
        sponsoredBy: c.sponsored_by || "",
        rules: c.rules ? String(c.rules).split("\n").filter(Boolean) : [],
        status: c.status,
        startsAt: c.starts_at,
        endsAt: c.ends_at,
        applicationDeadline: c.application_deadline || null,
        maxSlots: c.max_slots ?? null,
        requireApprovalToSubmit: c.require_approval_to_submit ?? true,
        isPublished: c.is_published ?? false,
        applicationsCount: c.applications_count ?? 0,
        approvedCount: c.approved_count ?? 0,
        submissionsCount: submissionsMap[c.id] || 0,
        winnerProfileId: c.winner_profile_id || null,
        winner: c.winner || null,
        createdAt: c.created_at,
      }));

    return NextResponse.json(
      { contests },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/contests GET] exception:", err);
    return NextResponse.json({ error: "Unexpected error fetching contests." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireVerifiedAdminAPI(request);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = validateContestInput(body, { partial: false });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const payload = {
      ...parsed.data,
      created_by: auth.user.id,
    };

    const { data, error } = await (auth.supabase.from("challenges") as any)
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (isMigrationMissingError(error)) {
        return NextResponse.json(
          {
            error:
              "Database schema migration missing. Run supabase/migrations/20261110_admin_contests_security.sql first.",
            migrationRequired: true,
          },
          { status: 503 }
        );
      }
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A contest with this URL slug already exists. Choose a different title or slug." },
          { status: 409 }
        );
      }
      console.error("[admin/contests POST] error:", error);
      return NextResponse.json({ error: "Unable to create contest." }, { status: 400 });
    }

    return NextResponse.json(
      { contest: data },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/contests POST] exception:", err);
    return NextResponse.json({ error: "Unexpected error creating contest." }, { status: 500 });
  }
}
