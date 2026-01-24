import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate a random alphanumeric password
import { hash } from "bcryptjs";

function generatePassword(length: number = 8): string {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Create a child account linked to the current parent
export const createChildAccount = mutation({
    args: {
        name: v.string(),
        grade: v.string(),
        // Username is now auto-generated
        // Questionnaire
        learningStyle: v.optional(v.string()),
        interests: v.optional(v.array(v.string())),
        specialNeeds: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "parent") throw new Error("Only parents can create child accounts");

        // 1. Get or Initialize Admission Counter (5 Digits)
        const currentYear = new Date().getFullYear();
        let counterConfig = await ctx.db
            .query("counters")
            .withIndex("by_name", (q) => q.eq("name", "admission_number"))
            .first();

        // Initialize if not exists (Start at 10000 to ensure 5 digits)
        let countVal = 10000;
        if (counterConfig) {
            countVal = counterConfig.count + 1;
            await ctx.db.patch(counterConfig._id, { count: countVal, year: currentYear });
        } else {
            await ctx.db.insert("counters", {
                name: "admission_number",
                count: countVal,
                year: currentYear
            });
        }

        // 2. Format Admission Number: "10058/2026"
        const admissionNumber = `${countVal}/${currentYear}`;

        // 3. Generate Email/Username: "10058.2026@student.vadea.app"
        // Format: [5_digit_admission].[Year]@student.vadea.app
        const username = `${countVal}.${currentYear}`;
        const email = `${username}@student.vadea.app`;

        // 4. Auto-generate password
        const generatedPassword = generatePassword(8);
        const hashedPassword = await hash(generatedPassword, 10);

        // 5. Create student account
        const childId = await ctx.db.insert("users", {
            name: args.name,
            username: username, // Used for login
            admissionNumber: admissionNumber, // Display ID
            password: hashedPassword, // Storing HASHED password
            email: email,
            role: "student",
            grade: args.grade,
            parentId: userId,
            image: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username}`,
            isFirstLogin: true,
            // Questionnaire Data
            learningStyle: args.learningStyle as "visual" | "auditory" | "kinesthetic" | undefined,
            interests: args.interests,
            specialNeeds: args.specialNeeds,
            trialEndsAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 Days Trial from creation
        });

        // 6. Return credentials for display
        return { childId, username: email, generatedPassword, admissionNumber };
    },
});

export const updateChild = mutation({
    args: {
        childId: v.id("users"),
        name: v.optional(v.string()),
        grade: v.optional(v.string()),
        username: v.optional(v.string()),
        password: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const child = await ctx.db.get(args.childId);
        if (!child) throw new Error("Child not found");

        if (child.parentId !== userId) {
            throw new Error("Unauthorized to edit this child");
        }

        const updates: any = {};
        if (args.name !== undefined) updates.name = args.name;
        if (args.grade !== undefined) updates.grade = args.grade;
        if (args.username !== undefined) updates.username = args.username;
        if (args.password !== undefined) updates.password = args.password;

        await ctx.db.patch(args.childId, updates);
    },
});

export const getChildren = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // Find users where parentId matches
        const children = await ctx.db
            .query("users")
            .withIndex("by_parent", (q) => q.eq("parentId", userId))
            .collect();

        return children;
    },
});

export const getChildrenWithStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const children = await ctx.db
            .query("users")
            .withIndex("by_parent", (q) => q.eq("parentId", userId))
            .collect();

        const childrenWithStats = await Promise.all(
            children.map(async (child) => {
                // Attendance Logic
                const attendance = await ctx.db
                    .query("attendance")
                    .withIndex("by_student", (q) => q.eq("studentId", child._id))
                    .collect();

                const totalDays = attendance.length;
                const presentDays = attendance.filter(a => a.status === "present").length;
                const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0; // Default to 0 if no data

                // Grades Logic
                const results = await ctx.db
                    .query("results")
                    .withIndex("by_student", (q) => q.eq("studentId", child._id))
                    .collect();

                let totalScore = 0;
                let totalMax = 0;

                // We need maxScore from assignments. 
                // Optimization: In a real app we'd map/cache assignments to avoid N+1, but for <5 children it's fine.
                for (const r of results) {
                    const assignment = await ctx.db.get(r.assignmentId);
                    if (assignment) {
                        totalScore += r.score;
                        totalMax += assignment.maxScore;
                    }
                }

                const avgPercentage = totalMax > 0 ? (totalScore / totalMax) * 100 : null;

                // Convert percentage to Letter Grade
                let gradeStr = "N/A";
                if (avgPercentage !== null) {
                    if (avgPercentage >= 90) gradeStr = "A";
                    else if (avgPercentage >= 80) gradeStr = "B";
                    else if (avgPercentage >= 70) gradeStr = "C";
                    else if (avgPercentage >= 60) gradeStr = "D";
                    else gradeStr = "F";
                }

                return {
                    ...child,
                    attendanceRate,
                    avgGrade: gradeStr
                };
            })
        );

        return childrenWithStats;
    },
});

export const getChildTeachers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // 1. Get Children
        const children = await ctx.db
            .query("users")
            .withIndex("by_parent", (q) => q.eq("parentId", userId))
            .collect();

        if (children.length === 0) return [];

        const teachersMap = new Map<string, any>();

        // 2. For each child, get enrollments -> courses -> teachers
        for (const child of children) {
            const enrollments = await ctx.db
                .query("enrollments")
                .withIndex("by_user", (q) => q.eq("userId", child._id))
                .collect();

            for (const enrollment of enrollments) {
                const course = await ctx.db.get(enrollment.courseId);
                if (!course) continue;

                const teacher = await ctx.db.get(course.teacherId);
                if (!teacher) continue;

                const teacherId = teacher._id;

                if (!teachersMap.has(teacherId)) {
                    teachersMap.set(teacherId, {
                        ...teacher,
                        courses: [],
                        childrenNames: new Set()
                    });
                }

                const teacherEntry = teachersMap.get(teacherId);
                teacherEntry.courses.push({
                    title: course.title,
                    childName: child.name
                });
                teacherEntry.childrenNames.add(child.name);
            }
        }

        // Convert Map to Array and format
        return Array.from(teachersMap.values()).map(t => ({
            _id: t._id,
            name: t.name,
            email: t.email,
            image: t.image,
            // Convert Set to Array for JSON serialization
            childrenNames: Array.from(t.childrenNames),
            // Deduplicate courses if needed, or keep as log of interactions
            courses: t.courses
        }));
    },
});
// Get stats for a specific child
export const getChildStats = query({
    args: { childId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const child = await ctx.db.get(args.childId);
        if (!child || child.parentId !== userId) return null;

        // 1. Attendance
        const attendance = await ctx.db
            .query("attendance")
            .withIndex("by_student", (q) => q.eq("studentId", child._id))
            .collect();

        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === "present").length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        // 2. Grades
        const results = await ctx.db
            .query("results")
            .withIndex("by_student", (q) => q.eq("studentId", child._id))
            .collect();

        let totalScore = 0;
        let totalMax = 0;
        for (const r of results) {
            const assignment = await ctx.db.get(r.assignmentId);
            if (assignment) {
                totalScore += r.score;
                totalMax += assignment.maxScore;
            }
        }
        const avgPercentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0; // 0 if no grades

        // 3. Upcoming Assignments (Pending)
        const allAssignments = await ctx.db.query("assignments").collect(); // In real app, filter by course enrollment
        // Simplified for MVP: Check unsubmitted assignments locally or via simple query if logic existed.
        // For now, let's return a placeholder or 0 until fully wired.
        const pendingAssignmentsCount = 3; // Placeholder for now

        // 4. Next Class (Placeholder until schedule is fully implemented)
        const nextClass = {
            title: "Mathematics",
            time: "10:00 AM",
            topic: "Introduction to Algebra"
        };

        return {
            attendanceRate,
            avgPercentage,
            pendingAssignmentsCount,
            nextClass
        };
    },
});