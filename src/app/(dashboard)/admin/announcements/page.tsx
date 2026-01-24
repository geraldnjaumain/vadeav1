"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { toast } from "sonner";
import { Plus, Pin, Trash2, Megaphone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const GRADES = ["PP1", "PP2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"];
const ROLES = ["all", "student", "parent", "teacher"];

export default function AdminAnnouncementsPage() {
    const [createOpen, setCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "school" as "school" | "class" | "grade",
        targetGrade: "",
        targetRole: "all",
        isPinned: false,
        expiresAt: "",
    });

    const announcements = useQuery(api.announcements.getAllAnnouncements);
    const createAnnouncement = useMutation(api.announcements.createAnnouncement);
    const deleteAnnouncement = useMutation(api.announcements.deleteAnnouncement);
    const togglePinned = useMutation(api.announcements.togglePinned);

    const handleCreate = async () => {
        if (!formData.title || !formData.content) {
            toast.error("Please fill required fields");
            return;
        }

        try {
            await createAnnouncement({
                title: formData.title,
                content: formData.content,
                type: formData.type,
                targetGrade: formData.type === "grade" ? formData.targetGrade : undefined,
                targetRole: formData.targetRole === "all" ? undefined : formData.targetRole,
                isPinned: formData.isPinned,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).getTime() : undefined,
            });
            toast.success("Announcement posted");
            setCreateOpen(false);
            resetForm();
        } catch (e: any) {
            toast.error(e.message || "Failed to create announcement");
        }
    };

    const handleDelete = async (id: Id<"announcements">) => {
        if (!confirm("Delete this announcement?")) return;
        try {
            await deleteAnnouncement({ id });
            toast.success("Announcement deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleTogglePin = async (id: Id<"announcements">) => {
        try {
            await togglePinned({ id });
        } catch {
            toast.error("Failed to update pin status");
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
            type: "school",
            targetGrade: "",
            targetRole: "all",
            isPinned: false,
            expiresAt: "",
        });
    };

    if (announcements === undefined) {
        return <LoadingAnimation message="Loading announcements..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Announcements</h1>
                    <p className="text-zinc-500">Manage school-wide and targeted updates</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Post Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create New Announcement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title *</label>
                                <Input
                                    placeholder="e.g., School Holiday Notice"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content *</label>
                                <Textarea
                                    placeholder="Write your message here..."
                                    className="h-32"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(v: "school" | "class" | "grade") => setFormData({ ...formData, type: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="school">School Wide</SelectItem>
                                            <SelectItem value="grade">Specific Grade</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {formData.type === "grade" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Grade</label>
                                        <Select
                                            value={formData.targetGrade}
                                            onValueChange={(v) => setFormData({ ...formData, targetGrade: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {GRADES.map((g) => (
                                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Role</label>
                                    <Select
                                        value={formData.targetRole}
                                        onValueChange={(v) => setFormData({ ...formData, targetRole: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Everyone</SelectItem>
                                            <SelectItem value="student">Students Only</SelectItem>
                                            <SelectItem value="parent">Parents Only</SelectItem>
                                            <SelectItem value="teacher">Teachers Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expires On (Optional)</label>
                                    <Input
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="pinned"
                                    checked={formData.isPinned}
                                    onCheckedChange={(c) => setFormData({ ...formData, isPinned: c as boolean })}
                                />
                                <label
                                    htmlFor="pinned"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Pin this announcement to top
                                </label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Post</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Announcements</CardTitle>
                    <CardDescription>{announcements.length} posts total</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[400px]">Content</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {announcements.map((announcement) => (
                                <TableRow key={announcement._id} className={announcement.isPinned ? "bg-blue-50/30" : ""}>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                {announcement.isPinned && <Pin className="h-3 w-3 text-blue-600 fill-current" />}
                                                <span className="font-medium text-zinc-900">{announcement.title}</span>
                                            </div>
                                            <p className="text-sm text-zinc-500 line-clamp-2">{announcement.content}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="w-fit">{announcement.type}</Badge>
                                            {announcement.targetGrade && <span className="text-xs text-zinc-500">{announcement.targetGrade}</span>}
                                            {announcement.targetRole && <span className="text-xs text-zinc-500 capitalize">{announcement.targetRole} only</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-500">
                                        {announcement.author?.name || "Unknown"}
                                    </TableCell>
                                    <TableCell className="text-sm text-zinc-500">
                                        {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                                        {announcement.expiresAt && (
                                            <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                Exp: {format(new Date(announcement.expiresAt), "MMM d")}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleTogglePin(announcement._id)}
                                            className={cn(announcement.isPinned ? "text-blue-600 bg-blue-50" : "text-zinc-400")}
                                        >
                                            <Pin className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(announcement._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {announcements.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                                        No announcements yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
