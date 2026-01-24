"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleOption {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    accentColor: string;
    onClick: () => void;
}

export function RegisterOverview({
    onSuccess,
    onSelectParent,
    onSelectTeacher,
    onStudentLoginClick,
    onLoginClick
}: {
    onSuccess?: () => void;
    onSelectParent?: () => void;
    onSelectTeacher?: () => void;
    onStudentLoginClick?: () => void;
    onLoginClick?: () => void;
}) {
    const roleOptions: RoleOption[] = [
        {
            id: "parent",
            title: "I am a Parent",
            description: "Register your child for classes and track their progress.",
            icon: <User className="h-5 w-5 fill-current" />,
            accentColor: "bg-primary",
            onClick: onSelectParent || (() => { }),
        },
        {
            id: "teacher",
            title: "I want to Teach",
            description: "Apply to become a certified Vadea teacher.",
            icon: <Briefcase className="h-5 w-5 fill-current" />,
            accentColor: "bg-secondary-foreground",
            onClick: onSelectTeacher || (() => { }),
        },
    ];

    return (
        <div className="py-4">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
                    Join Vadea
                </h3>
                <p className="text-zinc-500 mt-2 text-sm">
                    Choose how you want to get started.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {roleOptions.map((option) => (
                    <div
                        key={option.id}
                        onClick={option.onClick}
                        className="group cursor-pointer"
                    >
                        <Card
                            className={cn(
                                "border-border transition-all relative overflow-hidden",
                                "hover:border-primary hover:shadow-md"
                            )}
                        >
                            {/* Accent bar */}
                            <div
                                className={cn(
                                    "absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity",
                                    option.accentColor
                                )}
                            />
                            <CardHeader className="flex flex-row items-center gap-4 p-4">
                                <div
                                    className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                        "bg-zinc-100 text-zinc-700",
                                        "group-hover:bg-primary group-hover:text-white"
                                    )}
                                >
                                    {option.icon}
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-base">
                                        {option.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {option.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Student Sign In - Secondary action */}
            <div className="mt-6 pt-6 border-t border-zinc-100">
                <button
                    onClick={onStudentLoginClick}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors group"
                >
                    <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <GraduationCap className="h-4 w-4 fill-current" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-medium text-zinc-900">
                            Student Sign In
                        </div>
                        <div className="text-xs text-zinc-500">
                            Already enrolled? Access your dashboard.
                        </div>
                    </div>
                </button>
            </div>

            <div className="mt-6 text-center">
                <p className="text-sm text-zinc-500">
                    Already have an account?{" "}
                    <button
                        onClick={onLoginClick}
                        className="text-zinc-900 font-medium hover:underline"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}
