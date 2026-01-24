import { LoadingDots } from "./loading-dots";
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
    className?: string;
    message?: string;
}

export function LoadingAnimation({ className, message }: LoadingAnimationProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
            <LoadingDots size="w-3 h-3" color="bg-blue-600" />
            {message && (
                <p className="text-sm font-medium text-zinc-500 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
}
