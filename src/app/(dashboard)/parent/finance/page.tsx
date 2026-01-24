"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { Wallet, CreditCard, Banknote, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function FinancePage() {
    const invoices = useQuery(api.finance.getInvoices);
    const transactions = useQuery(api.finance.getTransactions);
    const seedInvoices = useMutation(api.finance.seedInvoices);
    const payInvoice = useMutation(api.finance.payInvoice);

    const [processingId, setProcessingId] = useState<string | null>(null);

    // Auto-seed data for demo
    useEffect(() => {
        if (invoices !== undefined && invoices.length === 0) {
            seedInvoices();
        }
    }, [invoices, seedInvoices]);

    const handlePay = async (invoiceId: any, amount: number) => {
        setProcessingId(invoiceId);
        try {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1500));
            await payInvoice({ invoiceId });
            toast.success(`Payment of KES ${amount.toLocaleString()} successful!`);
        } catch (error: any) {
            toast.error(error.message || "Payment failed");
        } finally {
            setProcessingId(null);
        }
    };

    if (invoices === undefined || transactions === undefined) {
        return <LoadingAnimation message="Loading financial records..." />;
    }

    // Calculations
    const totalDue = invoices
        .filter(inv => inv.status !== "paid" && inv.status !== "void")
        .reduce((sum, inv) => sum + inv.amount, 0);

    const overdueAmount = invoices
        .filter(inv => inv.status === "overdue")
        .reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Fees & Payments</h1>
                    <p className="text-zinc-500">Manage school fees, view statements, and make payments.</p>
                </div>
                <div className="flex gap-3">
                    <Card className="bg-blue-600 text-white border-none shadow-md">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-white/20 rounded-full">
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Total Due</p>
                                <p className="text-2xl font-bold">KES {totalDue.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Tabs defaultValue="invoices" className="w-full">
                <TabsList>
                    <TabsTrigger value="invoices">Invoices & Due Fees</TabsTrigger>
                    <TabsTrigger value="history">Transaction History</TabsTrigger>
                </TabsList>

                <TabsContent value="invoices" className="mt-6 space-y-6">
                    {overdueAmount > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-4 text-red-800">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-semibold">Overdue Balance: KES {overdueAmount.toLocaleString()}</h4>
                                <p className="text-sm text-red-700">Please clear outstanding balances to avoid service interruption.</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => toast.info("Please select an overdue invoice below to pay.")}>
                                Pay Now
                            </Button>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {invoices.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="py-12 text-center text-zinc-500">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                                    <p>No pending invoices found.</p>
                                    <p className="text-sm">You are all caught up!</p>
                                </CardContent>
                            </Card>
                        ) : (
                            invoices.map((invoice) => (
                                <Card key={invoice._id} className={cn("transition-all", invoice.status === "paid" && "opacity-60 bg-zinc-50")}>
                                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={cn("p-2 rounded-full",
                                                invoice.status === "paid" ? "bg-green-100 text-green-700" :
                                                    invoice.status === "overdue" ? "bg-red-100 text-red-700" :
                                                        "bg-blue-100 text-blue-700"
                                            )}>
                                                <Banknote className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg">{invoice.title}</h3>
                                                    <StatusBadge status={invoice.status} />
                                                </div>
                                                <p className="text-sm text-zinc-500 mb-1">{invoice.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> Due: {format(invoice.dueDate, 'MMM dd, yyyy')}
                                                    </span>
                                                    <span>Ref: #{invoice._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 md:text-right">
                                            <div>
                                                <p className="font-bold text-xl">KES {invoice.amount.toLocaleString()}</p>
                                                {invoice.status !== "paid" && (
                                                    <p className="text-xs text-zinc-500">via M-Pesa / Card</p>
                                                )}
                                            </div>
                                            {invoice.status !== "paid" ? (
                                                <Button
                                                    className={cn("min-w-[100px]", invoice.status === "overdue" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700")}
                                                    onClick={() => handlePay(invoice._id, invoice.amount)}
                                                    disabled={processingId === invoice._id}
                                                >
                                                    {processingId === invoice._id ? <LoadingAnimation className="h-4 w-4" /> : "Pay Now"}
                                                </Button>
                                            ) : (
                                                <Button variant="outline" disabled className="text-green-600 border-green-200 bg-green-50">
                                                    <CheckCircle className="h-4 w-4 mr-2" /> Paid
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>Recent payments and activity.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transactions.length === 0 ? (
                                <p className="text-zinc-500 text-center py-8">No transactions recorded yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.map((tx) => (
                                        <div key={tx._id} className="flex items-center justify-between py-3 border-b last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-zinc-100 rounded-full text-zinc-600">
                                                    <CreditCard className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">Payment for Invoice</p>
                                                    <p className="text-xs text-zinc-500">{format(tx.createdAt, "PPP 'at' p")}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm text-green-600">
                                                    + {tx.currency} {tx.amount.toLocaleString()}
                                                </p>
                                                <p className="text-xs font-mono text-zinc-400">
                                                    {tx.reference || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "paid":
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Paid</Badge>;
        case "overdue":
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Overdue</Badge>;
        case "pending":
            return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
