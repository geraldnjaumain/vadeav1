"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Wallet, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingPage() {
    const transactions = useQuery(api.payments.getMyTransactions);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "success":
                return (
                    <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Success
                    </Badge>
                );
            case "pending":
                return (
                    <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                    </Badge>
                );
            case "failed":
                return (
                    <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Failed
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-KE", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const totalSpent = transactions?.filter(t => t.status === "success").reduce((sum, t) => sum + t.amount, 0) || 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Billing & Subscription</h2>
                <p className="text-zinc-500">Manage your plan and payment methods.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Spent</CardDescription>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            KES {totalSpent.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Courses Purchased</CardDescription>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            {transactions?.filter(t => t.status === "success").length || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pending Payments</CardDescription>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            {transactions?.filter(t => t.status === "pending").length || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Current Plan */}
                <Card className="border-zinc-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>You are currently on the <span className="font-semibold text-zinc-900">Standard Parent Plan</span></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2 text-sm text-zinc-600">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Access to all core courses</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-zinc-600">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Student Progress Tracking</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-zinc-600">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Direct Teacher Messaging</span>
                        </div>

                        <div className="mt-6 pt-6 border-t border-zinc-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Status</span>
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Active</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm font-medium">Renewal Date</span>
                                <span className="text-sm text-zinc-500">Feb 19, 2026</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-100 bg-red-50/10 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-red-900">Danger Zone</CardTitle>
                        <CardDescription>Manage subscription cancellation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-md border border-red-100">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-red-900">Process for Cancellation</p>
                                <p className="text-xs text-red-800">
                                    To cancel your subscription, please click the button below. Your access will remain active until the end of your billing period.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            className="w-full"
                            asChild
                        >
                            <a href="mailto:support@vadea.com?subject=Cancellation Request&body=I would like to cancel my subscription for account..." >
                                Cancel Subscription
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Transaction History
                    </CardTitle>
                    <CardDescription>
                        All your course purchases and payments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions === undefined ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-8">
                            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Your payment history will appear here when you enroll in courses.
                            </p>
                            <Button asChild>
                                <Link href="/courses">Browse Courses</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div
                                    key={tx._id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-medium">{tx.courseTitle}</h4>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span>{formatDate(tx.createdAt)}</span>
                                            <span className="capitalize">{tx.channel}</span>
                                            {tx.reference && (
                                                <span className="font-mono text-xs">{tx.reference}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold">
                                            KES {tx.amount.toLocaleString()}
                                        </span>
                                        {getStatusBadge(tx.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
