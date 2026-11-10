"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Trophy,
  Users,
  FileText,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Award,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import type {
  AdminAuditLogItem,
  AdminContestApplicationRow,
  ChallengeItem,
  ContestApplicationStatus,
} from "@/lib/types/community";

interface AdminContestRow extends ChallengeItem {
  winnerProfileId?: string | null;
  winner?: { id: string; username: string; full_name: string | null } | null;
  createdAt?: string;
}

interface ContestFormState {
  id?: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  prizePool: string;
  sponsoredBy: string;
  rulesText: string;
  status: "upcoming" | "active" | "completed";
  startsAt: string;
  applicationDeadline: string;
  endsAt: string;
  maxSlots: string;
  requireApprovalToSubmit: boolean;
  isPublished: boolean;
}

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function getDefaultContestForm(): ContestFormState {
  const now = new Date();
  const appDeadline = new Date(now.getTime() + 7 * 86400_000);
  const ends = new Date(now.getTime() + 14 * 86400_000);
  return {
    title: "",
    slug: "",
    tagline: "",
    description: "",
    prizePool: "",
    sponsoredBy: "",
    rulesText: "",
    status: "active",
    startsAt: toDatetimeLocalValue(now.toISOString()),
    applicationDeadline: toDatetimeLocalValue(appDeadline.toISOString()),
    endsAt: toDatetimeLocalValue(ends.toISOString()),
    maxSlots: "",
    requireApprovalToSubmit: true,
    isPublished: false,
  };
}

export function AdminConsole({ adminEmail }: { adminEmail: string }) {
  const [activeTab, setActiveTab] = useState<"contests" | "applications" | "audit">(
    "contests"
  );
  const [contests, setContests] = useState<AdminContestRow[]>([]);
  const [applications, setApplications] = useState<AdminContestApplicationRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [migrationWarning, setMigrationWarning] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  // Contest Form Modal / Drawer State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<ContestFormState>(getDefaultContestForm);
  const [isSavingContest, setIsSavingContest] = useState(false);

  // Application filters & note drafts
  const [appContestFilter, setAppContestFilter] = useState<string>("all");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [busyAppId, setBusyAppId] = useState<string | null>(null);

  const loadAllAdminData = useCallback(async () => {
    setIsLoading(true);
    setBannerError(null);
    setMigrationWarning(null);

    try {
      const [contestsRes, appsRes, logsRes] = await Promise.all([
        fetch("/api/admin/contests", { cache: "no-store" }),
        fetch("/api/admin/applications", { cache: "no-store" }),
        fetch("/api/admin/audit-logs", { cache: "no-store" }),
      ]);

      const [contestsJson, appsJson, logsJson] = await Promise.all([
        contestsRes.json(),
        appsRes.json(),
        logsRes.json(),
      ]);

      if (contestsJson.migrationRequired || appsJson.migrationRequired) {
        setMigrationWarning(
          contestsJson.error ||
            "Run supabase/migrations/20261110_admin_contests_security.sql in your Supabase SQL Editor to activate Contests & Applications tables."
        );
      }

      if (contestsRes.ok && Array.isArray(contestsJson.contests)) {
        setContests(contestsJson.contests);
      } else if (!contestsJson.migrationRequired && contestsJson.error) {
        setBannerError(contestsJson.error);
      }

      if (appsRes.ok && Array.isArray(appsJson.applications)) {
        setApplications(appsJson.applications);
        const initialNotes: Record<string, string> = {};
        appsJson.applications.forEach((a: AdminContestApplicationRow) => {
          initialNotes[a.id] = a.adminNotes || "";
        });
        setNotesDraft(initialNotes);
      }

      if (logsRes.ok && Array.isArray(logsJson.logs)) {
        setAuditLogs(logsJson.logs);
      }
    } catch {
      setBannerError("Failed to connect to Admin APIs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllAdminData();
  }, [loadAllAdminData]);

  const showToast = (msg: string) => {
    setBannerSuccess(msg);
    setTimeout(() => setBannerSuccess(null), 3500);
  };

  const openCreateForm = () => {
    setFormState(getDefaultContestForm());
    setBannerError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (contest: AdminContestRow) => {
    setFormState({
      id: contest.id,
      title: contest.title,
      slug: contest.slug,
      tagline: contest.tagline || "",
      description: contest.description,
      prizePool: contest.prizePool || "",
      sponsoredBy: contest.sponsoredBy || "",
      rulesText: (contest.rules || []).join("\n"),
      status: contest.status,
      startsAt: toDatetimeLocalValue(contest.startsAt),
      applicationDeadline: toDatetimeLocalValue(contest.applicationDeadline),
      endsAt: toDatetimeLocalValue(contest.endsAt),
      maxSlots: contest.maxSlots ? String(contest.maxSlots) : "",
      requireApprovalToSubmit: contest.requireApprovalToSubmit ?? true,
      isPublished: Boolean(contest.isPublished),
    });
    setBannerError(null);
    setIsFormOpen(true);
  };

  const handleSaveContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContest(true);
    setBannerError(null);

    try {
      const payload = {
        title: formState.title,
        slug: formState.slug || undefined,
        tagline: formState.tagline,
        description: formState.description,
        prizePool: formState.prizePool,
        sponsoredBy: formState.sponsoredBy,
        rules: formState.rulesText,
        status: formState.status,
        startsAt: formState.startsAt ? new Date(formState.startsAt).toISOString() : undefined,
        applicationDeadline: formState.applicationDeadline
          ? new Date(formState.applicationDeadline).toISOString()
          : null,
        endsAt: formState.endsAt ? new Date(formState.endsAt).toISOString() : undefined,
        maxSlots: formState.maxSlots ? Number(formState.maxSlots) : null,
        requireApprovalToSubmit: formState.requireApprovalToSubmit,
        isPublished: formState.isPublished,
      };

      const isEdit = Boolean(formState.id);
      const url = isEdit
        ? `/api/admin/contests/${formState.id}`
        : "/api/admin/contests";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setBannerError(data.error || "Unable to save contest.");
        return;
      }

      setIsFormOpen(false);
      showToast(isEdit ? "Contest updated cleanly." : "New contest created.");
      await loadAllAdminData();
    } catch {
      setBannerError("Network error while saving contest.");
    } finally {
      setIsSavingContest(false);
    }
  };

  const handleTogglePublish = async (contest: AdminContestRow) => {
    setBannerError(null);
    const res = await fetch(`/api/admin/contests/${contest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !contest.isPublished }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBannerError(data.error || "Failed to update contest visibility.");
      return;
    }
    showToast(contest.isPublished ? "Contest unpublished (draft)." : "Contest published live.");
    await loadAllAdminData();
  };

  const handleStatusChange = async (
    contestId: string,
    status: "upcoming" | "active" | "completed"
  ) => {
    setBannerError(null);
    const res = await fetch(`/api/admin/contests/${contestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBannerError(data.error || "Failed to update contest status.");
      return;
    }
    showToast(`Contest status updated to ${status.toUpperCase()}.`);
    await loadAllAdminData();
  };

  const handleSelectWinner = async (contestId: string, winnerProfileId: string) => {
    setBannerError(null);
    const res = await fetch(`/api/admin/contests/${contestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerProfileId: winnerProfileId || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBannerError(data.error || "Failed to set contest winner.");
      return;
    }
    showToast("Contest winner updated.");
    await loadAllAdminData();
  };

  const handleDeleteContest = async (contest: AdminContestRow) => {
    if (!confirm(`Delete "${contest.title}" permanently? This also removes its applications.`)) {
      return;
    }
    setBannerError(null);
    const res = await fetch(`/api/admin/contests/${contest.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      setBannerError(data.error || "Failed to delete contest.");
      return;
    }
    showToast("Contest deleted.");
    await loadAllAdminData();
  };

  const handleReviewApplication = async (
    appId: string,
    nextStatus: Exclude<ContestApplicationStatus, "withdrawn">
  ) => {
    setBusyAppId(appId);
    setBannerError(null);
    try {
      const res = await fetch(`/api/admin/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          adminNotes: notesDraft[appId] || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBannerError(data.error || "Failed to review application.");
        return;
      }
      showToast(`Application marked ${nextStatus.toUpperCase()}.`);
      await loadAllAdminData();
    } catch {
      setBannerError("Network error while updating application.");
    } finally {
      setBusyAppId(null);
    }
  };

  const filteredApplications = applications.filter((a) => {
    if (appContestFilter !== "all" && a.contestId !== appContestFilter) return false;
    if (appStatusFilter !== "all" && a.status !== appStatusFilter) return false;
    return true;
  });

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const activePublishedCount = contests.filter(
    (c) => c.isPublished && c.status === "active"
  ).length;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Admin Header Bar */}
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/80 dark:border-transparent">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AEVORA // ADMIN CONSOLE</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AAL2 2FA VERIFIED
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#8c909f]">
              {adminEmail}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#e3e1e9] tracking-tight">
            Protected Contest Control &amp; Member Applications
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={loadAllAdminData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-xs font-mono text-slate-700 dark:text-[#c2c6d6] hover:bg-slate-100 dark:hover:bg-[#292a2f] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-xs font-mono text-slate-700 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </Link>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Contest</span>
          </button>
        </div>
      </div>

      {/* Diagnostic & Status Banners */}
      {migrationWarning && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 flex items-start gap-3 text-xs font-mono text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Supabase Database Migration Required</p>
            <p>{migrationWarning}</p>
          </div>
        </div>
      )}

      {bannerError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-xs font-mono text-rose-700 dark:text-rose-300">
          {bannerError}
        </div>
      )}

      {bannerSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-xs font-mono text-emerald-700 dark:text-emerald-300">
          {bannerSuccess}
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
            Total Contests
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#e3e1e9] mt-1 tabular-nums">
            {contests.length}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
            Live Published Contests
          </span>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-[#adc6ff] mt-1 tabular-nums">
            {activePublishedCount}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
            Pending Review Queue
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {pendingCount}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
            Approved Entrants
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {approvedCount}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-[#1e1f25] pb-2">
        <button
          onClick={() => setActiveTab("contests")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "contests"
              ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-slate-200 dark:border-transparent font-semibold shadow-xs"
              : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Contests Manager ({contests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "applications"
              ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-slate-200 dark:border-transparent font-semibold shadow-xs"
              : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Applications Queue ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "audit"
              ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-slate-200 dark:border-transparent font-semibold shadow-xs"
              : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Security Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: CONTESTS MANAGER */}
      {activeTab === "contests" && (
        <div className="space-y-4">
          {contests.length === 0 ? (
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-xl p-12 text-center space-y-3">
              <Trophy className="w-8 h-8 text-blue-600 dark:text-[#adc6ff] mx-auto" />
              <h3 className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
                No contests created yet
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-[#8c909f] max-w-md mx-auto">
                Create your first verified contest draft, configure rules &amp; slot limits, and publish it when ready for member applications.
              </p>
              <button
                onClick={openCreateForm}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Contest</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {contests.map((contest) => {
                const approvedApplicants = applications.filter(
                  (a) => a.contestId === contest.id && a.status === "approved"
                );
                return (
                  <div
                    key={contest.id}
                    className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-xl p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              contest.isPublished
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                : "bg-slate-100 dark:bg-[#1a1b21] text-slate-600 dark:text-[#8c909f] border border-slate-200 dark:border-[#292a2f]"
                            }`}
                          >
                            {contest.isPublished ? "Published" : "Draft (Hidden)"}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff]">
                            {contest.status}
                          </span>

                          {contest.prizePool && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                              {contest.prizePool}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-[#e3e1e9]">
                          {contest.title}
                        </h3>
                        {contest.tagline && (
                          <p className="text-xs font-mono text-slate-600 dark:text-[#c2c6d6]">
                            {contest.tagline}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-[#8c909f] line-clamp-2 max-w-3xl">
                          {contest.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleTogglePublish(contest)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-xs font-mono text-slate-700 dark:text-[#c2c6d6] hover:bg-slate-100 dark:hover:bg-[#292a2f]"
                        >
                          {contest.isPublished ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Unpublish</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Publish</span>
                            </>
                          )}
                        </button>

                        <select
                          aria-label="Contest status"
                          value={contest.status}
                          onChange={(e) =>
                            handleStatusChange(
                              contest.id,
                              e.target.value as "upcoming" | "active" | "completed"
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-xs font-mono text-slate-700 dark:text-[#c2c6d6]"
                        >
                          <option value="upcoming">upcoming</option>
                          <option value="active">active</option>
                          <option value="completed">completed</option>
                        </select>

                        <button
                          onClick={() => openEditForm(contest)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-xs font-mono text-blue-600 dark:text-[#adc6ff] hover:bg-blue-50 dark:hover:bg-[#292a2f]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteContest(contest)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-xs font-mono text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-[#1e1f25] flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-slate-500 dark:text-[#8c909f]">
                      <div className="flex flex-wrap items-center gap-5">
                        <span>
                          Applicants:{" "}
                          <strong className="text-slate-900 dark:text-[#e3e1e9]">
                            {contest.applicationsCount ?? 0}
                          </strong>
                        </span>
                        <span>
                          Approved:{" "}
                          <strong className="text-slate-900 dark:text-[#e3e1e9]">
                            {contest.approvedCount ?? 0}
                            {contest.maxSlots ? ` / ${contest.maxSlots}` : ""}
                          </strong>
                        </span>
                        <span>
                          Ship Logs:{" "}
                          <strong className="text-slate-900 dark:text-[#e3e1e9]">
                            {contest.submissionsCount}
                          </strong>
                        </span>
                        <span>
                          Apply Cutoff:{" "}
                          {contest.applicationDeadline
                            ? new Date(contest.applicationDeadline).toLocaleDateString()
                            : new Date(contest.endsAt).toLocaleDateString()}
                        </span>
                      </div>

                      {approvedApplicants.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>Winner:</span>
                          <select
                            aria-label="Select contest winner"
                            value={contest.winnerProfileId || ""}
                            onChange={(e) =>
                              handleSelectWinner(contest.id, e.target.value)
                            }
                            className="px-2 py-1 rounded bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-800 dark:text-[#e3e1e9]"
                          >
                            <option value="">None selected</option>
                            {approvedApplicants.map((app) => (
                              <option key={app.applicantId} value={app.applicantId}>
                                @{app.applicantUsername} — {app.projectTitle}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEMBER APPLICATIONS QUEUE */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={appContestFilter}
                onChange={(e) => setAppContestFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-xs font-mono text-slate-800 dark:text-[#e3e1e9]"
              >
                <option value="all">All Contests</option>
                {contests.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              {(["all", "pending", "approved", "waitlisted", "rejected"] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setAppStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors ${
                      appStatusFilter === st
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-600 dark:text-[#c2c6d6]"
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-xl p-10 text-center space-y-2">
              <Users className="w-8 h-8 text-blue-600 dark:text-[#adc6ff] mx-auto" />
              <p className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
                No member applications match this filter
              </p>
              <p className="text-xs font-mono text-slate-500 dark:text-[#8c909f]">
                Applications appear here once published contests receive submissions from builders.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={app.applicantAvatar}
                        alt={app.applicantUsername}
                        className="w-10 h-10 rounded-full ring-1 ring-slate-200 dark:ring-[#424754] object-cover shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                            {app.projectTitle}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              app.status === "approved"
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                                : app.status === "rejected"
                                ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
                                : app.status === "waitlisted"
                                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                                : "bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff]"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="text-xs font-mono text-slate-500 dark:text-[#8c909f] flex flex-wrap items-center gap-2">
                          <span>
                            @{app.applicantUsername} ({app.applicantRole} ·{" "}
                            {app.applicantShipCount} ships)
                          </span>
                          <span>·</span>
                          <span className="text-blue-600 dark:text-[#adc6ff]">
                            {app.contestTitle}
                          </span>
                          {app.teamName && (
                            <>
                              <span>·</span>
                              <span>Team: {app.teamName}</span>
                            </>
                          )}
                          {app.track && (
                            <>
                              <span>·</span>
                              <span>Track: {app.track}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {app.repoUrl && (
                        <a
                          href={app.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-[11px] font-mono text-slate-700 dark:text-[#c2c6d6] hover:text-blue-600"
                        >
                          <span>Repo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {app.portfolioUrl && (
                        <a
                          href={app.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-[11px] font-mono text-slate-700 dark:text-[#c2c6d6] hover:text-blue-600"
                        >
                          <span>Demo/Portfolio</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-mono text-slate-700 dark:text-[#c2c6d6] bg-slate-50 dark:bg-[#1a1b21] p-3 rounded-lg border border-slate-200 dark:border-[#292a2f] leading-relaxed whitespace-pre-wrap">
                    {app.pitch}
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                    <div className="lg:col-span-7">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1">
                        Private Admin Review Notes (Never Shown to Applicants)
                      </label>
                      <input
                        type="text"
                        value={notesDraft[app.id] || ""}
                        onChange={(e) =>
                          setNotesDraft((prev) => ({
                            ...prev,
                            [app.id]: e.target.value,
                          }))
                        }
                        placeholder="Optional internal evaluation notes..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-xs font-mono text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="lg:col-span-5 flex flex-wrap items-center justify-end gap-2">
                      <button
                        disabled={busyAppId === app.id}
                        onClick={() => handleReviewApplication(app.id, "approved")}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        disabled={busyAppId === app.id}
                        onClick={() => handleReviewApplication(app.id, "waitlisted")}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-mono disabled:opacity-50"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Waitlist</span>
                      </button>

                      <button
                        disabled={busyAppId === app.id}
                        onClick={() => handleReviewApplication(app.id, "rejected")}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 text-xs font-mono disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY AUDIT LOG */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e1f25]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                Immutable Trigger-Written Audit Trail
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-[#8c909f]">
                Automatically recorded inside Postgres triggers on admin contest and application actions.
              </p>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs font-mono text-slate-500 dark:text-[#8c909f] py-6 text-center">
              No audit log entries recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#1e1f25]">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] font-semibold">
                      {log.action}
                    </span>
                    <span className="text-slate-700 dark:text-[#c2c6d6]">
                      by @{log.actorUsername}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 dark:text-[#8c909f] truncate max-w-md">
                      {JSON.stringify(log.metadata)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-[#8c909f] shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT CONTEST MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e1f25] flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                {formState.id ? "Edit Contest" : "Create Protected Contest"}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSaveContest}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs font-mono"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                    Contest Title *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={120}
                    value={formState.title}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, title: e.target.value }))
                    }
                    placeholder="Edge AI Robotics Sprint"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                    Custom Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={formState.slug}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, slug: e.target.value }))
                    }
                    placeholder="auto-generated-from-title"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                  Short Tagline
                </label>
                <input
                  type="text"
                  maxLength={220}
                  value={formState.tagline}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, tagline: e.target.value }))
                  }
                  placeholder="Ship deterministic on-device robotics telemetry within 14 days."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                  Detailed Brief &amp; Judging Criteria *
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  maxLength={4000}
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, description: e.target.value }))
                  }
                  placeholder="Full engineering prompt, deliverables, and evaluation rubric..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                    Prize / Grant
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={formState.prizePool}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, prizePool: e.target.value }))
                    }
                    placeholder="e.g. $500 Hardware Grant"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                    Sponsor
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={formState.sponsoredBy}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, sponsoredBy: e.target.value }))
                    }
                    placeholder="Optional sponsor"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                    Max Approved Slots
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={formState.maxSlots}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, maxSlots: e.target.value }))
                    }
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                    Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        status: e.target.value as "upcoming" | "active" | "completed",
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                  >
                    <option value="upcoming">upcoming</option>
                    <option value="active">active</option>
                    <option value="completed">completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                    Starts At *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formState.startsAt}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, startsAt: e.target.value }))
                    }
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                    Apply Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={formState.applicationDeadline}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        applicationDeadline: e.target.value,
                      }))
                    }
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                    Ends At *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formState.endsAt}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, endsAt: e.target.value }))
                    }
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase text-slate-500 dark:text-[#8c909f] mb-1">
                  Contest Rules (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formState.rulesText}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, rulesText: e.target.value }))
                  }
                  placeholder={
                    "Open-source repo required\nHardware demo video or serial log proof"
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-slate-900 dark:text-[#e3e1e9]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f]">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-[#c2c6d6]">
                  <input
                    type="checkbox"
                    checked={formState.requireApprovalToSubmit}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        requireApprovalToSubmit: e.target.checked,
                      }))
                    }
                    className="accent-blue-600"
                  />
                  <span>Require approved application to submit build</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-[#c2c6d6]">
                  <input
                    type="checkbox"
                    checked={formState.isPublished}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, isPublished: e.target.checked }))
                    }
                    className="accent-blue-600"
                  />
                  <span>Publish immediately</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#292a2f] text-slate-600 dark:text-[#c2c6d6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingContest}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
                >
                  {isSavingContest ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{formState.id ? "Save Changes" : "Create Contest"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
