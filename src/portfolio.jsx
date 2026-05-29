import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

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

const FONT_DISPLAY = "'Space Mono', ui-monospace, monospace";
const FONT_BODY = "'IBM Plex Sans', system-ui, sans-serif";

// NA Interactive logo, embedded as base64 PNG (transparent bg)
const LOGO_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAFACAYAAADNkKWqAABFfElEQVR42u3deZxcVZUH8N+5976q6iWdhGzsm6wBZEmQTeg0qKAgytKNIJsoCaIjCCKoSHUhjriMiKhjAiqbLN0gCIoCSqdBQDCBsAfZDYRANpJ0uqvq3XvO/HFfdZoRlaULAjnf+eTjRwZCfNXv1F3OAiillFJKKaWUUkoppZRSSimllFJKKbXGoWKx6PQxKKWUUkq9m1d0b+Dvky8XL1xrTBMduNguu/q8U08dqP11fYxKqXcj83r+pmJRCAC22XTcRhuuv/avth2/wSYA0N7ebvQRKqXe6ytAAMAskYQffHBTv9Iu3H33bZeICBGRrgCVUkoppd7TRMSICOmTUEoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppepBSJ+BUmpNpkFQKbUGrv9EHACgWDT6NJRSa4T29nZrCDj6lF/MOOakn34SAFqLRadPRim1JoRAaw0wqeN/r9r2U5cMXPfAgu0AoKury+qzUerf0+3Su13rRAoMzHt52UOPLjKFc773+ytk2bIxHR0dXNTt8DssXkyJCBWLop+FUvX4Ekss8PFTr765sOu53NT6ffnwFy69XkQMWosOorfDSukK8D2MCMiBmwRVGmBXfuBF+sRR59x0NnpLftK0GXoe+DbIOYPGHKEhMWhILBoTCxGhhsRARAoismFtNahPa/WhL8d7BAsCmwY05nPJkj5J/zJ3xTfO+XXPs2d+uu2iYk+PK7W1eX1K9VA0hBIfdPkzXf8ITdsHv4xBYggWe1z2LG1/0d95tyteyG01Onk5IexKZESfmQZANZwEMPlmI64RLIQEA27e8yv5qt8t+vFPLv/drC+2tc1p7+qy3R0dQR9WfbZRjyyUzR6hEVu4KpCzBAIg7CFGMFBoRrmyqN8SkIrGP90Cq2GXClXI5oCQgqp9VMAreOLp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";

// ============================================================================
// FONT INJECTION + GLOBAL STYLES
// ============================================================================
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; }
      body { margin: 0; background: ${C.bg}; color: ${C.text}; font-family: ${FONT_BODY}; -webkit-font-smoothing: antialiased; }
      ::selection { background: ${C.cyan}; color: ${C.bg}; }
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
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);
  return null;
}

// ============================================================================
// COMPONENT: NA INTERACTIVE LOGO
// ============================================================================
// Uses the actual brand PNG embedded as a data URL (transparent, square, centered).
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
      aria-label="NA Interactive"
    >
      <img
        src={LOGO_DATA_URL}
        alt="NA Interactive"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          filter: "brightness(1.4) saturate(1.2) contrast(1.05)",
        }}
        draggable={false}
      />
    </div>
  );
}

// ============================================================================
// GLOBAL MOUSE TRACKING (shared by avatar + particles)
// ============================================================================
function useMouse() {
  const mouse = useRef({ x: 0, y: 0, nx: 0, ny: 0, lastMove: Date.now() });
  useEffect(() => {
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
  } catch (e) {}
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
  } catch (e) {}
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
// HOOK: Scroll progress (0..1 of element's journey through viewport)
// ============================================================================
function useScrollProgress() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when element top is at bottom of viewport, 1 when element bottom is at top
      const total = rect.height + vh;
      const p = (vh - rect.top) / total;
      setProgress(Math.max(0, Math.min(1, p)));
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
    };
  }, []);
  return [ref, progress];
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
// HOOK: Detect low-end device for adaptive quality
// ============================================================================
function useIsLowEnd() {
  return (
    typeof navigator !== "undefined" &&
    (navigator.hardwareConcurrency <= 4 ||
      /Mobi|Android/i.test(navigator.userAgent))
  );
}

// ============================================================================
// COMPONENT: NAV BAR
// ============================================================================
function NavBar({ muted, setMuted, isMobile }) {
  const links = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Experience", id: "experience" },
    { label: "Contact", id: "contact" },
    { label: "Arcade", id: "arcade" },
  ];
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (id) => {
    SFX.click(muted);
    scrollToId(id);
    setMenuOpen(false);
  };

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
      }}
    >
      <button
        onClick={() => handleNavClick("home")}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
        }}
        aria-label="NA Interactive — Home"
      >
        <Logo size={isMobile ? 56 : 72} />
      </button>

      {!isMobile && (
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {links.map((l) => (
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
          ))}
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
            {muted ? "◌ AUDIO_OFF" : "◉ AUDIO_ON"}
          </button>
        </div>
      )}

      {isMobile && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                borderLeft: `2px solid ${C.cyan}`,
                color: C.text,
                fontSize: 13,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "14px 16px",
                cursor: "pointer",
                textAlign: "left",
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
  }, [mouseRef]);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />;
}

// ============================================================================
// COMPONENT: HERO SECTION
// ============================================================================
function Hero({ mouseRef, isMobile }) {
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
          direction: "ltr",
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
          [ SYS_INIT // CONNECTION_ESTABLISHED ]
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
        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {["UNITY DEVELOPER", "XR ENGINEER", "AI INTEGRATION"].map((t, i) => (
            <div
              key={t}
              className="mono"
              style={{
                fontSize: 12,
                color: C.textDim,
                letterSpacing: "0.25em",
                padding: "8px 16px",
                border: `1px solid ${C.border}`,
                background: "rgba(30,136,229,0.03)",
              }}
            >
              <span style={{ color: C.cyan }}>0{i + 1}.</span> {t}
            </div>
          ))}
        </div>
        <div
          className="mono"
          style={{
            marginTop: 60,
            fontSize: 10,
            color: C.textDim,
            letterSpacing: "0.3em",
          }}
        >
          ↓ SCROLL_TO_CONTINUE ↓
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// COMPONENT: HOLOGRAPHIC PROJECT PREVIEW (Three.js)
// Different procedural asset per project
// ============================================================================
function ProjectHologram({ kind, isMobile }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0x444466, 0.6));
    const k = new THREE.DirectionalLight(0x1e88e5, 1.2);
    k.position.set(2, 3, 4);
    scene.add(k);
    const r = new THREE.PointLight(0x4fc3f7, 1, 10);
    r.position.set(-2, -1, 2);
    scene.add(r);

    const group = new THREE.Group();
    scene.add(group);

    // Build different assets per kind
    const matCyan = new THREE.MeshStandardMaterial({
      color: 0x1e88e5,
      emissive: 0x003344,
      metalness: 0.7,
      roughness: 0.3,
      wireframe: false,
    });
    const matWire = new THREE.MeshBasicMaterial({
      color: 0x1e88e5,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const matOrange = new THREE.MeshStandardMaterial({
      color: 0x4fc3f7,
      emissive: 0x330011,
      metalness: 0.6,
      roughness: 0.4,
    });
    const matDark = new THREE.MeshStandardMaterial({
      color: 0x1a1a22,
      metalness: 0.8,
      roughness: 0.3,
    });

    if (kind === "console") {
      // Game console: rounded box with screen + buttons
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 0.35), matDark);
      group.add(body);
      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 0.05), matCyan);
      screen.position.z = 0.18;
      group.add(screen);
      // d-pad
      const dpad = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.06), matOrange);
      dpad.position.set(-0.85, 0, 0.2);
      group.add(dpad);
      const dpad2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.06), matOrange);
      dpad2.position.set(-0.85, 0, 0.2);
      group.add(dpad2);
      // buttons
      [-0.1, 0.1].forEach((dx) => {
        [-0.1, 0.1].forEach((dy) => {
          const b = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12),
            matCyan
          );
          b.rotation.x = Math.PI / 2;
          b.position.set(0.85 + dx, dy, 0.2);
          group.add(b);
        });
      });
      // wireframe overlay
      const wf = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.4, 0.4), matWire);
      group.add(wf);
    } else if (kind === "vest") {
      // Haptic vest: torso shape
      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 2.2, 0.6),
        matDark
      );
      group.add(torso);
      // shoulder cuts
      const cut1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.7),
        new THREE.MeshBasicMaterial({ color: 0x0a0a0c })
      );
      cut1.position.set(-1.15, 0.85, 0);
      group.add(cut1);
      const cut2 = cut1.clone();
      cut2.position.x = 1.15;
      group.add(cut2);
      // haptic nodes (glowing dots in grid)
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            j % 2 === 0 ? matCyan : matOrange
          );
          dot.position.set(-0.65 + j * 0.43, 0.8 - i * 0.4, 0.31);
          group.add(dot);
        }
      }
      // wireframe
      const wf = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 2.3, 0.7),
        matWire
      );
      group.add(wf);
    } else if (kind === "vr") {
      // Retro VR headset
      const main = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.9), matDark);
      group.add(main);
      // lens covers
      const lens1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.15, 24),
        matCyan
      );
      lens1.rotation.x = Math.PI / 2;
      lens1.position.set(-0.55, 0, 0.5);
      group.add(lens1);
      const lens2 = lens1.clone();
      lens2.position.x = 0.55;
      group.add(lens2);
      // strap
      const strap = new THREE.Mesh(
        new THREE.TorusGeometry(0.9, 0.08, 8, 24, Math.PI),
        matOrange
      );
      strap.rotation.z = Math.PI / 2;
      strap.position.set(0, 0, -0.3);
      group.add(strap);
      // antenna
      const ant = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8),
        matOrange
      );
      ant.position.set(0, 0.85, 0);
      group.add(ant);
      const antBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        matCyan
      );
      antBall.position.set(0, 1.15, 0);
      group.add(antBall);
      // wireframe
      const wf = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.3, 1), matWire);
      group.add(wf);
    }

    // Floor grid (hologram base)
    const gridGeom = new THREE.PlaneGeometry(6, 6, 12, 12);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x1e88e5,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const grid = new THREE.Mesh(gridGeom, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -1.5;
    scene.add(grid);

    let raf;
    let t = 0;
    const animate = () => {
      t += 0.01;
      group.rotation.y = t;
      group.position.y = Math.sin(t * 1.5) * 0.1;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      mount.removeChild(renderer.domElement);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      renderer.dispose();
    };
  }, [kind, isMobile]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

// ============================================================================
// COMPONENT: PORTFOLIO SECTION
// ============================================================================
const PROJECTS = [
  {
    id: "links",
    org: "Links AI",
    role: "Senior Unity Developer",
    year: "2024 — 2026",
    summary:
      "Lead developer on a real-time multiplayer mobile arcade title. Built core gameplay loops, object-pooling architecture, and AI-driven NPC behaviour using state machines + utility theory.",
    stack: ["Unity", "C#", "Mirror", "Addressables", "Burst"],
    kind: "console",
  },
  {
    id: "plectrum",
    org: "Plectrum LTD",
    role: "XR & Haptics Engineer",
    year: "2023 — 2024",
    summary:
      "Designed haptic feedback patterns for a wearable vest paired with VR experiences. Tuned latency-sensitive bluetooth pipelines and authored a Unity SDK consumed by 6 partner studios.",
    stack: ["Unity XR", "OpenXR", "BLE", "Shader Graph", "DOTS"],
    kind: "vest",
  },
  {
    id: "idf",
    org: "IDF Intelligence Corps",
    role: "Simulation Lead",
    year: "2020 — 2023",
    summary:
      "Built classified training simulators for analysts using Unity + custom VR rigs. Shipped a deployable course platform now used across multiple training cohorts; led a team of four.",
    stack: ["Unity", "VR", "Networking", "Hebrew RTL UI"],
    kind: "vr",
  },
];

function Portfolio({ onOpen, muted, isMobile }) {
  const [hovered, setHovered] = useState(null);

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
        <SectionHeader number="03" title="EXPERIENCE" subtitle="// FIELD_DEPLOYMENTS" />
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
            <Reveal key={p.id} variant="fade-up" delay={i * 120}>
              <div
                onMouseEnter={() => {
                  if (!isMobile) {
                    setHovered(p.id);
                    SFX.glitch(muted);
                  }
                }}
                onMouseLeave={() => !isMobile && setHovered(null)}
                onClick={() => {
                  SFX.open(muted);
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
                  paddingLeft: hovered === p.id ? 24 : 0,
                }}
              >
              <div
                style={{
                  position: "absolute",
                  left: 0,
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
                    0{i + 1} / {p.year}
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
                    {p.org}
                  </h3>
                  <div
                    style={{
                      fontSize: 14,
                      color: C.textDim,
                      marginTop: 6,
                      fontWeight: 300,
                    }}
                  >
                    {p.role}
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
                  [ VIEW ↗ ]
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
                    TAP_TO_INSPECT
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
            <span>◉ HOLO_PROJECTOR</span>
            <span style={{ color: hovered ? C.orange : C.textDim }}>
              {hovered ? "● LIVE" : "○ STANDBY"}
            </span>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            {hovered ? (
              <ProjectHologram kind={PROJECTS.find((p) => p.id === hovered).kind} isMobile={isMobile} />
            ) : (
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
                }}
              >
                <div
                  className="mono"
                  style={{ fontSize: 12, letterSpacing: "0.2em", marginBottom: 12 }}
                >
                  AWAITING_TARGET
                </div>
                <div style={{ fontSize: 13, fontWeight: 300, maxWidth: 240 }}>
                  Hover a project to project a 3D asset preview into this chamber.
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
function ProjectModal({ project, onClose, muted }) {
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
          {project.year}
        </div>
        <h2
          className="mono"
          style={{
            margin: 0,
            fontSize: 36,
            letterSpacing: "-0.02em",
          }}
        >
          {project.org}
        </h2>
        <div
          style={{
            color: C.orange,
            fontSize: 14,
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {project.role}
        </div>
        <p
          style={{
            color: C.textDim,
            lineHeight: 1.7,
            marginTop: 24,
            fontWeight: 300,
          }}
        >
          {project.summary}
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
          // STACK
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
              {s}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button
            className="mono"
            style={{
              background: C.cyan,
              color: C.bg,
              border: "none",
              padding: "12px 24px",
              fontSize: 11,
              letterSpacing: "0.2em",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ▶ WATCH_DEMO
          </button>
          <button
            className="mono"
            style={{
              background: "transparent",
              color: C.text,
              border: `1px solid ${C.border}`,
              padding: "12px 24px",
              fontSize: 11,
              letterSpacing: "0.2em",
              cursor: "pointer",
            }}
          >
            ⎇ GITHUB ↗
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: PHYSICS SKILLS SANDBOX
// ============================================================================
const SKILLS = [
  "Unity",
  "C#",
  "Three.js",
  "WebXR",
  "Shaders",
  "OpenXR",
  "Networking",
  "DOTS",
  "Blender",
  "Git",
  "Performance",
  "AI/ML",
];

function PhysicsSandbox({ muted, isMobile }) {
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
    const W = (canvas.width = canvas.clientWidth * window.devicePixelRatio);
    const H = (canvas.height = canvas.clientHeight * window.devicePixelRatio);
    const dpr = window.devicePixelRatio;
    ctx.scale(dpr, dpr);
    const ww = canvas.clientWidth;
    const hh = canvas.clientHeight;

    // Initialize boxes
    stateRef.current.boxes = SKILLS.map((s, i) => {
      const w = 60 + s.length * 7;
      const h = 38;
      return {
        label: s,
        x: 20 + (i % 6) * (w + 12),
        y: 20 + Math.floor(i / 6) * 50,
        w,
        h,
        vx: (Math.random() - 0.5) * 2,
        vy: 0,
        angle: 0,
        va: (Math.random() - 0.5) * 0.05,
        color: i % 3 === 0 ? C.orange : C.cyan,
      };
    });

    const onDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      stateRef.current.mouse.x = mx;
      stateRef.current.mouse.y = my;
      stateRef.current.mouse.down = true;
      // Find topmost box under mouse
      for (let i = stateRef.current.boxes.length - 1; i >= 0; i--) {
        const b = stateRef.current.boxes[i];
        if (mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h) {
          stateRef.current.dragging = b;
          b.dragOffX = mx - b.x;
          b.dragOffY = my - b.y;
          b.prevX = mx;
          b.prevY = my;
          break;
        }
      }
    };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouse.x = e.clientX - rect.left;
      stateRef.current.mouse.y = e.clientY - rect.top;
    };
    const onUp = () => {
      const d = stateRef.current.dragging;
      if (d) {
        // toss based on velocity delta
        d.vx = (stateRef.current.mouse.x - d.prevX) * 0.8;
        d.vy = (stateRef.current.mouse.y - d.prevY) * 0.8;
        stateRef.current.dragging = null;
      }
      stateRef.current.mouse.down = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
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
      cancelAnimationFrame(stateRef.current.raf);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [engaged]);

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
          // SKILLSET.array[ ]
        </div>
        <button
          onClick={() => {
            SFX.engage(muted);
            setEngaged((v) => !v);
          }}
          className="mono"
          style={{
            background: engaged ? "transparent" : C.orange,
            color: engaged ? C.orange : C.bg,
            border: `1px solid ${C.orange}`,
            padding: "8px 16px",
            fontSize: 10,
            letterSpacing: "0.2em",
            cursor: "pointer",
            fontWeight: 700,
            boxShadow: engaged ? "none" : `0 0 20px ${C.orange}66`,
          }}
        >
          {engaged ? "◌ DISENGAGE" : "⚡ ENGAGE_PHYSICS_ENGINE"}
        </button>
      </div>
      {!engaged ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            padding: "20px 0",
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
              {s}
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
            ▼ GRAVITY: 9.8 | DRAG: ENABLED | CLICK + TOSS
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT: 3D AVATAR (Procedural low-poly character with VR headset)
// ============================================================================
function Avatar({ mouseRef, focusContact, pointTarget, isMobile }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    // For narrow mobile aspects, widen FOV and pull back further so the arm is visible
    const fov = isMobile ? 60 : 48;
    const camZ = isMobile ? 7.5 : 6;
    const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 100);
    camera.position.set(0, 1.3, camZ);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    // Lighting — moody, cyberpunk
    scene.add(new THREE.AmbientLight(0x222244, 0.4));
    const key = new THREE.DirectionalLight(0x1e88e5, 1.3);
    key.position.set(2, 3, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x4fc3f7, 0.9);
    rim.position.set(-2, 2, -2);
    scene.add(rim);
    const fill = new THREE.PointLight(0xffffff, 0.3, 8);
    fill.position.set(0, 1.5, 2);
    scene.add(fill);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd9b591,
      roughness: 0.7,
      metalness: 0.1,
      flatShading: true,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x2a1f1a,
      roughness: 0.9,
      flatShading: true,
    });
    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a22,
      roughness: 0.5,
      metalness: 0.4,
      flatShading: true,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x1e88e5,
      emissive: 0x1e88e5,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    const accentOrange = new THREE.MeshStandardMaterial({
      color: 0x4fc3f7,
      emissive: 0x4fc3f7,
      emissiveIntensity: 0.6,
      roughness: 0.4,
    });
    const headsetMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0c,
      roughness: 0.3,
      metalness: 0.7,
      flatShading: true,
    });

    // Root group
    const root = new THREE.Group();
    root.position.y = 0;
    scene.add(root);

    // === TORSO ===
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1;
    root.add(torsoGroup);

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.0, 0.5),
      jacketMat
    );
    torsoGroup.add(torso);

    // collar accent
    const collar = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.08, 0.52),
      accentMat
    );
    collar.position.y = 0.45;
    torsoGroup.add(collar);

    // chest light
    const chestLight = new THREE.Mesh(
      new THREE.CircleGeometry(0.06, 16),
      accentOrange
    );
    chestLight.position.set(0.18, 0.1, 0.251);
    torsoGroup.add(chestLight);

    // === HEAD GROUP (rotated by mouse) ===
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.6, 0); // sits on torso
    torsoGroup.add(headGroup);

    // neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.15, 0.18, 8),
      skinMat
    );
    neck.position.y = -0.05;
    headGroup.add(neck);

    // head (boxy, low poly)
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.55, 0.5),
      skinMat
    );
    head.position.y = 0.25;
    headGroup.add(head);

    // hair (slab on top)
    const hair = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.18, 0.52),
      hairMat
    );
    hair.position.y = 0.5;
    headGroup.add(hair);
    // hair side tufts
    const tuft1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.5), hairMat);
    tuft1.position.set(-0.255, 0.36, 0);
    headGroup.add(tuft1);
    const tuft2 = tuft1.clone();
    tuft2.position.x = 0.255;
    headGroup.add(tuft2);

    // === VR HEADSET ===
    const headset = new THREE.Group();
    headset.position.set(0, 0.25, 0);
    headGroup.add(headset);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.25, 0.2),
      headsetMat
    );
    visor.position.set(0, 0.04, 0.2);
    headset.add(visor);

    // glowing lens screens
    const lens1 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.16),
      accentMat
    );
    lens1.position.set(-0.13, 0.04, 0.301);
    headset.add(lens1);
    const lens2 = lens1.clone();
    lens2.position.x = 0.13;
    headset.add(lens2);

    // headset strap
    const strap = new THREE.Mesh(
      new THREE.TorusGeometry(0.27, 0.025, 6, 16),
      headsetMat
    );
    strap.rotation.x = Math.PI / 2;
    strap.position.set(0, 0.05, 0.05);
    strap.scale.set(1, 1, 0.85);
    headset.add(strap);

    // antenna / sensor
    const antBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.06),
      headsetMat
    );
    antBase.position.set(0.2, 0.2, 0.25);
    headset.add(antBase);
    const antLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 12, 12),
      accentOrange
    );
    antLight.position.set(0.2, 0.27, 0.25);
    headset.add(antLight);

    // === LEFT ARM (with shoulder, elbow joints) ===
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.45, 0.4, 0);
    torsoGroup.add(leftShoulder);
    const leftUpperArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.45, 0.18),
      jacketMat
    );
    leftUpperArm.position.y = -0.225;
    leftShoulder.add(leftUpperArm);
    const leftElbow = new THREE.Group();
    leftElbow.position.y = -0.45;
    leftShoulder.add(leftElbow);
    const leftForearm = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.42, 0.15),
      jacketMat
    );
    leftForearm.position.y = -0.21;
    leftElbow.add(leftForearm);
    const leftHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.16, 0.1),
      skinMat
    );
    leftHand.position.y = -0.45;
    leftElbow.add(leftHand);

    // === RIGHT ARM (this is the one that points/gestures) ===
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.45, 0.4, 0);
    torsoGroup.add(rightShoulder);
    const rightUpperArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.45, 0.18),
      jacketMat
    );
    rightUpperArm.position.y = -0.225;
    rightShoulder.add(rightUpperArm);
    const rightElbow = new THREE.Group();
    rightElbow.position.y = -0.45;
    rightShoulder.add(rightElbow);
    const rightForearm = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.42, 0.15),
      jacketMat
    );
    rightForearm.position.y = -0.21;
    rightElbow.add(rightForearm);
    const rightHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.16, 0.1),
      skinMat
    );
    rightHand.position.y = -0.45;
    rightElbow.add(rightHand);
    // pointing finger
    const finger = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.1, 0.04),
      skinMat
    );
    finger.position.set(0, -0.13, 0.06);
    rightHand.add(finger);

    // initial arm rotations (resting at sides)
    leftShoulder.rotation.z = 0.05;
    rightShoulder.rotation.z = -0.05;

    // === PLATFORM / PEDESTAL ===
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.9, 0.08, 16),
      new THREE.MeshStandardMaterial({
        color: 0x1a1a22,
        metalness: 0.8,
        roughness: 0.4,
      })
    );
    pedestal.position.y = 0.04;
    root.add(pedestal);

    // glowing ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.015, 8, 32),
      accentMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.1;
    root.add(ring);

    // particles around character
    const partCount = isMobile ? 40 : 80;
    const partPos = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 0.5;
      partPos[i * 3] = Math.cos(a) * r;
      partPos[i * 3 + 1] = Math.random() * 2.5;
      partPos[i * 3 + 2] = Math.sin(a) * r;
    }
    const partGeom = new THREE.BufferGeometry();
    partGeom.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x1e88e5,
      size: 0.025,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(partGeom, partMat);
    root.add(particles);

    stateRef.current = {
      headGroup,
      rightShoulder,
      rightElbow,
      leftShoulder,
      leftElbow,
      torsoGroup,
      ring,
      particles,
      antLight,
      lens1,
      lens2,
    };

    let raf;
    let t = 0;
    const animate = () => {
      t += 0.016;
      const idleTime = (Date.now() - mouseRef.current.lastMove) / 1000;

      // === HEAD TRACKING ===
      const targetYaw = mouseRef.current.nx * 0.6;
      const targetPitch = -mouseRef.current.ny * 0.35;
      headGroup.rotation.y += (targetYaw - headGroup.rotation.y) * 0.08;
      headGroup.rotation.x += (targetPitch - headGroup.rotation.x) * 0.08;

      // torso slight follow
      torsoGroup.rotation.y +=
        (mouseRef.current.nx * 0.15 - torsoGroup.rotation.y) * 0.05;

      // breathing
      torsoGroup.position.y = 1 + Math.sin(t * 1.5) * 0.015;

      // === GESTURE LOGIC ===
      // pointTarget.current is null, a number (index, side mode), or {idx, mode: "down"}
      // - "side" mode (desktop): arm raises to the right, fan of vertical angles
      // - "down" mode (mobile): arm extends downward forward, head tilts down too
      const ptRaw = pointTarget && pointTarget.current;
      let ptIdx = null;
      let ptMode = "side";
      if (ptRaw !== null && ptRaw !== undefined) {
        if (typeof ptRaw === "object") {
          ptIdx = ptRaw.idx;
          ptMode = ptRaw.mode || "side";
        } else {
          ptIdx = ptRaw;
        }
      }
      const isPointing = ptIdx !== null;
      const shouldPoint = isPointing || focusContact.current || idleTime > 7;

      // SIDE-mode angles (desktop): arm fans up-to-down on the right side
      const sideAngles = [
        { sz: 2.0, sx: -0.5, ez: -0.15 },  // top button
        { sz: 1.8, sx: -0.4, ez: -0.22 },
        { sz: 1.6, sx: -0.3, ez: -0.28 },  // middle
        { sz: 1.4, sx: -0.2, ez: -0.35 },
        { sz: 1.2, sx: -0.1, ez: -0.42 },  // bottom button
      ];
      // DOWN-mode angles (mobile): arm reaches down-forward toward content below.
      // sz near 0 (arm hangs down), sx negative tilts the whole arm forward toward camera,
      // ez slightly bent so the finger juts out toward the viewer/content
      const downAngles = [
        { sz: 0.3, sx: -1.0, ez: -0.4 },
        { sz: 0.2, sx: -1.1, ez: -0.5 },
        { sz: 0.15, sx: -1.2, ez: -0.55 },
        { sz: 0.1, sx: -1.3, ez: -0.6 },
        { sz: 0.05, sx: -1.4, ez: -0.7 },
      ];

      let target;
      if (isPointing) {
        const angles = ptMode === "down" ? downAngles : sideAngles;
        const idx = Math.max(0, Math.min(angles.length - 1, ptIdx));
        target = angles[idx];
      } else if (shouldPoint) {
        target = ptMode === "down"
          ? { sz: 0.15, sx: -1.2, ez: -0.55 }
          : { sz: 1.6, sx: -0.3, ez: -0.3 };
      } else {
        target = { sz: 0.05, sx: 0, ez: 0 }; // arm at side
      }

      // Faster damping when actively pointing at a button (snappier UX)
      const damp = isPointing ? 0.12 : 0.06;
      rightShoulder.rotation.z += (target.sz - rightShoulder.rotation.z) * damp;
      rightShoulder.rotation.x += (target.sx - rightShoulder.rotation.x) * damp;
      rightElbow.rotation.z += (target.ez - rightElbow.rotation.z) * damp;

      // === HEAD OVERRIDE for down-pointing mode ===
      // Add a downward pitch on top of the mouse-tracked rotation when pointing down
      if (isPointing && ptMode === "down") {
        // Already-applied mouse-tracked rotation gets blended with a downward look
        const downPitch = 0.6; // radians: tilt head down to look at content
        headGroup.rotation.x += (downPitch - headGroup.rotation.x) * 0.08;
      }

      // === IDLE EASTER EGG: tap headset after 7s idle ===
      if (idleTime > 7 && idleTime < 9 && !focusContact.current && !isPointing) {
        // tap headset gesture - bend right arm up to head (positive Z brings arm up & right)
        rightShoulder.rotation.z +=
          (2.6 - rightShoulder.rotation.z) * 0.08;
        rightElbow.rotation.z += (-1.8 - rightElbow.rotation.z) * 0.08;
        rightElbow.rotation.y +=
          (Math.sin(t * 8) * 0.3 - rightElbow.rotation.y) * 0.1;
      } else {
        rightElbow.rotation.y += (0 - rightElbow.rotation.y) * 0.05;
      }

      // === Ambient details ===
      ring.rotation.z = t * 0.5;
      particles.rotation.y = t * 0.2;
      // particle drift up
      const ppos = particles.geometry.attributes.position.array;
      for (let i = 0; i < partCount; i++) {
        ppos[i * 3 + 1] += 0.008;
        if (ppos[i * 3 + 1] > 2.5) ppos[i * 3 + 1] = 0;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // antenna light pulse
      antLight.material.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.4;
      // lens flicker on engagement
      const lensI = (focusContact.current || isPointing) ? 1.2 : 0.7 + Math.sin(t * 4) * 0.1;
      lens1.material.emissiveIntensity = lensI;
      lens2.material.emissiveIntensity = lensI;

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
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [mouseRef, focusContact, pointTarget, isMobile]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

// ============================================================================
// COMPONENT: ABOUT & CONTACT
// ============================================================================
function About({ muted, isMobile }) {
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
        <SectionHeader number="02" title="ABOUT" subtitle="// OPERATOR_DOSSIER" />
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
              ◉ IDENTITY.dat
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["NAME", "NOAM AMRAM"],
                ["STUDIO", "NA INTERACTIVE"],
                ["ROLE", "UNITY / XR DEV"],
                ["BASED", "TEL AVIV, IL"],
                ["YEARS", "07_ACTIVE"],
                ["STATUS", "OPEN_TO_WORK"],
              ].map(([k, v], i) => (
                <Reveal key={k} variant="fade-up" delay={250 + i * 80}>
                  <div
                    className="mono"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      borderBottom: `1px dashed ${C.border}`,
                      paddingBottom: 6,
                    }}
                  >
                    <span style={{ color: C.textDim }}>{k}</span>
                    <span style={{
                      color: k === "STATUS" ? C.warm : (k === "STUDIO" ? C.orange : C.text),
                      textShadow: k === "STATUS" ? `0 0 8px ${C.warmGlow}66` : "none",
                    }}>
                      {v}
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
              // BIO.txt
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
              Unity & XR developer with seven years across military simulation,
              consumer mobile, and wearable haptics. I architect systems that
              survive contact with production — object pooling, deterministic
              netcode, performance budgets that hold at 60 FPS on five-year-old
              phones.
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
              Lead three engineers at Links AI. Previously ran a four-person sim
              team in IDF Intelligence Corps. I care about training pipelines, AI
              integration, and the boring parts of XR that make demos feel like
              products.
            </p>
          </Reveal>

          <Reveal variant="scale" delay={400}>
            <PhysicsSandbox muted={muted} isMobile={isMobile} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// COMPONENT: CONTACT (with pointing avatar)
// ============================================================================
const CONTACT_LINKS = [
  {
    id: "whatsapp",
    label: "WHATSAPP",
    handle: "+972 50-000-0000",
    href: "https://wa.me/972500000000",
    icon: "✺",
    color: "#25D366",
  },
  {
    id: "linkedin",
    label: "LINKEDIN",
    handle: "/in/noamamram",
    href: "https://linkedin.com/in/noamamram",
    icon: "in",
    color: "#0A66C2",
  },
  {
    id: "email",
    label: "EMAIL",
    handle: "noam@amram.dev",
    href: "mailto:noam@amram.dev",
    icon: "✉",
    color: "#4fc3f7",
  },
  {
    id: "phone",
    label: "PHONE",
    handle: "+972 50-000-0000",
    href: "tel:+972500000000",
    icon: "☎",
    color: "#ff6b35",
  },
  {
    id: "github",
    label: "GITHUB",
    handle: "/noamamram",
    href: "https://github.com/noamamram",
    icon: "◈",
    color: C.text,
  },
];

function Contact({ mouseRef, muted, isMobile }) {
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
          number="04"
          title="CONTACT"
          subtitle="// OPEN_A_CHANNEL"
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
                    : "◉ ACTIVE"}
                </span>
              ) : (
                <>
                  <span>◉ SUBJECT_ACTIVE</span>
                  <span>
                    {hoveredIdx !== null
                      ? `AIM_LOCK: ${CONTACT_LINKS[hoveredIdx].label}`
                      : "EYE_TRACK: ON"}
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
                  <span>NA_AVATAR.v3</span>
                  <span>RIG: 12_BONES</span>
                </>
              )}
            </div>
            <Avatar
              mouseRef={mouseRef}
              focusContact={focusContact}
              pointTarget={pointTarget}
              isMobile={isMobile}
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
            // CHANNELS.list
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
            Hover an entry — the operator will point you to the right channel.
            Pick whichever you prefer.
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
                      ? `linear-gradient(90deg, ${c.color}22, transparent)`
                      : "rgba(0, 0, 0, 0.25)",
                    textDecoration: "none",
                    color: C.text,
                    transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    transform: isHover ? "translateX(8px)" : "translateX(0)",
                    boxShadow: isHover ? `0 0 30px ${c.color}33` : "none",
                    overflow: "hidden",
                  }}
                >
                  {/* glow line on left when hovered */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
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
                      0{idx + 1} / {c.label}
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
                      {c.handle}
                    </div>
                  </div>
                  {/* arrow */}
                  <div
                    className="mono"
                    style={{
                      fontSize: 14,
                      color: isHover ? c.color : C.textDim,
                      transition: "all 0.25s",
                      transform: isHover ? "translateX(4px)" : "translateX(0)",
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
            ⓘ AVG_RESPONSE_TIME: 4_HOURS // TIMEZONE: GMT+3 // PREF: WHATSAPP
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}

function Input({ label, value, onChange, multiline }) {
  const [focused, setFocused] = useState(false);
  const props = {
    value,
    onChange: (e) => onChange(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: "100%",
      background: "rgba(30, 136, 229, 0.03)",
      border: `1px solid ${focused ? C.cyan : C.border}`,
      color: C.text,
      padding: "14px 16px",
      fontSize: 14,
      fontFamily: FONT_BODY,
      fontWeight: 300,
      outline: "none",
      transition: "all 0.2s",
      boxShadow: focused ? `0 0 20px ${C.cyan}33` : "none",
      resize: multiline ? "vertical" : "none",
      minHeight: multiline ? 120 : "auto",
    },
  };
  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 10,
          color: focused ? C.cyan : C.textDim,
          letterSpacing: "0.25em",
          marginBottom: 6,
          transition: "color 0.2s",
        }}
      >
        {focused ? "▸ " : "  "}
        {label}
      </div>
      {multiline ? <textarea {...props} /> : <input {...props} />}
    </div>
  );
}

// ============================================================================
// COMPONENT: ARCADE MINI-GAME (lightweight space shooter on canvas)
// ============================================================================
function Arcade({ onClose, muted, isMobile, embedded = false }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
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
  const stateRef = useRef({
    ship: { x: 0, y: 0, vx: 0 },
    bullets: [],
    enemies: [],
    stars: [],
    keys: {},
    score: 0,
    lastShot: 0,
    raf: null,
  });
  const close = useCallback(() => {
    SFX.close(muted);
    if (onClose) onClose();
  }, [muted, onClose]);
  const restart = useCallback(() => {
    SFX.open(muted);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setStarted(true);
    setRunId((r) => r + 1);
    const s = stateRef.current;
    s.bullets = [];
    s.enemies = [];
    s.score = 0;
    s.lastShot = 0;
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
    const W = canvas.width;
    const H = canvas.height;

    stateRef.current.ship.x = W / 2;
    stateRef.current.ship.y = H - 40;

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
    // In embedded mode, gameplay is gated by `started`. Modal mode is always live.
    const isActive = () => !embedded || started;

    const loop = () => {
      const s = stateRef.current;
      // bg
      ctx.fillStyle = "#05050a";
      ctx.fillRect(0, 0, W, H);

      // stars (always animate, even when waiting to start — gives ambient feel)
      s.stars.forEach((st) => {
        st.y += st.vy;
        if (st.y > H) {
          st.y = 0;
          st.x = Math.random() * W;
        }
        ctx.fillStyle = `rgba(255,255,255,${0.3 + st.vy * 0.2})`;
        ctx.fillRect(st.x, st.y, 1.5, 1.5);
      });

      if (isActive()) {
        // input
        if (s.keys["ArrowLeft"] || s.keys["a"]) s.ship.vx -= 0.6;
        if (s.keys["ArrowRight"] || s.keys["d"]) s.ship.vx += 0.6;
        s.ship.vx *= 0.85;
        s.ship.x += s.ship.vx;
        s.ship.x = Math.max(20, Math.min(W - 20, s.ship.x));

        // shoot
        const now = Date.now();
        if (s.keys[" "] && now - s.lastShot > 180) {
          s.bullets.push({ x: s.ship.x, y: s.ship.y - 12, vy: -8 });
          s.lastShot = now;
          SFX.shoot(mutedRef.current);
        }

        // spawn enemies
        spawnTimer++;
        if (spawnTimer > 40) {
          spawnTimer = 0;
          s.enemies.push({
            x: 20 + Math.random() * (W - 40),
            y: -20,
            vy: 1 + Math.random() * 1.5,
            hp: 1,
          });
        }

        // bullets
        s.bullets = s.bullets.filter((b) => b.y > -20);
        s.bullets.forEach((b) => {
          b.y += b.vy;
          ctx.fillStyle = C.cyan;
          ctx.shadowColor = C.cyan;
          ctx.shadowBlur = 8;
          ctx.fillRect(b.x - 1.5, b.y, 3, 10);
          ctx.shadowBlur = 0;
        });

        // enemies
        s.enemies = s.enemies.filter((e) => e.y < H + 20 && e.hp > 0);
        s.enemies.forEach((en) => {
          en.y += en.vy;
          // hit check
          s.bullets.forEach((b, bi) => {
            if (Math.abs(b.x - en.x) < 12 && Math.abs(b.y - en.y) < 12) {
              en.hp = 0;
              s.bullets.splice(bi, 1);
              s.score += 10;
              setScore(s.score);
              SFX.explode(mutedRef.current);
            }
          });
          ctx.fillStyle = C.warm;
          ctx.shadowColor = C.warm;
          ctx.shadowBlur = 12;
          // diamond enemy
          ctx.beginPath();
          ctx.moveTo(en.x, en.y - 10);
          ctx.lineTo(en.x + 10, en.y);
          ctx.lineTo(en.x, en.y + 10);
          ctx.lineTo(en.x - 10, en.y);
          ctx.closePath();
          ctx.fill();
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
        // thruster
        ctx.fillStyle = C.warm;
        ctx.fillRect(s.ship.x - 3, s.ship.y + 6, 6, 4 + Math.random() * 6);
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
            setGameOver(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
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
            ░░░ INCOMING_TRANSMISSION ░░░
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
              !! BREACH_DETECTED !!
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
            number="05"
            title="ARCADE"
            subtitle="// SIDE_QUEST.exe"
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
              }}
            >
              <span style={{ color: C.cyan }}>
                SCORE: {score.toString().padStart(5, "0")}
              </span>
              <span
                className="mono"
                style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.2em" }}
              >
                ◢ DEEP_SPACE_SHOOTER_v1
              </span>
              <span style={{ color: C.warm }}>
                TIME: {timeLeft.toString().padStart(2, "0")}
              </span>
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
                  imageRendering: "pixelated",
                  background: "#05050a",
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
                    GAME_OVER
                  </div>
                  <div style={{ fontSize: 16, color: C.orange, marginBottom: 24 }}>
                    FINAL: {score}
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
                    ▶ PLAY_AGAIN
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
                }}
              >
                <button
                  onPointerDown={() => {
                    stateRefForJSX.current.keys["ArrowLeft"] = true;
                  }}
                  onPointerUp={() => {
                    stateRefForJSX.current.keys["ArrowLeft"] = false;
                  }}
                  onPointerLeave={() => {
                    stateRefForJSX.current.keys["ArrowLeft"] = false;
                  }}
                  className="mono"
                  style={{
                    flex: 1,
                    padding: 16,
                    background: "rgba(30,136,229,0.1)",
                    border: `1px solid ${C.cyan}`,
                    color: C.cyan,
                    fontSize: 20,
                    cursor: "pointer",
                    userSelect: "none",
                    touchAction: "manipulation",
                  }}
                >
                  ◀
                </button>
                <button
                  onPointerDown={() => {
                    stateRefForJSX.current.keys[" "] = true;
                  }}
                  onPointerUp={() => {
                    stateRefForJSX.current.keys[" "] = false;
                  }}
                  onPointerLeave={() => {
                    stateRefForJSX.current.keys[" "] = false;
                  }}
                  className="mono"
                  style={{
                    flex: 1.5,
                    padding: 16,
                    background: "rgba(79,195,247,0.15)",
                    border: `1px solid ${C.orange}`,
                    color: C.orange,
                    fontSize: 14,
                    letterSpacing: "0.2em",
                    cursor: "pointer",
                    userSelect: "none",
                    touchAction: "manipulation",
                  }}
                >
                  ▲ FIRE
                </button>
                <button
                  onPointerDown={() => {
                    stateRefForJSX.current.keys["ArrowRight"] = true;
                  }}
                  onPointerUp={() => {
                    stateRefForJSX.current.keys["ArrowRight"] = false;
                  }}
                  onPointerLeave={() => {
                    stateRefForJSX.current.keys["ArrowRight"] = false;
                  }}
                  className="mono"
                  style={{
                    flex: 1,
                    padding: 16,
                    background: "rgba(30,136,229,0.1)",
                    border: `1px solid ${C.cyan}`,
                    color: C.cyan,
                    fontSize: 20,
                    cursor: "pointer",
                    userSelect: "none",
                    touchAction: "manipulation",
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
                ? "TAP CONTROLS  •  60 SECONDS  •  AVOID THE SPIRES"
                : "← → MOVE  •  SPACE SHOOT  •  60 SECONDS"}
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
            marginBottom: 12,
            fontFamily: FONT_DISPLAY,
            fontSize: 12,
          }}
        >
          <span style={{ color: C.cyan }}>SCORE: {score.toString().padStart(5, "0")}</span>
          <span style={{ color: C.orange }}>TIME: {timeLeft.toString().padStart(2, "0")}</span>
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
              imageRendering: "pixelated",
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
            }}
          >
            <button
              onPointerDown={() => { stateRef.current.keys["ArrowLeft"] = true; }}
              onPointerUp={() => { stateRef.current.keys["ArrowLeft"] = false; }}
              onPointerLeave={() => { stateRef.current.keys["ArrowLeft"] = false; }}
              className="mono"
              style={{
                flex: 1,
                padding: 16,
                background: "rgba(30,136,229,0.1)",
                border: `1px solid ${C.cyan}`,
                color: C.cyan,
                fontSize: 20,
                cursor: "pointer",
                userSelect: "none",
                touchAction: "manipulation",
              }}
            >
              ◀
            </button>
            <button
              onPointerDown={() => { stateRef.current.keys[" "] = true; }}
              onPointerUp={() => { stateRef.current.keys[" "] = false; }}
              onPointerLeave={() => { stateRef.current.keys[" "] = false; }}
              className="mono"
              style={{
                flex: 1.5,
                padding: 16,
                background: "rgba(79,195,247,0.15)",
                border: `1px solid ${C.orange}`,
                color: C.orange,
                fontSize: 14,
                letterSpacing: "0.2em",
                cursor: "pointer",
                userSelect: "none",
                touchAction: "manipulation",
              }}
            >
              ▲ FIRE
            </button>
            <button
              onPointerDown={() => { stateRef.current.keys["ArrowRight"] = true; }}
              onPointerUp={() => { stateRef.current.keys["ArrowRight"] = false; }}
              onPointerLeave={() => { stateRef.current.keys["ArrowRight"] = false; }}
              className="mono"
              style={{
                flex: 1,
                padding: 16,
                background: "rgba(30,136,229,0.1)",
                border: `1px solid ${C.cyan}`,
                color: C.cyan,
                fontSize: 20,
                cursor: "pointer",
                userSelect: "none",
                touchAction: "manipulation",
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
        {subtitle}
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
          {number}.
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
          {title}
        </h2>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: FOOTER
// ============================================================================
function Footer() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo size={64} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 14,
                color: C.text,
                letterSpacing: "0.2em",
                fontWeight: 600,
              }}
            >
              NA INTERACTIVE
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.textDim,
                letterSpacing: "0.18em",
                marginTop: 4,
                fontStyle: "italic",
              }}
            >
              immersive solutions &amp; development
            </div>
          </div>
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
          END_OF_TRANSMISSION
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
        <span>© 2026 NOAM_AMRAM // NA_INTERACTIVE</span>
        <span>BUILT_WITH_THREE.JS + REACT</span>
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
  const isMobile = useIsMobile();

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <GlobalStyles />
      <NavBar muted={muted} setMuted={setMuted} isMobile={isMobile} />
      <Hero mouseRef={mouseRef} isMobile={isMobile} />
      <About muted={muted} isMobile={isMobile} />
      <Portfolio onOpen={setActiveProject} muted={muted} isMobile={isMobile} />
      <Contact mouseRef={mouseRef} muted={muted} isMobile={isMobile} />
      <Arcade embedded muted={muted} isMobile={isMobile} />
      <Footer />
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
        muted={muted}
      />
    </div>
  );
}
