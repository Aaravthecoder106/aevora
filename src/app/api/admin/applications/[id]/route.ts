import { NextResponse } from "next/server";
import { requireVerifiedAdminAPI, isMigrationMissingError } from "@/lib/auth/admin";
import { validateApplicationReviewInput } from "@/lib/validation/contests";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireVerifiedAdminAPI(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid application ID." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = validateApplicationReviewInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const { data: updatedApp, error: updateError } = await (
      auth.supabase.from("contest_applications") as any
    )
      .update({ status: parsed.data.status })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updateError) {
      if (isMigrationMissingError(updateError)) {
        return NextResponse.json(
          { error: "Database schema migration required.", migrationRequired: true },
          { status: 503 }
        );
      }
      const msg = String(updateError.message || "");
      if (msg.includes("maximum approved slots")) {
        return NextResponse.json({ error: msg }, { status: 409 });
      }
      console.error("[admin/applications PATCH] update error:", updateError);
      return NextResponse.json(
        { error: "Unable to update application status." },
        { status: 400 }
      );
    }

    if (!updatedApp) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const { error: reviewError } = await (
      auth.supabase.from("contest_application_reviews") as any
    ).upsert(
      {
        application_id: id,
        reviewer_id: auth.user.id,
        decision: parsed.data.status,
        admin_notes: parsed.data.admin_notes,
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: "application_id" }
    );

    if (reviewError) {
      console.error("[admin/applications PATCH] review upsert error:", reviewError);
    }

    return NextResponse.json(
      {
        application: updatedApp,
        adminNotes: parsed.data.admin_notes || "",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/applications PATCH] exception:", err);
    return NextResponse.json(
      { error: "Unexpected error updating application." },
      { status: 500 }
    );
  }
}
