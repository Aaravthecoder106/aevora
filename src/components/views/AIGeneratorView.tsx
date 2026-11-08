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
  ArrowRight,
  Terminal,
  DollarSign,
  Calendar,
  AlertCircle,
  RefreshCw,
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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [currentSpec, setCurrentSpec] = useState<AISpec | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const domains = [
    { id: "Edge AI", label: "Edge AI & Vision", desc: "On-device inference, WebGPU, quantized models" },
    { id: "Cyberdeck", label: "Cyberdeck / Hardware", desc: "Custom enclosures, e-ink displays, mechanical input" },
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

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationStep("Resolving hardware bus constraints and power budget...");

    setTimeout(() => {
      setGenerationStep("Synthesizing component Bill of Materials (BOM)...");
    }, 400);

    setTimeout(() => {
      setGenerationStep("Compiling 7-day milestone execution roadmap...");
    }, 850);

    setTimeout(() => {
      // Deterministically generate a high-signal engineering spec based on selections
      const generated: AISpec = {
        id: `spec-${Date.now()}`,
        title: `${selectedHardware[0]} Autonomous ${domain} Node`,
        domain: domain,
        difficulty: difficulty,
        problemStatement: `High power consumption and cloud latency degrade telemetry reliability in remote deployments. This build spec establishes a self-contained ${domain.toLowerCase()} subsystem leveraging ${selectedHardware.join(", ")} with sub-100ms local decision loop and zero third-party cloud dependence.`,
        bom: [
          {
            item: selectedHardware[0] || "ESP32-S3 Module",
            purpose: "Primary compute, RTOS execution loop, and peripheral control",
            estimatedCost: "$4.80",
          },
          {
            item: selectedHardware[1] || "Transceiver Module",
            purpose: "Physical transport interface and telemetry pipeline",
            estimatedCost: "$6.20",
          },
          {
            item: "TI TPS62840 Low-Iq Step-Down Converter",
            purpose: "95% efficient power rail down to 60nA quiescent standby",
            estimatedCost: "$1.40",
          },
          {
            item: "3D Printed ASA / Milled Enclosure",
            purpose: "Environmental sealing and EMI shielding",
            estimatedCost: "$8.50",
          },
        ],
        techStack: [...selectedHardware, "FreeRTOS", "Tailwind CSS"],
        architectureSteps: [
          "Stage 1: Peripheral initialization and watchdog timer calibration in bootstrap memory",
          "Stage 2: Interrupt-driven sensor buffer acquisition over SPI/I2C at 100Hz",
          "Stage 3: Quantized local heuristic filtering and state evaluation on-device",
          "Stage 4: Asynchronous packet dispatch over selected transport layer with CRC16 verification",
          "Stage 5: Conditional sleep power gate down to low-power standby mode",
        ],
        roadmapDays: [
          {
            day: "Day 1-2",
            task: "Hardware bringup, SPI bus pinout validation, and basic loopback verification",
            deliverable: "UART terminal output logging stable sensor frames at 115200 baud",
          },
          {
            day: "Day 3-4",
            task: "Implement core state machine, memory protection, and ring buffer management",
            deliverable: "Zero memory leakage across 10,000 synthetic benchmark cycles",
          },
          {
            day: "Day 5",
            task: "Build client dashboard interface and telemetry visualizer with local WebSocket",
            deliverable: "Responsive Next.js telemetry panel showing real-time metrics",
          },
          {
            day: "Day 6-7",
            task: "Stress testing under thermal load, power gate verification, and enclosure packaging",
            deliverable: "Final ship log with hardware demo video and open-source repo release",
          },
        ],
        generatedAt: "Just now",
      };

      setCurrentSpec(generated);
      setIsGenerating(false);
      setGenerationStep("");
    }, 1300);
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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            AI Build Spec Engine
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          AI Engineering Blueprint & BOM Generator
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate realistic, vetted system architecture specs, bill of materials, and a 7-day milestone roadmap based on your exact hardware stack.
        </p>
      </div>

      {/* Generator Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* Step 1: Domain */}
        <div>
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2">
            1. Select Target Domain
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setDomain(d.id)}
                className={`p-3 rounded-lg text-left border transition-all ${
                  domain === d.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="text-xs font-bold leading-tight">{d.label}</div>
                <div
                  className={`text-[11px] mt-1 line-clamp-2 ${
                    domain === d.id ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {d.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Difficulty */}
        <div>
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2">
            2. Scope & Time Horizon
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                className={`p-3 rounded-lg text-left border transition-all ${
                  difficulty === diff.id
                    ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-semibold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="text-xs font-bold">{diff.label}</div>
                <div className="text-[11px] font-mono text-emerald-700 mt-0.5">{diff.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Hardware Multi-select */}
        <div>
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2">
            3. Available Components & Tooling (Select multiple)
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
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {isSelected && <span className="mr-1 text-emerald-400">✓</span>}
                  {hw}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate CTA Button */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Targeting {selectedHardware.length} components for {domain}</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition-all shadow-xs"
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
          <div className="p-3.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Pipeline running:</span>
            </div>
            <p className="text-slate-300">{generationStep}</p>
          </div>
        )}
      </div>

      {/* GENERATED SPEC DISPLAY */}
      {currentSpec && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentSpec.domain}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {currentSpec.difficulty}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentSpec.generatedAt}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{currentSpec.title}</h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onSaveSpec(currentSpec)}
                disabled={isCurrentSaved}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                  isCurrentSaved
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default"
                    : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs"
                }`}
              >
                {isCurrentSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved to Dashboard</span>
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
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Problem Statement & Engineering Target
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-mono">
              {currentSpec.problemStatement}
            </p>
          </div>

          {/* Bill of Materials (BOM) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                Bill of Materials (BOM) & Estimated Costs
              </h4>
              <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Est. Total: $20.90
              </span>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-mono text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Component / Subsystem</th>
                    <th className="py-2 px-3">System Purpose</th>
                    <th className="py-2 px-3 text-right">Est. Unit Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {currentSpec.bom.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-900">{b.item}</td>
                      <td className="py-2 px-3 text-slate-600">{b.purpose}</td>
                      <td className="py-2 px-3 text-right text-emerald-700 font-medium">
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
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Architecture Pipeline & Execution Flow
            </h4>
            <div className="space-y-2">
              {currentSpec.architectureSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Roadmap */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Milestone Execution Roadmap
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentSpec.roadmapDays.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {r.day}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Deliverable focus</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800">{r.task}</p>
                  <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50/50 px-2 py-1 rounded border border-emerald-100">
                    Result: {r.deliverable}
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
