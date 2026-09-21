"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNavigationStore } from "@/store/navigationStore";

export function useNavigationToasts() {
  const previousModeRef = useRef<string>("2d-map");

  const viewMode = useNavigationStore((state) => state.viewMode);

  useEffect(() => {
    const prevMode = previousModeRef.current;

    // Navigation started
    if (viewMode === "turn-by-turn" && prevMode !== "turn-by-turn") {
      toast.info("🧭 Turn-by-turn navigation started");
    }

    // AR mode entered
    if (viewMode === "ar-simulation" && prevMode !== "ar-simulation") {
      toast.info("✦ AR View — look around to explore");
    }

    previousModeRef.current = viewMode;
  }, [viewMode]);
}
