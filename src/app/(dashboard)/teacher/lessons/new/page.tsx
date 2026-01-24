"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, Video, Loader2 } from "lucide-react";

const DURATION_OPTIONS = [
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
];

export default function NewLessonPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedCourseId = searchParams.get("courseId");

    const scheduleLesson = useMutation(api.lessons.scheduleLesson);
    const courses = useQuery(api.teacher_dashboard.getTeacherCourses);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        courseId: preselectedCourseId || "",
        title: "",
        description: "",
        date: "",
        time: "",
        durationMins: "60",
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canSubmit = () => {
        return (
            formData.courseId &&
            formData.title.trim() &&
            formData.date &&
            formData.time &&
            formData.durationMins
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit()) return;

        setIsSubmitting(true);
        try {
            // Combine date and time into timestamp
            const scheduledAt = new Date(`${formData.date}T${formData.time}`).getTime();

            await scheduleLesson({
                courseId: formData.courseId as Id<"courses">,
                title: formData.title,
                description: formData.description || undefined,
                scheduledAt,
                durationMins: parseInt(formData.durationMins),
            });

            toast.success("Lesson scheduled successfully!");
            router.push(`/teacher/courses/${formData.courseId}`);
        } catch (error) {
            console.error("Failed to schedule lesson:", error);
            toast.error("Failed to schedule lesson. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Schedule New Lesson</h1>
                <p className="text-muted-foreground">Create a live lesson for your students.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        Lesson Details
                    </CardTitle>
                    <CardDescription>
                        Set up your live lesson. A meeting link will be generated automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Course Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="courseId">Course</Label>
                            <Select
                                value={formData.courseId}
                                onValueChange={(value) => updateField("courseId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses?.map((course) => (
                                        <SelectItem key={course._id} value={course._id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                The course this lesson belongs to.
                            </p>
                        </div>

                        {/* Lesson Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Lesson Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Introduction to Fractions"
                                value={formData.title}
                                onChange={(e) => updateField("title", e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of what will be covered..."
                                rows={3}
                                value={formData.description}
                                onChange={(e) => updateField("description", e.target.value)}
                            />
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => updateField("date", e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Time
                                </Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => updateField("time", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Select
                                value={formData.durationMins}
                                onValueChange={(value) => updateField("durationMins", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DURATION_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Info Box */}
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm">
                            <p className="text-blue-800 dark:text-blue-200">
                                <strong>Note:</strong> A video meeting link will be automatically generated
                                when you schedule the lesson. You can share this with your students.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!canSubmit() || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <Video className="mr-2 h-4 w-4" />
                                        Schedule Lesson
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
