"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForumsPage() {
    const channels = useQuery(api.forums.listChannels);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Community Forums</h1>
                <p className="text-muted-foreground">Join discussions with fellow learners and educators</p>
            </div>

            {/* Channels Grid */}
            {channels === undefined ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : channels.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No forums yet</h3>
                        <p className="text-muted-foreground">
                            Forums will be set up by the admin soon.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {channels.map((channel) => (
                        <Link key={channel._id} href={`/forums/${channel.slug}`}>
                            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <CardTitle className="mt-4">{channel.name}</CardTitle>
                                    <CardDescription>
                                        {channel.description || "Join the conversation"}
                                    </CardDescription>
                                </CardHeader>
                                {channel.role && (
                                    <CardContent>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Users className="h-3 w-3" />
                                            <span>For {channel.role}s</span>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
