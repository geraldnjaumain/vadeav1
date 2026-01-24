import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Enter/Update KNEC Assessment Scores
export const saveKnecAssessment = mutation({
    args: {
        studentId: v.id("users"),
        assessmentType: v.union(v.literal("KEYA"), v.literal("KPSEA"), v.literal("KMYA"), v.literal("KILEA"), v.literal("KCBE")),
        year: v.number(),
        grade: v.string(),
        scores: v.object({
            totalScore: v.number(),
            maxScore: v.number(),
            subjects: v.array(v.object({
                name: v.string(),
                score: v.number(),
                maxScore: v.number()
            })),
            competencies: v.optional(v.array(v.object({
                name: v.string(),
                level: v.string()
            })))
        }),
        certificateUrl: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "teacher" && user.role !== "admin")) {
            throw new Error("Only teachers or admins can enter KNEC scores");
        }

        // Check if exists
        const existing = await ctx.db
            .query("knec_assessments")
            .withIndex("by_student", q => q.eq("studentId", args.studentId))
            .filter(q =>
                q.eq(q.field("assessmentType"), args.assessmentType) &&
                q.eq(q.field("year"), args.year)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                grade: args.grade,
                scores: args.scores,
                certificateUrl: args.certificateUrl,
                completedAt: Date.now()
            });
            return existing._id;
        } else {
            return await ctx.db.insert("knec_assessments", {
                studentId: args.studentId,
                assessmentType: args.assessmentType,
                year: args.year,
                grade: args.grade,
                scores: args.scores,
                certificateUrl: args.certificateUrl,
                completedAt: Date.now()
            });
        }
    }
});

// Admin: Get School-wide KNEC Analysis
export const getSchoolKnecAnalytics = query({
    args: {
        year: v.number(),
        assessmentType: v.optional(v.string()) // e.g. "KPSEA"
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (user?.role !== "admin") return null;

        let assessments = await ctx.db
            .query("knec_assessments")
            .filter(q => q.eq(q.field("year"), args.year))
            .collect();

        if (args.assessmentType) {
            assessments = assessments.filter(a => a.assessmentType === args.assessmentType);
        }

        // Basic stats
        const totalCandidates = assessments.length;
        if (totalCandidates === 0) return { totalCandidates: 0, averageScore: 0, subjectPerformance: [] };

        const totalScoreSum = assessments.reduce((sum, a) => sum + a.scores.totalScore, 0);
        const averageScore = totalScoreSum / totalCandidates;

        // Subject breakdown
        // Assume first assessment has all subjects (simplification for beta)
        const subjects = assessments[0]?.scores.subjects.map(s => s.name) || [];

        const subjectPerformance = subjects.map(subjectName => {
            const subjectScores = assessments.map(a => {
                return a.scores.subjects.find(s => s.name === subjectName)?.score || 0;
            });
            const avg = subjectScores.reduce((a, b) => a + b, 0) / totalCandidates;
            return { subject: subjectName, average: avg };
        });

        return {
            totalCandidates,
            averageScore,
            subjectPerformance
        };
    }
});

// Student/Parent: Get My KNEC Results
export const getMyKnecResults = query({
    args: {
        studentId: v.optional(v.id("users")) // Parent passes child ID
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);

        let targetId = userId;

        // If parent viewing child
        if (user?.role === "parent" && args.studentId) {
            const child = await ctx.db.get(args.studentId);
            if (child && child.parentId === userId) {
                targetId = args.studentId;
            }
        }

        return await ctx.db
            .query("knec_assessments")
            .withIndex("by_student", q => q.eq("studentId", targetId))
            .collect();
    }
});
