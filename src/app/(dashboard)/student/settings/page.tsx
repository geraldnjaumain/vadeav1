"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitialsAvatar } from "@/lib/avatar";
import { Loader2, Save, User, Lock, Mail, Phone, BookOpen, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SettingsSkeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
    const user = useQuery(api.users.currentUser);
    const updateProfile = useMutation(api.users.updateProfile);
    const changePassword = useMutation(api.users.updateMyPassword);

    // Profile Form State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [educationGoal, setEducationGoal] = useState("");
    const [grade, setGrade] = useState("");

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setPhone(user.phone || "");
            setEducationGoal(user.educationGoal || "");
            setGrade(user.grade || "");
        }
    }, [user]);

    if (user === undefined) {
        return <SettingsSkeleton />;
    }

    if (user === null) {
        return <div>User not found.</div>;
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({
                name,
                phone,
                educationGoal,
                grade
            });
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    // Real password change with server-side validation
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setIsSaving(true);
        try {
            await changePassword({
                currentPassword,
                newPassword
            });
            toast.success("Password updated successfully");
            setNewPassword("");
            setCurrentPassword("");
        } catch (error: any) {
            // Convex errors usually in error.message or error.data
            const msg = error.message || "Failed to update password";
            if (msg.includes("Incorrect current password")) {
                toast.error("Incorrect current password");
            } else {
                toast.error("Failed waiting for update");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h1>
                <p className="text-zinc-500">Manage your account preferences</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="profile">My Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <Card className="border-zinc-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your public profile details</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleProfileUpdate}>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <img
                                            src={getInitialsAvatar(name || "Student", 96)}
                                            alt="Avatar"
                                            className="h-24 w-24 rounded-full border-4 border-white shadow-sm"
                                        />
                                        <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0" type="button">
                                            <User className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-medium text-lg">{name}</h3>
                                        <p className="text-sm text-zinc-500">{user.email}</p>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-2">
                                            Student Account
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                            <Input id="email" value={user.email} disabled className="pl-9 bg-zinc-50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="pl-9"
                                                placeholder="+254..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="grade">Grade / Class</Label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                            <Input
                                                id="grade"
                                                value={grade}
                                                onChange={(e) => setGrade(e.target.value)}
                                                className="pl-9"
                                                placeholder="e.g. Grade 6"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-zinc-100 px-6 py-4 bg-zinc-50/50 flex justify-end">
                                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-6">
                    <Card className="border-zinc-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>Manage your password and account security</CardDescription>
                        </CardHeader>
                        <form onSubmit={handlePasswordUpdate}>
                            <CardContent className="space-y-6">
                                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-4">
                                    <ShieldCheck className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-yellow-800">Password Requirements</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            For your security, please use a password with at least 6 characters.
                                            Regularly updating your password helps keep your account safe.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                            <Input
                                                id="current-password"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-zinc-100 px-6 py-4 bg-zinc-50/50 flex justify-end">
                                <Button type="submit" disabled={isSaving} variant="outline" className="border-zinc-300">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Badge({ children, variant, className }: any) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}
