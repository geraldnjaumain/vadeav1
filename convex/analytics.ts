import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const logVisit = mutation({
    args: {
        path: v.string(),
        userAgent: v.string(),
        ip: v.optional(v.string()),
        location: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        
        await ctx.db.insert("analytics", {
            ...args,
            userId: userId || undefined,
            timestamp: Date.now(),
        });
    },
});

export const getRecent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;
        
        // Security check: Only admins can view analytics
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");
        const user = await ctx.db.get(userId);
        if (user?.role !== "admin") throw new Error("Access denied");

        return await ctx.db.query("analytics")
            .order("desc")
            .take(limit);
    },
});
