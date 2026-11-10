const RESERVED_ADMIN_HANDLES = new Set([
  "admin",
  "administrator",
  "root",
  "system",
  "aevora_admin",
  "superadmin",
  "moderator",
]);

export function sanitizeControlChars(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

export function isReservedAdminEmail(email: string): boolean {
  const clean = email.trim().toLowerCase();
  return clean === "admin@aevora.com" || clean.endsWith("@aevora.com");
}

export function isReservedAdminUsername(username: string): boolean {
  const clean = username.replace(/^@+/, "").trim().toLowerCase();
  return RESERVED_ADMIN_HANDLES.has(clean);
}

export function isSafeHttpUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return true;
  if (trimmed.length > 500) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseRulesList(rawRules: unknown): string[] {
  if (Array.isArray(rawRules)) {
    return rawRules
      .map((r) => sanitizeControlChars(r))
      .filter((r) => r.length > 0)
      .slice(0, 20);
  }
  if (typeof rawRules === "string") {
    return rawRules
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-*•\s]+/, "").trim())
      .filter((line) => line.length > 0)
      .slice(0, 20);
  }
  return [];
}

export interface ValidatedContestPayload {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  prize_pool: string | null;
  sponsored_by: string | null;
  rules: string | null;
  status: "upcoming" | "active" | "completed";
  starts_at: string;
  ends_at: string;
  application_deadline: string | null;
  max_slots: number | null;
  require_approval_to_submit: boolean;
  is_published: boolean;
}

export function validateContestInput(
  body: Record<string, unknown>,
  options: { partial?: boolean } = {}
): { ok: true; data: Partial<ValidatedContestPayload> } | { ok: false; error: string } {
  const partial = Boolean(options.partial);
  const out: Partial<ValidatedContestPayload> = {};

  if (!partial || body.title !== undefined) {
    const title = sanitizeControlChars(body.title);
    if (title.length < 3 || title.length > 120) {
      return { ok: false, error: "Contest title must be between 3 and 120 characters." };
    }
    out.title = title;
  }

  if (body.slug !== undefined || (!partial && out.title)) {
    const rawSlug = sanitizeControlChars(body.slug) || out.title || "";
    const slug = sanitizeSlug(rawSlug);
    if (slug.length < 3) {
      return { ok: false, error: "Slug must be at least 3 URL-safe alphanumeric characters." };
    }
    out.slug = slug;
  }

  if (!partial || body.tagline !== undefined) {
    const tagline = sanitizeControlChars(body.tagline);
    if (tagline.length > 220) {
      return { ok: false, error: "Tagline cannot exceed 220 characters." };
    }
    out.tagline = tagline;
  }

  if (!partial || body.description !== undefined) {
    const description = sanitizeControlChars(body.description);
    if (description.length < 10 || description.length > 4000) {
      return { ok: false, error: "Description must be between 10 and 4000 characters." };
    }
    out.description = description;
  }

  if (body.prizePool !== undefined || body.prize_pool !== undefined) {
    const prize = sanitizeControlChars(body.prizePool ?? body.prize_pool);
    if (prize.length > 120) {
      return { ok: false, error: "Prize grant text cannot exceed 120 characters." };
    }
    out.prize_pool = prize || null;
  }

  if (body.sponsoredBy !== undefined || body.sponsored_by !== undefined) {
    const sponsor = sanitizeControlChars(body.sponsoredBy ?? body.sponsored_by);
    if (sponsor.length > 100) {
      return { ok: false, error: "Sponsor name cannot exceed 100 characters." };
    }
    out.sponsored_by = sponsor || null;
  }

  if (body.rules !== undefined) {
    const rulesArr = parseRulesList(body.rules);
    out.rules = rulesArr.length > 0 ? rulesArr.join("\n") : null;
  }

  if (!partial || body.status !== undefined) {
    const status = sanitizeControlChars(body.status || "active");
    if (!["upcoming", "active", "completed"].includes(status)) {
      return { ok: false, error: "Invalid contest status." };
    }
    out.status = status as "upcoming" | "active" | "completed";
  }

  if (!partial || body.startsAt !== undefined || body.starts_at !== undefined) {
    const rawStarts = sanitizeControlChars(body.startsAt ?? body.starts_at);
    const parsed = rawStarts ? new Date(rawStarts) : new Date();
    if (isNaN(parsed.getTime())) {
      return { ok: false, error: "Invalid start timestamp." };
    }
    out.starts_at = parsed.toISOString();
  }

  if (!partial || body.endsAt !== undefined || body.ends_at !== undefined) {
    const rawEnds = sanitizeControlChars(body.endsAt ?? body.ends_at);
    const parsed = new Date(rawEnds);
    if (!rawEnds || isNaN(parsed.getTime())) {
      return { ok: false, error: "Valid end timestamp is required." };
    }
    out.ends_at = parsed.toISOString();
  }

  if (out.starts_at && out.ends_at && new Date(out.ends_at) <= new Date(out.starts_at)) {
    return { ok: false, error: "Contest end time must be strictly after start time." };
  }

  if (body.applicationDeadline !== undefined || body.application_deadline !== undefined) {
    const rawDeadline = sanitizeControlChars(
      body.applicationDeadline ?? body.application_deadline
    );
    if (!rawDeadline) {
      out.application_deadline = null;
    } else {
      const parsed = new Date(rawDeadline);
      if (isNaN(parsed.getTime())) {
        return { ok: false, error: "Invalid application deadline timestamp." };
      }
      if (out.ends_at && parsed > new Date(out.ends_at)) {
        return { ok: false, error: "Application deadline cannot be after contest end date." };
      }
      out.application_deadline = parsed.toISOString();
    }
  }

  if (body.maxSlots !== undefined || body.max_slots !== undefined) {
    const rawSlots = body.maxSlots ?? body.max_slots;
    if (rawSlots === null || rawSlots === "" || rawSlots === undefined) {
      out.max_slots = null;
    } else {
      const num = Number(rawSlots);
      if (!Number.isInteger(num) || num < 1 || num > 10000) {
        return { ok: false, error: "Max slots must be a whole number between 1 and 10,000." };
      }
      out.max_slots = num;
    }
  }

  if (
    body.requireApprovalToSubmit !== undefined ||
    body.require_approval_to_submit !== undefined
  ) {
    out.require_approval_to_submit = Boolean(
      body.requireApprovalToSubmit ?? body.require_approval_to_submit
    );
  } else if (!partial) {
    out.require_approval_to_submit = true;
  }

  if (body.isPublished !== undefined || body.is_published !== undefined) {
    out.is_published = Boolean(body.isPublished ?? body.is_published);
  } else if (!partial) {
    out.is_published = false;
  }

  return { ok: true, data: out };
}

export function validateContestApplicationInput(body: Record<string, unknown>) {
  const projectTitle = sanitizeControlChars(body.projectTitle ?? body.project_title);
  if (projectTitle.length < 3 || projectTitle.length > 140) {
    return {
      ok: false as const,
      error: "Project title must be between 3 and 140 characters.",
    };
  }

  const teamName = sanitizeControlChars(body.teamName ?? body.team_name);
  if (teamName.length > 80) {
    return { ok: false as const, error: "Team name cannot exceed 80 characters." };
  }

  const track = sanitizeControlChars(body.track);
  if (track.length > 80) {
    return { ok: false as const, error: "Track name cannot exceed 80 characters." };
  }

  const pitch = sanitizeControlChars(body.pitch);
  if (pitch.length < 15 || pitch.length > 2000) {
    return {
      ok: false as const,
      error: "Technical proposal / pitch must be between 15 and 2000 characters.",
    };
  }

  const repoUrl = sanitizeControlChars(body.repoUrl ?? body.repo_url);
  if (repoUrl && !isSafeHttpUrl(repoUrl)) {
    return {
      ok: false as const,
      error: "Repository URL must begin with https:// or http://.",
    };
  }

  const portfolioUrl = sanitizeControlChars(body.portfolioUrl ?? body.portfolio_url);
  if (portfolioUrl && !isSafeHttpUrl(portfolioUrl)) {
    return {
      ok: false as const,
      error: "Portfolio / demo URL must begin with https:// or http://.",
    };
  }

  const acceptedRules = Boolean(body.acceptedRules ?? body.accepted_rules);
  if (!acceptedRules) {
    return {
      ok: false as const,
      error: "You must accept the contest rules and Proof-of-Work terms.",
    };
  }

  return {
    ok: true as const,
    data: {
      project_title: projectTitle,
      team_name: teamName || null,
      track: track || null,
      pitch,
      repo_url: repoUrl || null,
      portfolio_url: portfolioUrl || null,
      accepted_rules: true,
    },
  };
}

export function validateApplicationReviewInput(body: Record<string, unknown>) {
  const status = sanitizeControlChars(body.status);
  if (!["pending", "approved", "waitlisted", "rejected"].includes(status)) {
    return {
      ok: false as const,
      error: "Decision must be pending, approved, waitlisted, or rejected.",
    };
  }

  const adminNotes = sanitizeControlChars(body.adminNotes ?? body.admin_notes);
  if (adminNotes.length > 2000) {
    return { ok: false as const, error: "Admin notes cannot exceed 2000 characters." };
  }

  return {
    ok: true as const,
    data: {
      status: status as "pending" | "approved" | "waitlisted" | "rejected",
      admin_notes: adminNotes || null,
    },
  };
}
