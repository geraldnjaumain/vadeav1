"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PenTool, Settings } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function OnboardingChoicePage() {
    const user = useQuery(api.users.currentUser);
    const role = user?.role || "parent"; // Default to parent for this flow

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    Thank you for your answers, {user?.name?.split(" ")[0] || "User"}!
                </h1>
                <p className="text-zinc-500 mt-2 text-lg">
                    What would you like to do first?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                {/* Browse Courses */}
                <Link href="/courses" className="block">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-transparent hover:border-blue-200 group h-full">
                        <CardContent className="flex flex-col items-center text-center p-10 space-y-4">
                            <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                <PenTool className="h-8 w-8 text-zinc-500 group-hover:text-blue-600 fill-current" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-zinc-900">Browse Courses</h3>
                                <p className="text-sm text-zinc-500">Find courses for your child</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Explore Dashboard */}
                <Link href={`/${role}`} className="block">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-transparent hover:border-blue-200 group h-full">
                        <CardContent className="flex flex-col items-center text-center p-10 space-y-4">
                            <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                <LayoutDashboard className="h-8 w-8 text-zinc-500 group-hover:text-blue-600 fill-current" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-zinc-900">Explore Dashboard</h3>
                                <p className="text-sm text-zinc-500">View your personalized hub</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Add Child - Primary Action */}
                <Link href="/parent/children" className="block">
                    <Card className="hover:shadow-lg transition-all cursor-pointer bg-blue-600 text-white border-blue-600 hover:bg-blue-700 transform scale-105 shadow-xl h-full">
                        <CardContent className="flex flex-col items-center text-center p-10 space-y-4">
                            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                                <Settings className="h-8 w-8 text-white fill-current" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Add Your Child</h3>
                                <p className="text-sm text-blue-100">Set up learner profiles</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="mt-12">
                <Button variant="link" className="text-zinc-400" asChild>
                    <Link href={`/${role}`}>Skip for now</Link>
                </Button>
            </div>
        </div>
    );
}
