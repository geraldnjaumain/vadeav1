"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { NotificationsSkeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
    const notifications = useQuery(api.notifications.get);
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);

    if (notifications === undefined) {
        return <NotificationsSkeleton />;
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case "error": return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Notifications</h1>
                    <p className="text-zinc-500">Stay updated with important alerts and messages.</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <Button variant="outline" onClick={() => markAllAsRead()} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Check className="mr-2 h-4 w-4" /> Mark all as read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card className="bg-zinc-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-zinc-200 flex items-center justify-center mb-4">
                            <Bell className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="font-semibold text-zinc-900">No notifications yet</h3>
                        <p className="text-zinc-500">You're all caught up! Check back later for updates.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <Card
                            key={notification._id}
                            className={cn(
                                "transition-all hover:shadow-md cursor-pointer border-l-4",
                                notification.isRead ? "bg-white border-l-zinc-200" : "bg-blue-50/30 border-l-blue-500"
                            )}
                            onClick={() => !notification.isRead && markAsRead({ notificationId: notification._id })}
                        >
                            <div className="p-4 flex gap-4 items-start">
                                <div className="mt-1 shrink-0">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className={cn("text-sm font-medium", !notification.isRead && "text-blue-900")}>
                                            {notification.title}
                                        </p>
                                        <span className="text-xs text-zinc-400 whitespace-nowrap ml-2">
                                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-600 leading-relaxed">
                                        {notification.message}
                                    </p>
                                    {notification.link && (
                                        <div className="pt-2">
                                            <Button variant="link" className="p-0 h-auto text-blue-600 text-xs" asChild>
                                                <a href={notification.link}>View Details &rarr;</a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {!notification.isRead && (
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
