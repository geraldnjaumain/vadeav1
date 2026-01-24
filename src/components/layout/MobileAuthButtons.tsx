"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserIcon, LayoutDashboard } from "lucide-react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

interface MobileAuthButtonsProps {
    onClose: () => void;
    hideStudentLogin?: boolean;
    role?: "parent" | "teacher" | "student" | null;
}

export function MobileAuthButtons({ onClose, hideStudentLogin = false, role = null }: MobileAuthButtonsProps) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const currentUser = useQuery(api.users.currentUser);

    // Compute dashboard URL based on user role
    const getDashboardUrl = () => {
        const userRole = currentUser?.role || "student";
        switch (userRole) {
            case "parent": return "/parent";
            case "teacher": return "/teacher";
            case "admin": return "/admin";
            default: return "/student";
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 w-full">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <>
                {!hideStudentLogin && (
                    <Link
                        href="?auth=student"
                        scroll={false}
                        onClick={onClose}
                        className="text-lg font-medium text-zinc-900 flex items-center gap-2 bg-transparent border-none text-left w-full"
                    >
                        <UserIcon className="h-4 w-4 fill-current" />
                        Student Sign In
                    </Link>
                )}

                {/* Mobile Auth - uses dialog */}
                <Button
                    className="w-full justify-start h-14 text-lg"
                    variant="outline"
                    asChild
                >
                    <Link href="?auth=login" scroll={false} onClick={onClose}>
                        Sign In
                    </Link>
                </Button>
                <Button
                    className="w-full justify-start h-14 text-lg bg-zinc-900 text-white hover:bg-zinc-800"
                    asChild
                >
                    <Link href={`?auth=${role || "register"}`} scroll={false} onClick={onClose}>
                        Get Started
                    </Link>
                </Button>
            </>
        );
    }

    return (
        <Button asChild className="w-full justify-start h-14 text-lg bg-zinc-900 text-white hover:bg-zinc-800">
            <Link href={getDashboardUrl()} onClick={onClose}>
                <LayoutDashboard className="mr-2 h-4 w-4 fill-current" />
                Dashboard
            </Link>
        </Button>
    );
}
