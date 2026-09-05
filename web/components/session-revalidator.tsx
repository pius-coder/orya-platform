"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "next-sanctum";

/** Don't re-check more than once per this window (avoids focus-event bursts). */
const THROTTLE_MS = 10_000;

/**
 * Revalidates the session when the tab regains focus. A session revoked from
 * another device ("log out other sessions") stays valid client-side until the
 * next server round-trip; this kicks the stale tab to /login promptly instead
 * of only on the next data request. Throttled + non-blocking (navigation stays
 * instant; the redirect only fires if the probe comes back unauthenticated).
 */
export default function SessionRevalidator() {
    const { refresh, isAuthenticated } = useAuth();
    const lastCheck = useRef(0);

    useEffect(() => {
        const check = () => {
            if (!isAuthenticated) return;
            if (document.visibilityState !== "visible") return;
            const now = Date.now();
            if (now - lastCheck.current < THROTTLE_MS) return;
            lastCheck.current = now;
            void refresh().then((user) => {
                if (!user) window.location.assign("/login?expired=1");
            });
        };
        window.addEventListener("focus", check);
        document.addEventListener("visibilitychange", check);
        return () => {
            window.removeEventListener("focus", check);
            document.removeEventListener("visibilitychange", check);
        };
    }, [refresh, isAuthenticated]);

    return null;
}
