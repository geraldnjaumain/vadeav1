"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";

// Use media query hook to detect desktop
export function useIsDesktop() {
    return useMediaQuery("(min-width: 768px)");
}

export const ResponsiveDialog = ({
    children,
    ...props
}: React.ComponentProps<typeof Dialog>) => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return <Dialog {...props}>{children}</Dialog>;
    }

    // Drawer args match Dialog mostly, but verify children
    return <Drawer {...props}>{children}</Drawer>;
};

export const ResponsiveDialogTrigger = ({
    children,
    ...props
}: React.ComponentProps<typeof DialogTrigger>) => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return <DialogTrigger {...props}>{children}</DialogTrigger>;
    }

    return <DrawerTrigger {...props}>{children}</DrawerTrigger>;
};

export const ResponsiveDialogContent = ({
    children,
    className,
    ...props
}: React.ComponentProps<typeof DialogContent>) => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return (
            <DialogContent className={className} {...props}>
                {children}
            </DialogContent>
        );
    }

    return (
        <DrawerContent className={className} {...props}>
            {/* Drawer content usually needs a safe area or scroll handling */}
            <div className="mx-auto w-full max-w-sm">
                {children}
            </div>
        </DrawerContent>
    );
};

export const ResponsiveDialogHeader = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogHeader>) => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return <DialogHeader className={className} {...props} />;
    }

    return <DrawerHeader className={className} {...props} />;
};

export const ResponsiveDialogTitle = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogTitle>) => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return <DialogTitle className={className} {...props} />;
    }

    return <DrawerTitle className={className} {...props} />;
};

export const ResponsiveDialogDescription = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogDescription>) => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return <DialogDescription className={className} {...props} />;
    }

    return <DrawerDescription className={className} {...props} />;
};

export const ResponsiveDialogFooter = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogFooter>) => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return <DialogFooter className={className} {...props} />;
    }

    return <DrawerFooter className={className} {...props} />;
};

export const ResponsiveDialogClose = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogClose>) => {
    const isDesktop = useIsDesktop();

    if (isDesktop) {
        return <DialogClose className={className} {...props} />;
    }

    return <DrawerClose className={className} {...props} />;
};
