"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { CommunitySkeleton } from "@/components/ui/skeleton";

export default function StudentCommunityPage() {
    const channels = useQuery(api.forums.listChannels);

    if (channels === undefined) {
        return <CommunitySkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Community Forums</h1>
                    <p className="text-zinc-500">Connect with your classmates and teachers.</p>
                </div>
                <Button>New Discussion</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                {channels?.map((channel) => (
                    <Link key={channel._id} href={`/student/community/${channel.slug}`}>
                        <Card className="hover:border-zinc-400 transition-colors cursor-pointer border-zinc-200">
                            <CardHeader className="flex flex-row items-center space-y-0">
                                <div className="p-2 bg-zinc-100 rounded-lg mr-4">
                                    <MessageSquare className="h-5 w-5 text-zinc-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                                    <CardDescription>{channel.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
                {channels.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        No active channels found.
                    </div>
                )}
            </div>
        </div>
    );
}
