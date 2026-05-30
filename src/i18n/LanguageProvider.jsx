import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => {
        const saved = localStorage.getItem("na-lang");
        if (saved === "en" || saved === "he") return saved;
        return navigator.language.startsWith("he") ? "he" : "en";
    });

    useEffect(() => {
        localStorage.setItem("na-lang", lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    }, [lang]);

    const setLang = useCallback((next) => {
        if (next === "en" || next === "he") setLangState(next);
    }, []);

    const t = useCallback(
        (key) => {
            const parts = key.split(".");
            let value = translations[lang];
            for (const part of parts) {
                value = value?.[part];
            }
            if (value != null) return value;
            let fallback = translations.en;
            for (const part of parts) {
                fallback = fallback?.[part];
            }
            return fallback ?? key;
        },
        [lang]
    );

    return (
        <LanguageContext.Provider
            value={{ lang, setLang, t, dir: lang === "he" ? "rtl" : "ltr" }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
    return ctx;
}

export function LanguageSwitcher({ muted, compact = false, onSwitch }) {
    const { lang, setLang, t } = useLanguage();

    const btnStyle = (active) => ({
        background: active ? "rgba(30, 136, 229, 0.2)" : "transparent",
        border: `1px solid ${active ? "#1e88e5" : "rgba(30, 136, 229, 0.22)"}`,
        color: active ? "#1e88e5" : "#7a8599",
        padding: compact ? "6px 8px" : "6px 10px",
        fontSize: compact ? 9 : 10,
        letterSpacing: "0.12em",
        cursor: "pointer",
        fontFamily: "'Space Mono', ui-monospace, monospace",
        minWidth: compact ? 32 : 36,
        lineHeight: 1,
    });

    return (
        <div
            role="group"
            aria-label={t("lang.switchAria")}
            style={{ display: "flex", gap: 4, alignItems: "center" }}
        >
            {["en", "he"].map((code) => (
                <button
                    key={code}
                    type="button"
                    className="mono"
                    aria-pressed={lang === code}
                    onClick={() => {
                        if (lang !== code) {
                            onSwitch?.();
                            setLang(code);
                        }
                    }}
                    style={btnStyle(lang === code)}
                >
                    {t(`lang.${code}`)}
                </button>
            ))}
        </div>
    );
}
