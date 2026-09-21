"use client";

import { CampusMap } from "@/components/map/CampusMap";
import { Sidebar } from "@/components/layout/Sidebar";
import { NavigationInfoPanel } from "@/components/navigation/NavigationInfoPanel";
import { TurnByTurnOverlay } from "@/components/navigation/TurnByTurnOverlay";
import { ModeIndicator } from "@/components/ui/ModeIndicator";
import { ARHudOverlay } from "@/components/ar/ARHudOverlay";
import { CampusTwinViewer } from "@/components/three/CampusTwinViewer";
import { useNavigationToasts } from "@/hooks/useNavigationToasts";

export default function Home() {
  useNavigationToasts();

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <CampusMap />
        <ARHudOverlay />
        <ModeIndicator />
        <TurnByTurnOverlay />
        <NavigationInfoPanel />
        <CampusTwinViewer />
      </main>
    </div>
  );
}
