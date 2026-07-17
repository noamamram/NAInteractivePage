import fs from "fs";
import path from "path";

const root = "public/projectImagesAndVideos";
const folderToId = {
    "Classified VR Training Simulator": "classified-vr-sim",
    "Aaptic Feedback": "aptic-feedback",
    "Plectrum Player": "plectrum-player",
    "VR Firing Ranges": "vr-firing-ranges",
    "Iron Word": "iron-word",
    "Word Detective": "word-detective",
    "Space Cactus": "space-cactus",
    "Procedural Water Surface": "procedural-water",
    "WaddleIn 2D": "waddle-in-2d",
};

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);

function urlFor(folder, file) {
    return `/projectImagesAndVideos/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
}

const out = {};
for (const [folder, id] of Object.entries(folderToId)) {
    const dir = path.join(root, folder);
    if (!fs.existsSync(dir)) {
        console.warn("missing", folder);
        continue;
    }
    const files = fs
        .readdirSync(dir)
        .filter((f) => f !== "desktop.ini" && !f.startsWith("."));
    const images = [];
    const videos = [];
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const src = urlFor(folder, file);
        if (VIDEO_EXT.has(ext)) videos.push({ type: "video", src });
        else if (IMAGE_EXT.has(ext)) images.push({ type: "image", src });
    }
    out[id] = {
        cover: images[0]?.src ?? videos[0]?.src ?? null,
        media: [...videos, ...images],
    };
}

const body = `/** Auto-generated from public/projectImagesAndVideos — do not hand-edit paths. */
export const WORKS_MEDIA = ${JSON.stringify(out, null, 4)};

export function getWorkMedia(workId) {
    return WORKS_MEDIA[workId] ?? { cover: null, media: [] };
}
`;

fs.writeFileSync("src/worksMedia.js", body, "utf8");
console.log("wrote src/worksMedia.js");
