"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

interface EditChildDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    child: {
        _id: Id<"users">;
        name: string;
        grade?: string;
        username?: string;
        password?: string;
    } | null;
}

export function EditChildDialog({ open, setOpen, child }: EditChildDialogProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (!child) return null;

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Child Profile</DialogTitle>
                        <DialogDescription>
                            Update your child's details.
                        </DialogDescription>
                    </DialogHeader>
                    <EditChildForm setOpen={setOpen} child={child} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Edit Child Profile</DrawerTitle>
                    <DrawerDescription>
                        Update your child's details.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4">
                    <EditChildForm setOpen={setOpen} child={child} />
                </div>
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

interface EditChildParams {
    childId: Id<"users">;
    name: string;
    grade?: string;
    username?: string;
    password?: string;
}

function EditChildForm({ setOpen, child }: { setOpen: (open: boolean) => void; child: { _id: Id<"users">; name: string; grade?: string; username?: string; password?: string } }) {
    const [name, setName] = useState(child.name);
    const [grade, setGrade] = useState(child.grade || "");
    const [username, setUsername] = useState(child.username || "");
    const [password, setPassword] = useState(child.password || "");
    const [isLoading, setIsLoading] = useState(false);

    const updateChild = useMutation(api.parent_actions.updateChild);

    useEffect(() => {
        setName(child.name);
        setGrade(child.grade || "");
        setUsername(child.username || "");
        setPassword(child.password || "");
    }, [child]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateChild({
                childId: child._id,
                name: name,
                grade: grade,
                username: username,
                password: password
            });
            toast.success("Child profile updated!");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update child");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("grid items-start gap-4")}>
            <div className="grid gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Child's Name</label>
                <input
                    id="edit-name"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="e.g. Amani Mwangi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            {/* Credentials Section (Read Only) */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Login Credentials</h4>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400">Admission No</label>
                        <div className="font-mono text-sm font-medium text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1.5">
                            {(child as any).admissionNumber || "N/A"}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400">Password</label>
                        <div className="font-mono text-sm font-medium text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1.5 flex justify-between items-center">
                            <span>{password}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Student Email</label>
                    <div className="font-mono text-sm font-medium text-zinc-900 bg-white border border-zinc-200 rounded px-2 py-1.5 flex justify-between items-center">
                        <span className="truncate">{username}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-2 text-zinc-400 hover:text-blue-600"
                            onClick={() => {
                                navigator.clipboard.writeText(`Email: ${username}\nPassword: ${password}`);
                                toast.success("Credentials copied!");
                            }}
                        >
                            <span className="sr-only">Copy</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Optional Password Reset (Collapsed or separate, keeping simple input for now if they REALLY need to change it) */}
            <div className="grid gap-2">
                <label htmlFor="edit-password" className="text-sm font-medium text-zinc-500">Reset Password (Optional)</label>
                <input
                    id="edit-password"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-zinc-300"
                    placeholder="Enter new password to reset"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="grid gap-2">
                <label htmlFor="edit-grade" className="text-sm font-medium">Grade / Level</label>
                <select
                    id="edit-grade"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                >
                    <option value="">Select a grade</option>
                    <option value="PP1">PP1</option>
                    <option value="PP2">PP2</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="JSS 7">JSS 7</option>
                    <option value="JSS 8">JSS 8</option>
                </select>
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
            </Button>
        </form>
    );
}
