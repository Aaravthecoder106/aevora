"use client";

import { X, ShieldCheck, Terminal, Check } from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  const rules = [
    {
      num: "01",
      title: "Real Commits & Telemetry Only (Zero Vaporware)",
      desc: "Every ship log must contain reproducible proof: a git commit, serial terminal output, logic analyzer trace, or benchtop circuit photo. Theoretical SaaS landing pages or marketing brochures will be purged.",
    },
    {
      num: "02",
      title: "Constructive Hardware & Code Review",
      desc: "Critique schematics, pull requests, and firmware with technical precision. Suggest trace routing improvements, decoupling caps, and algorithmic optimizations. No flame wars.",
    },
    {
      num: "03",
      title: "Document Failures & Bill of Materials",
      desc: "Engineering breakthrough stems from burnt regulators, solder bridges, and race conditions. Share root causes, post-mortems, and accurate BOM pricing so the community learns.",
    },
    {
      num: "04",
      title: "Continuous Shipping Cadence",
      desc: "A crude prototype working on perfboard today beats an unbuilt CAD assembly next month. Build in public, log your streak, and push increments relentlessly.",
    },
    {
      num: "05",
      title: "Open Source Reciprocity",
      desc: "If you utilize blueprints, starter firmware, or PCB templates from the Forge library, upstream your bug fixes and document modifications under the respective open hardware license.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Terminal Header */}
        <div className="bg-slate-50 dark:bg-[#1a1b21] text-slate-700 dark:text-[#c2c6d6] px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-[#292a2f] font-mono text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600 dark:text-[#adc6ff]" />
            <span className="text-slate-400 dark:text-[#8c909f]">aevora-forge://</span>
            <span className="text-slate-900 dark:text-[#e3e1e9] font-bold">MANIFESTO_AND_CONDUCT.md</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent">
              <ShieldCheck className="w-3.5 h-3.5" />
              Proof-of-Work Standards
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-[#e3e1e9]">
            The Aevora Forge Engineering Code
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#8c909f] leading-relaxed">
            Aevora Forge is an uncompromising workshop for hackers, systems engineers, and autonomous builders. We measure progress in working silicon, firmware, and functional software—never slide decks or speculative promises.
          </p>

          <div className="space-y-3 pt-2 font-mono">
            {rules.map((r) => (
              <div
                key={r.num}
                className="p-3.5 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-xl flex items-start gap-3.5"
              >
                <span className="text-xs font-bold text-blue-600 dark:text-[#adc6ff] bg-blue-50 dark:bg-[#292a2f] px-2 py-0.5 rounded border border-blue-200/70 dark:border-transparent shrink-0">
                  RULE_{r.num}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-[#e3e1e9]">
                    {r.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-[#c2c6d6] mt-1 leading-relaxed font-sans">
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-[#1a1b21] border-t border-slate-200 dark:border-[#292a2f] px-6 py-4 flex items-center justify-between font-mono">
          <span className="text-[11px] text-slate-500 dark:text-[#8c909f]">
            Enforced by peer upvotes &amp; repo audit
          </span>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors shadow-xs font-sans"
          >
            <Check className="w-3.5 h-3.5" />
            <span>I Agree &amp; Understand</span>
          </button>
        </div>
      </div>
    </div>
  );
}
