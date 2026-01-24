import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// --- Pathways ---

export const getPathways = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("pathways").collect();
    },
});

export const selectPathway = mutation({
    args: {
        pathwayCode: v.union(v.literal("STEM"), v.literal("social_sciences"), v.literal("arts_sports")),
        grade: v.string(), // e.g. "Grade 10" // In Kenya implementation, usually starts Grade 10 (Senior School)
        subjects: v.array(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "student") throw new Error("Only students can select pathways");

        // Check if already enrolled in a pathway for this grade
        const existingInfo = await ctx.db
            .query("pathway_enrollments")
            .withIndex("by_student", (q) => q.eq("studentId", userId))
            .filter((q) => q.eq(q.field("grade"), args.grade))
            .first();

        const timestamp = Date.now();

        if (existingInfo) {
            // Update existing choice
            await ctx.db.patch(existingInfo._id, {
                pathway: args.pathwayCode,
                subjects: args.subjects,
                enrolledAt: timestamp
            });
        } else {
            // Create new choice
            await ctx.db.insert("pathway_enrollments", {
                studentId: userId,
                pathway: args.pathwayCode,
                subjects: args.subjects,
                grade: args.grade,
                enrolledAt: timestamp,
                isActive: true
            });
        }

        // Also update the user profile for quick access
        await ctx.db.patch(userId, {
            pathway: args.pathwayCode,
            pathwaySubjects: args.subjects
        });

        return { success: true };
    }
});

export const getStudentPathway = query({
    args: { studentId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const userId = args.studentId || await getAuthUserId(ctx);
        if (!userId) return null;

        const enrollment = await ctx.db
            .query("pathway_enrollments")
            .withIndex("by_student", (q) => q.eq("studentId", userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        return enrollment;
    }
});

// --- KNEC Assessments ---

export const recordKnecAcore = mutation({
    args: {
        studentId: v.id("users"),
        assessmentType: v.union(v.literal("KEYA"), v.literal("KPSEA"), v.literal("KMYA"), v.literal("KILEA"), v.literal("KCBE")),
        year: v.number(),
        grade: v.string(),
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
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "teacher" && user.role !== "admin")) {
            throw new Error("Only teachers or admins can record KNEC scores");
        }

        // Check for existing record to avoid duplicates
        const existing = await ctx.db
            .query("knec_assessments")
            .withIndex("by_type_year", (q) => q.eq("assessmentType", args.assessmentType).eq("year", args.year))
            .filter((q) => q.eq(q.field("studentId"), args.studentId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                scores: {
                    totalScore: args.totalScore,
                    maxScore: args.maxScore,
                    subjects: args.subjects,
                    competencies: args.competencies
                },
                completedAt: Date.now()
            });
            return existing._id;
        }

        const id = await ctx.db.insert("knec_assessments", {
            studentId: args.studentId,
            assessmentType: args.assessmentType,
            year: args.year,
            grade: args.grade,
            scores: {
                totalScore: args.totalScore,
                maxScore: args.maxScore,
                subjects: args.subjects,
                competencies: args.competencies
            },
            completedAt: Date.now()
        });

        return id;
    }
});

export const getStudentKnecAssessments = query({
    args: { studentId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const userId = args.studentId || await getAuthUserId(ctx);
        if (!userId) return [];

        const assessments = await ctx.db
            .query("knec_assessments")
            .withIndex("by_student", (q) => q.eq("studentId", userId))
            .collect();

        return assessments.sort((a, b) => b.year - a.year);
    }
});

// --- CPI Projects ---

export const createCpiProject = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        competencies: v.array(v.string()),
        grade: v.string(),
        term: v.string(),
        startDate: v.number(),
        endDate: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "teacher") throw new Error("Only teachers can create CPI projects");

        const id = await ctx.db.insert("cpi_projects", {
            ...args,
            isActive: true,
            createdBy: userId
        });
        return id;
    }
});

export const getCpiProjects = query({
    args: {
        grade: v.optional(v.string()),
        isActive: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        // Refactored to avoid TS error: Type 'Query' is not assignable to type 'QueryInitializer'

        if (args.grade) {
            // Case 1: Filter by Grade (and optional Active)
            if (args.isActive !== undefined) {
                return await ctx.db
                    .query("cpi_projects")
                    .withIndex("by_grade", (q) => q.eq("grade", args.grade!))
                    .filter((q) => q.eq(q.field("isActive"), args.isActive))
                    .collect();
            }
            return await ctx.db
                .query("cpi_projects")
                .withIndex("by_grade", (q) => q.eq("grade", args.grade!))
                .collect();
        }

        // Case 2: No Grade, filter by Active (using Index)
        if (args.isActive !== undefined) {
            return await ctx.db
                .query("cpi_projects")
                .withIndex("by_active", (q) => q.eq("isActive", args.isActive!))
                .collect();
        }

        // Case 3: No filters
        return await ctx.db.query("cpi_projects").collect();
    }
});
