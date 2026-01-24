"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Mail, Phone, Calendar, Shield, BookOpen } from "lucide-react";
import Link from "next/link";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams } from "next/navigation";
import { ChildOverview } from "@/components/parent/children/ChildOverview";
import { ScheduleView } from "@/components/parent/children/ScheduleView";
import { GradebookView } from "@/components/parent/children/GradebookView";
import { AttendanceView } from "@/components/parent/children/AttendanceView";

export default function AdminUserDetailPage() {
    const params = useParams();
    const userId = params.id as Id<"users">;

    // We can reuse the getUser query if made public/admin-accessible, or use a specific admin query
    // For now, assuming we can fetch the user details via a new admin query or reusing existing ones safely.
    // Let's assume we need to add 'getUser' to api.users or similar.
    // Checking previous files, we used getAllUsers. Let's use a new query `getUserById` for admin.

    const user = useQuery(api.users.getUserById, { userId });

    if (user === undefined) return <PageSkeleton />;

    if (user === null) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500">
            <User className="h-16 w-16 mb-4 text-zinc-300" />
            <h2 className="text-xl font-semibold text-zinc-900">User Not Found</h2>
            <p className="mb-6">The user you are looking for does not exist or has been deleted.</p>
            <Link href="/admin/users">
                <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Users</Button>
            </Link>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <Link href="/admin/users" className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center mb-4 transition-colors">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Back to User Management
                </Link>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="text-2xl bg-blue-600 text-white">
                            {user.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-zinc-900">{user.name}</h1>
                            <Badge variant="outline" className="capitalize text-base px-3 py-0.5">
                                {user.role}
                            </Badge>
                            {user.isSuspended && (
                                <Badge variant="destructive">Suspended</Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-zinc-500 text-sm">
                            <div className="flex items-center gap-1.5">
                                <Mail className="h-4 w-4" />
                                {user.email}
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-1.5">
                                    <Phone className="h-4 w-4" />
                                    {user.phone}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-4 w-4" />
                                User ID: <span className="font-mono text-xs bg-zinc-100 px-1 rounded">{user._id}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Button variant="outline" className="gap-2">
                            <Shield className="h-4 w-4" /> View as {user.name}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Role Specific Content */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {user.role === "student" && <TabsTrigger value="academics">Academics</TabsTrigger>}
                    {user.role === "student" && <TabsTrigger value="schedule">Schedule</TabsTrigger>}
                    <TabsTrigger value="activity">System Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <label className="text-zinc-500 block mb-1">Date Joined</label>
                                        <div className="font-medium">
                                            {user._creationTime ? new Date(user._creationTime).toLocaleDateString() : "N/A"}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-zinc-500 block mb-1">Last Active</label>
                                        <div className="font-medium">-</div>
                                    </div>
                                    {user.role === "student" && (
                                        <>
                                            <div>
                                                <label className="text-zinc-500 block mb-1">Grade</label>
                                                <div className="font-medium">{user.grade || "Not Set"}</div>
                                            </div>
                                            <div>
                                                <label className="text-zinc-500 block mb-1">Admission No</label>
                                                <div className="font-medium">{user.admissionNumber || "N/A"}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        {/* More cards can go here */}
                    </div>
                </TabsContent>

                {user.role === "student" && (
                    <>
                        <TabsContent value="academics" className="space-y-8 mt-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                Academic Performance
                            </h3>
                            <ChildOverview studentId={userId} />
                            <div className="border-t pt-8">
                                <GradebookView studentId={userId} />
                            </div>
                        </TabsContent>
                        <TabsContent value="schedule" className="mt-6">
                            <ScheduleView studentId={userId} />
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4">Attendance Record</h3>
                                <AttendanceView studentId={userId} />
                            </div>
                        </TabsContent>
                    </>
                )}

                <TabsContent value="activity">
                    <div className="p-8 text-center text-zinc-500 bg-zinc-50 rounded-lg border border-dashed">
                        Activity logs would be displayed here.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
