import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Helper to check for admin role
async function checkAdmin(ctx: any) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Access denied: Admins only");
    return user;
}

export const sendEmailToUser = mutation({
    args: { email: v.string(), subject: v.string(), message: v.string() },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        // Call internal action
        await ctx.scheduler.runAfter(0, internal.emails.sendCustomEmail, {
            to: args.email,
            subject: args.subject,
            body: args.message
        });
    },
});
