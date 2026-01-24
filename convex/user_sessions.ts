import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Record a new user session with device/location data
export const recordSession = mutation({
    args: {
        ipAddress: v.optional(v.string()),
        location: v.optional(v.string()),
        device: v.optional(v.string()),
        userAgent: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        return await ctx.db.insert("user_sessions", {
            userId,
            ipAddress: args.ipAddress,
            location: args.location,
            device: args.device,
            userAgent: args.userAgent,
            loginAt: Date.now(),
        });
    },
});

// Get sessions for a specific user (admin only)
export const getUserSessions = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const authUserId = await getAuthUserId(ctx);
        if (!authUserId) throw new Error("Unauthorized");

        const user = await ctx.db.get(authUserId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        return await ctx.db
            .query("user_sessions")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(50);
    },
});

// Get current user's own sessions
export const getMySessions = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("user_sessions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(10);
    },
});

// Get all sessions (admin analytics)
export const getAllSessions = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        const sessions = await ctx.db
            .query("user_sessions")
            .order("desc")
            .take(args.limit || 100);

        // Enrich with user data
        const enriched = await Promise.all(
            sessions.map(async (session) => {
                const sessionUser = await ctx.db.get(session.userId);
                return {
                    ...session,
                    userName: sessionUser?.name || "Unknown",
                    userEmail: sessionUser?.email || "Unknown",
                    userRole: sessionUser?.role || "Unknown",
                };
            })
        );

        return enriched;
    },
});

// Get session analytics summary (admin)
export const getSessionAnalytics = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        const allSessions = await ctx.db.query("user_sessions").collect();

        const todaySessions = allSessions.filter(s => s.loginAt >= oneDayAgo);
        const weekSessions = allSessions.filter(s => s.loginAt >= oneWeekAgo);

        // Count unique devices
        const devices = new Set(allSessions.map(s => s.device).filter(Boolean));

        return {
            totalSessions: allSessions.length,
            sessionsToday: todaySessions.length,
            sessionsThisWeek: weekSessions.length,
            uniqueDevices: devices.size,
        };
    },
});
