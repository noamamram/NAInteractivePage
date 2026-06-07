import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

/** Drop Blender exports here — see public/models/ */
export const HOLOGRAM_MODEL_URLS = {
    shirt: "/models/shirt.glb",
    vr: "/models/vr.glb",
    rifle: "/models/rifle.glb",
};

const BRAND = {
    cyan: 0x1e88e5,
    sky: 0x4fc3f7,
    warm: 0xff6b35,
    dark: 0x0d1118,
    fabric: 0x1a2332,
    metal: 0x3d4654,
};

function stdMat(opts = {}) {
    return new THREE.MeshStandardMaterial({
        metalness: 0.35,
        roughness: 0.45,
        ...opts,
    });
}

function glowSprite(color, size = 0.12) {
    const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    return new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), mat);
}

function addPedestal(scene) {
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.35, 0.018, 12, 64),
        new THREE.MeshBasicMaterial({
            color: BRAND.cyan,
            transparent: true,
            opacity: 0.28,
        })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.35;
    scene.add(ring);

    const disc = new THREE.Mesh(
        new THREE.CircleGeometry(1.35, 48),
        new THREE.MeshBasicMaterial({
            color: BRAND.cyan,
            transparent: true,
            opacity: 0.035,
            side: THREE.DoubleSide,
        })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -1.36;
    scene.add(disc);
}

export function setupHologramRenderer(mount, isMobile) {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0.1, 5.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2.25));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0x8ec8ff, 0x0a0e14, 0.45));
    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x4fc3f7, 0.55);
    fill.position.set(-4, 2, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x1e88e5, 0.85);
    rim.position.set(0, 2, -5);
    scene.add(rim);
    const accent = new THREE.PointLight(0x4fc3f7, 0.6, 14);
    accent.position.set(0, 1.5, 2);
    scene.add(accent);

    addPedestal(scene);

    const group = new THREE.Group();
    scene.add(group);

    return { scene, camera, renderer, group, w, h };
}

function addMesh(parent, geometry, material, position, rotation) {
    const mesh = new THREE.Mesh(geometry, material);
    if (position) mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    parent.add(mesh);
    return mesh;
}

function fabricMat(color, opts = {}) {
    return stdMat({
        color,
        roughness: 0.78,
        metalness: 0.1,
        flatShading: true,
        transparent: true,
        opacity: 0.72,
        emissive: BRAND.cyan,
        emissiveIntensity: 0.14,
        ...opts,
    });
}

function addHoloWire(parent, geometry, scale = 1.04) {
    const wire = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
            color: BRAND.cyan,
            wireframe: true,
            transparent: true,
            opacity: 0.26,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    );
    wire.scale.setScalar(scale);
    wire.userData._holoWire = true;
    parent.add(wire);
    return wire;
}

function createHoloFieldMaterial() {
    return new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(BRAND.cyan) },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            varying vec2 vUv;
            void main() {
                float scan = smoothstep(0.42, 0.5, fract(vUv.y * 14.0 - time * 1.4));
                float grid = step(0.9, fract(vUv.x * 18.0)) + step(0.9, fract(vUv.y * 18.0));
                float alpha = scan * 0.14 + grid * 0.03;
                gl_FragColor = vec4(color, alpha);
            }
        `,
    });
}

function attachSharedHologramFX(root, holoWires = []) {
    const scanBand = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 0.1),
        new THREE.MeshBasicMaterial({
            color: BRAND.cyan,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
        })
    );
    scanBand.rotation.x = Math.PI / 2;
    scanBand.userData._holoKey = "scanBand";
    root.add(scanBand);

    const holoAura = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 14, 10),
        new THREE.MeshBasicMaterial({
            color: BRAND.cyan,
            transparent: true,
            opacity: 0.03,
            wireframe: true,
            depthWrite: false,
        })
    );
    holoAura.userData._holoKey = "aura";
    root.add(holoAura);

    const holoFieldMat = createHoloFieldMaterial();
    const holoField = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.1, 2.4, 22, 1, true),
        holoFieldMat
    );
    holoField.userData._holoKey = "holoField";
    root.add(holoField);

    const ghost = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.0, 1),
        new THREE.MeshBasicMaterial({
            color: BRAND.sky,
            wireframe: true,
            transparent: true,
            opacity: 0.05,
            depthWrite: false,
        })
    );
    ghost.userData._holoKey = "ghost";
    root.add(ghost);

    return { scanBand, holoAura, holoField, holoFieldMat, ghost, holoWires };
}

const PLECTRUM_WHITE = 0xe8edf2;
const PLECTRUM_NAVY = 0x0d2847;

const SHIRT_HAPTIC_COUNT = 22;
const SHIRT_HAPTIC_SIDES = ["front", "back", "left", "right"];

function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0xffffffff;
    };
}

function createHapticDot(rand) {
    const cyan = BRAND.sky;
    const actuator = new THREE.Group();
    const coreSize = 0.014 + rand() * 0.012;

    const core = new THREE.Mesh(
        new THREE.SphereGeometry(coreSize, 8, 8),
        new THREE.MeshBasicMaterial({
            color: cyan,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    );
    actuator.add(core);

    const halo = glowSprite(cyan, coreSize * 2.4);
    halo.material.opacity = 0;
    actuator.add(halo);

    actuator.userData = {
        isHapticDot: true,
        core,
        halo,
        phase: rand() * Math.PI * 2,
        speed: 0.45 + rand() * 0.9,
        strength: 0.25 + rand() * 0.35,
        gap: rand() * 1.8,
    };
    return actuator;
}

function worldToLocalPoint(parent, worldPoint) {
    return parent.worldToLocal(worldPoint.clone());
}

function raycastShirtPoint(meshes, center, size, spot) {
    const { u, v, side } = spot;
    const px = center.x + u * size.x * 0.82;
    const py = center.y + v * size.y * 0.82;
    const pad = Math.max(size.x, size.y, size.z) * 0.8 + 0.5;

    const casts = [];
    if (side === "front" || side === "back") {
        casts.push(
            { o: new THREE.Vector3(px, py, center.z + pad), d: new THREE.Vector3(0, 0, -1) },
            { o: new THREE.Vector3(px, py, center.z - pad), d: new THREE.Vector3(0, 0, 1) }
        );
    }
    if (side === "left") {
        casts.push({ o: new THREE.Vector3(center.x - pad, py, center.z), d: new THREE.Vector3(1, 0, 0) });
    }
    if (side === "right") {
        casts.push({ o: new THREE.Vector3(center.x + pad, py, center.z), d: new THREE.Vector3(-1, 0, 0) });
    }

    const raycaster = new THREE.Raycaster();
    for (const { o, d } of casts) {
        raycaster.set(o, d.normalize());
        const hits = raycaster.intersectObjects(meshes, false);
        if (hits.length > 0) return hits[0];
    }
    return null;
}

function attachShirtHapticDots(model) {
    const meshes = [];
    model.traverse((child) => {
        if (child.isMesh) meshes.push(child);
    });
    if (!meshes.length) return [];

    model.updateMatrixWorld(true);
    const box = computeMeshBounds(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const rand = seededRandom(43791);
    const dots = [];
    const placed = [];
    const minDist = Math.max(size.x, size.y) * 0.1;
    const maxAttempts = SHIRT_HAPTIC_COUNT * 6;
    let attempts = 0;

    while (dots.length < SHIRT_HAPTIC_COUNT && attempts < maxAttempts) {
        attempts += 1;
        const spot = {
            u: rand() * 1.76 - 0.88,
            v: rand() * 1.76 - 0.88,
            side: SHIRT_HAPTIC_SIDES[Math.floor(rand() * SHIRT_HAPTIC_SIDES.length)],
        };
        const hit = raycastShirtPoint(meshes, center, size, spot);
        if (!hit?.point) continue;

        const normal = hit.normal
            ? hit.normal.clone()
            : hit.face?.normal
              ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
              : null;
        if (!normal) continue;

        const worldPos = hit.point.clone().addScaledVector(normal, 0.01);
        if (placed.some((p) => p.distanceTo(worldPos) < minDist)) continue;

        placed.push(worldPos);
        const dot = createHapticDot(rand);
        dot.position.copy(worldToLocalPoint(model, worldPos));
        model.add(dot);
        dots.push(dot);
    }

    return dots;
}

function scheduleShirtHapticDots(state) {
    if (!state.pendingHapticMesh) return;

    const model = state.pendingHapticMesh;
    state.pendingHapticMesh = null;

    requestAnimationFrame(() => {
        try {
            state.hapticDots.push(...attachShirtHapticDots(model));
        } catch {
            // Optional overlay — never block the shirt.
        }
    });
}

function animateHapticDots(dots, t) {
    dots?.forEach((actuator) => {
        const { core, halo, phase, speed, strength, gap } = actuator.userData;
        const wave = Math.sin(t * speed + phase + gap);
        const breathe = (Math.sin(t * 0.35 + phase * 1.7) + 1) * 0.5;
        const soft = Math.pow(Math.max(0, wave), 3.2);
        const intensity = Math.min(0.48, soft * strength * (0.55 + breathe * 0.45));

        if (core?.material) {
            if ("opacity" in core.material) {
                core.material.opacity = intensity * 0.5;
            } else if (core.material.emissiveIntensity != null) {
                core.material.emissiveIntensity = 0.08 + intensity * 0.65;
            }
            core.scale.setScalar(0.45 + intensity * 0.3);
        }
        if (halo?.material) {
            halo.material.opacity = intensity * 0.14;
            halo.scale.setScalar(0.4 + intensity * 0.35);
        }
        actuator.visible = intensity > 0.02;
    });
}

function buildLowPolySleeve(side, whiteMat, navyMat, holoWires) {
    const g = new THREE.Group();
    const sign = side;

    const upper = addMesh(
        g,
        new THREE.CapsuleGeometry(0.11, 0.72, 4, 10),
        whiteMat,
        [sign * 0.78, 0.42, 0.04],
        [0, 0, sign * Math.PI / 2]
    );
    addMesh(
        g,
        new THREE.CapsuleGeometry(0.08, 0.68, 4, 8),
        navyMat,
        [sign * 0.78, 0.38, -0.06],
        [0, 0, sign * Math.PI / 2]
    );
    holoWires.push(addHoloWire(g, upper.geometry, 1.08));
    return g;
}

function addPlectrumLogo(parent, navyMat, holoWires) {
    const logo = new THREE.Group();
    logo.position.set(0, 0.16, 0.2);

    const triShape = new THREE.Shape();
    triShape.moveTo(0, 0.2);
    triShape.lineTo(-0.13, -0.06);
    triShape.lineTo(0.13, -0.06);
    triShape.closePath();
    const tri = new THREE.Mesh(
        new THREE.ExtrudeGeometry(triShape, { depth: 0.03, bevelEnabled: false }),
        navyMat
    );
    tri.position.z = 0.01;
    logo.add(tri);
    holoWires.push(addHoloWire(logo, tri.geometry, 1.12));

    const swirl = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.028, 6, 20, Math.PI * 1.75),
        navyMat
    );
    swirl.position.set(0, -0.22, 0.02);
    swirl.rotation.z = 0.35;
    logo.add(swirl);

    parent.add(logo);
    return logo;
}

export function buildShirtModel() {
    const root = new THREE.Group();
    const shirtMesh = new THREE.Group();
    root.add(shirtMesh);
    const holoWires = [];

    const white = fabricMat(PLECTRUM_WHITE, { opacity: 0.78 });
    const navy = fabricMat(PLECTRUM_NAVY, { emissiveIntensity: 0.08, opacity: 0.82 });

    const torsoFront = addMesh(
        shirtMesh,
        new THREE.BoxGeometry(0.74, 1.28, 0.14),
        white,
        [0, 0.04, 0.11]
    );
    const torsoBack = addMesh(
        shirtMesh,
        new THREE.BoxGeometry(0.74, 1.28, 0.14),
        white,
        [0, 0.04, -0.11]
    );
    holoWires.push(addHoloWire(shirtMesh, torsoFront.geometry, 1.05));

    [-1, 1].forEach((side) => {
        const panel = addMesh(
            shirtMesh,
            new THREE.BoxGeometry(0.12, 1.12, 0.3),
            navy,
            [side * 0.43, 0.02, 0]
        );
        holoWires.push(addHoloWire(shirtMesh, panel.geometry, 1.06));
        addMesh(
            shirtMesh,
            new THREE.BoxGeometry(0.18, 0.14, 0.22),
            white,
            [side * 0.36, 0.62, side * 0.04],
            [0, side * 0.35, 0]
        );
    });

    shirtMesh.add(buildLowPolySleeve(-1, white, navy, holoWires));
    shirtMesh.add(buildLowPolySleeve(1, white, navy, holoWires));

    addMesh(
        shirtMesh,
        new THREE.TorusGeometry(0.18, 0.038, 6, 18),
        navy,
        [0, 0.7, 0.03],
        [Math.PI / 2, 0, 0]
    );

    const belt = addMesh(
        shirtMesh,
        new THREE.BoxGeometry(0.8, 0.08, 0.36),
        navy,
        [0, -0.26, 0]
    );
    addMesh(
        shirtMesh,
        new THREE.BoxGeometry(0.11, 0.1, 0.07),
        stdMat({ color: 0xb0bcc8, metalness: 0.9, roughness: 0.2, flatShading: true }),
        [0, -0.26, 0.19]
    );
    holoWires.push(addHoloWire(shirtMesh, belt.geometry, 1.1));

    addPlectrumLogo(shirtMesh, navy, holoWires);

    const pedestal = addMesh(
        root,
        new THREE.CylinderGeometry(0.5, 0.58, 0.14, 6),
        fabricMat(PLECTRUM_NAVY, { opacity: 0.9, emissiveIntensity: 0.05 }),
        [0, -0.84, 0]
    );
    holoWires.push(addHoloWire(root, pedestal.geometry, 1.04));

    const fx = attachSharedHologramFX(root, holoWires);
    shirtMesh.position.y = 0.08;

    return {
        root,
        shirtMesh,
        hapticDots: [],
        pendingHapticMesh: shirtMesh,
        ...fx,
    };
}

export function buildVRModel() {
    const root = new THREE.Group();
    const vrLenses = [];
    const vrGlow = [];
    const holoWires = [];

    const shellMat = fabricMat(0xd8e2ec, { opacity: 0.75, emissiveIntensity: 0.1 });
    const faceMat = fabricMat(0x1a222c, { opacity: 0.85, emissiveIntensity: 0.06 });
    const strapMat = fabricMat(0x2e3844, { opacity: 0.8, emissiveIntensity: 0.04 });
    const lensMat = stdMat({
        color: BRAND.sky,
        emissive: BRAND.cyan,
        emissiveIntensity: 1.2,
        metalness: 0.15,
        roughness: 0.1,
        flatShading: true,
        transparent: true,
        opacity: 0.9,
    });

    const shell = addMesh(
        root,
        new THREE.BoxGeometry(1.45, 0.72, 0.88, 2, 2, 2),
        shellMat,
        [0, 0, 0]
    );
    holoWires.push(addHoloWire(root, shell.geometry, 1.04));

    const facePlate = addMesh(
        root,
        new THREE.BoxGeometry(1.18, 0.48, 0.12),
        faceMat,
        [0, 0.02, 0.42]
    );
    holoWires.push(addHoloWire(root, facePlate.geometry, 1.06));

    [-0.34, 0.34].forEach((x) => {
        const barrel = addMesh(
            root,
            new THREE.CylinderGeometry(0.16, 0.18, 0.14, 20),
            faceMat,
            [x, 0.02, 0.48],
            [Math.PI / 2, 0, 0]
        );
        holoWires.push(addHoloWire(root, barrel.geometry, 1.05));

        const lens = addMesh(
            root,
            new THREE.CylinderGeometry(0.12, 0.1, 0.06, 24),
            lensMat,
            [x, 0.02, 0.56],
            [Math.PI / 2, 0, 0]
        );
        vrLenses.push(lens);

        const glow = glowSprite(BRAND.sky, 0.28);
        glow.position.set(x, 0.02, 0.6);
        glow.material.opacity = 0.3;
        root.add(glow);
        vrGlow.push(glow);
    });

    addMesh(
        root,
        new THREE.TorusGeometry(0.82, 0.055, 8, 36, Math.PI * 0.92),
        strapMat,
        [0, 0.48, -0.12],
        [Math.PI / 2, 0, 0]
    );

    [-1, 1].forEach((side) => {
        addMesh(
            root,
            new THREE.BoxGeometry(0.22, 0.38, 0.14),
            strapMat,
            [side * 0.78, 0.05, -0.08]
        );
        addMesh(
            root,
            new THREE.BoxGeometry(0.14, 0.22, 0.1),
            shellMat,
            [side * 0.86, 0.02, 0.1]
        );
    });

    addMesh(
        root,
        new THREE.BoxGeometry(0.38, 0.1, 0.08),
        strapMat,
        [0, -0.28, 0.38]
    );

    const fx = attachSharedHologramFX(root, holoWires);

    return { root, vrLenses, vrGlow, ...fx };
}

export function buildRifleModel() {
    const root = new THREE.Group();
    root.rotation.y = Math.PI / 2;

    const metal = stdMat({ color: BRAND.metal, metalness: 0.92, roughness: 0.22 });
    const metalDark = stdMat({ color: 0x252c36, metalness: 0.88, roughness: 0.3 });
    const polymer = stdMat({ color: 0x1a2028, roughness: 0.82, metalness: 0.08 });
    const accent = stdMat({
        color: BRAND.cyan,
        emissive: 0x0a2847,
        emissiveIntensity: 0.25,
        metalness: 0.6,
        roughness: 0.35,
    });

    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.12), metal);
    receiver.position.set(0, 0.06, 0);
    root.add(receiver);

    const upperRail = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.035, 0.07), metalDark);
    upperRail.position.set(0.02, 0.17, 0);
    root.add(upperRail);

    for (let i = -3; i <= 3; i++) {
        const notch = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, 0.075), metal);
        notch.position.set(i * 0.055, 0.19, 0);
        root.add(notch);
    }

    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.032, 1.45, 24),
        metal
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(0.62, 0.1, 0);
    root.add(barrel);

    const muzzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.03, 0.14, 16),
        metalDark
    );
    muzzle.rotation.z = Math.PI / 2;
    muzzle.position.set(1.38, 0.1, 0);
    root.add(muzzle);

    const handguard = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.11, 0.14),
        polymer
    );
    handguard.position.set(0.48, 0.04, 0);
    root.add(handguard);

    for (let i = 0; i < 6; i++) {
        const vent = new THREE.Mesh(
            new THREE.BoxGeometry(0.055, 0.06, 0.15),
            metalDark
        );
        vent.position.set(0.28 + i * 0.08, 0.04, 0);
        root.add(vent);
    }

    const grip = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.055, 0.22, 6, 16),
        polymer
    );
    grip.position.set(-0.08, -0.16, 0);
    grip.rotation.z = 0.35;
    root.add(grip);

    const triggerGuard = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.012, 8, 20, Math.PI),
        metalDark
    );
    triggerGuard.rotation.z = Math.PI;
    triggerGuard.position.set(-0.02, -0.04, 0);
    root.add(triggerGuard);

    const trigger = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 0.07, 0.025),
        accent
    );
    trigger.position.set(-0.02, -0.07, 0.02);
    trigger.rotation.x = 0.25;
    root.add(trigger);

    const mag = new THREE.Mesh(
        new THREE.BoxGeometry(0.085, 0.26, 0.075),
        metal
    );
    mag.position.set(0.04, -0.2, 0);
    mag.rotation.z = 0.06;
    root.add(mag);

    const magCurve = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        metal
    );
    magCurve.position.set(0.04, -0.34, 0);
    magCurve.rotation.x = Math.PI;
    root.add(magCurve);

    const stockTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.38, 16),
        metalDark
    );
    stockTube.rotation.z = Math.PI / 2;
    stockTube.position.set(-0.38, 0.1, 0);
    root.add(stockTube);

    const stock = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.14, 0.1),
        polymer
    );
    stock.position.set(-0.58, 0.08, 0);
    stock.rotation.z = -0.08;
    root.add(stock);

    const buttpad = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.16, 0.11),
        polymer
    );
    buttpad.position.set(-0.74, 0.07, 0);
    root.add(buttpad);

    const scopeMount = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.06), metalDark);
    scopeMount.position.set(0.08, 0.2, 0);
    root.add(scopeMount);

    const scopeBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.06, 0.32, 20),
        metal
    );
    scopeBody.rotation.z = Math.PI / 2;
    scopeBody.position.set(0.12, 0.28, 0);
    root.add(scopeBody);

    const scopeBell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.055, 0.1, 20),
        metal
    );
    scopeBell.rotation.z = Math.PI / 2;
    scopeBell.position.set(0.3, 0.28, 0);
    root.add(scopeBell);

    const scopeLens = new THREE.Mesh(
        new THREE.CircleGeometry(0.045, 24),
        stdMat({
            color: BRAND.sky,
            emissive: BRAND.cyan,
            emissiveIntensity: 0.7,
            side: THREE.DoubleSide,
        })
    );
    scopeLens.rotation.y = Math.PI / 2;
    scopeLens.position.set(0.36, 0.28, 0);
    root.add(scopeLens);

    const frontSight = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.08, 0.02),
        metalDark
    );
    frontSight.position.set(1.05, 0.18, 0);
    root.add(frontSight);

    const rearSight = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.05, 0.02),
        metalDark
    );
    rearSight.position.set(-0.05, 0.2, 0);
    root.add(rearSight);

    const holoWires = [];
    holoWires.push(addHoloWire(root, receiver.geometry, 1.03));
    holoWires.push(addHoloWire(root, barrel.geometry, 1.02));
    const fx = attachSharedHologramFX(root, holoWires);

    return { root, ...fx };
}

const MODEL_TARGET_SIZE = {
    shirt: 2.0,
    vr: 1.7,
    rifle: 2.35,
};

const MODEL_ROTATION = {
    rifle: { x: 0, y: Math.PI / 2, z: 0 },
};

function computeMeshBounds(object) {
    const box = new THREE.Box3();
    let hasMesh = false;
    object.traverse((child) => {
        if (!child.isMesh) return;
        child.updateWorldMatrix(true, false);
        const meshBox = new THREE.Box3().setFromObject(child);
        if (!hasMesh) {
            box.copy(meshBox);
            hasMesh = true;
        } else {
            box.union(meshBox);
        }
    });
    return hasMesh ? box : new THREE.Box3().setFromObject(object);
}

function getScaleAxis(size) {
    const dims = [size.x, size.y, size.z].sort((a, b) => a - b);
    return Math.max(dims[2], 0.001);
}

function centerModelAtOrigin(object) {
    object.updateMatrixWorld(true);
    const box = computeMeshBounds(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);
    object.updateMatrixWorld(true);
    return box.getSize(new THREE.Vector3());
}

function normalizeGltfModel(object, kind) {
    const targetSize = MODEL_TARGET_SIZE[kind] ?? 2.1;
    const rotation = MODEL_ROTATION[kind];
    if (rotation) {
        object.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
    }

    let size = centerModelAtOrigin(object);
    object.scale.multiplyScalar(targetSize / getScaleAxis(size));
    centerModelAtOrigin(object);

    if (kind === "shirt") {
        object.position.y -= 0.25;
    }
    object.updateMatrixWorld(true);
}

function applyHologramTint(object, kind) {
    const subtle = kind === "shirt";
    object.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
            if (!mat.isMeshStandardMaterial && !mat.isMeshPhysicalMaterial) return;
            mat.transparent = true;
            mat.opacity = Math.min(mat.opacity ?? 1, subtle ? 0.96 : 0.88);
            mat.emissive = mat.emissive || new THREE.Color(BRAND.cyan);
            mat.emissiveIntensity = Math.max(mat.emissiveIntensity || 0, subtle ? 0.03 : 0.08);
            mat.needsUpdate = true;
        });
    });
}

function collectNamedMeshes(object, pattern) {
    const found = [];
    object.traverse((child) => {
        if (child.isMesh && pattern.test(child.name)) found.push(child);
    });
    return found;
}

function collectVrLensMeshes(object) {
    const lenses = [];
    object.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        const hasLensMat = mats.some((mat) => /lente|lens|glass|visor|eye/i.test(mat.name || ""));
        if (!hasLensMat) return;

        mats.forEach((mat) => {
            if (!/lente|lens|glass|visor|eye/i.test(mat.name || "")) return;
            mat.emissive = new THREE.Color(BRAND.sky);
            mat.emissiveIntensity = 0.9;
            mat.needsUpdate = true;
        });

        if (!lenses.includes(child)) lenses.push(child);
    });
    return lenses;
}

function prepareGltfScene(scene, kind) {
    const root = new THREE.Group();
    const model = scene;
    root.add(model);

    normalizeGltfModel(model, kind);
    applyHologramTint(model, kind);

    const holoWires = [];
    const bounds = computeMeshBounds(model);
    const boundsSize = bounds.getSize(new THREE.Vector3());
    const wireBox = addHoloWire(
        root,
        new THREE.BoxGeometry(boundsSize.x, boundsSize.y, boundsSize.z),
        1.04
    );
    holoWires.push(wireBox);

    const namedHaptics = collectNamedMeshes(model, /sensor|haptic|dot/i).map((mesh, i) => {
        mesh.userData.isHapticDot = true;
        mesh.userData.phase = i * 0.72;
        mesh.userData.dist = mesh.position.length();
        mesh.userData.core = mesh;
        mesh.userData.halo = mesh.material?.emissive ? mesh : null;
        mesh.userData.speed = 0.8;
        mesh.userData.strength = 0.4;
        mesh.userData.gap = i * 0.5;
        return mesh;
    });

    const state = {
        root,
        shirtMesh: kind === "shirt" ? model : undefined,
        hapticDots: namedHaptics,
        pendingHapticMesh:
            kind === "shirt" && namedHaptics.length === 0 ? model : null,
        vrLenses: [],
        vrGlow: [],
        isExternal: true,
    };

    const vrLenses =
        kind === "vr"
            ? [...collectNamedMeshes(model, /lens|eye|glass|visor/i), ...collectVrLensMeshes(model)]
            : collectNamedMeshes(model, /lens|eye/i);
    const vrGlow = [];
    if (kind === "vr") {
        vrLenses.forEach((mesh, i) => {
            mesh.userData._vrLens = true;
            const glow = glowSprite(BRAND.sky, 0.22);
            glow.position.copy(mesh.position);
            glow.position.z += 0.08;
            glow.material.opacity = 0.28;
            glow.userData._vrGlow = true;
            glow.userData.lensIndex = i;
            root.add(glow);
            vrGlow.push(glow);
        });
    }

    const fx = attachSharedHologramFX(root, holoWires);

    return { ...state, vrLenses, vrGlow, ...fx };
}

const gltfLoader = new GLTFLoader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

const gltfSceneCache = new Map();
const gltfLoadPromises = new Map();
const preparedModelCache = new Map();

function extractModelStateFromRoot(root, kind) {
    const holoWires = [];
    const hapticDots = [];
    const vrLenses = [];
    const vrGlow = [];
    let holoAura;
    let scanBand;
    let holoField;
    let holoFieldMat;
    let ghost;

    root.traverse((child) => {
        if (child.userData?._holoWire) holoWires.push(child);
        if (child.userData?.isHapticDot) hapticDots.push(child);
        if (child.userData?._vrLens) vrLenses.push(child);
        if (child.userData?._vrGlow) vrGlow.push(child);

        const key = child.userData?._holoKey;
        if (key === "aura") holoAura = child;
        if (key === "scanBand") scanBand = child;
        if (key === "holoField") {
            holoField = child;
            holoFieldMat = child.material?.uniforms ? child.material : null;
        }
        if (key === "ghost") ghost = child;
    });

    return {
        root,
        shirtMesh: kind === "shirt" ? root.children[0] : undefined,
        hapticDots,
        pendingHapticMesh: null,
        vrLenses,
        vrGlow,
        isExternal: true,
        holoWires,
        scanBand,
        holoAura,
        holoField,
        holoFieldMat,
        ghost,
    };
}

function rewireHapticDotRefs(hapticDots) {
    hapticDots.forEach((actuator) => {
        if (!actuator.userData?.isHapticDot) return;

        const core = actuator.children[0] ?? actuator.userData.core;
        const halo = actuator.children[1] ?? actuator.userData.halo;

        actuator.userData = {
            ...actuator.userData,
            core,
            halo,
        };
    });
}

function clonePreparedModel(template, kind) {
    const root = template.root.clone(true);
    const state = extractModelStateFromRoot(root, kind);
    rewireHapticDotRefs(state.hapticDots);

    if (kind === "shirt" && state.hapticDots.length === 0 && state.shirtMesh) {
        state.hapticDots.push(...attachShirtHapticDots(state.shirtMesh));
        rewireHapticDotRefs(state.hapticDots);
    }

    return state;
}

async function fetchGltfScene(kind, onDownloadProgress) {
    const url = HOLOGRAM_MODEL_URLS[kind];
    if (!url) return null;

    if (gltfSceneCache.has(kind)) {
        onDownloadProgress?.(1);
        return gltfSceneCache.get(kind);
    }

    if (!gltfLoadPromises.has(kind)) {
        gltfLoadPromises.set(
            kind,
            new Promise((resolve, reject) => {
                gltfLoader.load(
                    url,
                    (gltf) => {
                        gltfSceneCache.set(kind, gltf.scene);
                        onDownloadProgress?.(1);
                        resolve(gltf.scene);
                    },
                    (event) => {
                        if (onDownloadProgress && event.lengthComputable && event.total > 0) {
                            onDownloadProgress(event.loaded / event.total);
                        }
                    },
                    reject
                );
            })
        );
    }

    return gltfLoadPromises.get(kind);
}

export function preloadHologramModels(kinds = Object.keys(HOLOGRAM_MODEL_URLS)) {
    return Promise.all(kinds.map((kind) => fetchGltfScene(kind).catch(() => null)));
}

async function buildModelState(kind, onPhaseProgress) {
    const report = (local, phase) => onPhaseProgress?.(local, phase);

    try {
        report(0.04, "DOWNLOAD");
        const scene = await fetchGltfScene(kind, (downloaded) => {
            report(0.04 + downloaded * 0.46, "DOWNLOAD");
        });
        report(0.54, "DECODE");

        if (scene) {
            const state = prepareGltfScene(scene.clone(true), kind);
            report(0.78, "RENDER");
            return state;
        }
    } catch {
        // GLB missing or failed — fall back to built-in procedural mesh.
    }

    report(0.78, "RENDER");
    return buildModelByKind(kind);
}

function finalizeShirtHaptics(state) {
    if (!state?.pendingHapticMesh) return state;

    const model = state.pendingHapticMesh;
    state.pendingHapticMesh = null;
    try {
        state.hapticDots.push(...attachShirtHapticDots(model));
    } catch {
        // Optional overlay — never block the shirt.
    }
    return state;
}

export async function warmHologramModel(kind, onPhaseProgress) {
    if (preparedModelCache.has(kind)) {
        onPhaseProgress?.(1, "CACHED");
        return preparedModelCache.get(kind);
    }

    let reported = 0.04;
    let phase = "DOWNLOAD";
    const bump = (local, nextPhase) => {
        if (local > reported) reported = local;
        if (nextPhase) phase = nextPhase;
        onPhaseProgress?.(reported, phase);
    };

    const ticker = setInterval(() => {
        if (reported < 0.9) {
            reported = Math.min(0.9, reported + 0.016);
            onPhaseProgress?.(reported, phase);
        }
    }, 130);

    try {
        const state = finalizeShirtHaptics(await buildModelState(kind, bump));

        if (kind === "shirt") {
            bump(0.92, "HAPTICS");
        }

        preparedModelCache.set(kind, state);
        onPhaseProgress?.(1, "DONE");
        return state;
    } finally {
        clearInterval(ticker);
    }
}

export async function warmAllHologramModels(onItemProgress) {
    const kinds = Object.keys(HOLOGRAM_MODEL_URLS);
    const slice = 1 / kinds.length;

    for (let i = 0; i < kinds.length; i += 1) {
        const kind = kinds[i];
        const base = i * slice;

        await warmHologramModel(kind, (local, phase) => {
            const fraction = base + slice * local;
            const label = phase
                ? `HOLOGRAMS · ${kind.toUpperCase()} · ${phase}`
                : `HOLOGRAMS · ${kind.toUpperCase()}`;
            onItemProgress?.(fraction, label);
        });
    }
}

export function areHologramModelsWarm() {
    return Object.keys(HOLOGRAM_MODEL_URLS).every((kind) => preparedModelCache.has(kind));
}

export async function loadModelByKind(kind) {
    if (preparedModelCache.has(kind)) {
        return clonePreparedModel(preparedModelCache.get(kind), kind);
    }

    const state = await buildModelState(kind);
    if (kind === "shirt" && state.pendingHapticMesh) {
        scheduleShirtHapticDots(state);
    }
    return state;
}

export function buildModelByKind(kind) {
    if (kind === "shirt") return buildShirtModel();
    if (kind === "vr") return buildVRModel();
    if (kind === "rifle") return buildRifleModel();
    return { root: new THREE.Group() };
}

function animateSharedHologramFX(state, t) {
    const flicker = 0.18 + Math.sin(t * 10) * 0.05 + Math.sin(t * 19) * 0.03;
    state.holoWires?.forEach((w) => {
        w.material.opacity = flicker;
    });
    if (state.holoAura) {
        state.holoAura.material.opacity = 0.025 + Math.sin(t * 1.6) * 0.012;
        state.holoAura.rotation.y = -t * 0.25;
        state.holoAura.rotation.x = Math.sin(t * 0.35) * 0.06;
    }
    if (state.scanBand) {
        state.scanBand.position.y = ((t * 0.45) % 2.4) - 1.2;
        state.scanBand.material.opacity = 0.06 + Math.abs(Math.sin(t * 4)) * 0.07;
    }
    if (state.holoFieldMat) {
        state.holoFieldMat.uniforms.time.value = t;
    }
    if (state.ghost) {
        state.ghost.rotation.y = t * 0.18;
        state.ghost.rotation.x = Math.sin(t * 0.55) * 0.1;
        state.ghost.material.opacity = 0.035 + Math.sin(t * 2.4) * 0.02;
    }
}

export function createHologramAnimator(kind, state) {
    let t = 0;

    return (group) => {
        t += 0.016;

        group.rotation.y = t * 0.9;
        group.rotation.x = Math.sin(t * 0.55) * 0.08;
        group.position.y = Math.sin(t * 1.2) * 0.04;

        animateSharedHologramFX(state, t);

        if (kind === "shirt") {
            if (state.pendingHapticMesh) scheduleShirtHapticDots(state);
            animateHapticDots(state.hapticDots, t);
        }

        if (kind === "vr" && state.vrLenses) {
            state.vrLenses.forEach((lens, i) => {
                const pulse = 0.85 + Math.sin(t * 2.2 + i * 1.2) * 0.35;
                const mats = Array.isArray(lens.material) ? lens.material : [lens.material];
                mats.forEach((mat) => {
                    if (mat?.emissive) mat.emissiveIntensity = pulse;
                });
            });
            state.vrGlow?.forEach((glow, i) => {
                glow.material.opacity = 0.18 + Math.sin(t * 2.2 + i) * 0.1;
            });
        }
    };
}
