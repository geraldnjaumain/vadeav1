"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { toast } from "sonner";
import { CalendarIcon, Check, X, Clock, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

const statusConfig: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
    present: { label: "Present", color: "bg-green-100 text-green-800", icon: <Check className="h-4 w-4" /> },
    absent: { label: "Absent", color: "bg-red-100 text-red-800", icon: <X className="h-4 w-4" /> },
    late: { label: "Late", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4" /> },
    excused: { label: "Excused", color: "bg-blue-100 text-blue-800", icon: <UserCheck className="h-4 w-4" /> },
};

export default function TeacherAttendancePage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [savingId, setSavingId] = useState<string | null>(null);

    const students = useQuery(api.attendance.getAllStudents);
    const attendanceRecords = useQuery(api.attendance.getAttendanceByDate, {
        date: selectedDate.setHours(0, 0, 0, 0),
    });
    const takeAttendance = useMutation(api.attendance.takeAttendance);

    const getStudentStatus = (studentId: string): AttendanceStatus | null => {
        if (!attendanceRecords) return null;
        const record = attendanceRecords.find((r) => r.studentId === studentId);
        return record?.status as AttendanceStatus | null;
    };

    const handleMarkAttendance = async (studentId: string, status: AttendanceStatus) => {
        setSavingId(studentId);
        try {
            const dateAtMidnight = new Date(selectedDate);
            dateAtMidnight.setHours(0, 0, 0, 0);

            await takeAttendance({
                studentId: studentId as any,
                date: dateAtMidnight.getTime(),
                status,
            });
            toast.success(`Marked as ${status}`);
        } catch (error) {
            toast.error("Failed to save attendance");
        } finally {
            setSavingId(null);
        }
    };

    if (students === undefined) {
        return <LoadingAnimation message="Loading students..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Take Attendance</h1>
                    <p className="text-zinc-500">Mark daily attendance for your students.</p>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, "PPP")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student Roster</CardTitle>
                    <CardDescription>
                        {students.length} students | {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {students.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            No students found. Students will appear here once registered.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Current Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => {
                                    const currentStatus = getStudentStatus(student._id);
                                    return (
                                        <TableRow key={student._id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.grade || "N/A"}</TableCell>
                                            <TableCell>
                                                {currentStatus ? (
                                                    <Badge className={cn("gap-1", statusConfig[currentStatus].color)}>
                                                        {statusConfig[currentStatus].icon}
                                                        {statusConfig[currentStatus].label}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Not Marked</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Select
                                                    value={currentStatus || ""}
                                                    onValueChange={(value) =>
                                                        handleMarkAttendance(student._id, value as AttendanceStatus)
                                                    }
                                                    disabled={savingId === student._id}
                                                >
                                                    <SelectTrigger className="w-[130px]">
                                                        <SelectValue placeholder="Mark..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="present">Present</SelectItem>
                                                        <SelectItem value="absent">Absent</SelectItem>
                                                        <SelectItem value="late">Late</SelectItem>
                                                        <SelectItem value="excused">Excused</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
