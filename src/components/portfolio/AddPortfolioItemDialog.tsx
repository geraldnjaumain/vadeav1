"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUploader } from "./FileUploader";
import { toast } from "sonner";
import { PlusIcon } from "@heroicons/react/24/solid";

const PORTFOLIO_TYPES = [
    { id: "project", name: "Project", description: "Long-term projects and investigations" },
    { id: "assignment", name: "Assignment", description: "Completed homework or class assignments" },
    { id: "assessment", name: "Assessment", description: "Test results or formal evaluations" },
    { id: "reflection", name: "Reflection", description: "Personal learning reflections" }
] as const;

const CORE_COMPETENCIES = [
    { id: "communication_collaboration", name: "Communication & Collaboration", icon: "💬" },
    { id: "self_efficacy", name: "Self-Efficacy", icon: "🎯" },
    { id: "critical_thinking", name: "Critical Thinking", icon: "🧠" },
    { id: "creativity_imagination", name: "Creativity & Imagination", icon: "🎨" },
    { id: "citizenship", name: "Citizenship", icon: "🌍" },
    { id: "digital_literacy", name: "Digital Literacy", icon: "💻" },
    { id: "learning_to_learn", name: "Learning to Learn", icon: "📚" }
] as const;

interface AddPortfolioItemDialogProps {
    studentId: Id<"users">;
    onSuccess?: () => void;
}

export function AddPortfolioItemDialog({ studentId, onSuccess }: AddPortfolioItemDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<string>("");
    const [competency, setCompetency] = useState<string>("");
    const [isPublic, setIsPublic] = useState(true);
    const [files, setFiles] = useState<Array<{
        name: string;
        url: string;
        type: string;
        storageId: string;
    }>>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const user = useQuery(api.users.currentUser);
    const addPortfolioItem = useMutation(api.cbc.addPortfolioItem);

    const handleFilesUploaded = (uploadedFiles: Array<{
        name: string;
        url: string;
        type: string;
        storageId: string;
    }>) => {
        setFiles(uploadedFiles);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !type) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!user?._id) {
            toast.error("User not authenticated");
            return;
        }

        setIsSubmitting(true);

        try {
            await addPortfolioItem({
                studentId,
                title: title.trim(),
                description: description.trim(),
                type: type as any,
                competency: competency || undefined,
                attachments: files.length > 0 ? files.map(f => ({ name: f.name, url: f.url, type: f.type })) : undefined,
                teacherId: user._id, // Using current user as teacher/creator
                isPublic
            });

            toast.success("Portfolio item added successfully");

            // Reset form
            setTitle("");
            setDescription("");
            setType("");
            setCompetency("");
            setFiles([]);
            setIsPublic(true);
            setOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error("Failed to add portfolio item:", error);
            toast.error("Failed to add portfolio item");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Add Portfolio Item
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Portfolio Item</DialogTitle>
                    <DialogDescription>
                        Document your learning journey with projects, assignments, and reflections
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Science Fair Project on Solar Energy"
                            maxLength={100}
                        />
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">
                            Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select item type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {PORTFOLIO_TYPES.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        <div>
                                            <div className="font-medium">{t.name}</div>
                                            <div className="text-xs text-zinc-500">{t.description}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what you learned, how you approached the work, and what challenges you overcame..."
                            rows={4}
                        />
                    </div>

                    {/* Competency (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="competency">
                            Related Competency (Optional)
                        </Label>
                        <Select value={competency} onValueChange={setCompetency}>
                            <SelectTrigger id="competency">
                                <SelectValue placeholder="Select a competency..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {CORE_COMPETENCIES.map((comp) => (
                                    <SelectItem key={comp.id} value={comp.id}>
                                        {comp.icon} {comp.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-zinc-500">
                            Link this item to a CBC core competency it demonstrates
                        </p>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label>Attachments (Optional)</Label>
                        <FileUploader onFilesUploaded={handleFilesUploaded} />
                        {files.length > 0 && (
                            <p className="text-xs text-green-600">
                                ✓ {files.length} file(s) attached
                            </p>
                        )}
                    </div>

                    {/* Public/Private Toggle */}
                    <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg">
                        <div className="space-y-0.5">
                            <Label htmlFor="public">Share with Parents</Label>
                            <p className="text-xs text-zinc-500">
                                Allow parents to view this portfolio item
                            </p>
                        </div>
                        <Switch
                            id="public"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add to Portfolio"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
