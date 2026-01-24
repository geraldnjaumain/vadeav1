"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Brain,
    Users,
    Target,
    Palette,
    Globe,
    Monitor,
    BookOpen,
    TrendingUp,
    TrendingDown,
    Minus,
    Award,
    FileText,
    Calendar,
    Download,
    Printer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CBCPrintableReport } from "./CBCPrintableReport";
import { CompetencyAssessmentForm } from "@/components/teacher/CompetencyAssessmentForm";

interface CBCDashboardProps {
    isTeacher?: boolean;
    isParent?: boolean;
    studentId?: string;
    studentName?: string; // Optional context
}

export function CBCDashboard({ isTeacher = false, isParent = false, studentId }: CBCDashboardProps) {
    // Current user context for "student viewing themselves"
    const currentUser = useQuery(api.users.currentUser);

    // Determine the effective student ID
    const effectiveStudentId = studentId || (currentUser?.role === "student" ? currentUser._id : undefined);

    // Fetch report data
    const reportData = useQuery(
        api.cbc_reports.generateStudentCBCReport,
        effectiveStudentId ? { studentId: effectiveStudentId as any, term: "Term 1 2025" } : "skip"
    );

    // Also fetch trends
    const trends = useQuery(
        api.cbc_reports.getCompetencyTrends,
        effectiveStudentId ? { studentId: effectiveStudentId as any } : "skip"
    );

    const isLoading = !reportData || (effectiveStudentId && !trends);

    if (!effectiveStudentId) {
        return <div className="p-4 text-center text-zinc-500">Student ID required or user not found.</div>;
    }

    if (isLoading) {
        return (
            <div className="space-y-6 print-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    // Merge trend data into competency data
    const enrichedCompetencies = reportData?.competencies.map(comp => {
        const trendInfo = trends?.find(t => t.competency === comp.competency);
        return {
            ...comp,
            trend: trendInfo?.trendDirection || "stable"
        };
    }) || [];

    const getLevelColor = (level: string | null) => {
        switch (level) {
            case "EE": return "bg-green-100 text-green-700 border-green-200";
            case "ME": return "bg-blue-100 text-blue-700 border-blue-200";
            case "AE": return "bg-orange-100 text-orange-700 border-orange-200";
            case "BE": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "improving": return <TrendingUp className="h-3 w-3 text-green-500" />;
            case "declining": return <TrendingDown className="h-3 w-3 text-red-500" />;
            default: return <Minus className="h-3 w-3 text-gray-500" />;
        }
    };

    // Calculate progress percentage based on level value (simple mapping)
    const getProgress = (level: string | null) => {
        switch (level) {
            case 'EE': return 100;
            case 'ME': return 75;
            case 'AE': return 50;
            case 'BE': return 25;
            default: return 0;
        }
    };

    const overallProgress = reportData?.statistics?.totalAssessed
        ? Math.round((reportData.statistics.meetingStandards / reportData.statistics.totalAssessed) * 100)
        : 0;

    const handlePrint = () => {
        window.print();
    };

    const getIcon = (id: string, className: string) => {
        switch (id) {
            case "communication_collaboration": return <Users className={className} />;
            case "self_efficacy": return <Target className={className} />;
            case "critical_thinking": return <Brain className={className} />;
            case "creativity_imagination": return <Palette className={className} />;
            case "citizenship": return <Globe className={className} />;
            case "digital_literacy": return <Monitor className={className} />;
            case "learning_to_learn": return <BookOpen className={className} />;
            default: return <Brain className={className} />;
        }
    };

    return (
        <>
            {/* Printable Component (Hidden on screen) */}
            {reportData && (
                <CBCPrintableReport
                    studentName={reportData.student.name}
                    studentGrade={reportData.student.grade || "N/A"}
                    term={reportData.term}
                    generatedAt={reportData.generatedAt}
                    competencies={reportData.competencies}
                    statistics={reportData.statistics}
                />
            )}

            {/* Screen Dashboard */}
            <div className="space-y-6 print-hidden">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Overall Performance</CardTitle>
                            <Brain className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{overallProgress}%</div>
                            <Progress value={overallProgress} className="mt-2 h-2" />
                            <p className="text-xs text-zinc-500 mt-1">Meeting Standards Rate</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Competencies Met</CardTitle>
                            <Award className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">
                                {reportData?.statistics.meetingStandards}/{reportData?.statistics.totalCompetencies}
                            </div>
                            <p className="text-xs text-zinc-500">Meeting or exceeding expectations</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Evidence Items</CardTitle>
                            <FileText className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{reportData?.statistics.portfolioItems}</div>
                            <p className="text-xs text-zinc-500">Total evidence collected</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Assessments</CardTitle>
                            <Calendar className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-zinc-900">{reportData?.statistics.assessmentCount}</div>
                            <p className="text-xs text-zinc-500">Total assessments this term</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Competency View */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="detailed">Detailed View</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Core Competency Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {enrichedCompetencies.map((competency) => (
                                        <div
                                            key={competency.competency}
                                            className="border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                                        {getIcon(competency.competency, "h-4 w-4")}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-sm text-zinc-900 leading-tight">
                                                            {competency.name}
                                                        </h4>
                                                        <p className="text-xs text-zinc-500">
                                                            {competency.evidence?.length || 0} evidence
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn("text-xs font-semibold", getLevelColor(competency.level))}
                                                    >
                                                        {competency.level || "N/A"}
                                                    </Badge>
                                                    {getTrendIcon(competency.trend)}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-zinc-500">
                                                    <span>Progress</span>
                                                    <span>{getProgress(competency.level)}%</span>
                                                </div>
                                                <Progress value={getProgress(competency.level)} className="h-1.5" />
                                                <p className="text-xs text-zinc-500">
                                                    Last: {competency.assessmentDate ? new Date(competency.assessmentDate).toLocaleDateString() : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="detailed" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detailed Competency Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {enrichedCompetencies.map((competency) => (
                                        <div
                                            key={competency.competency}
                                            className="border border-zinc-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                                    {getIcon(competency.competency, "h-5 w-5")}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold">{competency.name}</h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn("text-xs", getLevelColor(competency.level))}
                                                        >
                                                            {competency.levelName}
                                                        </Badge>
                                                        {getTrendIcon(competency.trend)}
                                                    </div>
                                                    <p className="text-sm text-zinc-600">
                                                        Last assessed: {competency.assessmentDate ? new Date(competency.assessmentDate).toLocaleDateString() : 'Never'}
                                                    </p>
                                                    {competency.comments && (
                                                        <p className="text-sm text-zinc-500 mt-1 italic">
                                                            "{competency.comments}"
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-zinc-900">
                                                        {getProgress(competency.level)}%
                                                    </div>
                                                    <Progress value={getProgress(competency.level)} className="w-20 h-2" />

                                                    {isTeacher && studentId && (
                                                        <div className="mt-2">
                                                            <CompetencyAssessmentForm
                                                                studentId={studentId as any}
                                                                studentName={reportData.student.name}
                                                                grade={reportData.student.grade || "N/A"}
                                                                currentTerm={reportData.term}
                                                                onSuccess={() => {/* Refetch handled by Convex reactivity */ }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Competency Reports</span>
                                    <Button size="sm" variant="outline" onClick={handlePrint}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print Report
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-zinc-200 rounded-lg p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium mb-1">Term Assessment Report</h4>
                                                <p className="text-sm text-zinc-600 mb-3">
                                                    Complete competency assessment for current term ({reportData?.term}).
                                                </p>
                                                <Button size="sm" className="w-full" onClick={handlePrint}>
                                                    <Printer className="h-4 w-4 mr-2" />
                                                    Generate & Print
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Placeholder for future report types */}
                                    <div className="border border-zinc-200 rounded-lg p-4 opacity-75">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                                <TrendingUp className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium mb-1">Progress Summary</h4>
                                                <p className="text-sm text-zinc-600 mb-3">
                                                    Year-to-date competency development overview (Coming Soon)
                                                </p>
                                                <Button size="sm" variant="outline" disabled className="w-full">View Summary</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div >
        </>
    );
}