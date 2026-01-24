"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

import { Camera, Edit } from "lucide-react";
import { EditProfileDialog } from "@/components/parent/EditProfileDialog";

export default function ProfilePage() {
    const user = useQuery(api.users.currentUser);
    const [isEditOpen, setIsEditOpen] = useState(false);

    if (user === undefined) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <LoadingAnimation />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <EditProfileDialog open={isEditOpen} setOpen={setIsEditOpen} user={user} />

            <div className="relative mb-20">
                {/* Cover Image Placeholder */}
                <div className="h-48 w-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl"></div>

                {/* Profile Picture */}
                <div className="absolute -bottom-16 left-8 flex items-end">
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg rounded-xl">
                            <AvatarImage src={user?.image} alt={user?.name} className="object-cover" />
                            <AvatarFallback className="text-4xl font-bold bg-zinc-100 text-zinc-400 rounded-xl">
                                {user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-md h-8 w-8">
                            <Camera className="h-4 w-4 text-zinc-600" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="pt-4 px-2 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">{user?.name}</h1>
                    <p className="text-zinc-500">{user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                        {user?.role || "Parent"}
                    </span>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => setIsEditOpen(true)}>
                    <Edit className="h-4 w-4" /> Edit Profile
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-zinc-500">Full Name</label>
                            <p className="mt-1 text-zinc-900">{user?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-500">Email Address</label>
                            <p className="mt-1 text-zinc-900">{user?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-500">Phone</label>
                            <p className="mt-1 text-zinc-900">{user?.phone || "Not set"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-500">Language</label>
                            <p className="mt-1 text-zinc-900">English</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
