"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, ChevronRight, Box, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationStore } from "@/store/navigationStore";
import { CAMPUS_LOCATIONS, COLLEGE_GATE } from "@/constants/locations";
import { haversineDistance } from "@/utils/bearing";
import { formatDistance } from "@/utils/formatDistance";
import { useSearch } from "@/hooks/useSearch";
import { LOCATION_ICONS } from "@/constants/locationIcons";
import type { CampusLocation } from "@/types";

const LOCATION_STATUS: Record<string, { isOpen: boolean }> = {
  admin:      { isOpen: true  },
  library:    { isOpen: true  },
  basketball: { isOpen: true  },
  canteen:    { isOpen: false },
};

type Filter = "all" | "academic" | "dining" | "athletics" | "admin";

const LOCATION_DISTANCES: Record<string, number> = Object.fromEntries(
  CAMPUS_LOCATIONS.map((l) => [
    l.id,
    haversineDistance(COLLEGE_GATE.lat, COLLEGE_GATE.lng, l.lat, l.lng),
  ])
);

export function Sidebar() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const {
    selectDestination,
    setHoveredLocation,
    hoveredLocation,
    selectedDestination,
    viewMode,
    isSidebarOpen,
    setSidebarOpen,
    open3DTwin,
  } = useNavigationStore();

  const searchResults = useSearch(query);
  const isSearching = query.length > 0;

  // Default sidebar to open on desktop
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, [setSidebarOpen]);

  const displayList = useMemo((): readonly CampusLocation[] => {
    if (filter === "all") return CAMPUS_LOCATIONS;
    return CAMPUS_LOCATIONS.filter((l) => l.category === filter);
  }, [filter]);

  // Early return in fullscreen navigation modes
  if (viewMode === "ar-simulation" || viewMode === "turn-by-turn") return null;

  const finalList: readonly CampusLocation[] = isSearching ? searchResults : displayList;

  function handleSelect(id: string) {
    setQuery("");
    selectDestination(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }

  function handleOpen3D(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    open3DTwin(id);
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 flex flex-col transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] md:relative bg-[#090d16]/95 backdrop-blur-2xl border-r border-white/[0.08] shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:-ml-80"
        }`}
      >
        {/* Desktop Collapse/Expand Toggle */}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex absolute top-5 -right-9 w-9 h-9 rounded-r-xl items-center justify-center bg-[#090d16]/95 backdrop-blur-md border-y border-r border-white/10 text-white/60 hover:text-white transition-all shadow-lg cursor-pointer hover:bg-[#121624]"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronRight
            size={15}
            className={`transition-transform duration-300 ${
              isSidebarOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Header */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06] relative">
          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-5 right-4 w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white md:hidden transition-all"
            aria-label="Close sidebar"
          >
            <X size={14} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#38bdf8] to-[#0284c7] flex items-center justify-center shadow-md shadow-[#38bdf8]/20">
              <Compass size={17} className="text-[#050811]" />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                Sathyabama Campus
              </h1>
              <p className="text-[10px] font-medium text-white/40 mt-1">
                Interactive 3D Wayfinding & Maps
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 bg-white/[0.04] border border-white/[0.08] focus-within:border-[#38bdf8]/50 transition-all">
            <Search size={14} className="text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campus buildings, food, courts…"
              className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        {!isSearching && (
          <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {(["all", "academic", "admin", "dining", "athletics"] as Filter[]).map((f) => {
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? "bg-[#38bdf8] text-[#050811] border-[#38bdf8] shadow-sm shadow-[#38bdf8]/20"
                      : "bg-white/[0.03] text-white/60 border-white/[0.06] hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              );
            })}
          </div>
        )}

        {/* Section Heading */}
        <div className="px-5 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/40">
          <span>{isSearching ? "Search Results" : "Destinations"}</span>
          <span>{finalList.length} Locations</span>
        </div>

        {/* Location List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {finalList.map((loc) => {
              const Icon = LOCATION_ICONS[loc.id];
              const status = LOCATION_STATUS[loc.id];
              const isSelected = selectedDestination === loc.id;
              const isHovered = hoveredLocation === loc.id;
              const dist = LOCATION_DISTANCES[loc.id];

              return (
                <motion.div
                  key={loc.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleSelect(loc.id)}
                  onMouseEnter={() => setHoveredLocation(loc.id)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  className={`group relative w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#38bdf8]/10 border-[#38bdf8]/30 shadow-md shadow-[#38bdf8]/5"
                      : isHovered
                      ? "bg-white/[0.04] border-white/10"
                      : "bg-white/[0.015] border-white/[0.04] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-inner"
                      style={{
                        background: loc.color + "15",
                        borderColor: loc.color + "30",
                      }}
                    >
                      {Icon ? (
                        <Icon size={18} style={{ color: loc.color }} />
                      ) : (
                        <span className="text-base">{loc.icon}</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-[#38bdf8] transition-colors">
                        {loc.label}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-white/50">
                        <span className="font-mono">{formatDistance(dist)}</span>
                        <span>·</span>
                        <span className={status?.isOpen ? "text-[#9bffce]" : "text-white/30"}>
                          {status?.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3D Twin Quick Button */}
                  <div className="flex items-center gap-1 pl-2">
                    <button
                      onClick={(e) => handleOpen3D(e, loc.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-[#38bdf8]/20 border border-white/10 hover:border-[#38bdf8]/40 text-white/60 hover:text-[#38bdf8] text-[10px] font-bold transition-all cursor-pointer"
                      title="Inspect 3D Model"
                    >
                      <Box size={11} />
                      <span>3D</span>
                    </button>
                    <ChevronRight
                      size={14}
                      className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isSearching && finalList.length === 0 && (
            <div className="text-center py-16 px-4">
              <p className="text-xs text-white/40">
                No campus locations match &quot;{query}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] bg-[#07090f]/60">
          <div className="flex items-center justify-between text-[11px] text-white/50">
            <span className="font-medium">Sathyabama University</span>
            <span className="text-[#38bdf8] font-medium">Chennai, TN</span>
          </div>
        </div>
      </aside>
    </>
  );
}
