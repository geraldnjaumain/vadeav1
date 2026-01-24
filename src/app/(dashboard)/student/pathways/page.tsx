"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircleIcon, BeakerIcon, GlobeAltIcon, PaintBrushIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PATHWAY_ICONS: Record<string, any> = {
    STEM: BeakerIcon,
    social_sciences: GlobeAltIcon,
    arts_sports: PaintBrushIcon
};

const PATHWAY_DETAILS = {
    STEM: {
        title: "Science, Technology, Engineering & Mathematics",
        description: "Focus on scientific inquiry, technological innovation, and mathematical reasoning.",
        subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
        careers: ["Engineering", "Medicine", "Programming", "Research", "Data Science"]
    },
    social_sciences: {
        title: "Social Sciences",
        description: "Explore human society, languages, humanities, and business studies.",
        subjects: ["History", "Geography", "Business Studies", "Literature", "Religious Education"],
        careers: ["Law", "Journalism", "Education", "Social Work", "Business Administration"]
    },
    arts_sports: {
        title: "Arts & Sports Science",
        description: "Develop creativity, artistic expression, and physical prowess.",
        subjects: ["Visual Arts", "Music", "Performing Arts", "Physical Education", "Sports Science"],
        careers: ["Design", "Music Production", "Professional Sports", "Coaching", "Media Arts"]
    }
};

export default function StudentPathwaysPage() {
    const user = useQuery(api.users.currentUser);
    const existingEnrollment = useQuery(api.cbc_pathways.getStudentPathway, {});
    const selectPathway = useMutation(api.cbc_pathways.selectPathway);

    // In a real app, this would come from the DB, but using robust static data for now as per plan
    const pathways = Object.keys(PATHWAY_DETAILS) as Array<keyof typeof PATHWAY_DETAILS>;

    const [selectedPathway, setSelectedPathway] = useState<keyof typeof PATHWAY_DETAILS | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    if (user === undefined || existingEnrollment === undefined) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    const handleSelect = async () => {
        if (!selectedPathway) return;

        try {
            await selectPathway({
                pathwayCode: selectedPathway,
                grade: user?.grade || "Grade 10", // Default or current grade
                subjects: PATHWAY_DETAILS[selectedPathway].subjects
            });
            toast.success("Pathway selection successful!");
            setIsConfirmOpen(false);
        } catch (error) {
            toast.error("Failed to select pathway. Please try again.");
            console.error(error);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 rounded-3xl" />
                <div className="relative p-8 text-center space-y-4">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Senior School Pathways
                    </h1>
                    <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                        Choose your area of specialization for Senior School. Your choice will determine your core subjects and career guidance.
                    </p>

                    {existingEnrollment && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mt-4">
                            <CheckCircleIcon className="h-5 w-5" />
                            Current Selection: {PATHWAY_DETAILS[existingEnrollment.pathway as keyof typeof PATHWAY_DETAILS]?.title || existingEnrollment.pathway}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pathways.map((code) => {
                    const pathway = PATHWAY_DETAILS[code];
                    const Icon = PATHWAY_ICONS[code];
                    const isSelected = existingEnrollment?.pathway === code;

                    return (
                        <Card
                            key={code}
                            className={cn(
                                "flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
                                isSelected ? "ring-2 ring-green-500 shadow-lg scale-[1.02]" : "hover:border-blue-300"
                            )}
                        >
                            {isSelected && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                                    Enrolled
                                </div>
                            )}

                            <CardHeader className="text-center pb-2">
                                <div className={cn(
                                    "mx-auto p-4 rounded-full mb-4 w-20 h-20 flex items-center justify-center",
                                    code === "STEM" ? "bg-blue-100 text-blue-600" :
                                        code === "social_sciences" ? "bg-purple-100 text-purple-600" :
                                            "bg-orange-100 text-orange-600"
                                )}>
                                    <Icon className="h-10 w-10" />
                                </div>
                                <CardTitle className="text-xl">{pathway.title}</CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-6">
                                <p className="text-zinc-600 text-center">{pathway.description}</p>

                                <div>
                                    <h4 className="font-semibold text-sm text-zinc-900 mb-2">Core Subjects</h4>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {pathway.subjects.map(subj => (
                                            <Badge key={subj} variant="secondary" className="bg-zinc-100">
                                                {subj}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-sm text-zinc-900 mb-2">Career Opportunities</h4>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {pathway.careers.map(career => (
                                            <Badge key={career} variant="outline" className="text-xs">
                                                {career}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-4 border-t bg-zinc-50">
                                <Button
                                    className="w-full"
                                    variant={isSelected ? "outline" : "default"}
                                    onClick={() => {
                                        setSelectedPathway(code);
                                        setIsConfirmOpen(true);
                                    }}
                                    disabled={isSelected}
                                >
                                    {isSelected ? "Currently Enrolled" : "Select Pathway"}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Pathway Selection</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to select <strong>{selectedPathway && PATHWAY_DETAILS[selectedPathway].title}</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-2">
                        <p className="text-zinc-600">This will update your academic profile for <strong>{user?.grade || "Grade 10"}</strong>.</p>
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm text-yellow-800">
                            Note: You can change your pathway later, but it may affect your subject enrollment and progress reports.
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={handleSelect}>Confirm Selection</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
