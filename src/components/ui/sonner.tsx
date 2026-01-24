"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-900 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-none group-[.toaster]:p-4 font-sans border-2",
                    description: "group-[.toast]:text-zinc-500 font-medium",
                    actionButton:
                        "group-[.toast]:bg-zinc-900 group-[.toast]:text-white group-[.toast]:rounded-none font-semibold",
                    cancelButton:
                        "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 group-[.toast]:rounded-none",
                    error: "group-[.toast]:!bg-red-600 group-[.toast]:!text-white group-[.toast]:!border-red-700 [&_[data-icon]]:!text-white",
                    success: "group-[.toast]:!bg-green-600 group-[.toast]:!text-white group-[.toast]:!border-green-700 [&_[data-icon]]:!text-white",
                    warning: "group-[.toast]:!bg-amber-500 group-[.toast]:!text-black group-[.toast]:!border-amber-600",
                    info: "group-[.toast]:!bg-blue-600 group-[.toast]:!text-white group-[.toast]:!border-blue-700",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
