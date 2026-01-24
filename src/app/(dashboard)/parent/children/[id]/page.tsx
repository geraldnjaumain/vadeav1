"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceView } from "@/components/parent/children/AttendanceView";
import { GradebookView } from "@/components/parent/children/GradebookView";
import { ScheduleView } from "@/components/parent/children/ScheduleView";
import { ChildOverview } from "@/components/parent/children/ChildOverview";

export default function ChildDetailPage({ params }: { params: Promise<{ id: Id<"users"> }> }) {
    const { id } = use(params);
    const child = useQuery(api.users.getUser, { id });

    if (child === undefined) {
        return <LoadingAnimation message="Loading student profile..." />;
    }

    if (child === null) {
        return <div>Student not found.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href="/parent/children">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Children
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-6">
                <img
                    src={child.image || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${child.name}`}
                    alt={child.name}
                    className="h-20 w-20 rounded-full border-2 border-white shadow-sm bg-zinc-50"
                />
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">{child.name}</h1>
                    <p className="text-zinc-500">{child.grade || "No Grade"} · {child.email}</p>
                </div>
            </div>

            <Tabs defaultValue="attendance" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-[500px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="grades">Grades</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <ChildOverview studentId={id} />
                </TabsContent>

                <TabsContent value="attendance" className="mt-6">
                    <AttendanceView studentId={id} />
                </TabsContent>

                <TabsContent value="grades" className="mt-6">
                    <GradebookView studentId={id} />
                </TabsContent>

                <TabsContent value="schedule" className="mt-6">
                    <ScheduleView studentId={id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
