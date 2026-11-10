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
        avatar:
          profile?.avatar_url ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${applicantUsername}`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e1f25] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent flex items-center justify-center">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                Request to Collaborate
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono">
                Project: {project.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-blue-600 dark:text-[#adc6ff] mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900 dark:text-[#e3e1e9]">
              Application Transmitted!
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono">
              The project owner has been notified on Aevora Forge. Track status in your Builder Dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1.5">
                Target Role
              </label>
              {project.openRoles.length > 0 ? (
                <div className="space-y-1.5">
                  {project.openRoles.map((r) => (
                    <label
                      key={r.role}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedRole === r.role
                          ? "bg-blue-50/80 dark:bg-[#292a2f] border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-[#adc6ff] font-medium"
                          : "bg-slate-50 dark:bg-[#1a1b21] border-slate-200 dark:border-[#292a2f] text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="role"
                          checked={selectedRole === r.role}
                          onChange={() => setSelectedRole(r.role)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>{r.role}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-[#8c909f]">
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="e.g. Firmware Engineer, Mechanical CAD, Kernel Dev"
                  required
                />
              )}
            </div>

            {/* Applicant Role Tag */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1.5">
                Your Primary Specialization
              </label>
              <input
                type="text"
                value={roleTag}
                onChange={(e) => setRoleTag(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500 font-mono"
                placeholder="e.g. Embedded C / KiCad / Local LLMs"
                required
              />
            </div>

            {/* Pitch Textarea */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1.5">
                Why do you want to build this? (Pitch &amp; Capabilities)
              </label>
              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] placeholder:text-slate-400 dark:placeholder:text-[#8c909f] focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                placeholder="Describe relevant hardware projects you've built, driver code written, or hours per week you can commit..."
                required
              />
            </div>

            {/* Portfolio Link */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1.5">
                GitHub / Schematics / Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full px-3 py-2 text-[11px] bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] placeholder:text-slate-400 dark:placeholder:text-[#8c909f] focus:outline-none focus:border-blue-500 font-mono"
                placeholder="https://github.com/..."
              />
            </div>

            {/* Submit */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-[#1e1f25]">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
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
