import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingLabelInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ className, label, id, ...props }, ref) => {
        // Generate a random ID if none provided to link label and input
        const generatedId = React.useId();
        const inputId = id || generatedId;

        return (
            <div className="relative">
                <input
                    id={inputId}
                    className={cn(
                        "peer block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm h-14 transition-all duration-200 placeholder:text-transparent",
                        className
                    )}
                    placeholder=" "
                    ref={ref}
                    {...props}
                />
                <label
                    htmlFor={inputId}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 cursor-text bg-white px-1 text-sm text-zinc-500 duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-blue-600 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:scale-75 pointer-events-none origin-[0]"
                >
                    {label}
                </label>
            </div>
        );
    }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
