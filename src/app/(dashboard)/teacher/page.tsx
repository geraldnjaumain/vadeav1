"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, BookOpen, Star, Plus, Calendar, Video, FileText, TrendingUp, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { getProfessionalAvatar } from "@/lib/avatar";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// Mock data
const upcomingClasses = [
    { id: 1, title: "Grade 6 Mathematics", time: "10:00 AM Today", students: 12, type: "Live" },
    { id: 2, title: "Grade 5 Science", time: "2:00 PM Today", students: 15, type: "Live" },
    { id: 3, title: "PP2 Creative Arts", time: "11:00 AM Tomorrow", students: 8, type: "Live" },
];

const recentEarnings = [
    { month: "Jan", amount: 45000 },
    { month: "Dec", amount: 42000 },
    { month: "Nov", amount: 38000 },
    { month: "Oct", amount: 35000 },
];

export default function TeacherDashboard() {
    const user = useQuery(api.users.currentUser);
    const courses = useQuery(api.teacher_dashboard.getTeacherCourses) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src={getProfessionalAvatar("Teacher", 64)}
                        alt="Profile"
                        className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                    />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Welcome, {user?.name || "Teacher"}
                        </h1>
                        <p className="text-muted-foreground">Ready to inspire the next generation?</p>
                    </div>
                </div>
                <Button size="lg" className="shadow-md" asChild>
                    <Link href="/teacher/courses/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Course
                    </Link>
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">145</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">+12 this month</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Monthly Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">KES 45,000</div>
                        <p className="text-[11px] font-medium text-emerald-600 flex items-center mt-2">
                            <TrendingUp className="h-3 w-3 mr-1" /> +10% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">{courses.length}</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">Active Courses</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Teacher Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">4.8</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">Based on 50 reviews</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Upcoming Classes */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Upcoming Classes</CardTitle>
                        <CardDescription>Your schedule for the next few days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingClasses.map((cls) => (
                                <div key={cls.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Video className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm">{cls.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>{cls.time}</span>
                                                <span>•</span>
                                                <Users className="h-3 w-3" />
                                                <span>{cls.students} enrolled</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="sm" variant={cls.id === 1 ? "default" : "outline"}>
                                        {cls.id === 1 ? "Start Class" : "View Details"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions & Resources */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage your classroom efficiently</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col">
                            <Link
                                href="/teacher/assessments/new"
                                className="flex items-center gap-3 px-6 py-4 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
                            >
                                <Star className="h-5 w-5 text-zinc-500" />
                                <span className="text-sm font-medium text-zinc-700">New CBC Assessment</span>
                            </Link>
                            <Link
                                href="/teacher/resources"
                                className="flex items-center gap-3 px-6 py-4 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
                            >
                                <FileText className="h-5 w-5 text-zinc-500" />
                                <span className="text-sm font-medium text-zinc-700">Upload Resources</span>
                            </Link>
                            <Link
                                href="/teacher/lessons/new"
                                className="flex items-center gap-3 px-6 py-4 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
                            >
                                <Calendar className="h-5 w-5 text-zinc-500" />
                                <span className="text-sm font-medium text-zinc-700">Schedule Session</span>
                            </Link>
                            <button className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors w-full text-left">
                                <div className="flex items-center gap-3">
                                    <MoreHorizontal className="h-5 w-5 text-zinc-500" />
                                    <span className="text-sm font-medium text-zinc-700">Review & Grading</span>
                                </div>
                                <div className="h-5 w-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center">
                                    5
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
