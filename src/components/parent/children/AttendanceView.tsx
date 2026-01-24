"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WidgetSkeleton } from "@/components/ui/skeleton";
import { Check, X, Clock, AlertCircle, RefreshCw } from "lucide-react";

export function AttendanceView({ studentId }: { studentId: Id<"users"> }) {
    const attendance = useQuery(api.attendance.getStudentAttendance, { studentId });
    const seed = useMutation(api.attendance.seedAttendance);

    if (attendance === undefined) {
        // Return 4 widget skeletons to match the 4 cards structure
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <WidgetSkeleton />
                    <WidgetSkeleton />
                    <WidgetSkeleton />
                    <WidgetSkeleton />
                </div>
                <WidgetSkeleton />
            </div>
        );
    }

    // Stats calculation
    const total = attendance.length;
    const present = attendance.filter((a: any) => a.status === "present").length;
    const absent = attendance.filter((a: any) => a.status === "absent").length;
    const late = attendance.filter((a: any) => a.status === "late").length;

    // Avoid division by zero
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Attendance Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{rate}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Present Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{present}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Absences</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{absent}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Late Arrivals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{late}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Attendance History</CardTitle>
                        <CardDescription>Recent 30 days record</CardDescription>
                    </div>
                    {total === 0 && (
                        <Button variant="outline" size="sm" onClick={() => seed({ studentId })}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Generate Demo Data
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {total === 0 ? (
                        <div className="text-center py-8 text-zinc-500">No attendance records found.</div>
                    ) : (
                        <div className="space-y-4">
                            {attendance.map((record: any) => (
                                <div key={record._id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${record.status === 'present' ? 'bg-green-100 text-green-600' :
                                            record.status === 'absent' ? 'bg-red-100 text-red-600' :
                                                record.status === 'late' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            {record.status === 'present' && <Check className="h-4 w-4" />}
                                            {record.status === 'absent' && <X className="h-4 w-4" />}
                                            {record.status === 'late' && <Clock className="h-4 w-4" />}
                                            {record.status === 'excused' && <AlertCircle className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-zinc-900">
                                                {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </p>
                                            {record.remarks && <p className="text-xs text-zinc-500">{record.remarks}</p>}
                                        </div>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                            record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {record.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
