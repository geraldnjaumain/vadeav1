"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import {
    Users,
    TrendingUp,
    Award,
    School
} from "lucide-react";

export function CBCAdminDashboard() {
    // Fetch School Wide Analytics
    const schoolStats = useQuery(api.cbc_analytics.getSchoolWideCBCAnalytics, {});

    // Fetch Grade Comparison
    const gradeComparison = useQuery(api.cbc_analytics.getGradeCohortComparison, {});

    if (!schoolStats || !gradeComparison) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
                <Skeleton className="h-[400px] w-full" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        );
    }

    // Prepare data for charts
    const gradePerformanceData = gradeComparison.gradeComparison.map(g => ({
        grade: g.grade,
        performance: g.averagePerformance, // 0-100 scale
        meetingStandards: g.percentMeetingStandards
    }));

    const competencyDistributionData = schoolStats.competencyDistribution.map(c => ({
        name: c.name,
        shortName: c.competency.split('_')[0].substring(0, 10) + '...', // Shorten for x-axis
        score: c.percentMeetingStandards
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">CBC School Analytics</h2>
                <p className="text-zinc-500">Overview of Competence Based Curriculum implementation and performance.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Total Assessments</CardTitle>
                        <Award className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{schoolStats.totalAssessments}</div>
                        <p className="text-xs text-zinc-500">Across all grades</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Meeting Standards</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{schoolStats.overallPercentMeetingStandards}%</div>
                        <Progress value={schoolStats.overallPercentMeetingStandards} className="mt-2 h-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Teachers Active</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{schoolStats.totalTeachers}</div>
                        <p className="text-xs text-zinc-500">Conducting assessments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Students Assessed</CardTitle>
                        <School className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{schoolStats.totalStudents}</div>
                        <p className="text-xs text-zinc-500">With at least one assessment</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Grade Performance Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradePerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="grade" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="meetingStandards" name="% Meeting Standards" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Competency Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={competencyDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="score" name="% Meeting Standards" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Grade Breakdown Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Grade Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-zinc-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Grade</th>
                                    <th className="px-4 py-3">Students</th>
                                    <th className="px-4 py-3">Assessments</th>
                                    <th className="px-4 py-3">Avg. Performance</th>
                                    <th className="px-4 py-3 rounded-r-lg">Meeting Standards</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {gradeComparison.gradeComparison.map((grade) => (
                                    <tr key={grade.grade} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-zinc-900">{grade.grade}</td>
                                        <td className="px-4 py-3">{grade.studentCount}</td>
                                        <td className="px-4 py-3">{grade.totalAssessments}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Progress value={grade.averagePerformance} className="w-16 h-1.5" />
                                                <span>{grade.averagePerformance}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={grade.percentMeetingStandards > 70 ? "default" : "secondary"}>
                                                {grade.percentMeetingStandards}%
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
