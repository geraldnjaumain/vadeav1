"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { CBCProgressChart } from "@/components/cbc/CBCProgressChart";

export default function StudentGrowthPage() {
    const user = useQuery(api.users.currentUser);

    if (user === undefined) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-red-500">Unable to load user data.</p>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 space-y-6 print:p-0">
            {/* Back Button */}
            <div className="print:hidden">
                <Link href="/student/competencies" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Competencies
                </Link>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">My Competency Growth</h1>
                    <p className="text-zinc-500 mt-1">
                        Track how your competencies have developed over time
                    </p>
                </div>
                <Button onClick={handlePrint} variant="outline" className="gap-2">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Print Report
                </Button>
            </div>

            {/* Print Header */}
            <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-zinc-900">My Competency Growth Report</h1>
                <p className="text-sm text-zinc-600 mt-2">
                    Student: {user.name} | Grade: {user.currentGrade || user.grade || "N/A"}
                </p>
                <p className="text-sm text-zinc-600">
                    Generated: {new Date().toLocaleDateString()}
                </p>
            </div>

            {/* Growth Charts */}
            <CBCProgressChart studentId={user._id} showRadar={true} />

            {/* Milestone Section */}
            <Card className="print:break-inside-avoid">
                <CardHeader>
                    <CardTitle>Achievement Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="font-semibold text-green-800">Exceeds Expectations (EE)</p>
                            <p className="text-sm text-green-700 mt-1">
                                You've demonstrated outstanding performance in this competency.
                            </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="font-semibold text-blue-800">Meets Expectations (ME)</p>
                            <p className="text-sm text-blue-700 mt-1">
                                You've achieved the expected standard for your grade level.
                            </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="font-semibold text-orange-800">Approaching Expectations (AE)</p>
                            <p className="text-sm text-orange-700 mt-1">
                                You're making progress toward meeting the standard.
                            </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="font-semibold text-red-800">Below Expectations (BE)</p>
                            <p className="text-sm text-red-700 mt-1">
                                Additional support is recommended to help you progress.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Print Footer */}
            <div className="hidden print:block border-t-2 border-zinc-900 pt-4 mt-8">
                <p className="text-sm text-zinc-600 text-center">
                    This report was generated on {new Date().toLocaleString()}
                </p>
            </div>
        </div>
    );
}
