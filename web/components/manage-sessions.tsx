"use client";

import { useRef, useState } from "react";
import { useApi, useSessions, ValidationError } from "next-sanctum";
import type { DeviceSession } from "next-sanctum";
import { toast } from "sonner";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import SessionItem from "@/components/session-item";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManageSessions() {
    const sessionsApi = useSessions();
    const passwordInput = useRef<HTMLInputElement>(null);

    // List via useApi (same pattern as manage-passkeys); mutations go through
    // the feature-gated useSessions() API.
    const { data, isLoading, refetch } =
        useApi<DeviceSession[]>("/api/sessions");
    const sessions = data ?? [];

    const [dialogOpen, setDialogOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ password?: string }>({});

    const handleLogout = async (id: string) => {
        try {
            await sessionsApi.logout(id);
            toast.success("Session logged out.");
            await refetch();
        } catch {
            toast.error("Unable to log out the session. Please try again.");
        }
    };

    const resetAndClearErrors = () => {
        setPassword("");
        setErrors({});
    };

    const submitLogoutOthers = async (
        e: React.SubmitEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await sessionsApi.logoutOthers({ password });
            resetAndClearErrors();
            setDialogOpen(false);
            toast.success("Other browser sessions logged out.");
            await refetch();
        } catch (error) {
            if (error instanceof ValidationError) {
                setErrors({ password: error.errors.password?.[0] });
            }
            passwordInput.current?.focus();
        } finally {
            setProcessing(false);
        }
    };

    const hasOthers = sessions.some((session) => !session.is_current);

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Browser sessions"
                description="Manage and log out your active sessions on other browsers and devices"
            />

            <div
                className="overflow-hidden rounded-lg border border-border"
                data-test="sessions-list"
            >
                {isLoading ? (
                    <div className="space-y-3 p-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    sessions.map((session) => (
                        <SessionItem
                            key={session.id}
                            session={session}
                            onLogout={handleLogout}
                        />
                    ))
                )}
            </div>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetAndClearErrors();
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        variant="secondary"
                        disabled={!hasOthers}
                        data-test="logout-other-sessions-button"
                    >
                        Log out other browser sessions
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Log out other browser sessions</DialogTitle>
                    <DialogDescription>
                        Please enter your password to confirm you would like to
                        log out of your other browser sessions across all of
                        your devices.
                    </DialogDescription>

                    <form onSubmit={submitLogoutOthers} className="space-y-6">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="sessions_password"
                                className="sr-only"
                            >
                                Password
                            </Label>

                            <PasswordInput
                                id="sessions_password"
                                name="password"
                                ref={passwordInput}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                autoComplete="current-password"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => resetAndClearErrors()}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button disabled={processing} asChild>
                                <button
                                    type="submit"
                                    data-test="confirm-logout-other-sessions-button"
                                >
                                    Log out other sessions
                                </button>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
