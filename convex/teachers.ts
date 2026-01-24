import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const submitApplication = mutation({
    args: {
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        phone: v.string(),
        subjects: v.string(),
        experience: v.string(),
        resumeStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const applicationId = await ctx.db.insert("teacher_applications", {
            ...args,
            status: "pending",
            createdAt: Date.now(),
        });
        return applicationId;
    },
});

// Get all teacher applications (admin only)
export const getAllApplications = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        return await ctx.db.query("teacher_applications").order("desc").collect();
    },
});

// Get pending teacher applications (admin only)
export const getPendingApplications = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        return await ctx.db
            .query("teacher_applications")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .order("desc")
            .collect();
    },
});

// Approve teacher application (admin only)
export const approveApplication = mutation({
    args: { applicationId: v.id("teacher_applications") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const admin = await ctx.db.get(userId);
        if (!admin || admin.role !== "admin") throw new Error("Permission denied");

        const application = await ctx.db.get(args.applicationId);
        if (!application) throw new Error("Application not found");

        // Update application status
        await ctx.db.patch(args.applicationId, { status: "approved" });

        // If there's a linked user account, remove demo mode restrictions
        if (application.userId) {
            await ctx.db.patch(application.userId, {
                isFirstLogin: false,
            });
        }

        return { success: true };
    },
});

// Reject teacher application (admin only)
export const rejectApplication = mutation({
    args: { applicationId: v.id("teacher_applications") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const admin = await ctx.db.get(userId);
        if (!admin || admin.role !== "admin") throw new Error("Permission denied");

        await ctx.db.patch(args.applicationId, { status: "rejected" });

        return { success: true };
    },
});

// Get application by email (for checking status)
export const getApplicationByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("teacher_applications")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

// Check if current teacher is in demo mode
export const getTeacherDemoStatus = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "teacher") return null;

        // Check if there's an approved application
        const application = await ctx.db
            .query("teacher_applications")
            .withIndex("by_email", (q) => q.eq("email", user.email))
            .first();

        return {
            isDemoMode: !application || application.status !== "approved",
            applicationStatus: application?.status || "not_applied",
        };
    },
});
