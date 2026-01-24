"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { Loader2, Plus, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CBCAssessmentFormProps {
    studentId: Id<"users">;
    teacherId: Id<"users">;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CBCAssessmentForm({ studentId, teacherId, onSuccess, onCancel }: CBCAssessmentFormProps) {
    const createAssessment = useMutation(api.cbc.createCompetencyAssessment);
    const [selectedCompetency, setSelectedCompetency] = useState<string>("");
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [evidence, setEvidence] = useState<string[]>([""]);
    const [comments, setComments] = useState<string>("");
    const [term, setTerm] = useState<string>("");
    const [grade, setGrade] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const CORE_COMPETENCIES = [
        { id: "communication_collaboration", name: "Communication & Collaboration", icon: "💬" },
        { id: "self_efficacy", name: "Self-Efficacy", icon: "🎯" },
        { id: "critical_thinking", name: "Critical Thinking", icon: "🧠" },
        { id: "creativity_imagination", name: "Creativity & Imagination", icon: "🎨" },
        { id: "citizenship", name: "Citizenship", icon: "🌍" },
        { id: "digital_literacy", name: "Digital Literacy", icon: "💻" },
        { id: "learning_to_learn", name: "Learning to Learn", icon: "📚" }
    ];

    const CBC_LEVELS = [
        { id: "EE", name: "Exceeds Expectations", range: "80-100%" },
        { id: "ME", name: "Meets Expectations", range: "60-79%" },
        { id: "AE", name: "Approaching Expectations", range: "40-59%" },
        { id: "BE", name: "Below Expectations", range: "0-39%" }
    ];

    const coreCompetencies = CORE_COMPETENCIES;
    const cbcLevels = CBC_LEVELS;

    const addEvidenceField = () => {
        setEvidence([...evidence, ""]);
    };

    const removeEvidenceField = (index: number) => {
        setEvidence(evidence.filter((_, i) => i !== index));
    };

    const updateEvidence = (index: number, value: string) => {
        const newEvidence = [...evidence];
        newEvidence[index] = value;
        setEvidence(newEvidence);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCompetency || !selectedLevel || !term || !grade) {
            return;
        }

        setIsSubmitting(true);
        try {
            const validEvidence = evidence.filter(item => item.trim() !== "");

            await createAssessment({
                studentId,
                competency: selectedCompetency as any,
                level: selectedLevel as any,
                evidence: validEvidence,
                teacherId,
                term,
                grade,
                comments: comments.trim() || undefined
            });

            // Reset form
            setSelectedCompetency("");
            setSelectedLevel("");
            setEvidence([""]);
            setComments("");

            onSuccess?.();
        } catch (error) {
            console.error("Failed to create assessment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case "EE": return "bg-green-100 text-green-700 border-green-200";
            case "ME": return "bg-blue-100 text-blue-700 border-blue-200";
            case "AE": return "bg-orange-100 text-orange-700 border-orange-200";
            case "BE": return "bg-red-100 text-red-700 border-red-200";
            default: return "";
        }
    };

    return (
        <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    CBC Competency Assessment
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="term">Term</Label>
                            <Select value={term} onValueChange={setTerm} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select term" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Term 1 2025">Term 1 2025</SelectItem>
                                    <SelectItem value="Term 2 2025">Term 2 2025</SelectItem>
                                    <SelectItem value="Term 3 2025">Term 3 2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade</Label>
                            <Select value={grade} onValueChange={setGrade} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PP1">PP1</SelectItem>
                                    <SelectItem value="PP2">PP2</SelectItem>
                                    <SelectItem value="Grade 1">Grade 1</SelectItem>
                                    <SelectItem value="Grade 2">Grade 2</SelectItem>
                                    <SelectItem value="Grade 3">Grade 3</SelectItem>
                                    <SelectItem value="Grade 4">Grade 4</SelectItem>
                                    <SelectItem value="Grade 5">Grade 5</SelectItem>
                                    <SelectItem value="Grade 6">Grade 6</SelectItem>
                                    <SelectItem value="Grade 7">Grade 7</SelectItem>
                                    <SelectItem value="Grade 8">Grade 8</SelectItem>
                                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Competency Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="competency">Core Competency</Label>
                        <Select value={selectedCompetency} onValueChange={setSelectedCompetency} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a competency to assess" />
                            </SelectTrigger>
                            <SelectContent>
                                {coreCompetencies.map((competency) => (
                                    <SelectItem key={competency.id} value={competency.id}>
                                        <div className="flex items-center gap-2">
                                            <span>{competency.icon}</span>
                                            <span>{competency.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Performance Level */}
                    <div className="space-y-2">
                        <Label htmlFor="level">Performance Level</Label>
                        <Select value={selectedLevel} onValueChange={setSelectedLevel} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select performance level" />
                            </SelectTrigger>
                            <SelectContent>
                                {cbcLevels.map((level) => (
                                    <SelectItem key={level.id} value={level.id}>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-xs font-semibold", getLevelColor(level.id))}
                                                >
                                                    {level.id}
                                                </Badge>
                                                <span>{level.name}</span>
                                            </div>
                                            <span className="text-xs text-zinc-500">{level.range}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Evidence */}
                    <div className="space-y-3">
                        <Label>Evidence of Learning</Label>
                        {evidence.map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <Textarea
                                    value={item}
                                    onChange={(e) => updateEvidence(index, e.target.value)}
                                    placeholder={`Describe evidence ${index + 1}...`}
                                    className="flex-1"
                                    rows={2}
                                />
                                {evidence.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeEvidenceField(index)}
                                        className="shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addEvidenceField}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Evidence
                        </Button>
                    </div>

                    {/* Comments */}
                    <div className="space-y-2">
                        <Label htmlFor="comments">Teacher Comments (Optional)</Label>
                        <Textarea
                            id="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Add your observations and feedback..."
                            rows={3}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t border-zinc-200">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !selectedCompetency || !selectedLevel || !term || !grade}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving Assessment...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Save Assessment
                                </>
                            )}
                        </Button>
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}