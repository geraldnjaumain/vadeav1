"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAVIGATION_LINKS, Role } from "@/lib/navigation";
import {
    Squares2X2Icon,
    UsersIcon,
    Cog6ToothIcon,
    ReceiptPercentIcon,
    QuestionMarkCircleIcon,
    TicketIcon
} from "@heroicons/react/24/solid";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
    className?: string;
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export function Sidebar({ className, isCollapsed, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const user = useQuery(api.users.currentUser);


    // Fallback role or loading state could be handled here
    if (user === undefined) {
        return (
            <div className={cn("pb-12 h-screen border-r border-blue-900 bg-blue-950 hidden md:flex flex-col fixed left-0 top-16 overflow-y-auto transition-all duration-300",
                isCollapsed ? "w-16" : "w-64",
                className
            )}>
                <div className="space-y-4 py-4 px-3">
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 px-2 py-2">
                                <Skeleton className="h-6 w-6 rounded bg-blue-800" />
                                {!isCollapsed && <Skeleton className="h-4 w-32 bg-blue-800" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const role: Role = (user?.role as Role) || "student";

    const currentLinks = role === "admin" ? [
        { name: "Overview", href: "/admin", icon: Squares2X2Icon },
        { name: "Users", href: "/admin/users", icon: UsersIcon },
        { name: "Analytics", href: "/admin/analytics", icon: ReceiptPercentIcon },
        { name: "Tickets", href: "/admin/tickets", icon: TicketIcon },
        { name: "Finance", href: "/admin/finance", icon: Cog6ToothIcon },
        { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
    ] : (NAVIGATION_LINKS[role] || NAVIGATION_LINKS.student);


    return (
        <div
            className={cn(
                "pb-12 h-[calc(100vh-4rem)] border-r border-blue-900 bg-blue-950 hidden md:flex flex-col fixed left-0 top-16 overflow-y-auto text-white transition-all duration-200 ease-in-out",
                isCollapsed ? "w-16 delay-75" : "w-64",
                className
            )}
        >
            <TooltipProvider delayDuration={0}>
                <div className="space-y-4 py-4 flex-1">
                    <div className="px-3 py-2">
                        <div className="space-y-2 mt-2">
                            {/* Title moved to TopBar as requested */}
                            {currentLinks.map((link) => (
                                <Tooltip key={link.href} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            id={`nav-${link.name.toLowerCase().replace(/ /g, "-")}`}
                                            className={cn(
                                                "w-full transition-all flex items-center relative group h-10",
                                                isCollapsed ? "justify-center px-0" : "justify-start px-4",
                                                pathname === link.href
                                                    ? "bg-blue-800 text-white font-medium border-l-4 border-blue-400"
                                                    : "text-blue-100 hover:text-white hover:bg-blue-900"
                                            )}
                                            asChild
                                        >
                                            <Link href={link.href} className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "justify-start w-full")}>
                                                <link.icon className={cn("h-5 w-5 shrink-0 transition-all duration-200", isCollapsed ? "mr-0" : "mr-3")} />
                                                <span
                                                    className={cn(
                                                        "whitespace-nowrap transition-all duration-150 overflow-hidden",
                                                        isCollapsed
                                                            ? "opacity-0 w-0 translate-x-[-10px] hidden"
                                                            : "opacity-100 w-auto translate-x-0 w-full delay-75 block"
                                                    )}
                                                >
                                                    {link.name}
                                                </span>
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent side="right" className="bg-blue-900 text-white border-blue-800 font-semibold ml-2">
                                            <p>{link.name}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer / Utility Links */}
                <div className="p-4 mt-auto border-t border-blue-900 space-y-2">
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full transition-all flex items-center relative group h-10",
                                    isCollapsed ? "justify-center px-0" : "justify-start px-4",
                                    "text-blue-200 hover:text-white hover:bg-blue-900"
                                )}
                                asChild
                            >
                                <Link href="/help" className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "justify-start w-full")}>
                                    <QuestionMarkCircleIcon className={cn("h-5 w-5 shrink-0 transition-all duration-200", isCollapsed ? "mr-0" : "mr-3")} />
                                    <span
                                        className={cn(
                                            "whitespace-nowrap transition-all duration-150 overflow-hidden",
                                            isCollapsed
                                                ? "opacity-0 w-0 translate-x-[-10px] hidden"
                                                : "opacity-100 w-auto translate-x-0 w-full delay-75 block"
                                        )}
                                    >
                                        Help Center
                                    </span>
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right" className="bg-blue-900 text-white border-blue-800">
                                <p>Help Center</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </div>
            </TooltipProvider>


        </div>
    );
}
