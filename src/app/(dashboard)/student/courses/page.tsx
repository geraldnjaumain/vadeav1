"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyCoursesPage() {
    const courses = useQuery(api.courses.getStudentCourses);

    if (courses === undefined) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-zinc-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <Skeleton className="h-10 w-10 rounded" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-2 w-full rounded-full mb-4" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My Courses</h1>
                <p className="text-zinc-500">Continue learning where you left off</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course: Doc<"courses">) => (
                    <Card key={course._id} className="group border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="h-10 w-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold font-mono text-sm border border-blue-200">
                                    {course.title.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                                    Enrolled
                                </div>
                            </div>
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                {course.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                                {course.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-zinc-500 font-medium">
                                        <span>Progress</span>
                                        <span>0%</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 w-0 rounded-full" />
                                    </div>
                                </div>
                                <Button className="w-full bg-zinc-900 hover:bg-blue-600 transition-colors gap-2 group-hover:translate-x-1" asChild>
                                    <Link href={`/student/courses/${course._id}`}>
                                        Continue Learning <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200">
                        <BookOpen className="h-12 w-12 mx-auto text-zinc-300 mb-4 fill-current" />
                        <h3 className="text-lg font-medium text-zinc-900">No courses yet</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
                            You haven't been enrolled in any courses yet. Ask your teacher or parent to assign courses.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
