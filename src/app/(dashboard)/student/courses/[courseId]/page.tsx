"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Clock, Play, FileText, ChevronRight, Video, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { CourseSkeleton } from "@/components/ui/skeleton";

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.courseId as Id<"courses">;

    const course = useQuery(api.courses.get, { id: courseId });
    const lessons = useQuery(api.lessons.listByCourse, { courseId });

    if (course === undefined || lessons === undefined) {
        return <CourseSkeleton />;
    }

    if (course === null) {
        return <div className="p-8 text-center">Course not found</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <div className="space-y-4 max-w-2xl">
                    <div className="space-y-2">
                        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            Active Course
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{course.title}</h1>
                        <p className="text-zinc-500 leading-relaxed text-lg">
                            {course.description}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 min-w-[200px]">
                    <Card className="bg-zinc-50 border-zinc-200">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Lessons</span>
                                <span className="font-medium text-zinc-900">{lessons.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Completion</span>
                                <span className="font-medium text-blue-600">0%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-0 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600 fill-current" />
                        Course Content
                    </h2>
                </div>

                <div className="grid gap-4">
                    {lessons.map((lesson, index) => {
                        const isLive = lesson.status === "live" || lesson.status === "scheduled";
                        // Mock logic: first 3 lessons completed for demo if needed, otherwise all pending
                        const isCompleted = false;

                        return (
                            <div
                                key={lesson._id}
                                className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white border border-zinc-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
                            >
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-zinc-100 text-zinc-500 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-6 w-6 fill-current" />
                                    ) : isLive ? (
                                        <Video className="h-6 w-6 fill-current" />
                                    ) : (
                                        <FileText className="h-6 w-6 fill-current" />
                                    )}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold text-zinc-900 group-hover:text-blue-700 transition-colors">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-sm text-zinc-500 line-clamp-1">
                                        {lesson.description || "No description provided."}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-xs text-zinc-500 pt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {lesson.durationMins} mins
                                        </span>
                                        {isLive && (
                                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(lesson.scheduledAt), "MMM d, h:mm a")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4 md:mt-0">
                                    {isLive ? (
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2" asChild>
                                            {/* In real app, href would be dynamic meeting link or lesson page */}
                                            <a href={lesson.meetingUrl || "#"} target="_blank" rel="noopener noreferrer">
                                                <Play className="h-4 w-4 fill-current" /> Join Live
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button variant="outline" size="sm" className="gap-2 group-hover:bg-blue-50 border-zinc-200 group-hover:border-blue-200">
                                            Start Lesson <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {lessons.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            No lessons available for this course yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
