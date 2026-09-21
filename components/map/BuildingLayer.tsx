"use client";

import { Layer } from "react-map-gl/mapbox";
import { useNavigationStore } from "@/store/navigationStore";

export function BuildingLayer() {
  const { viewMode } = useNavigationStore();
  const visible = viewMode === "turn-by-turn" || viewMode === "ar-simulation";
  const isAR = viewMode === "ar-simulation";

  if (!visible) return null;

  // The dark-v11 style already exposes a "composite" source that includes
  // mapbox-streets-v8. Re-declaring it as a <Source> conflicts and causes
  // tile fetch aborts. Use the style's existing source directly.
  return (
    <>
      {/* Body layer — translucent holographic blue in AR, solid dark blue in turn-by-turn */}
      <Layer
        id="3d-buildings"
        source="composite"
        source-layer="building"
        type="fill-extrusion"
        minzoom={14}
        filter={["==", "extrude", "true"]}
        paint={{
          "fill-extrusion-color": isAR
            ? "#06b6d4"   // secondary neon purple — holographic AR tint
            : [           // subtle dark blue for turn-by-turn
                "interpolate", ["linear"], ["get", "height"],
                0,   "#1a1a2e",
                20,  "#16213e",
                50,  "#0f3460",
                100, "#1a4a7a",
              ],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": isAR ? 0.35 : 0.85,
          // Bypass PBR lighting in AR — makes every face emit full color
          // instead of going muddy on shadow sides (v3 only)
          ...(isAR && { "fill-extrusion-emissive-strength": 1.0 }),
        }}
      />

      {/* Top-edge highlight layer — AR only. Renders buildings slightly taller at
          very low opacity so the top edge reads as a bright rim, approximating
          the glowing-edge look that fill-extrusion can't do natively. */}
      {isAR && (
        <Layer
          id="3d-buildings-edge"
          source="composite"
          source-layer="building"
          type="fill-extrusion"
          minzoom={14}
          filter={["==", "extrude", "true"]}
          paint={{
            "fill-extrusion-color": "#dee5ff",   // on-surface light for the rim highlight
            "fill-extrusion-height": ["+", ["get", "height"], 0.6],
            "fill-extrusion-base": ["get", "height"],
            "fill-extrusion-opacity": 0.08,
            "fill-extrusion-emissive-strength": 1.0,
          }}
        />
      )}
    </>
  );
}
