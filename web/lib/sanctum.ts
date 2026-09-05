import type { SanctumConfig } from "next-sanctum";

/**
 * Shared next-sanctum config (the base URL lives in env; everything else here).
 * Imported by the client provider. Cookie/SPA mode talks to Laravel Fortify +
 * Sanctum through the same-origin proxy.
 */
export const sanctumConfig = {
    baseUrl: process.env.NEXT_PUBLIC_SANCTUM_BASE_URL!,
    mode: "cookie",
    features: {
        // Passwordless sign-in via WebAuthn. Opt-in (off by default) because it needs
        // the optional laravel/passkeys backend package + @laravel/passkeys on the client.
        passkeys: true,
        // Browser/device sessions (settings → security). Opt-in: backed by this kit's
        // /api/sessions routes over the framework `sessions` table (SESSION_DRIVER=database).
        deviceSessions: true,
    },
    redirect: {
        onLogin: "/dashboard",
        onLogout: "/login",
    },
    // When a request 401s while we believed the user was authenticated (session
    // expired, revoked from another device, or the user was deleted), clear state
    // and hard-redirect to login instead of leaving a broken/stale UI. The
    // `expired` flag lets the login page show a "session expired" toast.
    redirectIfUnauthenticated: "/login?expired=1",
} satisfies SanctumConfig;
