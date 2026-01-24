"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", color: "bg-green-100 text-green-700 border-green-300", value: 4 },
    { id: "ME", name: "Meets Expectations", color: "bg-blue-100 text-blue-700 border-blue-300", value: 3 },
    { id: "AE", name: "Approaching Expectations", color: "bg-orange-100 text-orange-700 border-orange-300", value: 2 },
    { id: "BE", name: "Below Expectations", color: "bg-red-100 text-red-700 border-red-300", value: 1 }
] as const;

export default function CompetencyDetailPage() {
    const params = useParams();
    const competencyId = params.id as string;

    const user = useQuery(api.users.currentUser);
    const summary = useQuery(api.cbc_queries.getStudentCompetencySummary,
        user ? { studentId: user._id } : "skip"
    );
    const portfolio = useQuery(api.cbc.getStudentPortfolio,
        user ? { studentId: user._id, competency: competencyId } : "skip"
    );

    if (!user || !summary || !portfolio) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const competencyData = summary.find(c => c.competency === competencyId);

    if (!competencyData) {
        return <div className="p-6">Competency not found</div>;
    }

    // Prepare chart data
    const chartData = competencyData.allAssessments
        .slice()
        .reverse()
        .map(a => ({
            date: new Date(a.assessmentDate).toLocaleDateString(),
            level: CBC_LEVELS.find(l => l.id === a.level)?.value || 0,
            levelName: a.level
        }));

    const currentLevel = CBC_LEVELS.find(l => l.id === competencyData.latestLevel);
    const progressValue = currentLevel ? (currentLevel.value / 4) * 100 : 0;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl text-3xl">
                    {competencyData.icon}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">{competencyData.name}</h1>
                    <p className="text-zinc-500">Track your growth and evidence</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Status */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Current Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-6">
                            <Badge className={cn("text-lg px-4 py-1 mb-4", currentLevel?.color)} variant="outline">
                                {currentLevel?.name || "Not Assessed"}
                            </Badge>
                            <Progress value={progressValue} className="h-4 w-full mt-4" />
                            <p className="text-sm text-zinc-500 mt-2">
                                Based on {competencyData.assessmentCount} assessments
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Growth Chart */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Growth Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="level"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Evidence & Feedback */}
            <Card>
                <CardHeader>
                    <CardTitle>Evidence & Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    {portfolio.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            No evidence uploaded for this competency yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {portfolio.map((item) => (
                                <div key={item._id} className="border p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">{item.title}</h3>
                                            <p className="text-sm text-zinc-600 mt-1">{item.description}</p>
                                        </div>
                                        <div className="text-right text-xs text-zinc-400">
                                            {new Date(item.submittedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {item.feedback && (
                                        <div className="mt-3 bg-zinc-50 p-3 rounded text-sm italic text-zinc-600 border-l-4 border-blue-400">
                                            " {item.feedback} "
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Helper
function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
