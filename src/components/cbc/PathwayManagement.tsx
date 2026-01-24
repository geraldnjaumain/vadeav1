"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Brain, Users, Palette, BookOpen, TrendingUp, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PathwayManagementProps {
    studentId?: Id<"users">;
    isTeacher?: boolean;
}

export function PathwayManagement({ studentId, isTeacher = false }: PathwayManagementProps) {
    const [selectedPathway, setSelectedPathway] = useState<string>("");
    const [selectedGrade, setSelectedGrade] = useState<string>("");

    // Real Data
    const existingEnrollment = useQuery(api.cbc_pathways.getStudentPathway, { studentId });
    const selectPathway = useMutation(api.cbc_pathways.selectPathway);

    // Static config for pathways (could stay here or move to a shared constant)
    const PATHWAY_CONFIG = [
        {
            id: "STEM",
            name: "STEM",
            description: "Science, Technology, Engineering, and Mathematics",
            icon: Brain,
            color: "purple",
            subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
            careers: ["Engineer", "Doctor", "Data Scientist", "Architect", "Researcher"],
            grade: "Grade 10"
        },
        {
            id: "social_sciences",
            name: "Social Sciences",
            description: "Humanities and Social Studies",
            icon: Users,
            color: "blue",
            subjects: ["History", "Geography", "Business Studies", "Economics", "Sociology"],
            careers: ["Lawyer", "Teacher", "Social Worker", "Economist", "Psychologist"],
            grade: "Grade 10"
        },
        {
            id: "arts_sports",
            name: "Arts & Sports",
            description: "Creative Arts and Physical Education",
            icon: Palette,
            color: "orange",
            subjects: ["Fine Art", "Music", "Drama", "Physical Education", "Sports Science"],
            careers: ["Artist", "Musician", "Athlete", "Coach", "Designer"],
            grade: "Grade 10"
        }
    ];

    const currentPathway = existingEnrollment ? PATHWAY_CONFIG.find(p => p.id === existingEnrollment.pathway) : null;
    const availablePathways = PATHWAY_CONFIG.filter(p => !existingEnrollment || p.id !== existingEnrollment.pathway);


    const getPathwayColor = (color: string) => {
        switch (color) {
            case "purple": return "bg-purple-100 text-purple-700 border-purple-200";
            case "blue": return "bg-blue-100 text-blue-700 border-blue-200";
            case "orange": return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            {/* Current Pathway Status */}
            {currentPathway && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Current Pathway
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className={cn(
                                "p-3 rounded-lg",
                                getPathwayColor(currentPathway.color)
                            )}>
                                <currentPathway.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{currentPathway.name}</h3>
                                    <Badge className="bg-green-100 text-green-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Enrolled
                                    </Badge>
                                </div>
                                <p className="text-zinc-600 text-sm mb-2">{currentPathway.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {currentPathway.subjects.map((subject, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {subject}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Available Pathways */}
            {availablePathways.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Available Pathways</CardTitle>
                        <p className="text-sm text-zinc-500">
                            Choose a pathway based on your interests and career goals
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availablePathways.map((pathway) => {
                                const Icon = pathway.icon;

                                return (
                                    <div
                                        key={pathway.id}
                                        className="border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                getPathwayColor(pathway.color)
                                            )}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{pathway.name}</h4>
                                                <p className="text-xs text-zinc-500">{pathway.grade}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-zinc-600 mb-3">
                                            {pathway.description}
                                        </p>

                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-zinc-700">Key Subjects:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {pathway.subjects.slice(0, 3).map((subject, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {subject}
                                                    </Badge>
                                                ))}
                                                {pathway.subjects.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{pathway.subjects.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-xs font-medium text-zinc-700 mb-1">Career Paths:</p>
                                            <p className="text-xs text-zinc-600">
                                                {pathway.careers.slice(0, 3).join(", ")}
                                                {pathway.careers.length > 3 && "..."}
                                            </p>
                                        </div>

                                        <Button
                                            className="w-full mt-4"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedPathway(pathway.id);
                                                setSelectedGrade(pathway.grade);
                                            }}
                                        >
                                            Select Pathway
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pathway Selection Form */}
            {selectedPathway && (
                <Card>
                    <CardHeader>
                        <CardTitle>Enroll in Pathway</CardTitle>
                        <p className="text-sm text-zinc-500">
                            Confirm your pathway selection and choose subjects
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Selected Pathway</label>
                            <div className="mt-1 p-3 bg-zinc-50 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    <Badge className={getPathwayColor(
                                        availablePathways.find(p => p.id === selectedPathway)?.color || ""
                                    )}>
                                        {availablePathways.find(p => p.id === selectedPathway)?.name}
                                    </Badge>
                                    <span className="text-sm text-zinc-600">
                                        {availablePathways.find(p => p.id === selectedPathway)?.description}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Select Subjects</label>
                            <div className="mt-2 space-y-2">
                                {availablePathways.find(p => p.id === selectedPathway)?.subjects.map((subject, index) => (
                                    <label key={index} className="flex items-center gap-2 p-2 border rounded hover:bg-zinc-50">
                                        <input type="checkbox" className="rounded" defaultChecked />
                                        <span className="text-sm">{subject}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <Button className="flex-1" onClick={async () => {
                                if (!selectedPathway) return;
                                const pathway = PATHWAY_CONFIG.find(p => p.id === selectedPathway);
                                if (!pathway) return;

                                await selectPathway({
                                    pathwayCode: selectedPathway as "STEM" | "social_sciences" | "arts_sports",
                                    grade: selectedGrade || pathway.grade,
                                    subjects: pathway.subjects
                                });
                                setSelectedPathway("");
                            }}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Enrollment
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedPathway("")}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}