"use client";

import { useState } from "react";
import { AISpec } from "@/lib/types/community";
import {
  Sparkles,
  Cpu,
  Bookmark,
  Check,
  Copy,
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
  const [specSource, setSpecSource] = useState<string>("gemini-api");
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
        setGenerationStep("Compiling milestone execution roadmap...");
        setTimeout(() => {
          setCurrentSpec(data.spec);
          setSpecSource(data.source || "synthesis");
          setIsGenerating(false);
          setGenerationStep("");
        }, 350);
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

  const estimatedTotal = currentSpec
    ? currentSpec.bom.reduce((sum, item) => {
        const numeric = parseFloat((item.estimatedCost || "").replace(/[^0-9.]/g, ""));
        return sum + (isNaN(numeric) ? 0 : numeric);
      }, 0)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-5 shadow-xs transition-colors">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent">
            <Sparkles className="w-3.5 h-3.5" />
            AI Idea &amp; Spec Generator
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border border-slate-200 dark:border-[#292a2f]">
            Google Gemini Powered
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#e3e1e9] tracking-tight">
          AI Idea &amp; Engineering Spec Generator
        </h2>
        <p className="text-xs text-slate-600 dark:text-[#8c909f] font-mono mt-1">
          Generate realistic, vetted system architecture specs, bill of materials (BOM), and a milestone execution roadmap based on your hardware stack and requirements.
        </p>
      </div>

      {/* Generator Controls Card */}
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-6 shadow-xs space-y-6 transition-colors">
        {/* Step 1: Domain */}
        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-2">
            1. Select Target Domain
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setDomain(d.id)}
                className={`p-3 rounded-lg text-left border transition-all ${
                  domain === d.id
                    ? "bg-blue-50/80 dark:bg-[#292a2f] text-blue-700 dark:text-[#adc6ff] border-blue-300 dark:border-blue-500/40 shadow-xs"
                    : "bg-slate-50 dark:bg-[#1a1b21] text-slate-700 dark:text-[#c2c6d6] border-slate-200 dark:border-[#292a2f] hover:border-slate-300 dark:hover:border-[#34343a]"
                }`}
              >
                <div className="text-xs font-bold leading-tight font-mono">{d.label}</div>
                <div className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-[#8c909f] font-sans">
                  {d.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Difficulty */}
        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-2">
            2. Scope &amp; Time Horizon
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                className={`p-3 rounded-lg text-left border transition-all ${
                  difficulty === diff.id
                    ? "bg-blue-50/80 dark:bg-[#292a2f] text-blue-700 dark:text-[#adc6ff] border-blue-300 dark:border-blue-500/40 font-semibold"
                    : "bg-slate-50 dark:bg-[#1a1b21] text-slate-700 dark:text-[#c2c6d6] border-slate-200 dark:border-[#292a2f] hover:border-slate-300 dark:hover:border-[#34343a]"
                }`}
              >
                <div className="text-xs font-bold font-mono">{diff.label}</div>
                <div className="text-[11px] font-mono text-blue-600 dark:text-[#adc6ff] mt-0.5">
                  {diff.time}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Hardware Multi-select */}
        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-2">
            3. Available Hardware &amp; Tooling (Select multiple)
          </label>
          <div className="flex flex-wrap gap-2">
            {hardwareOptions.map((hw) => {
              const isSelected = selectedHardware.includes(hw);
              return (
                <button
                  key={hw}
                  onClick={() => toggleHardware(hw)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all border ${
                    isSelected
                      ? "bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border-blue-200 dark:border-blue-500/40 font-semibold"
                      : "bg-slate-50 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border-slate-200 dark:border-[#292a2f] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {hw}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Optional Concept & Specific Requirements */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
              4. Concept &amp; Specific Requirements{" "}
              <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <span className="text-[10px] font-mono text-slate-400 dark:text-[#8c909f]">
              {customPrompt.length}/400
            </span>
          </div>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value.slice(0, 400))}
            placeholder="Describe your vision, target application, or specific constraints... (e.g. 'Build an off-grid solar LoRa mesh node that relays wildfire sensor frames to a Next.js live telemetry map with sub-100ms packet updates')"
            rows={3}
            className="w-full p-3 rounded-md bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] text-xs text-slate-900 dark:text-[#e3e1e9] placeholder:text-slate-400 dark:placeholder:text-[#8c909f] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono resize-none transition-colors"
          />
        </div>

        {/* Generate CTA Button */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-[#1e1f25]">
          <div className="text-xs text-slate-500 dark:text-[#8c909f] font-mono flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-[#adc6ff]" />
            <span>
              Targeting {selectedHardware.length} components for {domain}
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-md transition-all shadow-xs active:scale-[0.99]"
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
          <div className="p-3.5 bg-slate-50 dark:bg-[#1a1b21] text-slate-700 dark:text-[#c2c6d6] rounded-md font-mono text-xs border border-slate-200 dark:border-[#292a2f]">
            <div className="flex items-center gap-2 text-blue-600 dark:text-[#adc6ff] mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#adc6ff] animate-ping" />
              <span>Pipeline running:</span>
            </div>
            <p className="text-slate-500 dark:text-[#8c909f]">{generationStep}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-md font-mono text-xs border border-rose-200 dark:border-rose-500/40 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* GENERATED SPEC DISPLAY */}
      {currentSpec && (
        <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-6 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-[#1e1f25]">
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent font-medium">
                  {currentSpec.domain}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border border-slate-200 dark:border-[#292a2f]">
                  {currentSpec.difficulty}
                </span>
                <span className="text-[11px] font-mono text-slate-400 dark:text-[#8c909f]">
                  {specSource === "gemini-api" ? "Synthesized by Gemini AI" : "Architecture Engine"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#e3e1e9]">
                {currentSpec.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-700 dark:text-[#c2c6d6] bg-slate-50 dark:bg-[#1a1b21] hover:bg-slate-100 dark:hover:bg-[#292a2f] rounded-md border border-slate-200 dark:border-[#292a2f] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onSaveSpec(currentSpec)}
                disabled={isCurrentSaved}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all border ${
                  isCurrentSaved
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/40 cursor-default"
                    : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-xs"
                }`}
              >
                {isCurrentSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved to Supabase</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save to Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Problem Statement */}
          <div>
            <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1.5">
              Problem Statement &amp; Engineering Target
            </h4>
            <p className="text-xs text-slate-700 dark:text-[#e3e1e9] leading-relaxed bg-[#e8eef5]/60 dark:bg-[#1a1b21] p-3.5 rounded-md border border-slate-300/60 dark:border-[#292a2f] font-mono">
              {currentSpec.problemStatement}
            </p>
          </div>

          {/* Bill of Materials (BOM) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f]">
                Bill of Materials (BOM) &amp; Estimated Costs
              </h4>
              <span className="text-xs font-mono font-medium text-blue-600 dark:text-[#adc6ff] bg-blue-50 dark:bg-[#292a2f] px-2 py-0.5 rounded border border-blue-200/70 dark:border-transparent tabular-nums">
                Est. Total: ${estimatedTotal.toFixed(2)}
              </span>
            </div>
            <div className="overflow-x-auto border border-slate-200 dark:border-[#292a2f] rounded-md">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-[#1a1b21] text-slate-500 dark:text-[#8c909f] text-[11px] border-b border-slate-200 dark:border-[#292a2f]">
                  <tr>
                    <th className="py-2 px-3">Component / Subsystem</th>
                    <th className="py-2 px-3">System Purpose</th>
                    <th className="py-2 px-3 text-right">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e1f25]">
                  {currentSpec.bom.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#1a1b21]/50">
                      <td className="py-2 px-3 font-semibold text-slate-900 dark:text-[#e3e1e9]">
                        {b.item}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-[#c2c6d6]">
                        {b.purpose}
                      </td>
                      <td className="py-2 px-3 text-right text-blue-600 dark:text-[#adc6ff] font-medium tabular-nums">
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
            <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-2">
              Architecture Pipeline &amp; Execution Flow
            </h4>
            <div className="space-y-2">
              {currentSpec.architectureSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 bg-slate-50 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f] text-xs font-mono text-slate-700 dark:text-[#e3e1e9]"
                >
                  <span className="w-5 h-5 rounded bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Roadmap */}
          <div>
            <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-2">
              Milestone Execution Roadmap
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentSpec.roadmapDays.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-[#adc6ff] bg-blue-50 dark:bg-[#292a2f] px-2 py-0.5 rounded border border-blue-200/70 dark:border-transparent">
                      {r.day}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-[#8c909f]">
                      Milestone
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 dark:text-[#e3e1e9]">
                    {r.task}
                  </p>
                  <div className="text-[11px] font-mono text-blue-700 dark:text-[#adc6ff] bg-[#e8eef5]/70 dark:bg-[#0d0e13] px-2 py-1 rounded border border-slate-300/60 dark:border-[#292a2f]">
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
