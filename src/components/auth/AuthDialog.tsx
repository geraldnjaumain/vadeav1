"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AuthCard, AuthView } from "./AuthCard";

interface AuthDialogProps {
    initialView?: AuthView;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AuthDialog({ initialView = "login", trigger, open, onOpenChange, onSuccess }: AuthDialogProps) {
    const [view, setView] = useState<AuthView>(initialView);
    const [internalOpen, setInternalOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

    // Reset view when closing or changing initialView
    useEffect(() => {
        if (open) {
            setView(initialView);
        }
    }, [initialView, open]);

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen);
        if (!newOpen) {
            // small delay to avoid UI jumping during close animation
            // setTimeout(() => setView(initialView), 300);
        }
    };

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                {trigger && (
                    <DialogTrigger asChild>
                        {trigger}
                    </DialogTrigger>
                )}
                <DialogContent
                    className="sm:max-w-[1200px] p-0 gap-0 border-none shadow-2xl bg-transparent"
                    closeClassName="absolute right-0 top-[-50px] md:-right-12 md:-top-12 bg-white rounded-full p-2 text-black opacity-100 hover:bg-zinc-100 hover:opacity-100 shadow-lg ring-0 focus:ring-0 outline-none w-10 h-10 [&>svg]:w-6 [&>svg]:h-6 z-50 transition-transform hover:scale-110"
                >
                    <DialogDescription className="sr-only">
                        Authentication options for Vadea
                    </DialogDescription>
                    <DialogTitle className="sr-only">Authentication</DialogTitle>
                    <AuthCard
                        initialView={view}
                        onSuccess={() => {
                            if (onSuccess) onSuccess(); // Use the prop if provided
                            else handleOpenChange(false); // Default close
                        }}
                    // Default internal navigation
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={handleOpenChange}>
            {trigger && (
                <DrawerTrigger asChild>
                    {trigger}
                </DrawerTrigger>
            )}
            <DrawerContent className="h-[100dvh] rounded-none mt-0">
                <DrawerDescription className="sr-only">
                    Authentication options for Vadea
                </DrawerDescription>
                <DrawerTitle className="sr-only">Authentication</DrawerTitle>
                <div className="overflow-y-auto">
                    <AuthCard
                        initialView={view}
                        onSuccess={() => {
                            if (onSuccess) onSuccess();
                            else handleOpenChange(false);
                        }}
                        className="shadow-none"
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
