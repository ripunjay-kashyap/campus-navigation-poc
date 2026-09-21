"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";
import * as THREE from "three";
import mapboxgl from "mapbox-gl";
import { useNavigationStore } from "@/store/navigationStore";
import { CAMPUS_LOCATIONS } from "@/constants/locations";

export function ThreeMapLayer() {
  const { current: mapWrapper } = useMap();
  const { selectedDestination, routeData, viewMode, is3DTwinOpen } = useNavigationStore();

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const chevronsRef = useRef<THREE.Group[]>([]);
  const beaconGroupRef = useRef<THREE.Group | null>(null);

  const isNavModeRef = useRef(false);
  const is3DTwinOpenRef = useRef(false);

  useEffect(() => {
    isNavModeRef.current = viewMode === "route-overview" || viewMode === "turn-by-turn" || viewMode === "ar-simulation";
    is3DTwinOpenRef.current = is3DTwinOpen;
  }, [viewMode, is3DTwinOpen]);

  useEffect(() => {
    const map = mapWrapper?.getMap();
    if (!map) return;

    const layerId = "three-custom-layer";

    // Clean up if layer already exists
    if (map.getLayer(layerId)) {
      try {
        map.removeLayer(layerId);
      } catch {
        /* ignore */
      }
    }

    const customLayer: mapboxgl.CustomLayerInterface = {
      id: layerId,
      type: "custom",
      renderingMode: "3d",

      onAdd(mapInstance, gl) {
        const camera = new THREE.Camera();
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Ambient & Directional lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
        dirLight.position.set(0, -100, 100);
        scene.add(dirLight);

        // WebGL Renderer sharing Mapbox context
        const renderer = new THREE.WebGLRenderer({
          canvas: mapInstance.getCanvas(),
          context: gl,
          antialias: true,
        });
        renderer.autoClear = false;
        rendererRef.current = renderer;

        // 1. Destination Beacon Group
        const beaconGroup = new THREE.Group();
        beaconGroupRef.current = beaconGroup;
        scene.add(beaconGroup);

        // Beacon Pillar (Vertical Light Column)
        const pillarGeo = new THREE.CylinderGeometry(0.8, 1.8, 25, 16);
        pillarGeo.rotateX(Math.PI / 2);
        const pillarMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide,
        });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.z = 12.5; // Half height
        beaconGroup.add(pillar);

        // Beacon Core Point
        const coreGeo = new THREE.SphereGeometry(1.6, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.z = 25;
        beaconGroup.add(core);

        // Ground Pulse Rings
        ringsRef.current = [];
        for (let i = 0; i < 3; i++) {
          const ringGeo = new THREE.RingGeometry(1.5, 2.2, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.z = 0.2;
          ring.userData = { phase: i * (Math.PI * 2 / 3) };
          beaconGroup.add(ring);
          ringsRef.current.push(ring);
        }

        // Store camera for render loop
        cameraRef.current = camera;
      },

      render(gl, matrix) {
        const camera = cameraRef.current;
        const renderer = rendererRef.current;
        const scene = sceneRef.current;

        if (!camera || !renderer || !scene) return;

        // Sync camera projection with Mapbox projection matrix
        const m = new THREE.Matrix4().fromArray(matrix);
        camera.projectionMatrix = m;

        // Animate Destination Pulse Rings
        const time = performance.now() * 0.002;
        ringsRef.current.forEach((ring) => {
          const phase = ring.userData.phase as number;
          const cycle = (time + phase) % (Math.PI * 2);
          const scale = 1 + cycle * 4; // Expand outwards
          const opacity = Math.max(0, 1 - cycle / (Math.PI * 2));
          ring.scale.set(scale, scale, 1);
          if (ring.material instanceof THREE.MeshBasicMaterial) {
            ring.material.opacity = opacity * 0.75;
          }
        });

        // Animate Chevrons Bobbing
        chevronsRef.current.forEach((chev, idx) => {
          const bounce = Math.sin(time * 3 + idx * 0.8) * 0.6;
          chev.position.z = 2.5 + bounce;
        });

        renderer.resetState();
        renderer.render(scene, camera);

        // Only trigger continuous animation loop when navigation animations are visible
        // and 3D twin modal is not obscuring the view. This prevents 100% idle GPU usage.
        if (
          isNavModeRef.current &&
          !is3DTwinOpenRef.current &&
          (beaconGroupRef.current?.visible || chevronsRef.current.length > 0)
        ) {
          map.triggerRepaint();
        }
      },

      onRemove() {
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current = null;
        }
        sceneRef.current = null;
        ringsRef.current = [];
        chevronsRef.current = [];
        beaconGroupRef.current = null;
      },
    };

    try {
      map.addLayer(customLayer);
    } catch (err) {
      console.warn("Could not add Three.js custom layer to map:", err);
    }

    return () => {
      if (map.getLayer(layerId)) {
        try {
          map.removeLayer(layerId);
        } catch {
          /* ignore */
        }
      }
    };
  }, [mapWrapper]);

  // Update Destination Beacon Position when destination changes
  useEffect(() => {
    const beaconGroup = beaconGroupRef.current;
    if (!beaconGroup) return;

    if (!selectedDestination) {
      beaconGroup.visible = false;
      return;
    }

    const loc = CAMPUS_LOCATIONS.find((l) => l.id === selectedDestination);
    if (!loc) {
      beaconGroup.visible = false;
      return;
    }

    beaconGroup.visible = true;

    // Convert GPS to Mercator coordinate
    const coord = mapboxgl.MercatorCoordinate.fromLngLat([loc.lng, loc.lat], 0);
    const scale = coord.meterInMercatorCoordinateUnits();

    beaconGroup.position.set(coord.x, coord.y, coord.z);
    beaconGroup.scale.set(scale, scale, scale);
  }, [selectedDestination]);

  // Update Route Chevrons when Route Data changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old chevrons
    chevronsRef.current.forEach((chev) => scene.remove(chev));
    chevronsRef.current = [];

    const isNavMode = viewMode === "route-overview" || viewMode === "turn-by-turn" || viewMode === "ar-simulation";
    if (!routeData || !isNavMode || !routeData.geometry?.coordinates) return;

    const coords = routeData.geometry.coordinates;
    if (coords.length < 2) return;

    // Place an animated 3D chevron every ~35 meters along the route
    const chevronGeo = new THREE.ConeGeometry(1.2, 3.0, 3);
    chevronGeo.rotateX(Math.PI / 2); // Point forward along path

    // Sample points along route
    const step = Math.max(1, Math.floor(coords.length / 8));
    for (let i = 0; i < coords.length - 1; i += step) {
      const p1 = coords[i];
      const p2 = coords[Math.min(i + 1, coords.length - 1)];

      const mc = mapboxgl.MercatorCoordinate.fromLngLat([p1[0], p1[1]], 2.5);
      const scale = mc.meterInMercatorCoordinateUnits();

      const chevGroup = new THREE.Group();
      chevGroup.position.set(mc.x, mc.y, mc.z);
      chevGroup.scale.set(scale, scale, scale);

      // Calculate bearing angle to next point
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      const angle = Math.atan2(dx, dy);
      chevGroup.rotation.z = -angle;

      const chevMat = new THREE.MeshBasicMaterial({
        color: 0x9bffce,
        wireframe: false,
        transparent: true,
        opacity: 0.85,
      });

      const cone = new THREE.Mesh(chevronGeo, chevMat);
      chevGroup.add(cone);

      scene.add(chevGroup);
      chevronsRef.current.push(chevGroup);
    }
  }, [routeData, viewMode]);

  return null;
}
