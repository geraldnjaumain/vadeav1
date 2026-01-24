import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current user's onboarding status
export const getOnboardingStatus = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user) return null;

        return {
            isFirstLogin: user.isFirstLogin ?? true,
            hasCompletedTour: user.hasCompletedTour ?? false,
            passwordChangedAt: user.passwordChangedAt,
            role: user.role,
        };
    },
});

// Mark app tour as complete
export const markTourComplete = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        await ctx.db.patch(userId, {
            hasCompletedTour: true,
        });
    },
});

import { hash } from "bcryptjs";

// Change password on first login (for students)
export const changePasswordFirstLogin = mutation({
    args: {
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        if (args.newPassword.length < 8) {
            throw new Error("Password must be at least 8 characters");
        }

        const hashedPassword = await hash(args.newPassword, 10);

        await ctx.db.patch(userId, {
            password: hashedPassword,
            isFirstLogin: false,
            passwordChangedAt: Date.now(),
        });

        return { success: true };
    },
});

// Reset first login flag (admin utility)
export const resetFirstLoginFlag = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const authUserId = await getAuthUserId(ctx);
        if (!authUserId) throw new Error("Unauthorized");

        const admin = await ctx.db.get(authUserId);
        if (!admin || admin.role !== "admin") throw new Error("Permission denied");

        await ctx.db.patch(args.userId, {
            isFirstLogin: true,
            hasCompletedTour: false,
        });
    },
});

// Mark first login as complete without changing password
export const skipPasswordChange = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        await ctx.db.patch(userId, {
            isFirstLogin: false,
        });
    },
});
