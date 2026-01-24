"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, Video, FileEdit } from "lucide-react";
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
    const lessons = useQuery(api.lessons.getStudentLessons) || [];
    // Assuming we might have an assignments query for calendar or we filter local
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Real assignments
    const assignments = useQuery(api.assignments.getStudentAssignments, {}) || [];

    // Combine events
    const events = [
        ...lessons.map((l: any) => ({
            id: l._id,
            title: l.title,
            date: new Date(l.scheduledAt),
            type: "lesson",
            status: l.status
        })),
        ...assignments.map((a: any) => ({
            id: a._id,
            title: a.title,
            date: new Date(a.dueDate),
            type: "assignment",
            status: a.status || "pending"
        }))
    ];

    const selectedDateEvents = events.filter(e => date && isSameDay(e.date, date));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Calendar</h1>
                <p className="text-zinc-500">Manage your schedule and deadlines</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <Card className="lg:col-span-8 border-zinc-200">
                    <CardContent className="p-6">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="w-full border rounded-md p-4"
                            classNames={{
                                month: "space-y-4 w-full",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex",
                                row: "flex w-full mt-2",
                                head_cell: "text-zinc-500 rounded-md w-full font-normal text-[0.8rem]",
                                cell: "h-24 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-zinc-100 focus-within:relative focus-within:z-20",
                                day: cn(
                                    "h-full w-full p-2 font-normal aria-selected:opacity-100 hover:bg-zinc-50 flex flex-col items-start justify-start gap-1"
                                ),
                                day_selected: "bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600",
                                day_today: "bg-zinc-100 text-zinc-900",
                            }}
                            components={{
                                DayContent: (props) => {
                                    const dayEvents = events.filter(e => isSameDay(e.date, props.date));
                                    return (
                                        <div className="w-full h-full text-left">
                                            <div className="font-semibold mb-1">{format(props.date, "d")}</div>
                                            <div className="space-y-1">
                                                {dayEvents.slice(0, 3).map((e, i) => (
                                                    <div key={i} className={cn(
                                                        "text-[10px] px-1 py-0.5 rounded truncate font-medium border-l-2",
                                                        e.type === "lesson" ? "bg-blue-100 text-blue-700 border-blue-500" : "bg-orange-100 text-orange-700 border-orange-500"
                                                    )}>
                                                        {e.title}
                                                    </div>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <div className="text-[10px] text-zinc-400 pl-1">
                                                        +{dayEvents.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-4 border-zinc-200 h-full">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Events for {date ? format(date, "MMMM do, yyyy") : "Selected Date"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedDateEvents.length > 0 ? (
                            selectedDateEvents.map((event) => (
                                <div key={event.id} className="flex gap-4 p-3 rounded-lg border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:shadow-sm transition-all group">
                                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2",
                                        event.type === "lesson" ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-orange-50 border-orange-100 text-orange-600"
                                    )}>
                                        {event.type === "lesson" ? <Video className="h-5 w-5" /> : <FileEdit className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-zinc-900 truncate">{event.title}</h4>
                                        <p className="text-xs text-zinc-500 flex items-center gap-2">
                                            {format(event.date, "h:mm a")}
                                            <Badge variant="outline" className="text-[10px] h-4 px-1 rounded-sm border-zinc-200">
                                                {event.type}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-zinc-400">
                                <p>No events scheduled for this day.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
