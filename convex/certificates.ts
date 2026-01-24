import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Issue a certificate (Admin only)
export const issueCertificate = mutation({
    args: {
        studentId: v.id("users"),
        type: v.union(v.literal("completion"), v.literal("competency"), v.literal("academic"), v.literal("leaving")),
        title: v.string(),
        description: v.optional(v.string()),
        fileUrl: v.string(), // In real app, this would be generated or uploaded
        metadata: v.optional(v.object({
            grade: v.optional(v.string()),
            year: v.optional(v.number()),
            competency: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new Error("Only admins can issue certificates");
        }

        return await ctx.db.insert("certificates", {
            ...args,
            issuedBy: userId,
            issuedAt: Date.now()
        });
    }
});

// Get my certificates (Student)
export const getMyCertificates = query({
    args: {
        studentId: v.optional(v.id("users")) // For parents viewing child
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        let targetId = userId;

        if (args.studentId && (user?.role === "parent" || user?.role === "admin")) {
            targetId = args.studentId;
        }

        return await ctx.db
            .query("certificates")
            .withIndex("by_student", q => q.eq("studentId", targetId))
            .collect();
    }
});
