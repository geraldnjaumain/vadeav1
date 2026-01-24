"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChartBarIcon, ClockIcon, UserIcon, ArrowDownTrayIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { LearnerPortfolio } from "@/components/cbc/LearnerPortfolio";
import { CBCProgressChart } from "@/components/cbc/CBCProgressChart";

const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", color: "bg-green-100 text-green-700 border-green-300" },
    { id: "ME", name: "Meets Expectations", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "AE", name: "Approaching Expectations", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { id: "BE", name: "Below Expectations", color: "bg-red-100 text-red-700 border-red-300" }
] as const;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ParentChildCompetenciesPage({ params }: PageProps) {
    const { id } = use(params);
    const competencyData = useQuery(
        api.cbc_queries.getParentChildCompetencies,
        { childId: id as Id<"users"> }
    );

    if (competencyData === undefined) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    if (!competencyData) {
        return (
            <div className="p-6">
                <p className="text-red-500">Unable to load competency data. You may not have permission to view this child's information.</p>
            </div>
        );
    }

    const { childName, grade, currentTerm, competencies } = competencyData;
    const assessedCount = competencies.filter(c => c.latestLevel !== null).length;
    const meetingStandards = competencies.filter(
        c => c.latestLevel === "ME" || c.latestLevel === "EE"
    ).length;

    return (
        <div className="p-6 space-y-6 print:p-0">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">
                        {childName}'s CBC Competencies
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Track your child's progress across Kenya's 7 Core Competencies
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => window.print()}
                        variant="outline"
                        className="gap-2"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Print Report
                    </Button>
                    <Button
                        onClick={() => {
                            const headers = ["Competency", "Level", "Assessment Count", "Grade", "Term"];
                            const rows = competencies.map((c: any) => [
                                c.name,
                                c.latestLevel || "Not Assessed",
                                c.assessmentCount,
                                grade || "N/A",
                                currentTerm || "N/A"
                            ]);
                            const csvContent = [
                                headers.join(","),
                                ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(","))
                            ].join("\n");
                            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = `${childName}_CBC_Report_${new Date().toISOString().split("T")[0]}.csv`;
                            link.click();
                        }}
                        className="gap-2"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-zinc-900">{childName}'s CBC Progress Report</h1>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p className="text-sm text-zinc-600">Grade:</p>
                        <p className="font-semibold">{grade || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Term:</p>
                        <p className="font-semibold">{currentTerm || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Meeting Standards:</p>
                        <p className="font-semibold">{meetingStandards}/7</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Generated:</p>
                        <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Child Info Card */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-blue-600" />
                        Overall Progress Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">
                                {assessedCount}/7
                            </p>
                            <p className="text-sm text-zinc-600 mt-1">Competencies Assessed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">
                                {meetingStandards}
                            </p>
                            <p className="text-sm text-zinc-600 mt-1">Meeting/Exceeding Standards</p>
                        </div>
                        <div className="text-center">
                            <Badge variant="secondary" className="text-sm mt-2">
                                {grade || "N/A"}
                            </Badge>
                            <p className="text-sm text-zinc-600 mt-1">Current Grade</p>
                        </div>
                        <div className="text-center">
                            <Badge variant="secondary" className="text-sm mt-2">
                                {currentTerm || "N/A"}
                            </Badge>
                            <p className="text-sm text-zinc-600 mt-1">Current Term</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs defaultValue="competencies" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="competencies" className="gap-2">
                        <ChartBarIcon className="h-4 w-4" />
                        Current Status
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="gap-2">
                        <ArrowsRightLeftIcon className="h-4 w-4" />
                        Progress Over Time
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="competencies" className="space-y-6">
                    {/* Benchmark Indicator */}
                    <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-zinc-800">Grade-Level Benchmark</h3>
                                    <p className="text-sm text-zinc-600">
                                        Students in {grade || "this grade"} should aim for ME (Meets Expectations) or higher in all competencies.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-emerald-600">
                                        {assessedCount > 0 ? Math.round((meetingStandards / assessedCount) * 100) : 0}%
                                    </p>
                                    <p className="text-xs text-zinc-600">Meeting benchmark</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Competency Cards Grid */}
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-900 mb-4">
                            Core Competencies
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {competencies.map((competency: any) => {
                                const levelData = competency.latestLevel
                                    ? CBC_LEVELS.find(l => l.id === competency.latestLevel)
                                    : null;
                                const meetsBenchmark = competency.latestLevel === "ME" || competency.latestLevel === "EE";

                                return (
                                    <Card
                                        key={competency.competency}
                                        className={cn(
                                            "border-2 hover:shadow-lg transition-shadow",
                                            meetsBenchmark ? "border-emerald-200" : "border-zinc-200"
                                        )}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="text-3xl">{competency.icon}</div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-zinc-900 leading-tight">
                                                            {competency.name}
                                                        </h3>
                                                        <p className="text-xs text-zinc-500 mt-0.5">
                                                            {competency.assessmentCount}{" "}
                                                            {competency.assessmentCount === 1 ? "assessment" : "assessments"}
                                                        </p>
                                                    </div>
                                                    {meetsBenchmark && (
                                                        <span className="text-emerald-500 text-xs font-medium">On Track</span>
                                                    )}
                                                </div>

                                                {competency.latestLevel && levelData ? (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Badge variant="outline" className={cn("text-xs font-semibold", levelData.color)}>
                                                                {competency.latestLevel} - {levelData.name}
                                                            </Badge>
                                                        </div>

                                                        {competency.recentAssessments && competency.recentAssessments.length > 0 && (
                                                            <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
                                                                <p className="text-xs font-medium text-zinc-700">
                                                                    Recent Assessments:
                                                                </p>
                                                                {competency.recentAssessments.map((assessment: any, idx: number) => (
                                                                    <div key={idx} className="text-xs space-y-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="flex items-center gap-1 text-zinc-600">
                                                                                <ClockIcon className="h-3 w-3" />
                                                                                {new Date(assessment.assessmentDate).toLocaleDateString()}
                                                                            </span>
                                                                            <Badge variant="outline" className={cn("text-[10px]", getLevelColor(assessment.level))}>
                                                                                {assessment.level}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="flex items-start gap-1 text-zinc-600">
                                                                            <UserIcon className="h-3 w-3 mt-0.5 shrink-0" />
                                                                            <span>{assessment.teacherName}</span>
                                                                        </div>
                                                                        {assessment.comments && (
                                                                            <p className="text-zinc-600 italic pl-4">
                                                                                "{assessment.comments}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-center py-4 px-2 bg-zinc-50 rounded-lg">
                                                        <p className="text-sm text-zinc-500">Not yet assessed</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Portfolio Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-900 mb-4">
                            Learning Portfolio
                        </h2>
                        <LearnerPortfolio studentId={id as Id<"users">} isParent={true} />
                    </div>
                </TabsContent>

                <TabsContent value="progress">
                    <CBCProgressChart studentId={id as Id<"users">} />
                </TabsContent>
            </Tabs>

            {/* Print Footer */}
            <div className="hidden print:block border-t-2 border-zinc-900 pt-4 mt-8">
                <p className="text-sm text-zinc-600 text-center">
                    This report was generated on {new Date().toLocaleString()}
                </p>
            </div>
        </div>
    );
}

function getLevelColor(level: string) {
    const levelData = CBC_LEVELS.find(l => l.id === level);
    return levelData?.color || "";
}
