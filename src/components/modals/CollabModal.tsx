"use client";

import { useState } from "react";
import { ProjectItem, CollabApplication } from "@/lib/types/community";
import { X, GitPullRequest, Send, CheckCircle2, User } from "lucide-react";

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
  const [selectedRole, setSelectedRole] = useState<string>(
    project?.openRoles[0]?.role || "Hardware Contributor"
  );
  const [pitch, setPitch] = useState<string>("");
  const [portfolioUrl, setPortfolioUrl] = useState<string>("https://github.com/ay473671");
  const [roleTag, setRoleTag] = useState<string>("Firmware & Next.js");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim()) return;

    const newApp: CollabApplication = {
      id: `app-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      applicant: {
        name: "Aarav Kumar",
        username: "ay473671",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ay473671",
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
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Request to Collaborate</h3>
              <p className="text-xs text-slate-500 font-mono">Project: {project.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Application Transmitted!</h4>
            <p className="text-xs text-slate-600">
              @{project.owner.username} has been notified. You can track this in your Builder Dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Role
              </label>
              {project.openRoles.length > 0 ? (
                <div className="space-y-1.5">
                  {project.openRoles.map((r) => (
                    <label
                      key={r.role}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedRole === r.role
                          ? "bg-emerald-50/50 border-emerald-400 text-slate-900 font-medium"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="role"
                          checked={selectedRole === r.role}
                          onChange={() => setSelectedRole(r.role)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{r.role}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Firmware Engineer, Mechanical CAD, Frontend"
                  required
                />
              )}
            </div>

            {/* Applicant Role Tag */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Your Primary Specialization
              </label>
              <input
                type="text"
                value={roleTag}
                onChange={(e) => setRoleTag(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. Embedded C / KiCad / Next.js"
                required
              />
            </div>

            {/* Pitch Textarea */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Why do you want to build this? (Pitch & Capabilities)
              </label>
              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                placeholder="Describe relevant hardware projects you've built, driver code you've written, or how many hours per week you can commit..."
                required
              />
            </div>

            {/* Portfolio Link */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                GitHub / Schematics / Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                placeholder="https://github.com/..."
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
