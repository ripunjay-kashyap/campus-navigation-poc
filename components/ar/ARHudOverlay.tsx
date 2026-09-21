"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useMap } from "react-map-gl/mapbox";
import { useNavigationStore } from "@/store/navigationStore";
import { CAMPUS_LOCATIONS, COLLEGE_GATE } from "@/constants/locations";
import { calculateBearing } from "@/utils/bearing";
import { Compass, Eye, Navigation, ArrowUp } from "lucide-react";

// Compass ticks (-360 to 720 to cover smooth wrapping)
const COMPASS_TICKS: Array<{ angle: number; displayAngle: number; label: string | null }> = [];
for (let cycle = -1; cycle <= 1; cycle++) {
  for (let angle = 0; angle < 360; angle += 15) {
    let label: string | null = null;
    if (angle === 0) label = "N";
    else if (angle === 45) label = "NE";
    else if (angle === 90) label = "E";
    else if (angle === 135) label = "SE";
    else if (angle === 180) label = "S";
    else if (angle === 225) label = "SW";
    else if (angle === 270) label = "W";
    else if (angle === 315) label = "NW";

    COMPASS_TICKS.push({
      angle: cycle * 360 + angle,
      displayAngle: angle,
      label,
    });
  }
}

function getCardinalDirection(bearing: number) {
  const directions = [
    "North",
    "Northeast",
    "East",
    "Southeast",
    "South",
    "Southwest",
    "West",
    "Northwest",
  ];
  const index = Math.round(((bearing % 360) + 360) % 360 / 45) % 8;
  return directions[index];
}

export function ARHudOverlay() {
  const { viewMode, selectedDestination } = useNavigationStore();
  const visible = viewMode === "ar-simulation";

  const { current: map } = useMap();
  const [bearing, setBearing] = useState(0);

  const dest = CAMPUS_LOCATIONS.find((l) => l.id === selectedDestination);
  const targetBearing = dest
    ? calculateBearing(COLLEGE_GATE.lat, COLLEGE_GATE.lng, dest.lat, dest.lng)
    : 0;

  // Bearing offset from current camera heading to destination (-180 to 180)
  const relativeBearing = (((targetBearing - bearing + 540) % 360) - 180);
  const isAligned = Math.abs(relativeBearing) < 18;

  useEffect(() => {
    if (!map || viewMode !== "ar-simulation") return;

    const updateBearing = () => {
      const raw = map.getBearing();
      setBearing(Math.round((raw + 360) % 360));
    };

    updateBearing();
    map.on("rotate", updateBearing);
    return () => {
      map.off("rotate", updateBearing);
    };
  }, [map, viewMode]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-30 pointer-events-none select-none overflow-hidden"
        >
          {/* Subtle Viewport Brackets (Spatial Framing) */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
          <div className="absolute bottom-40 left-6 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
          <div className="absolute bottom-40 right-6 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-lg" />

          {/* Top Compass Tape */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-12 overflow-hidden mask-gradient-horizontal z-40 bg-[#090d16]/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
            {/* Center Heading Marker */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#38bdf8] z-10 shadow-[0_0_8px_#38bdf8]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#38bdf8] z-10" />

            {/* Tape Ticks */}
            <div
              className="absolute top-0 bottom-0 flex items-center transition-transform duration-75 ease-out"
              style={{
                transform: `translateX(calc(-50% - ${bearing * 2.5}px))`,
                left: "50%",
              }}
            >
              {COMPASS_TICKS.map((t, idx) => (
                <div
                  key={idx}
                  className="absolute flex flex-col items-center justify-between h-full py-1.5"
                  style={{
                    left: `${t.angle * 2.5}px`,
                    width: "40px",
                    marginLeft: "-20px",
                  }}
                >
                  <div
                    className="w-[1.5px]"
                    style={{
                      height: t.label ? "10px" : "5px",
                      backgroundColor: t.label ? "#38bdf8" : "rgba(255, 255, 255, 0.25)",
                    }}
                  />
                  <span
                    className="text-[9px] font-mono font-bold"
                    style={{
                      color: t.label ? "#38bdf8" : "rgba(255, 255, 255, 0.45)",
                    }}
                  >
                    {t.label ?? ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Central Spatial Waypoint Horizon (Non-intrusive) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            {/* Pitch Horizon Level Bars */}
            <div className="flex items-center gap-10 opacity-30">
              <div className="w-12 h-[1px] bg-white" />
              <div className="w-1.5 h-1.5 rounded-full border border-white" />
              <div className="w-12 h-[1px] bg-white" />
            </div>

            {/* Destination Tracking Needle */}
            {dest && (
              <motion.div
                animate={{
                  x: Math.max(-140, Math.min(140, relativeBearing * 2.5)),
                  opacity: isAligned ? 1.0 : 0.75,
                  scale: isAligned ? 1.05 : 0.95,
                }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className="mt-4 flex flex-col items-center pointer-events-none"
              >
                <div
                  className={`px-3 py-1 rounded-full backdrop-blur-md border flex items-center gap-1.5 transition-all ${
                    isAligned
                      ? "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.35)]"
                      : "bg-[#090d16]/80 border-white/10 text-white/70"
                  }`}
                >
                  <ArrowUp
                    size={11}
                    style={{
                      transform: `rotate(${relativeBearing}deg)`,
                      transition: "transform 0.15s ease-out",
                    }}
                  />
                  <span className="text-[10px] font-bold tracking-tight">
                    {dest.label}
                  </span>
                  {isAligned && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Spatial Information Panels */}
          {/* Bottom Left: Eye-level Heading */}
          <div className="absolute bottom-40 sm:bottom-48 left-6 z-40 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090d16]/80 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/80">
              <Eye size={12} className="text-[#38bdf8]" />
              <span>Pedestrian View</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090d16]/80 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/80">
              <Compass size={12} className="text-[#9bffce]" />
              <span>
                Heading: {getCardinalDirection(bearing)}
              </span>
            </div>
          </div>

          {/* Bottom Right: Destination & Campus */}
          {dest && (
            <div className="absolute bottom-40 sm:bottom-48 right-6 z-40 flex flex-col gap-1.5 items-end">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090d16]/80 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white/80">
                <Navigation size={12} className="text-[#38bdf8]" />
                <span>Destination: {dest.label}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-[#090d16]/80 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white/60">
                Sathyabama Main Campus
              </div>
            </div>
          )}

          {/* 360 exploration gesture hint */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#090d16]/75 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white/60 tracking-wider">
            Drag or tilt to look around campus
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
