"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Shows a one-time "session expired" toast (triggered by `?expired=1` after an
 * unauthenticated redirect) and strips the flag from the URL. Uses
 * `history.replaceState` rather than the Next router so cleaning the URL doesn't
 * re-render the page (which would re-run getUser) or interrupt the toast.
 */
export default function SessionExpiredNotice() {
    const shown = useRef(false);

    useEffect(() => {
        if (shown.current) return;
        shown.current = true;
        // Defer one tick: React runs child effects before ancestor effects, so on
        // first mount the toast would fire before the root <Toaster/> has subscribed
        // to sonner's store and the toast would be dropped. No cleanup on purpose —
        // the `shown` guard already limits this to a single timer, and clearing it
        // would let Strict Mode's dev double-invoke cancel the toast.
        setTimeout(() => {
            toast.error("Your session has expired. Please log in again.");
        }, 0);
        window.history.replaceState(null, "", "/login");
    }, []);

    return null;
}
