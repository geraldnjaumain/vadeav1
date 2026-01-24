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

const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", value: 4 },
    { id: "ME", name: "Meets Expectations", value: 3 },
    { id: "AE", name: "Approaching Expectations", value: 2 },
    { id: "BE", name: "Below Expectations", value: 1 }
] as const;

// Generate comprehensive CBC report for a student
export const generateStudentCBCReport = query({
    args: {
        studentId: v.id("users"),
        term: v.string()
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        // Get student details
        const student = await ctx.db.get(args.studentId);
        if (!student) return null;

        // Get all assessments for this student in this term
        const assessments = await ctx.db
            .query("core_competency_assessments")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .collect();

        const termAssessments = assessments.filter(a => a.term === args.term);

        // Build competency summary with latest assessment per competency
        const competencySummary = CORE_COMPETENCIES.map(competency => {
            const competencyAssessments = termAssessments
                .filter(a => a.competency === competency.id)
                .sort((a, b) => b.assessmentDate - a.assessmentDate);

            const latest = competencyAssessments[0];

            return {
                competency: competency.id,
                name: competency.name,
                icon: competency.icon,
                level: latest?.level || null,
                levelName: latest ? CBC_LEVELS.find(l => l.id === latest.level)?.name || "" : "Not Assessed",
                evidence: latest?.evidence || [],
                comments: latest?.comments || "",
                assessmentDate: latest?.assessmentDate || null,
                assessmentCount: competencyAssessments.length
            };
        });

        // Calculate overall statistics
        const assessed = competencySummary.filter(c => c.level !== null);
        const meetingOrExceeding = assessed.filter(c => c.level === "ME" || c.level === "EE");

        // Get portfolio items for this term
        const portfolio = await ctx.db
            .query("portfolio_items")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .collect();

        // Filter portfolio items by term (approximate match based on submission date)
        // This is a simplification - you might want to add a term field to portfolio_items
        const portfolioCount = portfolio.length;

        return {
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                grade: student.currentGrade || student.grade,
                image: student.image
            },
            term: args.term,
            generatedAt: Date.now(),
            competencies: competencySummary,
            statistics: {
                totalAssessed: assessed.length,
                totalCompetencies: 7,
                meetingStandards: meetingOrExceeding.length,
                portfolioItems: portfolioCount,
                assessmentCount: termAssessments.length
            }
        };
    }
});

// Generate class-wide CBC report
export const generateClassReport = query({
    args: {
        grade: v.optional(v.string()),
        term: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (user?.role !== "teacher" && user?.role !== "admin") {
            return null;
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
            studentIds.map(async (id) => await ctx.db.get(id))
        );
        const validStudents = students.filter(Boolean);

        // Calculate competency-wise statistics
        const competencyStats = CORE_COMPETENCIES.map(competency => {
            const competencyAssessments = assessments.filter(a => a.competency === competency.id);

            // Count by level
            const levelCounts = {
                EE: competencyAssessments.filter(a => a.level === "EE").length,
                ME: competencyAssessments.filter(a => a.level === "ME").length,
                AE: competencyAssessments.filter(a => a.level === "AE").length,
                BE: competencyAssessments.filter(a => a.level === "BE").length
            };

            // Calculate average performance
            const totalValue = competencyAssessments.reduce((sum, a) => {
                const level = CBC_LEVELS.find(l => l.id === a.level);
                return sum + (level?.value || 0);
            }, 0);
            const averageValue = competencyAssessments.length > 0
                ? totalValue / competencyAssessments.length
                : 0;

            return {
                competency: competency.id,
                name: competency.name,
                totalAssessments: competencyAssessments.length,
                levelDistribution: levelCounts,
                averagePerformance: averageValue,
                percentageMeetingStandards: competencyAssessments.length > 0
                    ? ((levelCounts.ME + levelCounts.EE) / competencyAssessments.length) * 100
                    : 0
            };
        });

        return {
            grade: args.grade || "All Grades",
            term: args.term || "All Terms",
            generatedAt: Date.now(),
            totalStudents: validStudents.length,
            totalAssessments: assessments.length,
            competencyStats,
            students: validStudents.map(s => ({
                id: s!._id,
                name: s!.name,
                grade: s!.currentGrade || s!.grade
            }))
        };
    }
});

// Get term comparison data for a student
export const getTermComparison = query({
    args: {
        studentId: v.id("users"),
        terms: v.array(v.string()) // e.g., ["Term 1 2025", "Term 2 2025"]
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const termData = await Promise.all(
            args.terms.map(async (term) => {
                const assessments = await ctx.db
                    .query("core_competency_assessments")
                    .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
                    .collect();

                const termAssessments = assessments.filter(a => a.term === term);

                const competencyLevels = CORE_COMPETENCIES.map(comp => {
                    const compAssessments = termAssessments
                        .filter(a => a.competency === comp.id)
                        .sort((a, b) => b.assessmentDate - a.assessmentDate);

                    const latest = compAssessments[0];
                    const levelValue = latest ? CBC_LEVELS.find(l => l.id === latest.level)?.value || 0 : 0;

                    return {
                        competency: comp.id,
                        name: comp.name,
                        level: latest?.level || null,
                        value: levelValue
                    };
                });

                return {
                    term,
                    competencies: competencyLevels,
                    totalAssessments: termAssessments.length
                };
            })
        );

        return termData;
    }
});

// Get competency trend analysis
export const getCompetencyTrends = query({
    args: {
        studentId: v.id("users")
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const assessments = await ctx.db
            .query("core_competency_assessments")
            .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
            .collect();

        // Sort by date
        assessments.sort((a, b) => a.assessmentDate - b.assessmentDate);

        // Group by competency and track progression
        const trends = CORE_COMPETENCIES.map(competency => {
            const competencyAssessments = assessments.filter(a => a.competency === competency.id);

            const progression = competencyAssessments.map(a => ({
                date: a.assessmentDate,
                term: a.term,
                level: a.level,
                value: CBC_LEVELS.find(l => l.id === a.level)?.value || 0
            }));

            // Calculate trend direction
            let trendDirection: "improving" | "declining" | "stable" | "no_data" = "no_data";
            if (progression.length >= 2) {
                const recent = progression.slice(-3); // Last 3 assessments
                const values = recent.map(p => p.value);
                const avgRecent = values.reduce((sum, v) => sum + v, 0) / values.length;
                const first = recent[0].value;

                if (avgRecent > first + 0.3) trendDirection = "improving";
                else if (avgRecent < first - 0.3) trendDirection = "declining";
                else trendDirection = "stable";
            } else if (progression.length === 1) {
                trendDirection = "stable";
            }

            return {
                competency: competency.id,
                name: competency.name,
                progression,
                trendDirection,
                totalAssessments: competencyAssessments.length
            };
        });

        return trends;
    }
});
