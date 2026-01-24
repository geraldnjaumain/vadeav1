import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getStudentAssignments = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // 1. Get all assignments (In prod, filter by student's grade/courses)
        // For MVP, we fetch all assignments.
        const allAssignments = await ctx.db
            .query("assignments")
            .order("desc")
            .collect();

        // 2. Get student's results/submissions
        const results = await ctx.db
            .query("results")
            .withIndex("by_student", (q) => q.eq("studentId", userId))
            .collect();

        const resultMap = new Map(results.map(r => [r.assignmentId, r]));

        // 3. Combine
        return allAssignments.map(assignment => {
            const result = resultMap.get(assignment._id);
            let status = "pending";
            if (result) {
                status = result.score !== undefined ? "graded" : "submitted";
            } else if (assignment.dueDate < Date.now()) {
                status = "overdue";
            }

            return {
                ...assignment,
                result,
                status // pending, overdue, submitted, graded
            };
        });
    },
});

// Helper to auto-grade
export const gradeAssignment = mutation({
    args: {
        assignmentId: v.id("assignments"),
        studentId: v.id("users"),
        score: v.number(),
        feedback: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "teacher") throw new Error("Only teachers can grade assignments");

        const assignment = await ctx.db.get(args.assignmentId);
        if (!assignment) throw new Error("Assignment not found");

        // Find existing result or create new
        const existingResult = await ctx.db
            .query("results")
            .withIndex("by_student", q => q.eq("studentId", args.studentId))
            .filter(q => q.eq(q.field("assignmentId"), args.assignmentId))
            .first();

        if (existingResult) {
            await ctx.db.patch(existingResult._id, {
                score: args.score,
                feedback: args.feedback,
                gradedAt: Date.now()
            });
        } else {
            await ctx.db.insert("results", {
                assignmentId: args.assignmentId,
                studentId: args.studentId,
                score: args.score,
                feedback: args.feedback,
                gradedAt: Date.now()
            });
        }

        // [CBC Integration] Auto-add to portfolio if score > 70% and linked to competency
        const percentage = (args.score / assignment.maxScore) * 100;
        if (percentage >= 70 && assignment.competency) {
            // Check existence
            const recentItems = await ctx.db
                .query("portfolio_items")
                .withIndex("by_student", q => q.eq("studentId", args.studentId))
                .order("desc")
                .take(5);

            const alreadyAdded = recentItems.some(item => item.title === `Assignment: ${assignment.title}`);

            if (!alreadyAdded) {
                await ctx.db.insert("portfolio_items", {
                    studentId: args.studentId,
                    title: `Assignment: ${assignment.title}`,
                    description: `Scored ${args.score}/${assignment.maxScore} (${Math.round(percentage)}%). ${args.feedback || ''}`,
                    type: "assignment",
                    competency: assignment.competency,
                    submittedAt: Date.now(),
                    teacherId: userId,
                    isPublic: true,
                    feedback: args.feedback
                });
            }
        }
    }
});
