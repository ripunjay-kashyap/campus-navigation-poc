import { create } from "zustand";
import type { ViewMode, NavigationRoute, ManeuverStep } from "@/types";

interface NavigationState {
  selectedDestination: string | null;
  hoveredLocation: string | null;
  viewMode: ViewMode;
  routeData: NavigationRoute | null;
  navSteps: ManeuverStep[];
  isSidebarOpen: boolean;
  is3DTwinOpen: boolean;
  twinLocationId: string | null;
  estimatedArrival: string | null;
  selectDestination: (id: string) => void;
  setHoveredLocation: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setRouteData: (data: NavigationRoute) => void;
  setSidebarOpen: (open: boolean) => void;
  open3DTwin: (locationId?: string) => void;
  close3DTwin: () => void;
  clearNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  selectedDestination: null,
  hoveredLocation: null,
  viewMode: "2d-map",
  routeData: null,
  navSteps: [],
  isSidebarOpen: false,
  is3DTwinOpen: false,
  twinLocationId: null,
  estimatedArrival: null,

  selectDestination: (id) =>
    set({ selectedDestination: id, viewMode: "route-overview", isSidebarOpen: false }),

  setHoveredLocation: (id) =>
    set((state) => state.hoveredLocation === id ? state : { hoveredLocation: id }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setRouteData: (data) => {
    const eta = new Date(Date.now() + data.duration * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    set({ routeData: data, navSteps: data.steps, estimatedArrival: eta });
  },

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  open3DTwin: (locationId?: string) => {
    const targetId = locationId ?? get().selectedDestination ?? "admin";
    set({ is3DTwinOpen: true, twinLocationId: targetId });
  },

  close3DTwin: () => set({ is3DTwinOpen: false }),

  clearNavigation: () =>
    set({
      selectedDestination: null,
      hoveredLocation: null,
      viewMode: "2d-map",
      routeData: null,
      navSteps: [],
      isSidebarOpen: false,
      is3DTwinOpen: false,
      estimatedArrival: null,
    }),
}));
