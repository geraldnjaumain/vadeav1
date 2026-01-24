import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// XP required for next level: 1000 * current level
const XP_PER_LEVEL = 1000;

// Get formatted date for today (YYYY-MM-DD)
function getTodayDate(): string {
    const now = new Date();
    return now.toISOString().split("T")[0];
}

// Calculate level from total XP
function calculateLevel(totalXp: number): number {
    // Level 1: 0-999 XP, Level 2: 1000-2999 XP, etc.
    if (totalXp < XP_PER_LEVEL) return 1;
    return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

// Calculate XP towards next level
function calculateCurrentXp(totalXp: number): number {
    return totalXp % XP_PER_LEVEL;
}

// Calculate XP needed for next level
function xpForNextLevel(level: number): number {
    return level * XP_PER_LEVEL;
}

/**
 * Get daily challenges for the logged-in student with their progress.
 * If no challenges exist for today, creates them from active challenge pool.
 */
export const getDailyChallenges = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return { challenges: [], user: null };

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "student") return { challenges: [], user: null };

        const today = getTodayDate();

        // Get user's challenge progress for today
        const userChallenges = await ctx.db
            .query("user_daily_challenges")
            .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
            .collect();

        // Get all active challenges
        const activeChallenges = await ctx.db
            .query("daily_challenges")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        // Map challenges with user progress
        const challengesWithProgress = activeChallenges.map((challenge) => {
            const userProgress = userChallenges.find(
                (uc) => uc.challengeId === challenge._id
            );

            return {
                ...challenge,
                currentProgress: userProgress?.currentProgress ?? 0,
                isCompleted: userProgress?.isCompleted ?? false,
                isClaimed: userProgress?.isClaimed ?? false,
            };
        });

        return {
            challenges: challengesWithProgress,
            user: {
                xp: user.xp ?? 0,
                level: user.level ?? 1,
                totalXp: user.totalXp ?? 0,
                xpForNextLevel: xpForNextLevel(user.level ?? 1),
            },
        };
    },
});

/**
 * Get user's XP and level stats
 */
export const getXpStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user) return null;

        const currentLevel = user.level ?? 1;
        const currentXp = user.xp ?? 0;
        const totalXp = user.totalXp ?? 0;
        const xpNeeded = xpForNextLevel(currentLevel);

        return {
            level: currentLevel,
            currentXp,
            totalXp,
            xpNeeded,
            progressPercent: Math.round((currentXp / xpNeeded) * 100),
        };
    },
});

/**
 * Update challenge progress when a qualifying action is performed.
 * Called internally by other mutations (quiz completion, forum post, lesson completion)
 */
export const updateChallengeProgress = internalMutation({
    args: {
        userId: v.id("users"),
        challengeType: v.union(v.literal("quiz"), v.literal("forum"), v.literal("lesson")),
    },
    handler: async (ctx, args) => {
        const today = getTodayDate();

        // Get all active challenges of this type
        const challenges = await ctx.db
            .query("daily_challenges")
            .filter((q) =>
                q.and(
                    q.eq(q.field("isActive"), true),
                    q.eq(q.field("type"), args.challengeType)
                )
            )
            .collect();

        for (const challenge of challenges) {
            // Check if user has a progress record for today
            const existing = await ctx.db
                .query("user_daily_challenges")
                .withIndex("by_user_date", (q) =>
                    q.eq("userId", args.userId).eq("date", today)
                )
                .filter((q) => q.eq(q.field("challengeId"), challenge._id))
                .first();

            if (existing) {
                // Update existing progress
                if (!existing.isCompleted) {
                    const newProgress = existing.currentProgress + 1;
                    const isNowCompleted = newProgress >= challenge.requiredCount;

                    await ctx.db.patch(existing._id, {
                        currentProgress: newProgress,
                        isCompleted: isNowCompleted,
                    });
                }
            } else {
                // Create new progress record
                const newProgress = 1;
                const isNowCompleted = newProgress >= challenge.requiredCount;

                await ctx.db.insert("user_daily_challenges", {
                    userId: args.userId,
                    challengeId: challenge._id,
                    currentProgress: newProgress,
                    isCompleted: isNowCompleted,
                    isClaimed: false,
                    date: today,
                });
            }
        }
    },
});

/**
 * Claim XP reward from a completed challenge
 */
export const claimReward = mutation({
    args: {
        challengeId: v.id("daily_challenges"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const today = getTodayDate();

        // Get user progress for this challenge today
        const userChallenge = await ctx.db
            .query("user_daily_challenges")
            .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
            .filter((q) => q.eq(q.field("challengeId"), args.challengeId))
            .first();

        if (!userChallenge) {
            throw new Error("Challenge progress not found");
        }

        if (!userChallenge.isCompleted) {
            throw new Error("Challenge not completed yet");
        }

        if (userChallenge.isClaimed) {
            throw new Error("Reward already claimed");
        }

        // Get challenge for XP reward
        const challenge = await ctx.db.get(args.challengeId);
        if (!challenge) throw new Error("Challenge not found");

        // Get user
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        // Calculate new XP totals
        const currentTotalXp = user.totalXp ?? 0;
        const newTotalXp = currentTotalXp + challenge.rewardXP;
        const newLevel = calculateLevel(newTotalXp);
        const newCurrentXp = calculateCurrentXp(newTotalXp);
        const leveledUp = newLevel > (user.level ?? 1);

        // Update user XP
        await ctx.db.patch(userId, {
            xp: newCurrentXp,
            level: newLevel,
            totalXp: newTotalXp,
        });

        // Mark reward as claimed
        await ctx.db.patch(userChallenge._id, {
            isClaimed: true,
        });

        return {
            xpGained: challenge.rewardXP,
            newLevel,
            newCurrentXp,
            newTotalXp,
            leveledUp,
        };
    },
});

/**
 * Seed initial daily challenges.
 * Run once to populate the challenge pool.
 */
export const seedDailyChallenges = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("daily_challenges").take(1);
        if (existing.length > 0) return { message: "Challenges already seeded" };

        const challenges = [
            {
                title: "Quiz Master",
                description: "Complete 1 quiz today",
                type: "quiz" as const,
                requiredCount: 1,
                rewardXP: 50,
                isActive: true,
            },
            {
                title: "Knowledge Seeker",
                description: "Complete 3 quizzes today",
                type: "quiz" as const,
                requiredCount: 3,
                rewardXP: 150,
                isActive: true,
            },
            {
                title: "Community Voice",
                description: "Post 1 reply in the forum",
                type: "forum" as const,
                requiredCount: 1,
                rewardXP: 30,
                isActive: true,
            },
            {
                title: "Active Learner",
                description: "Attend 1 lesson",
                type: "lesson" as const,
                requiredCount: 1,
                rewardXP: 75,
                isActive: true,
            },
        ];

        for (const c of challenges) {
            await ctx.db.insert("daily_challenges", c);
        }

        return { message: "Challenges seeded successfully" };
    },
});

/**
 * Award XP to a user (can be called from achievements or other systems)
 */
export const awardXP = internalMutation({
    args: {
        userId: v.id("users"),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return;

        const currentTotalXp = user.totalXp ?? 0;
        const newTotalXp = currentTotalXp + args.amount;
        const newLevel = calculateLevel(newTotalXp);
        const newCurrentXp = calculateCurrentXp(newTotalXp);

        await ctx.db.patch(args.userId, {
            xp: newCurrentXp,
            level: newLevel,
            totalXp: newTotalXp,
        });
    },
});
