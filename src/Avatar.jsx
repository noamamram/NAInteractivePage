import { useEffect, useRef } from "react";
import * as THREE from "three";
import { loadAvatarModel, replayAvatarAction, applyAvatarFacing } from "./avatarModel";

const C_CYAN = 0x1e88e5;

export default function Avatar({ mouseRef, focusContact, pointTarget, isMobile, pointToward = "right" }) {
    const mountRef = useRef(null);
    const pointTowardRef = useRef(pointToward);

    const avatarRootRef = useRef(null);

    useEffect(() => {
        pointTowardRef.current = pointToward;
        if (avatarRootRef.current) {
            applyAvatarFacing(avatarRootRef.current, pointToward);
        }
    }, [pointToward]);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        let cancelled = false;
        let raf = 0;
        const disposers = [];
        const clock = new THREE.Clock();

        const fov = isMobile ? 58 : 46;
        const camZ = isMobile ? 5.8 : 4.8;
        const w = mount.clientWidth;
        const h = mount.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 100);
        camera.position.set(0, isMobile ? 0.92 : 0.96, camZ);
        camera.lookAt(0, 0.82, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        renderer.setSize(w, h);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.78;
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0x4a5a6a, 0.38));
        scene.add(new THREE.HemisphereLight(0xb8c8d8, 0x2a3545, 0.62));
        const key = new THREE.DirectionalLight(0xf0f4f8, 0.52);
        key.position.set(1.1, 2.4, 4.8);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xd0dae4, 0.34);
        fill.position.set(-1.4, 1.1, 5.2);
        scene.add(fill);
        const rim = new THREE.DirectionalLight(0x5a9fd4, 0.22);
        rim.position.set(0, 1.6, -2.5);
        scene.add(rim);

        const accentMat = new THREE.MeshStandardMaterial({
            color: C_CYAN,
            emissive: C_CYAN,
            emissiveIntensity: 0.35,
            roughness: 0.55,
        });

        const root = new THREE.Group();
        scene.add(root);

        const pedestal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.9, 0.08, 16),
            new THREE.MeshStandardMaterial({ color: 0x1a1a22, metalness: 0.8, roughness: 0.4 })
        );
        pedestal.position.y = 0.04;
        root.add(pedestal);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.85, 0.015, 8, 32),
            accentMat
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.1;
        root.add(ring);

        const partCount = isMobile ? 40 : 80;
        const partPos = new Float32Array(partCount * 3);
        for (let i = 0; i < partCount; i += 1) {
            const a = Math.random() * Math.PI * 2;
            const r = 1.2 + Math.random() * 0.5;
            partPos[i * 3] = Math.cos(a) * r;
            partPos[i * 3 + 1] = Math.random() * 2.5;
            partPos[i * 3 + 2] = Math.sin(a) * r;
        }
        const partGeom = new THREE.BufferGeometry();
        partGeom.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
        const particles = new THREE.Points(
            partGeom,
            new THREE.PointsMaterial({
                color: C_CYAN,
                size: 0.025,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
            })
        );
        root.add(particles);

        let avatarRoot = null;
        let mixer = null;
        let action = null;
        let wasPointing = false;

        loadAvatarModel(pointTowardRef.current)
            .then(({ model, mixer: loadedMixer, action: loadedAction }) => {
                if (cancelled) return;
                avatarRoot = model;
                avatarRootRef.current = model;
                mixer = loadedMixer;
                action = loadedAction;
                root.add(model);
            })
            .catch(() => {});

        const animate = () => {
            const delta = clock.getDelta();
            const idleTime = (Date.now() - mouseRef.current.lastMove) / 1000;

            if (mixer) mixer.update(delta);

            if (avatarRoot) {
                avatarRoot.position.y = Math.sin(clock.elapsedTime * 1.5) * 0.006;
            }

            const ptRaw = pointTarget?.current;
            const isPointing =
                ptRaw !== null &&
                ptRaw !== undefined &&
                (typeof ptRaw === "object" ? ptRaw.idx !== null && ptRaw.idx !== undefined : true);
            const engaged = isPointing || focusContact.current;

            if (engaged && !wasPointing) {
                replayAvatarAction(action);
            }
            wasPointing = engaged;

            if (idleTime > 9 && !engaged) {
                replayAvatarAction(action);
            }

            ring.rotation.z = clock.elapsedTime * 0.5;
            particles.rotation.y = clock.elapsedTime * 0.2;
            const ppos = particles.geometry.attributes.position.array;
            for (let i = 0; i < partCount; i += 1) {
                ppos[i * 3 + 1] += 0.008;
                if (ppos[i * 3 + 1] > 2.5) ppos[i * 3 + 1] = 0;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            ring.material.emissiveIntensity = 0.28 + Math.sin(clock.elapsedTime * 3) * 0.1;

            renderer.render(scene, camera);
            raf = requestAnimationFrame(animate);
        };
        animate();

        const onResize = () => {
            const nw = mount.clientWidth;
            const nh = mount.clientHeight;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        disposers.push(() => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            mount.removeChild(renderer.domElement);
            if (avatarRoot) root.remove(avatarRoot);
            pedestal.geometry.dispose();
            pedestal.material.dispose();
            ring.geometry.dispose();
            ring.material.dispose();
            particles.geometry.dispose();
            particles.material.dispose();
            renderer.dispose();
        });

        return () => {
            cancelled = true;
            disposers.forEach((fn) => fn());
        };
    }, [mouseRef, focusContact, pointTarget, isMobile, pointToward]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
