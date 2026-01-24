import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Simple alphanumeric token generator
function generateToken(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// --------------------------------------------------------------------------
// EMAIL VERIFICATION
// --------------------------------------------------------------------------

export const sendVerificationCode = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) throw new Error("Account not found. Please register.");

        const token = generateToken(6); // Short code for manual entry

        await ctx.db.patch(user._id, {
            verificationToken: token,
        });

        await ctx.scheduler.runAfter(0, internal.emails.sendVerificationEmail, {
            email: user.email,
            token: token,
            name: user.name,
        });
    },
});

export const verifyEmail = mutation({
    args: { email: v.string(), token: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user || user.verificationToken !== args.token) {
            throw new Error("Invalid verification code.");
        }

        await ctx.db.patch(user._id, {
            emailVerified: true,
            verificationToken: undefined, // Clear after use
        });

        return { success: true };
    },
});

// --------------------------------------------------------------------------
// PASSWORD RESET
// --------------------------------------------------------------------------

export const sendPasswordResetToken = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) throw new Error("Account not found. Please register.");

        const token = generateToken(8);
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

        await ctx.db.patch(user._id, {
            resetToken: token,
            resetTokenExpires: expiresAt,
        });

        await ctx.scheduler.runAfter(0, internal.emails.sendPasswordResetEmail, {
            email: user.email,
            token: token,
        });
    },
});

import { modifyAccountCredentials } from "@convex-dev/auth/server";

export const resetPassword = mutation({
    args: { email: v.string(), token: v.string(), newPassword: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) throw new Error("User not found");

        // Trim and normalize tokens for comparison
        const inputToken = args.token.trim().toUpperCase();
        const storedToken = user.resetToken?.trim().toUpperCase();

        if (!storedToken || storedToken !== inputToken) {
            throw new Error("Invalid token");
        }

        if (user.resetTokenExpires && user.resetTokenExpires < Date.now()) {
            throw new Error("Token expired");
        }

        // Find the auth account to update
        const authAccount = await ctx.db
            .query("authAccounts")
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), user._id),
                    q.eq(q.field("provider"), "password")
                )
            )
            .first();

        if (!authAccount) {
            throw new Error("Account not found or does not use password login.");
        }

        // modifyAccountCredentials expects providerAccountId (the email), not the document _id
        // @ts-ignore - TypeScript doesn't have full types for this internal function
        await modifyAccountCredentials(ctx, {
            provider: "password",
            account: {
                id: authAccount.providerAccountId, // Use the email/providerAccountId, not _id
                secret: args.newPassword,
            },
        });

        await ctx.db.patch(user._id, {
            resetToken: undefined,
            resetTokenExpires: undefined,
        });

        return { success: true };
    }
});
