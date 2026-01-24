"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ClipboardDocumentCheckIcon,
    UserGroupIcon,
    ChartBarIcon,
    ArrowDownTrayIcon,
    PrinterIcon
} from "@heroicons/react/24/solid";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetencyAssessmentForm } from "@/components/teacher/CompetencyAssessmentForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CBCDashboard } from "@/components/cbc/CBCDashboard";

const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", color: "bg-green-100 text-green-700 border-green-300" },
    { id: "ME", name: "Meets Expectations", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { id: "AE", name: "Approaching Expectations", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { id: "BE", name: "Below Expectations", color: "bg-red-100 text-red-700 border-red-300" }
] as const;

const CORE_COMPETENCIES = [
    { id: "communication_collaboration", name: "Communication & Collaboration", icon: "💬" },
    { id: "self_efficacy", name: "Self-Efficacy", icon: "🎯" },
    { id: "critical_thinking", name: "Critical Thinking", icon: "🧠" },
    { id: "creativity_imagination", name: "Creativity & Imagination", icon: "🎨" },
    { id: "citizenship", name: "Citizenship", icon: "🌍" },
    { id: "digital_literacy", name: "Digital Literacy", icon: "💻" },
    { id: "learning_to_learn", name: "Learning to Learn", icon: "📚" }
] as const;

export default function TeacherAssessmentsPage() {
    const recentAssessments = useQuery(api.cbc_queries.getTeacherRecentAssessments, { limit: 20 });
    const classOverview = useQuery(api.cbc_queries.getClassCompetencyOverview, {});

    // Fetch class report data which includes student list
    const classReport = useQuery(api.cbc_reports.generateClassReport, {});

    const user = useQuery(api.users.currentUser);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    if (user === undefined || recentAssessments === undefined || classOverview === undefined) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (classOverview === null) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    Unable to load class overview. You may not have teacher permissions.
                </div>
            </div>
        );
    }

    const getLevelBadge = (level: string) => {
        const levelData = CBC_LEVELS.find(l => l.id === level);
        return (
            <Badge variant="outline" className={cn("text-xs", levelData?.color)}>
                {level}
            </Badge>
        );
    };

    const getCompetencyName = (competencyId: string) => {
        const comp = CORE_COMPETENCIES.find(c => c.id === competencyId);
        return comp ? `${comp.icon} ${comp.name}` : competencyId;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">CBC Assessments</h1>
                    <p className="text-zinc-500 mt-1">
                        Manage competency-based curriculum assessments for your students
                    </p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Class Overview</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="reports">Student Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HistoryTable />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="overview" className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-zinc-900">
                                            {classOverview.totalStudents}
                                        </p>
                                        <p className="text-sm text-zinc-500">Students Assessed</p>
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
                                        <p className="text-2xl font-bold text-zinc-900">
                                            {classOverview.totalAssessments}
                                        </p>
                                        <p className="text-sm text-zinc-500">Total Assessments</p>
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
                                        <p className="text-2xl font-bold text-zinc-900">7</p>
                                        <p className="text-sm text-zinc-500">Core Competencies</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Assessments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Recent Assessments</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentAssessments.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500">
                                    <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No assessments yet.</p>
                                    <p className="text-sm mt-1">
                                        Start assessing students on CBC competencies.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentAssessments.map((assessment) => (
                                        <div
                                            key={assessment._id}
                                            className="flex items-start justify-between p-4 border border-zinc-200 rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start gap-4 flex-1">
                                                <img
                                                    src={assessment.studentImage || "/default-avatar.png"}
                                                    alt={assessment.studentName}
                                                    className="h-10 w-10 rounded-full"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-zinc-900">
                                                            {assessment.studentName}
                                                        </p>
                                                        {getLevelBadge(assessment.level)}
                                                    </div>
                                                    <p className="text-sm text-zinc-600">
                                                        {getCompetencyName(assessment.competency)}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 mt-1">
                                                        {assessment.grade} • {assessment.term}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-zinc-500">
                                                    {new Date(assessment.assessmentDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Competency Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Competency Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {classOverview.competencyStats.map((stat) => (
                                    <div key={stat.competency} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-zinc-900">
                                                {getCompetencyName(stat.competency)}
                                            </p>
                                            <Badge variant="secondary" className="text-xs">
                                                {stat.totalAssessments} assessments
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(["EE", "ME", "AE", "BE"] as const).map((level) => {
                                                const count = stat.levelDistribution[level];
                                                const percentage = stat.totalAssessments > 0
                                                    ? Math.round((count / stat.totalAssessments) * 100)
                                                    : 0;
                                                const levelData = CBC_LEVELS.find(l => l.id === level);

                                                return (
                                                    <div key={level} className={cn("text-center p-2 rounded border", levelData?.color)}>
                                                        <p className="text-lg font-bold">{count}</p>
                                                        <p className="text-xs">{level}</p>
                                                        <p className="text-xs opacity-75">{percentage}%</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!classReport ? (
                                <Skeleton className="h-64 w-full" />
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-sm text-zinc-500">
                                            Generate individual reports for students in your class.
                                        </p>
                                        <Button variant="outline" className="gap-2">
                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                            Export All (CSV)
                                        </Button>
                                    </div>

                                    <div className="border border-zinc-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                                <tr className="text-left text-zinc-500">
                                                    <th className="px-4 py-3 font-medium">Student Name</th>
                                                    <th className="px-4 py-3 font-medium">Grade</th>
                                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {classReport.students.map((student) => (
                                                    <tr key={student.id} className="hover:bg-zinc-50">
                                                        <td className="px-4 py-3 font-medium">{student.name}</td>
                                                        <td className="px-4 py-3 text-zinc-500">{student.grade}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                        onClick={() => setSelectedStudentId(student.id)}
                                                                    >
                                                                        <PrinterIcon className="h-4 w-4" />
                                                                        View Report
                                                                    </Button>
                                                                </DialogTrigger>
                                                                {selectedStudentId === student.id && (
                                                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                                        <div className="py-4">
                                                                            <CBCDashboard
                                                                                isTeacher={true}
                                                                                studentId={student.id}
                                                                                studentName={student.name}
                                                                            />
                                                                        </div>
                                                                    </DialogContent>
                                                                )}
                                                            </Dialog>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function HistoryTable() {
    const [selectedCompetency, setSelectedCompetency] = useState<string>("all");
    const history = useQuery(api.cbc_queries.getTeacherAssessmentsHistory, {
        competency: selectedCompetency === "all" ? undefined : selectedCompetency
    });

    if (!history) return <Skeleton className="h-64 w-full" />;

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <select
                    className="p-2 border rounded text-sm"
                    value={selectedCompetency}
                    onChange={(e) => setSelectedCompetency(e.target.value)}
                >
                    <option value="all">All Competencies</option>
                    {CORE_COMPETENCIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr className="text-left text-zinc-500">
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Student</th>
                            <th className="px-4 py-3 font-medium">Competency</th>
                            <th className="px-4 py-3 font-medium">Level</th>
                            <th className="px-4 py-3 font-medium">Term</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-500">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            history.map((assessment) => (
                                <tr key={assessment._id} className="hover:bg-zinc-50">
                                    <td className="px-4 py-3 text-zinc-500">
                                        {new Date(assessment.assessmentDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        <div className="flex items-center gap-2">
                                            {assessment.studentImage && (
                                                <img src={assessment.studentImage} alt="" className="w-6 h-6 rounded-full" />
                                            )}
                                            {assessment.studentName}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-600">
                                        {CORE_COMPETENCIES.find(c => c.id === assessment.competency)?.name || assessment.competency}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className={cn("text-xs", CBC_LEVELS.find(l => l.id === assessment.level)?.color)}>
                                            {assessment.level}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500">{assessment.term}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
