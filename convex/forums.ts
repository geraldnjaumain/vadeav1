import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const listChannels = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user) return [];

        const allChannels = await ctx.db.query("channels").collect();

        return allChannels.filter(channel => {
            // General forums (no role) are visible to everyone
            if (!channel.role) return true;

            // Role-specific forums
            return channel.role === user.role;
        });
    },
});

export const getChannel = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("channels")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .unique();
    },
});

export const listTopics = query({
    args: { channelSlug: v.string() },
    handler: async (ctx, args) => {
        const channel = await ctx.db
            .query("channels")
            .withIndex("by_slug", (q) => q.eq("slug", args.channelSlug))
            .unique();

        if (!channel) return [];

        let topics = await ctx.db
            .query("topics")
            .withIndex("by_channel", (q) => q.eq("channelId", channel._id))
            .collect();

        // Sort: Pinned first, then by lastReplyAt desc
        topics = topics.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return (b.lastReplyAt ?? 0) - (a.lastReplyAt ?? 0);
        });

        const enrichedTopics = await Promise.all(
            topics.map(async (topic) => {
                const author = await ctx.db.get(topic.authorId);
                const postCount = (
                    await ctx.db
                        .query("posts")
                        .withIndex("by_topic", (q) => q.eq("topicId", topic._id))
                        .collect()
                ).length;
                return {
                    ...topic,
                    authorName: author?.name || "Unknown",
                    authorRole: author?.role,
                    postCount,
                };
            })
        );

        return enrichedTopics;
    },
});

export const getTopic = query({
    args: { topicId: v.id("topics") },
    handler: async (ctx, args) => {
        const topic = await ctx.db.get(args.topicId);
        if (!topic) return null;

        const author = await ctx.db.get(topic.authorId);
        const channel = await ctx.db.get(topic.channelId);

        return {
            ...topic,
            authorName: author?.name || "Unknown",
            authorImage: author?.image,
            channelName: channel?.name || "Unknown",
            channelSlug: channel?.slug || "",
        };
    },
});

export const incrementTopicViews = mutation({
    args: { topicId: v.id("topics") },
    handler: async (ctx, args) => {
        const topic = await ctx.db.get(args.topicId);
        if (topic) {
            await ctx.db.patch(args.topicId, { views: (topic.views || 0) + 1 });
        }
    },
});

export const listPosts = query({
    args: { topicId: v.id("topics") },
    handler: async (ctx, args) => {
        const posts = await ctx.db
            .query("posts")
            .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
            .order("asc")
            .collect();

        const userId = await getAuthUserId(ctx);

        const enrichedPosts = await Promise.all(
            posts.map(async (post) => {
                const author = await ctx.db.get(post.authorId);
                return {
                    ...post,
                    authorName: author?.name || "Unknown",
                    authorImage: author?.image,
                    authorRole: author?.role,
                    isLiked: userId && post.likes ? post.likes.includes(userId) : false,
                    likeCount: post.likes ? post.likes.length : 0,
                    isAuthor: userId === post.authorId,
                };
            })
        );

        return enrichedPosts;
    },
});

export const createTopic = mutation({
    args: {
        channelId: v.id("channels"),
        title: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const topicId = await ctx.db.insert("topics", {
            channelId: args.channelId,
            authorId: userId,
            title: args.title,
            content: args.content,
            lastReplyAt: Date.now(),
            createdAt: Date.now(),
            views: 0,
            isPinned: false,
        });

        return topicId;
    },
});

export const createPost = mutation({
    args: {
        topicId: v.id("topics"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const postId = await ctx.db.insert("posts", {
            topicId: args.topicId,
            authorId: userId,
            content: args.content,
            createdAt: Date.now(),
            likes: [],
        });

        await ctx.db.patch(args.topicId, {
            lastReplyAt: Date.now(),
        });

        // Update daily challenge progress for forum posts (students only)
        const user = await ctx.db.get(userId);
        if (user?.role === "student") {
            await ctx.scheduler.runAfter(0, internal.challenges.updateChallengeProgress, {
                userId,
                challengeType: "forum",
            });
        }

        return postId;
    },
});

export const toggleLike = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");

        const likes = post.likes || [];
        const hasLiked = likes.includes(userId);

        if (hasLiked) {
            await ctx.db.patch(args.postId, {
                likes: likes.filter((id) => id !== userId),
            });
        } else {
            await ctx.db.patch(args.postId, {
                likes: [...likes, userId],
            });
        }
    },
});

export const togglePinTopic = mutation({
    args: { topicId: v.id("topics") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "admin" && user.role !== "teacher")) {
            throw new Error("Only admins and teachers can pin topics");
        }

        const topic = await ctx.db.get(args.topicId);
        if (!topic) throw new Error("Topic not found");

        await ctx.db.patch(args.topicId, {
            isPinned: !topic.isPinned,
        });
    },
});

// Admin mutation to create channels
export const createChannel = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        role: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Verify admin role (simplified check)
        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new Error("Only admins can create channels");
        }

        const channelId = await ctx.db.insert("channels", {
            name: args.name,
            slug: args.slug,
            description: args.description,
            role: args.role,
        });

        return channelId;
    },
});

export const updateChannel = mutation({
    args: {
        id: v.id("channels"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        role: v.optional(v.string()),
        slug: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new Error("Only admins can update channels");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const deleteChannel = mutation({
    args: { id: v.id("channels") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            throw new Error("Only admins can delete channels");
        }

        await ctx.db.delete(args.id);
    },
});

export const getAllChannels = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        return await ctx.db.query("channels").collect();
    },
});
