"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Eye, EyeOff, Plus, Video, FileText, Settings, UploadCloud, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as Id<"courses">;

    // Fixed API calls to match what exists/will exist
    const course = useQuery(api.courses.getCourse, { courseId });
    const lessons = useQuery(api.lessons.listByCourse, { courseId });
    // Assuming updateCourse will be added
    const updateCourse = useMutation(api.courses.updateCourse);

    const togglePublish = async () => {
        if (!course) return;
        try {
            await updateCourse({
                id: courseId,
                isPublished: !course.isPublished,
            });
            toast.success(course.isPublished ? "Course unpublished" : "Course published!");
        } catch (error) {
            toast.error("Failed to update course status");
        }
    };

    if (course === undefined) return <div className="text-center py-12">Loading...</div>;
    if (course === null) return <div className="text-center py-12">Course not found</div>;

    return (
        <div className="-m-4 md:-m-8">
            <div className="bg-[#0e2a47] text-white p-6 md:p-12 mb-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            className="text-white/80 hover:text-white hover:bg-white/10 p-0 h-auto font-normal"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                className="bg-white text-[#0e2a47] hover:bg-white/90"
                                onClick={togglePublish}
                            >
                                {course.isPublished ? "Unpublish" : "Publish"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-4 max-w-2xl">
                            <h1 className="text-4xl font-bold tracking-tight">{course.title}</h1>
                            <p className="text-white/70 text-lg leading-relaxed">{course.description}</p>
                            <div className="flex items-center gap-3 pt-2">
                                <Badge variant={course.isPublished ? "default" : "secondary"} className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-blue-500/50">
                                    {course.isPublished ? "Published" : "Draft"}
                                </Badge>
                                <span className="text-white/50 text-sm">KES {course.price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="hidden md:flex bg-[#fdf6e3] rounded-lg p-8 w-64 h-48 items-center justify-center shrink-0 shadow-lg rotate-1 transform transition-transform hover:rotate-0">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 bg-blue-900 rounded-sm transform rotate-45" />
                                <div className="absolute inset-0 bg-orange-400 rounded-sm transform -rotate-12 translate-x-2 mix-blend-multiply" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="h-4 w-4" /> Add Content
                        </Button>
                        <div className="ml-auto flex gap-2">
                            <Button variant="outline" size="icon" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                                <Users className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="bg-transparent border-white/20 text-white hover:bg-white/10" asChild>
                                <Link href={`/teacher/courses/${courseId}/edit`}>
                                    <Settings className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
                <Tabs defaultValue="content" className="space-y-6">
                    <TabsList className="bg-transparent p-0 border-b border-zinc-200 w-full justify-start h-auto rounded-none">
                        <TabsTrigger
                            value="content"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0e2a47] data-[state=active]:bg-transparent px-6 py-3 font-medium text-zinc-500 data-[state=active]:text-[#0e2a47] data-[state=active]:shadow-none transition-all"
                        >
                            Content
                        </TabsTrigger>
                        <TabsTrigger
                            value="files"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0e2a47] data-[state=active]:bg-transparent px-6 py-3 font-medium text-zinc-500 data-[state=active]:text-[#0e2a47] data-[state=active]:shadow-none transition-all"
                        >
                            Files
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-6">
                        {(!lessons || lessons.length === 0) ? (
                            <Card className="border-dashed border-2 bg-zinc-50/50">
                                <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                        <UploadCloud className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#0e2a47] mb-1">This course is empty</h3>
                                    <p className="text-zinc-500 max-w-sm mb-6">
                                        Drag and drop files here, or click the Add button above to build your course content.
                                    </p>
                                    <Button asChild>
                                        <Link href={`/teacher/lessons/new?courseId=${courseId}`}>
                                            Create First Lesson
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {lessons.map((lesson, index) => (
                                    <div key={lesson._id} className="group flex items-center gap-4 p-4 bg-white border rounded-lg hover:border-blue-500/50 hover:shadow-sm transition-all">
                                        <div className="h-10 w-10 shrink-0 rounded bg-zinc-100 flex items-center justify-center text-zinc-500 font-medium group-hover:bg-blue-50 group-hover:text-blue-600">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-zinc-900 group-hover:text-blue-700 transition-colors">{lesson.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                                                <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {lesson.durationMins}m</span>
                                                <span>•</span>
                                                <Badge variant="secondary" className="text-xs h-5">{lesson.status}</Badge>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/teacher/lessons/${lesson._id}/edit`}>
                                                <Edit className="h-4 w-4 text-zinc-400" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="files">
                        <Card className="border-dashed border-2 bg-zinc-50/50">
                            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                                <FileText className="h-12 w-12 text-zinc-300 mb-4" />
                                <h3 className="text-lg font-medium text-zinc-900">No external files</h3>
                                <p className="text-zinc-500">Upload supplementary materials here.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
