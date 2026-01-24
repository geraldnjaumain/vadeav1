import { v } from "convex/values";
import { query, mutation, internalMutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const initiatePurchase = mutation({
    args: {
        courseId: v.id("courses"),
        amount: v.number(), // In a real app, amount should be fetched from DB to prevent tampering
        channel: v.optional(v.string()),
        phone: v.optional(v.string()), // For M-Pesa STK push
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Check if already enrolled
        const existingEnrollment = await ctx.db
            .query("enrollments")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("courseId"), args.courseId))
            .first();

        if (existingEnrollment) {
            throw new Error("Already enrolled in this course");
        }

        const transactionId = await ctx.db.insert("transactions", {
            userId,
            courseId: args.courseId,
            amount: args.amount,
            currency: "KES",
            status: "pending",
            channel: args.channel || "mpesa",
            createdAt: Date.now(),
        });

        return transactionId;
    },
});

export const processSimulation = mutation({
    args: { transactionId: v.id("transactions") },
    handler: async (ctx, args) => {
        // Only for DEV/DEMO purposes.
        // In production, this would be a webhook handler verified by signature.

        const tx = await ctx.db.get(args.transactionId);
        if (!tx || tx.status !== "pending") return;

        // 1. Mark transaction as success
        await ctx.db.patch(args.transactionId, { status: "success", reference: `SIM-${Date.now()}` });

        // 2. Enroll user
        if (tx.courseId) {
            await ctx.db.insert("enrollments", {
                userId: tx.userId,
                courseId: tx.courseId,
                status: "active",
            });
        }

        // 3. Send Receipt (Async)
        const user = await ctx.db.get(tx.userId);
        const course = tx.courseId ? await ctx.db.get(tx.courseId) : null;

        if (user && user.email && course && course.title) {
            console.log("Scheduling receipt email for", user.email);
            // @ts-ignore - Fixing type inference issue
            await ctx.scheduler.runAfter(0, internal.emails.sendPurchaseReceipt, {
                email: user.email,
                courseTitle: course.title,
                amount: tx.amount,
            });
        }

        return "success";
    },
});

// Internal mutation for webhook processing
export const processWebhook = internalMutation({
    args: {
        transactionId: v.string(),
        status: v.string(),
        reference: v.string(),
    },
    handler: async (ctx, args) => {
        // Find transaction by reference or ID
        // In production, you'd store a mapping of KeshoPay refs to Convex IDs
        const transactions = await ctx.db.query("transactions").collect();
        const tx = transactions.find(t => t.reference === args.transactionId || t._id === args.transactionId);

        if (!tx) {
            console.log("Transaction not found:", args.transactionId);
            return;
        }

        if (tx.status !== "pending") {
            console.log("Transaction already processed:", tx._id);
            return;
        }

        const newStatus = args.status === "SUCCESS" ? "success" : "failed";

        // Update transaction
        await ctx.db.patch(tx._id, {
            status: newStatus,
            reference: args.reference,
        });

        // If successful, enroll user
        if (newStatus === "success" && tx.courseId) {
            await ctx.db.insert("enrollments", {
                userId: tx.userId,
                courseId: tx.courseId,
                status: "active",
            });

            // Send receipt
            const user = await ctx.db.get(tx.userId);
            const course = tx.courseId ? await ctx.db.get(tx.courseId) : null;

            if (user?.email && course) {
                await ctx.scheduler.runAfter(0, internal.emails.sendPurchaseReceipt, {
                    email: user.email,
                    courseTitle: course.title,
                    amount: tx.amount,
                });
            }
        }
    },
});

// Initiate STK Push (would call KeshoPay API in production)
export const initiateSTKPush = action({
    args: {
        transactionId: v.id("transactions"),
        phone: v.string(),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        // In production, call KeshoPay API here
        // Example: POST to https://api.keshopay.co.ke/v1/stk-push

        const KESHOPAY_API_KEY = process.env.KESHOPAY_API_KEY;

        if (!KESHOPAY_API_KEY) {
            console.log("[DEV] STK Push simulated for:", args.phone, "Amount:", args.amount);
            // Simulate success after 3 seconds
            await ctx.scheduler.runAfter(3000, internal.payments.processWebhook, {
                transactionId: args.transactionId,
                status: "SUCCESS",
                reference: `STK-${Date.now()}`,
            });
            return { success: true, message: "STK push simulated" };
        }

        try {
            const response = await fetch("https://api.keshopay.co.ke/v1/stk-push", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${KESHOPAY_API_KEY}`,
                },
                body: JSON.stringify({
                    phone: args.phone,
                    amount: args.amount,
                    reference: args.transactionId,
                    callback_url: `${process.env.CONVEX_SITE_URL}/api/payments/webhook`,
                }),
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error("STK Push failed:", error);
            return { success: false, error: "Failed to initiate payment" };
        }
    },
});

export const getMyTransactions = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        // Enrich with course data
        const enriched = await Promise.all(
            transactions.map(async (tx) => {
                let courseTitle = "Unknown Course";
                if (tx.courseId) {
                    const course = await ctx.db.get(tx.courseId);
                    // @ts-ignore
                    if (course) courseTitle = course.title;
                }
                return {
                    ...tx,
                    courseTitle,
                };
            })
        );

        return enriched;
    },
});
