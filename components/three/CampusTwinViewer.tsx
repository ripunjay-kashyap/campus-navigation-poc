"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Layers,
  Box,
  Compass,
  RotateCw,
  Navigation,
  CheckCircle2,
  Clock,
  Maximize2
} from "lucide-react";
import { useNavigationStore } from "@/store/navigationStore";
import { CAMPUS_LOCATIONS } from "@/constants/locations";
import {
  createProceduralLandmark,
  type TwinViewMode,
  type LandmarkSceneResult,
} from "./models/proceduralLandmarks";

const CATEGORY_NAMES: Record<string, string> = {
  admin: "Administration",
  academic: "Academic",
  athletics: "Sports & Athletics",
  dining: "Dining & Food",
};

export function CampusTwinViewer() {
  const { is3DTwinOpen, twinLocationId, close3DTwin, selectDestination } =
    useNavigationStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<TwinViewMode>("pbr");
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [sliceDistance, setSliceDistance] = useState(2.2);

  const loc = CAMPUS_LOCATIONS.find((l) => l.id === twinLocationId) ?? CAMPUS_LOCATIONS[0];

  useEffect(() => {
    if (!is3DTwinOpen || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#080b11");

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(24, 18, 28);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below ground
    controls.minDistance = 8;
    controls.maxDistance = 75;
    controls.target.set(0, 4, 0);

    // 5. Lighting
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    sunLight.position.set(25, 35, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-20, 15, -20);
    scene.add(fillLight);

    // Subtle floor ground grid
    const gridHelper = new THREE.GridHelper(50, 50, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -0.22;
    if (gridHelper.material instanceof THREE.Material) {
      gridHelper.material.opacity = 0.25;
      gridHelper.material.transparent = true;
    }
    scene.add(gridHelper);

    // 6. Landmark Mesh
    const landmark: LandmarkSceneResult = createProceduralLandmark(loc.id, activeMode);
    scene.add(landmark.group);

    // Track original floor Y coordinates for slice animation
    const originalFloorY = landmark.floorGroups.map((fg) => fg.position.y);

    // 7. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Auto-rotation
      if (isAutoRotating) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.2;
      } else {
        controls.autoRotate = false;
      }

      controls.update();

      // Exploded floor animation lerping
      landmark.floorGroups.forEach((fg, i) => {
        const targetY =
          activeMode === "slices"
            ? originalFloorY[i] + i * sliceDistance
            : originalFloorY[i];

        fg.position.y = THREE.MathUtils.lerp(fg.position.y, targetY, 0.1);

        // Floor isolation opacity
        if (activeMode === "slices" && selectedFloor !== null) {
          const isTarget = selectedFloor === i;
          fg.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((m) => {
                m.transparent = true;
                m.opacity = THREE.MathUtils.lerp(m.opacity ?? 1, isTarget ? 1.0 : 0.2, 0.1);
              });
            }
          });
        }
      });

      landmark.update(delta);
      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      landmark.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [is3DTwinOpen, loc.id, activeMode, isAutoRotating, sliceDistance, selectedFloor]);

  if (!is3DTwinOpen) return null;

  function handleNavigate() {
    close3DTwin();
    selectDestination(loc.id);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
      >
        <div
          className="relative w-full max-w-6xl h-[90vh] max-h-[860px] rounded-3xl overflow-hidden flex flex-col md:flex-row border border-white/10 shadow-2xl"
          style={{ background: "#080b11" }}
        >
          {/* 3D Canvas Area */}
          <div className="relative flex-1 h-3/5 md:h-full overflow-hidden">
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top Bar: View Mode Switcher */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e1422]/85 backdrop-blur-md border border-white/10 shadow-lg">
              <button
                onClick={() => {
                  setActiveMode("pbr");
                  setSelectedFloor(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMode === "pbr"
                    ? "bg-[#38bdf8] text-[#050811] shadow-md shadow-[#38bdf8]/20"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Box size={13} />
                Architecture
              </button>

              <button
                onClick={() => {
                  setActiveMode("slices");
                  setSelectedFloor(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMode === "slices"
                    ? "bg-[#38bdf8] text-[#050811] shadow-md shadow-[#38bdf8]/20"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Layers size={13} />
                Floor Levels
              </button>

              <button
                onClick={() => {
                  setActiveMode("blueprint");
                  setSelectedFloor(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMode === "blueprint"
                    ? "bg-[#06b6d4] text-[#050811] shadow-md shadow-[#06b6d4]/20"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Compass size={13} />
                Blueprint
              </button>
            </div>

            {/* Top Right Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => setIsAutoRotating((p) => !p)}
                className={`w-9 h-9 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all ${
                  isAutoRotating
                    ? "bg-[#38bdf8]/20 border-[#38bdf8]/40 text-[#38bdf8]"
                    : "bg-[#0e1422]/80 border-white/10 text-white/60 hover:text-white"
                }`}
                title="Toggle Auto-Rotation"
              >
                <RotateCw size={14} className={isAutoRotating ? "animate-spin" : ""} style={{ animationDuration: "8s" }} />
              </button>

              <button
                onClick={close3DTwin}
                className="w-9 h-9 rounded-2xl flex items-center justify-center bg-[#0e1422]/80 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-white/60 hover:text-red-400 backdrop-blur-md transition-all"
                title="Close 3D Inspector"
              >
                <X size={16} />
              </button>
            </div>

            {/* Floor Slices Control Bar (When Slices mode is active) */}
            {activeMode === "slices" && loc.floorLevels && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-4 z-10 p-2.5 rounded-2xl bg-[#0e1422]/90 backdrop-blur-md border border-white/10 shadow-xl flex items-center justify-between gap-3 overflow-x-auto"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/40 pl-2">
                    Floor:
                  </span>
                  <button
                    onClick={() => setSelectedFloor(null)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedFloor === null
                        ? "bg-white/20 text-white border border-white/20"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  {loc.floorLevels.map((fl) => (
                    <button
                      key={fl.level}
                      onClick={() => setSelectedFloor(fl.level)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedFloor === fl.level
                          ? "bg-[#38bdf8] text-[#050811] shadow-md shadow-[#38bdf8]/30"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {fl.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pr-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/40">
                    Floor Gap:
                  </span>
                  <input
                    type="range"
                    min="1.0"
                    max="4.5"
                    step="0.2"
                    value={sliceDistance}
                    onChange={(e) => setSliceDistance(parseFloat(e.target.value))}
                    className="w-20 accent-[#38bdf8] cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {/* Interactive Rotation Hint */}
            <div className="absolute bottom-4 left-4 z-0 pointer-events-none hidden sm:flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
              <Maximize2 size={11} /> Drag to rotate · Scroll to zoom
            </div>
          </div>

          {/* Right Sidebar: Architectural Metadata & Floor Directory */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col justify-between p-6 bg-[#0a0e17] border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto">
            <div>
              {/* Landmark Header */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                  style={{
                    color: loc.color,
                    borderColor: loc.color + "40",
                    background: loc.color + "15",
                  }}
                >
                  {CATEGORY_NAMES[loc.category ?? ""] ?? "Landmark"}
                </span>
                <span className="text-xs text-white/40 font-mono">
                  {loc.floors ?? 1} {loc.floors === 1 ? "Level" : "Floors"} · {loc.height ?? 12}m
                </span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                {loc.label}
              </h2>
              <p className="text-xs text-white/60 mt-1 font-medium">
                {loc.architecturalStyle ?? "Contemporary Educational Complex"}
              </p>

              {/* Operating Hours */}
              <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70">
                <Clock size={13} className="text-[#38bdf8]" />
                <span className="font-semibold">Hours:</span>
                <span className="font-mono text-white/90">{loc.hours ?? "Open Campus"}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-white/70 mt-4 leading-relaxed">
                {loc.description}
              </p>

              {/* Amenities */}
              {loc.amenities && (
                <div className="mt-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">
                    Key Amenities & Facilities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {loc.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] border border-white/10 text-white/80"
                      >
                        <CheckCircle2 size={10} className="text-[#38bdf8]" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Floor Layout Breakdown */}
              {loc.floorLevels && (
                <div className="mt-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2">
                    Floor Directory
                  </span>
                  <div className="space-y-2">
                    {loc.floorLevels.map((fl) => (
                      <div
                        key={fl.level}
                        onClick={() => {
                          setActiveMode("slices");
                          setSelectedFloor(fl.level);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selectedFloor === fl.level
                            ? "bg-[#38bdf8]/10 border-[#38bdf8]/40"
                            : "bg-white/[0.02] border-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            {fl.label}: {fl.name}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {fl.facilities.map((fac, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 mt-6 border-t border-white/10 flex gap-2">
              <button
                onClick={handleNavigate}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-[#050811] text-xs font-black uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-[#38bdf8]/20 cursor-pointer"
              >
                <Navigation size={13} className="fill-[#050811]" />
                Navigate Here
              </button>
              <button
                onClick={close3DTwin}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
