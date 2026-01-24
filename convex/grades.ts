import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Fetch all results for a student, including assignment details
export const getStudentResults = query({
    args: { studentId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // Validate access
        const user = await ctx.db.get(userId);
        if (!user) return [];

        if (user.role === "parent") {
            const child = await ctx.db.get(args.studentId);
            if (!child || child.parentId !== userId) return [];
        } else if (userId !== args.studentId && user.role !== "admin" && user.role !== "teacher") {
            return [];
        }

        const results = await ctx.db
            .query("results")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .collect();

        // Join with assignments to get subject/title
        const detailedResults = await Promise.all(
            results.map(async (res) => {
                const assignment = await ctx.db.get(res.assignmentId);
                return {
                    ...res,
                    assignment: assignment,
                };
            })
        );

        return detailedResults.filter(r => r.assignment !== null);
    },
});

// Seed demo data for Gradebook
export const seedGrades = mutation({
    args: { studentId: v.id("users") },
    handler: async (ctx, args) => {
        // Create demo assignments if they don't exist
        const subjects = ["Mathematics", "English", "Science", "History"];

        // Clear existing results for this student
        const existingResults = await ctx.db
            .query("results")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .collect();
        for (const r of existingResults) await ctx.db.delete(r._id);

        for (const subject of subjects) {
            // Check if assignments exist for this subject, else create some
            let assignments = await ctx.db.query("assignments").withIndex("by_subject", q => q.eq("subject", subject)).take(3);

            if (assignments.length === 0) {
                const id1 = await ctx.db.insert("assignments", {
                    subject,
                    title: `${subject} Quiz 1`,
                    maxScore: 100,
                    dueDate: Date.now() - 86400000 * 10,
                });
                const id2 = await ctx.db.insert("assignments", {
                    subject,
                    title: `${subject} Mid-Term`,
                    maxScore: 100,
                    dueDate: Date.now() - 86400000 * 5,
                });
                // re-fetch to include in current batch
                assignments = [await ctx.db.get(id1), await ctx.db.get(id2)].filter(x => x !== null) as any;
            }

            // Assign grades
            for (const assignment of assignments) {
                const score = Math.floor(Math.random() * 30) + 70; // 70-100 random score
                await ctx.db.insert("results", {
                    studentId: args.studentId,
                    assignmentId: assignment._id,
                    score: score,
                    gradedAt: Date.now(),
                    feedback: score > 90 ? "Excellent work!" : "Good effort."
                });
            }
        }
    }
});

// Teacher: Get all assignments
export const getAllAssignments = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "teacher" && user.role !== "admin")) return [];

        return await ctx.db.query("assignments").collect();
    },
});

// Teacher: Get results for a specific assignment
export const getResultsByAssignment = query({
    args: { assignmentId: v.id("assignments") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "teacher" && user.role !== "admin")) return [];

        const results = await ctx.db
            .query("results")
            .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
            .collect();

        // Join with student data
        const detailedResults = await Promise.all(
            results.map(async (res) => {
                const student = await ctx.db.get(res.studentId);
                return { ...res, student };
            })
        );

        return detailedResults;
    },
});

// Teacher: Grade a student
export const gradeStudent = mutation({
    args: {
        assignmentId: v.id("assignments"),
        studentId: v.id("users"),
        score: v.number(),
        feedback: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "teacher" && user.role !== "admin")) {
            throw new Error("Only teachers can grade");
        }

        // Check if result already exists
        const existing = await ctx.db
            .query("results")
            .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
            .filter((q) => q.eq(q.field("studentId"), args.studentId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                score: args.score,
                feedback: args.feedback,
                gradedAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("results", {
            assignmentId: args.assignmentId,
            studentId: args.studentId,
            score: args.score,
            feedback: args.feedback,
            gradedAt: Date.now(),
        });
    },
});

// Teacher: Create a new assignment
export const createAssignment = mutation({
    args: {
        subject: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        maxScore: v.number(),
        dueDate: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "teacher" && user.role !== "admin")) {
            throw new Error("Only teachers can create assignments");
        }

        return await ctx.db.insert("assignments", args);
    },
});
