"use client";

import { LogOut, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import type { DeviceSession } from "next-sanctum";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { timeAgo } from "@/lib/relative-time";
import { describeAgent } from "@/lib/user-agent";

type Props = {
    session: DeviceSession;
    onLogout: (id: string) => Promise<void>;
};

export default function SessionItem({ session, onLogout }: Props) {
    const [open, setOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const agent = describeAgent(session.user_agent);
    const Icon = agent.mobile ? Smartphone : Monitor;

    // Prevent Radix from auto-closing so the confirm button can show a pending
    // state; close manually once the request settles.
    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoggingOut(true);
        try {
            await onLogout(session.id);
            setOpen(false);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="flex items-center justify-between border-b p-4 last:border-b-0">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium tracking-tight">{agent.label}</p>
                    <p className="text-sm text-muted-foreground">
                        {session.ip_address}
                        <span className="mx-1 text-muted-foreground/50">/</span>
                        {session.is_current ? (
                            <span className="text-green-600 dark:text-green-400">
                                This device
                            </span>
                        ) : (
                            <>Last active {timeAgo(session.last_active_at)}</>
                        )}
                    </p>
                </div>
            </div>

            {!session.is_current && (
                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            data-test="logout-session-button"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="sr-only">Log out session</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                            <AlertDialogMedia className="bg-destructive/10 text-destructive">
                                <LogOut />
                            </AlertDialogMedia>
                            <AlertDialogTitle>Log out session</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to log out the &quot;
                                {agent.label}&quot; session? That device will
                                need to sign in again.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isLoggingOut}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                data-test="confirm-logout-session-button"
                            >
                                {isLoggingOut
                                    ? "Logging out..."
                                    : "Log out session"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
