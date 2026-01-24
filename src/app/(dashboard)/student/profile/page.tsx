"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Edit } from "lucide-react";
import { ProfileSkeleton } from "@/components/ui/skeleton";

export default function StudentProfilePage() {
    const user = useQuery(api.users.currentUser);

    if (user === undefined) {
        return <ProfileSkeleton />;
    }

    if (!user) return <div>User not found</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My Profile</h1>
                <p className="text-zinc-500">Manage your personal information</p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Main Profile Info */}
                <Card className="md:col-span-4 border-zinc-200">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <Avatar className="h-32 w-32 border-4 border-blue-50">
                                <AvatarImage src={user.image} className="object-cover" />
                                <AvatarFallback className="text-4xl bg-blue-600 text-white font-bold">
                                    {user.name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full bg-white shadow-sm h-8 w-8 hover:bg-zinc-50">
                                <Edit className="h-4 w-4 text-zinc-600" />
                            </Button>
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900">{user.name}</h2>
                        <Badge variant="secondary" className="mt-2 text-blue-700 bg-blue-50 hover:bg-blue-100 capitalize">
                            {user.role}
                        </Badge>

                        <div className="w-full mt-6 space-y-3 text-left">
                            <div className="flex items-center gap-3 text-sm text-zinc-600 p-2 rounded-lg hover:bg-zinc-50 transition-colors">
                                <Mail className="h-4 w-4 text-zinc-400" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {/* Placeholders for fields we might not have yet */}
                            <div className="flex items-center gap-3 text-sm text-zinc-600 p-2 rounded-lg hover:bg-zinc-50 transition-colors">
                                <Phone className="h-4 w-4 text-zinc-400" />
                                <span>+1 (555) 000-0000</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-600 p-2 rounded-lg hover:bg-zinc-50 transition-colors">
                                <MapPin className="h-4 w-4 text-zinc-400" />
                                <span>San Francisco, CA</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Tab / Stats */}
                <div className="md:col-span-8 space-y-6">
                    <Card className="border-zinc-200">
                        <CardHeader>
                            <CardTitle>Academic Overview</CardTitle>
                            <CardDescription>Your current standing and activity</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                                <div className="text-sm font-medium text-zinc-500">Grade Level</div>
                                <div className="text-2xl font-bold text-zinc-900 mt-1">10th</div>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                                <div className="text-sm font-medium text-zinc-500">GPA</div>
                                <div className="text-2xl font-bold text-zinc-900 mt-1">3.8</div>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                                <div className="text-sm font-medium text-zinc-500">Attendance</div>
                                <div className="text-2xl font-bold text-zinc-900 mt-1">98%</div>
                            </div>
                            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                                <div className="text-sm font-medium text-zinc-500">Joined</div>
                                <div className="text-2xl font-bold text-zinc-900 mt-1">Sept 2024</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-500">No recent activity logged.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
