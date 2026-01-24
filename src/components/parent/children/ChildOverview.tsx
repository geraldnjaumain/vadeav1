"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/skeleton";
import { CalendarDays, BookOpen, CheckCircle2, Clock } from "lucide-react";

export function ChildOverview({ studentId }: { studentId: Id<"users"> }) {
    const stats = useQuery(api.parent_actions.getChildStats, { childId: studentId });

    if (stats === undefined) {
        return <PageSkeleton />;
    }

    if (stats === null) {
        return <div className="p-4 text-center text-zinc-500">Could not load stats.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                        <CalendarDays className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                        <p className="text-xs text-zinc-500">Present this term</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                        <BookOpen className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgPercentage}%</div>
                        <p className="text-xs text-zinc-500">Across all subjects</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingAssignmentsCount}</div>
                        <p className="text-xs text-zinc-500">Assignments due soon</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Class</CardTitle>
                        <Clock className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold truncate">{stats.nextClass.time}</div>
                        <p className="text-xs text-zinc-500 truncate">{stats.nextClass.title}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Placeholder activity items */}
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Completed "Fractions" Quiz</p>
                                    <p className="text-xs text-zinc-500">
                                        scored 85% · 2 hours ago
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-green-600">+85</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Attended Science Class</p>
                                    <p className="text-xs text-zinc-500">
                                        Yesterday at 2:00 PM
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-zinc-600">Present</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle>Upcoming Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-medium">Mathematics</p>
                                    <p className="text-xs text-zinc-500">10:00 AM - 11:00 AM</p>
                                </div>
                                <Button size="sm" variant="outline">Join</Button>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-medium">English Literature</p>
                                    <p className="text-xs text-zinc-500">11:30 AM - 12:30 PM</p>
                                </div>
                                <Button size="sm" variant="outline">Join</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
