"use client";

import { cn } from "@/lib/utils";

interface LoaderProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

/**
 * Branded Loader component with smooth animation
 * Uses the primary brand color with a pulsing effect
 */
export function Loader({ size = "md", className }: LoaderProps) {
    const sizeClasses = {
        sm: "w-5 h-5",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* Outer ring */}
            <div
                className={cn(
                    sizeClasses[size],
                    "rounded-full border-2 border-primary/20 animate-pulse"
                )}
            />
            {/* Inner spinner */}
            <div
                className={cn(
                    sizeClasses[size],
                    "absolute rounded-full border-2 border-transparent border-t-primary animate-spin"
                )}
                style={{ animationDuration: "0.8s" }}
            />
        </div>
    );
}

/**
 * Full-page loader for route transitions or initial loading states
 */
export function PageLoader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <Loader size="lg" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
            </div>
        </div>
    );
}

/**
 * Inline loader for buttons or small containers
 */
export function InlineLoader({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
    );
}
