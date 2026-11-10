"use client";

import { useState } from "react";
import { BlueprintItem, ResourceTool } from "@/lib/types/community";
import {
  Layers,
  Search,
  ExternalLink,
  Download,
  Star,
  Copy,
  Check,
  Cpu,
  FileCode,
  Box,
  Compass,
  Gift,
  Server,
  PenTool,
} from "lucide-react";

interface BlueprintsViewProps {
  blueprints: BlueprintItem[];
  resources: ResourceTool[];
}

export function BlueprintsView({ blueprints, resources }: BlueprintsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"blueprints" | "resources">("blueprints");
  const [bpCategory, setBpCategory] = useState<string>("All");
  const [resCategory, setResCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bpCategories = [
    "All",
    "Firmware",
    "CAD/Chassis",
    "Edge AI",
    "Next.js/Full-Stack",
    "PCB Schematic",
  ];

  const resCategories = [
    "All",
    "Hardware Grants",
    "GPU & Cloud Credits",
    "CAD & Simulation",
    "Embedded Tooling",
  ];

  const filteredBlueprints = blueprints.filter((bp) => {
    const matchesCat = bpCategory === "All" || bp.category === bpCategory;
    const matchesSearch =
      bp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const filteredResources = resources.filter((res) => {
    const matchesCat = resCategory === "All" || res.category === resCategory;
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Sub-tab Switcher */}
      <div className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent">
                <Layers className="w-3.5 h-3.5" />
                Verified Hardware Assets
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#e3e1e9] tracking-tight">
              Blueprint Library &amp; Curated Tooling
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#8c909f] font-mono mt-1">
              Clone verified firmware templates, CAD models, KiCad Gerber bundles, and claim free developer grants.
            </p>
          </div>

          {/* Sub-tab navigation */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#1a1b21] rounded-md border border-slate-200 dark:border-[#292a2f] shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab("blueprints")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                activeSubTab === "blueprints"
                  ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] shadow-xs font-semibold"
                  : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Blueprints ({blueprints.length})
            </button>
            <button
              onClick={() => setActiveSubTab("resources")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                activeSubTab === "resources"
                  ? "bg-white dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] shadow-xs font-semibold"
                  : "text-slate-600 dark:text-[#c2c6d6] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              Grants &amp; Tools ({resources.length})
            </button>
          </div>
        </div>

        {/* Search bar and category chips */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1e1f25] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#8c909f] absolute left-3 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeSubTab === "blueprints"
                  ? "Search by template name, stack (ESP-IDF, KiCad)..."
                  : "Search grants, free tiers, CAD tools..."
              }
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-md text-slate-900 dark:text-[#e3e1e9] placeholder:text-slate-400 dark:placeholder:text-[#8c909f] focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Category buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(activeSubTab === "blueprints" ? bpCategories : resCategories).map((cat) => {
              const isSelected =
                activeSubTab === "blueprints" ? bpCategory === cat : resCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    if (activeSubTab === "blueprints") setBpCategory(cat);
                    else setResCategory(cat);
                  }}
                  className={`text-xs font-mono px-2.5 py-1 rounded-md whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border-blue-200 dark:border-transparent font-semibold"
                      : "bg-slate-50 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border-slate-200 dark:border-[#292a2f] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SUB-TAB A: BLUEPRINTS GRID */}
      {activeSubTab === "blueprints" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBlueprints.length === 0 ? (
            <div className="md:col-span-2 text-center py-12 bg-white dark:bg-[#0d0e13] rounded-lg border border-slate-200 dark:border-[#1e1f25] p-8 space-y-2 shadow-xs">
              <Box className="w-8 h-8 text-blue-600 dark:text-[#adc6ff] mx-auto" />
              <p className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
                No blueprints match your filter
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono">
                Reset your search terms or category selector
              </p>
            </div>
          ) : (
            filteredBlueprints.map((bp) => (
              <div
                key={bp.id}
                className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-5 hover:border-slate-300 dark:hover:border-[#292a2f] transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] border border-blue-200/70 dark:border-transparent">
                      {bp.category}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono text-amber-500 dark:text-amber-400 tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {bp.stars}
                      </span>
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-[#1a1b21] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#292a2f] text-slate-600 dark:text-[#c2c6d6]">
                        {bp.license}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9] leading-snug">
                    {bp.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#8c909f] mt-1.5 line-clamp-2 leading-relaxed">
                    {bp.description}
                  </p>

                  {/* Code snippet preview */}
                  {bp.previewSnippet && (
                    <div className="mt-3 bg-[#e8eef5]/70 dark:bg-[#1a1b21] rounded-md p-3 font-mono text-[11px] border border-slate-300/60 dark:border-[#292a2f] overflow-x-auto">
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-300/40 dark:border-[#292a2f] text-[10px] text-slate-500 dark:text-[#8c909f]">
                        <span>sample snippet</span>
                        <button
                          onClick={() => handleCopySnippet(bp.id, bp.previewSnippet!)}
                          className="flex items-center gap-1 text-slate-600 dark:text-[#c2c6d6] hover:text-blue-600 dark:hover:text-[#adc6ff] transition-colors"
                        >
                          {copiedId === bp.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-blue-700 dark:text-[#adc6ff]">{bp.previewSnippet}</pre>
                    </div>
                  )}

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {bp.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b21] text-slate-700 dark:text-[#c2c6d6] border border-slate-200 dark:border-[#292a2f]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer metadata & actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#1e1f25] flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-[#8c909f] font-mono">
                    by <span className="text-slate-900 dark:text-[#e3e1e9] font-semibold">@{bp.author}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={bp.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-slate-700 dark:text-[#c2c6d6] bg-slate-50 dark:bg-[#1a1b21] hover:bg-slate-100 dark:hover:bg-[#292a2f] rounded border border-slate-200 dark:border-[#292a2f] transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                    {bp.repoUrl && (
                      <a
                        href={bp.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-blue-600 dark:text-[#adc6ff] bg-blue-50 dark:bg-[#292a2f] hover:bg-blue-100 dark:hover:bg-[#34343a] rounded border border-blue-200/70 dark:border-transparent transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-TAB B: CURATED RESOURCES & TOOLS */}
      {activeSubTab === "resources" && (
        <div className="space-y-3">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#0d0e13] rounded-lg border border-slate-200 dark:border-[#1e1f25] p-8 space-y-2 shadow-xs">
              <Gift className="w-8 h-8 text-blue-600 dark:text-[#adc6ff] mx-auto" />
              <p className="text-sm font-mono font-semibold text-slate-900 dark:text-[#e3e1e9]">
                No resources found
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8c909f] font-mono">
                Try searching with another keyword
              </p>
            </div>
          ) : (
            filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-lg p-4 hover:border-slate-300 dark:hover:border-[#292a2f] transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] flex items-center justify-center shrink-0 mt-0.5">
                    {res.category === "Hardware Grants" && (
                      <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {res.category === "GPU & Cloud Credits" && (
                      <Server className="w-4 h-4 text-blue-600 dark:text-[#adc6ff]" />
                    )}
                    {res.category === "CAD & Simulation" && (
                      <PenTool className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                    {res.category === "Embedded Tooling" && (
                      <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                    {res.category === "DevDocs" && (
                      <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                        {res.name}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-[#8c909f]">
                        via {res.provider}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          res.accessType === "Grant"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                            : res.accessType === "Free Tier"
                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-[#adc6ff] border-blue-200 dark:border-blue-500/30"
                            : "bg-slate-100 dark:bg-[#1a1b21] text-slate-600 dark:text-[#c2c6d6] border-slate-200 dark:border-[#292a2f]"
                        }`}
                      >
                        {res.accessType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-[#8c909f] mt-1 leading-relaxed max-w-2xl">
                      {res.description}
                    </p>
                  </div>
                </div>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shrink-0 shadow-xs"
                >
                  Claim Access
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
