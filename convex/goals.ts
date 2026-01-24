import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Set a new competency goal
export const setCompetencyGoal = mutation({
    args: {
        competency: v.string(),
        targetLevel: v.union(v.literal("EE"), v.literal("ME"), v.literal("AE")),
        deadline: v.number() // Date timestamp
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Check for existing active goal for this competency
        const existing = await ctx.db
            .query("competency_goals")
            .withIndex("by_student_competency", q => q.eq("studentId", userId).eq("competency", args.competency))
            .filter(q => q.eq(q.field("status"), "in_progress"))
            .first();

        if (existing) {
            // Update deadline or target if already exists
            await ctx.db.patch(existing._id, {
                targetLevel: args.targetLevel,
                deadline: args.deadline
            });
            return existing._id;
        }

        // Create new goal
        return await ctx.db.insert("competency_goals", {
            studentId: userId,
            competency: args.competency,
            targetLevel: args.targetLevel,
            deadline: args.deadline,
            status: "in_progress",
            createdAt: Date.now()
        });
    }
});

// Get my active goals
export const getMyGoals = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("competency_goals")
            .withIndex("by_student", q => q.eq("studentId", userId))
            .filter(q => q.neq(q.field("status"), "expired"))
            .collect();
    }
});
