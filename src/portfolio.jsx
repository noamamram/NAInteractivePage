import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { useLanguage, LanguageSwitcher } from "./i18n/LanguageProvider";
import { getProjects, getContactLinks, getSkills, getWorks } from "./i18n/translations";
import {
    IndexedSlash,
    IndexedTag,
    LtrSpan,
    MixedText,
    mirrorTranslateX,
    physicalEdge,
    SectionNumber,
} from "./i18n/bidi";
import {
    setupHologramRenderer,
    loadModelByKind,
    createHologramAnimator,
} from "./hologramModels";
import Avatar from "./Avatar";
import { ensureFontStylesheet, FONT_BODY, FONT_DISPLAY } from "./siteFonts";

// ============================================================================
// DESIGN TOKENS — NA INTERACTIVE BRAND
// ============================================================================
// Note: the names "cyan" and "orange" are historical; values are now brand blues.
// cyan  = primary brand electric blue (#1e88e5)
// orange = bright accent (#4fc3f7)
// amber = deep navy accent for darker emphasis
// warm  = NEW: red/orange accent — used sparingly to break the cool palette
const C = {
    bg: "#0a0e14",                              // slightly bluer near-black
    bg2: "#0d1320",                             // panel bg, navy-tinted
    panel: "rgba(13, 19, 32, 0.72)",
    border: "rgba(30, 136, 229, 0.22)",         // electric blue at low opacity
    borderHot: "rgba(79, 195, 247, 0.4)",       // bright blue accent border
    borderWarm: "rgba(255, 107, 53, 0.4)",      // warm accent border
    text: "#e8edf5",                            // slightly cool-tinted white
    textDim: "#7a8599",
    cyan: "#1e88e5",                            // PRIMARY brand electric blue
    orange: "#4fc3f7",                          // ACCENT bright cyan-blue
    amber: "#0d2847",                           // DEEP navy (used for emphasis)
    deepNavy: "#0d2847",                        // explicit alias
    brandDark: "#0a1f3a",                       // even deeper, for gradients
    warm: "#ff6b35",                            // NEW: vivid orange-red accent
    warmGlow: "#ff8c42",                        // softer warm for gradients
};

const LOGO_SRC = "/logo.png";

// Game / gesture UI stays screen-relative (LTR) even when page is RTL.
const GAME_CONTROLS_LTR = { direction: "ltr" };

// ============================================================================
// FONT INJECTION + GLOBAL STYLES
// ============================================================================
function GlobalStyles() {
    useEffect(() => {
        // Ensure a correct viewport meta exists — a missing or wrong one makes the
        // layout wider than the device and leaves slivers at the screen edges.
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement("meta");
            viewport.name = "viewport";
            document.head.appendChild(viewport);
        }
        viewport.setAttribute(
            "content",
            "width=device-width, initial-scale=1, viewport-fit=cover"
        );

        // iOS Safari paints the page edges / overscroll / status-bar region from these.
        const metaTags = [
            { name: "color-scheme", content: "dark" },
            { name: "theme-color", content: C.bg },
        ];
        const createdMetas = [];
        metaTags.forEach(({ name, content }) => {
            let m = document.querySelector(`meta[name="${name}"]`);
            if (!m) {
                m = document.createElement("meta");
                m.name = name;
                document.head.appendChild(m);
                createdMetas.push(m);
            }
            m.setAttribute("content", content);
        });

        ensureFontStylesheet();

        const style = document.createElement("style");
        style.textContent = `
      * { box-sizing: border-box; }
      :root { color-scheme: dark; background: ${C.bg}; }
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        overflow-x: clip;              /* clip > hidden: also clips fixed-positioned descendants */
        overflow-x: hidden;            /* fallback for engines without clip support */
        overscroll-behavior-x: none;   /* no horizontal rubber-band revealing the page background */
        background: ${C.bg} !important; /* UA canvas backdrop stays dark, never white */
      }
      body {
        color: ${C.text};
        font-family: ${FONT_BODY};
        -webkit-font-smoothing: antialiased;
        position: relative;
        display: block !important;     /* override Vite template's body { display:flex; place-items:center } */
        place-items: initial !important;
        min-width: 0 !important;
      }
      #root, #__next {
        overflow-x: clip;
        overflow-x: hidden;
        max-width: 100% !important;    /* override Vite template's #root { max-width:1280px } */
        width: 100% !important;
        margin: 0 !important;          /* override #root { margin:0 auto } */
        padding: 0 !important;         /* override #root { padding:2rem } — the classic edge-gap source */
        background: ${C.bg};
        display: block !important;
        text-align: initial;
      }
      html[dir="rtl"] {
        text-align: start;
      }
      html[dir="rtl"] .mono {
        letter-spacing: 0.12em;
      }
      ::selection { background: ${C.cyan}; color: ${C.bg}; }
      /* nothing may exceed the viewport on any device — kills edge slivers at the source */
      nav, header, section, footer, main, article { max-width: 100%; }
      img, canvas, svg, video { max-width: 100%; }
      @keyframes scan {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      @keyframes pulse-cyan {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      @keyframes flicker {
        0%, 100% { opacity: 1; }
        92% { opacity: 1; }
        93% { opacity: 0.4; }
        94% { opacity: 1; }
        96% { opacity: 0.7; }
        97% { opacity: 1; }
      }
      @keyframes glitch-shift {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-1px, 1px); }
        40% { transform: translate(1px, -1px); }
        60% { transform: translate(-1px, -1px); }
        80% { transform: translate(1px, 1px); }
      }
      .glitch:hover { animation: glitch-shift 0.3s steps(2); }
      @keyframes scroll-bounce {
        0%, 100% { transform: translateY(0); opacity: 0.85; }
        50% { transform: translateY(6px); opacity: 1; }
      }
      @keyframes scroll-arrow-pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      .scroll-cue {
        animation: scroll-bounce 2s ease-in-out infinite;
        cursor: pointer;
        color: ${C.orange};
        text-shadow: 0 0 12px ${C.orange}55;
        transition: text-shadow 0.2s ease, color 0.2s ease;
        border: none;
        background: transparent;
        padding: 8px 16px;
      }
      .scroll-cue:hover {
        color: ${C.cyan};
        text-shadow: 0 0 18px ${C.cyan}88;
      }
      .hero-tag-line {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 0;
        margin-top: 32px;
      }
      .hero-tag-item {
        font-size: 11px;
        color: ${C.textDim};
        letter-spacing: 0.18em;
        padding: 0 14px;
        user-select: none;
        pointer-events: none;
      }
      .hero-tag-sep {
        width: 1px;
        height: 12px;
        background: ${C.border};
        flex-shrink: 0;
      }
      @keyframes explosion-shake {
        0%, 100% { transform: translate(0, 0) rotate(0); }
        10% { transform: translate(-8px, 4px) rotate(-0.5deg); }
        20% { transform: translate(6px, -3px) rotate(0.4deg); }
        30% { transform: translate(-5px, -5px) rotate(-0.3deg); }
        40% { transform: translate(7px, 2px) rotate(0.5deg); }
        50% { transform: translate(-4px, 6px) rotate(-0.4deg); }
        60% { transform: translate(3px, -4px) rotate(0.3deg); }
        70% { transform: translate(-2px, 3px) rotate(-0.2deg); }
        80% { transform: translate(2px, -1px) rotate(0.15deg); }
        90% { transform: translate(-1px, 1px) rotate(0); }
      }
      @keyframes explosion-rip {
        0%, 100% { transform: translateX(0) skewX(0); filter: none; }
        20% { transform: translateX(-3px) skewX(-2deg); filter: hue-rotate(20deg); }
        50% { transform: translateX(4px) skewX(3deg); filter: hue-rotate(-15deg); }
        80% { transform: translateX(-2px) skewX(-1deg); filter: hue-rotate(8deg); }
      }
      @keyframes flash-bang {
        0% { opacity: 0; }
        2% { opacity: 1; }
        15% { opacity: 0.7; }
        100% { opacity: 0; }
      }
      @keyframes rgb-split {
        0%, 100% { text-shadow: none; }
        20% { text-shadow: -3px 0 #ff3366, 3px 0 ${C.cyan}; }
        40% { text-shadow: 3px 0 #ff3366, -3px 0 ${C.cyan}; }
        60% { text-shadow: -2px 0 #ff3366, 2px 0 ${C.cyan}; }
        80% { text-shadow: 2px 0 #ff3366, -2px 0 ${C.cyan}; }
      }
      .scanline::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent, ${C.cyan}22, transparent);
        height: 20%;
        animation: scan 4s linear infinite;
        pointer-events: none;
      }
      a, button { font-family: inherit; }
      .gamebtn {
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: none;            /* no long-press selection / magnifier / context gesture */
        outline: none;
      }
      .gamebtn:focus, .gamebtn:active { outline: none; }
      @keyframes engage-pulse {
        0%, 100% {
          box-shadow: 0 0 14px ${C.orange}55, 0 4px 0 ${C.orange}88;
        }
        50% {
          box-shadow: 0 0 28px ${C.orange}aa, 0 4px 0 ${C.orange}88;
        }
      }
      @keyframes engage-hint-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      @keyframes engage-arrow-nudge {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(3px); }
      }
      @keyframes engage-arrow-nudge-rtl {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-3px); }
      }
      html[dir="rtl"] .engage-hint-arrow {
        animation-name: engage-arrow-nudge-rtl;
      }
      .engage-btn {
        position: relative;
        transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease, color 0.14s ease;
      }
      .engage-btn:not(.is-live) {
        animation: engage-pulse 2s ease-in-out infinite;
      }
      .engage-btn:not(.is-live):hover {
        transform: translateY(-2px) scale(1.04);
        animation: none;
        box-shadow: 0 0 34px ${C.orange}cc, 0 6px 0 ${C.orange};
      }
      .engage-btn:not(.is-live):active {
        transform: translateY(2px) scale(0.97);
        animation: none;
        box-shadow: 0 0 10px ${C.orange}66, 0 1px 0 ${C.orange}66;
      }
      .engage-btn.is-live:hover {
        background: ${C.orange}18 !important;
        box-shadow: 0 0 12px ${C.orange}44;
      }
      .engage-hint {
        animation: engage-hint-blink 1.5s ease-in-out infinite;
        pointer-events: none;
        user-select: none;
      }
      .engage-hint-arrow {
        display: inline-block;
        animation: engage-arrow-nudge 1.2s ease-in-out infinite;
      }
      .mono { font-family: ${FONT_DISPLAY}; letter-spacing: -0.01em; }
      .grid-bg {
        background-image:
          linear-gradient(${C.cyan}08 1px, transparent 1px),
          linear-gradient(90deg, ${C.cyan}08 1px, transparent 1px);
        background-size: 40px 40px;
      }
      .noise {
        background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.4'/></svg>");
      }
    `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    return null;
}

// ============================================================================
// COMPONENT: NA INTERACTIVE LOGO
// ============================================================================
// Uses the brand PNG from /public/logo.png (NA monogram).
function Logo({ size = 48, glow = false }) {
    return (
        <div
            style={{
                width: size,
                height: size,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                filter: glow ? `drop-shadow(0 0 16px ${C.cyan}aa) drop-shadow(0 0 4px ${C.orange}66)` : "none",
            }}
            aria-hidden="true"
        >
            <img
                src={LOGO_SRC}
                alt=""
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                    // Asset ships on black; lighten blends black into the dark site bg.
                    mixBlendMode: "lighten",
                }}
                draggable={false}
            />
        </div>
    );
}

function BrandMark({ logoSize = 48, compact = false, showTagline = false, tagline }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: compact ? 8 : 12,
                direction: "ltr",
                minWidth: 0,
            }}
        >
            <Logo size={logoSize} />
            <div style={{ display: "flex", flexDirection: "column", gap: showTagline ? 4 : 0, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: compact ? 11 : 14,
                        fontWeight: 600,
                        letterSpacing: compact ? "0.14em" : "0.2em",
                        color: C.text,
                        whiteSpace: "nowrap",
                        lineHeight: 1.1,
                    }}
                >
                    NA Interactive
                </div>
                {showTagline && tagline && (
                    <div
                        style={{
                            fontSize: 10,
                            color: C.textDim,
                            letterSpacing: "0.18em",
                            fontStyle: "italic",
                            lineHeight: 1.4,
                            maxWidth: 220,
                        }}
                    >
                        {tagline}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// GLOBAL MOUSE TRACKING (shared by avatar + particles)
// ============================================================================
function useMouse() {
    const mouse = useRef({ x: 0, y: 0, nx: 0, ny: 0, lastMove: 0 });
    useEffect(() => {
        mouse.current.lastMove = Date.now();
        const onMove = (e) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
            mouse.current.nx = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current.ny = -(e.clientY / window.innerHeight) * 2 + 1;
            mouse.current.lastMove = Date.now();
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);
    return mouse;
}

// ============================================================================
// AUDIO SYSTEM (Web Audio API — synthesized, no files)
// ============================================================================
const AudioContext_ = window.AudioContext || window.webkitAudioContext;
let _ctx = null;
function getCtx() {
    if (!_ctx) _ctx = new AudioContext_();
    if (_ctx.state === "suspended") _ctx.resume();
    return _ctx;
}

function playTone({ freq = 440, dur = 0.08, type = "square", vol = 0.05, slide = 0 }) {
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (slide) {
            osc.frequency.exponentialRampToValueAtTime(
                Math.max(freq + slide, 20),
                ctx.currentTime + dur
            );
        }
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
    } catch { /* audio not available */ }
}

function playNoise({ dur = 0.1, vol = 0.04, filterFreq = 800 }) {
    try {
        const ctx = getCtx();
        const bufferSize = ctx.sampleRate * dur;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = filterFreq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        noise.stop(ctx.currentTime + dur);
    } catch { /* audio not available */ }
}

// Audio context — shared via ref pattern through props
const SFX = {
    hover: (muted) => !muted && playTone({ freq: 880, dur: 0.04, type: "sine", vol: 0.03 }),
    click: (muted) => !muted && playTone({ freq: 1200, dur: 0.06, type: "square", vol: 0.04, slide: -400 }),
    glitch: (muted) => !muted && playNoise({ dur: 0.05, vol: 0.025, filterFreq: 2000 }),
    open: (muted) => {
        if (muted) return;
        playTone({ freq: 220, dur: 0.15, type: "sawtooth", vol: 0.04, slide: 600 });
    },
    close: (muted) => {
        if (muted) return;
        playTone({ freq: 800, dur: 0.1, type: "sawtooth", vol: 0.04, slide: -500 });
    },
    shoot: (muted) => !muted && playTone({ freq: 1400, dur: 0.05, type: "square", vol: 0.03, slide: -800 }),
    explode: (muted) => !muted && playNoise({ dur: 0.18, vol: 0.05, filterFreq: 400 }),
    thud: (muted) => !muted && playTone({ freq: 80, dur: 0.08, type: "sine", vol: 0.05, slide: -30 }),
    engage: (muted) => {
        if (muted) return;
        playTone({ freq: 110, dur: 0.3, type: "sawtooth", vol: 0.05, slide: 500 });
        setTimeout(() => playTone({ freq: 660, dur: 0.1, type: "square", vol: 0.04 }), 200);
    },
    send: (muted) => {
        if (muted) return;
        playTone({ freq: 440, dur: 0.1, type: "sine", vol: 0.04 });
        setTimeout(() => playTone({ freq: 660, dur: 0.1, type: "sine", vol: 0.04 }), 80);
        setTimeout(() => playTone({ freq: 880, dur: 0.15, type: "sine", vol: 0.04 }), 160);
    },
};

// ============================================================================
// SMOOTH SCROLL HELPER
// ============================================================================
function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================================================
// RESPONSIVE HOOK
// ============================================================================
function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth < breakpoint : false
    );
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [breakpoint]);
    return isMobile;
}

// ============================================================================
// HOOK: Scroll reveal (IntersectionObserver)
// ============================================================================
function useReveal(threshold = 0.15, once = true) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    if (once) obs.disconnect();
                } else if (!once) {
                    setVisible(false);
                }
            },
            { threshold, rootMargin: "0px 0px -80px 0px" }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold, once]);
    return [ref, visible];
}

// ============================================================================
// COMPONENT: Reveal wrapper (animated entrance variants)
// ============================================================================
function Reveal({
    children,
    variant = "fade-up",
    delay = 0,
    duration = 700,
    style = {},
    className = "",
}) {
    const [ref, visible] = useReveal();
    const variants = {
        "fade-up": {
            from: "translateY(40px)",
            to: "translateY(0)",
        },
        "fade-down": {
            from: "translateY(-40px)",
            to: "translateY(0)",
        },
        "slide-left": {
            from: "translateX(-60px)",
            to: "translateX(0)",
        },
        "slide-right": {
            from: "translateX(60px)",
            to: "translateX(0)",
        },
        "scale": {
            from: "scale(0.92)",
            to: "scale(1)",
        },
        "glitch": {
            from: "translate(0, 30px) skewX(-8deg)",
            to: "translate(0, 0) skewX(0deg)",
        },
    };
    const v = variants[variant] || variants["fade-up"];
    return (
        <div
            ref={ref}
            className={className}
            style={{
                ...style,
                opacity: visible ? 1 : 0,
                transform: visible ? v.to : v.from,
                transition: `opacity ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`,
                willChange: visible ? "auto" : "opacity, transform",
            }}
        >
            {children}
        </div>
    );
}

// ============================================================================
// COMPONENT: NAV BAR
// ============================================================================
function useHideOnScroll({ threshold = 72, delta = 6 } = {}) {
    const [hidden, setHidden] = useState(false);
    const lastY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        lastY.current = window.scrollY;
        const update = () => {
            const y = window.scrollY;
            if (y <= threshold) {
                setHidden(false);
            } else if (y - lastY.current > delta) {
                setHidden(true);
            } else if (lastY.current - y > delta) {
                setHidden(false);
            }
            lastY.current = y;
            ticking.current = false;
        };
        const onScroll = () => {
            if (ticking.current) return;
            ticking.current = true;
            requestAnimationFrame(update);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [threshold, delta]);

    return hidden;
}

function NavBar({ muted, setMuted, isMobile, onNavigate }) {
    const { t } = useLanguage();
    const links = [
        { label: t("nav.home"), id: "home" },
        { label: t("nav.about"), id: "about" },
        { label: t("nav.experience"), id: "experience" },
        { label: t("nav.projects"), id: "projects" },
        { label: t("nav.contact"), id: "contact" },
        { label: t("nav.arcade"), id: "arcade" },
    ];
    const [menuOpen, setMenuOpen] = useState(false);
    const scrollHidden = useHideOnScroll();
    const navHidden = scrollHidden && !menuOpen;

    useEffect(() => {
        if (scrollHidden && menuOpen) setMenuOpen(false);
    }, [scrollHidden, menuOpen]);

    const handleNavClick = (id) => {
        SFX.click(muted);
        onNavigate?.(id);
        scrollToId(id);
        setMenuOpen(false);
    };

    const navLinkBtn = (l) => (
        <button
            key={l.id}
            onClick={() => handleNavClick(l.id)}
            onMouseEnter={(e) => {
                SFX.hover(muted);
                e.target.style.color = C.cyan;
                e.target.style.borderBottomColor = C.cyan;
                e.target.style.textShadow = `0 0 8px ${C.cyan}`;
            }}
            onMouseLeave={(e) => {
                e.target.style.color = C.text;
                e.target.style.borderBottomColor = "transparent";
                e.target.style.textShadow = "none";
            }}
            className="glitch mono"
            style={{
                background: "transparent",
                border: "none",
                borderBottom: "1px solid transparent",
                color: C.text,
                fontSize: 12,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "6px 4px",
                cursor: "pointer",
                transition: "all 0.2s",
            }}
        >
            {l.label}
        </button>
    );

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                backdropFilter: "blur(12px)",
                background: "rgba(10, 10, 12, 0.75)",
                borderBottom: `1px solid ${C.border}`,
                padding: isMobile ? "6px 16px" : "8px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transform: navHidden ? "translateY(-110%)" : "translateY(0)",
                transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: navHidden ? "none" : "auto",
                willChange: "transform",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 0 : 28 }}>
                <button
                    onClick={() => handleNavClick("home")}
                    style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                    }}
                    aria-label={t("nav.homeAria")}
                >
                    <BrandMark logoSize={isMobile ? 40 : 48} compact={isMobile} />
                </button>

                {!isMobile && (
                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                        {links.map(navLinkBtn)}
                    </div>
                )}
            </div>

            {!isMobile && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <LanguageSwitcher
                        compact={false}
                        onSwitch={() => SFX.click(muted)}
                    />
                    <button
                        onClick={() => {
                            SFX.click(muted);
                            setMuted(!muted);
                        }}
                        className="mono"
                        style={{
                            background: "transparent",
                            border: `1px solid ${muted ? C.textDim : C.cyan}`,
                            color: muted ? C.textDim : C.cyan,
                            padding: "6px 12px",
                            fontSize: 10,
                            letterSpacing: "0.15em",
                            cursor: "pointer",
                            textTransform: "uppercase",
                        }}
                    >
                        {muted ? t("nav.audioOff") : t("nav.audioOn")}
                    </button>
                </div>
            )}

            {isMobile && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <LanguageSwitcher
                        compact
                        onSwitch={() => SFX.click(muted)}
                    />
                    <button
                        onClick={() => {
                            SFX.click(muted);
                            setMuted(!muted);
                        }}
                        className="mono"
                        style={{
                            background: "transparent",
                            border: `1px solid ${muted ? C.textDim : C.cyan}`,
                            color: muted ? C.textDim : C.cyan,
                            width: 36,
                            height: 36,
                            fontSize: 11,
                            cursor: "pointer",
                        }}
                    >
                        {muted ? "◌" : "◉"}
                    </button>
                    <button
                        onClick={() => {
                            SFX.click(muted);
                            setMenuOpen(!menuOpen);
                        }}
                        className="mono"
                        style={{
                            background: menuOpen ? C.cyan : "transparent",
                            border: `1px solid ${C.cyan}`,
                            color: menuOpen ? C.bg : C.cyan,
                            width: 36,
                            height: 36,
                            fontSize: 16,
                            cursor: "pointer",
                        }}
                    >
                        {menuOpen ? "✕" : "≡"}
                    </button>
                </div>
            )}

            {isMobile && menuOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "rgba(10, 10, 12, 0.97)",
                        borderBottom: `1px solid ${C.border}`,
                        backdropFilter: "blur(12px)",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                    }}
                >
                    {links.map((l) => (
                        <button
                            key={l.id}
                            onClick={() => handleNavClick(l.id)}
                            className="mono"
                            style={{
                                background: "transparent",
                                border: "none",
                                borderInlineStart: `2px solid ${C.cyan}`,
                                color: C.text,
                                fontSize: 13,
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                padding: "14px 16px",
                                cursor: "pointer",
                                textAlign: "start",
                            }}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    );
}

// ============================================================================
// COMPONENT: HERO PARTICLES (Three.js)
// ============================================================================
function HeroParticles({ mouseRef, isMobile }) {
    const mountRef = useRef(null);
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;
        const w = mount.clientWidth;
        const h = mount.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        renderer.setSize(w, h);
        mount.appendChild(renderer.domElement);

        // Particle field — fewer on mobile
        const count = isMobile ? 500 : 1200;
        const positions = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const cyan = new THREE.Color(C.cyan);
        const orange = new THREE.Color(C.orange);

        for (let i = 0; i < count; i++) {
            const r = 8 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;
            const c = Math.random() > 0.85 ? orange : cyan;
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const points = new THREE.Points(geom, mat);
        scene.add(points);

        // Connecting lines (subtle)
        const lineGeom = new THREE.BufferGeometry();
        const linePositions = new Float32Array(300 * 6);
        lineGeom.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({
            color: C.cyan,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending,
        });
        const lines = new THREE.LineSegments(lineGeom, lineMat);
        scene.add(lines);

        let raf;
        let t = 0;
        const animate = () => {
            t += 0.003;
            const posAttr = geom.attributes.position;
            const mx = mouseRef.current.nx;
            const my = mouseRef.current.ny;

            for (let i = 0; i < count; i++) {
                const ox = originalPositions[i * 3];
                const oy = originalPositions[i * 3 + 1];
                const oz = originalPositions[i * 3 + 2];
                // breathe
                const breath = 1 + Math.sin(t + i * 0.1) * 0.03;
                // mouse repulsion
                const px = ox * breath + mx * 2;
                const py = oy * breath + my * 2;
                posAttr.array[i * 3] = px;
                posAttr.array[i * 3 + 1] = py;
                posAttr.array[i * 3 + 2] = oz * breath;
            }
            posAttr.needsUpdate = true;

            // Update lines between nearby particles (sparse sampling)
            let lineIdx = 0;
            const linePos = lineGeom.attributes.position.array;
            for (let i = 0; i < 80 && lineIdx < 300; i++) {
                const a = Math.floor(Math.random() * count);
                const b = Math.floor(Math.random() * count);
                const dx = posAttr.array[a * 3] - posAttr.array[b * 3];
                const dy = posAttr.array[a * 3 + 1] - posAttr.array[b * 3 + 1];
                const dz = posAttr.array[a * 3 + 2] - posAttr.array[b * 3 + 2];
                const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (d < 3) {
                    linePos[lineIdx * 6] = posAttr.array[a * 3];
                    linePos[lineIdx * 6 + 1] = posAttr.array[a * 3 + 1];
                    linePos[lineIdx * 6 + 2] = posAttr.array[a * 3 + 2];
                    linePos[lineIdx * 6 + 3] = posAttr.array[b * 3];
                    linePos[lineIdx * 6 + 4] = posAttr.array[b * 3 + 1];
                    linePos[lineIdx * 6 + 5] = posAttr.array[b * 3 + 2];
                    lineIdx++;
                }
            }
            for (let i = lineIdx; i < 300; i++) {
                linePos[i * 6] = 0;
                linePos[i * 6 + 1] = 0;
                linePos[i * 6 + 2] = 0;
                linePos[i * 6 + 3] = 0;
                linePos[i * 6 + 4] = 0;
                linePos[i * 6 + 5] = 0;
            }
            lineGeom.attributes.position.needsUpdate = true;

            points.rotation.y = t * 0.5 + mx * 0.3;
            points.rotation.x = my * 0.2;

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

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            mount.removeChild(renderer.domElement);
            geom.dispose();
            mat.dispose();
            lineGeom.dispose();
            lineMat.dispose();
            renderer.dispose();
        };
    }, [mouseRef, isMobile]);

    return <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />;
}

// ============================================================================
// COMPONENT: HERO SECTION
// ============================================================================
function Hero({ mouseRef, isMobile, muted }) {
    const { t, dir } = useLanguage();
    const tags = t("hero.tags");
    return (
        <section
            id="home"
            style={{
                position: "relative",
                height: "100vh",
                minHeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
            className="grid-bg"
        >
            <HeroParticles mouseRef={mouseRef} isMobile={isMobile} />
            {/* vignette */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(ellipse at center, transparent 30%, rgba(10,10,12,0.9) 100%)",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "relative",
                    textAlign: "center",
                    zIndex: 2,
                    padding: "0 20px",
                    maxWidth: 1100,
                    margin: "0 auto",
                    width: "100%",
                    direction: dir,
                }}
            >
                <div
                    className="mono"
                    style={{
                        fontSize: 11,
                        color: C.cyan,
                        letterSpacing: "0.4em",
                        marginBottom: 24,
                        opacity: 0.7,
                    }}
                >
                    <MixedText dir={dir}>{t("hero.sysInit")}</MixedText>
                </div>
                <h1
                    className="mono"
                    style={{
                        fontSize: "clamp(40px, 8vw, 96px)",
                        fontWeight: 700,
                        margin: 0,
                        lineHeight: 0.95,
                        letterSpacing: "-0.04em",
                        color: C.text,
                    }}
                >
                    <span style={{ display: "inline-block", textAlign: "left" }}>
                        NOAM
                        <br />
                        <span style={{ color: C.warm, animation: "flicker 6s infinite", textShadow: `0 0 30px ${C.warmGlow}88` }}>
                            AMRAM
                        </span>
                        <span
                            style={{
                                color: C.cyan,
                                animation: "pulse-cyan 1.2s infinite",
                                marginLeft: 4,
                            }}
                        >
                            _
                        </span>
                    </span>
                </h1>
                <div className="hero-tag-line">
                    {tags.map((tag, i) => (
                        <span key={`${i}-${tag}`} style={{ display: "contents" }}>
                            {i > 0 && <span className="hero-tag-sep" aria-hidden="true" />}
                            <span className="mono hero-tag-item">
                                <IndexedTag
                                    index={i + 1}
                                    label={tag}
                                    dir={dir}
                                    numberStyle={{ color: C.textDim, opacity: 0.7 }}
                                />
                            </span>
                        </span>
                    ))}
                </div>
                <button
                    type="button"
                    className="mono scroll-cue"
                    onClick={() => {
                        SFX.click(muted);
                        scrollToId("about");
                    }}
                    style={{
                        marginTop: 56,
                        fontSize: 11,
                        letterSpacing: "0.3em",
                    }}
                >
                    <MixedText dir={dir}>{t("hero.scroll")}</MixedText>
                </button>
            </div>
        </section>
    );
}

// ============================================================================
// COMPONENT: HOLOGRAPHIC PROJECT PREVIEW (Three.js)
// Different procedural asset per project
// ============================================================================
function disposeHologramRoot(root) {
    root.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
            if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
            else o.material.dispose();
        }
    });
}

function ProjectHologram({ kind, isMobile }) {
    const mountRef = useRef(null);
    const ctxRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const { scene, camera, renderer, group } = setupHologramRenderer(mount, isMobile);
        let raf = 0;
        let tick = () => {};

        const animate = () => {
            tick(group);
            renderer.render(scene, camera);
            raf = requestAnimationFrame(animate);
        };
        animate();

        const onResize = () => {
            const nw = mount.clientWidth;
            const nh = mount.clientHeight;
            if (!nw || !nh) return;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        ctxRef.current = { group, setTick: (fn) => { tick = fn; } };

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            mount.removeChild(renderer.domElement);
            scene.traverse((o) => {
                if (o.geometry) o.geometry.dispose();
                if (o.material) {
                    if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
                    else o.material.dispose();
                }
            });
            renderer.dispose();
            ctxRef.current = null;
        };
    }, [isMobile]);

    useEffect(() => {
        if (!kind) return;

        let cancelled = false;
        let retryRaf = 0;

        const swapModel = () => {
            const ctx = ctxRef.current;
            if (!ctx) {
                retryRaf = requestAnimationFrame(swapModel);
                return;
            }

            const { group, setTick } = ctx;

            while (group.children.length > 0) {
                const child = group.children[0];
                group.remove(child);
                disposeHologramRoot(child);
            }

            loadModelByKind(kind)
                .then((modelState) => {
                    if (cancelled || !modelState?.root) return;
                    group.add(modelState.root);
                    setTick(createHologramAnimator(kind, modelState));
                })
                .catch(() => {});
        };

        swapModel();

        return () => {
            cancelled = true;
            cancelAnimationFrame(retryRaf);
        };
    }, [kind]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

// ============================================================================
// COMPONENT: PORTFOLIO SECTION
// ============================================================================
function Portfolio({ onOpen, muted, isMobile }) {
    const { t, lang, dir } = useLanguage();
    const PROJECTS = getProjects(lang);
    const [hovered, setHovered] = useState(null);
    const [holoKind, setHoloKind] = useState(PROJECTS[0]?.kind ?? "shirt");

    return (
        <section
            id="experience"
            style={{
                position: "relative",
                padding: isMobile ? "80px 16px" : "120px 32px",
                maxWidth: 1400,
                margin: "0 auto",
            }}
        >
            <Reveal variant="glitch">
                <SectionHeader number="03" title={t("experience.title")} subtitle={t("experience.subtitle")} />
            </Reveal>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 420px",
                    gap: isMobile ? 32 : 48,
                    marginTop: isMobile ? 40 : 60,
                }}
            >
                {/* Project list */}
                <div>
                    {PROJECTS.map((p, i) => (
                        <Reveal
                            key={p.id}
                            variant={i % 2 === 0 ? "slide-left" : "slide-right"}
                            delay={0}
                            duration={650}
                        >
                            <div
                                onMouseEnter={() => {
                                    if (!isMobile) {
                                        setHovered(p.id);
                                        setHoloKind(p.kind);
                                        SFX.glitch(muted);
                                    }
                                }}
                                onMouseLeave={() => !isMobile && setHovered(null)}
                                onClick={() => {
                                    SFX.open(muted);
                                    if (!isMobile) {
                                        setHovered(p.id);
                                        setHoloKind(p.kind);
                                    }
                                    onOpen(p);
                                }}
                                style={{
                                    position: "relative",
                                    padding: isMobile ? "24px 0" : "32px 0",
                                    borderTop: `1px solid ${C.border}`,
                                    borderBottom:
                                        i === PROJECTS.length - 1 ? `1px solid ${C.border}` : "none",
                                    cursor: "pointer",
                                    transition: "all 0.3s",
                                    [physicalEdge("left", dir) === "left" ? "paddingLeft" : "paddingRight"]:
                                        hovered === p.id ? 24 : 0,
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        [physicalEdge("left", dir)]: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: 4,
                                        height: hovered === p.id ? "80%" : 0,
                                        background: C.cyan,
                                        boxShadow: `0 0 12px ${C.cyan}`,
                                        transition: "height 0.3s",
                                    }}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "baseline",
                                        gap: 24,
                                    }}
                                >
                                    <div>
                                        <div
                                            className="mono"
                                            style={{
                                                fontSize: 11,
                                                color: C.textDim,
                                                letterSpacing: "0.2em",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <IndexedSlash
                                                left={String(i + 1).padStart(2, "0")}
                                                right={p.year}
                                                dir={dir}
                                            />
                                        </div>
                                        <h3
                                            className="mono"
                                            style={{
                                                margin: 0,
                                                fontSize: isMobile ? 22 : 32,
                                                color: hovered === p.id ? C.cyan : C.text,
                                                transition: "color 0.2s",
                                                letterSpacing: "-0.02em",
                                            }}
                                        >
                                            <MixedText dir={dir}>{p.org}</MixedText>
                                        </h3>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                color: C.textDim,
                                                marginTop: 6,
                                                fontWeight: 300,
                                            }}
                                        >
                                            <MixedText dir={dir}>{p.role}</MixedText>
                                        </div>
                                    </div>
                                    <div
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: hovered === p.id ? C.orange : C.textDim,
                                            letterSpacing: "0.2em",
                                            transition: "color 0.2s",
                                        }}
                                    >
                                        {t("experience.view")}
                                    </div>
                                </div>

                                {/* Mobile-only: inline 3D hologram below each project */}
                                {isMobile && (
                                    <div
                                        style={{
                                            marginTop: 18,
                                            height: 200,
                                            border: `1px solid ${C.border}`,
                                            background:
                                                "linear-gradient(180deg, rgba(30,136,229,0.05), rgba(79,195,247,0.02))",
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                        className="scanline"
                                    >
                                        <div
                                            className="mono"
                                            style={{
                                                position: "absolute",
                                                top: 8,
                                                left: 10,
                                                fontSize: 9,
                                                color: C.cyan,
                                                letterSpacing: "0.2em",
                                                zIndex: 2,
                                            }}
                                        >
                                            ◉ HOLO_{p.kind.toUpperCase()}
                                        </div>
                                        <div
                                            className="mono"
                                            style={{
                                                position: "absolute",
                                                bottom: 8,
                                                right: 10,
                                                fontSize: 9,
                                                color: C.textDim,
                                                letterSpacing: "0.2em",
                                                zIndex: 2,
                                            }}
                                        >
                                            {t("experience.tapToInspect")}
                                        </div>
                                        {/* corner brackets */}
                                        {[
                                            { top: 4, left: 4, t: true, l: true },
                                            { top: 4, right: 4, t: true, r: true },
                                            { bottom: 4, left: 4, b: true, l: true },
                                            { bottom: 4, right: 4, b: true, r: true },
                                        ].map((b, bi) => (
                                            <div
                                                key={bi}
                                                style={{
                                                    position: "absolute",
                                                    top: b.top,
                                                    left: b.left,
                                                    right: b.right,
                                                    bottom: b.bottom,
                                                    width: 10,
                                                    height: 10,
                                                    borderTop: b.t ? `1px solid ${C.cyan}` : "none",
                                                    borderRight: b.r ? `1px solid ${C.cyan}` : "none",
                                                    borderBottom: b.b ? `1px solid ${C.cyan}` : "none",
                                                    borderLeft: b.l ? `1px solid ${C.cyan}` : "none",
                                                    zIndex: 3,
                                                }}
                                            />
                                        ))}
                                        <ProjectHologram kind={p.kind} isMobile={isMobile} />
                                    </div>
                                )}
                            </div>
                        </Reveal>
                    ))}
                </div>

                {/* Holographic preview panel — desktop only */}
                {!isMobile && (
                    <Reveal variant="slide-right" delay={300}>
                        <div
                            style={{
                                position: "sticky",
                                top: 100,
                                height: 480,
                                border: `1px solid ${C.border}`,
                                background: "rgba(30, 136, 229, 0.02)",
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                            }}
                            className="scanline"
                        >
                            {/* corner brackets */}
                            {[
                                { top: 8, left: 8, br: ["1px solid", "none", "none", "1px solid"] },
                                { top: 8, right: 8, br: ["1px solid", "1px solid", "none", "none"] },
                                { bottom: 8, left: 8, br: ["none", "none", "1px solid", "1px solid"] },
                                { bottom: 8, right: 8, br: ["none", "1px solid", "1px solid", "none"] },
                            ].map((b, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: "absolute",
                                        ...b,
                                        width: 14,
                                        height: 14,
                                        borderTop: b.br[0] === "1px solid" ? `1px solid ${C.cyan}` : "none",
                                        borderRight: b.br[1] === "1px solid" ? `1px solid ${C.cyan}` : "none",
                                        borderBottom: b.br[2] === "1px solid" ? `1px solid ${C.cyan}` : "none",
                                        borderLeft: b.br[3] === "1px solid" ? `1px solid ${C.cyan}` : "none",
                                        zIndex: 3,
                                    }}
                                />
                            ))}

                            <div
                                className="mono"
                                style={{
                                    fontSize: 10,
                                    color: C.cyan,
                                    letterSpacing: "0.25em",
                                    padding: "14px 18px",
                                    borderBottom: `1px solid ${C.border}`,
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span>{t("experience.holoProjector")}</span>
                                <span style={{ color: hovered ? C.orange : C.textDim }}>
                                    {hovered ? t("experience.live") : t("experience.standby")}
                                </span>
                            </div>
                            <div style={{ flex: 1, position: "relative" }}>
                                <ProjectHologram kind={holoKind} isMobile={isMobile} />
                                {!hovered && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: C.textDim,
                                            textAlign: "center",
                                            padding: 24,
                                            background: "rgba(10, 14, 20, 0.72)",
                                            zIndex: 2,
                                        }}
                                    >
                                        <div
                                            className="mono"
                                            style={{ fontSize: 12, letterSpacing: "0.2em", marginBottom: 12 }}
                                        >
                                            {t("experience.awaitingTarget")}
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 300, maxWidth: 240 }}>
                                            <MixedText dir={dir}>{t("experience.hoverHint")}</MixedText>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Reveal>
                )}
            </div>
        </section>
    );
}

// ============================================================================
// COMPONENT: PROJECT MODAL
// ============================================================================
function ProjectModal({ project, onClose, muted, isMobile }) {
    const { t, dir } = useLanguage();
    const close = useCallback(() => {
        SFX.close(muted);
        onClose();
    }, [muted, onClose]);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && close();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [close]);

    if (!project) return null;
    return (
        <div
            onClick={close}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(5, 5, 8, 0.85)",
                backdropFilter: "blur(8px)",
                zIndex: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: 720,
                    width: "100%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    background: C.bg2,
                    border: `1px solid ${C.cyan}`,
                    boxShadow: `0 0 60px rgba(30, 136, 229, 0.2)`,
                    padding: "32px 24px",
                    position: "relative",
                }}
            >
                <button
                    onClick={close}
                    className="mono"
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: "transparent",
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        width: 32,
                        height: 32,
                        cursor: "pointer",
                        fontSize: 14,
                    }}
                >
                    ✕
                </button>
                <div
                    className="mono"
                    style={{
                        fontSize: 11,
                        color: C.cyan,
                        letterSpacing: "0.2em",
                        marginBottom: 8,
                    }}
                >
                    <MixedText dir={dir}>{project.year}</MixedText>
                </div>
                <h2
                    className="mono"
                    style={{
                        margin: 0,
                        fontSize: 36,
                        letterSpacing: "-0.02em",
                    }}
                >
                    <MixedText dir={dir}>{project.org}</MixedText>
                </h2>
                <div
                    style={{
                        color: C.orange,
                        fontSize: 14,
                        marginTop: 4,
                        fontWeight: 500,
                    }}
                >
                    <MixedText dir={dir}>{project.role}</MixedText>
                </div>

                <p
                    style={{
                        color: C.textDim,
                        lineHeight: 1.7,
                        marginTop: 24,
                        fontWeight: 300,
                    }}
                >
                    <MixedText dir={dir}>{project.summary}</MixedText>
                </p>
                <div
                    className="mono"
                    style={{
                        fontSize: 10,
                        color: C.textDim,
                        letterSpacing: "0.2em",
                        marginTop: 28,
                        marginBottom: 12,
                    }}
                >
                    {t("modal.stack")}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {project.stack.map((s) => (
                        <span
                            key={s}
                            className="mono"
                            style={{
                                fontSize: 11,
                                padding: "6px 12px",
                                border: `1px solid ${C.border}`,
                                color: C.cyan,
                                letterSpacing: "0.1em",
                            }}
                        >
                            <LtrSpan block>{s}</LtrSpan>
                        </span>
                    ))}
                </div>

                {project.kind && (
                    <div
                        style={{
                            marginTop: 28,
                            height: isMobile ? 200 : 260,
                            border: `1px solid ${C.border}`,
                            background:
                                "linear-gradient(180deg, rgba(30,136,229,0.06), rgba(79,195,247,0.02))",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        className="scanline"
                    >
                        <div
                            className="mono"
                            style={{
                                position: "absolute",
                                top: 10,
                                left: 12,
                                fontSize: 9,
                                color: C.cyan,
                                letterSpacing: "0.2em",
                                zIndex: 2,
                            }}
                        >
                            ◉ HOLO_{project.kind.toUpperCase()}
                        </div>
                        <ProjectHologram kind={project.kind} isMobile={isMobile} />
                    </div>
                )}

            </div>
        </div>
    );
}

// ============================================================================
// COMPONENT: PHYSICS SKILLS SANDBOX
// ============================================================================
function PhysicsSandbox({ muted, isMobile }) {
    const { t, dir, lang } = useLanguage();
    const SKILLS = getSkills(lang);
    const [engaged, setEngaged] = useState(false);
    const canvasRef = useRef(null);
    const mutedRef = useRef(muted);
    useEffect(() => { mutedRef.current = muted; }, [muted]);
    const stateRef = useRef({
        boxes: [],
        dragging: null,
        mouse: { x: 0, y: 0, down: false },
        raf: null,
    });

    useEffect(() => {
        if (!engaged) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = canvas.clientWidth * window.devicePixelRatio;
        canvas.height = canvas.clientHeight * window.devicePixelRatio;
        const dpr = window.devicePixelRatio;
        ctx.scale(dpr, dpr);
        const ww = canvas.clientWidth;
        const hh = canvas.clientHeight;
        const st = stateRef.current; // stable ref captured for cleanup

        // Initialize boxes — responsive layout.
        // On narrow (mobile) canvases, fewer columns and clamp box width so labels fit.
        const cols = isMobile ? 3 : 6;
        stateRef.current.boxes = SKILLS.map((s, i) => {
            const w = Math.min(60 + s.length * 7, ww - 24);
            const h = 38;
            const col = i % cols;
            const row = Math.floor(i / cols);
            const cellW = (ww - 24) / cols;
            // start spread across the row, with a little jitter, then physics settles them
            const baseX = 12 + col * cellW + (cellW - w) / 2;
            return {
                label: s,
                x: Math.max(8, Math.min(ww - w - 8, baseX)),
                y: 16 + row * 52,
                w,
                h,
                vx: (Math.random() - 0.5) * 2,
                vy: 0,
                angle: 0,
                va: (Math.random() - 0.5) * 0.05,
                color: i % 3 === 0 ? C.orange : C.cyan,
            };
        });

        // Resolve a pointer event to canvas-local CSS coordinates (works for mouse + touch)
        const localCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };

        const onDown = (e) => {
            const { x: mx, y: my } = localCoords(e);
            stateRef.current.mouse.x = mx;
            stateRef.current.mouse.y = my;
            stateRef.current.mouse.down = true;
            // Find topmost box under pointer
            for (let i = stateRef.current.boxes.length - 1; i >= 0; i--) {
                const b = stateRef.current.boxes[i];
                if (mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h) {
                    stateRef.current.dragging = b;
                    b.dragOffX = mx - b.x;
                    b.dragOffY = my - b.y;
                    b.prevX = mx;
                    b.prevY = my;
                    // Capture the pointer so drags keep firing even if the finger leaves the canvas
                    try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
                    // Prevent the browser from treating this touch as a scroll/zoom gesture
                    if (e.cancelable) e.preventDefault();
                    break;
                }
            }
        };
        const onMove = (e) => {
            const { x, y } = localCoords(e);
            stateRef.current.mouse.x = x;
            stateRef.current.mouse.y = y;
            // While dragging, suppress page scroll on touch devices
            if (stateRef.current.dragging && e.cancelable) e.preventDefault();
        };
        const onUp = (e) => {
            const d = stateRef.current.dragging;
            if (d) {
                // toss based on velocity delta
                d.vx = (stateRef.current.mouse.x - d.prevX) * 0.8;
                d.vy = (stateRef.current.mouse.y - d.prevY) * 0.8;
                stateRef.current.dragging = null;
                try { if (e && e.pointerId != null) canvas.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
            }
            stateRef.current.mouse.down = false;
        };

        // Attach pointer listeners. Move/up live on the canvas (with capture) so they
        // continue firing during a drag; { passive: false } lets us preventDefault to
        // stop the page from scrolling under the finger on touch devices.
        canvas.addEventListener("pointerdown", onDown, { passive: false });
        canvas.addEventListener("pointermove", onMove, { passive: false });
        canvas.addEventListener("pointerup", onUp);
        canvas.addEventListener("pointercancel", onUp);
        // Fallback: also catch releases that land outside the canvas
        window.addEventListener("pointerup", onUp);

        // Physics loop
        const step = () => {
            const boxes = stateRef.current.boxes;
            const drag = stateRef.current.dragging;
            const m = stateRef.current.mouse;

            ctx.clearRect(0, 0, ww, hh);

            // grid background
            ctx.strokeStyle = "rgba(30, 136, 229, 0.05)";
            ctx.lineWidth = 1;
            for (let x = 0; x < ww; x += 30) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, hh);
                ctx.stroke();
            }
            for (let y = 0; y < hh; y += 30) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(ww, y);
                ctx.stroke();
            }

            for (let i = 0; i < boxes.length; i++) {
                const b = boxes[i];
                if (b === drag) {
                    b.prevX = b.x + b.dragOffX;
                    b.prevY = b.y + b.dragOffY;
                    b.x = m.x - b.dragOffX;
                    b.y = m.y - b.dragOffY;
                    b.vx = 0;
                    b.vy = 0;
                    b.va *= 0.9;
                } else {
                    // gravity
                    b.vy += 0.5;
                    // friction
                    b.vx *= 0.99;
                    b.va *= 0.98;
                    b.x += b.vx;
                    b.y += b.vy;
                    b.angle += b.va;
                    // floor
                    if (b.y + b.h > hh - 4) {
                        b.y = hh - 4 - b.h;
                        if (b.vy > 4) SFX.thud(mutedRef.current);
                        b.vy *= -0.4;
                        b.vx *= 0.85;
                        if (Math.abs(b.vy) < 1) b.vy = 0;
                    }
                    // walls
                    if (b.x < 0) {
                        b.x = 0;
                        b.vx *= -0.5;
                    }
                    if (b.x + b.w > ww) {
                        b.x = ww - b.w;
                        b.vx *= -0.5;
                    }
                }
                // simple box-box collision (AABB push)
                for (let j = 0; j < boxes.length; j++) {
                    if (i === j) continue;
                    const o = boxes[j];
                    if (
                        b.x < o.x + o.w &&
                        b.x + b.w > o.x &&
                        b.y < o.y + o.h &&
                        b.y + b.h > o.y
                    ) {
                        const overlapX = Math.min(b.x + b.w - o.x, o.x + o.w - b.x);
                        const overlapY = Math.min(b.y + b.h - o.y, o.y + o.h - b.y);
                        if (overlapX < overlapY) {
                            const push = overlapX / 2;
                            if (b.x < o.x) {
                                if (b !== drag) b.x -= push;
                                if (o !== drag) o.x += push;
                            } else {
                                if (b !== drag) b.x += push;
                                if (o !== drag) o.x -= push;
                            }
                            if (b !== drag) b.vx *= -0.3;
                        } else {
                            const push = overlapY / 2;
                            if (b.y < o.y) {
                                if (b !== drag) b.y -= push;
                                if (o !== drag) o.y += push;
                            } else {
                                if (b !== drag) b.y += push;
                                if (o !== drag) o.y -= push;
                            }
                            if (b !== drag) b.vy *= -0.3;
                        }
                    }
                }

                // draw
                ctx.save();
                ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
                ctx.rotate(b.angle);
                // glow
                ctx.shadowColor = b.color;
                ctx.shadowBlur = b === drag ? 20 : 10;
                ctx.strokeStyle = b.color;
                ctx.lineWidth = 1.5;
                ctx.fillStyle = "rgba(10, 10, 12, 0.85)";
                ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
                ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
                ctx.shadowBlur = 0;
                ctx.fillStyle = b.color;
                ctx.font = "12px 'Space Mono', monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(b.label, 0, 0);
                ctx.restore();
            }

            stateRef.current.raf = requestAnimationFrame(step);
        };
        step();

        return () => {
            cancelAnimationFrame(st.raf);
            canvas.removeEventListener("pointerdown", onDown);
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerup", onUp);
            canvas.removeEventListener("pointercancel", onUp);
            window.removeEventListener("pointerup", onUp);
        };
    }, [engaged, isMobile, lang]);

    return (
        <div style={{ marginTop: 48 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                }}
            >
                <div
                    className="mono"
                    style={{
                        fontSize: 11,
                        color: C.textDim,
                        letterSpacing: "0.25em",
                    }}
                >
                    <MixedText dir={dir}>{t("skills.header")}</MixedText>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: physicalEdge(dir, "end"),
                        gap: 6,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => {
                            SFX.engage(muted);
                            setEngaged((v) => !v);
                        }}
                        className={`mono engage-btn${engaged ? " is-live" : ""}`}
                        aria-pressed={engaged}
                        title={engaged ? t("skills.disengage") : t("skills.engageHint")}
                        style={{
                            background: engaged ? "transparent" : C.orange,
                            color: engaged ? C.orange : C.bg,
                            border: `1px solid ${C.orange}`,
                            padding: "10px 18px",
                            fontSize: 10,
                            letterSpacing: "0.2em",
                            cursor: "pointer",
                            fontWeight: 700,
                            boxShadow: engaged ? "none" : `0 0 20px ${C.orange}66`,
                        }}
                    >
                        {engaged ? t("skills.disengage") : t("skills.engage")}
                    </button>
                    {!engaged && (
                        <span
                            className="mono engage-hint engage-hint-arrow"
                            style={{
                                fontSize: 9,
                                color: C.orange,
                                letterSpacing: "0.18em",
                            }}
                        >
                            <MixedText dir={dir}>{t("skills.engageHint")}</MixedText>
                        </span>
                    )}
                </div>
            </div>
            {!engaged ? (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        padding: "20px 16px",
                        border: `1px dashed ${C.borderHot}`,
                        borderRadius: 2,
                        background: `linear-gradient(180deg, ${C.orange}08 0%, transparent 100%)`,
                        position: "relative",
                    }}
                >
                    {SKILLS.map((s, i) => (
                        <span
                            key={s}
                            className="mono"
                            style={{
                                fontSize: 12,
                                padding: "8px 14px",
                                border: `1px solid ${i % 3 === 0 ? C.borderHot : C.border}`,
                                color: i % 3 === 0 ? C.orange : C.cyan,
                                letterSpacing: "0.05em",
                                background: "rgba(0,0,0,0.3)",
                            }}
                        >
                            <LtrSpan block>{s}</LtrSpan>
                        </span>
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        position: "relative",
                        border: `1px solid ${C.orange}`,
                        height: 320,
                        background: "rgba(79, 195, 247, 0.02)",
                        overflow: "hidden",
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        style={{
                            width: "100%",
                            height: "100%",
                            cursor: "grab",
                            display: "block",
                            touchAction: "none",        // critical: stop touch scroll/zoom so drags reach the canvas
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            WebkitTouchCallout: "none",
                        }}
                    />
                    <div
                        className="mono"
                        style={{
                            position: "absolute",
                            top: 10,
                            left: 14,
                            fontSize: 10,
                            color: C.orange,
                            letterSpacing: "0.2em",
                            pointerEvents: "none",
                        }}
                    >
                        <MixedText dir={dir}>
                            {isMobile ? t("skills.gravityMobile") : t("skills.gravityDesktop")}
                        </MixedText>
                    </div>
                </div>
            )}
        </div>
    );
}


// ============================================================================
// COMPONENT: ABOUT & CONTACT
// ============================================================================
function About({ muted, isMobile }) {
    const { t, dir } = useLanguage();
    const identityRows = [
        ["NAME", t("about.fields.NAME")],
        ["STUDIO", t("about.fields.STUDIO")],
        ["ROLE", t("about.fields.ROLE")],
        ["BASED", t("about.fields.BASED")],
        ["YEARS", t("about.fields.YEARS")],
        ["STATUS", t("about.fields.STATUS")],
    ];
    return (
        <section
            id="about"
            style={{
                position: "relative",
                padding: isMobile ? "80px 16px 60px" : "120px 32px 80px",
                maxWidth: 1100,
                margin: "0 auto",
            }}
        >
            <Reveal variant="glitch">
                <SectionHeader number="02" title={t("about.title")} subtitle={t("about.subtitle")} />
            </Reveal>

            <div
                style={{
                    marginTop: isMobile ? 40 : 60,
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "auto 1fr",
                    gap: isMobile ? 24 : 48,
                    alignItems: "start",
                }}
            >
                {/* Left rail: identity card */}
                <Reveal variant="slide-left" delay={100}>
                    <div
                        style={{
                            minWidth: isMobile ? "auto" : 220,
                            border: `1px solid ${C.border}`,
                            padding: "20px 18px",
                            background: "rgba(30, 136, 229, 0.025)",
                            position: "relative",
                        }}
                    >
                        <div
                            className="mono"
                            style={{
                                fontSize: 10,
                                color: C.cyan,
                                letterSpacing: "0.25em",
                                marginBottom: 14,
                            }}
                        >
                            {t("about.identityDat")}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {identityRows.map(([k, v], i) => (
                                <Reveal key={k} variant="fade-up" delay={250 + i * 80}>
                                    <div
                                        className="mono"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            fontSize: 10,
                                            letterSpacing: "0.15em",
                                            borderBottom: `1px dashed ${C.border}`,
                                            paddingBottom: 6,
                                        }}
                                    >
                                        <span style={{ color: C.textDim }}>{t(`about.fieldKeys.${k}`)}</span>
                                        <span style={{
                                            color: k === "STATUS" ? C.warm : (k === "STUDIO" ? C.orange : C.text),
                                            textShadow: k === "STATUS" ? `0 0 8px ${C.warmGlow}66` : "none",
                                            textAlign: "end",
                                        }}>
                                            {k === "STUDIO" || k === "ROLE" || k === "YEARS" || k === "STATUS" ? (
                                                <LtrSpan block>{v}</LtrSpan>
                                            ) : (
                                                <MixedText dir={dir}>{v}</MixedText>
                                            )}
                                        </span>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </Reveal>

                {/* Right: bio */}
                <div>
                    <Reveal variant="slide-right" delay={150}>
                        <div
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: C.cyan,
                                letterSpacing: "0.25em",
                                marginBottom: 16,
                            }}
                        >
              <MixedText dir={dir}>{t("about.bioTxt")}</MixedText>
                        </div>
                        <p
                            style={{
                                fontSize: isMobile ? 15 : 17,
                                lineHeight: 1.75,
                                color: C.text,
                                fontWeight: 300,
                                margin: 0,
                            }}
                        >
                            <MixedText dir={dir}>{t("about.bio1")}</MixedText>
                        </p>
                    </Reveal>
                    <Reveal variant="fade-up" delay={300}>
                        <p
                            style={{
                                fontSize: isMobile ? 14 : 16,
                                lineHeight: 1.75,
                                color: C.textDim,
                                fontWeight: 300,
                                marginTop: 18,
                            }}
                        >
                            <MixedText dir={dir}>{t("about.bio2")}</MixedText>
                        </p>
                    </Reveal>

                    <Reveal variant="scale" delay={350}>
                        <PhysicsSandbox muted={muted} isMobile={isMobile} />
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

// ============================================================================
// COMPONENT: WORKS PORTFOLIO (project case studies)
// ============================================================================
function Works({ onOpen, muted, isMobile }) {
    const { t, lang, dir } = useLanguage();
    const WORKS = getWorks(lang);

    return (
        <section
            id="projects"
            style={{
                position: "relative",
                padding: isMobile ? "80px 16px" : "120px 32px",
                maxWidth: 1400,
                margin: "0 auto",
            }}
        >
            <Reveal variant="glitch">
                <SectionHeader number="04" title={t("works.title")} subtitle={t("works.subtitle")} />
            </Reveal>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
                        gap: isMobile ? 20 : 24,
                        marginTop: isMobile ? 40 : 60,
                        alignItems: "stretch",
                        gridAutoRows: isMobile ? "auto" : "1fr",
                    }}
                >
                {WORKS.map((work, i) => (
                    <Reveal
                        key={work.id}
                        variant={i % 2 === 0 ? "fade-up" : "slide-left"}
                        delay={Math.min(i * 60, 240)}
                        style={{ height: "100%" }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                SFX.open(muted);
                                onOpen(work);
                            }}
                            className="mono"
                            style={{
                                width: "100%",
                                height: isMobile ? "auto" : 420,
                                minHeight: isMobile ? 360 : 420,
                                textAlign: "start",
                                background: "rgba(13, 19, 32, 0.5)",
                                border: `1px solid ${C.border}`,
                                padding: 0,
                                cursor: "pointer",
                                color: C.text,
                                display: "flex",
                                flexDirection: "column",
                                transition: "border-color 0.25s, box-shadow 0.25s, transform 0.25s",
                            }}
                            onMouseEnter={(e) => {
                                SFX.hover(muted);
                                e.currentTarget.style.borderColor = C.borderHot;
                                e.currentTarget.style.boxShadow = `0 0 24px ${C.cyan}22`;
                                e.currentTarget.style.transform = "translateY(-3px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = C.border;
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <div
                                style={{
                                    height: isMobile ? 140 : 160,
                                    flexShrink: 0,
                                    borderBottom: `1px dashed ${C.border}`,
                                    background: work.cover
                                        ? "#0a0e14"
                                        : `linear-gradient(135deg, ${C.brandDark} 0%, rgba(30,136,229,0.06) 100%)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {work.cover ? (
                                    <img
                                        src={work.cover}
                                        alt=""
                                        draggable={false}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            fontSize: 10,
                                            letterSpacing: "0.25em",
                                            color: C.textDim,
                                        }}
                                    >
                                        {t("works.noMedia")}
                                    </div>
                                )}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 10,
                                        left: 10,
                                        fontSize: 9,
                                        color: C.cyan,
                                        letterSpacing: "0.2em",
                                        padding: "4px 8px",
                                        border: `1px solid ${C.border}`,
                                        background: "rgba(10,14,20,0.8)",
                                    }}
                                >
                                    <LtrSpan block>{work.platform}</LtrSpan>
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: isMobile ? "16px 14px" : "20px 18px",
                                    display: "flex",
                                    flexDirection: "column",
                                    flex: 1,
                                    minHeight: 0,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: C.textDim,
                                        letterSpacing: "0.2em",
                                        marginBottom: 8,
                                    }}
                                >
                                    <LtrSpan block>{String(i + 1).padStart(2, "0")}</LtrSpan>
                                </div>
                                <h3
                                    style={{
                                        margin: "0 0 10px",
                                        fontSize: isMobile ? 16 : 18,
                                        fontWeight: 700,
                                        color: C.text,
                                        letterSpacing: "-0.02em",
                                        minHeight: isMobile ? "auto" : "2.4em",
                                        lineHeight: 1.2,
                                    }}
                                >
                                    <MixedText dir={dir}>{work.title}</MixedText>
                                </h3>
                                <p
                                    style={{
                                        margin: "0 0 14px",
                                        fontSize: 13,
                                        lineHeight: 1.55,
                                        color: C.textDim,
                                        fontWeight: 300,
                                        fontFamily: FONT_BODY,
                                        flex: 1,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    }}
                                >
                                    <MixedText dir={dir}>{work.summary}</MixedText>
                                </p>
                                <span
                                    style={{
                                        fontSize: 10,
                                        color: C.orange,
                                        letterSpacing: "0.2em",
                                        marginTop: "auto",
                                    }}
                                >
                                    {t("works.open")}
                                </span>
                            </div>
                        </button>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

// ============================================================================
// COMPONENT: PROJECT DETAIL (full-page work view)
// ============================================================================
function ProjectDetail({ work, onBack, muted, isMobile }) {
    const { t, dir } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
        const onKey = (e) => e.key === "Escape" && onBack();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onBack]);

    if (!work) return null;

    const mediaItems = work.media?.length ? work.media : [];

    return (
        <div
            style={{
                minHeight: "100vh",
                background: C.bg,
                paddingTop: isMobile ? 72 : 88,
                paddingBottom: isMobile ? 48 : 80,
            }}
        >
            <div
                style={{
                    maxWidth: 960,
                    margin: "0 auto",
                    padding: isMobile ? "0 16px" : "0 32px",
                }}
            >
                <button
                    type="button"
                    onClick={() => {
                        SFX.close(muted);
                        onBack();
                    }}
                    className="mono"
                    style={{
                        background: "transparent",
                        border: `1px solid ${C.border}`,
                        color: C.orange,
                        padding: "10px 18px",
                        fontSize: 10,
                        letterSpacing: "0.2em",
                        cursor: "pointer",
                        marginBottom: 32,
                    }}
                >
                    <MixedText dir={dir}>{t("works.back")}</MixedText>
                </button>

                <div
                    className="mono"
                    style={{
                        fontSize: 10,
                        color: C.cyan,
                        letterSpacing: "0.25em",
                        marginBottom: 10,
                    }}
                >
                    <LtrSpan block>{work.platform}</LtrSpan>
                </div>

                <h1
                    className="mono"
                    style={{
                        margin: "0 0 20px",
                        fontSize: isMobile ? 28 : 42,
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        lineHeight: 1.05,
                    }}
                >
                    <MixedText dir={dir}>{work.title}</MixedText>
                </h1>

                <p
                    style={{
                        fontSize: isMobile ? 15 : 17,
                        lineHeight: 1.7,
                        color: C.textDim,
                        fontWeight: 300,
                        margin: "0 0 36px",
                        maxWidth: 720,
                    }}
                >
                    <MixedText dir={dir}>{work.summary}</MixedText>
                </p>

                {mediaItems.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 16,
                        marginBottom: 36,
                    }}
                >
                    {mediaItems.map((item, i) => (
                        <div
                            key={`${item.type}-${i}-${item.src}`}
                            style={{
                                aspectRatio: "16 / 9",
                                border: `1px solid ${C.border}`,
                                background: "#05080c",
                                overflow: "hidden",
                                gridColumn: !isMobile && item.type === "video" ? "1 / -1" : undefined,
                            }}
                        >
                            {item.type === "video" ? (
                                <video
                                    src={item.src}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />
                            ) : (
                                <img
                                    src={item.src}
                                    alt=""
                                    loading="lazy"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />
                            )}
                        </div>
                    ))}
                </div>
                )}

                <p
                    style={{
                        fontSize: 15,
                        lineHeight: 1.75,
                        color: C.text,
                        fontWeight: 300,
                        margin: "0 0 32px",
                    }}
                >
                    <MixedText dir={dir}>{work.body}</MixedText>
                </p>

                <div
                    className="mono"
                    style={{
                        fontSize: 10,
                        color: C.textDim,
                        letterSpacing: "0.2em",
                        marginBottom: 12,
                    }}
                >
                    {t("works.stack")}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: work.github ? 28 : 0 }}>
                    {work.stack.map((s) => (
                        <span
                            key={s}
                            className="mono"
                            style={{
                                fontSize: 11,
                                padding: "6px 12px",
                                border: `1px solid ${C.border}`,
                                color: C.cyan,
                                letterSpacing: "0.1em",
                            }}
                        >
                            <LtrSpan block>{s}</LtrSpan>
                        </span>
                    ))}
                </div>

                {work.github && (
                    <a
                        href={work.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono"
                        onClick={() => SFX.click(muted)}
                        style={{
                            display: "inline-block",
                            background: C.cyan,
                            color: C.bg,
                            border: "none",
                            padding: "12px 24px",
                            fontSize: 11,
                            letterSpacing: "0.2em",
                            fontWeight: 700,
                            textDecoration: "none",
                            cursor: "pointer",
                        }}
                    >
                        {t("works.github")}
                    </a>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// COMPONENT: CONTACT (with pointing avatar)
// ============================================================================
function Contact({ mouseRef, muted, isMobile }) {
    const { t, lang, dir } = useLanguage();
    const CONTACT_LINKS = getContactLinks(lang);
    const pointToward = dir === "rtl" ? "left" : "right";
    const focusContact = useRef(false);
    const pointTarget = useRef(null);
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const linkRefs = useRef([]);

    const onLinkEnter = (idx) => {
        pointTarget.current = { idx, mode: "side" };
        focusContact.current = true;
        setHoveredIdx(idx);
        SFX.hover(muted);
    };
    const onLinkLeave = () => {
        // On mobile, don't clear — the scroll observer keeps the target alive
        if (!isMobile) {
            pointTarget.current = null;
            focusContact.current = false;
            setHoveredIdx(null);
        }
    };

    // Mobile: continuously track which link is most central in viewport,
    // make the avatar point at it (mode: "down")
    useEffect(() => {
        if (!isMobile) return;
        let raf = null;
        const update = () => {
            const center = window.innerHeight * 0.55; // weighted slightly below middle
            let bestIdx = null;
            let bestDist = Infinity;
            for (let i = 0; i < linkRefs.current.length; i++) {
                const el = linkRefs.current[i];
                if (!el) continue;
                const rect = el.getBoundingClientRect();
                const mid = rect.top + rect.height / 2;
                const dist = Math.abs(mid - center);
                // Only consider links currently in (or near) the viewport
                if (rect.bottom > 0 && rect.top < window.innerHeight && dist < bestDist) {
                    bestDist = dist;
                    bestIdx = i;
                }
            }
            if (bestIdx !== null) {
                pointTarget.current = { idx: bestIdx, mode: "side" };
                focusContact.current = true;
                setHoveredIdx(bestIdx);
            } else {
                pointTarget.current = null;
                focusContact.current = false;
                setHoveredIdx(null);
            }
            raf = null;
        };
        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(update);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        update();
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (raf) cancelAnimationFrame(raf);
            pointTarget.current = null;
            focusContact.current = false;
        };
    }, [isMobile]);

    return (
        <section
            id="contact"
            style={{
                position: "relative",
                padding: isMobile ? "80px 16px 60px" : "120px 32px 80px",
                maxWidth: 1400,
                margin: "0 auto",
            }}
        >
            <Reveal variant="glitch">
                <SectionHeader
                    number="05"
                    title={t("contact.title")}
                    subtitle={t("contact.subtitle")}
                />
            </Reveal>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "180px 1fr" : "1fr 1fr",
                    gap: isMobile ? 12 : 60,
                    marginTop: isMobile ? 24 : 60,
                    alignItems: isMobile ? "stretch" : "start",
                }}
            >
                {/* AVATAR: stretch-to-fill-row on mobile, sticky-sidebar on desktop */}
                <Reveal variant="slide-left" delay={150} style={isMobile ? { height: "100%", display: "flex", flexDirection: "column" } : {}}>
                    <div
                        style={{
                            position: isMobile ? "relative" : "sticky",
                            top: isMobile ? "auto" : 100,
                            zIndex: 5,
                            height: isMobile ? "100%" : "auto",
                            display: isMobile ? "flex" : "block",
                            flexDirection: "column",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                border: `1px solid ${C.border}`,
                                background: "linear-gradient(180deg, rgba(30,136,229,0.04), rgba(79,195,247,0.02))",
                                height: isMobile ? "100%" : 620,
                                flex: isMobile ? 1 : "none",
                                minHeight: isMobile ? 400 : "auto",
                                overflow: "hidden",
                                boxShadow: isMobile ? `0 4px 20px rgba(0,0,0,0.5)` : "none",
                            }}
                            className="scanline"
                        >
                            <div
                                className="mono"
                                style={{
                                    position: "absolute",
                                    top: isMobile ? 6 : 14,
                                    left: isMobile ? 6 : 14,
                                    right: isMobile ? 6 : 14,
                                    display: "flex",
                                    justifyContent: isMobile ? "center" : "space-between",
                                    fontSize: isMobile ? 7 : 10,
                                    color: C.cyan,
                                    letterSpacing: isMobile ? "0.15em" : "0.25em",
                                    zIndex: 2,
                                }}
                            >
                                {isMobile ? (
                                    <span>
                                        {hoveredIdx !== null
                                            ? `▸ ${CONTACT_LINKS[hoveredIdx].label}`
                                            : t("contact.active")}
                                    </span>
                                ) : (
                                    <>
                                        <span>{t("contact.subjectActive")}</span>
                                        <span>
                                            {hoveredIdx !== null ? (
                                                <MixedText dir={dir}>
                                                    {`${t("contact.aimLock")}: ${CONTACT_LINKS[hoveredIdx].label}`}
                                                </MixedText>
                                            ) : (
                                                t("contact.eyeTrack")
                                            )}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div
                                className="mono"
                                style={{
                                    position: "absolute",
                                    bottom: isMobile ? 6 : 14,
                                    left: isMobile ? 6 : 14,
                                    right: isMobile ? 6 : 14,
                                    display: "flex",
                                    justifyContent: isMobile ? "center" : "space-between",
                                    fontSize: isMobile ? 7 : 10,
                                    color: C.textDim,
                                    letterSpacing: "0.2em",
                                    zIndex: 2,
                                }}
                            >
                                {isMobile ? (
                                    <span>NA.v3</span>
                                ) : (
                                    <>
                                        <span>NA_AVATAR.glb</span>
                                        <span>RIG: 12_BONES</span>
                                    </>
                                )}
                            </div>
                            <Avatar
                                mouseRef={mouseRef}
                                focusContact={focusContact}
                                pointTarget={pointTarget}
                                isMobile={isMobile}
                                pointToward={pointToward}
                            />
                        </div>
                    </div>
                </Reveal>

                {/* RIGHT: Contact links */}
                <Reveal variant="slide-right" delay={200}>
                    <div>
                        <div
                            className="mono"
                            style={{
                                fontSize: 11,
                                color: C.cyan,
                                letterSpacing: "0.25em",
                                marginBottom: 6,
                            }}
                        >
            {t("contact.channelsList")}
                        </div>
                        <p
                            style={{
                                fontSize: isMobile ? 13 : 14,
                                color: C.textDim,
                                fontWeight: 300,
                                margin: "0 0 24px 0",
                                lineHeight: 1.6,
                            }}
                        >
                            <MixedText dir={dir}>{t("contact.desc")}</MixedText>
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 12 }}>
                            {CONTACT_LINKS.map((c, idx) => {
                                const isHover = hoveredIdx === idx;
                                return (
                                    <Reveal key={c.id} variant="fade-up" delay={300 + idx * 90}>
                                        <a
                                            ref={(el) => (linkRefs.current[idx] = el)}
                                            href={c.href}
                                            target={
                                                c.href.startsWith("mailto") || c.href.startsWith("tel")
                                                    ? "_self"
                                                    : "_blank"
                                            }
                                            rel="noopener noreferrer"
                                            onMouseEnter={() => onLinkEnter(idx)}
                                            onMouseLeave={onLinkLeave}
                                            onFocus={() => onLinkEnter(idx)}
                                            onBlur={onLinkLeave}
                                            onClick={() => SFX.click(muted)}
                                            style={{
                                                position: "relative",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 16,
                                                padding: isMobile ? "12px 10px" : "20px 22px",
                                                border: `1px solid ${isHover ? c.color : C.border}`,
                                                background: isHover
                                                    ? `linear-gradient(${dir === "rtl" ? "270deg" : "90deg"}, ${c.color}22, transparent)`
                                                    : "rgba(0, 0, 0, 0.25)",
                                                textDecoration: "none",
                                                color: C.text,
                                                transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                                                transform: isHover
                                                    ? `translateX(${dir === "rtl" ? -8 : 8}px)`
                                                    : "translateX(0)",
                                                boxShadow: isHover ? `0 0 30px ${c.color}33` : "none",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {/* glow line on left when hovered */}
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    [physicalEdge("left", dir)]: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: 3,
                                                    background: c.color,
                                                    boxShadow: `0 0 12px ${c.color}`,
                                                    transform: isHover ? "scaleY(1)" : "scaleY(0)",
                                                    transition: "transform 0.25s",
                                                }}
                                            />
                                            {/* icon */}
                                            <div
                                                className="mono"
                                                style={{
                                                    width: isMobile ? 32 : 44,
                                                    height: isMobile ? 32 : 44,
                                                    minWidth: isMobile ? 32 : 44,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: `1px solid ${isHover ? c.color : C.border}`,
                                                    color: isHover ? c.color : C.textDim,
                                                    fontSize: c.icon.length > 1 ? (isMobile ? 11 : 14) : (isMobile ? 16 : 20),
                                                    fontWeight: 700,
                                                    transition: "all 0.25s",
                                                    textShadow: isHover ? `0 0 12px ${c.color}` : "none",
                                                }}
                                            >
                                                {c.icon}
                                            </div>
                                            {/* label + handle */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    className="mono"
                                                    style={{
                                                        fontSize: isMobile ? 8 : 10,
                                                        letterSpacing: isMobile ? "0.15em" : "0.25em",
                                                        color: isHover ? c.color : C.textDim,
                                                        marginBottom: 3,
                                                        transition: "color 0.25s",
                                                    }}
                                                >
                                                    <IndexedSlash
                                                        left={String(idx + 1).padStart(2, "0")}
                                                        right={c.label}
                                                        dir={dir}
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: isMobile ? 11 : 16,
                                                        fontWeight: 400,
                                                        color: C.text,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    <LtrSpan>{c.handle}</LtrSpan>
                                                </div>
                                            </div>
                                            {/* arrow */}
                                            <div
                                                className="mono"
                                                style={{
                                                    fontSize: 14,
                                                    color: isHover ? c.color : C.textDim,
                                                    transition: "all 0.25s",
                                                    transform: isHover
                                                        ? `translateX(${mirrorTranslateX(4, dir)}px)`
                                                        : "translateX(0)",
                                                }}
                                            >
                                                ↗
                                            </div>
                                        </a>
                                    </Reveal>
                                );
                            })}
                        </div>

                        <div
                            className="mono"
                            style={{
                                marginTop: 28,
                                fontSize: 10,
                                color: C.textDim,
                                letterSpacing: "0.2em",
                                padding: "12px 14px",
                                border: `1px dashed ${C.border}`,
                                lineHeight: 1.6,
                            }}
                        >
                            <MixedText dir={dir}>{t("contact.responseInfo")}</MixedText>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// ============================================================================
// COMPONENT: ARCADE MINI-GAME (lightweight space shooter on canvas)
// ============================================================================
function Arcade({ onClose, muted, isMobile, embedded = false }) {
    const { t } = useLanguage();
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameOver, setGameOver] = useState(false);
    const [started, setStarted] = useState(false);
    const [runId, setRunId] = useState(0); // bumps on restart to force loop re-init
    // Explosion reveal: "idle" → "ripping" → "boom" → "done"
    const [explosionPhase, setExplosionPhase] = useState("idle");
    const sectionRef = useRef(null);
    const explosionCanvasRef = useRef(null);
    const explosionFiredRef = useRef(false);
    const mutedRef = useRef(muted);
    useEffect(() => { mutedRef.current = muted; }, [muted]);
    const gameOverRef = useRef(false);
    useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
    const isMobileRef = useRef(isMobile);
    useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);
    const stateRef = useRef({
        ship: { x: 0, y: 0, vx: 0 },
        bullets: [],
        enemies: [],
        stars: [],
        particles: [],   // explosion debris
        rings: [],        // shockwave rings
        floaters: [],     // floating "+pts" / combo text
        keys: {},
        score: 0,
        lastShot: 0,
        shake: 0,         // screen-shake magnitude (decays each frame)
        flash: 0,         // white flash-bang alpha (decays)
        combo: 0,         // current kill streak
        comboTimer: 0,    // frames remaining before combo resets
        raf: null,
    });
    const close = useCallback(() => {
        SFX.close(muted);
        if (onClose) onClose();
    }, [muted, onClose]);
    const restart = useCallback(() => {
        SFX.open(muted);
        gameOverRef.current = false;
        setScore(0);
        setCombo(0);
        setTimeLeft(60);
        setGameOver(false);
        setStarted(true);
        setRunId((r) => r + 1);
        const s = stateRef.current;
        s.bullets = [];
        s.enemies = [];
        s.particles = [];
        s.rings = [];
        s.floaters = [];
        s.score = 0;
        s.lastShot = 0;
        s.shake = 0;
        s.flash = 0;
        s.combo = 0;
        s.comboTimer = 0;
    }, [muted]);

    // === SCROLL-TRIGGERED EXPLOSION REVEAL ===
    // When the arcade section enters the viewport sufficiently, fire a multi-stage
    // dramatic reveal: "ripping" pre-tension → "boom" particle explosion + flash + shake → "done"
    useEffect(() => {
        if (!embedded) return;
        const el = sectionRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !explosionFiredRef.current) {
                    explosionFiredRef.current = true;
                    // Stage 1: pre-tension (200ms) — a tearing rumble
                    setExplosionPhase("ripping");
                    SFX.glitch(mutedRef.current);
                    setTimeout(() => SFX.glitch(mutedRef.current), 80);
                    setTimeout(() => SFX.glitch(mutedRef.current), 160);
                    // Stage 2: BOOM
                    setTimeout(() => {
                        setExplosionPhase("boom");
                        SFX.explode(mutedRef.current);
                        SFX.shoot(mutedRef.current);
                        // Stage 3: settle and start game
                        setTimeout(() => {
                            setExplosionPhase("done");
                            setStarted(true);
                            setRunId((r) => r + 1);
                        }, 900);
                    }, 220);
                }
            },
            { threshold: 0.35 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [embedded]);

    // === PARTICLE EXPLOSION ANIMATION (canvas overlay) ===
    useEffect(() => {
        if (explosionPhase !== "boom") return;
        const canvas = explosionCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const W = (canvas.width = canvas.clientWidth);
        const H = (canvas.height = canvas.clientHeight);
        const cx = W / 2;
        const cy = H / 2;
        // Spawn particles
        const particles = [];
        const N = isMobile ? 80 : 160;
        const colors = [C.cyan, C.orange, "#a5d8ff", "#ffffff"];
        for (let i = 0; i < N; i++) {
            const a = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 18;
            particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(a) * speed,
                vy: Math.sin(a) * speed,
                life: 1,
                size: 2 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
        // Add a shock ring
        let ringR = 0;
        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            // shock ring
            ringR += 22;
            ctx.strokeStyle = `rgba(30, 136, 229, ${Math.max(0, 1 - ringR / 500)})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(79, 195, 247, ${Math.max(0, 1 - ringR / 600)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, ringR * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            // particles
            let alive = 0;
            for (const p of particles) {
                if (p.life <= 0) continue;
                alive++;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.15; // mild gravity
                p.vx *= 0.985;
                p.vy *= 0.985;
                p.life -= 0.018;
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 12;
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            }
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            if (alive > 0 || ringR < 600) {
                raf = requestAnimationFrame(draw);
            }
        };
        draw();
        return () => {
            if (raf) cancelAnimationFrame(raf);
        };
    }, [explosionPhase, isMobile]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Responsive, crisp canvas sized to its actual on-screen box and the device.
        // The game's logical coordinate space (W×H, in CSS px) tracks the real display
        // size so nothing is stretched or clipped, and it re-fits on resize/rotate.
        let W = 0;
        let H = 0;
        const sizeCanvas = () => {
            const mob = isMobileRef.current;
            const cssW =
                canvas.clientWidth || (mob ? 360 : 640);
            // Mobile: taller portrait field, capped to leave room for HUD + controls.
            // Desktop: classic 16:10-ish landscape arena.
            const cssH = mob
                ? Math.min(Math.round(cssW * 1.15), Math.round(window.innerHeight * 0.46))
                : Math.round(cssW * 0.58);
            canvas.style.height = cssH + "px";
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(cssW * dpr);
            canvas.height = Math.round(cssH * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px, render at device resolution
            W = cssW;
            H = cssH;
            // keep the ship docked at the bottom and inside the new bounds
            stateRef.current.ship.y = H - 40;
            stateRef.current.ship.x = Math.min(
                Math.max(stateRef.current.ship.x || W / 2, 20),
                W - 20
            );
        };
        sizeCanvas();

        let ro = null;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(() => sizeCanvas());
            ro.observe(canvas);
        }
        window.addEventListener("resize", sizeCanvas);
        window.addEventListener("orientationchange", sizeCanvas);

        stateRef.current.ship.x = W / 2;
        stateRef.current.ship.y = H - 40;
        const game = stateRef.current; // stable ref captured for cleanup

        // starfield
        if (stateRef.current.stars.length === 0) {
            for (let i = 0; i < 60; i++) {
                stateRef.current.stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vy: 0.5 + Math.random() * 1.5,
                });
            }
        }

        const onKey = (e, down) => {
            stateRef.current.keys[e.key] = down;
            if (down && e.key === " ") e.preventDefault();
        };
        const kd = (e) => onKey(e, true);
        const ku = (e) => onKey(e, false);
        window.addEventListener("keydown", kd);
        window.addEventListener("keyup", ku);

        let spawnTimer = 0;
        let frame = 0;
        // In embedded mode, gameplay is gated by `started`. Modal mode is always live.
        const isActive = () => (!embedded || started) && !gameOverRef.current;

        // --- effect helpers -----------------------------------------------------
        const burst = (x, y, baseColor, n, power) => {
            const palette = [baseColor, C.cyan, C.orange, "#ffffff", "#ffd58a"];
            for (let i = 0; i < n; i++) {
                const a = Math.random() * Math.PI * 2;
                const sp = power * (0.3 + Math.random());
                stateRef.current.particles.push({
                    x, y,
                    vx: Math.cos(a) * sp,
                    vy: Math.sin(a) * sp,
                    life: 1,
                    decay: 0.02 + Math.random() * 0.03,
                    size: 1.5 + Math.random() * 3.5,
                    color: palette[(Math.random() * palette.length) | 0],
                });
            }
            stateRef.current.rings.push({ x, y, r: 4, max: 30 + power * 4, life: 1 });
        };
        const floater = (x, y, text, color) => {
            stateRef.current.floaters.push({ x, y, text, color, life: 1, vy: -0.8 });
        };

        const loop = () => {
            const s = stateRef.current;
            frame++;

            // screen shake — translate everything by a decaying random offset
            const shakeX = s.shake ? (Math.random() - 0.5) * s.shake : 0;
            const shakeY = s.shake ? (Math.random() - 0.5) * s.shake : 0;
            s.shake *= 0.86;
            if (s.shake < 0.3) s.shake = 0;

            ctx.save();
            ctx.translate(shakeX, shakeY);

            // bg
            ctx.fillStyle = "#05050a";
            ctx.fillRect(-20, -20, W + 40, H + 40);

            // stars — streak longer when the screen is shaking (speed-lines feel)
            const streak = 1 + s.shake * 0.4;
            s.stars.forEach((st) => {
                st.y += st.vy * streak;
                if (st.y > H) {
                    st.y = 0;
                    st.x = Math.random() * W;
                }
                ctx.fillStyle = `rgba(255,255,255,${0.3 + st.vy * 0.2})`;
                ctx.fillRect(st.x, st.y, 1.5, 1.5 * streak);
            });

            if (isActive()) {
                // combo decay
                if (s.comboTimer > 0) {
                    s.comboTimer--;
                    if (s.comboTimer === 0 && s.combo !== 0) { s.combo = 0; setCombo(0); }
                }

                // input
                if (s.keys["ArrowLeft"] || s.keys["a"]) s.ship.vx -= 0.6;
                if (s.keys["ArrowRight"] || s.keys["d"]) s.ship.vx += 0.6;
                s.ship.vx *= 0.85;
                s.ship.x += s.ship.vx;
                s.ship.x = Math.max(20, Math.min(W - 20, s.ship.x));

                // shoot — fire rate ramps and spread widens as combo climbs
                const now = Date.now();
                const fireGap = s.combo >= 12 ? 110 : s.combo >= 6 ? 140 : 180;
                if (s.keys[" "] && now - s.lastShot > fireGap) {
                    const spread = s.combo >= 12 ? 3 : s.combo >= 6 ? 2 : 1;
                    for (let g = 0; g < spread; g++) {
                        const off = spread === 1 ? 0 : (g - (spread - 1) / 2) * 2.2;
                        s.bullets.push({ x: s.ship.x, y: s.ship.y - 12, vy: -8, vx: off });
                    }
                    s.lastShot = now;
                    // muzzle flash
                    burst(s.ship.x, s.ship.y - 14, C.cyan, 4, 3);
                    SFX.shoot(mutedRef.current);
                }

                // spawn enemies — faster over time, with variety
                spawnTimer++;
                const spawnGap = Math.max(16, 40 - Math.floor(frame / 240) * 4);
                if (spawnTimer > spawnGap) {
                    spawnTimer = 0;
                    const roll = Math.random();
                    let type = "grunt";
                    if (roll > 0.92) type = "tank";
                    else if (roll > 0.7) type = "fast";
                    const cfg =
                        type === "tank" ? { hp: 3, vy: 0.8, r: 16, color: "#ff3366", pts: 30 }
                            : type === "fast" ? { hp: 1, vy: 3.2 + Math.random(), r: 8, color: C.cyan, pts: 20 }
                                : { hp: 1, vy: 1 + Math.random() * 1.5, r: 11, color: C.warm, pts: 10 };
                    s.enemies.push({
                        x: 20 + Math.random() * (W - 40),
                        y: -20,
                        vy: cfg.vy,
                        hp: cfg.hp,
                        maxHp: cfg.hp,
                        r: cfg.r,
                        color: cfg.color,
                        pts: cfg.pts,
                        type,
                        spin: Math.random() * Math.PI,
                    });
                }

                // bullets
                s.bullets = s.bullets.filter((b) => b.y > -20 && b.x > -10 && b.x < W + 10);
                s.bullets.forEach((b) => {
                    b.y += b.vy;
                    b.x += b.vx || 0;
                    // glowing tracer with tail
                    ctx.fillStyle = C.cyan;
                    ctx.shadowColor = C.cyan;
                    ctx.shadowBlur = 10;
                    ctx.fillRect(b.x - 1.5, b.y, 3, 12);
                    ctx.globalAlpha = 0.4;
                    ctx.fillRect(b.x - 1, b.y + 10, 2, 8);
                    ctx.globalAlpha = 1;
                    ctx.shadowBlur = 0;
                });

                // enemies
                s.enemies = s.enemies.filter((e) => e.y < H + 20 && e.hp > 0);
                s.enemies.forEach((en) => {
                    en.y += en.vy;
                    en.spin += 0.05;
                    // hit check
                    s.bullets.forEach((b, bi) => {
                        if (Math.abs(b.x - en.x) < en.r + 2 && Math.abs(b.y - en.y) < en.r + 2) {
                            en.hp -= 1;
                            s.bullets.splice(bi, 1);
                            if (en.hp > 0) {
                                // small spark on non-lethal hit
                                burst(b.x, b.y, en.color, 6, 4);
                                s.shake = Math.max(s.shake, 3);
                            } else {
                                // KILL — big payoff
                                s.combo += 1;
                                s.comboTimer = 120;
                                setCombo(s.combo);
                                const mult = 1 + Math.floor(s.combo / 5);
                                const gain = en.pts * mult;
                                s.score += gain;
                                setScore(s.score);
                                const big = en.type === "tank";
                                burst(en.x, en.y, en.color, big ? 46 : 26, big ? 14 : 9);
                                floater(en.x, en.y, "+" + gain, mult > 1 ? C.orange : C.cyan);
                                if (mult > 1) floater(en.x, en.y - 16, "x" + mult + " COMBO", "#ffd58a");
                                s.shake = Math.max(s.shake, big ? 16 : 9);
                                s.flash = Math.max(s.flash, big ? 0.5 : 0.22);
                                SFX.explode(mutedRef.current);
                            }
                        }
                    });
                    // draw enemy (diamond, sized by type, color shifts toward white when damaged)
                    const dmg = 1 - en.hp / en.maxHp;
                    ctx.save();
                    ctx.translate(en.x, en.y);
                    ctx.rotate(en.type === "fast" ? en.spin : 0);
                    ctx.fillStyle = dmg > 0 ? "#ffffff" : en.color;
                    ctx.shadowColor = en.color;
                    ctx.shadowBlur = 14;
                    ctx.beginPath();
                    ctx.moveTo(0, -en.r);
                    ctx.lineTo(en.r, 0);
                    ctx.lineTo(0, en.r);
                    ctx.lineTo(-en.r, 0);
                    ctx.closePath();
                    ctx.fill();
                    if (en.type === "tank") {
                        ctx.strokeStyle = "#ffffff";
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                    ctx.restore();
                    ctx.shadowBlur = 0;
                });

                // draw ship
                ctx.fillStyle = C.cyan;
                ctx.shadowColor = C.cyan;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.moveTo(s.ship.x, s.ship.y - 14);
                ctx.lineTo(s.ship.x + 12, s.ship.y + 10);
                ctx.lineTo(s.ship.x + 4, s.ship.y + 6);
                ctx.lineTo(s.ship.x - 4, s.ship.y + 6);
                ctx.lineTo(s.ship.x - 12, s.ship.y + 10);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                // thruster (flares with movement)
                const thrust = 4 + Math.random() * 6 + Math.abs(s.ship.vx) * 1.5;
                ctx.fillStyle = C.warm;
                ctx.shadowColor = C.orange;
                ctx.shadowBlur = 10;
                ctx.fillRect(s.ship.x - 3, s.ship.y + 6, 6, thrust);
                ctx.shadowBlur = 0;
            }

            // --- particles (always update/draw so death blasts finish) ---
            s.particles = s.particles.filter((p) => p.life > 0);
            s.particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96;
                p.vy = p.vy * 0.96 + 0.05; // slight gravity
                p.life -= p.decay;
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            });
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            // --- shockwave rings ---
            s.rings = s.rings.filter((r) => r.life > 0);
            s.rings.forEach((r) => {
                r.r += (r.max - r.r) * 0.18;
                r.life -= 0.06;
                ctx.globalAlpha = Math.max(0, r.life) * 0.7;
                ctx.strokeStyle = C.orange;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
                ctx.stroke();
            });
            ctx.globalAlpha = 1;

            // --- floating score text ---
            s.floaters = s.floaters.filter((f) => f.life > 0);
            s.floaters.forEach((f) => {
                f.y += f.vy;
                f.life -= 0.022;
                ctx.globalAlpha = Math.max(0, f.life);
                ctx.fillStyle = f.color;
                ctx.font = "bold 14px " + FONT_DISPLAY;
                ctx.textAlign = "center";
                ctx.fillText(f.text, f.x, f.y);
            });
            ctx.globalAlpha = 1;
            ctx.textAlign = "left";

            ctx.restore(); // end shake transform

            // --- flash-bang overlay (drawn un-shaken, full canvas) ---
            if (s.flash > 0.01) {
                ctx.fillStyle = `rgba(255,255,255,${s.flash})`;
                ctx.fillRect(0, 0, W, H);
                s.flash *= 0.8;
            }

            stateRef.current.raf = requestAnimationFrame(loop);
        };
        loop();

        let timer = null;
        if (isActive()) {
            timer = setInterval(() => {
                setTimeLeft((t) => {
                    if (t <= 1) {
                        clearInterval(timer);
                        gameOverRef.current = true;   // stop scoring on the very same frame the clock hits 0
                        setGameOver(true);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }

        return () => {
            cancelAnimationFrame(game.raf);
            window.removeEventListener("keydown", kd);
            window.removeEventListener("keyup", ku);
            window.removeEventListener("resize", sizeCanvas);
            window.removeEventListener("orientationchange", sizeCanvas);
            if (ro) ro.disconnect();
            if (timer) clearInterval(timer);
        };
    }, [embedded, started, runId]);

    // Use refs to read in render JSX
    const stateRefForJSX = stateRef;

    if (embedded) {
        const shaking = explosionPhase === "boom";
        const ripping = explosionPhase === "ripping";
        const hidden = explosionPhase === "idle";
        return (
            <section
                id="arcade"
                ref={sectionRef}
                style={{
                    position: "relative",
                    padding: isMobile ? "80px 16px 40px" : "120px 32px 60px",
                    maxWidth: 1100,
                    margin: "0 auto",
                    minHeight: isMobile ? 520 : 680,
                    overflow: "hidden",
                }}
            >
                {/* PHASE 1: pre-boom warning glyph rendered while idle (subtle hint of incoming) */}
                {hidden && (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            fontFamily: FONT_DISPLAY,
                            fontSize: 12,
                            color: C.textDim,
                            letterSpacing: "0.4em",
                            opacity: 0.5,
                            pointerEvents: "none",
                        }}
                    >
                        {t("arcade.incoming")}
                    </div>
                )}

                {/* PHASE 2: ripping/glitch overlay (the "tearing fabric" moment) */}
                {ripping && (
                    <>
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: `repeating-linear-gradient(
                  90deg,
                  transparent 0,
                  ${C.cyan}22 2px,
                  transparent 4px,
                  ${C.orange}33 6px,
                  transparent 8px
                )`,
                                animation: "explosion-rip 0.22s steps(3) infinite",
                                zIndex: 50,
                                pointerEvents: "none",
                                mixBlendMode: "screen",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontFamily: FONT_DISPLAY,
                                fontSize: isMobile ? 24 : 40,
                                color: C.cyan,
                                fontWeight: 700,
                                letterSpacing: "0.3em",
                                animation: "rgb-split 0.1s steps(2) infinite",
                                zIndex: 51,
                                pointerEvents: "none",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {t("arcade.breach")}
                        </div>
                    </>
                )}

                {/* PHASE 3: BOOM — flash + particles + shake (shake applied to inner content below) */}
                {(explosionPhase === "boom" || explosionPhase === "done") && (
                    <canvas
                        ref={explosionCanvasRef}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: 60,
                            pointerEvents: "none",
                            opacity: shaking ? 1 : 0,
                            transition: "opacity 0.6s",
                        }}
                    />
                )}
                {shaking && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "white",
                            zIndex: 70,
                            pointerEvents: "none",
                            animation: "flash-bang 0.8s ease-out forwards",
                        }}
                    />
                )}

                {/* HEADER + GAME CONTENT (shaken during boom) */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        opacity: hidden ? 0 : 1,
                        transform: hidden ? "scale(0.96)" : "scale(1)",
                        transition: "opacity 0.5s, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        animation: shaking ? "explosion-shake 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97)" : "none",
                    }}
                >
                    <Reveal variant="glitch">
                        <SectionHeader
                            number="06"
                            title={t("arcade.title")}
                            subtitle={t("arcade.subtitle")}
                        />
                    </Reveal>

                    <div
                        style={{
                            marginTop: isMobile ? 24 : 40,
                            padding: isMobile ? 16 : 24,
                            background: C.bg2,
                            border: `1px solid ${C.warm}`,
                            boxShadow: `0 0 60px ${C.warm}33, inset 0 0 30px ${C.warm}11`,
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                                fontFamily: FONT_DISPLAY,
                                fontSize: 12,
                                flexWrap: "wrap",
                                gap: 8,
                                ...GAME_CONTROLS_LTR,
                            }}
                        >
                            <span style={{ color: C.cyan }}>
                                {t("arcade.score")}: {score.toString().padStart(5, "0")}
                            </span>
                            {combo >= 2 && (
                                <span
                                    className="mono"
                                    style={{
                                        fontSize: 12,
                                        color: C.orange,
                                        letterSpacing: "0.15em",
                                        textShadow: `0 0 12px ${C.orange}`,
                                        animation: "pulse-cyan 0.4s infinite",
                                    }}
                                >
                                    ⚡ x{1 + Math.floor(combo / 5)} {t("arcade.combo")} ({combo})
                                </span>
                            )}
                            <span
                                style={{
                                    color: timeLeft <= 10 ? "#ff3366" : C.warm,
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    textShadow: timeLeft <= 10 ? "0 0 10px #ff3366" : "none",
                                    animation: timeLeft <= 10 ? "pulse-cyan 0.6s infinite" : "none",
                                }}
                            >
                                ⏱ {t("arcade.time")}: {timeLeft.toString().padStart(2, "0")}
                            </span>
                        </div>
                        {/* time progress bar */}
                        <div
                            style={{
                                height: 4,
                                background: "rgba(255,255,255,0.08)",
                                marginBottom: 12,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${(timeLeft / 60) * 100}%`,
                                    background: timeLeft <= 10 ? "#ff3366" : C.warm,
                                    boxShadow: `0 0 10px ${timeLeft <= 10 ? "#ff3366" : C.warm}`,
                                    transition: "width 1s linear, background 0.3s",
                                }}
                            />
                        </div>
                        <div style={{ position: "relative" }}>
                            <canvas
                                ref={canvasRef}
                                width={isMobile ? 360 : 640}
                                height={isMobile ? 260 : 400}
                                style={{
                                    width: "100%",
                                    border: `1px solid ${C.border}`,
                                    display: "block",
                                    background: "#05050a",
                                    touchAction: "none",
                                }}
                            />
                            {gameOver && (
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "rgba(0,0,0,0.88)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: C.cyan,
                                        fontFamily: FONT_DISPLAY,
                                    }}
                                >
                                    <div style={{ fontSize: isMobile ? 22 : 28, marginBottom: 12 }}>
                                        {t("arcade.gameOver")}
                                    </div>
                                    <div style={{ fontSize: 16, color: C.orange, marginBottom: 24 }}>
                                        {t("arcade.final")}: {score}
                                    </div>
                                    <button
                                        onClick={restart}
                                        className="mono"
                                        style={{
                                            background: "transparent",
                                            color: C.cyan,
                                            border: `1px solid ${C.cyan}`,
                                            padding: "10px 24px",
                                            fontSize: 11,
                                            letterSpacing: "0.25em",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {t("arcade.playAgain")}
                                    </button>
                                </div>
                            )}
                        </div>
                        {isMobile && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    marginTop: 12,
                                    ...GAME_CONTROLS_LTR,
                                }}
                            >
                                <button
                                    onContextMenu={(e) => e.preventDefault()}
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        stateRefForJSX.current.keys["ArrowLeft"] = true;
                                    }}
                                    onPointerUp={() => {
                                        stateRefForJSX.current.keys["ArrowLeft"] = false;
                                    }}
                                    onPointerLeave={() => {
                                        stateRefForJSX.current.keys["ArrowLeft"] = false;
                                    }}
                                    onPointerCancel={() => {
                                        stateRefForJSX.current.keys["ArrowLeft"] = false;
                                    }}
                                    className="mono gamebtn"
                                    style={{
                                        flex: 1,
                                        padding: 16,
                                        background: "rgba(30,136,229,0.1)",
                                        border: `1px solid ${C.cyan}`,
                                        color: C.cyan,
                                        fontSize: 20,
                                        cursor: "pointer",
                                    }}
                                >
                                    ◀
                                </button>
                                <button
                                    onContextMenu={(e) => e.preventDefault()}
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        stateRefForJSX.current.keys[" "] = true;
                                    }}
                                    onPointerUp={() => {
                                        stateRefForJSX.current.keys[" "] = false;
                                    }}
                                    onPointerLeave={() => {
                                        stateRefForJSX.current.keys[" "] = false;
                                    }}
                                    onPointerCancel={() => {
                                        stateRefForJSX.current.keys[" "] = false;
                                    }}
                                    className="mono gamebtn"
                                    style={{
                                        flex: 1.5,
                                        padding: 16,
                                        background: "rgba(79,195,247,0.15)",
                                        border: `1px solid ${C.orange}`,
                                        color: C.orange,
                                        fontSize: 14,
                                        letterSpacing: "0.2em",
                                        cursor: "pointer",
                                    }}
                                >
                                    ▲ {t("arcade.fire")}
                                </button>
                                <button
                                    onContextMenu={(e) => e.preventDefault()}
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        stateRefForJSX.current.keys["ArrowRight"] = true;
                                    }}
                                    onPointerUp={() => {
                                        stateRefForJSX.current.keys["ArrowRight"] = false;
                                    }}
                                    onPointerLeave={() => {
                                        stateRefForJSX.current.keys["ArrowRight"] = false;
                                    }}
                                    onPointerCancel={() => {
                                        stateRefForJSX.current.keys["ArrowRight"] = false;
                                    }}
                                    className="mono gamebtn"
                                    style={{
                                        flex: 1,
                                        padding: 16,
                                        background: "rgba(30,136,229,0.1)",
                                        border: `1px solid ${C.cyan}`,
                                        color: C.cyan,
                                        fontSize: 20,
                                        cursor: "pointer",
                                    }}
                                >
                                    ▶
                                </button>
                            </div>
                        )}
                        <div
                            className="mono"
                            style={{
                                fontSize: 10,
                                color: C.textDim,
                                marginTop: 12,
                                letterSpacing: "0.2em",
                                textAlign: "center",
                            }}
                        >
                            {isMobile
                                ? t("arcade.controlsMobileLong")
                                : t("arcade.controlsDesktop")}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Original modal mode (kept for backwards compat, not currently used)
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.92)",
                zIndex: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: isMobile ? 8 : 20,
            }}
        >
            <div
                style={{
                    background: C.bg,
                    border: `2px solid ${C.orange}`,
                    padding: isMobile ? 16 : 28,
                    maxWidth: 700,
                    width: "100%",
                    boxShadow: `0 0 80px ${C.orange}55`,
                    position: "relative",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                        gap: 8,
                    }}
                >
                    <div
                        className="mono"
                        style={{ fontSize: isMobile ? 10 : 12, color: C.orange, letterSpacing: "0.2em" }}
                    >
                        ◢ {isMobile ? "ARCADE_v1" : "RETRO_ARCADE_v1.0 — DEEP_SPACE_SHOOTER"}
                    </div>
                    <button
                        onClick={close}
                        style={{
                            background: "transparent",
                            border: `1px solid ${C.orange}`,
                            color: C.orange,
                            width: 32,
                            height: 32,
                            cursor: "pointer",
                            fontFamily: FONT_DISPLAY,
                            flexShrink: 0,
                        }}
                    >
                        ✕
                    </button>
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                        fontFamily: FONT_DISPLAY,
                        fontSize: 12,
                    }}
                >
                    <span style={{ color: C.cyan }}>SCORE: {score.toString().padStart(5, "0")}</span>
                    {combo >= 2 && (
                        <span
                            style={{
                                color: C.orange,
                                letterSpacing: "0.15em",
                                textShadow: `0 0 12px ${C.orange}`,
                                animation: "pulse-cyan 0.4s infinite",
                            }}
                        >
                            ⚡ x{1 + Math.floor(combo / 5)} COMBO ({combo})
                        </span>
                    )}
                    <span
                        style={{
                            color: timeLeft <= 10 ? "#ff3366" : C.orange,
                            fontWeight: 700,
                            textShadow: timeLeft <= 10 ? "0 0 10px #ff3366" : "none",
                            animation: timeLeft <= 10 ? "pulse-cyan 0.6s infinite" : "none",
                        }}
                    >
                        ⏱ TIME: {timeLeft.toString().padStart(2, "0")}
                    </span>
                </div>
                <div
                    style={{
                        height: 4,
                        background: "rgba(255,255,255,0.08)",
                        marginBottom: 12,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            width: `${(timeLeft / 60) * 100}%`,
                            background: timeLeft <= 10 ? "#ff3366" : C.orange,
                            boxShadow: `0 0 10px ${timeLeft <= 10 ? "#ff3366" : C.orange}`,
                            transition: "width 1s linear, background 0.3s",
                        }}
                    />
                </div>
                <div style={{ position: "relative" }}>
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={400}
                        style={{
                            width: "100%",
                            border: `1px solid ${C.border}`,
                            display: "block",
                            background: "#05050a",
                            touchAction: "none",
                        }}
                    />
                    {gameOver && (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0.85)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: C.cyan,
                                fontFamily: FONT_DISPLAY,
                            }}
                        >
                            <div style={{ fontSize: 28, marginBottom: 12 }}>GAME_OVER</div>
                            <div style={{ fontSize: 16, color: C.orange }}>FINAL: {score}</div>
                            <div
                                style={{ fontSize: 11, color: C.textDim, marginTop: 16 }}
                            >
                                Press X to close.
                            </div>
                        </div>
                    )}
                </div>
                {isMobile && !gameOver && (
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            marginTop: 12,
                            justifyContent: "space-between",
                            ...GAME_CONTROLS_LTR,
                        }}
                    >
                        <button
                            onContextMenu={(e) => e.preventDefault()}
                            onPointerDown={(e) => { e.preventDefault(); stateRef.current.keys["ArrowLeft"] = true; }}
                            onPointerUp={() => { stateRef.current.keys["ArrowLeft"] = false; }}
                            onPointerLeave={() => { stateRef.current.keys["ArrowLeft"] = false; }}
                            onPointerCancel={() => { stateRef.current.keys["ArrowLeft"] = false; }}
                            className="mono gamebtn"
                            style={{
                                flex: 1,
                                padding: 16,
                                background: "rgba(30,136,229,0.1)",
                                border: `1px solid ${C.cyan}`,
                                color: C.cyan,
                                fontSize: 20,
                                cursor: "pointer",
                            }}
                        >
                            ◀
                        </button>
                        <button
                            onContextMenu={(e) => e.preventDefault()}
                            onPointerDown={(e) => { e.preventDefault(); stateRef.current.keys[" "] = true; }}
                            onPointerUp={() => { stateRef.current.keys[" "] = false; }}
                            onPointerLeave={() => { stateRef.current.keys[" "] = false; }}
                            onPointerCancel={() => { stateRef.current.keys[" "] = false; }}
                            className="mono gamebtn"
                            style={{
                                flex: 1.5,
                                padding: 16,
                                background: "rgba(79,195,247,0.15)",
                                border: `1px solid ${C.orange}`,
                                color: C.orange,
                                fontSize: 14,
                                letterSpacing: "0.2em",
                                cursor: "pointer",
                            }}
                        >
                            ▲ FIRE
                        </button>
                        <button
                            onContextMenu={(e) => e.preventDefault()}
                            onPointerDown={(e) => { e.preventDefault(); stateRef.current.keys["ArrowRight"] = true; }}
                            onPointerUp={() => { stateRef.current.keys["ArrowRight"] = false; }}
                            onPointerLeave={() => { stateRef.current.keys["ArrowRight"] = false; }}
                            onPointerCancel={() => { stateRef.current.keys["ArrowRight"] = false; }}
                            className="mono gamebtn"
                            style={{
                                flex: 1,
                                padding: 16,
                                background: "rgba(30,136,229,0.1)",
                                border: `1px solid ${C.cyan}`,
                                color: C.cyan,
                                fontSize: 20,
                                cursor: "pointer",
                            }}
                        >
                            ▶
                        </button>
                    </div>
                )}
                <div
                    className="mono"
                    style={{
                        fontSize: 10,
                        color: C.textDim,
                        marginTop: 12,
                        letterSpacing: "0.2em",
                        textAlign: "center",
                    }}
                >
                    {isMobile ? "TAP CONTROLS BELOW  •  60 SECONDS" : "← → MOVE  •  SPACE SHOOT  •  60 SECONDS"}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// COMPONENT: SECTION HEADER (reusable)
// ============================================================================
function SectionHeader({ number, title, subtitle }) {
    const { dir } = useLanguage();
    return (
        <div>
            <div
                className="mono"
                style={{
                    fontSize: 11,
                    color: C.warm,
                    letterSpacing: "0.3em",
                    marginBottom: 8,
                }}
            >
                <MixedText dir={dir}>{subtitle}</MixedText>
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 20,
                    borderBottom: `1px solid ${C.border}`,
                    paddingBottom: 20,
                }}
            >
                <span
                    className="mono"
                    style={{
                        fontSize: 16,
                        color: C.cyan,
                        letterSpacing: "0.2em",
                    }}
                >
                    <SectionNumber number={number} />
                </span>
                <h2
                    className="mono"
                    style={{
                        fontSize: "clamp(28px, 5vw, 56px)",
                        margin: 0,
                        letterSpacing: "-0.03em",
                        color: C.text,
                    }}
                >
                    <MixedText dir={dir}>{title}</MixedText>
                </h2>
            </div>
        </div>
    );
}

// ============================================================================
// COMPONENT: FOOTER
// ============================================================================
function Footer() {
    const { t, dir } = useLanguage();
    return (
        <footer
            style={{
                borderTop: `1px solid ${C.border}`,
                padding: "40px 32px 32px",
                maxWidth: 1400,
                margin: "60px auto 0",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 24,
                }}
            >
                {/* Brand mark */}
                <div style={{ display: "flex", alignItems: "center" }}>
                    <BrandMark
                        logoSize={56}
                        showTagline
                        tagline={t("footer.tagline")}
                    />
                </div>

                {/* Status */}
                <div
                    className="mono"
                    style={{
                        fontSize: 10,
                        color: C.cyan,
                        letterSpacing: "0.25em",
                        animation: "pulse-cyan 2s infinite",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            background: C.cyan,
                            borderRadius: "50%",
                            boxShadow: `0 0 12px ${C.cyan}`,
                            display: "inline-block",
                        }}
                    />
                    <MixedText dir={dir}>{t("footer.endTransmission")}</MixedText>
                </div>
            </div>

            {/* Copyright line */}
            <div
                className="mono"
                style={{
                    fontSize: 10,
                    color: C.textDim,
                    letterSpacing: "0.25em",
                    marginTop: 28,
                    paddingTop: 20,
                    borderTop: `1px dashed ${C.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <LtrSpan>{t("footer.copyright")}</LtrSpan>
                <LtrSpan>{t("footer.builtWith")}</LtrSpan>
            </div>
        </footer>
    );
}

// ============================================================================
// ROOT
// ============================================================================
export default function App() {
    const mouseRef = useMouse();
    const [muted, setMuted] = useState(true);
    const [activeProject, setActiveProject] = useState(null);
    const [activeWork, setActiveWork] = useState(null);
    const isMobile = useIsMobile();

    const openWork = useCallback((work) => {
        setActiveWork(work);
    }, []);

    const closeWork = useCallback(() => {
        setActiveWork(null);
        requestAnimationFrame(() => scrollToId("projects"));
    }, []);

    const handleNavigate = useCallback((id) => {
        if (activeWork) setActiveWork(null);
    }, [activeWork]);

    return (
        <div style={{ background: C.bg, minHeight: "100vh", color: C.text, overflowX: "clip", maxWidth: "100%", width: "100%", position: "relative" }}>
            {/* Fixed full-viewport backdrop — whatever happens at the edges, it is always
          the site color, never the browser's white default. */}
            <div
                aria-hidden="true"
                style={{
                    position: "fixed",
                    top: "-8px",
                    right: "-8px",
                    bottom: "-8px",
                    left: "-8px",
                    background: C.bg,
                    zIndex: -1,
                    pointerEvents: "none",
                }}
            />
            <GlobalStyles />
            <NavBar muted={muted} setMuted={setMuted} isMobile={isMobile} onNavigate={handleNavigate} />
            {activeWork ? (
                <ProjectDetail
                    work={activeWork}
                    onBack={closeWork}
                    muted={muted}
                    isMobile={isMobile}
                />
            ) : (
                <>
                    <Hero mouseRef={mouseRef} isMobile={isMobile} muted={muted} />
                    <About muted={muted} isMobile={isMobile} />
                    <Portfolio onOpen={setActiveProject} muted={muted} isMobile={isMobile} />
                    <Works onOpen={openWork} muted={muted} isMobile={isMobile} />
                    <Contact mouseRef={mouseRef} muted={muted} isMobile={isMobile} />
                    <Arcade embedded muted={muted} isMobile={isMobile} />
                    <Footer />
                </>
            )}
            <ProjectModal
                project={activeProject}
                onClose={() => setActiveProject(null)}
                muted={muted}
                isMobile={isMobile}
            />
        </div>
    );
}