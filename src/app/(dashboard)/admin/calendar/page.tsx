"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SchoolCalendar } from "@/components/dashboard/SchoolCalendar";

export default function AdminCalendarPage() {
    const [createOpen, setCreateOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "event" as "event" | "holiday" | "exam" | "deadline",
        targetAudience: "all" as "all" | "student" | "teacher" | "parent",
    });

    const createEvent = useMutation(api.calendar.createEvent);
    const events = useQuery(api.calendar.getEvents);
    const deleteEvent = useMutation(api.calendar.deleteEvent);

    const handleCreate = async () => {
        if (!date || !formData.title) return;

        try {
            await createEvent({
                title: formData.title,
                description: formData.description,
                startDate: date.getTime(),
                endDate: date.getTime(), // Single day events for now
                type: formData.type,
                targetAudience: formData.targetAudience,
            });
            toast.success("Event created");
            setCreateOpen(false);
            setFormData({ title: "", description: "", type: "event", targetAudience: "all" });
        } catch (e) {
            toast.error("Failed to create event");
        }
    };

    const handleDelete = async (id: any) => {
        if (!confirm("Delete this event?")) return;
        try {
            await deleteEvent({ id });
            toast.success("Event deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">School Calendar</h1>
                    <p className="text-zinc-500">Manage school events and holidays</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Event</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Term 1 Finals"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <div className="p-2 border rounded-md text-sm">
                                        {date ? format(date, "PPP") : "Select a date on calendar"}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="event">Event</SelectItem>
                                            <SelectItem value="holiday">Holiday</SelectItem>
                                            <SelectItem value="exam">Exam</SelectItem>
                                            <SelectItem value="deadline">Deadline</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Audience</Label>
                                <Select
                                    value={formData.targetAudience}
                                    onValueChange={(v: any) => setFormData({ ...formData, targetAudience: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Everyone</SelectItem>
                                        <SelectItem value="student">Students</SelectItem>
                                        <SelectItem value="teacher">Teachers</SelectItem>
                                        <SelectItem value="parent">Parents</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-md text-xs text-yellow-800">
                                Note: Select a date on the calendar below before creating.
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Create Event</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Reuse the display component but maybe add delete buttons if complex? 
                Actually, SchoolCalendar component is read-only.
                I should probably copy logic or enhance SchoolCalendar to accept 'onDelete' or 'isAdmin'.
                For now, I'll just render SchoolCalendar and list upcoming events with delete button below.
            */}

            <SchoolCalendar />

            <Card>
                <CardHeader>
                    <CardTitle>All Events Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {events?.map(event => (
                            <div key={event._id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{event.title}</p>
                                    <p className="text-sm text-zinc-500">
                                        {format(new Date(event.startDate), "PPP")} • {event.type}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(event._id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
