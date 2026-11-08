"use client";

import { useState } from "react";
import { ProjectItem, CollabApplication } from "@/lib/types/community";
import { X, GitPullRequest, Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface CollabModalProps {
  isOpen: boolean;
  project: ProjectItem | null;
  onClose: () => void;
  onSubmitApplication: (application: CollabApplication) => void;
}

export function CollabModal({
  isOpen,
  project,
  onClose,
  onSubmitApplication,
}: CollabModalProps) {
  const { user, profile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>(
    project?.openRoles[0]?.role || "Hardware Contributor"
  );
  const [pitch, setPitch] = useState<string>("");
  const [portfolioUrl, setPortfolioUrl] = useState<string>(profile?.github_url || "");
  const [roleTag, setRoleTag] = useState<string>(profile?.role || "Systems Builder");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim()) return;

    const applicantUsername = profile?.username || user?.email?.split("@")[0] || "builder";
    const applicantName = profile?.full_name || applicantUsername;

    const newApp: CollabApplication = {
      id: `app-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      applicant: {
        name: applicantName,
        username: applicantUsername,
        avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${applicantUsername}`,
        roleTag: roleTag || "Systems Builder",
      },
      roleApplied: selectedRole,
      pitch: pitch.trim(),
      portfolioUrl: portfolioUrl.trim() || undefined,
      status: "Pending",
      timestamp: "Just now",
    };

    setIsSubmitted(true);
    setTimeout(() => {
      onSubmitApplication(newApp);
      setIsSubmitted(false);
      setPitch("");
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Request to Collaborate</h3>
              <p className="text-xs text-zinc-400 font-mono">Project: {project.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-zinc-100">Application Transmitted!</h4>
            <p className="text-xs text-zinc-400 font-mono">
              The project owner has been notified on Aevora Forge. Track status in your Builder Dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Target Role
              </label>
              {project.openRoles.length > 0 ? (
                <div className="space-y-1.5">
                  {project.openRoles.map((r) => (
                    <label
                      key={r.role}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedRole === r.role
                          ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-medium"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="role"
                          checked={selectedRole === r.role}
                          onChange={() => setSelectedRole(r.role)}
                          className="text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>{r.role}</span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {r.slotsAvailable} slot available
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-hidden focus:border-emerald-500 font-mono"
                  placeholder="e.g. Firmware Engineer, Mechanical CAD, Kernel Dev"
                  required
                />
              )}
            </div>

            {/* Applicant Role Tag */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Your Primary Specialization
              </label>
              <input
                type="text"
                value={roleTag}
                onChange={(e) => setRoleTag(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-hidden focus:border-emerald-500 font-mono"
                placeholder="e.g. Embedded C / KiCad / Local LLMs"
                required
              />
            </div>

            {/* Pitch Textarea */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Why do you want to build this? (Pitch & Capabilities)
              </label>
              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono leading-relaxed"
                placeholder="Describe relevant hardware projects you've built, driver code written, or hours per week you can commit..."
                required
              />
            </div>

            {/* Portfolio Link */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                GitHub / Schematics / Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono text-[11px]"
                placeholder="https://github.com/..."
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-lg transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Application</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
