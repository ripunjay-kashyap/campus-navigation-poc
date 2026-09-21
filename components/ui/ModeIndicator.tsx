"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Map, Route, Navigation, Compass } from "lucide-react";
import { useNavigationStore } from "@/store/navigationStore";

const MODES = {
  "2d-map": {
    label: "Campus Map",
    subtext: "Campus Overview",
    icon: Map,
    accent: "#38bdf8",
  },
  "route-overview": {
    label: "Route Overview",
    subtext: "Path to Destination",
    icon: Route,
    accent: "#38bdf8",
  },
  "turn-by-turn": {
    label: "Walking Navigation",
    subtext: "Step-by-Step Directions",
    icon: Navigation,
    accent: "#9bffce",
  },
  "ar-simulation": {
    label: "AR Horizon View",
    subtext: "Street-Level Perspective",
    icon: Compass,
    accent: "#06b6d4",
  },
};

export function ModeIndicator() {
  const { viewMode } = useNavigationStore();
  const { label, subtext, icon: Icon, accent } = MODES[viewMode];

  return (
    <div className="absolute top-4 left-16 md:left-4 z-40">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#090d16]/90 backdrop-blur-xl border border-white/[0.08] shadow-xl"
        >
          {/* Status icon */}
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${accent}15`,
              border: `1px solid ${accent}30`,
            }}
          >
            <Icon size={13} style={{ color: accent }} />
          </div>

          <div className="flex flex-col pr-1">
            <span className="text-xs font-bold text-white tracking-tight leading-tight">
              {label}
            </span>
            <span className="text-[10px] font-medium text-white/50 tracking-tight">
              {subtext}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
