"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Users, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherCoursesPage() {
    const courses = useQuery(api.teacher_dashboard.getTeacherCourses);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
                    <p className="text-muted-foreground">Manage and create your courses</p>
                </div>
                <Button asChild>
                    <Link href="/teacher/courses/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Course
                    </Link>
                </Button>
            </div>

            {/* Courses Grid */}
            {courses === undefined ? (
                // Loading state
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : courses.length === 0 ? (
                // Empty state
                <Card className="text-center py-12">
                    <CardContent>
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by creating your first course.
                        </p>
                        <Button asChild>
                            <Link href="/teacher/courses/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Course
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                // Courses list
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Card key={course._id} className="group hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{course.title}</CardTitle>
                                        <CardDescription className="mt-1 line-clamp-2">
                                            {course.description}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                                        {course.isPublished ? "Published" : "Draft"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        KES {course.price.toLocaleString()}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/teacher/courses/${course._id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/teacher/courses/${course._id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
