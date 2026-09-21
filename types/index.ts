export interface FloorLevel {
  level: number;
  label: string;
  name: string;
  facilities: readonly string[];
}

export interface CampusLocation {
  id: string;
  label: string;
  lat: number;
  lng: number;
  color: string;
  icon: string;
  searchTerms: readonly string[];
  category?: "academic" | "athletics" | "dining" | "admin";
  floors?: number;
  height?: number; // meters
  architecturalStyle?: string;
  hours?: string;
  amenities?: readonly string[];
  description?: string;
  floorLevels?: readonly FloorLevel[];
}

export type ViewMode = "2d-map" | "route-overview" | "turn-by-turn" | "ar-simulation";

export interface ManeuverStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
    bearing_after: number;
  };
}

export interface NavigationRoute {
  geometry: GeoJSON.LineString;
  distance: number;
  duration: number;
  steps: ManeuverStep[];
}
