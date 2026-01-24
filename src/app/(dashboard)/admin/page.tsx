"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import {
    Users,
    GraduationCap,
    BookOpen,
    DollarSign,
    TrendingUp,
    Activity
} from "lucide-react";
// import { formatCurrency } from "@/lib/utils";

function formatMoney(amount: number) {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
}

export default function AdminDashboardPage() {
    const stats = useQuery(api.admin_stats.getDashboardStats);
    const activity = useQuery(api.admin_stats.getRecentActivity);

    if (stats === undefined) {
        return <LoadingAnimation message="Loading admin insights..." />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Admin Overview</h1>
                <p className="text-zinc-500">System health and performance metrics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">{formatMoney(stats.totalRevenue)}</div>
                        <p className="text-[11px] font-medium text-emerald-600 flex items-center mt-2">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">
                            {stats.students} Students, {stats.teachers} Teachers
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">{stats.activeCourses}</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">
                            out of {stats.totalCourses} total created
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="max-w-2xl">
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {activity?.map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <p className="text-sm font-medium text-slate-800">{item.description}</p>
                                        <p className="text-xs text-zinc-400 mt-0.5 font-medium">{new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                            {!activity?.length && <p className="text-sm text-zinc-500">No recent activity.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
