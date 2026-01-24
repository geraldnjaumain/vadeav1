"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", color: "bg-green-100 text-green-700 border-green-300", progress: 100 },
    { id: "ME", name: "Meets Expectations", color: "bg-blue-100 text-blue-700 border-blue-300", progress: 75 },
    { id: "AE", name: "Approaching Expectations", color: "bg-orange-100 text-orange-700 border-orange-300", progress: 50 },
    { id: "BE", name: "Below Expectations", color: "bg-red-100 text-red-700 border-red-300", progress: 25 }
] as const;

interface CompetencyProgressCardProps {
    competency: string;
    name: string;
    icon: string;
    latestLevel?: string | null;
    latestAssessment?: any;
    assessmentCount: number;
    trend?: "up" | "down" | "same" | null;
}

export function CompetencyProgressCard({
    competency,
    name,
    icon,
    latestLevel,
    latestAssessment,
    assessmentCount,
    trend
}: CompetencyProgressCardProps) {
    const levelData = latestLevel ? CBC_LEVELS.find(l => l.id === latestLevel) : null;
    const hasAssessment = latestLevel && latestAssessment;

    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend === "up") return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
        if (trend === "down") return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
        return <MinusIcon className="h-4 w-4 text-zinc-400" />;
    };

    return (
        <Card className={cn(
            "border-2 transition-all hover:shadow-lg",
            hasAssessment ? "border-blue-200" : "border-zinc-200"
        )}>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="text-3xl">{icon}</div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 leading-tight">
                                    {name}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {assessmentCount} {assessmentCount === 1 ? "assessment" : "assessments"}
                                </p>
                            </div>
                        </div>
                        {trend && getTrendIcon()}
                    </div>

                    {/* Current Level */}
                    {hasAssessment ? (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-700">
                                        Current Level:
                                    </span>
                                    <Badge variant="outline" className={cn("text-xs font-semibold", levelData?.color)}>
                                        {latestLevel}
                                    </Badge>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-zinc-100 rounded-full h-2.5">
                                    <div
                                        className={cn(
                                            "h-2.5 rounded-full transition-all",
                                            latestLevel === "EE" && "bg-green-500",
                                            latestLevel === "ME" && "bg-blue-500",
                                            latestLevel === "AE" && "bg-orange-500",
                                            latestLevel === "BE" && "bg-red-500"
                                        )}
                                        style={{ width: `${levelData?.progress || 0}%` }}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">{levelData?.name}</p>
                            </div>

                            {/* Latest Assessment Date */}
                            <div className="pt-2 border-t border-zinc-100">
                                <p className="text-xs text-zinc-500">
                                    Last assessed: {new Date(latestAssessment.assessmentDate).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Evidence Preview */}
                            {latestAssessment.evidence && latestAssessment.evidence.length > 0 && (
                                <div className="bg-zinc-50 rounded-lg p-3 space-y-1">
                                    <p className="text-xs font-medium text-zinc-700 mb-1">Evidence:</p>
                                    {latestAssessment.evidence.slice(0, 2).map((ev: string, idx: number) => (
                                        <p key={idx} className="text-xs text-zinc-600">
                                            • {ev}
                                        </p>
                                    ))}
                                    {latestAssessment.evidence.length > 2 && (
                                        <p className="text-xs text-zinc-500 italic">
                                            +{latestAssessment.evidence.length - 2} more...
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-4 px-2 bg-zinc-50 rounded-lg">
                            <p className="text-sm text-zinc-500">Not yet assessed</p>
                        </div>
                    )}

                    {/* View Details Button */}
                    {hasAssessment && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between"
                            asChild
                        >
                            <Link href={`/student/competencies/${competency}`}>
                                View Details
                                <ChevronRightIcon className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
