"use client";

import { useState } from "react";
import {
  BlueprintItem,
  ResourceTool,
} from "@/lib/types/community";
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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Verified Repos & Hardware Assets
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Blueprint Library & Curated Tooling
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clone verified firmware templates, CAD models, KiCad Gerber bundles, and tap free developer grants.
            </p>
          </div>

          {/* Sub-tab navigation */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveSubTab("blueprints")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeSubTab === "blueprints"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-600" />
              Blueprints ({blueprints.length})
            </button>
            <button
              onClick={() => setActiveSubTab("resources")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeSubTab === "resources"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-blue-600" />
              Grants & Tools ({resources.length})
            </button>
          </div>
        </div>

        {/* Search bar and category chips */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeSubTab === "blueprints"
                  ? "Search by template name, stack (ESP-IDF, KiCad)..."
                  : "Search grants, free tiers, CAD tools..."
              }
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
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
                  className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 font-medium"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
            <div className="md:col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
              <Box className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No blueprints match your filter</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or search terms</p>
            </div>
          ) : (
            filteredBlueprints.map((bp) => (
              <div
                key={bp.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {bp.category}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {bp.stars}
                      </span>
                      <span className="font-mono text-[11px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        {bp.license}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug hover:text-emerald-600 transition-colors">
                    {bp.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {bp.description}
                  </p>

                  {/* Code snippet preview if available */}
                  {bp.previewSnippet && (
                    <div className="mt-3 relative bg-slate-900 text-slate-100 rounded-lg p-2.5 font-mono text-[11px] border border-slate-800 overflow-x-auto">
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] text-slate-400">
                        <span>main snippet</span>
                        <button
                          onClick={() => handleCopySnippet(bp.id, bp.previewSnippet!)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {copiedId === bp.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-sans">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="font-sans">Copy</span>
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
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer metadata & actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    by <span className="text-slate-700 font-medium">@{bp.author}</span> • {bp.updatedAt}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={bp.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Get Bundle
                    </a>
                    {bp.repoUrl && (
                      <a
                        href={bp.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
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
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
              <Gift className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No resources found</p>
              <p className="text-xs text-slate-500 mt-1">Try another category or keyword</p>
            </div>
          ) : (
            filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 mt-0.5">
                    {res.category === "Hardware Grants" && <Gift className="w-4 h-4 text-emerald-600" />}
                    {res.category === "GPU & Cloud Credits" && <Server className="w-4 h-4 text-blue-600" />}
                    {res.category === "CAD & Simulation" && <PenTool className="w-4 h-4 text-purple-600" />}
                    {res.category === "Embedded Tooling" && <Cpu className="w-4 h-4 text-orange-600" />}
                    {res.category === "DevDocs" && <Compass className="w-4 h-4 text-teal-600" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{res.name}</h4>
                      <span className="text-[11px] font-mono text-slate-500">via {res.provider}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          res.accessType === "Grant"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : res.accessType === "Free Tier"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {res.accessType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                      {res.description}
                    </p>
                  </div>
                </div>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0 shadow-xs"
                >
                  Claim / Access
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
