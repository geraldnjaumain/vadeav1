import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getStudentCourses = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const enrollments = await ctx.db
            .query("enrollments")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (enrollments.length === 0) return [];

        const coursesWithProgress = await Promise.all(
            enrollments.map(async (enrollment) => {
                const course = await ctx.db.get(enrollment.courseId);
                if (!course) return null;

                // Calculate progress
                const lessons = await ctx.db
                    .query("lessons")
                    .withIndex("by_course", (q) => q.eq("courseId", course._id))
                    .collect();

                const totalLessons = lessons.length;
                let progress = 0;

                if (totalLessons > 0) {
                    const completions = await ctx.db
                        .query("lesson_completions")
                        .withIndex("by_student_course", (q) =>
                            q.eq("studentId", userId).eq("courseId", course._id)
                        )
                        .collect();

                    // Filter completions to ensure they match current lessons (in case lessons deleted)
                    const validCompletionIds = new Set(lessons.map(l => l._id));
                    const validCompletions = completions.filter(c => validCompletionIds.has(c.lessonId));

                    progress = Math.round((validCompletions.length / totalLessons) * 100);
                }

                return {
                    ...course,
                    progress,
                    enrollmentStatus: enrollment.status
                };
            })
        );

        return coursesWithProgress.filter((c): c is NonNullable<typeof c> => c !== null);
    },
});

export const getCourse = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.courseId);
    },
});

// Helper to get featured or recommended courses
export const getRecommendedCourses = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("courses")
            .withIndex("by_published", (q) => q.eq("isPublished", true))
            .take(5);
    },
});

export const updateCourse = mutation({
    args: {
        id: v.id("courses"),
        isPublished: v.boolean(),
        // Add other args as optional if needed for full edit
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const course = await ctx.db.get(args.id);
        if (!course) throw new Error("Course not found");

        if (course.teacherId !== userId) {
            // Check admin
            const user = await ctx.db.get(userId);
            if (user?.role !== "admin") throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, { isPublished: args.isPublished });
    },
});

export const createCourse = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        price: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const courseId = await ctx.db.insert("courses", {
            ...args,
            teacherId: userId,
            isPublished: false
        });
        return courseId;
    }
});
