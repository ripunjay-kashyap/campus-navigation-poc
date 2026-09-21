"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Map, { NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import { toast } from "sonner";
import { Menu } from "lucide-react";
import { CAMPUS_LOCATIONS, COLLEGE_GATE } from "@/constants/locations";
import { useNavigationStore } from "@/store/navigationStore";
import { getDirections } from "@/hooks/useDirections";
import { useARControls } from "@/hooks/useARControls";
import { calculateBearing, haversineDistance } from "@/utils/bearing";
import { formatDistance, formatDuration } from "@/utils/formatDistance";
import { arFog } from "@/utils/fogConfig";
import { UserLocationMarker } from "./UserLocationMarker";
import { DestinationPin } from "./DestinationPin";
import { MapStyleToggle } from "./MapStyleToggle";
import { RouteLayer } from "./RouteLayer";
import { BuildingLayer } from "./BuildingLayer";
import { ThreeMapLayer } from "./ThreeMapLayer";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const STYLES = {
  street: "mapbox://styles/mapbox/standard",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

const LUT_BASE64 = "data:image/png;base64,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";

function fitRouteBounds(map: mapboxgl.Map, dest: { lat: number; lng: number }) {
  const bearing = calculateBearing(COLLEGE_GATE.lat, COLLEGE_GATE.lng, dest.lat, dest.lng);
  map.fitBounds(
    [
      [Math.min(COLLEGE_GATE.lng, dest.lng), Math.min(COLLEGE_GATE.lat, dest.lat)],
      [Math.max(COLLEGE_GATE.lng, dest.lng), Math.max(COLLEGE_GATE.lat, dest.lat)],
    ],
    { padding: { top: 120, bottom: 220, left: 80, right: 80 }, pitch: 45, bearing, duration: 1500 }
  );
}

export function CampusMap() {
  const mapRef = useRef<MapRef>(null);
  const arMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const transitioningRef = useRef(false);  // guard against rapid mode switches
  const [isSatellite, setIsSatellite] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const {
    viewMode,
    navSteps,
    selectedDestination,
    routeData,
    selectDestination,
    setRouteData,
    setSidebarOpen,
  } = useNavigationStore();

  const firstStepBearing = navSteps[0]?.maneuver.bearing_after ?? 0;
  const isAR = viewMode === "ar-simulation";

  // Track live map bearing in AR mode so the arrow always points toward destination
  const [mapBearing, setMapBearing] = useState(0);
  useEffect(() => {
    if (viewMode !== "ar-simulation") return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    const update = () => setMapBearing(map.getBearing());
    update();
    map.on("rotate", update);
    return () => { map.off("rotate", update); };
  }, [viewMode]);

  // Apply Mapbox Standard cyberpunk theme, LUT, and night lighting
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const applyStandardConfig = () => {
      if (isSatellite) return;
      try {
        map.setConfigProperty("basemap", "theme", "custom");
        map.setConfigProperty("basemap", "theme-data", LUT_BASE64);
        map.setConfigProperty("basemap", "lightPreset", "night");
        map.setConfigProperty("basemap", "show3dObjects", false); // Hide standard 3D buildings to use custom ones
      } catch (e) {
        console.warn("Failed to apply Mapbox Standard configuration properties:", e);
      }
    };

    if (map.isStyleLoaded()) {
      applyStandardConfig();
    }
    map.on("style.load", applyStandardConfig);

    return () => {
      map.off("style.load", applyStandardConfig);
    };
  }, [isSatellite]);


  const dest = CAMPUS_LOCATIONS.find((l) => l.id === selectedDestination);
  const destBearing = dest
    ? calculateBearing(COLLEGE_GATE.lat, COLLEGE_GATE.lng, dest.lat, dest.lng)
    : 0;

  // Mode 4: arrow points toward destination relative to current camera bearing.
  // Mode 3: map is rotated to firstStepBearing, so 0° points forward.
  const arrowBearing = viewMode === "ar-simulation" ? destBearing - mapBearing : 0;

  // 360° look-around for AR mode
  useARControls(mapRef, isAR);

  // Fetch route + transition to Mode 2 when destination changes
  useEffect(() => {
    if (!selectedDestination) return;
    const dest = CAMPUS_LOCATIONS.find((l) => l.id === selectedDestination);
    if (!dest) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingRoute(true);
    getDirections(dest.lat, dest.lng)
      .then((route) => {
        setRouteData(route);
        toast.success(
          `Route to ${dest.label} · ${formatDistance(route.distance)} · ${formatDuration(route.duration)}`
        );

        const map = mapRef.current?.getMap();
        if (!map) return;

        fitRouteBounds(map, dest);
      })
      .catch(() => toast.error("Unable to calculate route. Please try again."))
      .finally(() => setLoadingRoute(false));
  }, [selectedDestination]); // eslint-disable-line react-hooks/exhaustive-deps

  // AR markers — create on enter, remove on exit
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (viewMode !== "ar-simulation") return;

    // Determine which locations to show — selected dest + remaining as ghost markers
    const locations = selectedDestination
      ? CAMPUS_LOCATIONS.filter((l) => l.id === selectedDestination)
      : [...CAMPUS_LOCATIONS];

    locations.forEach((loc) => {
      const dist = haversineDistance(
        COLLEGE_GATE.lat, COLLEGE_GATE.lng,
        loc.lat, loc.lng
      );

      const el = document.createElement("div");
      el.className = "ar-nav-arrow";
      el.style.borderColor = loc.color + "99";
      el.style.boxShadow = `0 0 20px ${loc.color}4d, 0 0 60px ${loc.color}1a`;
      el.innerHTML = `
        <div class="ar-arrow-icon">➤</div>
        <div class="ar-arrow-label">${loc.label}</div>
        <div class="ar-arrow-distance">${formatDistance(dist)}</div>
      `;

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([loc.lng, loc.lat])
        .setOffset([0, -60])
        .addTo(map);

      arMarkersRef.current.push(marker);
    });

    return () => {
      arMarkersRef.current.forEach((m) => m.remove());
      arMarkersRef.current = [];
    };
  }, [viewMode, selectedDestination]);

  // Camera + fog + pan-lock transitions per viewMode
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // 2d-map reset runs even when routeData is null (e.g. after clearNavigation)
    if (viewMode === "2d-map") {
      if (transitioningRef.current) map.stop();
      transitioningRef.current = true;
      map.once("moveend", () => { transitioningRef.current = false; });
      map.easeTo({ pitch: 0, bearing: 0, zoom: 15, duration: 1500 });
      try { map.setFog({}); } catch { /* ignore */ }
      try { map.setTerrain(null); } catch { /* ignore */ }
      map.dragPan.enable();
      map.scrollZoom.enable();
      return;
    }

    if (!routeData) return;

    // Ignore if a transition is already in flight — prevents rapid-click queuing
    if (transitioningRef.current) {
      map.stop();  // cancel any in-progress easeTo
    }
    transitioningRef.current = true;
    map.once("moveend", () => { transitioningRef.current = false; });

    const dest = CAMPUS_LOCATIONS.find((l) => l.id === selectedDestination);

    if (viewMode === "route-overview" && dest) {
      try { map.setTerrain(null); } catch { /* ignore */ }
      try { map.setFog({}); } catch { /* ignore */ }
      fitRouteBounds(map, dest);
      map.dragPan.enable();
      map.scrollZoom.enable();
    } else if (viewMode === "turn-by-turn") {
      // Sidebar unmounts when entering this mode — resize so the canvas fills the
      // now-wider container before the camera animation uses the new dimensions.
      map.resize();
      // Set terrain before camera animation so it doesn't interrupt easeTo
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", { type: "raster-dem", url: "mapbox://mapbox.mapbox-terrain-dem-v1", tileSize: 512, maxzoom: 14 });
      }
      try { map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 }); } catch { /* ignore */ }
      try { map.setFog({}); } catch { /* ignore */ }
      map.easeTo({
        pitch: 60,
        bearing: firstStepBearing,
        zoom: 18,
        center: [COLLEGE_GATE.lng, COLLEGE_GATE.lat],
        duration: 2000,
      });
      map.dragPan.enable();
      map.scrollZoom.enable();
    } else if (viewMode === "ar-simulation") {
      // Same resize needed — sidebar also unmounts in AR mode.
      map.resize();
      // No terrain in AR mode: MercatorCoordinate altitude is above sea level, and
      // terrain exaggeration would push the ground mesh above the camera at 1.7 m.
      try { map.setTerrain(null); } catch { /* ignore */ }
      map.setFog(arFog);
      map.easeTo({
        pitch: 85,
        zoom: 20,
        center: [COLLEGE_GATE.lng, COLLEGE_GATE.lat],
        duration: 2500,
      });
      // After the zoom/pitch animation, snap the camera to true eye level (1.7 m).
      // setFreeCameraOptions is instantaneous — doing it inside moveend avoids a
      // jarring mid-animation jump.
      map.once("moveend", () => {
        const position = mapboxgl.MercatorCoordinate.fromLngLat(
          [COLLEGE_GATE.lng, COLLEGE_GATE.lat],
          1.7
        );
        const cam = map.getFreeCameraOptions();
        cam.position = position;
        cam.setPitchBearing(85, map.getBearing());
        map.setFreeCameraOptions(cam);
      });
      map.dragPan.disable();
      map.scrollZoom.disable();
    }
  }, [viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStyleToggle = useCallback(() => setIsSatellite((p) => !p), []);

  const isFullscreen = viewMode === "turn-by-turn" || viewMode === "ar-simulation";

  return (
    <div
      className="relative flex-1"
      style={{ width: "100%", height: "100vh" }}
    >
      <LoadingOverlay isLoading={loadingRoute} />

      {/* Mobile Menu Toggle */}
      {!isFullscreen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 z-40 w-10 h-10 rounded-full flex items-center justify-center bg-[#090e1a]/90 backdrop-blur-md border border-white/10 text-white md:hidden shadow-lg"
        >
          <Menu size={20} />
        </button>
      )}

      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          latitude: 12.8725,
          longitude: 80.222,
          zoom: 15,
          pitch: 0,
          bearing: 0,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={isSatellite ? STYLES.satellite : STYLES.street}
      >
        {!isAR && <NavigationControl position="bottom-right" />}
        <BuildingLayer />
        <RouteLayer />
        <ThreeMapLayer />
        <UserLocationMarker mode={viewMode} bearing={arrowBearing} />
        {CAMPUS_LOCATIONS.map((loc) => (
          <DestinationPin
            key={loc.id}
            location={loc}
            onSelect={selectDestination}
          />
        ))}
      </Map>

      <MapStyleToggle isSatellite={isSatellite} onToggle={handleStyleToggle} />
    </div>
  );
}
