"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function StickyRegistrationCard() {
    const [isVisible, setIsVisible] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
        }, 700); // Match duration-700
    };

    if (!isVisible) return null;

    return (
        <Card className={cn(
            "fixed bottom-4 right-4 z-40 w-full max-w-sm shadow-2xl border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80",
            isClosing
                ? "animate-out slide-out-to-bottom-10 fade-out duration-700 fill-mode-forwards"
                : "animate-in slide-in-from-bottom-10 fade-in duration-700",
            "p-0 overflow-hidden"
        )}>
            <div className="absolute top-2 right-2 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zinc-400 hover:text-zinc-900 rounded-full"
                    onClick={handleClose}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
            <CardContent className="p-6 flex flex-col gap-4">
                <div>
                    <h3 className="font-semibold text-zinc-900">Join Vadea Today</h3>
                    <p className="text-sm text-zinc-500 mt-1">Start your learning journey or teach globally.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800">
                        <Link href="?auth=register" scroll={false}>Register Child</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 border-zinc-200 hover:bg-zinc-50 text-zinc-900">
                        <Link href="?auth=teacher" scroll={false}>Teach</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
