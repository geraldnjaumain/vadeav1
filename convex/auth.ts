import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import Google from "@auth/core/providers/google";
import { internal } from "./_generated/api";

import { compare } from "bcryptjs";

export const { auth, signIn, signOut, store } = convexAuth({
    providers: [
        Google({
            profile(googleProfile, tokens) {
                return {
                    name: googleProfile.name,
                    email: googleProfile.email,
                    role: "parent",
                    picture: googleProfile.picture,
                    emailVerified: googleProfile.email_verified,
                };
            },
        }),
        // Admin Login Provider
        ConvexCredentials({
            id: "admin",
            authorize: async (params: any, ctx: any) => {
                const { username, password, impersonationToken } = params;

                if (impersonationToken) {
                    const user = await ctx.runQuery(internal.users.getUserByImpersonationToken, { token: impersonationToken });
                    if (user) {
                        // Invalidate token after use
                        await ctx.runMutation(internal.users.clearImpersonationToken, { userId: user._id });
                        return { userId: user._id };
                    }
                    return null;
                }

                const user = await ctx.runQuery(internal.users.getUserByUsername, { username: username as string });

                if (!user) return null;
                if (user.role !== "admin") return null;

                // Check password (support both hash and legacy plaintext)
                if (user.password?.startsWith("$2a$")) {
                    const isValid = await compare(password, user.password);
                    if (!isValid) return null;
                } else {
                    if (user.password !== password) return null;
                }

                return { userId: user._id };
            },
        }),
        // Student Login Provider (Username/Password)
        ConvexCredentials({
            id: "student",
            authorize: async (params: any, ctx: any) => {
                const { username, password } = params;
                // Support both "signIn" flow and direct params
                if (params.flow === "student" || username) {
                    const user = await ctx.runQuery(internal.users.getUserByUsername, { username: username as string });

                    if (!user) return null;

                    // Check password (support both hash and legacy plaintext)
                    if (user.password?.startsWith("$2a$")) {
                        const isValid = await compare(password, user.password);
                        if (!isValid) return null;
                    } else {
                        if (user.password !== password) return null;
                    }

                    return {
                        userId: user._id,
                    };
                }
                return null;
            },
        }),
        // Default Parent/Teacher Provider (Email/Password)
        Password({
            id: "password",
            profile(params) {
                return {
                    email: params.email as string,
                    name: params.name as string,
                    role: params.role as string || "parent",
                };
            },
        }),
    ],
    callbacks: {
        async afterUserCreatedOrUpdated(ctx: any, { userId }: { userId: string }) {
            // Note: In @convex-dev/auth, newUserId is essentially userId
            const user = await ctx.db.get(userId);

            // Initialize Trial for Parents if not set
            if (user && user.role === "parent" && !user.trialEndsAt) {
                await ctx.db.patch(userId, {
                    trialEndsAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
                });
            }

            if (user && user.email) {
                try {
                    await ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
                        email: user.email,
                        name: user.name,
                    });
                } catch (err) {
                    // Log email failure but DO NOT fail the auth flow
                    console.error("Failed to schedule welcome email:", err);
                }
            }
        },
    },
});
