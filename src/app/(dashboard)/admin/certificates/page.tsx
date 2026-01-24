"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DocumentCheckIcon, PlusIcon } from "@heroicons/react/24/solid";

export default function AdminCertificatesPage() {
    // In a real app we'd fetch actual certificates, but we haven't implemented a "getAllCertificates" for admin yet.
    // I'll skip the list for now and focus on the "Issue" action.

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Certificates</h1>
                    <p className="text-zinc-500 mt-1">Issue official documents to students</p>
                </div>
                <IssueCertificateDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-zinc-50 border-dashed border-2 flex items-center justify-center p-6 h-48">
                    <div className="text-center">
                        <DocumentCheckIcon className="h-12 w-12 text-zinc-300 mx-auto mb-2" />
                        <p className="text-zinc-500">Certificate history view coming soon</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function IssueCertificateDialog() {
    const [open, setOpen] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [type, setType] = useState("completion");
    const [title, setTitle] = useState("");
    const [fileUrl, setFileUrl] = useState("");

    // Quick hack to get users for selection
    const users = useQuery(api.users.getUsers, {}) || [];
    const students = users.filter((u: any) => u.role === "student");

    const issue = useMutation(api.certificates.issueCertificate);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await issue({
                studentId: studentId as any,
                type: type as any,
                title,
                fileUrl,
                description: "Issued manually by admin"
            });
            toast.success("Certificate issued");
            setOpen(false);
            setTitle("");
            setFileUrl("");
        } catch (err) {
            toast.error("Failed to issue certificate");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Issue Certificate
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Issue New Certificate</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label>Student</Label>
                        <Select value={studentId} onValueChange={setStudentId} required>
                            <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                            <SelectContent>
                                {students.map((s: any) => (
                                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="completion">Completion</SelectItem>
                                <SelectItem value="competency">Competency Award</SelectItem>
                                <SelectItem value="leaving">Leaving Certificate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Grade 6 Completion" required />
                    </div>
                    <div className="space-y-2">
                        <Label>File URL (PDF)</Label>
                        <Input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://..." required />
                    </div>
                    <Button type="submit" className="w-full">Issue</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
