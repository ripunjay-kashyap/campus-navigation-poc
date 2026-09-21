"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Compass,
  Box,
  X,
  Footprints,
  Clock,
} from "lucide-react";
import { useNavigationStore } from "@/store/navigationStore";
import { CAMPUS_LOCATIONS } from "@/constants/locations";
import { LOCATION_ICONS } from "@/constants/locationIcons";
import { formatDistance, formatDuration } from "@/utils/formatDistance";

const CATEGORY_NAMES: Record<string, string> = {
  admin: "Administration",
  academic: "Academic",
  athletics: "Sports & Athletics",
  dining: "Dining & Food",
};

export function NavigationInfoPanel() {
  const {
    selectedDestination,
    routeData,
    viewMode,
    setViewMode,
    clearNavigation,
    open3DTwin,
    estimatedArrival,
  } = useNavigationStore();

  const location = selectedDestination
    ? CAMPUS_LOCATIONS.find((l) => l.id === selectedDestination)
    : null;

  const visible =
    !!location &&
    !!routeData &&
    (viewMode === "route-overview" ||
      viewMode === "turn-by-turn" ||
      viewMode === "ar-simulation");

  return (
    <AnimatePresence>
      {visible && location && routeData && (
        <motion.div
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 140, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 240, mass: 0.8 }}
          className="absolute bottom-0 left-0 right-0 z-40 px-3 sm:px-6 pb-6 pointer-events-none"
        >
          <div
            className="pointer-events-auto rounded-3xl overflow-hidden max-w-lg mx-auto relative bg-[#090d16]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl"
            style={{
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Grab Notch */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            <div className="px-5 pt-2 pb-5 sm:px-6 sm:pb-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner"
                    style={{
                      background: location.color + "15",
                      borderColor: location.color + "35",
                    }}
                  >
                    {(() => {
                      const Icon = LOCATION_ICONS[location.id];
                      return Icon ? (
                        <Icon size={20} style={{ color: location.color }} />
                      ) : (
                        <span className="text-lg">{location.icon}</span>
                      );
                    })()}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg leading-snug text-white tracking-tight">
                      {location.label}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-white/50">
                      <span>{CATEGORY_NAMES[location.category ?? ""] ?? "Campus Destination"}</span>
                      <span>·</span>
                      <span>{location.floors ?? 1} {location.floors === 1 ? "Level" : "Floors"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* 3D Model Quick Inspector */}
                  <button
                    onClick={() => open3DTwin(location.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    title="Inspect 3D Digital Twin"
                  >
                    <Box size={13} className="text-[#38bdf8]" />
                    <span>3D Twin</span>
                  </button>

                  <button
                    onClick={clearNavigation}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.04] hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Navigation Telemetry Cards */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-1">
                    <Footprints size={10} className="text-[#38bdf8]" />
                    Distance
                  </span>
                  <span className="text-sm font-mono font-bold text-white mt-0.5">
                    {formatDistance(routeData.distance)}
                  </span>
                </div>

                <div className="flex flex-col border-x border-white/[0.06] px-2.5">
                  <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-1">
                    <Clock size={10} className="text-[#06b6d4]" />
                    Duration
                  </span>
                  <span className="text-sm font-mono font-bold text-white mt-0.5">
                    {formatDuration(routeData.duration)}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-white/40">
                    ETA
                  </span>
                  <span className="text-sm font-mono font-bold text-[#9bffce] mt-0.5">
                    {estimatedArrival}
                  </span>
                </div>
              </div>

              {/* Mode Actions */}
              {viewMode === "route-overview" && (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => setViewMode("turn-by-turn")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#38bdf8] text-[#050811] text-xs font-black uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[#38bdf8]/20 cursor-pointer"
                  >
                    <Navigation size={13} className="fill-[#050811]" />
                    Start Navigation
                  </button>

                  <button
                    onClick={() => setViewMode("ar-simulation")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                  >
                    <Compass size={13} className="text-[#06b6d4]" />
                    AR View
                  </button>
                </div>
              )}

              {viewMode === "turn-by-turn" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("ar-simulation")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Compass size={13} className="text-[#06b6d4]" />
                    Switch to AR View
                  </button>
                  <button
                    onClick={() => setViewMode("route-overview")}
                    className="px-4 py-3 rounded-2xl bg-white/[0.04] hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 text-white/60 text-xs font-bold transition-all cursor-pointer"
                  >
                    Exit
                  </button>
                </div>
              )}

              {viewMode === "ar-simulation" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("turn-by-turn")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Navigation size={13} className="text-[#38bdf8]" />
                    Switch to 3D Navigation
                  </button>
                  <button
                    onClick={() => setViewMode("route-overview")}
                    className="px-4 py-3 rounded-2xl bg-white/[0.04] hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20 text-white/60 text-xs font-bold transition-all cursor-pointer"
                  >
                    Exit AR
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
