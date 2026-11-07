"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Flame, Sparkles } from "lucide-react";

export type FilterMode = "latest" | "top";

interface FeedFilterProps {
  currentFilter: FilterMode;
  onFilterChange: (filter: FilterMode) => void;
  count: number;
}

export function FeedFilter({
  currentFilter,
  onFilterChange,
  count,
}: FeedFilterProps) {
  return (
    <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
      <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel-subtle">
        <button
          onClick={() => onFilterChange("latest")}
          className={`relative px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
            currentFilter === "latest"
              ? "text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {currentFilter === "latest" && (
            <motion.div
              layoutId="feedFilterPill"
              className="absolute inset-0 bg-white/[0.08] rounded-lg border border-white/[0.12] shadow-sm"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <Clock className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Latest Ships</span>
        </button>

        <button
          onClick={() => onFilterChange("top")}
          className={`relative px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
            currentFilter === "top"
              ? "text-orange-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {currentFilter === "top" && (
            <motion.div
              layoutId="feedFilterPill"
              className="absolute inset-0 bg-orange-500/10 rounded-lg border border-orange-500/25 shadow-sm"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <Flame className="w-3.5 h-3.5 relative z-10 fill-current" />
          <span className="relative z-10">Top Shipped</span>
        </button>
      </div>

      <div className="text-xs font-mono text-zinc-500">
        <span className="text-zinc-300 font-semibold">{count}</span> proof-of-works
      </div>
    </div>
  );
}
