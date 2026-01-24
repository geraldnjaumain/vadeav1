"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { BeakerIcon, GlobeAltIcon, PaintBrushIcon } from "@heroicons/react/24/solid";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#cbd5e1'];

export default function AdminPathwaysPage() {
    const analytics = useQuery(api.admin.getPathwayAnalytics);

    if (!analytics) {
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

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Pathway Analytics</h1>
                <p className="text-zinc-500 mt-1">Student distribution across educational pathways (Junior Secondary)</p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <BeakerIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analytics.stats.STEM}</p>
                                <p className="text-sm text-zinc-500">STEM Enrollment</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <GlobeAltIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analytics.stats.social_sciences}</p>
                                <p className="text-sm text-zinc-500">Social Sciences</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <PaintBrushIcon className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{analytics.stats.arts_sports}</p>
                                <p className="text-sm text-zinc-500">Arts & Sports</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distribution Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pathway Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {analytics.distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Grade Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Breakdown by Grade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(analytics.byGrade).map(([grade, stats]) => (
                                <div key={grade} className="flex items-center justify-between p-2 border-b last:border-0 hover:bg-zinc-50">
                                    <span className="font-medium text-zinc-900">{grade}</span>
                                    <div className="flex gap-4 text-sm">
                                        <span className="text-purple-600 font-medium">STEM: {stats.STEM}</span>
                                        <span className="text-green-600 font-medium">Soc: {stats.social_sciences}</span>
                                        <span className="text-yellow-600 font-medium">Art: {stats.arts_sports}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
