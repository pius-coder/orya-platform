/**
 * Coarse user-agent helpers — no parser dependency. Used for the sessions list
 * labels and the default passkey name.
 */

const BROWSERS = [
    { pattern: /Edg|Edge/, name: "Edge" },
    { pattern: /OPR|Opera|OPiOS/, name: "Opera" },
    { pattern: /Firefox|FxiOS/, name: "Firefox" },
    { pattern: /Chrome|CriOS/, name: "Chrome" },
    { pattern: /Safari/, name: "Safari" },
];

const PLATFORMS = [
    { pattern: /iPhone/, name: "iPhone" },
    { pattern: /iPad|Macintosh(?=.*Mobile)/, name: "iPad" },
    { pattern: /Android/, name: "Android" },
    { pattern: /Mac/, name: "Mac" },
    { pattern: /Windows/, name: "Windows" },
    { pattern: /Linux/, name: "Linux" },
];

function matchName(
    table: { pattern: RegExp; name: string }[],
    ua: string,
): string | undefined {
    return table.find(({ pattern }) => pattern.test(ua))?.name;
}

/** Label + form factor for a session row (e.g. "Chrome on Windows"). */
export function describeAgent(userAgent: string | null): {
    label: string;
    mobile: boolean;
} {
    const ua = userAgent ?? "";
    const browser = matchName(BROWSERS, ua) ?? "Unknown browser";
    const platform = matchName(PLATFORMS, ua);
    return {
        label: platform ? `${browser} on ${platform}` : browser,
        mobile: /iPhone|iPad|Android|Mobile/i.test(ua),
    };
}

/** A friendly default passkey name derived from the current browser + OS. */
export function detectDeviceName(): string {
    if (typeof navigator === "undefined") return "";
    const ua = navigator.userAgent;
    return [matchName(BROWSERS, ua), matchName(PLATFORMS, ua)]
        .filter(Boolean)
        .join(" on ");
}
