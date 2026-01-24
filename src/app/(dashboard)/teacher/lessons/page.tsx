"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, FileText, Video, Calendar, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function TeacherLessonsPage() {
    const lessons = useQuery(api.lessons.getMyLessons);
    const updateContent = useMutation(api.lessons.updateLessonContent);

    const [editingLesson, setEditingLesson] = useState<any>(null);
    const [contentForm, setContentForm] = useState({ recordingUrl: "", notes: "" });

    const handleEditClick = (lesson: any) => {
        setEditingLesson(lesson);
        setContentForm({
            recordingUrl: lesson.recordingUrl || "",
            notes: lesson.notes || ""
        });
    };

    const handleSaveContent = async () => {
        if (!editingLesson) return;
        try {
            await updateContent({
                lessonId: editingLesson._id,
                recordingUrl: contentForm.recordingUrl,
                notes: contentForm.notes
            });
            toast.success("Lesson content updated");
            setEditingLesson(null);
        } catch (e) {
            toast.error("Failed to update content");
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-KE", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString("en-KE", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled": return "default";
            case "live": return "destructive";
            case "completed": return "secondary";
            case "cancelled": return "outline";
            default: return "default";
        }
    };

    const isUpcoming = (timestamp: number) => timestamp > Date.now();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Lessons</h1>
                    <p className="text-muted-foreground">Manage your scheduled lessons</p>
                </div>
                <Button asChild>
                    <Link href="/teacher/lessons/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Lesson
                    </Link>
                </Button>
            </div>

            {/* Lessons List */}
            {lessons === undefined ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-1/3 mb-2" />
                                        <Skeleton className="h-4 w-1/4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : lessons.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No lessons scheduled</h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by scheduling your first lesson.
                        </p>
                        <Button asChild>
                            <Link href="/teacher/lessons/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Schedule Your First Lesson
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {lessons.map((lesson) => (
                        <div key={lesson._id}>Lesson: {lesson.title}</div>
                    ))}
                </div>
            )}

            <Dialog open={!!editingLesson} onOpenChange={(open) => !open && setEditingLesson(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Lesson Content</DialogTitle>
                        <DialogDescription>Add recording link and notes for "{editingLesson?.title}"</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Recording URL</Label>
                            <Input
                                placeholder="https://..."
                                value={contentForm.recordingUrl}
                                onChange={(e) => setContentForm({ ...contentForm, recordingUrl: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Lesson summary, homework, etc."
                                rows={5}
                                value={contentForm.notes}
                                onChange={(e) => setContentForm({ ...contentForm, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingLesson(null)}>Cancel</Button>
                        <Button onClick={handleSaveContent}>Save Content</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
