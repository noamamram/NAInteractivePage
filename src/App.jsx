import { useEffect, useState } from "react";
import Portfolio from "./portfolio";
import { LanguageProvider } from "./i18n/LanguageProvider";
import LoadingScreen from "./LoadingScreen";
import { preloadSiteAssets } from "./preloadAssets";

const MIN_LOAD_MS = 3800;

function App() {
    const [ready, setReady] = useState(false);
    const [fadingOut, setFadingOut] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [targetProgress, setTargetProgress] = useState(0);
    const [label, setLabel] = useState("INITIALIZING");

    useEffect(() => {
        let fadeTimer;
        let unmountTimer;
        let cancelled = false;
        const startedAt = performance.now();

        preloadSiteAssets({
            onProgress: (value, nextLabel) => {
                if (cancelled) return;
                setTargetProgress(value);
                if (nextLabel) setLabel(nextLabel);
            },
        })
            .then(async () => {
                if (cancelled) return;

                const elapsed = performance.now() - startedAt;
                const wait = Math.max(0, MIN_LOAD_MS - elapsed);
                if (wait > 0) {
                    await new Promise((resolve) => window.setTimeout(resolve, wait));
                }
                if (cancelled) return;

                setTargetProgress(1);
                setLabel("READY");
                setFinishing(true);

                await new Promise((resolve) => window.setTimeout(resolve, 900));
                if (cancelled) return;

                setFadingOut(true);
                fadeTimer = window.setTimeout(() => setReady(true), 520);
                unmountTimer = window.setTimeout(() => setFadingOut(false), 1100);
            })
            .catch(() => {
                if (cancelled) return;
                setTargetProgress(1);
                setLabel("READY");
                setReady(true);
            });

        return () => {
            cancelled = true;
            window.clearTimeout(fadeTimer);
            window.clearTimeout(unmountTimer);
        };
    }, []);

    const showLoader = !ready || fadingOut;

    return (
        <LanguageProvider>
            {showLoader && (
                <LoadingScreen
                    targetProgress={targetProgress}
                    label={label}
                    fadingOut={fadingOut}
                    finishing={finishing}
                />
            )}
            {ready && <Portfolio />}
        </LanguageProvider>
    );
}

export default App;
