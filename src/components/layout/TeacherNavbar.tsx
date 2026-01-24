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



export function TeacherNavbar() {
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
                <Link href="/teach" className="flex items-center gap-2 z-50 relative">
                    <Logo className="text-blue-900 h-10 w-auto" />
                    <span className="text-3xl font-bold tracking-tighter text-blue-900 leading-none">
                        vadea
                    </span>
                </Link>

                {/* Desktop Menu - Teacher Focused */}
                <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                    <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-blue-600 transition-colors">
                        For Parents
                    </Link>
                    <Link href="/teach/#features" className="text-sm font-medium text-zinc-600 hover:text-blue-600 transition-colors">
                        Benefits
                    </Link>
                    <Link href="/teach/#how-it-works" className="text-sm font-medium text-zinc-600 hover:text-blue-600 transition-colors">
                        How it Works
                    </Link>
                    <Link href="/pricing" className="text-sm font-medium text-zinc-600 hover:text-blue-600 transition-colors">
                        Earnings
                    </Link>
                    <Link href="/blog" className="text-sm font-medium text-zinc-600 hover:text-blue-600 transition-colors">
                        Resources
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-4">

                    <AuthButtons hideStudentLogin={true} role="teacher" />
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

                            <MobileAuthButtons onClose={() => setIsOpen(false)} hideStudentLogin={true} role="teacher" />
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
