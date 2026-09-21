"use client";

import { useState } from "react";
import { Marker } from "react-map-gl/mapbox";
import { motion } from "framer-motion";
import type { CampusLocation } from "@/types";
import { useNavigationStore } from "@/store/navigationStore";

// Design system secondary color for all map destination markers
const MARKER_COLOR = "#06b6d4";
const MARKER_GLOW  = "rgba(6, 182, 212, 0.35)";
const MARKER_GLOW_STRONG = "rgba(6, 182, 212, 0.6)";

interface DestinationPinProps {
  location: CampusLocation;
  onSelect: (id: string) => void;
}

export function DestinationPin({ location, onSelect }: DestinationPinProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { viewMode, selectedDestination, hoveredLocation, setHoveredLocation } = useNavigationStore();

  const isSelected = selectedDestination === location.id;
  const isSidebarHovered = hoveredLocation === location.id;
  const isActive = isSelected || isSidebarHovered || isHovered;

  // AR mode uses holographic CSS markers instead
  if (viewMode === "ar-simulation") return null;

  const dotSize = isSelected ? 14 : 10;
  const scale   = isSelected ? 1.45 : isActive ? 1.2 : 1;

  return (
    <Marker
      longitude={location.lng}
      latitude={location.lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onSelect(location.id);
      }}
    >
      <motion.div
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        style={{ transformOrigin: "bottom center" }}
        onMouseEnter={() => { setIsHovered(true); setHoveredLocation(location.id); }}
        onMouseLeave={() => { setIsHovered(false); setHoveredLocation(null); }}
        className="flex flex-col items-center cursor-pointer"
      >
        {/* Floating label pill */}
        <div
          className="mb-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-150"
          style={{
            background: isSelected ? MARKER_COLOR : "rgba(9, 19, 40, 0.88)",
            color: isSelected ? "#050811" : "#dee5ff",
            outline: `1px solid ${isActive ? MARKER_COLOR : "rgba(6, 182, 212,0.3)"}`,
            opacity: isActive ? 1 : 0.85,
            fontFamily: "var(--font-inter)",
          }}
        >
          {location.label}
        </div>

        {/* Dot + pulse ring */}
        <div className="relative flex items-center justify-center">
          {isActive && (
            <span
              className="absolute rounded-full animate-ping opacity-30"
              style={{
                width: dotSize + 12,
                height: dotSize + 12,
                background: MARKER_COLOR,
              }}
            />
          )}
          <div
            className="relative z-10 rounded-full border-2 transition-all duration-150"
            style={{
              width: dotSize,
              height: dotSize,
              background: MARKER_COLOR,
              borderColor: isSelected ? "#dee5ff" : "rgba(255,255,255,0.6)",
              boxShadow: isActive
                ? `0 0 12px ${MARKER_GLOW_STRONG}, 0 0 24px ${MARKER_GLOW}`
                : `0 2px 6px rgba(0,0,0,0.5)`,
            }}
          />
        </div>

        {/* Stem */}
        <div
          style={{
            width: 2,
            height: 7,
            background: MARKER_COLOR,
            opacity: 0.5,
            borderRadius: 1,
          }}
        />
      </motion.div>
    </Marker>
  );
}
