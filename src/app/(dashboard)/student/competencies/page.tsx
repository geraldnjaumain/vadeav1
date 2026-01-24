"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { CBCDashboard } from "@/components/cbc/CBCDashboard";

export default function StudentCompetenciesPage() {
    const user = useQuery(api.users.currentUser);

    if (user === undefined) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">My CBC Competencies</h1>
                    <p className="text-zinc-500 mt-1">
                        Track your progress across Kenya's 7 Core Competencies
                    </p>
                </div>
                <SetGoalDialog />
            </div>

            {/* Main Dashboard Component */}
            <CBCDashboard />
        </div>
    );
}

import { useState } from "react";
import { useMutation } from "convex/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FlagIcon } from "@heroicons/react/24/solid";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CORE_COMPETENCIES = [
    { id: "communication_collaboration", name: "Communication & Collaboration" },
    { id: "self_efficacy", name: "Self-Efficacy" },
    { id: "critical_thinking", name: "Critical Thinking" },
    { id: "creativity_imagination", name: "Creativity & Imagination" },
    { id: "citizenship", name: "Citizenship" },
    { id: "digital_literacy", name: "Digital Literacy" },
    { id: "learning_to_learn", name: "Learning to Learn" }
];

function SetGoalDialog() {
    const [open, setOpen] = useState(false);
    const [competency, setCompetency] = useState("");
    const [target, setTarget] = useState("");
    const [deadline, setDeadline] = useState("");

    const setGoal = useMutation(api.goals.setCompetencyGoal);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await setGoal({
                competency,
                targetLevel: target as any,
                deadline: new Date(deadline).getTime()
            });
            toast.success("Goal set successfully!");
            setOpen(false);
        } catch (err) {
            toast.error("Failed to set goal");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                    <FlagIcon className="h-4 w-4" />
                    Set New Goal
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set a Competency Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label>Competency</Label>
                        <Select value={competency} onValueChange={setCompetency} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select competency" />
                            </SelectTrigger>
                            <SelectContent>
                                {CORE_COMPETENCIES.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Target Level</Label>
                        <Select value={target} onValueChange={setTarget} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EE">Exceeds Expectations (EE)</SelectItem>
                                <SelectItem value="ME">Meets Expectations (ME)</SelectItem>
                                <SelectItem value="AE">Approaching Expectations (AE)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Target Date</Label>
                        <input
                            type="date"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit">save Goal</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
