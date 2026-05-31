const HEBREW_CHAR = /[\u0590-\u05FF\uFB1D-\uFB4F]/;
const HEBREW_PREFIX = new Set(["ב", "ל", "ו", "כ", "מ", "ה"]);
const TRAILING_PUNCT = /[,.:;]$/;
const LATIN_WORD_START = /[A-Za-z0-9#@(\[]/;

function isHebrewChar(ch) {
    return HEBREW_CHAR.test(ch);
}

function isHebrewConnector(ch) {
    return ch === "-" || ch === "\u05BE";
}

function isLatinWordStart(ch) {
    return LATIN_WORD_START.test(ch);
}

/** Read a multi-word Latin / tech phrase (spaces allowed between Latin words). */
function readLatinRun(text, i) {
    if (i >= text.length || isHebrewChar(text[i])) return null;

    if (text[i] === "(") {
        let depth = 0;
        let j = i;
        while (j < text.length) {
            if (text[j] === "(") depth += 1;
            else if (text[j] === ")") {
                depth -= 1;
                if (depth === 0) {
                    j += 1;
                    break;
                }
            } else if (isHebrewChar(text[j])) {
                return null;
            }
            j += 1;
        }
        if (depth !== 0) return null;
        return { value: text.slice(i, j), end: j };
    }

    let start = i;
    while (i < text.length) {
        if (isHebrewChar(text[i])) break;

        if (/\s/.test(text[i])) {
            let j = i;
            while (j < text.length && /\s/.test(text[j])) j += 1;
            if (j < text.length && isLatinWordStart(text[j]) && !isHebrewChar(text[j])) {
                i = j;
                continue;
            }
            if (j < text.length && /[—–-]/.test(text[j])) {
                let k = j + 1;
                while (k < text.length && /\s/.test(text[k])) k += 1;
                if (k < text.length && isLatinWordStart(text[k]) && !isHebrewChar(text[k])) {
                    i = k;
                    continue;
                }
            }
            break;
        }

        i += 1;
    }

    const value = text.slice(start, i);
    if (!value || !/[A-Za-z0-9]/.test(value)) return null;
    return { value, end: i };
}

function readHebrewRun(text, i) {
    let value = "";
    while (i < text.length) {
        if (!isHebrewChar(text[i])) break;
        value += text[i++];
        if (
            i < text.length &&
            isHebrewConnector(text[i]) &&
            i + 1 < text.length &&
            isHebrewChar(text[i + 1])
        ) {
            value += text[i++];
            while (i < text.length && isHebrewChar(text[i])) value += text[i++];
        }
    }

    if (value && text[i] === ":") {
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j += 1;
        if (j < text.length && isHebrewChar(text[j])) {
            value += text.slice(i, j);
            i = j;
        }
    }

    return value ? { value, end: i } : null;
}

function attachTrailingPunctToHebrew(tokens) {
    for (let i = 0; i < tokens.length - 2; i += 1) {
        const ltr = tokens[i];
        const space = tokens[i + 1];
        const heb = tokens[i + 2];
        if (ltr.type !== "ltr" || space.type !== "space" || heb.type !== "hebrew") continue;
        if (!TRAILING_PUNCT.test(ltr.value)) continue;

        const punct = ltr.value.slice(-1);
        tokens[i] = { ...ltr, value: ltr.value.slice(0, -1) };
        tokens[i + 2] = { ...heb, value: punct + heb.value };
    }
}

function mergeAdjacentLatin(tokens) {
    const merged = [];
    for (let i = 0; i < tokens.length; i += 1) {
        const current = tokens[i];
        if (current.type !== "ltr") {
            merged.push(current);
            continue;
        }

        let value = current.value;
        let j = i + 1;
        while (j + 1 < tokens.length) {
            const gap = tokens[j];
            const next = tokens[j + 1];
            if (gap.type !== "space" || next.type !== "ltr") break;
            value += gap.value + next.value;
            j += 2;
        }
        merged.push({ type: "ltr", value });
        i = j - 1;
    }
    return merged;
}

/** Split mixed Hebrew/Latin strings into ordered RTL/LTR tokens. */
export function tokenizeMixedText(text) {
    const tokens = [];
    let i = 0;

    while (i < text.length) {
        const ch = text[i];

        if (/\s/.test(ch)) {
            let value = "";
            while (i < text.length && /\s/.test(text[i])) value += text[i++];
            tokens.push({ type: "space", value });
            continue;
        }

        if (
            HEBREW_PREFIX.has(ch) &&
            i + 1 < text.length &&
            text[i + 1] === "-" &&
            i + 2 < text.length &&
            isLatinWordStart(text[i + 2])
        ) {
            const prefix = ch;
            const run = readLatinRun(text, i + 2);
            if (run) {
                tokens.push({ type: "prefixed", prefix, value: run.value });
                i = run.end;
                continue;
            }
        }

        if (isHebrewChar(ch)) {
            const run = readHebrewRun(text, i);
            if (run) {
                tokens.push({ type: "hebrew", value: run.value });
                i = run.end;
                continue;
            }
        }

        const run = readLatinRun(text, i);
        if (run) {
            tokens.push({ type: "ltr", value: run.value });
            i = run.end;
            continue;
        }

        tokens.push({ type: "other", value: ch });
        i += 1;
    }

    attachTrailingPunctToHebrew(tokens);
    return mergeAdjacentLatin(tokens);
}

/** LTR-isolated span for numbers, Latin, handles, and mixed technical strings in RTL UI. */
export function LtrSpan({ children, style, className, block = false }) {
    return (
        <span
            dir="ltr"
            className={className}
            style={{
                unicodeBidi: "isolate",
                display: block ? "inline-block" : "inline",
                ...style,
            }}
        >
            {children}
        </span>
    );
}

function renderToken(token, index) {
    if (token.type === "ltr") {
        return <LtrSpan key={index}>{token.value}</LtrSpan>;
    }

    if (token.type === "prefixed") {
        return (
            <span key={index} dir="rtl" style={{ unicodeBidi: "isolate" }}>
                {token.prefix}-<LtrSpan>{token.value}</LtrSpan>
            </span>
        );
    }

    return <span key={index}>{token.value}</span>;
}

/** Auto-wrap Latin/tech runs when the page is RTL. Pass-through in LTR. */
export function MixedText({ children, dir, style, className, as: Tag = "span" }) {
    const text = children;

    if (dir !== "rtl" || typeof text !== "string") {
        return (
            <Tag className={className} style={style}>
                {text}
            </Tag>
        );
    }

    const tokens = tokenizeMixedText(text);

    return (
        <Tag
            dir="rtl"
            className={className}
            style={{ unicodeBidi: "isolate", ...style }}
        >
            {tokens.map(renderToken)}
        </Tag>
    );
}

/** "01. label" with correct bidirectional order in Hebrew. */
export function IndexedTag({ index, label, dir, pad = true, style, className, numberStyle }) {
    const num = `${pad ? String(index).padStart(2, "0") : index}.`;
    return (
        <span dir={dir} className={className} style={{ unicodeBidi: "isolate", ...style }}>
            <LtrSpan block style={numberStyle}>
                {num}
            </LtrSpan>
            {"\u00A0"}
            <MixedText dir={dir}>{label}</MixedText>
        </span>
    );
}

/** "01 / value" — index on the right in RTL reading order. */
export function IndexedSlash({ left, right, dir, style, className }) {
    return (
        <span dir={dir} className={className} style={{ unicodeBidi: "isolate", ...style }}>
            <LtrSpan block>{left}</LtrSpan>
            <span aria-hidden="true"> / </span>
            <MixedText dir={dir}>{right}</MixedText>
        </span>
    );
}

export function SectionNumber({ number }) {
    return <LtrSpan block>{number}.</LtrSpan>;
}

export function physicalEdge(edge, dir) {
    if (dir !== "rtl") return edge;
    if (edge === "left") return "right";
    if (edge === "right") return "left";
    return edge;
}

export function mirrorTranslateX(x, dir) {
    return dir === "rtl" ? -x : x;
}
