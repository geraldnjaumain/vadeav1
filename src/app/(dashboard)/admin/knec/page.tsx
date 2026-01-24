"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { ArrowDownTrayIcon, AcademicCapIcon } from "@heroicons/react/24/solid";

export default function AdminKnecPage() {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedType, setSelectedType] = useState<string>("KPSEA");

    const analytics = useQuery(api.knec.getSchoolKnecAnalytics, {
        year: selectedYear,
        assessmentType: selectedType
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">National Assessments (KNEC)</h1>
                    <p className="text-zinc-500 mt-1">School-wide performance on national exams</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="p-2 border rounded-md"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="KPSEA">KPSEA (Grade 6)</option>
                        <option value="KILEA">KILEA (Intermediate)</option>
                        <option value="KCBE">KCBE (Basic Education)</option>
                    </select>
                    <select
                        className="p-2 border rounded-md"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        <option value={2025}>2025</option>
                        <option value={2024}>2024</option>
                        <option value={2023}>2023</option>
                    </select>
                </div>
            </div>

            {analytics ? (
                <div className="space-y-6">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{analytics.totalCandidates}</p>
                                        <p className="text-sm text-zinc-500">Total Candidates</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {Math.round(analytics.averageScore)}
                                    </p>
                                    <p className="text-sm text-zinc-500">School Average Score</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Subject Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={analytics.subjectPerformance}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="subject" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="average" fill="#8884d8" name="Average Score" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end">
                        <Button variant="outline" className="gap-2">
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Export Results (CSV)
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            )}
        </div>
    );
}
