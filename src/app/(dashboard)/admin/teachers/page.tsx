"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { UserCheck, UserX, Clock, CheckCircle, XCircle, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function AdminTeachersPage() {
    const applications = useQuery(api.teachers.getAllApplications);
    const approveApplication = useMutation(api.teachers.approveApplication);
    const rejectApplication = useMutation(api.teachers.rejectApplication);

    const handleApprove = async (applicationId: Id<"teacher_applications">, name: string) => {
        try {
            await approveApplication({ applicationId });
            toast.success("Application approved", { description: `${name} is now an active teacher.` });
        } catch (error: any) {
            toast.error("Approval failed", { description: error.message });
        }
    };

    const handleReject = async (applicationId: Id<"teacher_applications">, name: string) => {
        if (!confirm(`Are you sure you want to reject ${name}'s application?`)) {
            return;
        }

        try {
            await rejectApplication({ applicationId });
            toast.success("Application rejected", { description: `${name}'s application has been rejected.` });
        } catch (error: any) {
            toast.error("Rejection failed", { description: error.message });
        }
    };

    if (applications === undefined) {
        return <LoadingAnimation message="Loading teacher applications..." />;
    }

    const pending = applications.filter(a => a.status === "pending");
    const approved = applications.filter(a => a.status === "approved");
    const rejected = applications.filter(a => a.status === "rejected");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                </Badge>;
            case "approved":
                return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> Approved
                </Badge>;
            case "rejected":
                return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <XCircle className="h-3 w-3 mr-1" /> Rejected
                </Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Teacher Applications
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Review and manage teacher applications
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Pending Review
                        </CardTitle>
                        <Clock className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            {pending.length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Approved Teachers
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" fill="currentColor" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            {approved.length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Rejected
                        </CardTitle>
                        <UserX className="h-4 w-4 text-red-600" fill="currentColor" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            {rejected.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Applications */}
            {pending.length > 0 && (
                <Card className="border-zinc-200 dark:border-zinc-800 border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-600" />
                            Pending Applications ({pending.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Subjects</TableHead>
                                    <TableHead>Experience</TableHead>
                                    <TableHead>Applied</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pending.map((app) => (
                                    <TableRow key={app._id}>
                                        <TableCell className="font-medium">
                                            {app.firstName} {app.lastName}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <Mail className="h-3 w-3" /> {app.email}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <Phone className="h-3 w-3" /> {app.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{app.subjects}</TableCell>
                                        <TableCell className="max-w-[150px] truncate">{app.experience}</TableCell>
                                        <TableCell className="text-zinc-500 text-sm">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                                    onClick={() => handleApprove(app._id, `${app.firstName} ${app.lastName}`)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                    onClick={() => handleReject(app._id, `${app.firstName} ${app.lastName}`)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" /> Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* All Applications */}
            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle>All Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No teacher applications yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Subjects</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app._id}>
                                        <TableCell className="font-medium">
                                            {app.firstName} {app.lastName}
                                        </TableCell>
                                        <TableCell className="text-zinc-500">{app.email}</TableCell>
                                        <TableCell>{app.subjects}</TableCell>
                                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                                        <TableCell className="text-zinc-500 text-sm">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
