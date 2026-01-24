import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "admin") {
            // Check for seeded admin if logged in via different method momentarily, but generally enforce role
            if (user?.role !== "admin") throw new Error("Permission denied");
        }

        // Parallelize queries for performance
        const [users, courses, transactions] = await Promise.all([
            ctx.db.query("users").collect(),
            ctx.db.query("courses").collect(),
            ctx.db.query("transactions").collect(),
        ]);

        const totalUsers = users.length;
        const students = users.filter(u => u.role === "student").length;
        const teachers = users.filter(u => u.role === "teacher").length;
        const parents = users.filter(u => u.role === "parent").length;

        const activeCourses = courses.filter(c => c.isPublished).length;

        const totalRevenue = transactions
            .filter(t => t.status === "success")
            .reduce((sum, t) => sum + t.amount, 0);

        // Calculate growth (mocked for MVP as we don't have historical snapshots easily without more complex queries)
        const recentUsers = users.length; // Placeholder

        return {
            totalUsers,
            students,
            teachers,
            parents,
            totalCourses: courses.length,
            activeCourses,
            totalRevenue,
            recentTransactions: transactions.slice(0, 5) // Last 5
        };
    },
});

export const getRecentActivity = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return []; // Fail silently or throw

        // Fetch recent logs or just use new users for now
        const users = await ctx.db.query("users").order("desc").take(5);
        return users.map(u => ({
            type: "user_joined",
            description: `New ${u.role} joined: ${u.name}`,
            date: u._creationTime
        }));
    },
});
