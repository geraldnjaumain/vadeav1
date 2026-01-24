import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get notifications for the current user
export const get = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(20);

        return notifications;
    },
});

// Get unread count
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return 0;

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("isRead", false))
            .collect();

        return unread.length;
    },
});

// Mark a single notification as read
export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const notification = await ctx.db.get(args.notificationId);
        if (!notification || notification.userId !== userId) {
            throw new Error("Notification not found or unauthorized");
        }

        await ctx.db.patch(args.notificationId, { isRead: true });
    },
});

// Mark all as read
export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("isRead", false))
            .collect();

        for (const n of unread) {
            await ctx.db.patch(n._id, { isRead: true });
        }
    },
});

// Internal mutation to create a notification (to be called by other internal actions)
export const create = mutation({
    args: {
        userId: v.id("users"),
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error")),
        link: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            userId: args.userId,
            title: args.title,
            message: args.message,
            type: args.type,
            link: args.link,
            isRead: false,
            createdAt: Date.now(),
        });
    },
});

// DEBUG: Create a test notification for the current user
export const createTestNotification = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        await ctx.db.insert("notifications", {
            userId,
            title: "Welcome to Vadea!",
            message: "This is a real notification from the database.",
            type: "success",
            isRead: false,
            createdAt: Date.now(),
        });
    },
});
