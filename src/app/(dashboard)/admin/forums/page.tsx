"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { MessagesSquare, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminForumsPage() {
    const channels = useQuery(api.forums.getAllChannels);
    const createChannel = useMutation(api.forums.createChannel);
    const updateChannel = useMutation(api.forums.updateChannel);
    const deleteChannel = useMutation(api.forums.deleteChannel);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        role: "all",
    });

    const handleOpen = (channel?: any) => {
        if (channel) {
            setEditingChannel(channel);
            setFormData({
                name: channel.name,
                slug: channel.slug,
                description: channel.description || "",
                role: channel.role || "all",
            });
        } else {
            setEditingChannel(null);
            setFormData({
                name: "",
                slug: "",
                description: "",
                role: "all",
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingChannel) {
                await updateChannel({
                    id: editingChannel._id,
                    name: formData.name,
                    slug: formData.slug || formData.name.toLowerCase().replace(/ /g, "-"),
                    description: formData.description,
                    role: formData.role === "all" ? undefined : formData.role,
                });
                toast.success("Channel updated");
            } else {
                await createChannel({
                    name: formData.name,
                    slug: formData.slug || formData.name.toLowerCase().replace(/ /g, "-"),
                    description: formData.description,
                    role: formData.role === "all" ? undefined : formData.role,
                });
                toast.success("Channel created");
            }
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Failed to save channel");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this channel? All topics will be lost.")) return;
        try {
            // @ts-ignore
            await deleteChannel({ id });
            toast.success("Channel deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    if (channels === undefined) return <LoadingAnimation message="Loading forums..." />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Forums Management</h1>
                    <p className="text-zinc-500">Manage communication channels and access</p>
                </div>
                <Button onClick={() => handleOpen()} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Channel
                </Button>
            </div>

            <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                            <TableHead>Channel Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Access Role</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {channels.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                    No channels found. Create one above.
                                </TableCell>
                            </TableRow>
                        ) : (
                            channels.map((channel) => (
                                <TableRow key={channel._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <MessagesSquare className="h-4 w-4 text-zinc-400" />
                                            {channel.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-zinc-500">{channel.slug}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                            !channel.role ? "bg-zinc-100 text-zinc-800" :
                                                channel.role === "teacher" ? "bg-blue-100 text-blue-800" :
                                                    channel.role === "parent" ? "bg-green-100 text-green-800" :
                                                        "bg-purple-100 text-purple-800"
                                        )}>
                                            {channel.role || "Public (All Users)"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-600 max-w-md truncate">{channel.description}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpen(channel)}>
                                                <Pencil className="h-4 w-4 text-zinc-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(channel._id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingChannel ? "Edit Channel" : "Create Channel"}</DialogTitle>
                        <DialogDescription>
                            Configure forum channel details and visibility.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Channel Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug (URL Path)</Label>
                            <Input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="e.g. teachers-lounge"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Access Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val) => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Reference / All Users</SelectItem>
                                    <SelectItem value="student">Students Only</SelectItem>
                                    <SelectItem value="teacher">Teachers Only</SelectItem>
                                    <SelectItem value="parent">Parents Only</SelectItem>
                                    <SelectItem value="admin">Admins Only</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-zinc-500">Who can view and post in this channel?</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Channel</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
