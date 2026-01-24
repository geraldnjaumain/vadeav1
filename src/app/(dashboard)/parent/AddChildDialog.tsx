

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function AddChildDialog() {
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Child
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add a Child</DialogTitle>
                        <DialogDescription>
                            Create a profile for your child to start their learning journey.
                        </DialogDescription>
                    </DialogHeader>
                    <ChildForm setOpen={setOpen} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Child
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Add a Child</DrawerTitle>
                    <DrawerDescription>
                        Create a profile for your child to start their learning journey.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4">
                    <ChildForm setOpen={setOpen} />
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

function ChildForm({ setOpen }: { setOpen: (open: boolean) => void }) {
    const [name, setName] = useState("");
    const [grade, setGrade] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const createChild = useMutation(api.parent_actions.createChild);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createChild({ name, grade });
            toast.success("Child added successfully!");
            setOpen(false);
            setName("");
            setGrade("");
        } catch (error) {
            toast.error("Failed to add child");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("grid items-start gap-4")}>
            <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">Child's Name</label>
                <input
                    id="name"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="e.g. Amani Mwangi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <label htmlFor="grade" className="text-sm font-medium">Grade / Level</label>
                <select
                    id="grade"
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
                Create Profile
            </Button>
        </form>
    );
}
