import { useEffect, useRef, useState } from "react";
import { FONT_BODY, FONT_DISPLAY } from "./siteFonts";

const C = {
    bg: "#0a0e14",
    text: "#e8edf5",
    textDim: "#7a8599",
    cyan: "#1e88e5",
    orange: "#4fc3f7",
};

const LOGO_SRC = "/logo.png";
const MIN_DURATION_MS = 3800;

const easeOut = (t) => 1 - (1 - t) ** 2.4;

export default function LoadingScreen({
    targetProgress = 0,
    label = "INITIALIZING",
    fadingOut = false,
    finishing = false,
}) {
    const [logoFailed, setLogoFailed] = useState(false);
    const [display, setDisplay] = useState(0);
    const barRef = useRef(null);
    const pctRef = useRef(null);
    const targetRef = useRef(targetProgress);
    const finishingRef = useRef(finishing);
    const startedAtRef = useRef(performance.now());
    const displayRef = useRef(0);
    const rafRef = useRef(0);

    targetRef.current = targetProgress;
    finishingRef.current = finishing;

    useEffect(() => {
        const paint = (value) => {
            displayRef.current = value;
            if (barRef.current) barRef.current.style.width = `${value * 100}%`;
            if (pctRef.current) pctRef.current.textContent = `${Math.min(100, Math.max(0, Math.round(value * 100)))}%`;
        };

        const tick = (now) => {
            const elapsed = now - startedAtRef.current;
            const target = targetRef.current;
            const isFinishing = finishingRef.current;
            let next = displayRef.current;

            if (isFinishing) {
                next += (1 - next) * 0.12;
                if (next >= 0.999) next = 1;
            } else {
                const scheduled = easeOut(Math.min(1, elapsed / MIN_DURATION_MS)) * 0.9;
                const cap = Math.min(0.94, target + 0.22);
                const goal = Math.min(scheduled, cap);
                next += (goal - next) * 0.09;

                const minDrift = (elapsed / MIN_DURATION_MS) * 0.86;
                if (next < minDrift && next < cap) {
                    next = Math.min(cap, Math.max(next + 0.0012, minDrift * 0.9));
                }
            }

            next = Math.min(Math.max(next, 0), 1);
            paint(next);
            setDisplay(next);

            if (!isFinishing || next < 0.999) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    const barWidth = display * 100;

    return (
        <div
            aria-live="polite"
            aria-busy={!fadingOut}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: C.bg,
                opacity: fadingOut ? 0 : 1,
                transition: "opacity 0.55s ease",
                pointerEvents: fadingOut ? "none" : "auto",
            }}
        >
            <div
                style={{
                    width: "min(420px, calc(100vw - 48px))",
                    fontFamily: FONT_BODY,
                    color: C.text,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: 88,
                        height: 88,
                        marginBottom: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    aria-hidden="true"
                >
                    {!logoFailed ? (
                        <img
                            src={LOGO_SRC}
                            alt=""
                            draggable={false}
                            onError={() => setLogoFailed(true)}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                display: "block",
                                mixBlendMode: "lighten",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                fontFamily: FONT_DISPLAY,
                                fontSize: 28,
                                fontWeight: 700,
                                color: C.cyan,
                                letterSpacing: "-0.04em",
                            }}
                        >
                            NA
                        </div>
                    )}
                </div>

                <div
                    style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 11,
                        letterSpacing: "0.28em",
                        color: C.orange,
                        marginBottom: 20,
                    }}
                >
                    NA INTERACTIVE
                </div>

                <div
                    ref={pctRef}
                    style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: "clamp(28px, 6vw, 40px)",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        marginBottom: 8,
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    0%
                </div>

                <div
                    style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 11,
                        letterSpacing: "0.18em",
                        color: C.textDim,
                        marginBottom: 24,
                        minHeight: 16,
                    }}
                >
                    {label}
                </div>

                <div
                    style={{
                        width: "100%",
                        height: 2,
                        background: "rgba(30, 136, 229, 0.18)",
                        borderRadius: 1,
                        overflow: "hidden",
                    }}
                >
                    <div
                        ref={barRef}
                        style={{
                            height: "100%",
                            width: `${barWidth}%`,
                            background: `linear-gradient(90deg, ${C.cyan}, ${C.orange})`,
                            boxShadow: `0 0 12px ${C.cyan}`,
                            willChange: "width",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
