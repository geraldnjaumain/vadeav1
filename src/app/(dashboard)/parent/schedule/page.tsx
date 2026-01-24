"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { Calendar, Clock, Video, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function SchedulePage() {
    // For MVP, we'll fetch lessons directly. In a real app this would filter by the parent's children.
    // Reusing the teacher lessons for now to show data if any exists, or empty state.
    // A better approach for MVP is to mock some "Class Schedule" data if none exists.
    const lessons = useQuery(api.lessons.getLessons) || [];

    if (lessons === undefined) {
        return <LoadingAnimation message="Loading schedule..." />;
    }

    // Mock schedule for demo if empty
    const scheduleItems = lessons.length > 0 ? lessons : [
        { _id: "1", title: "Mathematics", time: "08:00 AM - 09:30 AM", type: "In-Person", location: "Room 3B", day: "Monday" },
        { _id: "2", title: "English Literature", time: "10:00 AM - 11:30 AM", type: "In-Person", location: "Room 4A", day: "Monday" },
        { _id: "3", title: "Science (Biology)", time: "01:00 PM - 02:30 PM", type: "Lab", location: "Science Lab 1", day: "Tuesday" },
        { _id: "4", title: "History", time: "09:00 AM - 10:30 AM", type: "Online", location: "Zoom", day: "Wednesday" },
        { _id: "5", title: "Physical Education", time: "03:00 PM - 04:30 PM", type: "Field", location: "Sports Field", day: "Thursday" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Class Schedule</h1>
                <p className="text-zinc-500">Weekly timetable for your children.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                    const dailyItems = scheduleItems.filter((item: any) => item.day === day || (item.scheduledAt && format(item.scheduledAt, 'EEEE') === day));

                    return (
                        <Card key={day} className="h-full">
                            <CardHeader className="pb-3 border-b bg-zinc-50/50">
                                <CardTitle className="text-lg font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    {day}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {dailyItems.length === 0 ? (
                                    <p className="text-sm text-zinc-400 italic">No classes scheduled.</p>
                                ) : (
                                    dailyItems.map((item: any) => (
                                        <div key={item._id} className="flex gap-3 relative pl-4 border-l-2 border-blue-100 dark:border-blue-900">
                                            <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-zinc-950" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold leading-none">{item.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                    <Clock className="h-3 w-3" />
                                                    {item.time || (item.scheduledAt ? format(item.scheduledAt, 'p') : "TBA")}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                    {item.type === "Online" || item.meetingUrl ? (
                                                        <>
                                                            <Video className="h-3 w-3 text-green-600" />
                                                            <span className="text-green-600 font-medium">Online Class</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MapPin className="h-3 w-3" />
                                                            {item.location || "Campus"}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
