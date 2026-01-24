import { cn } from "@/lib/utils";

interface LoadingDotsProps {
    className?: string; // Container class
    color?: string; // dot color class, e.g. "bg-white" or "bg-blue-600"
    size?: string; // size class, e.g. "w-2 h-2"
}

export function LoadingDots({ className, color = "bg-current", size = "w-3.5 h-3.5" }: LoadingDotsProps) {
    return (
        <div className={cn("flex space-x-[6px] items-center justify-center", className)}>
            <div className={cn("rounded-full animate-scale-bounce [animation-delay:-0.32s]", color, size)}></div>
            <div className={cn("rounded-full animate-scale-bounce [animation-delay:-0.16s]", color, size)}></div>
            <div className={cn("rounded-full animate-scale-bounce [animation-delay:0s]", color, size)}></div>
        </div>
    );
}
