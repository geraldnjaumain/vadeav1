import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAllSettings = query({
    args: {},
    handler: async (ctx) => {
        // Settings might be public or protected depending on nature. 
        // For admin dashboard, we fetch all.
        // For public site, we might need a separate "getPublicSettings" query.

        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        return await ctx.db.query("system_settings").collect();
    },
});

export const getSetting = query({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("system_settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique();
    },
});

export const updateSetting = mutation({
    args: {
        key: v.string(),
        value: v.any(), // JSON value
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new Error("Only admins can update settings");
        }

        const existing = await ctx.db
            .query("system_settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                value: args.value,
                description: args.description,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("system_settings", {
                key: args.key,
                value: args.value,
                description: args.description,
                updatedAt: Date.now(),
            });
        }
    },
});

// Helper for initial seeding
export const seedDefaults = mutation({
    args: {},
    handler: async (ctx) => {
        const defaults = [
            { key: "site_name", value: "Vadea Academy", desc: "Global site name" },
            { key: "maintenance_mode", value: false, desc: "Enable maintenance mode" },
            { key: "registration_open", value: true, desc: "Allow new student registrations" },
            { key: "current_term", value: "Term 1, 2026", desc: "Current academic term label" },
        ];

        for (const d of defaults) {
            const existing = await ctx.db.query("system_settings").withIndex("by_key", q => q.eq("key", d.key)).unique();
            if (!existing) {
                await ctx.db.insert("system_settings", {
                    key: d.key,
                    value: d.value,
                    description: d.desc,
                    updatedAt: Date.now()
                });
            }
        }
    }
});
