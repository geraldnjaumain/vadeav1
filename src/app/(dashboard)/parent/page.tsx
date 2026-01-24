"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AddChildForm } from "@/components/parent/AddChildForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Wallet, Calendar, GraduationCap } from "lucide-react";
import Link from "next/link";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';

export default function ParentDashboard() {
    const children = useQuery(api.parent_actions.getChildrenWithStats);
    const user = useQuery(api.users.currentUser);
    const stats = useQuery(api.parent_stats.getDashboardStats);

    if (children === undefined || stats === undefined) {
        return <LoadingAnimation message="Loading your dashboard..." />;
    }

    if (!stats) {
        return <div className="p-8 text-center text-zinc-500">Unable to load dashboard statistics.</div>;
    }

    // Empty State: No children found
    if (children.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <div className="text-center space-y-2 max-w-lg">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900">Welcome to Vadea!</h1>
                    <p className="text-zinc-500">
                        To get started, please add your child to the portal. You'll be able to manage their tuition, view their schedule, and track their progress.
                    </p>
                </div>
                <AddChildForm />
            </div>
        );
    }

    // Active State: Children exist
    // Stats calculations
    const totalChildren = children.length;
    // Calculate average attendance across all children
    const avgAttendance = totalChildren > 0
        ? Math.round(children.reduce((acc, c) => acc + (c.attendanceRate || 0), 0) / totalChildren)
        : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
                    <p className="text-zinc-500">Welcome back, {user?.name || "Parent"}.</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/parent/children">Manage Your Children</Link>
                </Button>
            </div>

            {/* Quick Stats Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">{children.length}</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">Enrolled in Vadea</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Avg Attendance</CardTitle>
                        <User className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">{avgAttendance}%</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">Across all children</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Assignments</CardTitle>
                        <Calendar className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingAssignmentsCount || 0}</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">Due this week</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Fees Status</CardTitle>
                        <Wallet className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold mt-2 ${stats.feesStatus === 'Overdue' ? 'text-red-600' : 'text-slate-900'}`}>
                            {stats.feesStatus}
                        </div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">Current term</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Learning Activity</CardTitle>
                        <CardDescription>Hours spent by students this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.weeklyActivity}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="hours" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Subject Performance</CardTitle>
                        <CardDescription>Average grades across subjects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.subjectPerformance}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar name="Average" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Children List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-zinc-800">Your Children</h2>
                        <Button variant="ghost" asChild>
                            <Link href="/parent/children">Manage Your Children</Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {children.map((child) => (
                            <Card key={child._id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={child.image || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${child.name}`}
                                            alt={child.name}
                                            className="h-12 w-12 rounded-full border border-zinc-100 bg-zinc-50"
                                        />
                                        <div>
                                            <CardTitle className="text-base">{child.name}</CardTitle>
                                            <CardDescription>{child.grade || "No Grade"} · {child.email}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-zinc-50 p-2 rounded">
                                            <span className="text-zinc-500 text-xs block">Attendance</span>
                                            <span className={`font-medium ${child.attendanceRate >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                                                {child.attendanceRate}%
                                            </span>
                                        </div>
                                        <div className="bg-zinc-50 p-2 rounded">
                                            <span className="text-zinc-500 text-xs block">Avg Grade</span>
                                            <span className="font-medium text-blue-600">{child.avgGrade}</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
                                        <Link href={`/parent/children/${child._id}`}>View Details</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Add Another Child Card */}
                        <Card className="border-dashed border-2 border-zinc-200 flex flex-col items-center justify-center p-6 gap-2 text-zinc-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
                            <Link href="/parent/children" className="flex flex-col items-center w-full h-full justify-center">
                                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center mb-2 group-hover:bg-blue-100">
                                    <User className="h-5 w-5" />
                                </div>
                                <span className="font-medium">Add Another Student</span>
                            </Link>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
