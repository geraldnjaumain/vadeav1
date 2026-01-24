import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get announcements for current user
export const getAnnouncements = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user) return [];

        const now = Date.now();

        // Get all announcements
        let announcements = await ctx.db.query("announcements").order("desc").collect();

        // Filter by relevance to user
        announcements = announcements.filter((a) => {
            // Check expiration
            if (a.expiresAt && a.expiresAt < now) return false;

            // School-wide announcements visible to all
            if (a.type === "school") return true;

            // Grade-specific
            if (a.type === "grade" && a.targetGrade) {
                if (user.role === "student" && user.grade === a.targetGrade) return true;
                if (user.role === "parent") return true; // Parents see all grade announcements
                return false;
            }

            // Role-specific
            if (a.targetRole && a.targetRole !== user.role) return false;

            return true;
        });

        // Enrich with author info
        const enriched = await Promise.all(
            announcements.map(async (a) => {
                const author = await ctx.db.get(a.authorId);
                return {
                    ...a,
                    author: author ? { name: author.name, role: author.role } : null,
                };
            })
        );

        // Sort: pinned first, then by date
        return enriched.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.createdAt - a.createdAt;
        });
    },
});

// Admin/Teacher: Create announcement
export const createAnnouncement = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        type: v.union(v.literal("school"), v.literal("class"), v.literal("grade")),
        targetGrade: v.optional(v.string()),
        targetRole: v.optional(v.string()),
        isPinned: v.optional(v.boolean()),
        expiresAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "admin" && user.role !== "teacher")) {
            throw new Error("Only admins and teachers can create announcements");
        }

        // Teachers can only create class/grade announcements
        if (user.role === "teacher" && args.type === "school") {
            throw new Error("Only admins can create school-wide announcements");
        }

        return await ctx.db.insert("announcements", {
            ...args,
            authorId: userId,
            isPinned: args.isPinned || false,
            createdAt: Date.now(),
        });
    },
});

// Admin: Delete announcement
export const deleteAnnouncement = mutation({
    args: { id: v.id("announcements") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new Error("Only admins can delete announcements");
        }

        await ctx.db.delete(args.id);
    },
});

// Toggle pinned status
export const togglePinned = mutation({
    args: { id: v.id("announcements") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new Error("Only admins can pin announcements");
        }

        const announcement = await ctx.db.get(args.id);
        if (!announcement) throw new Error("Announcement not found");

        await ctx.db.patch(args.id, { isPinned: !announcement.isPinned });
    },
});

// Get all announcements for admin
export const getAllAnnouncements = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") return [];

        const announcements = await ctx.db.query("announcements").order("desc").collect();

        const enriched = await Promise.all(
            announcements.map(async (a) => {
                const author = await ctx.db.get(a.authorId);
                return { ...a, author: author ? { name: author.name } : null };
            })
        );

        return enriched;
    },
});
