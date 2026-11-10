import { NextResponse } from "next/server";
import { requireVerifiedAdminAPI, isMigrationMissingError } from "@/lib/auth/admin";
import { validateContestInput, sanitizeControlChars } from "@/lib/validation/contests";
import { DUMMY_SEED_CHALLENGE_IDS } from "@/lib/data/initialData";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireVerifiedAdminAPI(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!UUID_REGEX.test(id) || DUMMY_SEED_CHALLENGE_IDS.includes(id)) {
    return NextResponse.json({ error: "Invalid contest ID." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = validateContestInput(body, { partial: true });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updates: Record<string, unknown> = { ...parsed.data };

  if (body.winnerProfileId !== undefined || body.winner_profile_id !== undefined) {
    const winnerId = sanitizeControlChars(
      body.winnerProfileId ?? body.winner_profile_id
    );
    if (!winnerId) {
      updates.winner_profile_id = null;
    } else if (!UUID_REGEX.test(winnerId)) {
      return NextResponse.json({ error: "Invalid winner profile ID." }, { status: 400 });
    } else {
      updates.winner_profile_id = winnerId;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid update fields supplied." }, { status: 400 });
  }

  try {
    const { data, error } = await (auth.supabase.from("challenges") as any)
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      if (isMigrationMissingError(error)) {
        return NextResponse.json(
          { error: "Database schema upgrade required.", migrationRequired: true },
          { status: 503 }
        );
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "Contest slug already exists." }, { status: 409 });
      }
      console.error("[admin/contests PATCH] error:", error);
      return NextResponse.json({ error: "Failed to update contest." }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Contest not found." }, { status: 404 });
    }

    return NextResponse.json(
      { contest: data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/contests PATCH] exception:", err);
    return NextResponse.json({ error: "Unexpected error updating contest." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireVerifiedAdminAPI(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!UUID_REGEX.test(id) || DUMMY_SEED_CHALLENGE_IDS.includes(id)) {
    return NextResponse.json({ error: "Invalid contest ID." }, { status: 400 });
  }

  try {
    const { error } = await auth.supabase
      .from("challenges")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[admin/contests DELETE] error:", error);
      return NextResponse.json({ error: "Unable to delete contest." }, { status: 400 });
    }

    return NextResponse.json(
      { deletedId: id },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/contests DELETE] exception:", err);
    return NextResponse.json({ error: "Unexpected error deleting contest." }, { status: 500 });
  }
}
