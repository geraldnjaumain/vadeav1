"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pin, Bell, Info, Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ListSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AnnouncementsList({ limit }: { limit?: number }) {
    const announcements = useQuery(api.announcements.getAnnouncements);

    if (announcements === undefined) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-blue-600 fill-current" />
                        Announcements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ListSkeleton count={3} />
                </CardContent>
            </Card>
        );
    }

    const displayAnnouncements = limit ? announcements.slice(0, limit) : announcements;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-blue-600 fill-current" />
                        Announcements
                    </CardTitle>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {announcements.length} New
                    </Badge>
                </div>
                <CardDescription>Latest updates from the school and teachers</CardDescription>
            </CardHeader>
            <CardContent>
                {displayAnnouncements.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-zinc-300 fill-current" />
                        <p>No new announcements</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayAnnouncements.map((announcement) => (
                            <div
                                key={announcement._id}
                                className={cn(
                                    "p-4 rounded-lg border transition-all",
                                    announcement.isPinned
                                        ? "bg-blue-50/50 border-blue-200"
                                        : "bg-white border-zinc-100 hover:border-zinc-200"
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            {announcement.isPinned && (
                                                <Pin className="h-3 w-3 text-blue-600 fill-blue-600 shrink-0" />
                                            )}
                                            <h3 className={cn(
                                                "font-semibold text-sm",
                                                announcement.isPinned ? "text-blue-900" : "text-zinc-900"
                                            )}>
                                                {announcement.title}
                                            </h3>
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 py-0 bg-white/50">
                                                {announcement.type}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
                                            {announcement.content}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        {announcement.author && (
                                            <span className="font-medium text-zinc-500">
                                                {announcement.author.name}
                                                {announcement.author.role === "admin" && " (Admin)"}
                                            </span>
                                        )}
                                    </div>
                                    <span>{formatDistanceToNow(announcement.createdAt, { addSuffix: true })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
