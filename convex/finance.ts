import { query, mutation } from "./_generated/server";
// Force sync
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getInvoices = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const invoices = await ctx.db
            .query("invoices")
            .withIndex("by_parent", (q) => q.eq("parentId", userId))
            .collect();

        // Sort by due date (newest first for now, or closest due date)
        return invoices.sort((a, b) => a.dueDate - b.dueDate);
    },
});

export const getTransactions = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc") // Newest first
            .collect();

        return transactions;
    },
});

// Mock payment Simulation
export const payInvoice = mutation({
    args: { invoiceId: v.id("invoices") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const invoice = await ctx.db.get(args.invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        if (invoice.status === "paid") throw new Error("Invoice already paid");

        // 1. Create Transaction
        const transactionId = await ctx.db.insert("transactions", {
            userId: userId,
            amount: invoice.amount,
            currency: "KES", // Defaulting to KES for this context
            status: "success",
            invoiceId: args.invoiceId,
            channel: "mpesa", // Simulation
            reference: `SIM-${Math.floor(Math.random() * 1000000)}`,
            createdAt: Date.now(),
        });

        // 2. Update Invoice
        await ctx.db.patch(args.invoiceId, {
            status: "paid",
            paymentId: transactionId,
        });

        return { success: true, transactionId };
    },
});

// Seed function for demo
export const seedInvoices = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return;

        // Check if invoices exist
        const existing = await ctx.db
            .query("invoices")
            .withIndex("by_parent", (q) => q.eq("parentId", userId))
            .first();

        if (existing) return; // Don't double seed

        const now = Date.now();
        const Day = 86400000;

        await ctx.db.insert("invoices", {
            parentId: userId,
            title: "Term 1 2026 Tuition",
            amount: 45000,
            dueDate: now + (14 * Day), // Due in 2 weeks
            status: "pending",
            description: "Tuition fee for Grade 4 - Term 1"
        });

        await ctx.db.insert("invoices", {
            parentId: userId,
            title: "Transport Fee (January)",
            amount: 8500,
            dueDate: now + (5 * Day),
            status: "pending",
            description: "School bus transport services"
        });

        await ctx.db.insert("invoices", {
            parentId: userId,
            title: "Uniform Kit - Sports",
            amount: 3500,
            dueDate: now - (10 * Day), // Overdue
            status: "overdue",
            description: "Full sports kit branding"
        });
    }
});

export const getAllTransactions = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        const transactions = await ctx.db.query("transactions").order("desc").collect();

        const transactionsWithUsers = await Promise.all(transactions.map(async (tx) => {
            const user = await ctx.db.get(tx.userId);
            return {
                ...tx,
                user: user ? { name: user.name, email: user.email } : null
            };
        }));

        return transactionsWithUsers;
    },
});

export const getFinancialStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        const transactions = await ctx.db.query("transactions").collect();
        const pendingInvoices = await ctx.db.query("invoices").filter(q => q.eq(q.field("status"), "pending")).collect();

        const totalRevenue = transactions
            .filter(t => t.status === "success")
            .reduce((sum, t) => sum + t.amount, 0);

        const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);

        const totalTx = transactions.length;
        const successTx = transactions.filter(t => t.status === "success").length;
        const successRate = totalTx > 0 ? Math.round((successTx / totalTx) * 100) : 100;

        return {
            totalRevenue,
            pendingAmount,
            successRate
        };
    },
});
