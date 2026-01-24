"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    LineChart,
    Line,
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

const TREND_COLORS = {
    improving: "#10b981",
    stable: "#3b82f6",
    declining: "#ef4444",
    no_data: "#9ca3af"
};

interface CBCProgressChartProps {
    studentId: Id<"users">;
    showRadar?: boolean;
}

export function CBCProgressChart({ studentId, showRadar = true }: CBCProgressChartProps) {
    const trends = useQuery(
        api.cbc_reports.getCompetencyTrends,
        { studentId }
    );

    if (trends === undefined) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[300px] w-full" />
                {showRadar && <Skeleton className="h-[300px] w-full" />}
            </div>
        );
    }

    if (!trends || trends.length === 0) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-zinc-500">No competency assessment data available yet.</p>
                </CardContent>
            </Card>
        );
    }

    // Prepare data for line chart - show progression over time for each competency
    // We'll create a unified timeline from all assessments
    const allDates = new Set<number>();
    trends.forEach(t => t.progression.forEach(p => allDates.add(p.date)));
    const sortedDates = Array.from(allDates).sort((a, b) => a - b);

    // Create timeline data
    const timelineData = sortedDates.slice(-10).map(date => {
        const dataPoint: Record<string, unknown> = {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };

        trends.forEach(t => {
            const assessment = t.progression.find(p => p.date === date);
            if (assessment) {
                dataPoint[t.name.split(' ')[0]] = assessment.value; // Use first word as key
            }
        });

        return dataPoint;
    });

    // Prepare radar chart data - current state of all competencies
    const radarData = trends.map(t => {
        const latest = t.progression[t.progression.length - 1];
        return {
            competency: t.name.split(' ')[0], // First word
            fullName: t.name,
            value: latest ? latest.value * 25 : 0, // 0-100 scale
            trend: t.trendDirection
        };
    });

    // Color palette for line chart
    const lineColors = [
        "#3b82f6", "#10b981", "#f97316", "#8b5cf6",
        "#ec4899", "#06b6d4", "#eab308"
    ];

    return (
        <div className="space-y-6">
            {/* Timeline Line Chart */}
            {timelineData.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Competency Progress Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis
                                    domain={[0, 4]}
                                    ticks={[1, 2, 3, 4]}
                                    tickFormatter={(v) => {
                                        const labels: Record<number, string> = { 1: 'BE', 2: 'AE', 3: 'ME', 4: 'EE' };
                                        return labels[v] || '';
                                    }}
                                />
                                <Tooltip
                                    formatter={(value: number) => {
                                        const labels: Record<number, string> = {
                                            1: 'Below Expectations',
                                            2: 'Approaching Expectations',
                                            3: 'Meets Expectations',
                                            4: 'Exceeds Expectations'
                                        };
                                        return labels[value] || value;
                                    }}
                                />
                                <Legend />
                                {trends.map((t, idx) => (
                                    <Line
                                        key={t.competency}
                                        type="monotone"
                                        dataKey={t.name.split(' ')[0]}
                                        stroke={lineColors[idx % lineColors.length]}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Radar Chart */}
            {showRadar && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Current Competency Profile</CardTitle>
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
            )}

            {/* Trend Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Competency Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {trends.map(t => (
                            <div
                                key={t.competency}
                                className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                            >
                                <span className="text-sm font-medium text-zinc-700 truncate flex-1">
                                    {t.name}
                                </span>
                                <span
                                    className="text-xs font-semibold px-2 py-1 rounded ml-2"
                                    style={{
                                        backgroundColor: `${TREND_COLORS[t.trendDirection]}20`,
                                        color: TREND_COLORS[t.trendDirection]
                                    }}
                                >
                                    {t.trendDirection === 'improving' && '↑ Improving'}
                                    {t.trendDirection === 'stable' && '→ Stable'}
                                    {t.trendDirection === 'declining' && '↓ Declining'}
                                    {t.trendDirection === 'no_data' && '- No Data'}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
