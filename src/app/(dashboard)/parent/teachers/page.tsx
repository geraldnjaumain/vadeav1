"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { Mail, Phone, BookOpen, User, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function TeachersPage() {
    const teachers = useQuery(api.parent_actions.getChildTeachers);

    if (teachers === undefined) {
        return <LoadingAnimation message="Finding teachers..." />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Teachers & Staff</h1>
                <p className="text-zinc-500">Contact information for your children's educators.</p>
            </div>

            {teachers.length === 0 ? (
                <Card className="border-dashed border-2 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                    <CardContent className="flex flex-col items-center justify-center p-16 text-center text-zinc-500 space-y-6">
                        <div className="bg-white p-4 rounded-full shadow-sm ring-1 ring-zinc-100">
                            <Users className="h-12 w-12 text-blue-500 fill-blue-500" />
                        </div>
                        <div className="max-w-md space-y-2">
                            <h3 className="font-bold text-xl text-zinc-900">No teachers linked yet</h3>
                            <p className="text-zinc-500 text-base leading-relaxed">
                                Teachers will automatically appear here once your children are enrolled in their classes. Checking back later?
                            </p>
                        </div>
                        {/* Optional: Add a button if there's a clear action, e.g., "View Enrollments" */}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teachers.map((teacher: any) => (
                        <Card key={teacher._id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <Avatar className="h-14 w-14 border border-zinc-100">
                                    <AvatarImage src={teacher.image} alt={teacher.name} />
                                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{teacher.name}</CardTitle>
                                    <CardDescription>
                                        {(teacher.email?.length > 25)
                                            ? teacher.email.substring(0, 22) + "..."
                                            : teacher.email}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2 flex-grow">
                                <Separator className="my-2" />
                                <div className="space-y-3 mt-3">
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Teaches</p>
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.courses.map((c: any, i: number) => (
                                                <span key={i} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-900 hover:bg-blue-200">
                                                    {c.title}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Student(s)</p>
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.childrenNames.map((name: string, i: number) => (
                                                <div key={i} className="flex items-center gap-1 text-sm text-zinc-700 bg-zinc-50 py-1 px-2 rounded border border-zinc-100">
                                                    <User className="h-3 w-3 text-zinc-400" />
                                                    {name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 gap-2">
                                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" asChild>
                                    <a href={`mailto:${teacher.email}`}>
                                        <Mail className="h-4 w-4" /> Email
                                    </a>
                                </Button>
                                {/* Phone functionality could be added here if phone number is available */}
                                {/* 
                                <Button variant="outline" size="icon" disabled>
                                    <Phone className="h-4 w-4" />
                                </Button> 
                                */}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
