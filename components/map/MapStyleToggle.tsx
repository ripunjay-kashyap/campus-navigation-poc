"use client";

import { Map, Globe } from "lucide-react";
import { useNavigationStore } from "@/store/navigationStore";

interface MapStyleToggleProps {
  isSatellite: boolean;
  onToggle: () => void;
}

export function MapStyleToggle({ isSatellite, onToggle }: MapStyleToggleProps) {
  const { viewMode } = useNavigationStore();
  if (viewMode === "ar-simulation") return null;

  return (
    <button
      onClick={onToggle}
      className="absolute top-4 right-4 z-40 flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all bg-[#090d16]/90 hover:bg-[#121624] backdrop-blur-xl border border-white/[0.08] text-white/80 hover:text-white shadow-xl cursor-pointer active:scale-95"
    >
      {isSatellite ? (
        <>
          <Map size={13} className="text-[#38bdf8]" />
          <span>Street Plan</span>
        </>
      ) : (
        <>
          <Globe size={13} className="text-[#38bdf8]" />
          <span>Satellite</span>
        </>
      )}
    </button>
  );
}
