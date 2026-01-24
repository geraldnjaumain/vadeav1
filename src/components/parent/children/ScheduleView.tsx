"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarSkeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScheduleView({ studentId }: { studentId: Id<"users"> }) {
    // Robust selection: Prefer the legacy name 'getStudentLessons' which exists on the server (either as original or alias)
    // to avoid "function not found" errors if deployment of the new name failed.
    const studentLessonsQuery = (api.lessons as any).getStudentLessons || api.lessons.getStudentLessonsQuery;

    // If the query is completely missing (shouldn't happen if api is imported), useQuery will error if passed undefined.
    // We can pass a "skip" token-like behavior by passing "skip" as query? Convex doesn't support that directly easily.
    // Instead we trust one exists.

    const lessons = useQuery(studentLessonsQuery, { studentId });

    if (lessons === undefined) {
        return <CalendarSkeleton />;
    }

    // Safety check in case the query returns null/error due to backend issues
    const safeLessons = Array.isArray(lessons) ? lessons : [];

    const upcoming = safeLessons.filter((l: any) => l.scheduledAt >= Date.now()).reverse(); // Closest first
    const past = safeLessons.filter((l: any) => l.scheduledAt < Date.now());

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Upcoming Lessons
                    </h3>
                    {upcoming.length === 0 ? (
                        <Card className="bg-zinc-50 border-dashed">
                            <CardContent className="p-8 text-center text-zinc-500">
                                No upcoming lessons scheduled.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map((lesson: any) => (
                                <Card key={lesson._id} className="border-l-4 border-l-blue-500">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-zinc-900">{lesson.title}</h4>
                                                <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(lesson.scheduledAt).toLocaleString()}
                                                    <span className="text-zinc-300">|</span>
                                                    {lesson.durationMins} mins
                                                </div>
                                            </div>
                                            {lesson.meetingUrl && (
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={lesson.meetingUrl} target="_blank" rel="noopener noreferrer">
                                                        <Video className="h-3 w-3 mr-2" />
                                                        Join
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4 text-zinc-500">Past Lessons</h3>
                    {past.length === 0 ? (
                        <div className="text-zinc-400 italic text-sm">No past lessons.</div>
                    ) : (
                        <div className="space-y-3 opacity-75">
                            {past.map((lesson: any) => (
                                <Card key={lesson._id} className="bg-zinc-50">
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold text-zinc-700">{lesson.title}</h4>
                                        <div className="text-xs text-zinc-500 mt-1">
                                            {new Date(lesson.scheduledAt).toLocaleDateString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
