"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserIcon, LayoutDashboard } from "lucide-react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthButtons({ hideStudentLogin = false, role = null }: { hideStudentLogin?: boolean, role?: "parent" | "teacher" | "student" | null }) {
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
            <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-28" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <>
                {!hideStudentLogin && (
                    <>
                        <Link
                            href="?auth=student"
                            scroll={false}
                            className="text-sm font-medium text-zinc-600 hover:text-blue-600 flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer"
                        >
                            <UserIcon className="h-4 w-4 fill-current" />
                            Student Sign In
                        </Link>

                        <div className="h-4 w-px bg-zinc-200" />
                    </>
                )}

                <Button
                    variant="ghost"
                    className="text-zinc-600 hover:text-blue-600 hover:bg-blue-50"
                    asChild
                >
                    <Link href="?auth=login" scroll={false}>
                        Sign In
                    </Link>
                </Button>

                <Button
                    className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-md transition-all hover:translate-y-[-1px]"
                    asChild
                >
                    <Link href={`?auth=${role || "register"}`} scroll={false}>
                        Get Started
                    </Link>
                </Button>
            </>
        );
    }

    return (
        <Button
            className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-md transition-all hover:translate-y-[-1px]"
            asChild
        >
            <Link href={getDashboardUrl()}>
                <LayoutDashboard className="mr-2 h-4 w-4 fill-current" />
                Dashboard
            </Link>
        </Button>
    );
}
