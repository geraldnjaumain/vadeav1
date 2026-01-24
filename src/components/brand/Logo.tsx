import { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({ className, ...props }: LucideProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-6 h-6", className)}
            {...props}
        >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M12 8h6" />
            <path d="M12 13h6" />
            <path d="M6 8h2" />
            <path d="M6 13h2" />
        </svg>
    );
};
