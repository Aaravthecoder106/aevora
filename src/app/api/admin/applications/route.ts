import { NextResponse } from "next/server";
import { requireVerifiedAdminAPI, isMigrationMissingError } from "@/lib/auth/admin";

export async function GET(request: Request) {
  const auth = await requireVerifiedAdminAPI(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const contestFilter = url.searchParams.get("contestId");
  const statusFilter = url.searchParams.get("status");

  try {
    let query = auth.supabase
      .from("contest_applications")
      .select(`
        id,
        contest_id,
        applicant_id,
        team_name,
        project_title,
        track,
        pitch,
        repo_url,
        portfolio_url,
        status,
        created_at,
        applicant:profiles!contest_applications_applicant_id_fkey (
          username,
          full_name,
          avatar_url,
          role,
          ship_count,
          github_url
        ),
        contest:challenges!contest_applications_contest_id_fkey (
          title,
          status,
          max_slots,
          approved_count
        )
      `)
      .order("created_at", { ascending: false });

    if (contestFilter && contestFilter !== "all") {
      query = query.eq("contest_id", contestFilter);
    }
    if (
      statusFilter &&
      ["pending", "approved", "waitlisted", "rejected", "withdrawn"].includes(
        statusFilter
      )
    ) {
      query = query.eq(
        "status",
        statusFilter as
          | "pending"
          | "approved"
          | "waitlisted"
          | "rejected"
          | "withdrawn"
      );
    }

    const { data: appsData, error: appsError } = await query;

    if (appsError) {
      if (isMigrationMissingError(appsError)) {
        return NextResponse.json(
          { error: "Database schema migration required.", migrationRequired: true },
          { status: 503 }
        );
      }
      console.error("[admin/applications GET] error:", appsError);
      return NextResponse.json({ error: "Failed to load applications." }, { status: 500 });
    }

    const { data: reviewsData } = await auth.supabase
      .from("contest_application_reviews")
      .select("application_id, admin_notes, reviewed_at");

    const reviewById: Record<string, { admin_notes: string | null; reviewed_at: string }> = {};
    (reviewsData || []).forEach((r: any) => {
      reviewById[r.application_id] = r;
    });

    const applications = (appsData || []).map((row: any) => {
      const applicant = row.applicant || {};
      const contest = row.contest || {};
      const review = reviewById[row.id];
      const username = applicant.username || "builder";

      return {
        id: row.id,
        contestId: row.contest_id,
        contestTitle: contest.title || "Contest",
        contestStatus: contest.status || "active",
        contestMaxSlots: contest.max_slots ?? null,
        contestApprovedCount: contest.approved_count ?? 0,
        applicantId: row.applicant_id,
        applicantName: applicant.full_name || username,
        applicantUsername: username,
        applicantAvatar:
          applicant.avatar_url ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        applicantRole: applicant.role || "Builder",
        applicantShipCount: applicant.ship_count ?? 0,
        applicantGithubUrl: applicant.github_url || null,
        teamName: row.team_name || null,
        projectTitle: row.project_title,
        track: row.track || null,
        pitch: row.pitch,
        repoUrl: row.repo_url || null,
        portfolioUrl: row.portfolio_url || null,
        status: row.status,
        adminNotes: review?.admin_notes || "",
        reviewedAt: review?.reviewed_at || null,
        createdAt: row.created_at,
      };
    });

    return NextResponse.json(
      { applications },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/applications GET] exception:", err);
    return NextResponse.json({ error: "Unexpected error fetching applications." }, { status: 500 });
  }
}
