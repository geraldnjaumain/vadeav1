"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { FileText, Image, Video, Brain, Calendar, Eye, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddPortfolioItemDialog } from "../portfolio/AddPortfolioItemDialog";
import { PortfolioDetailsDialog } from "@/components/cbc/PortfolioDetailsDialog";

interface LearnerPortfolioProps {
    studentId: Id<"users">;
    isParent?: boolean;
}

export function LearnerPortfolio({ studentId, isParent = false }: LearnerPortfolioProps) {
    // Connect to real backend data
    const portfolioItems = useQuery(
        api.cbc.getStudentPortfolio,
        { studentId, isPublic: isParent ? true : undefined }
    );

    // Filter state
    const [selectedCompetency, setSelectedCompetency] = useState<string>("all");
    const [selectedType, setSelectedType] = useState<string>("all");

    // Loading state
    if (portfolioItems === undefined) {
        return (
            <Card className="border-zinc-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Learner Portfolio
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "project": return Brain;
            case "assignment": return FileText;
            case "assessment": return FileText;
            default: return FileText;
        }
    };

    const getAttachmentIcon = (type: string) => {
        switch (type) {
            case "image": return Image;
            case "video": return Video;
            default: return FileText;
        }
    };

    const getCompetencyName = (competency: string) => {
        const competencies: Record<string, string> = {
            communication_collaboration: "Communication & Collaboration",
            self_efficacy: "Self-Efficacy",
            critical_thinking: "Critical Thinking",
            creativity_imagination: "Creativity & Imagination",
            citizenship: "Citizenship",
            digital_literacy: "Digital Literacy",
            learning_to_learn: "Learning to Learn"
        };
        return competencies[competency] || competency;
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "project": return "bg-purple-100 text-purple-700 border-purple-200";
            case "assignment": return "bg-blue-100 text-blue-700 border-blue-200";
            case "assessment": return "bg-green-100 text-green-700 border-green-200";
            case "reflection": return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const visibleItems = (portfolioItems || []).filter(item => {
        if (selectedCompetency !== "all" && item.competency !== selectedCompetency) return false;
        if (selectedType !== "all" && item.type !== selectedType) return false;
        return true;
    });

    return (
        <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Learner Portfolio
                        </CardTitle>
                        <p className="text-sm text-zinc-500 mt-1">
                            Collection of student work demonstrating competency development
                        </p>
                    </div>
                    {!isParent && (
                        <AddPortfolioItemDialog studentId={studentId} />
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                    <Select value={selectedCompetency} onValueChange={setSelectedCompetency}>
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue placeholder="All Competencies" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Competencies</SelectItem>
                            <SelectItem value="communication_collaboration">Communication & Collab.</SelectItem>
                            <SelectItem value="self_efficacy">Self-Efficacy</SelectItem>
                            <SelectItem value="critical_thinking">Critical Thinking</SelectItem>
                            <SelectItem value="creativity_imagination">Creativity</SelectItem>
                            <SelectItem value="citizenship">Citizenship</SelectItem>
                            <SelectItem value="digital_literacy">Digital Literacy</SelectItem>
                            <SelectItem value="learning_to_learn">Learning to Learn</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="assessment">Assessment</SelectItem>
                            <SelectItem value="reflection">Reflection</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {visibleItems.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No portfolio items yet.</p>
                        {!isParent && (
                            <div className="mt-3">
                                <AddPortfolioItemDialog studentId={studentId} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visibleItems.map((item) => {
                            const Icon = getTypeIcon(item.type);

                            return (

                                <PortfolioDetailsDialog key={item._id} item={item as any}>
                                    <div
                                        className="border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-sm text-zinc-900 group-hover:text-blue-600 transition-colors">
                                                            {item.title}
                                                        </h4>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn("text-xs", getTypeColor(item.type))}
                                                        >
                                                            {item.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-zinc-600 mb-2 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(item.submittedAt).toLocaleDateString()}
                                                        </div>
                                                        {item.competency && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {getCompetencyName(item.competency)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {item.isPublic && (
                                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <Eye className="h-3 w-3" />
                                                    Public
                                                </div>
                                            )}
                                        </div>

                                        {/* Attachments Preview - Simplified for Card */}
                                        {item.attachments && item.attachments.length > 0 && (
                                            <div className="mb-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {item.attachments.map((attachment, index) => {
                                                        const AttachmentIcon = getAttachmentIcon(attachment.type);
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-50 border rounded text-xs text-zinc-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(attachment.url, '_blank');
                                                                }}
                                                            >
                                                                <AttachmentIcon className="h-3 w-3" />
                                                                {attachment.name}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Feedback Preview */}
                                        {item.feedback && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-xs text-green-700 italic line-clamp-1">
                                                    "{item.feedback}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </PortfolioDetailsDialog>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}