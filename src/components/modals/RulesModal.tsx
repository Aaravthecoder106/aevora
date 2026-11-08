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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Terminal Header */}
        <div className="bg-zinc-950 text-zinc-300 px-5 py-3.5 flex items-center justify-between border-b border-zinc-800 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-500">aevora-forge://</span>
            <span className="text-zinc-100 font-bold">MANIFESTO_AND_CONDUCT.md</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-100 transition-colors p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Proof-of-Work Standards
            </span>
          </div>

          <h3 className="text-lg font-bold text-zinc-100">
            The Aevora Forge Engineering Code
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Aevora Forge is an uncompromising workshop for hackers, systems engineers, and autonomous builders. We measure progress in working silicon, firmware, and functional software—never slide decks or speculative promises.
          </p>

          <div className="space-y-3 pt-2 font-mono">
            {rules.map((r) => (
              <div
                key={r.num}
                className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-3.5"
              >
                <span className="text-xs font-bold text-emerald-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 shrink-0">
                  RULE_{r.num}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">{r.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-sans">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-950 border-t border-zinc-800 px-6 py-4 flex items-center justify-between font-mono">
          <span className="text-[11px] text-zinc-500">
            Enforced by peer upvotes & repo audit
          </span>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>I Agree & Understand</span>
          </button>
        </div>
      </div>
    </div>
  );
}
