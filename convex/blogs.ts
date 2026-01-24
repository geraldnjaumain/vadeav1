import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to check for admin role
async function checkAdmin(ctx: any) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Access denied: Admins only");
    return user;
}

export const create = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        content: v.string(),
        excerpt: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        isPublished: v.boolean(),
    },
    handler: async (ctx, args) => {
        const user = await checkAdmin(ctx);

        // Check slug uniqueness
        const existing = await ctx.db
            .query("blogs")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) throw new Error("Slug already exists");

        await ctx.db.insert("blogs", {
            ...args,
            authorId: user._id,
            publishedAt: args.isPublished ? Date.now() : undefined,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("blogs"),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        content: v.optional(v.string()),
        excerpt: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        isPublished: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        const { id, ...updates } = args;

        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Blog post not found");

        if (updates.isPublished === true && !existing.publishedAt) {
            // First time publishing
            await ctx.db.patch(id, { ...updates, publishedAt: Date.now() });
        } else {
            await ctx.db.patch(id, updates);
        }
    },
});

export const remove = mutation({
    args: { id: v.id("blogs") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        await ctx.db.delete(args.id);
    },
});

export const listAdmin = query({
    handler: async (ctx) => {
        // Admin can see everything
        const userId = await getAuthUserId(ctx);
        if (!userId) return []; // Or throw

        const user = await ctx.db.get(userId);
        if (user?.role !== "admin") return [];

        return await ctx.db.query("blogs").order("desc").collect();
    },
});

export const listPublic = query({
    handler: async (ctx) => {
        // Only return published posts for public view
        return await ctx.db.query("blogs")
            .filter(q => q.eq(q.field("isPublished"), true))
            .order("desc") // Note: Efficient order requires index, filtering might need composite index
            // For small blog, filtering in memory is fine. For scale, use index.
            // Using index("by_slug") scan is okay for now or just scan all since blogs < 1000 usually.
            .collect();
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const post = await ctx.db
            .query("blogs")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (!post) return null;

        if (!post.isPublished) {
            // If unpublished, require admin check
            const userId = await getAuthUserId(ctx);
            if (!userId) return null;
            const user = await ctx.db.get(userId);
            if (user?.role !== "admin") return null;
        }

        return post;
    },
});

export const get = query({
    args: { id: v.id("blogs") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});
