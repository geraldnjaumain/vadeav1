"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, UserIcon, PaperClipIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { Brain, FileText, Image, Video, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Attachment {
    name: string;
    url: string;
    type: string;
}

interface PortfolioItem {
    _id: string;
    title: string;
    description: string;
    type: string;
    competency?: string;
    submittedAt: number;
    attachments?: Attachment[];
    teacherId?: string; // ID only, name would require extra fetch or hydration
    feedback?: string;
    status?: "pending" | "approved" | "rejected";
    isPublic?: boolean;
}

interface PortfolioDetailsDialogProps {
    item: PortfolioItem;
    children: React.ReactNode;
}

export function PortfolioDetailsDialog({ item, children }: PortfolioDetailsDialogProps) {
    const [open, setOpen] = useState(false);

    const getTypeColor = (type: string) => {
        switch (type) {
            case "project": return "bg-purple-100 text-purple-700 border-purple-200";
            case "assignment": return "bg-blue-100 text-blue-700 border-blue-200";
            case "assessment": return "bg-green-100 text-green-700 border-green-200";
            case "reflection": return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusBadge = (status?: string) => {
        if (!status || status === "pending") return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>;
        if (status === "approved") return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircleIcon className="h-3 w-3" /> Approved</Badge>;
        if (status === "rejected") return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1"><XCircleIcon className="h-3 w-3" /> Revision Needed</Badge>;
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div onClick={(e) => e.stopPropagation()} className="cursor-pointer w-full text-left">
                    {children}
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between pr-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={cn("text-xs font-semibold uppercase tracking-wide", getTypeColor(item.type))}>
                                    {item.type}
                                </Badge>
                                {getStatusBadge(item.status)}
                                {item.isPublic && <Badge variant="secondary" className="text-xs">Public</Badge>}
                            </div>
                            <DialogTitle className="text-2xl font-bold">{item.title}</DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted {new Date(item.submittedAt).toLocaleDateString()}</span>
                        </div>
                        {item.competency && (
                            <div className="flex items-center gap-1.5">
                                <Brain className="h-4 w-4" />
                                <span className="capitalize">{item.competency.replace(/_/g, " ")}</span>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 mb-2">Description / Reflection</h3>
                        <div className="prose prose-sm max-w-none text-zinc-600 bg-zinc-50 p-4 rounded-lg">
                            <p>{item.description}</p>
                        </div>
                    </div>

                    {/* Attachments */}
                    {item.attachments && item.attachments.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Attachments & Evidence</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {item.attachments.map((att, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                                            <PaperClipIcon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{att.name}</p>
                                            <p className="text-xs text-zinc-500 capitalize">{att.type}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(att.url, '_blank')}
                                        >
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feedback Section */}
                    {item.feedback && (
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                Teacher Feedback
                            </h3>
                            <p className="text-sm text-green-700 italic">
                                "{item.feedback}"
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-between">
                    <p className="text-xs text-zinc-400 self-center">ID: {item._id}</p>
                    <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
