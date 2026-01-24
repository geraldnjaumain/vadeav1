"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api"; // Adjust relative path if needed
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CommunitySkeleton } from "@/components/ui/skeleton";

export default function ChannelPage() {
    const params = useParams();
    const slug = params.slug as string;

    const topics = useQuery(api.forums.listTopics, { channelSlug: slug });

    if (topics === undefined) {
        return <CommunitySkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/student/community">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold capitalize text-zinc-900">{slug.replace("-", " ")}</h1>
                </div>
                <div className="ml-auto">
                    <Button>New Topic</Button>
                </div>
            </div>

            <div className="space-y-4">
                {topics.map((topic) => (
                    <Card key={topic._id} className="cursor-pointer hover:border-zinc-400 transition-colors border-zinc-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">{topic.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm text-zinc-500 gap-4">
                                <span className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4" />
                                    {/* Placeholder for reply count until we implement it */}
                                    0 replies
                                </span>
                                <span>
                                    Last activity {formatDistanceToNow(topic.lastReplyAt)} ago
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {topics.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                        <p>No topics yet. Be the first to start the conversation!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
