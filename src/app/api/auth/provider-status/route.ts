import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") || "github";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://huvnuudknqbyjblksqwu.supabase.co";

  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
  const callbackUrl = `${supabaseUrl}/auth/v1/callback`;
  const dashboardUrl = `https://supabase.com/dashboard/project/${projectRef}/auth/providers`;

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=${provider}`, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "Aevora-Auth-Check",
      },
    });

    // Supabase returns 400 with "provider is not enabled" if OAuth provider isn't set up
    if (res.status === 400) {
      const text = await res.text();
      if (text.includes("provider is not enabled") || text.includes("Unsupported provider")) {
        return NextResponse.json({
          enabled: false,
          provider,
          callbackUrl,
          dashboardUrl,
          projectRef,
          details: "GitHub OAuth provider is not yet enabled in your Supabase project.",
        });
      }
    }

    // If status is 302, 303, 307 or 200, provider is configured and redirects to GitHub
    return NextResponse.json({
      enabled: true,
      provider,
      callbackUrl,
      dashboardUrl,
      projectRef,
    });
  } catch (err: any) {
    return NextResponse.json({
      enabled: false,
      provider,
      callbackUrl,
      dashboardUrl,
      projectRef,
      error: err.message,
    });
  }
}
