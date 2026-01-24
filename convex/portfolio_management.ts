import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Delete portfolio item (student or teacher)
export const deletePortfolioItem = mutation({
    args: {
        portfolioItemId: v.id("portfolio_items")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const item = await ctx.db.get(args.portfolioItemId);
        if (!item) {
            throw new Error("Portfolio item not found");
        }

        // Check authorization - student owns it or teacher created it
        const user = await ctx.db.get(userId);
        if (item.studentId !== userId && item.teacherId !== userId && user?.role !== "admin") {
            throw new Error("Unauthorized - cannot delete this portfolio item");
        }

        // Delete associated files from storage
        if (item.attachments) {
            for (const attachment of item.attachments) {
                if (attachment.storageId) {
                    await ctx.storage.delete(attachment.storageId);
                }
            }
        }

        await ctx.db.delete(args.portfolioItemId);
    }
});

// Update portfolio item
export const updatePortfolioItem = mutation({
    args: {
        portfolioItemId: v.id("portfolio_items"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        type: v.optional(v.union(
            v.literal("project"),
            v.literal("assignment"),
            v.literal("assessment"),
            v.literal("reflection")
        )),
        competency: v.optional(v.union(
            v.literal("communication_collaboration"),
            v.literal("self_efficacy"),
            v.literal("critical_thinking"),
            v.literal("creativity_imagination"),
            v.literal("citizenship"),
            v.literal("digital_literacy"),
            v.literal("learning_to_learn")
        )),
        isPublic: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const item = await ctx.db.get(args.portfolioItemId);
        if (!item) {
            throw new Error("Portfolio item not found");
        }

        // Check authorization
        if (item.studentId !== userId && item.teacherId !== userId) {
            throw new Error("Unauthorized");
        }

        const updates: any = {};
        if (args.title !== undefined) updates.title = args.title;
        if (args.description !== undefined) updates.description = args.description;
        if (args.type !== undefined) updates.type = args.type;
        if (args.competency !== undefined) updates.competency = args.competency;
        if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

        await ctx.db.patch(args.portfolioItemId, updates);
    }
});

// Get portfolio items for teacher review
export const getPortfolioItemsForReview = query({
    args: {
        studentId: v.optional(v.id("users")),
        needsFeedback: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (user?.role !== "teacher" && user?.role !== "admin") {
            return [];
        }

        // Get portfolio items
        let items = await ctx.db
            .query("portfolio_items")
            .collect();

        // Filter by student if specified
        if (args.studentId) {
            items = items.filter(item => item.studentId === args.studentId);
        }

        // Filter items needing feedback
        if (args.needsFeedback) {
            items = items.filter(item => !item.feedback);
        }

        // Populate student data
        const itemsWithStudents = await Promise.all(
            items.map(async (item) => {
                const student = await ctx.db.get(item.studentId);
                return {
                    ...item,
                    studentName: student?.name || "Unknown Student",
                    studentImage: student?.image
                };
            })
        );

        return itemsWithStudents.sort((a, b) => b.submittedAt - a.submittedAt);
    }
});
