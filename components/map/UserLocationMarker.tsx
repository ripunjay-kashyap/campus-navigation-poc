"use client";

import { Marker } from "react-map-gl/mapbox";
import { COLLEGE_GATE } from "@/constants/locations";
import type { ViewMode } from "@/types";

interface UserLocationMarkerProps {
  mode: ViewMode;
  bearing?: number;
}

export function UserLocationMarker({ mode, bearing = 0 }: UserLocationMarkerProps) {
  const isNavMode = mode === "turn-by-turn" || mode === "ar-simulation";

  return (
    <Marker longitude={COLLEGE_GATE.lng} latitude={COLLEGE_GATE.lat} anchor="center">
      {isNavMode ? (
        <div
          style={{ transform: `rotate(${bearing}deg)` }}
          className="w-8 h-8 flex items-center justify-center drop-shadow-lg"
        >
          <svg viewBox="0 0 24 24" fill="#38bdf8" stroke="#050811" strokeWidth="1.5" width="32" height="32">
            <polygon points="12,2 20,20 12,16 4,20" />
          </svg>
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-10 h-10 rounded-full animate-ping"
            style={{ background: "rgba(56, 189, 248, 0.25)" }}
          />
          <div
            className="w-4 h-4 rounded-full shadow-lg"
            style={{
              background: "#38bdf8",
              border: "2px solid #dee5ff",
              boxShadow: "0 0 10px rgba(56, 189, 248,0.6)",
            }}
          />
        </div>
      )}
    </Marker>
  );
}
