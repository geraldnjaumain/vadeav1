"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";

export function StickyCTACard() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling down 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (isDismissed) return null;

    return (
        <div
            className={`fixed bottom-6 right-6 z-40 transition-all duration-500 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
                }`}
        >
            <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 p-4 w-[300px] relative">
                <button
                    onClick={() => setIsDismissed(true)}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600"
                >
                    <X className="h-4 w-4 fill-current" />
                </button>

                <div className="mb-4">
                    <h3 className="font-bold text-lg text-zinc-900">Join Vadea Today</h3>
                    <p className="text-xs text-zinc-500">Unlock your child's potential or start your teaching journey.</p>
                </div>

                <div className="space-y-2">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                        <Link href="/?auth=register&role=parent">
                            parent Register
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full hover:bg-zinc-50">
                        <Link href="/become-teacher">
                            Become a Teacher
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
