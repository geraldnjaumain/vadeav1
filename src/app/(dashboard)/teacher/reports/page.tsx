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
import { useState } from "react";
import {
    ChartBarIcon,
    ArrowDownTrayIcon,
    UsersIcon,
    ClipboardDocumentCheckIcon
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { exportCBCClassReportToCSV } from "@/lib/excel-export";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts";

const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", color: "#10b981" },
    { id: "ME", name: "Meets Expectations", color: "#3b82f6" },
    { id: "AE", name: "Approaching Expectations", color: "#f97316" },
    { id: "BE", name: "Below Expectations", color: "#ef4444" }
] as const;

export default function TeacherReportsPage() {
    const [selectedTerm, setSelectedTerm] = useState("Term 1 2025");
    const [selectedGrade, setSelectedGrade] = useState("all");

    const user = useQuery(api.users.currentUser);
    const classReport = useQuery(
        api.cbc_reports.generateClassReport,
        {
            term: selectedTerm,
            grade: selectedGrade === "all" ? undefined : selectedGrade
        }
    );

    if (user === undefined || classReport === undefined) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!classReport) {
        return (
            <div className="p-6">
                <p className="text-zinc-500">Unable to generate class report.</p>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    // Prepare chart data
    const competencyChartData = classReport.competencyStats.map(stat => ({
        name: stat.name.length > 20 ? stat.name.substring(0, 17) + "..." : stat.name,
        fullName: stat.name,
        EE: stat.levelDistribution.EE,
        ME: stat.levelDistribution.ME,
        AE: stat.levelDistribution.AE,
        BE: stat.levelDistribution.BE,
        meetingStandards: stat.percentageMeetingStandards
    }));

    // Radar chart data
    const radarData = classReport.competencyStats.map(stat => ({
        competency: stat.name.split(' ')[0], // First word only
        fullName: stat.name,
        performance: stat.averagePerformance * 25 // Convert to 0-100 scale
    }));

    return (
        <div className="p-6 space-y-6 print:p-0">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Class CBC Reports</h1>
                    <p className="text-zinc-500 mt-1">
                        Analyze class-wide competency performance
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Grades</SelectItem>
                            <SelectItem value="Grade 1">Grade 1</SelectItem>
                            <SelectItem value="Grade 2">Grade 2</SelectItem>
                            <SelectItem value="Grade 3">Grade 3</SelectItem>
                            <SelectItem value="Grade 4">Grade 4</SelectItem>
                            <SelectItem value="Grade 5">Grade 5</SelectItem>
                            <SelectItem value="Grade 6">Grade 6</SelectItem>
                        </SelectContent>
                    </Select>
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
                        Print Report
                    </Button>
                    <Button
                        onClick={() => classReport && exportCBCClassReportToCSV(classReport)}
                        className="gap-2"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-zinc-900">Class CBC Performance Report</h1>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p className="text-sm text-zinc-600">Grade:</p>
                        <p className="font-semibold">{classReport.grade}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Term:</p>
                        <p className="font-semibold">{classReport.term}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Total Students:</p>
                        <p className="font-semibold">{classReport.totalStudents}</p>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-600">Generated:</p>
                        <p className="font-semibold">{new Date(classReport.generatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <UsersIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-zinc-900">
                                    {classReport.totalStudents}
                                </p>
                                <p className="text-sm text-zinc-600">Students</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-zinc-900">
                                    {classReport.totalAssessments}
                                </p>
                                <p className="text-sm text-zinc-600">Total Assessments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <ChartBarIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-zinc-900">7</p>
                                <p className="text-sm text-zinc-600">Competencies</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Competency Performance Chart */}
            <Card className="print:break-inside-avoid">
                <CardHeader>
                    <CardTitle>Competency Performance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={competencyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: 'Number of Assessments', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="EE" stackId="a" fill={CBC_LEVELS[0].color} name="Exceeds Expectations" />
                            <Bar dataKey="ME" stackId="a" fill={CBC_LEVELS[1].color} name="Meets Expectations" />
                            <Bar dataKey="AE" stackId="a" fill={CBC_LEVELS[2].color} name="Approaching Expectations" />
                            <Bar dataKey="BE" stackId="a" fill={CBC_LEVELS[3].color} name="Below Expectations" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Radar Chart - Class Average Performance */}
            <Card className="print:break-inside-avoid">
                <CardHeader>
                    <CardTitle>Class Average Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="competency" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar name="Performance" dataKey="performance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Detailed Statistics Table */}
            <Card className="print:break-inside-avoid">
                <CardHeader>
                    <CardTitle>Detailed Competency Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200">
                                    <th className="text-left py-3 px-2">Competency</th>
                                    <th className="text-center py-3 px-2">Total</th>
                                    <th className="text-center py-3 px-2">EE</th>
                                    <th className="text-center py-3 px-2">ME</th>
                                    <th className="text-center py-3 px-2">AE</th>
                                    <th className="text-center py-3 px-2">BE</th>
                                    <th className="text-center py-3 px-2">Meeting Standards</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classReport.competencyStats.map((stat) => (
                                    <tr key={stat.competency} className="border-b border-zinc-100">
                                        <td className="py-3 px-2 font-medium">{stat.name}</td>
                                        <td className="text-center py-3 px-2">{stat.totalAssessments}</td>
                                        <td className="text-center py-3 px-2 text-green-600 font-semibold">
                                            {stat.levelDistribution.EE}
                                        </td>
                                        <td className="text-center py-3 px-2 text-blue-600 font-semibold">
                                            {stat.levelDistribution.ME}
                                        </td>
                                        <td className="text-center py-3 px-2 text-orange-600 font-semibold">
                                            {stat.levelDistribution.AE}
                                        </td>
                                        <td className="text-center py-3 px-2 text-red-600 font-semibold">
                                            {stat.levelDistribution.BE}
                                        </td>
                                        <td className="text-center py-3 px-2">
                                            <Badge variant="outline" className={cn(
                                                stat.percentageMeetingStandards >= 70 && "bg-green-100 text-green-700",
                                                stat.percentageMeetingStandards < 70 && stat.percentageMeetingStandards >= 50 && "bg-orange-100 text-orange-700",
                                                stat.percentageMeetingStandards < 50 && "bg-red-100 text-red-700"
                                            )}>
                                                {Math.round(stat.percentageMeetingStandards)}%
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Student List - Individual Reports */}
            {classReport.students && classReport.students.length > 0 && (
                <Card className="print:hidden">
                    <CardHeader>
                        <CardTitle>Individual Student Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-500 mb-4">
                            Click on a student to view their detailed CBC report
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {classReport.students.map((student) => (
                                <a
                                    key={student.id}
                                    href={`/teacher/reports/${student.id}`}
                                    className="flex items-center gap-3 p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-blue-300 transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0">
                                        {student.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-zinc-900 truncate">{student.name}</p>
                                        <p className="text-xs text-zinc-500">{student.grade || "N/A"}</p>
                                    </div>
                                    <ChartBarIcon className="h-4 w-4 text-zinc-400" />
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Print Footer */}
            <div className="hidden print:block border-t-2 border-zinc-900 pt-4 mt-8">
                <p className="text-sm text-zinc-600 text-center">
                    This report was generated on {new Date(classReport.generatedAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
}
