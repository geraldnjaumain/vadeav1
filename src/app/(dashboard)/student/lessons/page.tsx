"use client";

import { useQuery } from "convex/react";
import { PageSkeleton } from "@/components/ui/skeleton";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, User, ArrowRight, Loader2, Play, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogHeader, ResponsiveDialogTitle, ResponsiveDialogFooter } from "@/components/ui/responsive-dialog";

export default function LiveLessonsPage() {


    const user = useQuery(api.users.currentUser);
    const lessons = useQuery(api.lessons.getStudentLessons, { studentId: user?._id! });
    const [viewingNotes, setViewingNotes] = useState<string | null>(null);

    if (lessons === undefined) {
        return <PageSkeleton />;
    }

    // Filter logic if backend returns all (it does sort, but doesn't strictly filter past/future in one query)
    const now = Date.now();
    const upcoming = lessons.filter(l => l.scheduledAt > now - 1000 * 60 * 60); // Show recent past (1h) too?
    const past = lessons.filter(l => l.scheduledAt <= now - 1000 * 60 * 60);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Live Lessons</h1>
                <p className="text-zinc-500">Join your virtual classrooms</p>
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Upcoming Sessions</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((lesson) => (
                        <Card key={lesson._id} className="border-blue-100 bg-blue-50/30 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-2 w-full bg-blue-600" />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Video className="h-5 w-5 fill-current" />
                                    </div>
                                    <div className="px-2.5 py-0.5 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                                        Live
                                    </div>
                                </div>
                                <h3 className="font-bold text-zinc-900 text-lg mb-1">{lesson.title}</h3>
                                <div className="space-y-2 text-sm text-zinc-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        {format(new Date(lesson.scheduledAt), "EEEE, MMM d")}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        {format(new Date(lesson.scheduledAt), "h:mm a")} • {lesson.durationMins} mins
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-500" />
                                        {lesson.teacherName}
                                    </div>
                                </div>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2 font-semibold" asChild>
                                    <a href={lesson.meetingUrl || "#"} target="_blank" rel="noopener noreferrer">
                                        <Play className="h-4 w-4 fill-current" /> Join Class
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {upcoming.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                            <Calendar className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                            <p className="text-zinc-500 font-medium">No upcoming live lessons scheduled.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6 pt-6">
                <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Past Lessons</h2>
                <div className="space-y-3">
                    {past.map((lesson) => (
                        <div key={lesson._id} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-lg hover:border-zinc-300 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center shrink-0">
                                    <Video className="h-5 w-5 fill-current" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-zinc-900 group-hover:text-blue-600 transition-colors">{lesson.title}</h3>
                                    <p className="text-sm text-zinc-500">{format(new Date(lesson.scheduledAt), "MMM d, h:mm a")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {lesson.notes && (
                                    <Button variant="outline" size="sm" onClick={() => setViewingNotes(lesson.notes!)}>
                                        <FileText className="h-4 w-4 mr-2" /> Notes
                                    </Button>
                                )}
                                {lesson.recordingUrl ? (
                                    <Button variant="outline" size="sm" asChild className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                        <a href={lesson.recordingUrl} target="_blank" rel="noopener noreferrer">
                                            <Play className="h-4 w-4 mr-2" /> Watch
                                        </a>
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="sm" disabled className="text-zinc-400">
                                        Recording N/A
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    {past.length === 0 && (
                        <div className="text-center py-8 text-zinc-500 italic">No past lessons found.</div>
                    )}
                </div>
            </div>

            <ResponsiveDialog open={!!viewingNotes} onOpenChange={(open) => !open && setViewingNotes(null)}>
                <ResponsiveDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <ResponsiveDialogHeader>
                        <ResponsiveDialogTitle>Lesson Notes</ResponsiveDialogTitle>
                    </ResponsiveDialogHeader>
                    <div className="mt-4 whitespace-pre-wrap text-zinc-700 leading-relaxed custom-prose px-4 md:px-0">
                        {viewingNotes}
                    </div>
                    <ResponsiveDialogFooter>
                        <Button onClick={() => setViewingNotes(null)}>Close</Button>
                    </ResponsiveDialogFooter>
                </ResponsiveDialogContent>
            </ResponsiveDialog>
        </div>
    );
}
