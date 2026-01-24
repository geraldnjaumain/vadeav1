"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { AssignmentsSkeleton } from "@/components/ui/skeleton";

export default function AssignmentsPage() {
    const assignments = useQuery(api.assignments.getStudentAssignments);

    if (assignments === undefined) {
        return <AssignmentsSkeleton />;
    }

    const pending = assignments.filter(a => a.status === "pending" || a.status === "overdue");
    const completed = assignments.filter(a => a.status === "submitted" || a.status === "graded");

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Assignments</h1>
                <p className="text-zinc-500">Track your tasks and submissions</p>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="pending">To Do ({pending.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6 space-y-4">
                    {pending.map((assignment) => (
                        <Card key={assignment._id} className="border-zinc-200 shadow-sm hover:border-blue-300 transition-all">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                    <FileText className="h-6 w-6 fill-current" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between md:justify-start gap-3">
                                        <h3 className="font-semibold text-zinc-900 text-lg">{assignment.title}</h3>
                                        {assignment.status === "overdue" && (
                                            <Badge variant="destructive" className="gap-1">
                                                <AlertCircle className="h-3 w-3 fill-current" /> Overdue
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-zinc-500 text-sm">
                                        {assignment.subject} • Due {format(new Date(assignment.dueDate), "MMM d, h:mm a")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden md:block">
                                        <div className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Points</div>
                                        <div className="font-semibold text-zinc-900">{assignment.maxScore}</div>
                                    </div>
                                    <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 gap-2">
                                        Start Assignment <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {pending.length === 0 && (
                        <div className="text-center py-16 bg-zinc-50 rounded-xl border-dashed border-2 border-zinc-200">
                            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4 fill-current opacity-50" />
                            <h3 className="text-lg font-medium text-zinc-900">All caught up!</h3>
                            <p className="text-zinc-500">You have no pending assignments.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6 space-y-4">
                    {completed.map((assignment) => (
                        <Card key={assignment._id} className="border-zinc-200 bg-zinc-50/50">
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6 opacity-80 hover:opacity-100 transition-opacity">
                                <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 border border-green-200">
                                    <CheckCircle2 className="h-6 w-6 fill-current" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold text-zinc-900 text-lg line-through text-zinc-500 decoration-zinc-400">
                                        {assignment.title}
                                    </h3>
                                    <p className="text-zinc-500 text-sm">
                                        {assignment.subject} • Submitted on {format(new Date(assignment.result?.gradedAt || Date.now()), "MMM d")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {assignment.status === "graded" ? (
                                        <div className="text-right">
                                            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Score</div>
                                            <div className="font-bold text-green-600 text-xl">
                                                {assignment.result?.score}/{assignment.maxScore}
                                            </div>
                                        </div>
                                    ) : (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            Pending Grade
                                        </Badge>
                                    )}
                                    <Button variant="outline" size="sm">View</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
