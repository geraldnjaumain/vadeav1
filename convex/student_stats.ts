import { query } from "./_generated/server";
import { v } from "convex/values";

// Calculate study streak from consecutive days of activity
function calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0;

    // Sort dates in descending order (most recent first)
    const sortedDates = [...new Set(dates)].sort().reverse();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if streak is still active (today or yesterday)
    if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
        return 0; // Streak broken
    }

    let streak = 1;
    let currentDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];

        if (sortedDates[i] === prevDateStr) {
            streak++;
            currentDate = prevDate;
        } else {
            break; // Gap in dates, streak ends
        }
    }

    return streak;
}

export const getDashboardStats = query({
    args: { studentId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity && !args.studentId) return null;

        // Resolve student ID
        let studentId = args.studentId;
        if (!studentId && identity) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", identity.email!))
                .unique();
            studentId = user?._id;
        }

        if (!studentId) return null;

        // 1. Assignments
        const allAssignments = await ctx.db.query("assignments").collect();
        const results = await ctx.db
            .query("results")
            .withIndex("by_student", (q) => q.eq("studentId", studentId!))
            .collect();

        const completedIds = new Set(results.map(r => r.assignmentId));
        const pendingCount = allAssignments.filter(a => !completedIds.has(a._id)).length;

        // 2. Average Grade
        let averageGrade = 0;
        if (results.length > 0) {
            const totalScore = results.reduce((sum, r) => sum + r.score, 0);
            averageGrade = Math.round(totalScore / results.length);
        }

        // 3. Next Lesson
        const now = Date.now();
        const upcomingLessons = await ctx.db
            .query("lessons")
            .withIndex("by_schedule")
            .filter(q => q.gt(q.field("scheduledAt"), now))
            .take(1);
        const nextLesson = upcomingLessons[0] || null;

        // 4. Study Streak - calculated from daily challenges activity
        const userChallenges = await ctx.db
            .query("user_daily_challenges")
            .withIndex("by_user", (q) => q.eq("userId", studentId!))
            .collect();

        // Get unique dates where user had any activity (completed or progress > 0)
        const activeDates = userChallenges
            .filter(c => c.currentProgress > 0 || c.isCompleted)
            .map(c => c.date);

        // Also count quiz attempts as activity
        const quizAttempts = await ctx.db
            .query("quiz_attempts")
            .withIndex("by_student", (q) => q.eq("studentId", studentId!))
            .collect();

        quizAttempts.forEach(attempt => {
            const date = new Date(attempt.completedAt).toISOString().split('T')[0];
            activeDates.push(date);
        });

        // Also count attendance as activity  
        const attendance = await ctx.db
            .query("attendance")
            .withIndex("by_student", (q) => q.eq("studentId", studentId!))
            .collect();

        attendance.forEach(record => {
            if (record.status === "present" || record.status === "late") {
                const date = new Date(record.date).toISOString().split('T')[0];
                activeDates.push(date);
            }
        });

        // Also count lesson completions as activity [NEW]
        const lessonCompletions = await ctx.db
            .query("lesson_completions")
            .withIndex("by_student", (q) => q.eq("studentId", studentId!))
            .collect();

        lessonCompletions.forEach(completion => {
            const date = new Date(completion.completedAt).toISOString().split('T')[0];
            activeDates.push(date);
        });

        const studyStreak = calculateStreak(activeDates);

        // 5. Stats Counts
        const completedQuizzes = quizAttempts.length;
        const completedAssignments = results.length;
        const completedLessons = lessonCompletions.length; // Uses actual completions now

        return {
            pendingAssignments: pendingCount,
            averageGrade,
            nextLesson,
            studyStreak,
            completedLessons,
            completedQuizzes,
            completedAssignments,
        };
    },
});

// Get course progress for a specific student and course
export const getCourseProgress = query({
    args: {
        studentId: v.optional(v.id("users")),
        courseId: v.id("courses")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity && !args.studentId) return 0;

        let studentId = args.studentId;
        if (!studentId && identity) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", identity.email!))
                .unique();
            studentId = user?._id;
        }

        if (!studentId) return 0;

        // Get all lessons for this course
        const lessons = await ctx.db
            .query("lessons")
            .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
            .collect();

        if (lessons.length === 0) return 0;

        // Count completed lessons
        const completions = await ctx.db
            .query("lesson_completions")
            .withIndex("by_student_course", (q) =>
                q.eq("studentId", studentId).eq("courseId", args.courseId)
            )
            .collect();

        // Filter completions to ensure they match current lessons
        const validCompletionIds = new Set(lessons.map(l => l._id));
        const validCompletions = completions.filter(c => validCompletionIds.has(c.lessonId));

        // Calculate percentage
        const progress = Math.round((validCompletions.length / lessons.length) * 100);
        return progress;
    },
});
