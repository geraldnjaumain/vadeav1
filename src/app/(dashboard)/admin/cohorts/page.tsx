"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { Layers, Plus, Edit2, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../../../convex/_generated/dataModel";

const GRADE_OPTIONS = [
    "PP1", "PP2",
    "Grade 1", "Grade 2", "Grade 3",
    "Grade 4", "Grade 5", "Grade 6",
    "Grade 7", "Grade 8", "Grade 9"
];

function formatMoney(amount: number) {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
}

export default function AdminCohortsPage() {
    const cohorts = useQuery(api.cohorts.listAllCohorts);
    const createCohort = useMutation(api.cohorts.createCohort);
    const updateCohort = useMutation(api.cohorts.updateCohort);
    const deleteCohort = useMutation(api.cohorts.deleteCohort);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCohort, setEditingCohort] = useState<Id<"cohorts"> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        grade: "",
        price: "",
        trialDays: "7",
    });

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            grade: "",
            price: "",
            trialDays: "7",
        });
        setEditingCohort(null);
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.grade || !formData.price) {
            toast.error("Missing fields", { description: "Please fill in all required fields." });
            return;
        }

        setIsSubmitting(true);
        try {
            await createCohort({
                name: formData.name,
                description: formData.description,
                grade: formData.grade,
                price: parseFloat(formData.price),
                trialDays: parseInt(formData.trialDays) || 0,
            });
            toast.success("Cohort created", { description: `${formData.name} has been added.` });
            setIsCreateOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error("Failed to create cohort", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (id: Id<"cohorts">, updates: Partial<{
        name: string;
        description: string;
        grade: string;
        price: number;
        trialDays: number;
        isActive: boolean;
    }>) => {
        try {
            await updateCohort({ id, ...updates });
            toast.success("Cohort updated");
        } catch (error: any) {
            toast.error("Update failed", { description: error.message });
        }
    };

    const handleDelete = async (id: Id<"cohorts">, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
            return;
        }

        try {
            await deleteCohort({ id });
            toast.success("Cohort deleted", { description: `${name} has been removed.` });
        } catch (error: any) {
            toast.error("Delete failed", { description: error.message });
        }
    };

    const handleToggleActive = async (id: Id<"cohorts">, currentActive: boolean) => {
        await handleUpdate(id, { isActive: !currentActive });
    };

    if (cohorts === undefined) {
        return <LoadingAnimation message="Loading cohorts..." />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Cohort Management
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Manage learning programs, pricing, and trial settings
                    </p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" fill="currentColor" />
                            Create Cohort
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Cohort</DialogTitle>
                            <DialogDescription>
                                Add a new learning program with pricing and trial options.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Cohort Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Grade 4 Foundation"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Brief description of the cohort"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Grade Level *</Label>
                                <Select
                                    value={formData.grade}
                                    onValueChange={(val) => setFormData({ ...formData, grade: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GRADE_OPTIONS.map((grade) => (
                                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (KES) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="e.g., 5000"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="trialDays">Trial Days</Label>
                                    <Input
                                        id="trialDays"
                                        type="number"
                                        placeholder="0 = no trial"
                                        value={formData.trialDays}
                                        onChange={(e) => setFormData({ ...formData, trialDays: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Cohort"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Total Cohorts
                        </CardTitle>
                        <Layers className="h-4 w-4 text-blue-600" fill="currentColor" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            {cohorts.length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Active Cohorts
                        </CardTitle>
                        <Layers className="h-4 w-4 text-green-600" fill="currentColor" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            {cohorts.filter(c => c.isActive).length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Total Enrollments
                        </CardTitle>
                        <Users className="h-4 w-4 text-purple-600" fill="currentColor" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            —
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Coming soon</p>
                    </CardContent>
                </Card>
            </div>

            {/* Cohorts Table */}
            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle>All Cohorts</CardTitle>
                </CardHeader>
                <CardContent>
                    {cohorts.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                            <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No cohorts created yet.</p>
                            <p className="text-sm">Create your first cohort to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Trial</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cohorts.map((cohort) => (
                                    <TableRow key={cohort._id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <p className="text-zinc-900 dark:text-zinc-100">{cohort.name}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                                                    {cohort.description}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{cohort.grade}</Badge>
                                        </TableCell>
                                        <TableCell>{formatMoney(cohort.price)}</TableCell>
                                        <TableCell>
                                            {cohort.trialDays > 0 ? (
                                                <span className="text-green-600">{cohort.trialDays} days</span>
                                            ) : (
                                                <span className="text-zinc-400">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={cohort.isActive}
                                                onCheckedChange={() => handleToggleActive(cohort._id, cohort.isActive)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(cohort._id, cohort.name)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
