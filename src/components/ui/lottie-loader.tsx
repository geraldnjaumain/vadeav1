"use client";

import Lottie from "lottie-react";
import loadingAnimation from "../../../public/pablita-loading.json";
import { cn } from "@/lib/utils";

interface LottieLoaderProps {
    className?: string;
    width?: number;
    height?: number;
}

export function LottieLoader({ className }: LottieLoaderProps) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <Lottie
                animationData={loadingAnimation}
                loop={true}
                className="w-full h-full"
            />
        </div>
    );
}
