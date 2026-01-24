"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
    DocumentTextIcon,
    ArrowDownTrayIcon,
    ChartBarIcon,
    CheckCircleIcon,
    XCircleIcon
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { CBCProgressChart } from "@/components/cbc/CBCProgressChart";

const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", color: "bg-green-100 text-green-700 border-green-300" },
    { id: "ME", name: "Meets Expectations", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "AE", name: "Approaching Expectations", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { id: "BE", name: "Below Expectations", color: "bg-red-100 text-red-700 border-red-300" }
] as const;

export default function StudentReportsPage() {
    const [selectedTerm, setSelectedTerm] = useState("Term 1 2025");
    const user = useQuery(api.users.currentUser);
    const cbcReport = useQuery(
        api.cbc_reports.generateStudentCBCReport,
        user?._id ? { studentId: user._id, term: selectedTerm } : "skip"
    );

    if (user === undefined || cbcReport === undefined) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-32 w-full" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
                </div>
            </div>
        );
    }

    if (!cbcReport) {
        return (
            <div className="p-6">
                <p className="text-zinc-500">Unable to generate report.</p>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const getLevelBadge = (level: string | null) => {
        if (!level) return <Badge variant="outline" className="text-xs">Not Assessed</Badge>;
        const levelData = CBC_LEVELS.find(l => l.id === level);
        return (
            <Badge variant="outline" className={cn("text-xs font-semibold", levelData?.color)}>
                {level}
            </Badge>
        );
    };

    const stats = cbcReport.statistics;

    return (
        <div className="p-6 space-y-6 print:p-0">
            {/* Header - Hide print button when printing */}
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">My CBC Progress Reports</h1>
                    <p className="text-zinc-500 mt-1">
                        View your Competency-Based Curriculum progress
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Term 1 2025">Term 1 2025</SelectItem>
                            <SelectItem value="Term 2 2025">Term 2 2025</SelectItem>
                            <SelectItem value="Term 3 2025">Term 3 2025</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handlePrint} className="gap-2">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Print Report
                    </Button>
                </div>
            </div>

            {/* Print Header - Only visible when printing */}
            <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-zinc-900">CBC Progress Report</h1>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p className="text-sm text-zinc-600">Student Name:</p>
                        <p className="font-semibold">{cbcReport.student.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Grade:</p>
                        <p className="font-semibold">{cbcReport.student.grade}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Term:</p>
                        <p className="font-semibold">{cbcReport.term}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Generated:</p>
                        <p className="font-semibold">{new Date(cbcReport.generatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">
                                {stats.totalAssessed}/7
                            </p>
                            <p className="text-sm text-zinc-600 mt-1">Competencies Assessed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">
                                {stats.meetingStandards}
                            </p>
                            <p className="text-sm text-zinc-600 mt-1">Meeting Standards</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-purple-600">
                                {stats.portfolioItems}
                            </p>
                            <p className="text-sm text-zinc-600 mt-1">Portfolio Items</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-zinc-900">
                                {stats.assessmentCount}
                            </p>
                            <p className="text-sm text-zinc-600 mt-1">Total Assessments</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabbed Content - Report and Charts */}
            <Tabs defaultValue="report" className="print:hidden">
                <TabsList className="mb-4">
                    <TabsTrigger value="report" className="gap-2">
                        <DocumentTextIcon className="h-4 w-4" />
                        Term Report
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="gap-2">
                        <ChartBarIcon className="h-4 w-4" />
                        Progress Charts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="report">
                    {/* Competency Report */}
                    <Card className="print:break-inside-avoid">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                                CBC Competency Report - {selectedTerm}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cbcReport.competencies.map((comp) => (
                                    <div
                                        key={comp.competency}
                                        className="border border-zinc-200 rounded-lg p-4 print:break-inside-avoid"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-2xl">{comp.icon}</span>
                                                    <h3 className="font-semibold text-zinc-900">{comp.name}</h3>
                                                </div>
                                                <p className="text-sm text-zinc-500">
                                                    {comp.assessmentCount} {comp.assessmentCount === 1 ? "assessment" : "assessments"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {getLevelBadge(comp.level)}
                                                {comp.level && (
                                                    <p className="text-xs text-zinc-500 mt-1">{comp.levelName}</p>
                                                )}
                                            </div>
                                        </div>

                                        {comp.level && (
                                            <>
                                                {comp.evidence && comp.evidence.length > 0 && (
                                                    <div className="bg-zinc-50 rounded-lg p-3 mb-3">
                                                        <p className="text-xs font-medium text-zinc-700 mb-2">Evidence:</p>
                                                        <ul className="text-sm text-zinc-600 space-y-1">
                                                            {comp.evidence.map((ev, idx) => (
                                                                <li key={idx} className="flex items-start gap-2">
                                                                    <span className="text-blue-600 mt-1">•</span>
                                                                    <span>{ev}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {comp.comments && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <p className="text-sm text-blue-900 italic">"{comp.comments}"</p>
                                                    </div>
                                                )}

                                                {comp.assessmentDate && (
                                                    <p className="text-xs text-zinc-500 mt-2">
                                                        Last assessed: {new Date(comp.assessmentDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="charts">
                    {user?._id && <CBCProgressChart studentId={user._id} />}
                </TabsContent>
            </Tabs>

            {/* Print-only Competency Report (always visible when printing) */}
            <div className="hidden print:block">
                <Card className="print:break-inside-avoid">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                            CBC Competency Report - {selectedTerm}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {cbcReport.competencies.map((comp) => (
                                <div
                                    key={comp.competency}
                                    className="border border-zinc-200 rounded-lg p-4 print:break-inside-avoid"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-2xl">{comp.icon}</span>
                                                <h3 className="font-semibold text-zinc-900">{comp.name}</h3>
                                            </div>
                                            <p className="text-sm text-zinc-500">
                                                {comp.assessmentCount} {comp.assessmentCount === 1 ? "assessment" : "assessments"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {getLevelBadge(comp.level)}
                                            {comp.level && (
                                                <p className="text-xs text-zinc-500 mt-1">{comp.levelName}</p>
                                            )}
                                        </div>
                                    </div>

                                    {comp.level && (
                                        <>
                                            {comp.evidence && comp.evidence.length > 0 && (
                                                <div className="bg-zinc-50 rounded-lg p-3 mb-3">
                                                    <p className="text-xs font-medium text-zinc-700 mb-2">Evidence:</p>
                                                    <ul className="text-sm text-zinc-600 space-y-1">
                                                        {comp.evidence.map((ev, idx) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <span className="text-blue-600 mt-1">•</span>
                                                                <span>{ev}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {comp.comments && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <p className="text-sm text-blue-900 italic">"{comp.comments}"</p>
                                                </div>
                                            )}

                                            {comp.assessmentDate && (
                                                <p className="text-xs text-zinc-500 mt-2">
                                                    Last assessed: {new Date(comp.assessmentDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block border-t-2 border-zinc-900 pt-4 mt-8">
                <p className="text-sm text-zinc-600 text-center">
                    This report was generated on {new Date(cbcReport.generatedAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
}
