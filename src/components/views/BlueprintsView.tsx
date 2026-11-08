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
    <div className="space-y-6">
      {/* Top Banner & Sub-tab Switcher */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Verified Hardware Assets
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
              Blueprint Library & Curated Tooling
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Clone verified firmware templates, CAD models, KiCad Gerber bundles, and claim free developer grants.
            </p>
          </div>

          {/* Sub-tab navigation */}
          <div className="flex items-center p-1 bg-zinc-950 rounded-lg border border-zinc-800 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab("blueprints")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                activeSubTab === "blueprints"
                  ? "bg-zinc-800 text-zinc-100 shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              Blueprints ({blueprints.length})
            </button>
            <button
              onClick={() => setActiveSubTab("resources")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                activeSubTab === "resources"
                  ? "bg-zinc-800 text-zinc-100 shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-blue-400" />
              Grants & Tools ({resources.length})
            </button>
          </div>
        </div>

        {/* Search bar and category chips */}
        <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeSubTab === "blueprints"
                  ? "Search by template name, stack (ESP-IDF, KiCad)..."
                  : "Search grants, free tiers, CAD tools..."
              }
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 font-mono"
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
                      ? "bg-zinc-800 text-emerald-400 border-zinc-700 font-semibold"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
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
            <div className="md:col-span-2 text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800 p-8 space-y-2">
              <Box className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-mono font-bold text-zinc-300">No blueprints match your filter</p>
              <p className="text-xs text-zinc-500 font-mono">Reset your search terms or category selector</p>
            </div>
          ) : (
            filteredBlueprints.map((bp) => (
              <div
                key={bp.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-950 text-emerald-400 border border-zinc-800">
                      {bp.category}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1 font-mono text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {bp.stars}
                      </span>
                      <span className="font-mono text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">
                        {bp.license}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 leading-snug">
                    {bp.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {bp.description}
                  </p>

                  {/* Code snippet preview */}
                  {bp.previewSnippet && (
                    <div className="mt-3 bg-zinc-950 rounded-lg p-3 font-mono text-[11px] border border-zinc-800 overflow-x-auto">
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800/80 text-[10px] text-zinc-500">
                        <span>sample snippet</span>
                        <button
                          onClick={() => handleCopySnippet(bp.id, bp.previewSnippet!)}
                          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          {copiedId === bp.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-emerald-400">{bp.previewSnippet}</pre>
                    </div>
                  )}

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {bp.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer metadata & actions */}
                <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    by <span className="text-zinc-300 font-medium">@{bp.author}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={bp.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-zinc-300 bg-zinc-950 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                    {bp.repoUrl && (
                      <a
                        href={bp.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 rounded border border-emerald-500/30 transition-colors"
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
            <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800 p-8 space-y-2">
              <Gift className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-mono font-bold text-zinc-300">No resources found</p>
              <p className="text-xs text-zinc-500 font-mono">Try searching with another keyword</p>
            </div>
          ) : (
            filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-300 mt-0.5">
                    {res.category === "Hardware Grants" && <Gift className="w-4 h-4 text-emerald-400" />}
                    {res.category === "GPU & Cloud Credits" && <Server className="w-4 h-4 text-blue-400" />}
                    {res.category === "CAD & Simulation" && <PenTool className="w-4 h-4 text-purple-400" />}
                    {res.category === "Embedded Tooling" && <Cpu className="w-4 h-4 text-orange-400" />}
                    {res.category === "DevDocs" && <Compass className="w-4 h-4 text-teal-400" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-zinc-100">{res.name}</h4>
                      <span className="text-[11px] font-mono text-zinc-500">via {res.provider}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          res.accessType === "Grant"
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                            : res.accessType === "Free Tier"
                            ? "bg-blue-950/40 text-blue-400 border-blue-500/30"
                            : "bg-zinc-950 text-zinc-400 border-zinc-800"
                        }`}
                      >
                        {res.accessType}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-2xl font-sans">
                      {res.description}
                    </p>
                  </div>
                </div>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shrink-0 shadow-lg shadow-emerald-950/40"
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
