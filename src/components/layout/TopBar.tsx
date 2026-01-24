"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    MagnifyingGlassIcon, // Search
    BellIcon, // Bell
    UserIcon, // User
    ArrowRightOnRectangleIcon, // LogOut
    Bars3Icon, // Menu
    ChevronDownIcon, // ChevronDown
    Cog6ToothIcon, // Settings
    QuestionMarkCircleIcon // Help
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { NAVIGATION_LINKS, Role } from "@/lib/navigation";
import { Logo } from "@/components/brand/Logo";

export function TopBar({ onMenuClick, isCollapsed = false }: { onMenuClick?: () => void; isCollapsed?: boolean }) {
    const user = useQuery(api.users.currentUser);
    const { signOut } = useAuthActions();
    const router = useRouter();
    const pathname = usePathname();
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isClickLocked, setClickLocked] = useState(false);

    // Real search would go here. For now, empty to avoid fake data.
    const suggestions: string[] = [];

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Check if we are impersonating
        if (typeof window !== "undefined") {
            setIsImpersonating(localStorage.getItem("isImpersonating") === "true");
        }
    }, []);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (!isClickLocked) setIsProfileOpen(true);
    };

    const handleMouseLeave = () => {
        if (isClickLocked) return;
        timeoutRef.current = setTimeout(() => {
            setIsProfileOpen(false);
        }, 150);
    };

    const handleExitImpersonation = async () => {
        localStorage.removeItem("isImpersonating");
        await signOut();
        router.push("/admin/login");
    };

    const handleSignOut = async () => {
        const currentRole = user?.role;
        await signOut();
        if (currentRole === 'student') {
            router.push("/?auth=student");
        } else {
            router.push("/?auth=login");
        }
    };

    const role: Role = (user?.role as Role) || "student";
    const currentLinks = NAVIGATION_LINKS[role] || NAVIGATION_LINKS.student;

    return (
        <header className={cn("fixed top-0 left-0 right-0 z-50 h-16 border-b border-zinc-200 bg-white px-4 flex items-center justify-between", isImpersonating && "bg-amber-50 border-amber-200")}>
            {/* Logo area & Mobile Menu */}
            <div className="flex items-center gap-2 pl-0 md:pl-2">
                {/* Desktop Sidebar Toggle - Fixed position */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="hidden md:flex text-zinc-500 hover:text-blue-600 hover:bg-blue-50 shrink-0"
                >
                    <Bars3Icon className="h-8 w-8" />
                </Button>

                {/* Logo & Text - Always visible, fixed position */}
                <Link href="/" className="hidden md:flex items-center gap-2 font-bold text-xl text-blue-900">
                    <Logo className="h-8 w-8 text-blue-600 shrink-0" />
                    <div className="flex flex-col justify-center">
                        <span className="leading-none">Vadea</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium leading-none mt-1">
                            {role} Workspace
                        </span>
                    </div>
                </Link>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            className="md:hidden mr-2 h-auto py-2 px-4 hover:bg-zinc-100 text-zinc-900 font-black text-lg border-[3px] border-zinc-900 rounded-lg uppercase tracking-widest leading-none bg-zinc-50/50"
                        >
                            MENU
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full sm:max-w-none p-0 flex flex-col bg-blue-950 text-white border-none">
                        <SheetHeader className="p-4 border-b border-blue-900 flex flex-row items-center justify-between">
                            <SheetTitle className="text-white text-left text-xl font-bold flex items-center gap-2">
                                <Logo className="h-8 w-8 text-white" />
                                Vadea
                            </SheetTitle>
                            <SheetDescription className="sr-only">
                                Navigation menu for mobile devices
                            </SheetDescription>
                            {/* Close button is automatically added by SheetContent, but we styled it in sheet.tsx */}
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            <div className="mb-6 px-4">
                                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">{role} Workspace</p>
                            </div>
                            {currentLinks.map((link) => (
                                <SheetClose asChild key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-4 px-4 py-3 rounded-lg text-lg transition-colors",
                                            pathname === link.href
                                                ? "bg-blue-800 text-white font-medium border-l-4 border-blue-500"
                                                : "text-blue-100 hover:text-white hover:bg-blue-900"
                                        )}
                                    >
                                        <link.icon className="h-6 w-6 fill-current" />
                                        {link.name}
                                    </Link>
                                </SheetClose>
                            ))}
                        </div>

                        <div className="p-4 border-t border-blue-900 space-y-2">
                            <SheetClose asChild>
                                <Link href="/help" className="flex items-center gap-4 px-4 py-3 rounded-lg text-lg text-blue-200 hover:text-white hover:bg-blue-900">
                                    <QuestionMarkCircleIcon className="h-6 w-6 fill-current" />
                                    Help Center
                                </Link>
                            </SheetClose>
                            <SheetClose asChild>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-lg text-blue-200 hover:text-white hover:bg-blue-900 text-left"
                                >
                                    <ArrowRightOnRectangleIcon className="h-6 w-6 fill-current" />
                                    Sign Out
                                </button>
                            </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {isImpersonating ? (
                <div className="flex-1 flex justify-center">
                    <div className="bg-amber-100 border border-amber-200 text-amber-900 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm mx-4">
                        <UserIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold hidden md:inline">Viewing as {user?.name || "User"}</span>
                        <Button
                            onClick={handleExitImpersonation}
                            size="sm"
                            className="bg-amber-900 text-white hover:bg-amber-800 h-7 text-xs"
                        >
                            Exit View
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center max-w-xl mx-auto group relative">
                    <div className="relative w-full transition-all duration-300 ease-in-out">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 fill-zinc-400 group-focus-within:text-blue-600 group-focus-within:fill-blue-600 transition-colors" />
                        <Input
                            placeholder="Search for courses, students, or resources..."
                            className="pl-10 rounded-none bg-zinc-50 border-zinc-200 focus-visible:ring-blue-500 w-full md:w-64 focus-visible:md:w-full transition-all duration-300 ease-in-out"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow clicking suggestions
                        />
                    </div>
                    {/* Search Suggestions Dropdown */}
                    {isSearchFocused && searchQuery && (
                        <div className="absolute top-12 left-0 right-0 bg-white border border-zinc-200 shadow-lg rounded-b-md z-50 max-h-60 overflow-y-auto">
                            {suggestions.length > 0 ? (
                                suggestions.map((suggestion, index) => (
                                    <div key={index} className="px-4 py-2 hover:bg-zinc-50 cursor-pointer text-sm text-zinc-700 flex items-center gap-2">
                                        <MagnifyingGlassIcon className="h-3 w-3 text-zinc-400 fill-zinc-400" />
                                        {suggestion}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-zinc-500">No results found.</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <NotificationMenu />

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-zinc-200 hidden md:block"></div>

                <div
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <DropdownMenu
                        open={isProfileOpen}
                        onOpenChange={(open) => {
                            setIsProfileOpen(open);
                            if (!open) setClickLocked(false);
                        }}
                        modal={false}
                    >
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "h-auto py-2 px-3 rounded-lg hover:bg-zinc-100 transition-colors border border-zinc-200 flex items-center justify-between gap-3",
                                    "w-auto md:w-64"
                                )}
                                onPointerDown={(e) => {
                                    e.preventDefault();
                                    if (isClickLocked) {
                                        setClickLocked(false);
                                        setIsProfileOpen(false);
                                    } else {
                                        setClickLocked(true);
                                        setIsProfileOpen(true);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Avatar className="h-8 w-8 rounded-full border border-zinc-200 shrink-0">
                                        <AvatarImage src={user?.image} alt={user?.name} />
                                        <AvatarFallback className="bg-blue-600 text-white font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden md:block overflow-hidden">
                                        <p className="text-sm font-semibold text-zinc-900 leading-none truncate">{user?.name || "User"}</p>
                                        <p className="text-xs text-zinc-500 leading-none mt-1 truncate max-w-[140px]">{user?.email}</p>
                                    </div>
                                </div>
                                <ChevronDownIcon className="h-4 w-4 fill-current text-zinc-400 shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-64 mt-1"
                            align="end"
                            forceMount
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={`/${role}/profile`}>
                                <DropdownMenuItem className="cursor-pointer">
                                    <UserIcon className="mr-2 h-4 w-4 fill-current text-zinc-500" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                            </Link>
                            <Link href={`/${role}/settings`}>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Cog6ToothIcon className="mr-2 h-4 w-4 fill-current text-zinc-500" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50" onSelect={handleExitImpersonation}>
                                <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4 fill-current" />
                                <span>{isImpersonating ? "Exit View" : "Sign Out"}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

function NotificationMenu() {
    const notifications = useQuery(api.notifications.get);
    const unreadCount = useQuery(api.notifications.getUnreadCount) || 0;
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button id="nav-notifications" variant="ghost" size="icon" className="relative text-zinc-500 hover:text-blue-600 hover:bg-blue-50">
                    <BellIcon className="h-5 w-5 fill-current" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[90vw] sm:w-80 mr-2 sm:mr-0">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                        <span
                            className="text-xs text-blue-600 cursor-pointer hover:underline"
                            onClick={() => markAllAsRead()}
                        >
                            Mark all read
                        </span>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications === undefined ? (
                        <div className="p-4 text-center text-xs text-zinc-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-zinc-500 text-sm">
                            <p>No notifications</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <Link href="/notifications" key={n._id}>
                                <div className="px-4 py-3 hover:bg-zinc-50 cursor-pointer border-b last:border-0 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={cn("h-2 w-2 mt-2 rounded-full shrink-0", n.isRead ? "bg-zinc-200" : "bg-blue-500")} />
                                        <div>
                                            <p className={cn("text-sm font-medium", n.isRead ? "text-zinc-600" : "text-zinc-900")}>{n.title}</p>
                                            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-zinc-400 mt-1">
                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
                <div className="p-2 border-t text-center">
                    <Link href="/notifications" className="text-xs text-blue-600 hover:underline">View all notifications</Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
