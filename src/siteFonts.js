export const FONT_STYLESHEET_URL =
    "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap";

export const FONT_DISPLAY = "'Space Mono', ui-monospace, monospace";
export const FONT_BODY = "'IBM Plex Sans', system-ui, sans-serif";

const FONT_SPECS = [
    '300 1em "IBM Plex Sans"',
    '400 1em "IBM Plex Sans"',
    '500 1em "IBM Plex Sans"',
    '600 1em "IBM Plex Sans"',
    '400 1em "Space Mono"',
    '700 1em "Space Mono"',
];

export function ensureFontStylesheet() {
    const existing = document.querySelector(`link[href="${FONT_STYLESHEET_URL}"]`);
    if (existing) return existing;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_STYLESHEET_URL;
    document.head.appendChild(link);
    return link;
}

export async function loadSiteFonts() {
    const link = ensureFontStylesheet();

    await new Promise((resolve) => {
        if (link.sheet || link.rel !== "stylesheet") {
            resolve();
            return;
        }
        link.addEventListener("load", resolve, { once: true });
        link.addEventListener("error", resolve, { once: true });
    });

    if (document.fonts?.load) {
        await Promise.all(FONT_SPECS.map((spec) => document.fonts.load(spec).catch(() => {})));
        await document.fonts.ready;
    }
}
