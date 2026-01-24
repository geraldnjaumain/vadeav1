"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Ticket, Filter, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AdminTicketsPage() {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [adminNote, setAdminNote] = useState("");

    // Pass undefined if "all" to fetch everything
    const tickets = useQuery(api.tickets.listAllTickets,
        statusFilter === "all" ? {} : { status: statusFilter }
    );

    const updateStatus = useMutation(api.tickets.updateTicketStatus);

    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedTicket) return;
        try {
            await updateStatus({
                ticketId: selectedTicket._id,
                status: newStatus,
                adminNotes: adminNote
            });
            toast.success(`Ticket marked as ${newStatus}`);
            setSelectedTicket(null);
            setAdminNote("");
        } catch (error) {
            toast.error("Failed to update ticket");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-blue-100 text-blue-700 hover:bg-blue-200";
            case "in_progress": return "bg-purple-100 text-purple-700 hover:bg-purple-200";
            case "resolved": return "bg-green-100 text-green-700 hover:bg-green-200";
            case "closed": return "bg-zinc-100 text-zinc-700 hover:bg-zinc-200";
            default: return "bg-zinc-100 text-zinc-700";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "text-red-600 bg-red-50 border-red-200";
            case "medium": return "text-orange-600 bg-orange-50 border-orange-200";
            case "low": return "text-blue-600 bg-blue-50 border-blue-200";
            default: return "text-zinc-500 bg-zinc-50 border-zinc-200";
        }
    };

    if (tickets === undefined) {
        return <div className="space-y-6"><TableSkeleton /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Support Tickets</h1>
                    <p className="text-zinc-500">Manage {tickets?.length} support requests</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-400" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tickets</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                            <TableHead>Subject</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Ticket className="h-8 w-8 text-zinc-300" />
                                        <p>No tickets found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => (
                                <TableRow key={ticket._id}>
                                    <TableCell className="font-medium max-w-[200px] truncate" title={ticket.subject}>
                                        {ticket.subject}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{ticket.author?.name || "Unknown"}</span>
                                            <span className="text-xs text-zinc-500">{ticket.author?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{ticket.category.replace("_", " ")}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getPriorityColor(ticket.priority || "medium")}>
                                            {ticket.priority || "medium"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                                            {ticket.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-sm">
                                        {formatDistanceToNow(ticket.createdAt, { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setAdminNote(ticket.adminNotes || "");
                                            }}
                                        >
                                            Manage
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Ticket Details Dialog */}
            <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Manage Ticket</DialogTitle>
                        <DialogDescription>
                            Review and update status for this support request.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTicket && (
                        <div className="space-y-4">
                            <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100 space-y-2">
                                <h3 className="font-semibold text-base">{selectedTicket.subject}</h3>
                                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                                <div className="flex gap-2 pt-2">
                                    <Badge variant="outline">{selectedTicket.category}</Badge>
                                    <Badge variant="outline">{formatDistanceToNow(selectedTicket.createdAt, { addSuffix: true })}</Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Admin Notes (Internal)</label>
                                <Textarea
                                    placeholder="Add notes about the resolution..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Update Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        onClick={() => handleUpdateStatus("in_progress")}
                                        disabled={selectedTicket.status === "in_progress"}
                                    >
                                        <Clock className="mr-2 h-4 w-4 text-purple-600" />
                                        In Progress
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        onClick={() => handleUpdateStatus("resolved")}
                                        disabled={selectedTicket.status === "resolved"}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                        Resolve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        onClick={() => handleUpdateStatus("closed")}
                                        disabled={selectedTicket.status === "closed"}
                                    >
                                        <AlertCircle className="mr-2 h-4 w-4 text-zinc-600" />
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
