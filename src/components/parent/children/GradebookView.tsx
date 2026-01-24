"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradesSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, BookOpen, Award, Target, Brain, Users, Palette, Globe, Monitor, BookOpen as Learning } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LearnerPortfolio } from "@/components/cbc/LearnerPortfolio";

// Core competency definitions
const CORE_COMPETENCIES = [
    { id: "communication_collaboration", name: "Communication & Collaboration", icon: Users, color: "blue" },
    { id: "self_efficacy", name: "Self-Efficacy", icon: Target, color: "green" },
    { id: "critical_thinking", name: "Critical Thinking & Problem Solving", icon: Brain, color: "purple" },
    { id: "creativity_imagination", name: "Creativity & Imagination", icon: Palette, color: "orange" },
    { id: "citizenship", name: "Citizenship", icon: Globe, color: "red" },
    { id: "digital_literacy", name: "Digital Literacy", icon: Monitor, color: "cyan" },
    { id: "learning_to_learn", name: "Learning to Learn", icon: Learning, color: "indigo" }
] as const;

export function GradebookView({ studentId }: { studentId: Id<"users"> }) {
    const results = useQuery(api.grades.getStudentResults, { studentId });
    const seed = useMutation(api.grades.seedGrades);
    const [activeTab, setActiveTab] = useState("grades");

    if (results === undefined) {
        return <GradesSkeleton />;
    }

    // Calculate averages per subject
    const subjectStats: Record<string, { total: number; count: number }> = {};
    results.forEach((r: any) => {
        const subject = r.assignment.subject;
        if (!subjectStats[subject]) subjectStats[subject] = { total: 0, count: 0 };
        // Normalize score to 100 base if maxScore differs (assuming score is absolute)
        // For simple MVP usage, assuming score is raw and maxScore is denomination
        const percentage = (r.score / r.assignment.maxScore) * 100;
        subjectStats[subject].total += percentage;
        subjectStats[subject].count += 1;
    });

    const overallAverage = Object.values(subjectStats).reduce((acc, curr) => acc + (curr.total / curr.count), 0) / (Object.keys(subjectStats).length || 1);

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="grades">Academic Grades</TabsTrigger>
                    <TabsTrigger value="competencies">CBC Competencies</TabsTrigger>
                </TabsList>

                <TabsContent value="grades" className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500">Overall GPA</CardTitle>
                                <Award className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-zinc-900">{Math.round(overallAverage) || 0}%</div>
                                <p className="text-xs text-zinc-500">Average across {Object.keys(subjectStats).length} subjects</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500">Total Assignments</CardTitle>
                                <BookOpen className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-zinc-900">{results.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500">Top Subject</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-zinc-900">
                                    {Object.entries(subjectStats).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0] || "N/A"}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Detailed Gradebook</CardTitle>
                                <CardDescription>View all graded assignments and feedback.</CardDescription>
                            </div>
                            {results.length === 0 && (
                                <Button variant="outline" size="sm" onClick={() => seed({ studentId })}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Load Demo Grades
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {results.length === 0 ? (
                                <div className="text-center py-10 text-zinc-500">No grades recorded yet.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Assignment</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Max</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Feedback</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.map((r: any) => (
                                            <TableRow key={r._id}>
                                                <TableCell className="font-medium">{r.assignment.subject}</TableCell>
                                                <TableCell>{r.assignment.title}</TableCell>
                                                <TableCell>
                                                    <span className={`font-bold ${(r.score / r.assignment.maxScore) >= 0.9 ? "text-green-600" :
                                                        (r.score / r.assignment.maxScore) >= 0.7 ? "text-blue-600" :
                                                            "text-orange-600"
                                                        }`}>
                                                        {r.score}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-zinc-500">/ {r.assignment.maxScore}</TableCell>
                                                <TableCell className="text-zinc-500 text-sm">
                                                    {new Date(r.gradedAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-zinc-500 text-sm italic">{r.feedback || "-"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="competencies" className="space-y-6">
                    <CBCCompetencyView studentId={studentId} />
                    <LearnerPortfolio studentId={studentId} isParent={true} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// CBC Competency View Component
function CBCCompetencyView({ studentId }: { studentId: Id<"users"> }) {
    // Real Data Connection
    const competencyData = useQuery(api.cbc.getCompetencySummary, { studentId });

    if (competencyData === undefined) {
        return <GradesSkeleton />;
    }

    const getLevelColor = (level?: string) => {
        switch (level) {
            case "EE": return "bg-green-100 text-green-700 border-green-200";
            case "ME": return "bg-blue-100 text-blue-700 border-blue-200";
            case "AE": return "bg-orange-100 text-orange-700 border-orange-200";
            case "BE": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getProgressValue = (level?: string) => {
        switch (level) {
            case "EE": return 90;
            case "ME": return 75;
            case "AE": return 57;
            case "BE": return 25;
            default: return 0;
        }
    };

    const getTrendIcon = (trend: string | null) => {
        switch (trend) {
            case "up": return <TrendingUp className="h-3 w-3 text-green-500" />;
            case "down": return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
            case "same": return <div className="h-3 w-3 bg-gray-500 rounded-full" />;
            default: return null;
        }
    };

    const assessedCount = competencyData.filter(c => c.latestAssessment && c.latestAssessment.level !== "BE").length;
    // Calculate progress only for assessed competencies
    const totalAssessed = competencyData.filter(c => c.latestAssessment).length;
    const overallProgress = totalAssessed > 0
        ? Math.round(competencyData.reduce((acc, c) => acc + getProgressValue(c.latestAssessment?.level), 0) / totalAssessed)
        : 0;

    return (
        <>
            {/* CBC Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">CBC Progress</CardTitle>
                        <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{overallProgress}%</div>
                        <p className="text-xs text-zinc-500">Overall competency level</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Competencies Met</CardTitle>
                        <Award className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{assessedCount}/7</div>
                        <p className="text-xs text-zinc-500">Meeting expectations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Total Assessments</CardTitle>
                        <BookOpen className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">
                            {competencyData.reduce((acc, c) => acc + c.assessmentCount, 0)}
                        </div>
                        <p className="text-xs text-zinc-500">Assessments recorded</p>
                    </CardContent>
                </Card>
            </div>

            {/* Core Competencies Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Core Competency Assessment
                    </CardTitle>
                    <CardDescription>
                        Track development across the 7 core competencies of the CBC framework
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {competencyData.map((competency: any) => {
                            // Find config for icon/color
                            const config = CORE_COMPETENCIES.find(c => c.id === competency.competency);
                            const Icon = config?.icon || Brain;
                            const color = config?.color || "gray";
                            
                            const latest = competency.latestAssessment;
                            const progress = getProgressValue(latest?.level);

                            return (
                                <div
                                    key={competency.competency}
                                    className={cn(
                                        "p-4 rounded-lg border transition-all hover:shadow-md",
                                        latest?.level === "EE" || latest?.level === "ME"
                                            ? "bg-white border-green-200"
                                            : latest?.level === "AE"
                                                ? "bg-white border-orange-200"
                                                : "bg-white border-zinc-200"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                color === "blue" && "bg-blue-100 text-blue-600",
                                                color === "green" && "bg-green-100 text-green-600",
                                                color === "purple" && "bg-purple-100 text-purple-600",
                                                color === "orange" && "bg-orange-100 text-orange-600",
                                                color === "red" && "bg-red-100 text-red-600",
                                                color === "cyan" && "bg-cyan-100 text-cyan-600",
                                                color === "indigo" && "bg-indigo-100 text-indigo-600",
                                                color === "gray" && "bg-gray-100 text-gray-600"
                                            )}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-sm text-zinc-900 leading-tight">
                                                    {competency.name}
                                                </h4>
                                                <p className="text-xs text-zinc-500">
                                                    {competency.assessmentCount} assessments
                                                </p>
                                            </div>
                                        </div>
                                        {latest ? (
                                            <div className="flex items-center gap-1">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-xs font-semibold", getLevelColor(latest.level))}
                                                >
                                                    {latest.level}
                                                </Badge>
                                                {getTrendIcon(competency.trend)}
                                            </div>
                                        ) : (
                                            <Badge variant="secondary" className="text-[10px]">Not Assessed</Badge>
                                        )}
                                    </div>

                                    {latest ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-zinc-500">
                                                <span>Progress</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <Progress
                                                value={progress}
                                                className={cn(
                                                    "h-1.5",
                                                    latest.level === "EE" && "[&>div]:bg-green-500",
                                                    latest.level === "ME" && "[&>div]:bg-blue-500",
                                                    latest.level === "AE" && "[&>div]:bg-orange-500",
                                                    latest.level === "BE" && "[&>div]:bg-red-500"
                                                )}
                                            />
                                            <p className="text-xs text-zinc-500">
                                                Last assessed: {new Date(latest.assessmentDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-zinc-400 py-2 italic text-center">
                                            No assessment data yet
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
