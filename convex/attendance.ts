import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getStudentAttendance = query({
    args: { studentId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user) return [];

        // Authorization: Parent checking own child, or student checking self
        if (user.role === "parent") {
            const child = await ctx.db.get(args.studentId);
            if (!child || child.parentId !== userId) {
                // return empty or throw? Return empty for safety in query
                return [];
            }
        } else if (userId !== args.studentId && user.role !== "admin" && user.role !== "teacher") {
            return [];
        }

        const attendance = await ctx.db
            .query("attendance")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .order("desc")
            .collect();

        return attendance;
    },
});

// Helper for demo purposes: Generate random attendance data
export const seedAttendance = mutation({
    args: { studentId: v.id("users") },
    handler: async (ctx, args) => {
        // Clear existing
        const existing = await ctx.db
            .query("attendance")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .collect();

        for (const record of existing) {
            await ctx.db.delete(record._id);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Generate for last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            const rand = Math.random();
            let status: "present" | "absent" | "late" | "excused" = "present";

            if (rand > 0.9) status = "absent";
            else if (rand > 0.85) status = "late";
            else if (rand > 0.8) status = "excused";

            await ctx.db.insert("attendance", {
                studentId: args.studentId,
                date: date.getTime(),
                status: status,
                remarks: status !== "present" ? "Automated system entry" : undefined
            });
        }
    }
});

// Teacher: Mark attendance for a student
export const takeAttendance = mutation({
    args: {
        studentId: v.id("users"),
        date: v.number(),
        status: v.union(v.literal("present"), v.literal("absent"), v.literal("late"), v.literal("excused")),
        remarks: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "teacher" && user.role !== "admin")) {
            throw new Error("Only teachers can take attendance");
        }

        // Check if record already exists for this date
        const existing = await ctx.db
            .query("attendance")
            .withIndex("by_student_date", (q) => q.eq("studentId", args.studentId).eq("date", args.date))
            .first();

        if (existing) {
            // Update existing record
            await ctx.db.patch(existing._id, {
                status: args.status,
                remarks: args.remarks,
            });
            return existing._id;
        }

        // Create new record
        return await ctx.db.insert("attendance", {
            studentId: args.studentId,
            date: args.date,
            status: args.status,
            remarks: args.remarks,
        });
    },
});

// Teacher: Get all students (for attendance roster)
export const getAllStudents = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "teacher" && user.role !== "admin")) return [];

        const students = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("role"), "student"))
            .collect();

        return students;
    },
});

// Teacher: Get attendance for a specific date (all students)
export const getAttendanceByDate = query({
    args: { date: v.number() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user || (user.role !== "teacher" && user.role !== "admin")) return [];

        // Get all attendance records for the date
        const attendance = await ctx.db
            .query("attendance")
            .collect();

        // Filter by date (normalize to midnight)
        const targetDate = new Date(args.date);
        targetDate.setHours(0, 0, 0, 0);
        const targetTimestamp = targetDate.getTime();

        return attendance.filter(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate.getTime() === targetTimestamp;
        });
    },
});
