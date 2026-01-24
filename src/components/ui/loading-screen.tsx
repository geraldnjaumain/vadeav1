"use client";

import { LottieLoader } from "@/components/ui/lottie-loader";
import { useEffect, useState } from "react";

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Delay showing loader to avoid flash on fast loads
        const timer = setTimeout(() => setShow(true), 200);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col items-center">
                <div className="w-64 h-64 md:w-80 md:h-80">
                    <LottieLoader />
                </div>
                <p className="text-sm font-medium text-zinc-500 animate-pulse mt-4 relative z-10">{message}</p>
            </div>
        </div>
    );
}
