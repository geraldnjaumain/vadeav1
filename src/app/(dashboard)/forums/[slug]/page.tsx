"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Plus, ArrowLeft, Clock, User, MessageCircle, Pin, Eye, Search } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ChannelPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const channel = useQuery(api.forums.getChannel, { slug });
    const topics = useQuery(api.forums.listTopics, { channelSlug: slug });
    const createTopic = useMutation(api.forums.createTopic);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTopic, setNewTopic] = useState({ title: "", content: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleCreateTopic = async () => {
        if (!channel || !newTopic.title.trim() || !newTopic.content.trim()) return;

        setIsSubmitting(true);
        try {
            const topicId = await createTopic({
                channelId: channel._id,
                title: newTopic.title,
                content: newTopic.content,
            });
            toast.success("Topic created!");
            setIsDialogOpen(false);
            setNewTopic({ title: "", content: "" });
            router.push(`/forums/${slug}/${topicId}`);
        } catch (error) {
            toast.error("Failed to create topic");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTimeAgo = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (mins > 0) return `${mins}m ago`;
        return "Just now";
    };

    if (channel === undefined) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i}><CardContent className="p-4"><Skeleton className="h-16" /></CardContent></Card>
                    ))}
                </div>
            </div>
        );
    }

    if (channel === null) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">Channel not found</h2>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/forums")}>
                    Back to Forums
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/forums")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{channel.name}</h1>
                        <p className="text-muted-foreground">{channel.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search topics..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Topic
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Topic</DialogTitle>
                                <DialogDescription>
                                    Start a new discussion in {channel.name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="topic-title">Title</Label>
                                    <Input
                                        id="topic-title"
                                        placeholder="What's on your mind?"
                                        value={newTopic.title}
                                        onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="topic-content">Content</Label>
                                    <Textarea
                                        id="topic-content"
                                        placeholder="Share your thoughts..."
                                        rows={5}
                                        value={newTopic.content}
                                        onChange={(e) => setNewTopic(prev => ({ ...prev, content: e.target.value }))}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateTopic} disabled={isSubmitting}>
                                        {isSubmitting ? "Creating..." : "Create Topic"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Topics List */}
            {topics === undefined ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i}><CardContent className="p-4"><Skeleton className="h-16" /></CardContent></Card>
                    ))}
                </div>
            ) : topics.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No topics yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Be the first to start a discussion!
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Topic
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {topics
                        .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((topic) => (
                            <Link key={topic._id} href={`/forums/${slug}/${topic._id}`}>
                                <Card className={cn(
                                    "hover:shadow-md transition-shadow cursor-pointer",
                                    topic.isPinned ? "border-l-4 border-l-blue-500 bg-blue-50/10" : ""
                                )}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2">
                                                    {topic.isPinned && <Pin className="h-4 w-4 text-blue-500 fill-current rotate-45" />}
                                                    {topic.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                    {topic.content}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {topic.authorName}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="h-3 w-3" />
                                                        {topic.postCount} replies
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTimeAgo(topic.lastReplyAt)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        {topic.views || 0} views
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                </div>
            )}
        </div>
    );
}
