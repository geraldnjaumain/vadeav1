import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Core Competency Constants
export const CORE_COMPETENCIES = [
    { id: "communication_collaboration", name: "Communication & Collaboration", icon: "💬" },
    { id: "self_efficacy", name: "Self-Efficacy", icon: "🎯" },
    { id: "critical_thinking", name: "Critical Thinking & Problem Solving", icon: "🧠" },
    { id: "creativity_imagination", name: "Creativity & Imagination", icon: "🎨" },
    { id: "citizenship", name: "Citizenship", icon: "🌍" },
    { id: "digital_literacy", name: "Digital Literacy", icon: "💻" },
    { id: "learning_to_learn", name: "Learning to Learn", icon: "📚" }
] as const;

export const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", range: "80-100%", color: "green" },
    { id: "ME", name: "Meets Expectations", range: "65-79%", color: "blue" },
    { id: "AE", name: "Approaching Expectations", range: "50-64%", color: "orange" },
    { id: "BE", name: "Below Expectations", range: "0-49%", color: "red" }
] as const;

// Mutations
// Internal helper for badging
export const checkAndAwardBadges = internalMutation({
    args: {
        studentId: v.id("users"),
        competency: v.string(),
        level: v.string()
    },
    handler: async (ctx, args) => {
        // Find achievements for this competency
        const achievements = await ctx.db
            .query("achievements")
            .collect();

        const relevantAchievements = achievements.filter(a =>
            a.criteria?.type === "competency" &&
            a.criteria.target === args.competency &&
            (a.criteria.level ? a.criteria.level === args.level : true)
        );

        for (const achievement of relevantAchievements) {
            // Check if already awarded
            const alreadyAwarded = await ctx.db
                .query("user_achievements")
                .withIndex("by_user_achievement", q =>
                    q.eq("userId", args.studentId)
                        .eq("achievementId", achievement._id)
                )
                .first();

            if (!alreadyAwarded) {
                await ctx.db.insert("user_achievements", {
                    userId: args.studentId,
                    achievementId: achievement._id,
                    awardedAt: Date.now()
                });
            }
        }
    }
});

export const createCompetencyAssessment = mutation({
    args: {
        studentId: v.id("users"),
        competency: v.union(
            v.literal("communication_collaboration"),
            v.literal("self_efficacy"),
            v.literal("critical_thinking"),
            v.literal("creativity_imagination"),
            v.literal("citizenship"),
            v.literal("digital_literacy"),
            v.literal("learning_to_learn")
        ),
        level: v.union(v.literal("EE"), v.literal("ME"), v.literal("AE"), v.literal("BE")),
        evidence: v.array(v.string()),
        teacherId: v.id("users"),
        term: v.string(),
        grade: v.string(),
        comments: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const assessmentDate = Date.now();

        const id = await ctx.db.insert("core_competency_assessments", {
            studentId: args.studentId,
            competency: args.competency,
            level: args.level,
            evidence: args.evidence,
            teacherId: args.teacherId,
            assessmentDate,
            term: args.term,
            grade: args.grade,
            comments: args.comments
        });

        // Trigger badge check
        await ctx.scheduler.runAfter(0, internal.cbc.checkAndAwardBadges, {
            studentId: args.studentId,
            competency: args.competency,
            level: args.level
        });

        return id;
    }
});

export const updateCompetencyAssessment = mutation({
    args: {
        assessmentId: v.id("core_competency_assessments"),
        level: v.union(v.literal("EE"), v.literal("ME"), v.literal("AE"), v.literal("BE")),
        evidence: v.array(v.string()),
        comments: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const assessment = await ctx.db.get(args.assessmentId);
        if (!assessment) {
            throw new Error("Assessment not found");
        }

        await ctx.db.patch(args.assessmentId, {
            level: args.level,
            evidence: args.evidence,
            comments: args.comments
        });

        return assessment;
    }
});

export const createCBCRubric = mutation({
    args: {
        subject: v.string(),
        grade: v.string(),
        competency: v.string(),
        criteria: v.array(v.object({
            description: v.string(),
            EE: v.string(),
            ME: v.string(),
            AE: v.string(),
            BE: v.string()
        })),
        createdBy: v.id("users")
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("cbc_rubrics", {
            subject: args.subject,
            grade: args.grade,
            competency: args.competency,
            criteria: args.criteria,
            createdBy: args.createdBy,
            isActive: true,
            createdAt: Date.now()
        });
    }
});

export const addPortfolioItem = mutation({
    args: {
        studentId: v.id("users"),
        title: v.string(),
        description: v.string(),
        type: v.union(v.literal("project"), v.literal("assignment"), v.literal("assessment"), v.literal("reflection")),
        competency: v.optional(v.union(
            v.literal("communication_collaboration"),
            v.literal("self_efficacy"),
            v.literal("critical_thinking"),
            v.literal("creativity_imagination"),
            v.literal("citizenship"),
            v.literal("digital_literacy"),
            v.literal("learning_to_learn")
        )),
        attachments: v.optional(v.array(v.object({
            name: v.string(),
            url: v.string(),
            type: v.string(),
            storageId: v.optional(v.id("_storage"))
        }))),
        teacherId: v.id("users"),
        isPublic: v.boolean()
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("portfolio_items", {
            studentId: args.studentId,
            title: args.title,
            description: args.description,
            type: args.type,
            competency: args.competency,
            attachments: args.attachments,
            submittedAt: Date.now(),
            teacherId: args.teacherId,
            isPublic: args.isPublic,
            status: "pending"
        });
    }
});

export const updatePortfolioFeedback = mutation({
    args: {
        portfolioItemId: v.id("portfolio_items"),
        feedback: v.string()
    },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.portfolioItemId);
        if (!item) {
            throw new Error("Portfolio item not found");
        }

        await ctx.db.patch(args.portfolioItemId, {
            feedback: args.feedback
        });

        return item;
    }
});

export const approvePortfolioItem = mutation({
    args: {
        portfolioItemId: v.id("portfolio_items"),
        status: v.union(v.literal("approved"), v.literal("rejected")),
        feedback: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || !("role" in user) || (user.role !== "teacher" && user.role !== "admin")) {
            throw new Error("Only teachers or admins can approve portfolio items");
        }

        const updates: any = { status: args.status };
        if (args.feedback) updates.feedback = args.feedback;

        await ctx.db.patch(args.portfolioItemId, updates);
    }
});

// Queries
export const getStudentCompetencyAssessments = query({
    args: {
        studentId: v.id("users"),
        term: v.optional(v.string()),
        competency: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        let assessments = await ctx.db
            .query("core_competency_assessments")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .collect();

        if (args.term) {
            assessments = assessments.filter((a: any) => a.term === args.term);
        }

        if (args.competency) {
            assessments = assessments.filter((a: any) => a.competency === args.competency);
        }

        return assessments.sort((a: any, b: any) => b.assessmentDate - a.assessmentDate);
    }
});

export const getCompetencySummary = query({
    args: {
        studentId: v.id("users"),
        term: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const assessments = await ctx.db
            .query("core_competency_assessments")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .collect();

        let filteredAssessments = assessments;
        if (args.term) {
            filteredAssessments = assessments.filter((a: any) => a.term === args.term);
        }

        const summary = CORE_COMPETENCIES.map(competency => {
            const competencyAssessments = filteredAssessments.filter((a: any) => a.competency === competency.id);
            const latest = competencyAssessments[0]; // Most recent first due to sort

            return {
                competency: competency.id,
                name: competency.name,
                icon: competency.icon,
                latestAssessment: latest,
                assessmentCount: competencyAssessments.length,
                trend: competencyAssessments.length > 1 ?
                    getTrend(competencyAssessments[0].level, competencyAssessments[1].level) : null
            };
        });

        return summary;
    }
});

export const getCBCRubrics = query({
    args: {
        subject: v.optional(v.string()),
        grade: v.optional(v.string()),
        competency: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        let rubrics = await ctx.db
            .query("cbc_rubrics")
            .withIndex("by_active", (q) => q.eq("isActive", true))
            .collect();

        if (args.subject) {
            rubrics = rubrics.filter(r => r.subject === args.subject);
        }

        if (args.grade) {
            rubrics = rubrics.filter(r => r.grade === args.grade);
        }

        if (args.competency) {
            rubrics = rubrics.filter(r => r.competency === args.competency);
        }

        return rubrics;
    }
});

export const getStudentPortfolio = query({
    args: {
        studentId: v.id("users"),
        type: v.optional(v.string()),
        competency: v.optional(v.string()),
        isPublic: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        let portfolio = await ctx.db
            .query("portfolio_items")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .collect();

        if (args.type) {
            portfolio = portfolio.filter(p => p.type === args.type);
        }

        if (args.competency) {
            portfolio = portfolio.filter(p => p.competency === args.competency);
        }

        if (args.isPublic !== undefined) {
            portfolio = portfolio.filter(p => p.isPublic === args.isPublic);
        }

        return portfolio.sort((a, b) => b.submittedAt - a.submittedAt);
    }
});

export const getTeacherStudents = query({
    args: {
        teacherId: v.id("users")
    },
    handler: async (ctx, args) => {
        // Get all students this teacher has assessed
        const assessedStudents = await ctx.db
            .query("core_competency_assessments")
            .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
            .collect();

        const uniqueStudentIds = [...new Set(assessedStudents.map(a => a.studentId))];

        const students = await Promise.all(
            uniqueStudentIds.map(async (studentId) => {
                const student = await ctx.db.get(studentId);
                return student;
            })
        );

        return students.filter(Boolean);
    }
});

// Helper functions
function getTrend(currentLevel: string, previousLevel: string): "up" | "down" | "same" {
    const levelOrder = { "BE": 0, "AE": 1, "ME": 2, "EE": 3 };
    const current = levelOrder[currentLevel as keyof typeof levelOrder] || 0;
    const previous = levelOrder[previousLevel as keyof typeof levelOrder] || 0;

    if (current > previous) return "up";
    if (current < previous) return "down";
    return "same";
}