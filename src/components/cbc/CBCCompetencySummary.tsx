"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { TrendingUp, TrendingDown, Minus, Star, Target } from "lucide-react";
import { cn } from "@/lib/utils";

// Core competency definitions
const CORE_COMPETENCIES = [
    { id: "communication_collaboration", name: "Communication & Collaboration", icon: "💬" },
    { id: "self_efficacy", name: "Self-Efficacy", icon: "🎯" },
    { id: "critical_thinking", name: "Critical Thinking & Problem Solving", icon: "🧠" },
    { id: "creativity_imagination", name: "Creativity & Imagination", icon: "🎨" },
    { id: "citizenship", name: "Citizenship", icon: "🌍" },
    { id: "digital_literacy", name: "Digital Literacy", icon: "💻" },
    { id: "learning_to_learn", name: "Learning to Learn", icon: "📚" }
] as const;

interface CBCCompetencySummaryProps {
    studentId: Id<"users">;
    term?: string;
}

export function CBCCompetencySummary({ studentId, term }: CBCCompetencySummaryProps) {
    const assessments = useQuery(api.cbc.getStudentCompetencyAssessments, { studentId, term });

    // Create summary from assessments
    const summary = CORE_COMPETENCIES.map(competency => {
        const competencyAssessments = assessments?.filter((a: any) => a.competency === competency.id) || [];
        const latest = competencyAssessments[0]; // Most recent first due to sort
        
        // Calculate trend
        const getTrend = (currentLevel: string, previousLevel: string): "up" | "down" | "same" => {
            const levelOrder = { "BE": 0, "AE": 1, "ME": 2, "EE": 3 };
            const current = levelOrder[currentLevel as keyof typeof levelOrder] || 0;
            const previous = levelOrder[previousLevel as keyof typeof levelOrder] || 0;
            
            if (current > previous) return "up";
            if (current < previous) return "down";
            return "same";
        };
        
        return {
            competency: competency.id,
            name: competency.name,
            icon: competency.icon,
            latestAssessment: latest,
            assessmentCount: competencyAssessments.length,
            trend: competencyAssessments.length > 1 ? 
                getTrend(competencyAssessments[0].level, competencyAssessments[1].level) : null
        };
    });

    if (!summary) {
        return (
            <Card className="border-zinc-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        CBC Core Competencies
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-zinc-500">Loading competency assessment...</div>
                </CardContent>
            </Card>
        );
    }

    const getLevelColor = (level: string) => {
        switch (level) {
            case "EE": return "bg-green-100 text-green-700 border-green-200";
            case "ME": return "bg-blue-100 text-blue-700 border-blue-200";
            case "AE": return "bg-orange-100 text-orange-700 border-orange-200";
            case "BE": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getTrendIcon = (trend: string | null) => {
        switch (trend) {
            case "up": return <TrendingUp className="h-3 w-3 text-green-500" />;
            case "down": return <TrendingDown className="h-3 w-3 text-red-500" />;
            case "same": return <Minus className="h-3 w-3 text-gray-500" />;
            default: return null;
        }
    };

    const getProgressValue = (level: string) => {
        switch (level) {
            case "EE": return 90;
            case "ME": return 72;
            case "AE": return 57;
            case "BE": return 25;
            default: return 0;
        }
    };

    const assessedCompetencies = summary.filter(s => s.latestAssessment);
    const overallProgress = assessedCompetencies.length > 0 
        ? Math.round((assessedCompetencies.reduce((acc, s) => acc + getProgressValue(s.latestAssessment!.level), 0) / assessedCompetencies.length))
        : 0;

    return (
        <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-zinc-100">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        CBC Core Competencies
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {assessedCompetencies.length}/{summary.length} Assessed
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <Star className="h-3 w-3" />
                            {overallProgress}% Overall
                        </div>
                    </div>
                </div>
                <div className="mt-2">
                    <Progress value={overallProgress} className="h-2" />
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summary.map((competency) => {
                        const hasAssessment = !!competency.latestAssessment;
                        const level = competency.latestAssessment?.level;
                        const progress = hasAssessment ? getProgressValue(level!) : 0;

                        return (
                            <div
                                key={competency.competency}
                                className={cn(
                                    "p-4 rounded-lg border transition-all",
                                    hasAssessment 
                                        ? "bg-white border-zinc-200 hover:border-zinc-300" 
                                        : "bg-gray-50 border-gray-200"
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{competency.icon}</span>
                                        <div>
                                            <h4 className="font-medium text-sm text-zinc-900">
                                                {competency.name}
                                            </h4>
                                            <p className="text-xs text-zinc-500">
                                                {competency.assessmentCount} assessment{competency.assessmentCount !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {hasAssessment && (
                                            <>
                                                <Badge 
                                                    variant="outline" 
                                                    className={cn("text-xs font-semibold", getLevelColor(level!))}
                                                >
                                                    {level}
                                                </Badge>
                                                {getTrendIcon(competency.trend)}
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                {hasAssessment && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-zinc-500">
                                            <span>Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <Progress 
                                            value={progress} 
                                            className="h-1.5"
                                        />
                                        {competency.latestAssessment!.comments && (
                                            <p className="text-xs text-zinc-600 italic mt-2">
                                                "{competency.latestAssessment!.comments}"
                                            </p>
                                        )}
                                    </div>
                                )}

                                {!hasAssessment && (
                                    <div className="text-center py-2">
                                        <p className="text-xs text-zinc-500">Not yet assessed</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}