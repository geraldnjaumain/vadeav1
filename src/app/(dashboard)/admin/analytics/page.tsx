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
    AcademicCapIcon,
    UsersIcon,
    ClipboardDocumentCheckIcon
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { exportSchoolAnalyticsToCSV } from "@/lib/excel-export";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts";

const CBC_LEVEL_COLORS = {
    EE: "#10b981",
    ME: "#3b82f6",
    AE: "#f97316",
    BE: "#ef4444"
};

const PIE_COLORS = ["#10b981", "#3b82f6", "#f97316", "#ef4444"];

export default function AdminAnalyticsPage() {
    const [selectedTerm, setSelectedTerm] = useState("all");

    const schoolAnalytics = useQuery(
        api.cbc_analytics.getSchoolWideCBCAnalytics,
        selectedTerm === "all" ? {} : { term: selectedTerm }
    );
    const gradeComparison = useQuery(
        api.cbc_analytics.getGradeCohortComparison,
        selectedTerm === "all" ? {} : { term: selectedTerm }
    );
    const competencyDistribution = useQuery(
        api.cbc_analytics.getCompetencyDistribution,
        selectedTerm === "all" ? {} : { term: selectedTerm }
    );
    const termProgress = useQuery(api.cbc_analytics.getTermProgressAnalytics);

    if (
        schoolAnalytics === undefined ||
        gradeComparison === undefined ||
        competencyDistribution === undefined ||
        termProgress === undefined
    ) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!schoolAnalytics) {
        return (
            <div className="p-6">
                <p className="text-zinc-500">You do not have permission to view analytics.</p>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    // Prepare pie chart data for level distribution
    const pieData = competencyDistribution ? [
        { name: "Exceeds Expectations", value: competencyDistribution.levelDistribution.EE },
        { name: "Meets Expectations", value: competencyDistribution.levelDistribution.ME },
        { name: "Approaching Expectations", value: competencyDistribution.levelDistribution.AE },
        { name: "Below Expectations", value: competencyDistribution.levelDistribution.BE }
    ].filter(d => d.value > 0) : [];

    // Prepare bar chart data for grade comparison
    const gradeChartData = gradeComparison?.gradeComparison.map(g => ({
        grade: g.grade,
        "% Meeting Standards": g.percentMeetingStandards,
        "Avg Performance": g.averagePerformance
    })) || [];

    // Prepare line chart data for term progress
    const termChartData = termProgress?.termProgress.map(t => ({
        term: t.term.replace("Term ", "T"),
        "Students": t.studentCount,
        "% Meeting Standards": t.percentMeetingStandards
    })) || [];

    return (
        <div className="p-6 space-y-6 print:p-0">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">School CBC Analytics</h1>
                    <p className="text-zinc-500 mt-1">
                        School-wide competency performance overview
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Terms</SelectItem>
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
                        onClick={() => schoolAnalytics && exportSchoolAnalyticsToCSV(schoolAnalytics)}
                        className="gap-2"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-zinc-900">School CBC Analytics Report</h1>
                <p className="text-sm text-zinc-600 mt-2">
                    Generated: {new Date(schoolAnalytics.generatedAt).toLocaleString()}
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <UsersIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-zinc-900">
                                    {schoolAnalytics.totalStudents}
                                </p>
                                <p className="text-sm text-zinc-600">Students Assessed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-zinc-900">
                                    {schoolAnalytics.totalTeachers}
                                </p>
                                <p className="text-sm text-zinc-600">Active Teachers</p>
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
                                    {schoolAnalytics.totalAssessments}
                                </p>
                                <p className="text-sm text-zinc-600">Total Assessments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-lg">
                                <ChartBarIcon className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-emerald-600">
                                    {schoolAnalytics.overallPercentMeetingStandards}%
                                </p>
                                <p className="text-sm text-zinc-600">Meeting Standards</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Level Distribution Pie Chart */}
                <Card className="print:break-inside-avoid">
                    <CardHeader>
                        <CardTitle>Assessment Level Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: any) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-zinc-500">
                                No assessment data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Grade Comparison Bar Chart */}
                <Card className="print:break-inside-avoid">
                    <CardHeader>
                        <CardTitle>Grade Performance Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {gradeChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={gradeChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="grade" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="% Meeting Standards" fill="#10b981" />
                                    <Bar dataKey="Avg Performance" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-zinc-500">
                                No grade data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Term Progress Line Chart */}
            {termChartData.length > 0 && (
                <Card className="print:break-inside-avoid">
                    <CardHeader>
                        <CardTitle>Term-over-Term Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={termChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="term" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="Students" stroke="#8b5cf6" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="% Meeting Standards" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Competency Breakdown Table */}
            <Card className="print:break-inside-avoid">
                <CardHeader>
                    <CardTitle>Competency Performance Summary</CardTitle>
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
                                {schoolAnalytics.competencyDistribution.map((comp) => (
                                    <tr key={comp.competency} className="border-b border-zinc-100">
                                        <td className="py-3 px-2 font-medium">{comp.name}</td>
                                        <td className="text-center py-3 px-2">{comp.totalAssessments}</td>
                                        <td className="text-center py-3 px-2 text-green-600 font-semibold">
                                            {comp.levelDistribution.EE}
                                        </td>
                                        <td className="text-center py-3 px-2 text-blue-600 font-semibold">
                                            {comp.levelDistribution.ME}
                                        </td>
                                        <td className="text-center py-3 px-2 text-orange-600 font-semibold">
                                            {comp.levelDistribution.AE}
                                        </td>
                                        <td className="text-center py-3 px-2 text-red-600 font-semibold">
                                            {comp.levelDistribution.BE}
                                        </td>
                                        <td className="text-center py-3 px-2">
                                            <Badge variant="outline" className={cn(
                                                comp.percentMeetingStandards >= 70 && "bg-green-100 text-green-700",
                                                comp.percentMeetingStandards < 70 && comp.percentMeetingStandards >= 50 && "bg-orange-100 text-orange-700",
                                                comp.percentMeetingStandards < 50 && "bg-red-100 text-red-700"
                                            )}>
                                                {comp.percentMeetingStandards}%
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Print Footer */}
            <div className="hidden print:block border-t-2 border-zinc-900 pt-4 mt-8">
                <p className="text-sm text-zinc-600 text-center">
                    School CBC Analytics Report - Generated on {new Date(schoolAnalytics.generatedAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
}
