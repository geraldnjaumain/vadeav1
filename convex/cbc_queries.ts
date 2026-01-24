import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const CORE_COMPETENCIES = [
    { id: "communication_collaboration", name: "Communication & Collaboration", icon: "💬" },
    { id: "self_efficacy", name: "Self-Efficacy", icon: "🎯" },
    { id: "critical_thinking", name: "Critical Thinking & Problem Solving", icon: "🧠" },
    { id: "creativity_imagination", name: "Creativity & Imagination", icon: "🎨" },
    { id: "citizenship", name: "Citizenship", icon: "🌍" },
    { id: "digital_literacy", name: "Digital Literacy", icon: "💻" },
    { id: "learning_to_learn", name: "Learning to Learn", icon: "📚" }
] as const;

// Get comprehensive competency summary for a student
export const getStudentCompetencySummary = query({
    args: {
        studentId: v.id("users"),
        term: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        // Get all assessments for this student
        let assessments = await ctx.db
            .query("core_competency_assessments")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .collect();

        // Filter by term if specified
        if (args.term) {
            assessments = assessments.filter(a => a.term === args.term);
        }

        // Sort by date (most recent first)
        assessments.sort((a, b) => b.assessmentDate - a.assessmentDate);

        // Build summary for each competency
        const summary = CORE_COMPETENCIES.map(competency => {
            const competencyAssessments = assessments.filter(a => a.competency === competency.id);
            const latest = competencyAssessments[0];

            // Calculate trend
            let trend: "up" | "down" | "same" | null = null;
            if (competencyAssessments.length > 1) {
                trend = getTrend(competencyAssessments[0].level, competencyAssessments[1].level);
            }

            return {
                competency: competency.id,
                name: competency.name,
                icon: competency.icon,
                latestLevel: latest?.level || null,
                latestAssessment: latest || null,
                assessmentCount: competencyAssessments.length,
                trend,
                allAssessments: competencyAssessments.slice(0, 5) // Last 5 assessments
            };
        });

        return summary;
    }
});

// Get competency data for parent view (respects privacy)
export const getParentChildCompetencies = query({
    args: {
        childId: v.id("users"),
        term: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        // Verify this is the parent of this child
        const child = await ctx.db.get(args.childId);
        if (!child || child.parentId !== userId) {
            throw new Error("Unauthorized - not parent of this child");
        }

        // Reuse the student summary query logic
        let assessments = await ctx.db
            .query("core_competency_assessments")
            .withIndex("by_student", (q) => q.eq("studentId", args.childId))
            .collect();

        if (args.term) {
            assessments = assessments.filter(a => a.term === args.term);
        }

        assessments.sort((a, b) => b.assessmentDate - a.assessmentDate);

        // Get teacher names for each assessment
        const assessmentsWithTeachers = await Promise.all(
            assessments.map(async (assessment) => {
                const teacher = await ctx.db.get(assessment.teacherId);
                return {
                    ...assessment,
                    teacherName: teacher?.name || "Unknown Teacher"
                };
            })
        );

        const summary = CORE_COMPETENCIES.map(competency => {
            const competencyAssessments = assessmentsWithTeachers.filter(a => a.competency === competency.id);
            const latest = competencyAssessments[0];

            let trend: "up" | "down" | "same" | null = null;
            if (competencyAssessments.length > 1) {
                trend = getTrend(competencyAssessments[0].level, competencyAssessments[1].level);
            }

            return {
                competency: competency.id,
                name: competency.name,
                icon: competency.icon,
                latestLevel: latest?.level || null,
                latestAssessment: latest || null,
                assessmentCount: competencyAssessments.length,
                trend,
                recentAssessments: competencyAssessments.slice(0, 3)
            };
        });

        return {
            childName: child.name,
            grade: child.currentGrade || child.grade,
            currentTerm: child.currentTerm,
            competencies: summary
        };
    }
});

// Get class-wide competency overview for teachers
export const getClassCompetencyOverview = query({
    args: {
        grade: v.optional(v.string()),
        term: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (user?.role !== "teacher" && user?.role !== "admin") {
            throw new Error("Unauthorized - teachers only");
        }

        // Get all assessments by this teacher
        let assessments = await ctx.db
            .query("core_competency_assessments")
            .withIndex("by_teacher", (q) => q.eq("teacherId", userId))
            .collect();

        // Filter by term and grade
        if (args.term) {
            assessments = assessments.filter(a => a.term === args.term);
        }
        if (args.grade) {
            assessments = assessments.filter(a => a.grade === args.grade);
        }

        // Get unique students
        const studentIds = [...new Set(assessments.map(a => a.studentId))];
        const students = await Promise.all(
            studentIds.map(async (id) => {
                const student = await ctx.db.get(id);
                return student;
            })
        );

        // Calculate statistics by competency
        const competencyStats = CORE_COMPETENCIES.map(competency => {
            const competencyAssessments = assessments.filter(a => a.competency === competency.id);

            const levelCounts = {
                EE: competencyAssessments.filter(a => a.level === "EE").length,
                ME: competencyAssessments.filter(a => a.level === "ME").length,
                AE: competencyAssessments.filter(a => a.level === "AE").length,
                BE: competencyAssessments.filter(a => a.level === "BE").length
            };

            return {
                competency: competency.id,
                name: competency.name,
                totalAssessments: competencyAssessments.length,
                levelDistribution: levelCounts,
                averageLevel: calculateAverageLevel(competencyAssessments)
            };
        });

        return {
            totalStudents: students.filter(Boolean).length,
            totalAssessments: assessments.length,
            competencyStats
        };
    }
});

// Get full assessment history for a teacher with filtering
export const getTeacherAssessmentsHistory = query({
    args: {
        minDate: v.optional(v.number()),
        maxDate: v.optional(v.number()),
        competency: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (user?.role !== "teacher" && user?.role !== "admin") {
            return [];
        }

        let assessments = await ctx.db
            .query("core_competency_assessments")
            .withIndex("by_teacher", (q) => q.eq("teacherId", userId))
            .collect();

        // Apply filters
        if (args.competency) {
            assessments = assessments.filter(a => a.competency === args.competency);
        }
        if (args.minDate) {
            assessments = assessments.filter(a => a.assessmentDate >= args.minDate!);
        }
        if (args.maxDate) {
            assessments = assessments.filter(a => a.assessmentDate <= args.maxDate!);
        }

        // Sort descending
        const sorted = assessments.sort((a, b) => b.assessmentDate - a.assessmentDate);

        // Fetch student names efficiently
        const studentIds = [...new Set(sorted.map(a => a.studentId))];
        const students = await Promise.all(
            studentIds.map(async (id) => ctx.db.get(id))
        );
        const studentMap = new Map(students.filter(Boolean).map(s => [s!._id, s!]));

        return sorted.map(a => ({
            ...a,
            studentName: studentMap.get(a.studentId)?.name || "Unknown",
            studentImage: studentMap.get(a.studentId)?.image
        }));
    }
});

// Get recent assessments for a teacher
export const getTeacherRecentAssessments = query({
    args: {
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (user?.role !== "teacher" && user?.role !== "admin") {
            return [];
        }

        const assessments = await ctx.db
            .query("core_competency_assessments")
            .withIndex("by_teacher", (q) => q.eq("teacherId", userId))
            .collect();

        // Sort by date and limit
        const sorted = assessments.sort((a, b) => b.assessmentDate - a.assessmentDate);
        const limited = sorted.slice(0, args.limit || 10);

        // Populate student data
        const withStudents = await Promise.all(
            limited.map(async (assessment) => {
                const student = await ctx.db.get(assessment.studentId);
                return {
                    ...assessment,
                    studentName: student?.name || "Unknown Student",
                    studentImage: student?.image
                };
            })
        );

        return withStudents;
    }
});

// Helper function to calculate trend
function getTrend(currentLevel: string, previousLevel: string): "up" | "down" | "same" {
    const levelOrder = { "BE": 0, "AE": 1, "ME": 2, "EE": 3 };
    const current = levelOrder[currentLevel as keyof typeof levelOrder] || 0;
    const previous = levelOrder[previousLevel as keyof typeof levelOrder] || 0;

    if (current > previous) return "up";
    if (current < previous) return "down";
    return "same";
}

// Helper function to calculate average level
function calculateAverageLevel(assessments: any[]): string {
    if (assessments.length === 0) return "N/A";

    const levelOrder = { "BE": 0, "AE": 1, "ME": 2, "EE": 3 };
    const total = assessments.reduce((sum, a) => {
        return sum + (levelOrder[a.level as keyof typeof levelOrder] || 0);
    }, 0);

    const average = total / assessments.length;

    if (average >= 2.5) return "EE";
    if (average >= 1.5) return "ME";
    if (average >= 0.5) return "AE";
    return "BE";
}
