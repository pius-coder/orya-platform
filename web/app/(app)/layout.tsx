import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import SessionRevalidator from "@/components/session-revalidator";
import { SanctumProviders } from "../providers";

/**
 * Authenticated area. This group layout enforces auth once for every page inside
 * it — the decoupled equivalent of `Route::middleware('auth')->group(...)` — so
 * the pages themselves stay plain content. (The route proxy is an optimistic
 * fast-path; this server check is authoritative.)
 */
export default async function AppGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Reaching here with no user means the optimistic cookie check passed (a
    // session cookie is present) but the session is invalid — i.e. expired or
    // revoked from another device — so flag it for the login "session expired"
    // toast. (A cookie-less guest is already bounced by the route proxy.)
    const user = await getUser();
    if (!user) redirect("/login?expired=1");

    return (
        <SanctumProviders initialUser={user}>
            <SessionRevalidator />
            {children}
        </SanctumProviders>
    );
}
