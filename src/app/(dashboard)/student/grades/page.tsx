"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, FileCheck } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import { format } from "date-fns";
import { GradesSkeleton } from "@/components/ui/skeleton";

export default function GradesPage() {
    const user = useQuery(api.users.currentUser);
    const results = useQuery(api.grades.getStudentResults, { studentId: user?._id! });

    if (results === undefined) {
        return <GradesSkeleton />;
    }

    // Process data for charts
    const chartData = results
        .sort((a, b) => a.gradedAt - b.gradedAt)
        .map(r => ({
            name: r.assignment?.title,
            score: r.score,
            date: format(new Date(r.gradedAt), "MMM d")
        }));

    // Calculate stats
    const averageScore = results.length > 0 ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length) : 0;
    const highestScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;
    const totalAssignments = results.length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Grades & Progress</h1>
                <p className="text-zinc-500">Monitor your academic performance</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-blue-100 bg-blue-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900">Average Grade</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600 fill-current" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{averageScore}%</div>
                        <p className="text-xs text-blue-600/80">Keep it up!</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Highest Score</CardTitle>
                        <Award className="h-4 w-4 text-zinc-400 fill-current" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{highestScore}%</div>
                        <p className="text-xs text-muted-foreground">Personal best</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Assignments Graded</CardTitle>
                        <FileCheck className="h-4 w-4 text-zinc-400 fill-current" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{totalAssignments}</div>
                        <p className="text-xs text-muted-foreground">Total submissions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Performance Chart */}
                <Card className="lg:col-span-2 border-zinc-200">
                    <CardHeader>
                        <CardTitle>Performance Trend</CardTitle>
                        <CardDescription>Your scores over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {results.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#71717A"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#71717A"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 100]}
                                        dx={-10}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #E4E4E7" }}
                                        itemStyle={{ color: "#2563EB", fontWeight: "bold" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#2563EB"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-zinc-400">
                                Not enough data to show chart
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Grades List */}
                <Card className="border-zinc-200 lg:row-span-2 h-full">
                    <CardHeader>
                        <CardTitle>Recent Feedback</CardTitle>
                        <CardDescription>Latest graded assignments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {results.slice(0, 5).map((result) => (
                                <div key={result._id} className="flex flex-col gap-1 pb-4 border-b border-zinc-100 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium text-sm text-zinc-900 line-clamp-1">{result.assignment?.title}</span>
                                        <Badge variant={result.score >= 80 ? "default" : "secondary"} className={result.score >= 80 ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                                            {result.score}%
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-zinc-500">{result.assignment?.subject}</span>
                                    {result.feedback && (
                                        <p className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded mt-1 italic">
                                            "{result.feedback}"
                                        </p>
                                    )}
                                </div>
                            ))}
                            {results.length === 0 && (
                                <div className="text-center text-zinc-500 py-8">No grades recorded yet.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
