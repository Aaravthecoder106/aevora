"use client";

import { useState } from "react";
import { AISpec } from "@/lib/types/community";
import {
  Sparkles,
  Cpu,
  Bookmark,
  Check,
  Copy,
  Layers,
  Terminal,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface AIGeneratorViewProps {
  onSaveSpec: (spec: AISpec) => void;
  savedSpecIds: string[];
}

export function AIGeneratorView({ onSaveSpec, savedSpecIds }: AIGeneratorViewProps) {
  const [domain, setDomain] = useState<string>("Edge AI");
  const [difficulty, setDifficulty] = useState<string>("Weekend Prototype");
  const [selectedHardware, setSelectedHardware] = useState<string[]>([
    "ESP32-S3",
    "Next.js App Router",
  ]);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [currentSpec, setCurrentSpec] = useState<AISpec | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const domains = [
    { id: "Edge AI", label: "Edge AI & Vision", desc: "On-device neural inference, quantized weights, WebGPU" },
    { id: "Cyberdeck", label: "Cyberdeck / Hardware", desc: "Custom mechanical enclosures, e-ink displays, SBC cold boot" },
    { id: "Robotics", label: "Robotics & Motion", desc: "Brushless FOC, optical flow, real-time actuation" },
    { id: "DevTools", label: "Developer Tools", desc: "Zero-dependency CLI, telemetry sinks, rust binaries" },
  ];

  const difficulties = [
    { id: "Weekend Prototype", label: "Weekend Prototype", time: "48 hours" },
    { id: "2-Week Sprint", label: "2-Week Sprint", time: "14 days" },
    { id: "1-Month Deep Tech", label: "1-Month Deep Tech", time: "30 days" },
  ];

  const hardwareOptions = [
    "ESP32-S3",
    "Raspberry Pi CM4 / 5",
    "RP2350",
    "STM32H7 Dual-Core",
    "SX1262 LoRa",
    "Next.js App Router",
    "Local Ollama / ONNX",
    "KiCad Custom PCB",
    "Zephyr RTOS",
    "Micro-Solar 2W",
  ];

  const toggleHardware = (hw: string) => {
    if (selectedHardware.includes(hw)) {
      if (selectedHardware.length > 1) {
        setSelectedHardware(selectedHardware.filter((h) => h !== hw));
      }
    } else {
      setSelectedHardware([...selectedHardware, hw]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationStep("Resolving hardware bus constraints and power budget...");

    try {
      const res = await fetch("/api/generate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          difficulty,
          availableHardware: selectedHardware,
          customPrompt: customPrompt.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.spec) {
        setGenerationStep("Compiling 7-day milestone execution roadmap...");
        setTimeout(() => {
          setCurrentSpec(data.spec);
          setIsGenerating(false);
          setGenerationStep("");
        }, 400);
      } else {
        throw new Error(data.error || "Failed to generate spec");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate spec");
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!currentSpec) return;
    const md = `# ${currentSpec.title}
Domain: ${currentSpec.domain} | Difficulty: ${currentSpec.difficulty}

## Problem Statement
${currentSpec.problemStatement}

## Bill of Materials (BOM)
${currentSpec.bom.map((b) => `- **${b.item}** (${b.estimatedCost}): ${b.purpose}`).join("\n")}

## Architecture Steps
${currentSpec.architectureSteps.map((s, idx) => `${idx + 1}. ${s}`).join("\n")}

## Execution Roadmap
${currentSpec.roadmapDays.map((r) => `### ${r.day}: ${r.task}\nDeliverable: ${r.deliverable}`).join("\n\n")}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCurrentSaved = currentSpec ? savedSpecIds.includes(currentSpec.id) : false;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            AI Idea & Spec Generator
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-400 border border-zinc-800">
            Google Gemini Powered
          </span>
        </div>
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
          AI Idea & Engineering Spec Generator
        </h2>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          Generate realistic, vetted system architecture specs, bill of materials (BOM), and a milestone execution roadmap based on your hardware stack and requirements.
        </p>
      </div>

      {/* Generator Controls Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
        {/* Step 1: Domain */}
        <div>
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            1. Select Target Domain
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setDomain(d.id)}
                className={`p-3 rounded-lg text-left border transition-all ${
                  domain === d.id
                    ? "bg-zinc-800 text-zinc-100 border-zinc-700 shadow-xs"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <div className="text-xs font-bold leading-tight font-mono">{d.label}</div>
                <div className="text-[11px] mt-1 line-clamp-2 text-zinc-500 font-sans">
                  {d.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Difficulty */}
        <div>
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            2. Scope & Time Horizon
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                className={`p-3 rounded-lg text-left border transition-all ${
                  difficulty === diff.id
                    ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/50 font-semibold"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <div className="text-xs font-bold font-mono">{diff.label}</div>
                <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{diff.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Hardware Multi-select */}
        <div>
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            3. Available Hardware & Tooling (Select multiple)
          </label>
          <div className="flex flex-wrap gap-2">
            {hardwareOptions.map((hw) => {
              const isSelected = selectedHardware.includes(hw);
              return (
                <button
                  key={hw}
                  onClick={() => toggleHardware(hw)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                    isSelected
                      ? "bg-zinc-800 text-emerald-400 border-zinc-700 shadow-xs font-semibold"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {isSelected && <span className="mr-1 text-emerald-400">✓</span>}
                  {hw}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Optional Concept & Specific Requirements */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
              4. Concept & Specific Requirements <span className="text-zinc-500 font-normal lowercase">(optional)</span>
            </label>
            <span className="text-[10px] font-mono text-zinc-500">{customPrompt.length}/400</span>
          </div>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value.slice(0, 400))}
            placeholder="Describe your vision, target application, or specific constraints... (e.g. 'Build an off-grid solar LoRa mesh node that relays wildfire sensor frames to a Next.js live telemetry map with sub-100ms packet updates')"
            rows={3}
            className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono resize-none transition-colors"
          />
        </div>

        {/* Generate CTA Button */}
        <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
          <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-zinc-500" />
            <span>Targeting {selectedHardware.length} components for {domain}</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-bold text-xs rounded-lg transition-all shadow-lg shadow-emerald-950/50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Architecture...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Build Spec</span>
              </>
            )}
          </button>
        </div>

        {/* Loading progress bar */}
        {isGenerating && (
          <div className="p-3.5 bg-zinc-950 text-zinc-300 rounded-lg font-mono text-xs border border-zinc-800">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Pipeline running:</span>
            </div>
            <p className="text-zinc-400">{generationStep}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/40 text-rose-300 rounded-lg font-mono text-xs border border-rose-500/40 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* GENERATED SPEC DISPLAY */}
      {currentSpec && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  {currentSpec.domain}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                  {currentSpec.difficulty}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Generated just now
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100">{currentSpec.title}</h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-zinc-300 bg-zinc-950 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onSaveSpec(currentSpec)}
                disabled={isCurrentSaved}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-all border ${
                  isCurrentSaved
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40 cursor-default"
                    : "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 shadow-xs"
                }`}
              >
                {isCurrentSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved to Supabase</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save to My Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Problem Statement */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Problem Statement & Engineering Target
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 font-mono">
              {currentSpec.problemStatement}
            </p>
          </div>

          {/* Bill of Materials (BOM) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                Bill of Materials (BOM) & Estimated Costs
              </h4>
              <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Est. Total: $20.80
              </span>
            </div>
            <div className="overflow-x-auto border border-zinc-800 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-950 text-zinc-400 text-[11px] border-b border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">Component / Subsystem</th>
                    <th className="py-2 px-3">System Purpose</th>
                    <th className="py-2 px-3 text-right">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {currentSpec.bom.map((b, idx) => (
                    <tr key={idx} className="hover:bg-zinc-950/50">
                      <td className="py-2 px-3 font-semibold text-zinc-200">{b.item}</td>
                      <td className="py-2 px-3 text-zinc-400">{b.purpose}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-medium">
                        {b.estimatedCost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Architecture Pipeline Steps */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Architecture Pipeline & Execution Flow
            </h4>
            <div className="space-y-2">
              {currentSpec.architectureSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-300"
                >
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Roadmap */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Milestone Execution Roadmap
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentSpec.roadmapDays.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {r.day}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Milestone</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-300">{r.task}</p>
                  <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/20">
                    Deliverable: {r.deliverable}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
