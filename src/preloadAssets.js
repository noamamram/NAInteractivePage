import * as THREE from "three";
import { warmAvatarModel } from "./avatarModel";
import { warmAllHologramModels } from "./hologramModels";
import { loadSiteFonts } from "./siteFonts";

const LOGO_SRC = "/logo.png";
const IMAGE_URLS = [LOGO_SRC, "/plectrum-shirt.png", "/icons.svg"];

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function preloadFonts(report) {
    report?.(0.1, "FONTS · STYLESHEET");
    await loadSiteFonts();
    report?.(1, "FONTS");
}

function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
    });
}

async function preloadImages(report) {
    const logoFirst = [LOGO_SRC, ...IMAGE_URLS.filter((src) => src !== LOGO_SRC)];
    for (let i = 0; i < logoFirst.length; i += 1) {
        const src = logoFirst[i];
        const name = src.split("/").pop()?.replace(/\.\w+$/, "").toUpperCase() ?? "ASSET";
        report?.(i / logoFirst.length, `ASSETS · ${name}`);
        await preloadImage(src);
        report?.((i + 1) / logoFirst.length, `ASSETS · ${name}`);
        await delay(50);
    }
    report?.(1, "ASSETS");
}

async function warmupWebGL(report) {
    report?.(0.15, "GRAPHICS · CONTEXT");
    await new Promise((resolve) => {
        try {
            const canvas = document.createElement("canvas");
            const renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                powerPreference: "high-performance",
            });
            renderer.setSize(2, 2);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
            const points = new THREE.Points(
                new THREE.BufferGeometry(),
                new THREE.PointsMaterial({ size: 1, color: 0x1e88e5 })
            );
            scene.add(points);
            renderer.render(scene, camera);
            renderer.dispose();
        } catch {
            // Software fallback or blocked WebGL — site still works.
        }
        requestAnimationFrame(resolve);
    });

    report?.(0.7, "GRAPHICS · SHADERS");
    await delay(60);
    report?.(1, "GRAPHICS");
}

const PRELOAD_STEPS = [
    { id: "fonts", weight: 8, label: "FONTS", run: preloadFonts },
    { id: "images", weight: 5, label: "ASSETS", run: preloadImages },
    { id: "gpu", weight: 7, label: "GRAPHICS", run: warmupWebGL },
    {
        id: "models",
        weight: 80,
        label: "HOLOGRAMS",
        run: async (report) => {
            await warmAvatarModel((fraction, label) => {
                report(fraction * 0.18, label || "AVATAR");
            });
            await warmAllHologramModels((fraction, label) => {
                report(0.18 + fraction * 0.82, label || "HOLOGRAMS");
            });
        },
    },
];

/**
 * Preload heavy assets before first paint of the portfolio.
 * @param {{ onProgress?: (progress: number, label: string) => void }} options
 */
export async function preloadSiteAssets({ onProgress } = {}) {
    const totalWeight = PRELOAD_STEPS.reduce((sum, step) => sum + step.weight, 0);
    let completedWeight = 0;

    const reportStep = (step, localProgress = 1, label = step.label) => {
        const value = (completedWeight + step.weight * localProgress) / totalWeight;
        onProgress?.(Math.min(0.995, value), label);
    };

    onProgress?.(0.01, "INITIALIZING");

    for (const step of PRELOAD_STEPS) {
        reportStep(step, 0);

        await step.run((fraction, label) => reportStep(step, fraction, label || step.label));

        completedWeight += step.weight;
        reportStep(step, 1);
        await delay(30);
    }

    onProgress?.(1, "READY");
}
