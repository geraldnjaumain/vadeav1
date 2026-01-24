import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============== PUBLIC QUERIES ==============

// List all active cohorts (for parent selection during registration)
export const listActiveCohorts = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("cohorts")
            .withIndex("by_active", (q) => q.eq("isActive", true))
            .collect();
    },
});

// Get cohorts filtered by grade
export const getCohortsByGrade = query({
    args: { grade: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("cohorts")
            .withIndex("by_grade", (q) => q.eq("grade", args.grade))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();
    },
});

// Get a single cohort by ID
export const getCohort = query({
    args: { id: v.id("cohorts") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Get student's current cohort enrollment
export const getStudentCohort = query({
    args: { studentId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const userId = args.studentId || await getAuthUserId(ctx);
        if (!userId) return null;

        const enrollment = await ctx.db
            .query("cohort_enrollments")
            .withIndex("by_student", (q) => q.eq("studentId", userId))
            .first();

        if (!enrollment) return null;

        const cohort = await ctx.db.get(enrollment.cohortId);
        return {
            enrollment,
            cohort,
        };
    },
});

// Get parent's children enrollments
export const getParentEnrollments = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const enrollments = await ctx.db
            .query("cohort_enrollments")
            .withIndex("by_parent", (q) => q.eq("parentId", userId))
            .collect();

        // Enrich with cohort and student data
        const enriched = await Promise.all(
            enrollments.map(async (enrollment) => {
                const cohort = await ctx.db.get(enrollment.cohortId);
                const student = await ctx.db.get(enrollment.studentId);
                return {
                    ...enrollment,
                    cohort,
                    student,
                };
            })
        );

        return enriched;
    },
});

// ============== ADMIN MUTATIONS ==============

// Create a new cohort (admin only)
export const createCohort = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        grade: v.string(),
        price: v.number(),
        trialDays: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        return await ctx.db.insert("cohorts", {
            ...args,
            isActive: true,
            createdAt: Date.now(),
        });
    },
});

// Update a cohort (admin only)
export const updateCohort = mutation({
    args: {
        id: v.id("cohorts"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        grade: v.optional(v.string()),
        price: v.optional(v.number()),
        trialDays: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete a cohort (admin only)
export const deleteCohort = mutation({
    args: { id: v.id("cohorts") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        // Check if any students are enrolled
        const enrollments = await ctx.db
            .query("cohort_enrollments")
            .withIndex("by_cohort", (q) => q.eq("cohortId", args.id))
            .first();

        if (enrollments) {
            throw new Error("Cannot delete cohort with active enrollments");
        }

        await ctx.db.delete(args.id);
    },
});

// List all cohorts for admin (including inactive)
export const listAllCohorts = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        return await ctx.db.query("cohorts").collect();
    },
});

// ============== ENROLLMENT MUTATIONS ==============

// Enroll a student in a cohort (parent action)
export const enrollStudentInCohort = mutation({
    args: {
        studentId: v.id("users"),
        cohortId: v.id("cohorts"),
        startTrial: v.boolean(),
        transactionId: v.optional(v.id("transactions")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const parent = await ctx.db.get(userId);
        if (!parent || parent.role !== "parent") throw new Error("Only parents can enroll students");

        // Verify student belongs to this parent
        const student = await ctx.db.get(args.studentId);
        if (!student || student.parentId !== userId) {
            throw new Error("Student does not belong to this parent");
        }

        // Get cohort for trial days
        const cohort = await ctx.db.get(args.cohortId);
        if (!cohort || !cohort.isActive) {
            throw new Error("Cohort not available");
        }

        // Check if already enrolled
        const existing = await ctx.db
            .query("cohort_enrollments")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .first();

        if (existing) {
            throw new Error("Student is already enrolled in a cohort");
        }

        const now = Date.now();
        const trialEndsAt = args.startTrial && cohort.trialDays > 0
            ? now + (cohort.trialDays * 24 * 60 * 60 * 1000)
            : undefined;

        return await ctx.db.insert("cohort_enrollments", {
            studentId: args.studentId,
            cohortId: args.cohortId,
            parentId: userId,
            status: args.startTrial ? "trial" : "active",
            trialEndsAt,
            enrolledAt: now,
            paidAt: args.startTrial ? undefined : now,
            transactionId: args.transactionId,
        });
    },
});

// Upgrade trial to paid (after payment)
export const upgradeTrialToPaid = mutation({
    args: {
        enrollmentId: v.id("cohort_enrollments"),
        transactionId: v.id("transactions"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const enrollment = await ctx.db.get(args.enrollmentId);
        if (!enrollment) throw new Error("Enrollment not found");

        // Verify parent owns this enrollment
        if (enrollment.parentId !== userId) {
            throw new Error("Not authorized to modify this enrollment");
        }

        await ctx.db.patch(args.enrollmentId, {
            status: "active",
            paidAt: Date.now(),
            transactionId: args.transactionId,
            trialEndsAt: undefined,
        });
    },
});

// Get cohort enrollment stats (admin)
export const getCohortStats = query({
    args: { cohortId: v.id("cohorts") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") throw new Error("Permission denied");

        const enrollments = await ctx.db
            .query("cohort_enrollments")
            .withIndex("by_cohort", (q) => q.eq("cohortId", args.cohortId))
            .collect();

        const trial = enrollments.filter(e => e.status === "trial").length;
        const active = enrollments.filter(e => e.status === "active").length;
        const expired = enrollments.filter(e => e.status === "expired").length;

        return {
            total: enrollments.length,
            trial,
            active,
            expired,
        };
    },
});
