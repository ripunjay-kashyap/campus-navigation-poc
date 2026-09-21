import * as THREE from "three";

export type TwinViewMode = "pbr" | "slices" | "blueprint";

export interface LandmarkSceneResult {
  group: THREE.Group;
  floorGroups: THREE.Group[];
  update: (delta: number) => void;
  dispose: () => void;
}

// Reusable material palette tailored to Sathyabama University's signature architecture
function createMaterials(mode: TwinViewMode) {
  if (mode === "blueprint") {
    const wireColor = new THREE.Color("#38bdf8");
    const faceColor = new THREE.Color("#0f172a");

    return {
      concrete: new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true }),
      accent: new THREE.MeshBasicMaterial({ color: new THREE.Color("#06b6d4"), wireframe: true }),
      glass: new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true }),
      glow: new THREE.MeshBasicMaterial({ color: new THREE.Color("#9bffce"), wireframe: true }),
      ground: new THREE.MeshBasicMaterial({ color: faceColor, wireframe: true }),
      metal: new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true }),
      dark: new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true }),
      wood: new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true }),
      sathyabamaMaroon: new THREE.MeshBasicMaterial({ color: new THREE.Color("#9f1239"), wireframe: true }),
      ivoryStucco: new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true }),
      stainlessSteel: new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true }),
      foliage: new THREE.MeshBasicMaterial({ color: new THREE.Color("#22c55e"), wireframe: true }),
      trunk: new THREE.MeshBasicMaterial({ color: new THREE.Color("#b45309"), wireframe: true }),
      courtKey: new THREE.MeshBasicMaterial({ color: new THREE.Color("#3b82f6"), wireframe: true }),
      courtLine: new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true }),
      net: new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true }),
      flowerRed: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ef4444"), wireframe: true }),
      flowerYellow: new THREE.MeshBasicMaterial({ color: new THREE.Color("#eab308"), wireframe: true }),
      screenGlow: new THREE.MeshBasicMaterial({ color: new THREE.Color("#38bdf8"), wireframe: true }),
      plastic: new THREE.MeshBasicMaterial({ color: new THREE.Color("#0284c7"), wireframe: true }),
      flagOrange: new THREE.MeshBasicMaterial({ color: new THREE.Color("#f97316"), wireframe: true }),
    };
  }

  return {
    concrete: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.75,
      metalness: 0.05,
    }),
    accent: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.4,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.65,
      transparent: true,
      opacity: 0.85,
      ior: 1.5,
    }),
    glow: new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.75,
      roughness: 0.2,
    }),
    ground: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.25,
      metalness: 0.85,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.6,
      metalness: 0.05,
    }),
    sathyabamaMaroon: new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.6,
      metalness: 0.15,
    }),
    ivoryStucco: new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.8,
      metalness: 0.05,
    }),
    stainlessSteel: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.18,
      metalness: 0.92,
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.85,
      metalness: 0.05,
    }),
    trunk: new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.9,
      metalness: 0.05,
    }),
    courtKey: new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.5,
      metalness: 0.1,
    }),
    courtLine: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    }),
    net: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.8,
      transparent: true,
      opacity: 0.85,
      wireframe: true,
    }),
    flowerRed: new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.6,
      metalness: 0.1,
    }),
    flowerYellow: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.6,
      metalness: 0.1,
    }),
    screenGlow: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.95,
      roughness: 0.2,
    }),
    plastic: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.2,
    }),
    flagOrange: new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.7,
      metalness: 0.05,
    }),
  };
}

// ── 1. Administration Block ────────────────────────────────────────────────
function buildAdminBlock(mode: TwinViewMode): LandmarkSceneResult {
  const root = new THREE.Group();
  const mats = createMaterials(mode);
  const floorGroups: THREE.Group[] = [];

  // Ground Plaza & Pavers
  const plazaGeo = new THREE.BoxGeometry(30, 0.4, 24);
  const plaza = new THREE.Mesh(plazaGeo, mats.ground);
  plaza.position.y = -0.2;
  plaza.receiveShadow = true;
  root.add(plaza);

  // Central Ceremonial Plaza with Flagpole Monument
  const circlePlazaGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.06, 32);
  const circlePlaza = new THREE.Mesh(circlePlazaGeo, mats.concrete);
  circlePlaza.position.set(0, 0.03, 9.5);
  root.add(circlePlaza);

  // Triple Flagpoles (National / University flags)
  [-1.2, 0, 1.2].forEach((fx, i) => {
    const poleHeight = i === 1 ? 5.5 : 4.8;
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, poleHeight, 8);
    const pole = new THREE.Mesh(poleGeo, mats.stainlessSteel);
    pole.position.set(fx, poleHeight / 2 + 0.06, 9.5);
    root.add(pole);

    // Waving Flag Fabric
    const flagGeo = new THREE.BoxGeometry(0.9, 0.5, 0.02);
    const flag = new THREE.Mesh(flagGeo, i === 1 ? mats.flagOrange : mats.accent);
    flag.position.set(fx + 0.45, poleHeight - 0.3, 9.5);
    root.add(flag);
  });

  // Formal Ornamental Topiary Planters Flanking Entrance Steps
  [-4.5, 4.5].forEach((px) => {
    // Stone Urn
    const urnGeo = new THREE.CylinderGeometry(0.5, 0.35, 0.7, 16);
    const urn = new THREE.Mesh(urnGeo, mats.concrete);
    urn.position.set(px, 0.35, 7.8);
    root.add(urn);

    // Pruned Spherical Shrub
    const shrubGeo = new THREE.SphereGeometry(0.55, 12, 12);
    const shrub = new THREE.Mesh(shrubGeo, mats.foliage);
    shrub.position.set(px, 0.95, 7.8);
    root.add(shrub);
  });

  // Campus Directory / Orientation Kiosk
  const kioskGeo = new THREE.BoxGeometry(1.2, 1.6, 0.2);
  const kiosk = new THREE.Mesh(kioskGeo, mats.metal);
  kiosk.position.set(-6, 0.8, 8.5);
  root.add(kiosk);

  const kioskScreen = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.05), mats.screenGlow);
  kioskScreen.position.set(-6, 0.9, 8.6);
  root.add(kioskScreen);

  // Entrance Steps
  const stepsGeo = new THREE.BoxGeometry(11, 0.3, 3.5);
  const steps = new THREE.Mesh(stepsGeo, mats.concrete);
  steps.position.set(0, 0.15, 6.5);
  steps.receiveShadow = true;
  root.add(steps);

  // 4 Floor Levels
  const floorHeights = [2.4, 2.0, 2.0, 1.8];
  let currentY = 0;

  floorHeights.forEach((h, idx) => {
    const floorGroup = new THREE.Group();
    floorGroup.position.y = currentY;

    // Main floor slab
    const slabGeo = new THREE.BoxGeometry(23, 0.25, 14);
    const slab = new THREE.Mesh(slabGeo, mats.concrete);
    slab.position.set(0, 0.125, -0.5);
    slab.castShadow = true;
    slab.receiveShadow = true;
    floorGroup.add(slab);

    if (idx === 0) {
      // Ground floor colonnade + recessed glass lobby
      const lobbyGeo = new THREE.BoxGeometry(19, h - 0.25, 10);
      const lobby = new THREE.Mesh(lobbyGeo, mats.glass);
      lobby.position.set(0, (h - 0.25) / 2 + 0.25, -1);
      floorGroup.add(lobby);

      // Colonnade Pillars with Capital Blocks
      [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].forEach((x) => {
        const pillarGeo = new THREE.BoxGeometry(0.7, h, 0.7);
        const pillar = new THREE.Mesh(pillarGeo, mats.ivoryStucco);
        pillar.position.set(x, h / 2, 4.8);
        pillar.castShadow = true;
        floorGroup.add(pillar);

        // Hanging Warm Brass Pendant Lanterns Under Colonnade
        const lanternGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const lantern = new THREE.Mesh(lanternGeo, mats.glow);
        lantern.position.set(x, h - 0.4, 4.8);
        floorGroup.add(lantern);
      });

      // Sathyabama Maroon Portico Header
      const headerGeo = new THREE.BoxGeometry(19, 0.45, 1.2);
      const header = new THREE.Mesh(headerGeo, mats.sathyabamaMaroon);
      header.position.set(0, h - 0.22, 4.8);
      floorGroup.add(header);
    } else {
      // Upper floor body
      const bodyWidth = 22.5 - idx * 0.8;
      const bodyDepth = 13.5 - idx * 0.5;

      const coreGeo = new THREE.BoxGeometry(bodyWidth, h - 0.25, bodyDepth);
      const core = new THREE.Mesh(coreGeo, mats.ivoryStucco);
      core.position.set(0, (h - 0.25) / 2 + 0.25, -0.5);
      core.castShadow = true;
      floorGroup.add(core);

      // Rhythmic windows with maroon sill bands
      const ribbonGeo = new THREE.BoxGeometry(bodyWidth + 0.1, h * 0.45, 0.2);
      const frontRibbon = new THREE.Mesh(ribbonGeo, mats.glass);
      frontRibbon.position.set(0, (h - 0.25) / 2 + 0.25, bodyDepth / 2 - 0.45);
      floorGroup.add(frontRibbon);

      const sillGeo = new THREE.BoxGeometry(bodyWidth + 0.2, 0.15, 0.35);
      const sill = new THREE.Mesh(sillGeo, mats.sathyabamaMaroon);
      sill.position.set(0, (h - 0.25) / 2 + 0.25 - (h * 0.45) / 2, bodyDepth / 2 - 0.4);
      floorGroup.add(sill);
    }

    // Top floor features
    if (idx === floorHeights.length - 1) {
      // Classical Cornice
      const roofGeo = new THREE.BoxGeometry(18, 0.7, 9);
      const roofBox = new THREE.Mesh(roofGeo, mats.sathyabamaMaroon);
      roofBox.position.set(0, h + 0.35, -0.5);
      roofBox.castShadow = true;
      floorGroup.add(roofBox);

      // Rooftop Telecommunication Satellite Dish & Mast
      const dishGeo = new THREE.CylinderGeometry(1.2, 0.2, 0.4, 16);
      dishGeo.rotateX(Math.PI / 3);
      const dish = new THREE.Mesh(dishGeo, mats.metal);
      dish.position.set(4, h + 1.2, -0.5);
      floorGroup.add(dish);

      const mastGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.5, 8);
      const mast = new THREE.Mesh(mastGeo, mats.metal);
      mast.position.set(-4, h + 1.75, -0.5);
      floorGroup.add(mast);
    }

    floorGroups.push(floorGroup);
    root.add(floorGroup);
    currentY += h;
  });

  return {
    group: root,
    floorGroups,
    update: () => {},
    dispose: () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
  };
}

// ── 2. Sathyabama Central Library (Accurate Real-World 2-Storey Landmark) ──
function buildLibrary(mode: TwinViewMode): LandmarkSceneResult {
  const root = new THREE.Group();
  const mats = createMaterials(mode);
  const floorGroups: THREE.Group[] = [];

  // 1. Base Plaza
  const baseGeo = new THREE.BoxGeometry(32, 0.4, 28);
  const base = new THREE.Mesh(baseGeo, mats.ground);
  base.position.y = -0.2;
  root.add(base);

  // Front Garden Lawns with Flower Clusters
  [-8.5, 8.5].forEach((gx) => {
    const lawnGeo = new THREE.BoxGeometry(10, 0.1, 10);
    const lawn = new THREE.Mesh(lawnGeo, mats.foliage);
    lawn.position.set(gx, 0.05, 8);
    root.add(lawn);

    // Decorative perimeter hedge
    const hedgeGeo = new THREE.BoxGeometry(10.4, 0.35, 10.4);
    const hedge = new THREE.Mesh(hedgeGeo, mats.foliage);
    hedge.position.set(gx, 0.15, 8);
    root.add(hedge);

    // Colorful Flowerbed Clusters (Red & Gold)
    [
      [-2.5, -2.5], [2.5, -2.5], [0, 0], [-2.5, 2.5], [2.5, 2.5]
    ].forEach(([fx, fz], fi) => {
      const flowerGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const flower = new THREE.Mesh(flowerGeo, fi % 2 === 0 ? mats.flowerRed : mats.flowerYellow);
      flower.position.set(gx + fx, 0.38, 8 + fz);
      root.add(flower);
    });
  });

  // Outdoor Wooden Reading Benches for students
  [-7, 7].forEach((bx) => {
    const benchSeatGeo = new THREE.BoxGeometry(2.4, 0.08, 0.7);
    const benchSeat = new THREE.Mesh(benchSeatGeo, mats.wood);
    benchSeat.position.set(bx, 0.45, 2.5);
    root.add(benchSeat);

    const benchBackGeo = new THREE.BoxGeometry(2.4, 0.5, 0.08);
    const benchBack = new THREE.Mesh(benchBackGeo, mats.wood);
    benchBack.position.set(bx, 0.7, 2.15);
    root.add(benchBack);

    [-1.0, 1.0].forEach((lx) => {
      const legGeo = new THREE.BoxGeometry(0.08, 0.45, 0.6);
      const leg = new THREE.Mesh(legGeo, mats.dark);
      leg.position.set(bx + lx, 0.225, 2.5);
      root.add(leg);
    });
  });

  // Student Bicycle Stand with Parked Bikes Outside Library
  const bikeRackGeo = new THREE.BoxGeometry(4.5, 0.6, 0.4);
  const bikeRack = new THREE.Mesh(bikeRackGeo, mats.metal);
  bikeRack.position.set(-11.5, 0.3, 2.5);
  root.add(bikeRack);

  // 3 Bicycles Parked
  [-12.5, -11.5, -10.5].forEach((bx) => {
    // Wheels
    [-0.4, 0.4].forEach((wz) => {
      const wheelGeo = new THREE.TorusGeometry(0.25, 0.03, 8, 16);
      wheelGeo.rotateY(Math.PI / 2);
      const wheel = new THREE.Mesh(wheelGeo, mats.dark);
      wheel.position.set(bx, 0.25, 2.5 + wz);
      root.add(wheel);
    });
    // Frame tube
    const frameGeo = new THREE.BoxGeometry(0.04, 0.35, 0.7);
    const frame = new THREE.Mesh(frameGeo, mats.accent);
    frame.position.set(bx, 0.35, 2.5);
    root.add(frame);
  });

  // 4 Miniature Sathyabama Campus Palm Trees
  [
    [-12, 11], [-5, 11], [5, 11], [12, 11],
  ].forEach(([px, pz]) => {
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 2.6, 8);
    const trunk = new THREE.Mesh(trunkGeo, mats.trunk);
    trunk.position.set(px, 1.3, pz);
    root.add(trunk);

    const crownGeo = new THREE.ConeGeometry(1.4, 1.0, 7);
    const crown = new THREE.Mesh(crownGeo, mats.foliage);
    crown.position.set(px, 2.7, pz);
    root.add(crown);
  });

  // Central Approach Walkway with Bollard Path Lights
  const walkGeo = new THREE.BoxGeometry(5, 0.08, 12);
  const walkway = new THREE.Mesh(walkGeo, mats.concrete);
  walkway.position.set(0, 0.04, 7);
  root.add(walkway);

  [-2.2, 2.2].forEach((lx) => {
    [4, 8].forEach((lz) => {
      const bollardGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
      const bollard = new THREE.Mesh(bollardGeo, mats.dark);
      bollard.position.set(lx, 0.35, lz);
      root.add(bollard);

      const lightHead = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.15, 8), mats.glow);
      lightHead.position.set(lx, 0.7, lz);
      root.add(lightHead);
    });
  });

  // 2-Storey Library Complex (Ground + First Floor)
  const floorHeights = [2.8, 2.6];
  let currentY = 0;

  floorHeights.forEach((h, idx) => {
    const floorGroup = new THREE.Group();
    floorGroup.position.y = currentY;

    if (idx === 0) {
      // ── GROUND FLOOR: Circulation, Digital Commons, Portico Entrance ──
      const slabGeo = new THREE.BoxGeometry(26, 0.28, 16);
      const slab = new THREE.Mesh(slabGeo, mats.concrete);
      slab.position.set(0, 0.14, -1);
      floorGroup.add(slab);

      const bodyGeo = new THREE.BoxGeometry(25.4, h - 0.28, 15.4);
      const body = new THREE.Mesh(bodyGeo, mats.ivoryStucco);
      body.position.set(0, (h - 0.28) / 2 + 0.28, -1);
      body.castShadow = true;
      floorGroup.add(body);

      // Maroon Plinth
      const plinthGeo = new THREE.BoxGeometry(25.6, 0.45, 15.6);
      const plinth = new THREE.Mesh(plinthGeo, mats.sathyabamaMaroon);
      plinth.position.set(0, 0.5, -1);
      floorGroup.add(plinth);

      // Entrance Portico with 4 Pillars
      const porticoRoofGeo = new THREE.BoxGeometry(8, 0.35, 5);
      const porticoRoof = new THREE.Mesh(porticoRoofGeo, mats.sathyabamaMaroon);
      porticoRoof.position.set(0, h, 8.5);
      porticoRoof.castShadow = true;
      floorGroup.add(porticoRoof);

      [-3.2, 3.2].forEach((cx) => {
        [6.8, 10.2].forEach((cz) => {
          const colGeo = new THREE.BoxGeometry(0.55, h, 0.55);
          const col = new THREE.Mesh(colGeo, mats.ivoryStucco);
          col.position.set(cx, h / 2, cz);
          col.castShadow = true;
          floorGroup.add(col);
        });
      });

      // Steps
      const stepsGeo = new THREE.BoxGeometry(6.5, 0.35, 3);
      const steps = new THREE.Mesh(stepsGeo, mats.concrete);
      steps.position.set(0, 0.175, 11);
      floorGroup.add(steps);

      // "CENTRAL LIBRARY" Signage Band
      const signGeo = new THREE.BoxGeometry(6.5, 0.6, 0.2);
      const sign = new THREE.Mesh(signGeo, mats.sathyabamaMaroon);
      sign.position.set(0, h - 0.3, 6.8);
      floorGroup.add(sign);

      // Glass Doors
      const doorGeo = new THREE.BoxGeometry(4.5, h * 0.7, 0.1);
      const doors = new THREE.Mesh(doorGeo, mats.glass);
      doors.position.set(0, (h * 0.7) / 2 + 0.28, 6.75);
      floorGroup.add(doors);

      // Interior Micro-Details: Security RFID Turnstiles
      [-1.2, 1.2].forEach((tx) => {
        const turnstileGeo = new THREE.BoxGeometry(0.3, 0.9, 0.8);
        const turnstile = new THREE.Mesh(turnstileGeo, mats.stainlessSteel);
        turnstile.position.set(tx, 0.75, 5.5);
        floorGroup.add(turnstile);
      });

      // Interior Micro-Details: Digital Commons (Computer Workstations with Glowing Screens)
      [-8, -5].forEach((wx) => {
        // Table
        const deskGeo = new THREE.BoxGeometry(1.6, 0.08, 6);
        const desk = new THREE.Mesh(deskGeo, mats.wood);
        desk.position.set(wx, 0.75, 0);
        floorGroup.add(desk);

        // Glowing Computer Screens
        [-2, 0, 2].forEach((sz) => {
          const monitorGeo = new THREE.BoxGeometry(0.08, 0.4, 0.55);
          const monitor = new THREE.Mesh(monitorGeo, mats.screenGlow);
          monitor.position.set(wx, 1.05, sz);
          floorGroup.add(monitor);
        });
      });
    } else {
      // ── FIRST FLOOR: Reference Stacks, Reading Halls, Roof Monitor ──
      const slabGeo = new THREE.BoxGeometry(26.2, 0.3, 16.2);
      const slab = new THREE.Mesh(slabGeo, mats.sathyabamaMaroon);
      slab.position.set(0, 0.15, -1);
      floorGroup.add(slab);

      const upperBodyGeo = new THREE.BoxGeometry(25.4, h - 0.3, 15.4);
      const upperBody = new THREE.Mesh(upperBodyGeo, mats.ivoryStucco);
      upperBody.position.set(0, (h - 0.3) / 2 + 0.3, -1);
      upperBody.castShadow = true;
      floorGroup.add(upperBody);

      // Windows with Maroon Sunshades
      [-9, -4.5, 0, 4.5, 9].forEach((wx) => {
        const winGeo = new THREE.BoxGeometry(2.6, h * 0.55, 0.15);
        const win = new THREE.Mesh(winGeo, mats.glass);
        win.position.set(wx, (h * 0.55) / 2 + 0.4, 6.75);
        floorGroup.add(win);

        const shadeGeo = new THREE.BoxGeometry(3.0, 0.18, 0.45);
        const shade = new THREE.Mesh(shadeGeo, mats.sathyabamaMaroon);
        shade.position.set(wx, (h * 0.55) + 0.5, 6.95);
        floorGroup.add(shade);
      });

      // Book Stack Aisles with Category Header Endcaps
      [-6, -2, 2, 6].forEach((sz) => {
        const stackGeo = new THREE.BoxGeometry(15, h * 0.65, 0.8);
        const stack = new THREE.Mesh(stackGeo, mats.wood);
        stack.position.set(0, (h * 0.65) / 2 + 0.3, sz);
        floorGroup.add(stack);

        // Aisle Category Endcap Plate
        const endcapGeo = new THREE.BoxGeometry(0.1, 0.4, 0.85);
        const endcap = new THREE.Mesh(endcapGeo, mats.sathyabamaMaroon);
        endcap.position.set(7.55, h * 0.65, sz);
        floorGroup.add(endcap);
      });

      // Study Carrel Desks with Desk Lamps
      [-6, 6].forEach((tx) => {
        const carrelGeo = new THREE.BoxGeometry(1.4, 0.75, 4);
        const carrel = new THREE.Mesh(carrelGeo, mats.wood);
        carrel.position.set(tx, 0.375 + 0.3, -6);
        floorGroup.add(carrel);

        // Warm Desk Lamp
        const lampGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const lamp = new THREE.Mesh(lampGeo, mats.glow);
        lamp.position.set(tx, 0.9, -6);
        floorGroup.add(lamp);
      });

      // Rooftop Classical Parapet & Coping
      const parapetGeo = new THREE.BoxGeometry(26.4, 0.6, 16.4);
      const parapet = new THREE.Mesh(parapetGeo, mats.sathyabamaMaroon);
      parapet.position.set(0, h + 0.3, -1);
      floorGroup.add(parapet);

      // Rooftop HVAC Chiller Units
      [-8, 8].forEach((hx) => {
        const hvacGeo = new THREE.BoxGeometry(2.2, 1.1, 2.2);
        const hvac = new THREE.Mesh(hvacGeo, mats.metal);
        hvac.position.set(hx, h + 0.85, -4);
        floorGroup.add(hvac);
      });

      // Central Raised Roof Monitor / Skylight Clerestory
      const monitorGeo = new THREE.BoxGeometry(12, 1.0, 8);
      const monitor = new THREE.Mesh(monitorGeo, mats.ivoryStucco);
      monitor.position.set(0, h + 0.8, -1);
      floorGroup.add(monitor);

      const monitorRoof = new THREE.Mesh(
        new THREE.BoxGeometry(12.8, 0.2, 8.8),
        mats.sathyabamaMaroon
      );
      monitorRoof.position.set(0, h + 1.35, -1);
      floorGroup.add(monitorRoof);
    }

    floorGroups.push(floorGroup);
    root.add(floorGroup);
    currentY += h;
  });

  return {
    group: root,
    floorGroups,
    update: () => {},
    dispose: () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
  };
}

// ── 3. Basketball Courts (High-Fidelity Varsity Sports Ground) ──────────────
function buildBasketballCourts(mode: TwinViewMode): LandmarkSceneResult {
  const root = new THREE.Group();
  const mats = createMaterials(mode);
  const floorGroups: THREE.Group[] = [];

  const mainGroup = new THREE.Group();

  // Court base apron (Deep Navy Outdoor Asphalt)
  const apronGeo = new THREE.BoxGeometry(28, 0.3, 22);
  const apron = new THREE.Mesh(apronGeo, mats.ground);
  apron.position.y = -0.15;
  mainGroup.add(apron);

  // Court surface (Vibrant Terracotta Polyurethane)
  const courtMat = mode === "blueprint"
    ? mats.accent
    : new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });

  // Two courts side by side
  [-6.5, 6.5].forEach((cx) => {
    const courtGeo = new THREE.BoxGeometry(10.5, 0.05, 17);
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.position.set(cx, 0.025, 0);
    mainGroup.add(court);

    // Perimeter White Court Boundary Lines
    const boundGeo = new THREE.RingGeometry(5.1, 5.25, 4);
    boundGeo.rotateX(-Math.PI / 2);
    boundGeo.rotateZ(Math.PI / 4);
    const bounds = new THREE.Mesh(boundGeo, mats.courtLine);
    bounds.position.set(cx, 0.055, 0);
    bounds.scale.set(1.4, 2.3, 1);
    mainGroup.add(bounds);

    // Center Half-Court Line
    const centerLineGeo = new THREE.BoxGeometry(10.2, 0.01, 0.12);
    const centerLine = new THREE.Mesh(centerLineGeo, mats.courtLine);
    centerLine.position.set(cx, 0.055, 0);
    mainGroup.add(centerLine);

    // Center Jump Circle
    const circleGeo = new THREE.RingGeometry(1.4, 1.55, 32);
    circleGeo.rotateX(-Math.PI / 2);
    const circle = new THREE.Mesh(circleGeo, mats.courtLine);
    circle.position.set(cx, 0.055, 0);
    mainGroup.add(circle);

    // Key / Paint Area at each basket end (Contrasting Royal Blue Paint)
    [-7, 7].forEach((kz) => {
      const keyGeo = new THREE.BoxGeometry(3.6, 0.06, 4.8);
      const keyMesh = new THREE.Mesh(keyGeo, mats.courtKey);
      const keyOffset = kz > 0 ? -2.4 : 2.4;
      keyMesh.position.set(cx, 0.03, kz + keyOffset);
      mainGroup.add(keyMesh);

      // Free-throw circle
      const ftRingGeo = new THREE.RingGeometry(1.4, 1.55, 32);
      ftRingGeo.rotateX(-Math.PI / 2);
      const ftRing = new THREE.Mesh(ftRingGeo, mats.courtLine);
      ftRing.position.set(cx, 0.065, kz + (kz > 0 ? -4.8 : 4.8));
      mainGroup.add(ftRing);
    });

    // Basketball Hoops & Goals
    [-7.5, 7.5].forEach((hz) => {
      // Padded Pole Base Protector (Safety Pad)
      const padGeo = new THREE.BoxGeometry(0.5, 1.0, 0.5);
      const pad = new THREE.Mesh(padGeo, mats.plastic);
      pad.position.set(cx, 0.5, hz);
      mainGroup.add(pad);

      // Heavy Galvanized Steel Post
      const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.4, 12);
      const pole = new THREE.Mesh(poleGeo, mats.metal);
      pole.position.set(cx, 1.7, hz);
      mainGroup.add(pole);

      // Support Boom Arm extending backboard over court
      const boomGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
      boomGeo.rotateX(hz > 0 ? -Math.PI / 4 : Math.PI / 4);
      const boom = new THREE.Mesh(boomGeo, mats.metal);
      const boomDir = hz > 0 ? -0.3 : 0.3;
      boom.position.set(cx, 2.9, hz + boomDir);
      mainGroup.add(boom);

      // Acrylic Transparent Backboard with Border
      const bbGeo = new THREE.BoxGeometry(2.0, 1.2, 0.08);
      const backboard = new THREE.Mesh(bbGeo, mats.glass);
      const bbOffset = hz > 0 ? -0.55 : 0.55;
      backboard.position.set(cx, 3.0, hz + bbOffset);
      mainGroup.add(backboard);

      // Target Square painted on Backboard
      const targetGeo = new THREE.BoxGeometry(0.65, 0.45, 0.09);
      const target = new THREE.Mesh(targetGeo, mats.sathyabamaMaroon);
      target.position.set(cx, 2.95, hz + bbOffset);
      mainGroup.add(target);

      // Regulation Orange Rim
      const rimGeo = new THREE.TorusGeometry(0.28, 0.035, 8, 24);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      const rimOffset = hz > 0 ? -0.35 : 0.35;
      rim.position.set(cx, 2.65, hz + bbOffset + rimOffset);
      mainGroup.add(rim);

      // Nylon Net Mesh Cone
      const netGeo = new THREE.CylinderGeometry(0.26, 0.12, 0.45, 12, 1, true);
      const netMesh = new THREE.Mesh(netGeo, mats.net);
      netMesh.position.set(cx, 2.42, hz + bbOffset + rimOffset);
      mainGroup.add(netMesh);
    });
  });

  // Sideline Micro-Details: Player Team Benches
  [-6.5, 6.5].forEach((cx) => {
    const benchGeo = new THREE.BoxGeometry(4.5, 0.45, 0.7);
    const bench = new THREE.Mesh(benchGeo, mats.plastic);
    bench.position.set(cx, 0.3, -9.5);
    mainGroup.add(bench);
  });

  // Scorekeeper Table with Digital Console
  const tableGeo = new THREE.BoxGeometry(2.4, 0.75, 0.8);
  const table = new THREE.Mesh(tableGeo, mats.wood);
  table.position.set(0, 0.375, -9.5);
  mainGroup.add(table);

  const scoreConsole = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.2), mats.screenGlow);
  scoreConsole.position.set(0, 0.9, -9.5);
  mainGroup.add(scoreConsole);

  // Wheeled Ball Rack with Orange Basketballs
  const rackGeo = new THREE.BoxGeometry(1.6, 0.8, 0.5);
  const rack = new THREE.Mesh(rackGeo, mats.metal);
  rack.position.set(-1.8, 0.4, 9.5);
  mainGroup.add(rack);

  [-0.5, 0, 0.5].forEach((bx) => {
    const bBallGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const bBallMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.6 });
    const bBall = new THREE.Mesh(bBallGeo, bBallMat);
    bBall.position.set(-1.8 + bx, 0.9, 9.5);
    mainGroup.add(bBall);
  });

  // Sideline Hydration Cooler Station
  const coolerGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.7, 12);
  const cooler = new THREE.Mesh(coolerGeo, mats.accent);
  cooler.position.set(1.8, 0.65, 9.5);
  mainGroup.add(cooler);

  // 4 Corner Stadium Floodlight Towers
  [
    [-13, -10], [13, -10], [-13, 10], [13, 10],
  ].forEach(([tx, tz]) => {
    const towerGeo = new THREE.CylinderGeometry(0.12, 0.2, 7.0, 8);
    const tower = new THREE.Mesh(towerGeo, mats.metal);
    tower.position.set(tx, 3.5, tz);
    mainGroup.add(tower);

    // 6-Bank LED Floodlight Fixture
    const lampGeo = new THREE.BoxGeometry(1.8, 0.5, 0.6);
    const lamp = new THREE.Mesh(lampGeo, mats.glow);
    lamp.position.set(tx, 6.9, tz);
    lamp.rotation.y = Math.atan2(-tz, -tx);
    mainGroup.add(lamp);
  });

  floorGroups.push(mainGroup);
  root.add(mainGroup);

  return {
    group: root,
    floorGroups,
    update: () => {},
    dispose: () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
  };
}

// ── 4. Sathyabama Central Canteen / Mess Complex (Accurate Dining Infrastructure) ──
function buildCanteen(mode: TwinViewMode): LandmarkSceneResult {
  const root = new THREE.Group();
  const mats = createMaterials(mode);
  const floorGroups: THREE.Group[] = [];

  // Ground Plinth
  const deckGeo = new THREE.BoxGeometry(32, 0.4, 24);
  const deck = new THREE.Mesh(deckGeo, mats.ground);
  deck.position.y = -0.2;
  root.add(deck);

  // Approach Ramp
  const rampGeo = new THREE.BoxGeometry(10, 0.2, 4);
  const ramp = new THREE.Mesh(rampGeo, mats.concrete);
  ramp.position.set(0, 0.1, 10.5);
  root.add(ramp);

  // Signature Sathyabama Mess Feature: Perimeter Stainless Handwash Troughs with Mirrors & Soap Dispensers
  [-9, 9].forEach((wx) => {
    // Trough Basin
    const troughGeo = new THREE.BoxGeometry(7.2, 0.35, 0.65);
    const trough = new THREE.Mesh(troughGeo, mats.stainlessSteel);
    trough.position.set(wx, 0.4, 9.2);
    root.add(trough);

    // Support legs
    [-2.8, 0, 2.8].forEach((lx) => {
      const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
      const leg = new THREE.Mesh(legGeo, mats.metal);
      leg.position.set(wx + lx, 0.2, 9.2);
      root.add(leg);
    });

    // 4 Chrome Taps
    [-2.2, -0.7, 0.7, 2.2].forEach((tx) => {
      const tapGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
      const tap = new THREE.Mesh(tapGeo, mats.metal);
      tap.position.set(wx + tx, 0.65, 9.2);
      root.add(tap);
    });

    // Wall Mirror Above Trough
    const mirrorGeo = new THREE.BoxGeometry(6.5, 0.9, 0.05);
    const mirror = new THREE.Mesh(mirrorGeo, mats.glass);
    mirror.position.set(wx, 1.4, 8.4);
    root.add(mirror);
  });

  // Commercial RO Water Cooling Tank Dispenser
  const roTankGeo = new THREE.BoxGeometry(1.6, 1.8, 1.2);
  const roTank = new THREE.Mesh(roTankGeo, mats.stainlessSteel);
  roTank.position.set(13.5, 0.9, 8.0);
  root.add(roTank);

  // Waste Segregation Bins & Tray Return Trolley
  [-13.5].forEach((bx) => {
    // Green (Wet Food) & Blue (Dry Waste) Bins
    const greenBin = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.8, 12), mats.foliage);
    greenBin.position.set(bx, 0.4, 8.5);
    root.add(greenBin);

    const blueBin = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.8, 12), mats.plastic);
    blueBin.position.set(bx, 0.4, 7.2);
    root.add(blueBin);

    // Tray Return Rack
    const trayRackGeo = new THREE.BoxGeometry(1.2, 1.6, 0.8);
    const trayRack = new THREE.Mesh(trayRackGeo, mats.stainlessSteel);
    trayRack.position.set(bx, 0.8, 5.5);
    root.add(trayRack);
  });

  // Daily Menu Specials Chalkboard Stand at Entrance
  const boardStandGeo = new THREE.BoxGeometry(0.8, 1.2, 0.1);
  const boardStand = new THREE.Mesh(boardStandGeo, mats.dark);
  boardStand.position.set(-3.5, 0.6, 10.0);
  boardStand.rotation.y = 0.2;
  root.add(boardStand);

  const floorHeights = [3.2, 2.4];
  let currentY = 0;

  floorHeights.forEach((h, idx) => {
    const floorGroup = new THREE.Group();
    floorGroup.position.y = currentY;

    if (idx === 0) {
      // ── GROUND FLOOR: Central Mega Dining Hall (Appa Mess) ──
      const slabGeo = new THREE.BoxGeometry(28, 0.25, 18);
      const slab = new THREE.Mesh(slabGeo, mats.concrete);
      slab.position.set(0, 0.125, -1);
      floorGroup.add(slab);

      const wallGeo = new THREE.BoxGeometry(27.4, h - 0.25, 17.4);
      const walls = new THREE.Mesh(wallGeo, mats.ivoryStucco);
      walls.position.set(0, (h - 0.25) / 2 + 0.25, -1);
      walls.castShadow = true;
      floorGroup.add(walls);

      // Maroon Plinth
      const plinthGeo = new THREE.BoxGeometry(27.6, 0.45, 17.6);
      const plinth = new THREE.Mesh(plinthGeo, mats.sathyabamaMaroon);
      plinth.position.set(0, 0.5, -1);
      floorGroup.add(plinth);

      // Triple Entrance Portals
      [-7, 0, 7].forEach((dx) => {
        const portalGeo = new THREE.BoxGeometry(3.5, h * 0.7, 0.2);
        const portal = new THREE.Mesh(portalGeo, mats.sathyabamaMaroon);
        portal.position.set(dx, (h * 0.7) / 2 + 0.25, 7.75);
        floorGroup.add(portal);

        const openDoor = new THREE.Mesh(new THREE.BoxGeometry(2.8, h * 0.65, 0.1), mats.glass);
        openDoor.position.set(dx, (h * 0.65) / 2 + 0.25, 7.75);
        floorGroup.add(openDoor);
      });

      // 4 Long Parallel Rows of Stainless-Steel Mess Dining Tables
      [-7, -2.5, 2.5, 7].forEach((tx) => {
        const tableGeo = new THREE.BoxGeometry(2.4, 0.08, 12);
        const table = new THREE.Mesh(tableGeo, mats.stainlessSteel);
        table.position.set(tx, 0.8, -1);
        table.castShadow = true;
        floorGroup.add(table);

        // Legs
        [-5, 0, 5].forEach((lz) => {
          const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.75, 8);
          const leg = new THREE.Mesh(legGeo, mats.metal);
          leg.position.set(tx, 0.4, -1 + lz);
          floorGroup.add(leg);
        });

        // Attached circular stool seats with stainless thali plates on table!
        [-5, -3, -1, 1, 3, 5].forEach((sz) => {
          [-1.5, 1.5].forEach((sx) => {
            const stoolGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16);
            const stool = new THREE.Mesh(stoolGeo, mats.stainlessSteel);
            stool.position.set(tx + sx, 0.5, -1 + sz);
            floorGroup.add(stool);

            const stoolLeg = new THREE.CylinderGeometry(0.04, 0.04, 0.48, 8);
            const sLeg = new THREE.Mesh(stoolLeg, mats.metal);
            sLeg.position.set(tx + sx, 0.24, -1 + sz);
            floorGroup.add(sLeg);

            // Stainless Steel Lunch Thali Plate on table
            const thaliGeo = new THREE.CylinderGeometry(0.28, 0.26, 0.03, 16);
            const thali = new THREE.Mesh(thaliGeo, mats.stainlessSteel);
            thali.position.set(tx + (sx > 0 ? 0.7 : -0.7), 0.85, -1 + sz);
            floorGroup.add(thali);
          });
        });

        // Water Jug in center of table
        const jugGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.35, 12);
        const jug = new THREE.Mesh(jugGeo, mats.stainlessSteel);
        jug.position.set(tx, 1.0, -1);
        floorGroup.add(jug);
      });

      // Ceiling Fans in Dining Hall
      [-5, 5].forEach((fx) => {
        [-4, 2].forEach((fz) => {
          const fanCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8), mats.dark);
          fanCenter.position.set(fx, h - 0.4, fz);
          floorGroup.add(fanCenter);

          const fanBlades = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.02, 0.2), mats.dark);
          fanBlades.position.set(fx, h - 0.4, fz);
          floorGroup.add(fanBlades);
        });
      });

      // Rear Food Service & Buffet Distribution Counter Lines
      const counterGeo = new THREE.BoxGeometry(24, 0.9, 1.4);
      const counter = new THREE.Mesh(counterGeo, mats.stainlessSteel);
      counter.position.set(0, 0.45, -8.2);
      floorGroup.add(counter);
    } else {
      // ── FIRST FLOOR: Student Canteen, Refreshment Deck, Industrial Roof ──
      const slabGeo = new THREE.BoxGeometry(28.2, 0.25, 18.2);
      const slab = new THREE.Mesh(slabGeo, mats.sathyabamaMaroon);
      slab.position.set(0, 0.125, -1);
      floorGroup.add(slab);

      const upperWalls = new THREE.Mesh(
        new THREE.BoxGeometry(27.4, h - 0.25, 17.4),
        mats.ivoryStucco
      );
      upperWalls.position.set(0, (h - 0.25) / 2 + 0.25, -1);
      upperWalls.castShadow = true;
      floorGroup.add(upperWalls);

      // Large Ventilated Windows
      [-8, -2.5, 2.5, 8].forEach((wx) => {
        const winGeo = new THREE.BoxGeometry(3.6, h * 0.55, 0.2);
        const win = new THREE.Mesh(winGeo, mats.glass);
        win.position.set(wx, (h * 0.55) / 2 + 0.4, 7.75);
        floorGroup.add(win);
      });

      // Snack Kiosks with Pastry Display & Espresso Machine
      [-6, 6].forEach((kx) => {
        const kioskGeo = new THREE.BoxGeometry(5, 1.0, 3);
        const kiosk = new THREE.Mesh(kioskGeo, mats.accent);
        kiosk.position.set(kx, 0.5, -4);
        floorGroup.add(kiosk);

        // Glass Bakery / Snack Display
        const displayGeo = new THREE.BoxGeometry(3.5, 0.5, 1.2);
        const display = new THREE.Mesh(displayGeo, mats.glass);
        display.position.set(kx, 1.25, -3.5);
        floorGroup.add(display);
      });

      // Cafe Dining Tables
      [-6, -2, 2, 6].forEach((cx) => {
        const cTableGeo = new THREE.BoxGeometry(1.4, 0.08, 1.4);
        const cTable = new THREE.Mesh(cTableGeo, mats.wood);
        cTable.position.set(cx, 0.75, 2);
        floorGroup.add(cTable);
      });

      // Industrial Pitched Roof with Ventilation Monitor
      const roofPeakGeo = new THREE.ConeGeometry(18, 2.2, 4);
      roofPeakGeo.rotateY(Math.PI / 4);
      const roof = new THREE.Mesh(roofPeakGeo, mats.sathyabamaMaroon);
      roof.position.set(0, h + 1.1, -1);
      roof.scale.set(1.4, 0.7, 0.9);
      roof.castShadow = true;
      floorGroup.add(roof);

      // Central Ridge Louvered Air Vents
      const ventGeo = new THREE.BoxGeometry(16, 0.6, 6);
      const vent = new THREE.Mesh(ventGeo, mats.metal);
      vent.position.set(0, h + 1.8, -1);
      floorGroup.add(vent);
    }

    floorGroups.push(floorGroup);
    root.add(floorGroup);
    currentY += h;
  });

  return {
    group: root,
    floorGroups,
    update: () => {},
    dispose: () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
  };
}

export function createProceduralLandmark(
  id: string,
  mode: TwinViewMode = "pbr"
): LandmarkSceneResult {
  switch (id) {
    case "admin":
      return buildAdminBlock(mode);
    case "library":
      return buildLibrary(mode);
    case "basketball":
      return buildBasketballCourts(mode);
    case "canteen":
      return buildCanteen(mode);
    default:
      return buildAdminBlock(mode);
  }
}
