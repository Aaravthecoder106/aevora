import { NextResponse } from "next/server";
import { requireVerifiedAdminAPI, isMigrationMissingError } from "@/lib/auth/admin";

export async function GET(request: Request) {
  const auth = await requireVerifiedAdminAPI(request);
  if (!auth.ok) return auth.response;

  try {
    const { data, error } = await auth.supabase
      .from("admin_audit_logs")
      .select(`
        id,
        actor_id,
        action,
        target_type,
        target_id,
        metadata,
        created_at,
        actor:profiles!admin_audit_logs_actor_id_fkey (
          username,
          full_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      if (isMigrationMissingError(error)) {
        return NextResponse.json(
          { error: "Database schema migration required.", migrationRequired: true },
          { status: 503 }
        );
      }
      console.error("[admin/audit-logs GET] error:", error);
      return NextResponse.json({ error: "Failed to load audit logs." }, { status: 500 });
    }

    const logs = (data || []).map((row: any) => ({
      id: row.id,
      actorId: row.actor_id,
      actorUsername: row.actor?.username || "admin",
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      metadata: row.metadata || {},
      createdAt: row.created_at,
    }));

    return NextResponse.json(
      { logs },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/audit-logs GET] exception:", err);
    return NextResponse.json({ error: "Unexpected error fetching audit logs." }, { status: 500 });
  }
}
