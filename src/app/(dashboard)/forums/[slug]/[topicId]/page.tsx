"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Clock, Send, Loader2, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getInitialsAvatar } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export default function TopicPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const topicId = params.topicId as Id<"topics">;

    const topic = useQuery(api.forums.getTopic, { topicId });
    const posts = useQuery(api.forums.listPosts, { topicId });
    const createPost = useMutation(api.forums.createPost);
    const toggleLike = useMutation(api.forums.toggleLike);

    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReply = async () => {
        if (!replyContent.trim()) return;

        setIsSubmitting(true);
        try {
            await createPost({
                topicId,
                content: replyContent,
            });
            toast.success("Reply posted!");
            setReplyContent("");
        } catch (error) {
            toast.error("Failed to post reply");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async (postId: Id<"posts">) => {
        try {
            await toggleLike({ postId });
        } catch (error) {
            toast.error("Failed to like post");
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

    if (topic === undefined) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-32 w-full" />
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (topic === null) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">Topic not found</h2>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/forums")}>
                    Back to Forums
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/forums" className="hover:text-foreground">Forums</Link>
                <span>/</span>
                <Link href={`/forums/${topic.channelSlug}`} className="hover:text-foreground">
                    {topic.channelName}
                </Link>
            </div>

            {/* Topic Header */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/forums/${slug}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {topic.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(topic.lastReplyAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Original Post */}
            <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <img
                            src={getInitialsAvatar(topic.authorName, 40)}
                            alt={topic.authorName}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{topic.authorName}</span>
                                <span className="text-xs text-muted-foreground">Original Post</span>
                            </div>
                            <p className="text-foreground whitespace-pre-wrap">{topic.content}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Replies */}
            {posts && posts.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-muted-foreground">
                        {posts.length} {posts.length === 1 ? "Reply" : "Replies"}
                    </h3>
                    {posts.map((post) => (
                        <Card key={post._id}>
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <img
                                        src={post.authorImage || getInitialsAvatar(post.authorName, 40)}
                                        alt={post.authorName}
                                        className="w-10 h-10 rounded-full flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold">{post.authorName}</span>
                                        </div>
                                        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "h-8 px-2 text-muted-foreground hover:text-primary",
                                                    post.isLiked && "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                                                )}
                                                onClick={() => handleLike(post._id)}
                                            >
                                                <ThumbsUp className={cn("h-4 w-4 mr-1.5", post.isLiked && "fill-current")} />
                                                {post.likeCount || 0}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Reply Form */}
            <Card>
                <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Add a Reply</h3>
                    <Textarea
                        placeholder="Share your thoughts..."
                        rows={4}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="mb-3"
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleReply} disabled={!replyContent.trim() || isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Post Reply
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
