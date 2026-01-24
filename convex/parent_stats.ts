import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        // Fetch children
        const children = await ctx.db
            .query("users")
            .withIndex("by_parent", (q) => q.eq("parentId", userId))
            .collect();

        const childrenIds = children.map(c => c._id);
        const totalStudents = children.length;

        // 3. Fees Status
        const invoices = await ctx.db
            .query("invoices")
            .withIndex("by_parent", (q) => q.eq("parentId", userId))
            .filter(q => q.neq(q.field("status"), "paid"))
            .collect();

        let feesStatus = "Up to Date";
        if (invoices.some(i => i.status === "overdue")) {
            feesStatus = "Overdue";
        } else if (invoices.some(i => i.status === "pending")) {
            feesStatus = "Pending";
        }

        // 2. Assignments Due This Week
        // For efficiency, we really should have an index on assignments.dueDate, but we'll scan for now 
        // or filter a reasonable subset if possible. We "fetch all" assignments is risky if many.
        // Let's assume we can fetch them. Ideally we need an index "by_dueDate".
        // Let's grab all assignments for "active" subjects? 
        // Simplification: Count assignments due this week across the system (since curriculum is standard).
        const now = Date.now();
        const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000;

        const allAssignments = await ctx.db.query("assignments").collect();
        const upcomingAssignments = allAssignments.filter(a => a.dueDate >= now && a.dueDate <= oneWeekFromNow);
        // We assume all children are in same grade/curriculum for MVP or assignments are global by subject.
        // Refinement: If assignments were grade-specific, we'd filter.
        const assignmentsDueCount = upcomingAssignments.length;


        // 4. Weekly Activity (Last 7 days or This Current Week)
        // Get enrollments for all children
        const enrollments = await Promise.all(
            childrenIds.map(id => ctx.db.query("enrollments").withIndex("by_user", q => q.eq("userId", id)).collect())
        );
        const courseIds = new Set<string>();
        enrollments.flat().forEach(e => courseIds.add(e.courseId));

        // Fetch lessons for these courses in range
        // Helper to get start of week
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        const day = startOfWeek.getDay() || 7; // Get current day number, converting Sun. to 7
        if (day !== 1) startOfWeek.setHours(-24 * (day - 1)); // Set to Monday
        const startOfWeekMs = startOfWeek.getTime();
        const endOfWeekMs = startOfWeekMs + 7 * 24 * 60 * 60 * 1000;

        // We can use the 'by_schedule' index if we iterate range, but filtering in memory for enrolled courses is better if courses are few.
        // Actually, scanning all lessons might be much.
        // Let's query lessons by course? No, query lessons by schedule range and filter courseId is efficient if schedule index exists.
        const weeklyLessons = await ctx.db
            .query("lessons")
            .withIndex("by_schedule", q => q.gte("scheduledAt", startOfWeekMs).lt("scheduledAt", endOfWeekMs))
            .collect();

        const relevantLessons = weeklyLessons.filter(l => courseIds.has(l.courseId));

        // Aggregate hours by day
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const activityMap = new Map<string, number>();
        dayNames.forEach(d => activityMap.set(d, 0));

        relevantLessons.forEach(lesson => {
            const date = new Date(lesson.scheduledAt);
            const dayName = dayNames[date.getDay()];
            const hours = (lesson.durationMins || 60) / 60;
            activityMap.set(dayName, (activityMap.get(dayName) || 0) + hours);
        });

        // Format for Recharts (Monday to Sunday)
        const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weeklyActivity = orderedDays.map(name => ({
            name,
            hours: Math.round((activityMap.get(name) || 0) * 10) / 10
        }));


        // 5. Subject Performance
        // Fetch all results for these children
        const allResults = await Promise.all(
            childrenIds.map(id => ctx.db.query("results").withIndex("by_student", q => q.eq("studentId", id)).collect())
        );
        const flatResults = allResults.flat();

        // We need assignment details for subject and maxScore
        // Optimization: Deduplicate assignment fetch
        const assignmentIds = [...new Set(flatResults.map(r => r.assignmentId))];
        const resultAssignments = await Promise.all(
            assignmentIds.map(id => ctx.db.get(id))
        );
        const assignmentMap = new Map();
        resultAssignments.forEach(a => {
            if (a) assignmentMap.set(a._id, a);
        });

        const subjectScores = new Map<string, { totalPct: number, count: number }>();

        flatResults.forEach(r => {
            const assign = assignmentMap.get(r.assignmentId);
            if (!assign) return;

            const subject = assign.subject;
            const percentage = (r.score / assign.maxScore) * 100;

            const current = subjectScores.get(subject) || { totalPct: 0, count: 0 };
            subjectScores.set(subject, {
                totalPct: current.totalPct + percentage,
                count: current.count + 1
            });
        });

        const subjectPerformance = Array.from(subjectScores.entries()).map(([subject, stats]) => ({
            subject,
            A: Math.round(stats.totalPct / stats.count),
            fullMark: 100
        }));

        // Fallback for empty performance graph
        if (subjectPerformance.length === 0) {
            subjectPerformance.push(
                { subject: 'Math', A: 0, fullMark: 100 },
                { subject: 'English', A: 0, fullMark: 100 },
                { subject: 'Science', A: 0, fullMark: 100 },
            );
        }

        return {
            totalStudents,
            upcomingLessons: 0, // Keeping this 0 as placeholder or distinct from activity
            pendingAssignmentsCount: assignmentsDueCount, // New field name to match logic
            feesStatus,
            weeklyActivity,
            subjectPerformance
        };
    },
});
