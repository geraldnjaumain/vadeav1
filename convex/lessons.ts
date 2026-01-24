import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const listByTeacher = query({
    args: { teacherId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("lessons")
            .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
            .order("desc") // Most recent first
            .collect();
    },
});

export const listByCourse = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("lessons")
            .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
            .order("asc")
            .collect();
    },
});

export const listUpcoming = query({
    args: {},
    handler: async (ctx) => {
        // In a real app, strict filtering by user enrollments would happen here.
        // For now, we return all upcoming scheduled lessons.
        const now = Date.now();
        return await ctx.db
            .query("lessons")
            .withIndex("by_schedule", (q) => q.gte("scheduledAt", now))
            .take(10);
    },
});

// Get all lessons for the authenticated teacher
export const getMyLessons = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("lessons")
            .withIndex("by_teacher", (q) => q.eq("teacherId", userId))
            .order("desc")
            .collect();
    },
});

export const getStudentLessonsQuery = query({
    // Fetch lessons for a specific student based on their enrollments
    args: { studentId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // 1. Get Student Enrollments
        const enrollments = await ctx.db
            .query("enrollments")
            .withIndex("by_user", (q) => q.eq("userId", args.studentId))
            .collect();

        if (enrollments.length === 0) return [];

        const lessons: any[] = [];

        // 2. Get lessons for each course
        // Optimization: In robust app, use separate query or index, but loop is fine for MVP volume
        for (const enrollment of enrollments) {
            const courseLessons = await ctx.db
                .query("lessons")
                .withIndex("by_course", (q) => q.eq("courseId", enrollment.courseId))
                .collect();
            lessons.push(...courseLessons);
        }

        // 3. Populate Teacher Names
        const result = await Promise.all(lessons.map(async (l) => {
            const teacher = await ctx.db.get(l.teacherId);
            const teacherName = teacher && "name" in teacher ? (teacher as any).name : "Instructor";
            return {
                ...l,
                teacherName
            };
        }));

        // 4. Sort by Scheduled Date (Desc)
        return result.sort((a, b) => b.scheduledAt - a.scheduledAt);
    },
});

// Alias for backward compatibility/sync issues
export const getStudentLessons = getStudentLessonsQuery;

export const getLessons = query({
    args: {},
    handler: async (ctx) => {
        // For MVP/Demo: Return all scheduled lessons.
        // In production: Filter by parent's children's courses.
        const now = Date.now();

        // Return 20 most recent/upcoming lessons
        return await ctx.db
            .query("lessons")
            .order("desc")
            .take(20);
    },
});

export const scheduleLesson = mutation({
    args: {
        courseId: v.id("courses"),
        title: v.string(),
        description: v.optional(v.string()),
        scheduledAt: v.number(),
        durationMins: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Verify teacher owns the course or is admin
        const user = await ctx.db.get(userId);
        const course = await ctx.db.get(args.courseId);

        if (!course) throw new Error("Course not found");
        if (!user || (course.teacherId !== userId && user.role !== "admin")) {
            throw new Error("Unauthorized");
        }

        // Generate specific room URL (mock logic for now)
        const meetingUrl = `https://meet.jit.si/vadea-${Math.random().toString(36).substring(7)}`;

        const lessonId = await ctx.db.insert("lessons", {
            courseId: args.courseId,
            teacherId: userId,
            title: args.title,
            description: args.description,
            scheduledAt: args.scheduledAt,
            durationMins: args.durationMins,
            status: "scheduled",
            meetingUrl,
        });

        return lessonId;
    },
});

export const updateLessonContent = mutation({
    args: {
        lessonId: v.id("lessons"),
        recordingUrl: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const lesson = await ctx.db.get(args.lessonId);
        if (!lesson) throw new Error("Lesson not found");

        const user = await ctx.db.get(userId);
        if (!user || (lesson.teacherId !== userId && user.role !== "admin")) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.lessonId, {
            recordingUrl: args.recordingUrl,
            notes: args.notes,
        });
    },
});

// Student marks attendance for a lesson (triggers daily challenge)
export const markLessonAttended = mutation({
    args: { lessonId: v.id("lessons") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "student") throw new Error("Only students can mark attendance");

        const lesson = await ctx.db.get(args.lessonId);
        if (!lesson) throw new Error("Lesson not found");

        // Record attendance
        const existingAttendance = await ctx.db
            .query("attendance")
            .withIndex("by_student_date", (q) =>
                q.eq("studentId", userId).eq("date", lesson.scheduledAt)
            )
            .first();

        if (!existingAttendance) {
            await ctx.db.insert("attendance", {
                studentId: userId,
                date: lesson.scheduledAt,
                status: "present",
                remarks: `Attended: ${lesson.title}`,
            });
        }

        // Update daily challenge progress for lesson attendance
        await ctx.scheduler.runAfter(0, internal.challenges.updateChallengeProgress, {
            userId,
            challengeType: "lesson",
        });

    },
});

export const toggleLessonCompletion = mutation({
    args: { lessonId: v.id("lessons"), completed: v.boolean() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const lesson = await ctx.db.get(args.lessonId);
        if (!lesson) throw new Error("Lesson not found");

        const existing = await ctx.db
            .query("lesson_completions")
            .withIndex("by_student_course", (q) =>
                q.eq("studentId", userId).eq("courseId", lesson.courseId)
            )
            .filter(q => q.eq(q.field("lessonId"), args.lessonId))
            .first();

        if (args.completed) {
            if (!existing) {
                await ctx.db.insert("lesson_completions", {
                    studentId: userId,
                    lessonId: args.lessonId,
                    courseId: lesson.courseId,
                    completedAt: Date.now(),
                });

                // Also trigger challenge progress
                await ctx.scheduler.runAfter(0, internal.challenges.updateChallengeProgress, {
                    userId,
                    challengeType: "lesson",
                });
            }
        } else {
            if (existing) {
                await ctx.db.delete(existing._id);
            }
        }
    },
});
