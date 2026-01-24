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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PlusIcon } from "@heroicons/react/24/solid";

const CORE_COMPETENCIES = [
    { id: "communication_collaboration", name: "Communication & Collaboration", icon: "💬" },
    { id: "self_efficacy", name: "Self-Efficacy", icon: "🎯" },
    { id: "critical_thinking", name: "Critical Thinking & Problem Solving", icon: "🧠" },
    { id: "creativity_imagination", name: "Creativity & Imagination", icon: "🎨" },
    { id: "citizenship", name: "Citizenship", icon: "🌍" },
    { id: "digital_literacy", name: "Digital Literacy", icon: "💻" },
    { id: "learning_to_learn", name: "Learning to Learn", icon: "📚" }
] as const;

const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", color: "bg-green-100 text-green-700 border-green-300" },
    { id: "ME", name: "Meets Expectations", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "AE", name: "Approaching Expectations", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { id: "BE", name: "Below Expectations", color: "bg-red-100 text-red-700 border-red-300" }
] as const;

interface CompetencyAssessmentFormProps {
    studentId: Id<"users">;
    studentName: string;
    grade: string;
    currentTerm: string;
    onSuccess?: () => void;
}

export function CompetencyAssessmentForm({
    studentId,
    studentName,
    grade,
    currentTerm,
    onSuccess
}: CompetencyAssessmentFormProps) {
    const [open, setOpen] = useState(false);
    const [selectedCompetency, setSelectedCompetency] = useState<string>("");
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [evidence, setEvidence] = useState("");
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createAssessment = useMutation(api.cbc.createCompetencyAssessment);
    const user = useQuery(api.users.currentUser);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCompetency || !selectedLevel || !evidence.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!user?._id) {
            toast.error("User not authenticated");
            return;
        }

        setIsSubmitting(true);

        try {
            // Split evidence by newlines and filter empty lines
            const evidenceArray = evidence
                .split("\n")
                .map(line => line.trim())
                .filter(line => line.length > 0);

            await createAssessment({
                studentId,
                competency: selectedCompetency as any,
                level: selectedLevel as any,
                evidence: evidenceArray,
                teacherId: user._id,
                term: currentTerm,
                grade: grade,
                comments: comments.trim() || undefined
            });

            toast.success(`Assessment created for ${studentName}`);

            // Reset form
            setSelectedCompetency("");
            setSelectedLevel("");
            setEvidence("");
            setComments("");
            setOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error("Assessment creation failed:", error);
            toast.error("Failed to create assessment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCompetencyData = CORE_COMPETENCIES.find(c => c.id === selectedCompetency);
    const selectedLevelData = CBC_LEVELS.find(l => l.id === selectedLevel);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Assess Competency
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>CBC Competency Assessment</DialogTitle>
                    <DialogDescription>
                        Assess {studentName} on a core competency for {currentTerm}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Student Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-zinc-500">Student</p>
                                <p className="font-medium text-zinc-900">{studentName}</p>
                            </div>
                            <div>
                                <p className="text-zinc-500">Grade</p>
                                <p className="font-medium text-zinc-900">{grade}</p>
                            </div>
                            <div>
                                <p className="text-zinc-500">Term</p>
                                <p className="font-medium text-zinc-900">{currentTerm}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rubric Guide */}
                    {selectedCompetency && (
                        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-zinc-800 flex items-center gap-2">
                                    <span className="text-lg">📋</span> Assessment Rubric
                                </h4>
                                <Badge variant="outline">{CORE_COMPETENCIES.find(c => c.id === selectedCompetency)?.name}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div className="p-2 bg-green-50 border border-green-100 rounded">
                                    <span className="font-bold text-green-700 block mb-1">Exceeds Expectations (EE)</span>
                                    <span className="text-green-800">Consistently applies knowledge creatively in new contexts. Analyzing and evaluating beyond standard requirements.</span>
                                </div>
                                <div className="p-2 bg-blue-50 border border-blue-100 rounded">
                                    <span className="font-bold text-blue-700 block mb-1">Meets Expectations (ME)</span>
                                    <span className="text-blue-800">Correctly applies knowledge and skills in familiar contexts. Meets all standard requirements proficiently.</span>
                                </div>
                                <div className="p-2 bg-orange-50 border border-orange-100 rounded">
                                    <span className="font-bold text-orange-700 block mb-1">Approaching Expectations (AE)</span>
                                    <span className="text-orange-800">Demonstrates basic understanding but needs assistance with application. Sometimes meets requirements.</span>
                                </div>
                                <div className="p-2 bg-red-50 border border-red-100 rounded">
                                    <span className="font-bold text-red-700 block mb-1">Below Expectations (BE)</span>
                                    <span className="text-red-800">Has difficulty calculating or applying even with assistance. Does not meet minimum requirements.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Competency Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="competency">
                            Core Competency <span className="text-red-500">*</span>
                        </Label>
                        <Select value={selectedCompetency} onValueChange={setSelectedCompetency}>
                            <SelectTrigger id="competency">
                                <SelectValue placeholder="Select a competency..." />
                            </SelectTrigger>
                            <SelectContent>
                                {CORE_COMPETENCIES.map((comp) => (
                                    <SelectItem key={comp.id} value={comp.id}>
                                        {comp.icon} {comp.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Level Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="level">
                            Assessment Level <span className="text-red-500">*</span>
                        </Label>
                        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                            <SelectTrigger id="level">
                                <SelectValue placeholder="Select level..." />
                            </SelectTrigger>
                            <SelectContent>
                                {CBC_LEVELS.map((level) => (
                                    <SelectItem key={level.id} value={level.id}>
                                        {level.id} - {level.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedLevelData && (
                            <Badge variant="outline" className={selectedLevelData.color}>
                                {selectedLevelData.name}
                            </Badge>
                        )}
                    </div>

                    {/* Evidence */}
                    <div className="space-y-2">
                        <Label htmlFor="evidence">
                            Evidence <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="evidence"
                            value={evidence}
                            onChange={(e) => setEvidence(e.target.value)}
                            placeholder="Enter evidence (one point per line):&#10;• Demonstrated skill in...&#10;• Successfully completed...&#10;• Showed improvement in..."
                            rows={6}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-zinc-500">
                            Enter each piece of evidence on a new line. Examples: classroom observations,
                            completed projects, quiz performance, participation.
                        </p>
                    </div>

                    {/* Comments */}
                    <div className="space-y-2">
                        <Label htmlFor="comments">Additional Comments (Optional)</Label>
                        <Textarea
                            id="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Any additional observations or recommendations..."
                            rows={3}
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
                            {isSubmitting ? "Creating..." : "Create Assessment"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
