import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getEvents = query({
    args: {
        start: v.optional(v.number()),
        end: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return []; // Or allow public?

        const user = await ctx.db.get(userId);
        if (!user) return [];

        let events = await ctx.db.query("events").collect();

        // Filter by date range if provided
        if (args.start && args.end) {
            events = events.filter(e =>
                (e.startDate >= args.start! && e.startDate <= args.end!) ||
                (e.endDate >= args.start! && e.endDate <= args.end!) ||
                (e.startDate <= args.start! && e.endDate >= args.end!)
            );
        }

        // Filter by audience
        events = events.filter(e => {
            if (!e.targetAudience || e.targetAudience === "all") return true;
            if (e.targetAudience === "student" && user.role === "student") return true;
            if (e.targetAudience === "teacher" && user.role === "teacher") return true;
            if (e.targetAudience === "parent" && user.role === "parent") return true;
            if (user.role === "admin") return true; // Admins see all
            return false;
        });

        return events;
    },
});

export const createEvent = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        startDate: v.number(),
        endDate: v.number(),
        type: v.union(v.literal("holiday"), v.literal("exam"), v.literal("event"), v.literal("deadline")),
        targetAudience: v.optional(v.union(v.literal("all"), v.literal("student"), v.literal("teacher"), v.literal("parent"))),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new Error("Only admins can create events");
        }

        return await ctx.db.insert("events", {
            ...args,
            createdBy: userId,
        });
    },
});

export const deleteEvent = mutation({
    args: { id: v.id("events") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new Error("Only admins can delete events");
        }

        await ctx.db.delete(args.id);
    },
});
