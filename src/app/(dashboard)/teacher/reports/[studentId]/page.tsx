"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
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
import { useState } from "react";
import {
    ChartBarIcon,
    ArrowDownTrayIcon,
    UserIcon,
    ClockIcon,
    AcademicCapIcon,
    ArrowLeftIcon
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip
} from "recharts";

const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", color: "bg-green-100 text-green-700 border-green-300", value: 4 },
    { id: "ME", name: "Meets Expectations", color: "bg-blue-100 text-blue-700 border-blue-300", value: 3 },
    { id: "AE", name: "Approaching Expectations", color: "bg-orange-100 text-orange-700 border-orange-300", value: 2 },
    { id: "BE", name: "Below Expectations", color: "bg-red-100 text-red-700 border-red-300", value: 1 }
] as const;

interface PageProps {
    params: Promise<{ studentId: string }>;
}

export default function TeacherStudentReportPage({ params }: PageProps) {
    const { studentId } = use(params);
    const [selectedTerm, setSelectedTerm] = useState("Term 1 2025");

    const report = useQuery(
        api.cbc_reports.generateStudentCBCReport,
        { studentId: studentId as Id<"users">, term: selectedTerm }
    );
    const trends = useQuery(
        api.cbc_reports.getCompetencyTrends,
        { studentId: studentId as Id<"users"> }
    );

    if (report === undefined || trends === undefined) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-32" />
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

    if (!report) {
        return (
            <div className="p-6">
                <Link href="/teacher/reports" className="flex items-center gap-2 text-blue-600 hover:underline mb-4">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Reports
                </Link>
                <p className="text-red-500">Unable to generate report. Student may not have any assessments.</p>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = ["Competency", "Level", "Level Name", "Assessment Count", "Evidence", "Comments"];
        const rows = report.competencies.map(c => [
            c.name,
            c.level || "N/A",
            c.levelName,
            c.assessmentCount,
            c.evidence.join("; "),
            c.comments
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `CBC_Report_${report.student.name}_${selectedTerm}.csv`;
        link.click();
    };

    // Prepare radar chart data
    const radarData = report.competencies.map(c => ({
        competency: c.name.split(" ")[0],
        fullName: c.name,
        value: c.level ? (CBC_LEVELS.find(l => l.id === c.level)?.value || 0) * 25 : 0
    }));

    return (
        <div className="p-6 space-y-6 print:p-0">
            {/* Back Button - Hide when printing */}
            <div className="print:hidden">
                <Link href="/teacher/reports" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Class Reports
                </Link>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">
                        {report.student.name}'s CBC Report
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Individual competency assessment report
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Term 1 2025">Term 1 2025</SelectItem>
                            <SelectItem value="Term 2 2025">Term 2 2025</SelectItem>
                            <SelectItem value="Term 3 2025">Term 3 2025</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handlePrint} variant="outline" className="gap-2">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Print
                    </Button>
                    <Button onClick={handleExportCSV} className="gap-2">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-zinc-900">CBC Progress Report</h1>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p className="text-sm text-zinc-600">Student:</p>
                        <p className="font-semibold">{report.student.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Grade:</p>
                        <p className="font-semibold">{report.student.grade || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Term:</p>
                        <p className="font-semibold">{report.term}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Generated:</p>
                        <p className="font-semibold">{new Date(report.generatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Student Info Card */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white print:border print:bg-white">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                            {report.student.image ? (
                                <img
                                    src={report.student.image}
                                    alt={report.student.name}
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            ) : (
                                <UserIcon className="h-8 w-8 text-blue-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-zinc-900">{report.student.name}</h2>
                            <p className="text-zinc-600">{report.student.email}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-6 text-center">
                            <div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {report.statistics.totalAssessed}/7
                                </p>
                                <p className="text-xs text-zinc-600">Assessed</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">
                                    {report.statistics.meetingStandards}
                                </p>
                                <p className="text-xs text-zinc-600">Meeting Standards</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-600">
                                    {report.statistics.assessmentCount}
                                </p>
                                <p className="text-xs text-zinc-600">Assessments</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-600">
                                    {report.statistics.portfolioItems}
                                </p>
                                <p className="text-xs text-zinc-600">Portfolio Items</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="print:break-inside-avoid">
                <CardHeader>
                    <CardTitle>Competency Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="competency" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar
                                name="Current Level"
                                dataKey="value"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.5}
                            />
                            <Tooltip
                                formatter={(value: number, name: string, props: { payload?: { fullName?: string } }) => [
                                    `${Math.round(value)}%`,
                                    props.payload?.fullName || name
                                ]}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Competency Cards Grid */}
            <div>
                <h2 className="text-xl font-semibold text-zinc-900 mb-4">
                    Competency Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
                    {report.competencies.map((competency) => {
                        const levelData = competency.level
                            ? CBC_LEVELS.find(l => l.id === competency.level)
                            : null;
                        const trend = trends?.find(t => t.competency === competency.competency);

                        return (
                            <Card
                                key={competency.competency}
                                className={cn(
                                    "border-2 print:break-inside-avoid",
                                    levelData && (competency.level === "ME" || competency.level === "EE")
                                        ? "border-emerald-200"
                                        : "border-zinc-200"
                                )}
                            >
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">{competency.icon}</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-zinc-900 leading-tight text-sm">
                                                    {competency.name}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Level Badge */}
                                        {competency.level && levelData ? (
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className={cn("text-xs font-semibold", levelData.color)}>
                                                    {competency.level} - {levelData.name}
                                                </Badge>
                                                {trend && trend.trendDirection !== "no_data" && (
                                                    <span className={cn(
                                                        "text-xs font-semibold",
                                                        trend.trendDirection === "improving" && "text-green-600",
                                                        trend.trendDirection === "declining" && "text-red-600",
                                                        trend.trendDirection === "stable" && "text-blue-600"
                                                    )}>
                                                        {trend.trendDirection === "improving" && "↑"}
                                                        {trend.trendDirection === "declining" && "↓"}
                                                        {trend.trendDirection === "stable" && "→"}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="text-xs text-zinc-500">
                                                Not Assessed
                                            </Badge>
                                        )}

                                        {/* Evidence */}
                                        {competency.evidence.length > 0 && (
                                            <div className="bg-zinc-50 rounded-lg p-3">
                                                <p className="text-xs font-medium text-zinc-700 mb-2">Evidence:</p>
                                                <ul className="text-xs text-zinc-600 space-y-1">
                                                    {competency.evidence.slice(0, 3).map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-1">
                                                            <span className="text-blue-500">•</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Comments */}
                                        {competency.comments && (
                                            <p className="text-xs text-zinc-600 italic border-l-2 border-blue-200 pl-2">
                                                "{competency.comments}"
                                            </p>
                                        )}

                                        {/* Assessment Date */}
                                        {competency.assessmentDate && (
                                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                <ClockIcon className="h-3 w-3" />
                                                {new Date(competency.assessmentDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block border-t-2 border-zinc-900 pt-4 mt-8">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-sm font-semibold text-zinc-700">Teacher's Signature:</p>
                        <div className="border-b border-zinc-400 h-8 mt-4"></div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-700">Date:</p>
                        <div className="border-b border-zinc-400 h-8 mt-4"></div>
                    </div>
                </div>
                <p className="text-xs text-zinc-500 text-center mt-6">
                    This report was generated on {new Date(report.generatedAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
}
