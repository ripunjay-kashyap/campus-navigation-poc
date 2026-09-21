"use client";

import { useEffect } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";

// Drive bearing through FreeCameraOptions so it stays consistent with the
// eye-level position set in CampusMap (setFreeCameraOptions preserves position,
// only the orientation changes).
function setARBearing(map: mapboxgl.Map, bearing: number) {
  const cam = map.getFreeCameraOptions();
  cam.setPitchBearing(85, bearing);
  map.setFreeCameraOptions(cam);
}

export function useARControls(
  mapRef: React.RefObject<MapRef | null>,
  isActive: boolean
) {
  useEffect(() => {
    if (!isActive) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const canvas = map.getCanvas();
    // Captured here so TypeScript preserves the narrowed non-null type inside closures.
    const m = map;

    // Desktop: click-and-drag → bearing
    let isDragging = false;
    let dragStartX = 0;
    let dragStartBearing = 0;

    function onMouseDown(e: MouseEvent) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartBearing = m.getBearing();
      canvas.style.cursor = "grabbing";
    }
    function onMouseMove(e: MouseEvent) {
      if (!isDragging) return;
      const delta = (e.clientX - dragStartX) / window.innerWidth * 360;
      setARBearing(m, dragStartBearing - delta);
    }
    function onMouseUp() {
      isDragging = false;
      canvas.style.cursor = "grab";
    }

    // Mobile: device orientation → bearing
    function onDeviceOrientation(e: DeviceOrientationEvent) {
      if (e.alpha !== null) setARBearing(m, e.alpha);
    }

    // Touch: swipe left/right → bearing
    let touchStartX = 0;
    let startBearing = 0;
    function onTouchStart(e: TouchEvent) {
      touchStartX = e.touches[0].clientX;
      startBearing = m.getBearing();
    }
    function onTouchMove(e: TouchEvent) {
      const delta = (e.touches[0].clientX - touchStartX) / window.innerWidth * 360;
      setARBearing(m, startBearing - delta);
    }

    canvas.style.cursor = "grab";
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("deviceorientation", onDeviceOrientation);

    return () => {
      canvas.style.cursor = "";
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("deviceorientation", onDeviceOrientation);
    };
  }, [isActive, mapRef]);
}
