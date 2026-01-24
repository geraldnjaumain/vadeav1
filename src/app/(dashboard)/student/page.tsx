"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Clock, Trophy, Lightbulb, Play, ArrowRight, TrendingUp, AlertCircle, Video } from "lucide-react";
import Link from "next/link";
import { getInitialsAvatar } from "@/lib/avatar";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { format } from "date-fns";
import { DailyChallengesWidget } from "@/components/dashboard/DailyChallengesWidget";

// Quick Facts - rotates daily
const quickFacts = [
    { category: "Science", fact: "Did you know? The human brain uses about 20% of the body's energy." },
    { category: "Geography", fact: "Kenya has 47 counties and the equator runs through the country." },
    { category: "Math", fact: "Zero is the only number that can't be represented in Roman numerals." },
    { category: "History", fact: "The Great Wall of China is visible from space (under certain conditions!)." },
    { category: "Biology", fact: "DNA is a molecule that carries the genetic instructions used in the development and functioning of all known living organisms." },
    { category: "Technology", fact: "The first computer bug was an actual bug (a moth) found in the Mark II computer in 1947." }
];

// Dynamic greeting based on time of day
function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}

export default function StudentDashboard() {
    const user = useQuery(api.users.currentUser);
    const courses = useQuery(api.courses.getStudentCourses) || [];
    const stats = useQuery(api.student_stats.getDashboardStats, {});

    // Rotating fact
    const factIndex = new Date().getDate() % quickFacts.length;
    const todaysFact = quickFacts[factIndex];

    const nextLesson = stats?.nextLesson;
    const pendingAssignments = stats?.pendingAssignments || 0;
    const averageGrade = stats?.averageGrade || 0;
    const studyStreak = stats?.studyStreak || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                        {getGreeting()}, {user?.name?.split(' ')[0] || "Student"}!
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        You have <span className="font-semibold text-blue-600">{pendingAssignments} assignments</span> due this week.
                    </p>
                </div>
                <div className="hidden md:block">
                    <img
                        src={getInitialsAvatar(user?.name || "Student", 56)}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full border-4 border-white shadow-sm"
                    />
                </div>
            </div>

            {/* Quick Fact Card */}
            <Card className="border-blue-100 bg-blue-50/50">
                <CardContent className="flex items-start gap-4 p-5">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-200">
                        <Lightbulb className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            Daily Knowledge · {todaysFact.category}
                        </span>
                        <p className="text-sm text-zinc-700 mt-1 font-medium leading-relaxed">{todaysFact.fact}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">{courses.length}</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">In progress</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Assignments</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">{pendingAssignments}</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">Pending submission</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Average Grade</CardTitle>
                        <Trophy className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">{averageGrade > 0 ? `${averageGrade}%` : "-"}</div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">Across all subjects</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-sky-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Study Streak</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">
                            {studyStreak > 0 ? `${studyStreak} Day${studyStreak !== 1 ? 's' : ''}` : "-"}
                        </div>
                        <p className="text-[11px] font-medium text-zinc-500 mt-2">
                            {studyStreak > 0 ? "Keep it going!" : "Start your streak today!"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Upcoming / Next Lesson */}
                <Card className="lg:col-span-2 border-zinc-200 shadow-sm">
                    <CardHeader className="border-b border-zinc-100 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Up Next</CardTitle>
                                <CardDescription>Your next scheduled lesson</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/student/lessons">View Schedule</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {nextLesson ? (
                            <div className="flex flex-col md:flex-row gap-6 items-center p-6 rounded-xl bg-blue-50 border border-blue-100">
                                <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <Video className="h-8 w-8 fill-current" />
                                </div>
                                <div className="space-y-2 text-center md:text-left flex-1">
                                    <h3 className="text-xl font-bold text-zinc-900">{nextLesson.title}</h3>
                                    <p className="text-zinc-600 flex items-center justify-center md:justify-start gap-2">
                                        <Clock className="h-4 w-4 fill-current" />
                                        {format(new Date(nextLesson.scheduledAt), "EEEE, MMMM do 'at' h:mm a")}
                                    </p>
                                    <p className="text-zinc-500 text-sm">
                                        Duration: {nextLesson.durationMins} mins
                                    </p>
                                </div>
                                <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 gap-2">
                                    <Play className="h-4 w-4 fill-current" />
                                    Join Class
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20 fill-current" />
                                <p>No upcoming live lessons scheduled.</p>
                                <Button variant="link" className="mt-2 text-blue-600" asChild>
                                    <Link href="/student/courses">Check course materials</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* My Courses List */}
                <Card className="border-zinc-200 shadow-sm h-full">
                    <CardHeader className="border-b border-zinc-100 pb-4">
                        <CardTitle className="text-lg">My Courses</CardTitle>
                        <CardDescription>Recent activity</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {courses.slice(0, 3).map((course: any) => (
                            <Link
                                href={`/student/courses/${course._id}`}
                                key={course._id}
                                className="group block p-3 rounded-lg hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-8 w-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                        {course.title.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="font-medium text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-zinc-500">
                                        <span>Progress</span>
                                        <span>{course.progress || 0}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                            style={{ width: `${course.progress || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {courses.length === 0 && (
                            <div className="text-center py-8 text-zinc-500 text-sm">
                                No courses enrolled yet.
                            </div>
                        )}

                        <Button variant="ghost" className="w-full text-zinc-500 hover:text-zinc-900" asChild>
                            <Link href="/student/courses">
                                View All Courses <ArrowRight className="ml-2 h-4 w-4 fill-current" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Challenges Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <DailyChallengesWidget />
                </div>
            </div>
        </div>
    );
}
