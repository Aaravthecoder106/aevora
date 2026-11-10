import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminSessionState } from "@/lib/auth/admin";
import { AdminMfaGate } from "@/components/admin/AdminMfaGate";
import { AdminConsole } from "@/components/admin/AdminConsole";

async function AdminServerGate() {
  const state = await getAdminSessionState();

  if (state.status === "unauthenticated" || state.status === "forbidden") {
    redirect("/");
  }

  if (state.status === "mfa_enroll_required") {
    return (
      <AdminMfaGate
        mode="enroll"
        adminEmail={state.user.email || "admin@aevora.com"}
      />
    );
  }

  if (state.status === "mfa_verify_required") {
    return (
      <AdminMfaGate
        mode="verify"
        factorId={state.factorId}
        adminEmail={state.user.email || "admin@aevora.com"}
      />
    );
  }

  return <AdminConsole adminEmail={state.user.email || "admin@aevora.com"} />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-16 text-center font-mono text-xs text-slate-500 dark:text-[#8c909f]">
          Verifying administrator authorization &amp; AAL2 session...
        </div>
      }
    >
      <AdminServerGate />
    </Suspense>
  );
}
