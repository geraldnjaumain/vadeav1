import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;
        return await ctx.db.get(userId);
    },
});


export const debugCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return { userId: null, user: null, message: "No Auth ID" };
        const user = await ctx.db.get(userId);
        return { userId, user, message: user ? "User Found" : "User Missing from DB" };
    },
});

export const updateProfile = mutation({
    args: {
        name: v.optional(v.string()),
        // role removed to prevent privilege escalation
        phone: v.optional(v.string()),
        childrenCount: v.optional(v.string()),
        educationGoal: v.optional(v.string()),
        grade: v.optional(v.string()),
        lan: v.optional(v.string()),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");
        await ctx.db.patch(userId, args);
    },
});

// Admin: Full control to update any user
export const adminUpdateUser = mutation({
    args: {
        id: v.id("users"),
        name: v.optional(v.string()),
        role: v.optional(v.union(
            v.literal("student"),
            v.literal("parent"),
            v.literal("teacher"),
            v.literal("admin")
        )),
        email: v.optional(v.string()),
        permissions: v.optional(v.array(v.string())),
        isSuspended: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const admin = await ctx.db.get(userId);
        if (!admin || admin.role !== "admin") throw new Error("Permission denied");

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const updateAdminCredentials = mutation({
    args: {
        newUsername: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        // Check if username is taken by another user
        const existing = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.newUsername))
            .first();

        if (existing && existing._id !== userId) {
            throw new Error("Username already taken");
        }

        await ctx.db.patch(userId, {
            username: args.newUsername,
            password: args.newPassword,
        });

        return "Credentials updated successfully";
    },
});

export const updateMyPassword = mutation({
    args: {
        currentPassword: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        // Verify current password
        // Note: For MVP we store passwords plainly/simply. In production use bcrypt.
        if (user.password !== args.currentPassword) {
            throw new Error("Incorrect current password");
        }

        await ctx.db.patch(userId, {
            password: args.newPassword
        });

        return "Password updated successfully";
    },
});

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        return await ctx.db.query("users").collect();
    },
});

export const deleteUser = mutation({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        if (args.id === userId) throw new Error("Cannot delete yourself");

        await ctx.db.delete(args.id);
    },
});



export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null; // Or throw error

        const requester = await ctx.db.get(userId);
        if (!requester || requester.role !== "admin") return null; // Restrict to admin

        return await ctx.db.get(args.userId);
    },
});

export const getUser = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getUserByUsername = internalQuery({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();
    },
});

export const generateImpersonationLink = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const admin = await ctx.db.get(userId);
        if (!admin || admin.role !== "admin") throw new Error("Permission denied");

        const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

        await ctx.db.patch(args.userId, { impersonationToken: token });

        return token;
    },
});

export const getUserByImpersonationToken = internalQuery({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_impersonation_token", (q) => q.eq("impersonationToken", args.token))
            .first();
    },
});

export const clearImpersonationToken = internalMutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { impersonationToken: undefined });
    },
});

export const adminLinkChildToParent = mutation({
    args: {
        studentId: v.id("users"),
        parentId: v.id("users")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const admin = await ctx.db.get(userId);
        if (!admin || admin.role !== "admin") throw new Error("Permission denied");

        const student = await ctx.db.get(args.studentId);
        if (!student || student.role !== "student") throw new Error("Invalid student ID");

        const parent = await ctx.db.get(args.parentId);
        if (!parent || parent.role !== "parent") throw new Error("Invalid parent ID");

        await ctx.db.patch(args.studentId, { parentId: args.parentId });
    },
});
