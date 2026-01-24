import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyAchievements = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const userAchievements = await ctx.db
            .query("user_achievements")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const achievements = await Promise.all(
            userAchievements.map(async (ua) => {
                const achievement = await ctx.db.get(ua.achievementId);
                return {
                    ...achievement,
                    awardedAt: ua.awardedAt
                };
            })
        );

        return achievements.filter(a => a !== null);
    },
});

export const getAllAchievements = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("achievements").collect();
    }
});

export const getLeaderboard = query({
    args: {},
    handler: async (ctx) => {
        // Mock leaderboard calculation
        // In prod: aggregate points from user_achievements group by userId
        // For MVP: Return mock top students
        return [
            { name: "John D.", points: 1250, avatar: "https://i.pravatar.cc/150?u=1", rank: 1 },
            { name: "Sarah K.", points: 1100, avatar: "https://i.pravatar.cc/150?u=2", rank: 2 },
            { name: "Michael O.", points: 950, avatar: "https://i.pravatar.cc/150?u=3", rank: 3 },
            { name: "You", points: 850, avatar: "", rank: 4 }, // Dynamic in real app
            { name: "Lisa M.", points: 720, avatar: "https://i.pravatar.cc/150?u=5", rank: 5 },
        ];
    }
});

export const seedAchievements = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("achievements").take(1);
        if (existing.length > 0) return;

        const badges = [
            {
                slug: "first-login",
                title: "Welcome Aboard",
                description: "Logged in for the first time",
                icon: "Hand",
                points: 10
            },
            {
                slug: "homework-hero",
                title: "Homework Hero",
                description: "Submitted 5 assignments on time",
                icon: "Zap",
                points: 50
            },
            {
                slug: "bookworm",
                title: "Bookworm",
                description: "Read 3 books from the library",
                icon: "BookOpen",
                points: 30
            },
            {
                slug: "perfect-score",
                title: "Perfectionist",
                description: "Scored 100% on a quiz",
                icon: "Star",
                points: 100
            }
        ];

        for (const b of badges) {
            await ctx.db.insert("achievements", b);
        }
    }
});
