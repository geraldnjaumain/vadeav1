"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-zinc-200", className)}
            {...props}
        />
    );
}

// Page-level skeleton loading states
export function PageSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-lg border border-zinc-200 bg-white">
                        <Skeleton className="h-4 w-24 mb-3" />
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 p-6 rounded-lg border border-zinc-200 bg-white">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <div className="p-6 rounded-lg border border-zinc-200 bg-white">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="p-6 rounded-lg border border-zinc-200 bg-white">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-zinc-200 bg-white">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="rounded-lg border border-zinc-200 overflow-hidden bg-white">
            {/* Header */}
            <div className="flex gap-4 p-4 bg-zinc-50 border-b border-zinc-200">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 p-4 border-b border-zinc-100 last:border-0">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ============================================
// Context-Specific Page Skeletons
// ============================================

export function GradesSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-lg border border-zinc-200 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </div>
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                ))}
            </div>

            {/* Chart + Sidebar */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 p-6 rounded-lg border border-zinc-200 bg-white">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-32 mb-6" />
                    <Skeleton className="h-[300px] w-full rounded" />
                </div>
                <div className="p-6 rounded-lg border border-zinc-200 bg-white">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-40 mb-6" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="pb-4 border-b border-zinc-100 last:border-0">
                                <div className="flex justify-between mb-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-5 w-12 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AchievementsSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
            </div>

            {/* Hero Card */}
            <div className="p-8 rounded-lg bg-gradient-to-r from-zinc-200 to-zinc-300">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="flex-1 space-y-3 w-full">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                </div>
            </div>

            {/* Badges + Leaderboard */}
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-6 w-32" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="p-4 rounded-lg border border-zinc-200 bg-white flex gap-4">
                                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                                <div className="flex-1">
                                    <Skeleton className="h-5 w-32 mb-2" />
                                    <Skeleton className="h-3 w-full mb-2" />
                                    <Skeleton className="h-5 w-16 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 rounded-lg border border-zinc-200 bg-white">
                    <Skeleton className="h-6 w-28 mb-2" />
                    <Skeleton className="h-4 w-36 mb-6" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3">
                                <Skeleton className="h-6 w-6" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ShopSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-40" />
                </div>
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Course Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                        <Skeleton className="h-40 w-full" />
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <div className="flex justify-between items-center pt-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-9 w-24 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CommunitySkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
            </div>

            {/* Channel/Topic List */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 rounded-lg border border-zinc-200 bg-white flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="flex-1">
                            <Skeleton className="h-5 w-48 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <div className="flex gap-4">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Profile Header */}
            <div className="p-6 rounded-lg border border-zinc-200 bg-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
                        <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
                        <Skeleton className="h-4 w-40 mx-auto md:mx-0" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 rounded-lg border border-zinc-200 bg-white">
                        <div className="flex items-center gap-3 mb-3">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-5 w-40" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SettingsSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* Settings Sections */}
            {[1, 2].map((section) => (
                <div key={section} className="p-6 rounded-lg border border-zinc-200 bg-white space-y-6">
                    <Skeleton className="h-6 w-40" />
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-10 w-32 rounded-md" />
                </div>
            ))}
        </div>
    );
}

export function CourseSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Course Header */}
            <div className="p-6 rounded-lg border border-zinc-200 bg-white">
                <div className="flex flex-col md:flex-row gap-6">
                    <Skeleton className="h-48 w-full md:w-72 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-3 pt-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Lessons List */}
            <div className="p-6 rounded-lg border border-zinc-200 bg-white">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-zinc-100">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1">
                                <Skeleton className="h-5 w-48 mb-1" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-8 w-20 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function LibrarySkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>

            {/* Reading Content */}
            <div className="p-8 rounded-lg border border-zinc-200 bg-white space-y-6">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
    );
}

export function AssignmentsSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
            </div>

            {/* Filter Bar */}
            <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 rounded-lg border border-zinc-200 bg-white flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                        <div className="flex-1">
                            <Skeleton className="h-5 w-48 mb-2" />
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function NotificationsSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-4 rounded-lg border border-zinc-200 bg-white flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex-1">
                            <Skeleton className="h-5 w-64 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CalendarSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-40" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-32 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <Skeleton key={i} className="h-6 w-full" />
                    ))}
                </div>
                {/* Calendar days */}
                {[1, 2, 3, 4, 5].map((week) => (
                    <div key={week} className="grid grid-cols-7 gap-2 mb-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <Skeleton key={day} className="h-20 w-full rounded" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function WidgetSkeleton() {
    return (
        <div className="p-4 rounded-lg border border-zinc-200 bg-white animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-5 rounded" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
