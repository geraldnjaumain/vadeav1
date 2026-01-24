import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTeacherCourses = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const courses = await ctx.db
            .query("courses")
            .withIndex("by_teacher", (q) => q.eq("teacherId", userId))
            .collect();

        return courses;
    },
});

export const getPublishedCourses = query({
    args: {},
    handler: async (ctx) => {
        const courses = await ctx.db
            .query("courses")
            .withIndex("by_published", (q) => q.eq("isPublished", true))
            .collect();
        return courses;
    },
});
