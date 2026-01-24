"use client";


import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Menu, Briefcase, BookOpen, Users, Trophy, Radio, LayoutDashboard } from "lucide-react";
import { UserIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { NavbarAuthListener } from "@/components/layout/NavbarAuthListener";
import { AuthButtons } from "@/components/layout/AuthButtons";
import { MobileAuthButtons } from "@/components/layout/MobileAuthButtons";

// Reusing the 3D icons for consistency
const features = [
    {
        title: "CBC Curriculum",
        href: "/#curriculum",
        description: "Fully aligned with the Competence Based Curriculum.",
        icon: "/icons/icon_curriculum_3d_1768843440466.png"
    },
    {
        title: "Offline Learning",
        href: "/#offline",
        description: "Download lessons and learn without internet.",
        icon: "/icons/icon_offline_3d_1768843458311.png"
    },
    {
        title: "Live Classrooms",
        href: "/#live",
        description: "Interact with verified teachers in real-time.",
        icon: "/icons/icon_video_3d_1768843475124.png"
    },
    {
        title: "Progress Tracking",
        href: "/#dashboard",
        description: "Real-time analytics for parents and teachers.",
        icon: "/icons/icon_dashboard_3d_1768843512382.png"
    },
];

export function PublicNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Auth State
    // Auth State and Dashboard logic moved to AuthButtons component

    // Handler to clear param moved to NavbarAuthListener

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "w-full fixed top-0 z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-white/95 backdrop-blur-md border-zinc-200 py-3 shadow-sm"
                    : "bg-white/90 backdrop-blur-md border-transparent py-4"
            )}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 z-50 relative">
                    <Logo className="text-blue-900 h-10 w-auto" />
                    <span className="text-3xl font-bold tracking-tighter text-blue-900 leading-none">
                        vadea
                    </span>
                </Link>

                {/* Desktop Mega Menu */}
                {/* NOTE: Modified 'top-[100%]' in shadcn component or added '-mt-1' here to connect visually */}
                <div className="hidden md:flex flex-1 justify-center">
                    <NavigationMenu className="z-40">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="bg-transparent text-zinc-600 hover:text-blue-600 data-[state=open]:text-blue-600 data-[state=open]:bg-zinc-50">
                                    Products
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-white rounded-b-xl shadow-xl border-t-0">
                                        <li className="row-span-3">
                                            <Link href="/" className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-br from-blue-600 to-blue-700 p-6 no-underline outline-none focus:shadow-md">
                                                <div className="mb-2 mt-4 text-lg font-medium text-white">
                                                    For Parents
                                                </div>
                                                <p className="text-sm leading-tight text-blue-100">
                                                    Give your child the best education with our CBC-aligned curriculum.
                                                </p>
                                            </Link>
                                        </li>
                                        <ListItem href="/" title="Home Schooling">
                                            Complete offline curriculum for home learners.
                                        </ListItem>
                                        <ListItem href="/teach" title="For Teachers">
                                            Earn income by teaching on Vadea.
                                        </ListItem>
                                        <ListItem href="/schools" title="For Schools">
                                            Digital transformation for institutions.
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <Link href="/teach" legacyBehavior passHref>
                                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-zinc-600 hover:text-blue-600 hover:bg-zinc-50")}>
                                        Teach with Vadea
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <Link href="/pricing" legacyBehavior passHref>
                                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-zinc-600 hover:text-blue-600 hover:bg-zinc-50")}>
                                        Pricing
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="hidden md:flex items-center gap-4">

                    <AuthButtons role="parent" />
                </div>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="text-zinc-900 hover:bg-transparent">
                            <div className="flex flex-col gap-[6px] w-8 items-end">
                                <span className="block h-[3px] w-full bg-zinc-900 rounded-full" />
                                <span className="block h-[3px] w-[70%] bg-zinc-900 rounded-full group-hover:w-full transition-all" />
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[100vw] sm:max-w-none border-none flex flex-col gap-6 pt-10 px-6 overflow-y-auto bg-white">
                        <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                        <div className="flex flex-col gap-4">
                            <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Menu</span>
                            <Link href="/#features" className="text-lg font-medium text-zinc-900" onClick={() => setIsOpen(false)}>Features</Link>
                            <Link href="/pricing" className="text-lg font-medium text-zinc-900" onClick={() => setIsOpen(false)}>Pricing</Link>
                            <Link href="/blog" className="text-lg font-medium text-zinc-900" onClick={() => setIsOpen(false)}>Resources</Link>
                            <Link href="/about" className="text-lg font-medium text-zinc-900" onClick={() => setIsOpen(false)}>About</Link>

                            <hr className="border-zinc-100 my-2" />

                            <MobileAuthButtons onClose={() => setIsOpen(false)} role="parent" />
                        </div>
                    </SheetContent>
                </Sheet>

                <NavbarAuthListener />
            </div >
        </nav >
    );
}

const ListItem = ({ className, title, children, href, ...props }: any) => {
    return (
        <li>
            <Link
                href={href}
                className={cn(
                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-zinc-50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group",
                    className
                )}
                {...props}
            >
                <div className="text-sm font-medium leading-none group-hover:text-blue-600 transition-colors">{title}</div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {children}
                </p>
            </Link>
        </li>
    );
};
