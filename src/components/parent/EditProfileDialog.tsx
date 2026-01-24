"use client";

import { useState, useEffect } from "react";
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogHeader, ResponsiveDialogTitle } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface UserData {
    name: string;
    phone?: string;
    image?: string;
    // Add other editable fields here as needed
}

interface EditProfileDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    user: UserData | null | undefined;
}

export function EditProfileDialog({ open, setOpen, user }: EditProfileDialogProps) {
    if (!user) return null;

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen}>
            <ResponsiveDialogContent className="sm:max-w-[425px]">
                <ResponsiveDialogHeader>
                    <ResponsiveDialogTitle>Edit Profile</ResponsiveDialogTitle>
                    <ResponsiveDialogDescription>
                        Update your personal information.
                    </ResponsiveDialogDescription>
                </ResponsiveDialogHeader>
                <div className="px-4 md:px-0">
                    <EditProfileForm setOpen={setOpen} user={user} />
                </div>
            </ResponsiveDialogContent>
        </ResponsiveDialog>
    );
}

function EditProfileForm({ setOpen, user }: { setOpen: (open: boolean) => void; user: UserData }) {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || "");
    const [image, setImage] = useState(user.image || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.name}`);
    const [isLoading, setIsLoading] = useState(false);

    const updateProfile = useMutation(api.users.updateProfile);

    // Sync state if user prop changes
    useEffect(() => {
        setName(user.name);
        setPhone(user.phone || "");
        setImage(user.image || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.name}`);
    }, [user]);

    const regenerateAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setImage(`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${randomSeed}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateProfile({
                name: name,
                phone: phone,
                image: image,
            });
            toast.success("Profile updated!");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("grid items-start gap-4")}>
            <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative h-20 w-20 rounded-full border-2 border-zinc-100 overflow-hidden">
                    <img src={image} alt="Avatar Preview" className="h-full w-full object-cover" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={regenerateAvatar} className="text-xs">
                    <RefreshCcw className="mr-2 h-3 w-3" />
                    New Avatar
                </Button>
            </div>

            <div className="grid gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Full Name</label>
                <input
                    id="edit-name"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="grid gap-2">
                <label htmlFor="edit-phone" className="text-sm font-medium">Phone Number</label>
                <input
                    id="edit-phone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="+254..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>

            <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
            </Button>
        </form>
    );
}
