"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMoney(amount: number) {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
}

export default function FinanceOverviewPage() {
    // Assuming we will add getAllTransactions to finance.ts or use existing
    const transactions = useQuery(api.finance.getAllTransactions);
    const stats = useQuery(api.finance.getFinancialStats); // Assuming this might exist or we use admin_stats

    if (transactions === undefined) return <LoadingAnimation message="Loading financial data..." />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Financial Overview</h1>
                <p className="text-zinc-500">Track revenue and transactions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 uppercase">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">
                            {formatMoney(stats?.totalRevenue || 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 uppercase">Pending Payments</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">
                            {formatMoney(stats?.pendingAmount || 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500 uppercase">Success Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">
                            {stats?.successRate || "100"}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                    <h3 className="font-semibold text-zinc-900">Transaction History</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx: any) => (
                                <TableRow key={tx._id} className="hover:bg-zinc-50/50">
                                    <TableCell className="text-zinc-600">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-medium text-zinc-900">
                                        {tx.user?.name || "Unknown User"}
                                    </TableCell>
                                    <TableCell className="text-zinc-600">
                                        {tx.type || "Course Purchase"}
                                    </TableCell>
                                    <TableCell className="font-mono text-zinc-900">
                                        {formatMoney(tx.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                            tx.status === "success" ? "bg-emerald-100 text-emerald-800" :
                                                tx.status === "pending" ? "bg-orange-100 text-orange-800" :
                                                    "bg-red-100 text-red-800"
                                        )}>
                                            {tx.status === "success" && <CheckCircle className="h-3 w-3" />}
                                            {tx.status === "pending" && <Clock className="h-3 w-3" />}
                                            {tx.status === "failed" && <XCircle className="h-3 w-3" />}
                                            {tx.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
