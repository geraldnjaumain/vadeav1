"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { AddChildForm } from "@/components/parent/AddChildForm";
import { EditChildDialog } from "@/components/parent/EditChildDialog";
import { ChildCard } from "@/components/parent/ChildCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, User, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function ChildrenPage() {
    const children = useQuery(api.parent_actions.getChildren);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedChild, setSelectedChild] = useState<{ _id: Id<"users">; name: string; grade?: string; username?: string; password?: string } | null>(null);

    const handleEditClick = (child: any) => {
        setSelectedChild(child);
        setIsEditOpen(true);
    };

    if (children === undefined) {
        return <LoadingAnimation message="Loading students..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Children</h1>
                    <p className="text-zinc-500">Manage student accounts and profiles.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Child
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl p-0 border-none bg-transparent shadow-none">
                        <DialogTitle className="sr-only">Add New Student</DialogTitle>
                        <DialogDescription className="sr-only">Form to add a new child profile</DialogDescription>
                        <AddChildForm onSuccess={() => setIsAddOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <EditChildDialog
                open={isEditOpen}
                setOpen={setIsEditOpen}
                child={selectedChild}
            />

            {children.length === 0 ? (
                <Card className="border-dashed border-2 bg-zinc-50/50">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center text-zinc-500">
                        <User className="h-12 w-12 mb-4 text-zinc-300" />
                        <h3 className="font-semibold text-lg text-zinc-900">No students added yet</h3>
                        <p className="max-w-sm mt-2 mb-6">Add your child to start tracking their progress, schedule, and fees.</p>
                        <Button onClick={() => setIsAddOpen(true)} variant="outline">
                            Register First Student
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {children.map((child) => (
                        <ChildCard
                            key={child._id}
                            child={child}
                            onEdit={handleEditClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
