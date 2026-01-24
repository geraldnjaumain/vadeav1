import { query } from "./_generated/server";
import { v } from "convex/values";
// Force re-sync
import { getAuthUserId } from "@convex-dev/auth/server";

const CORE_COMPETENCIES = [
    { id: "communication_collaboration", name: "Communication & Collaboration" },
    { id: "self_efficacy", name: "Self-Efficacy" },
    { id: "critical_thinking", name: "Critical Thinking & Problem Solving" },
    { id: "creativity_imagination", name: "Creativity & Imagination" },
    { id: "citizenship", name: "Citizenship" },
    { id: "digital_literacy", name: "Digital Literacy" },
    { id: "learning_to_learn", name: "Learning to Learn" }
] as const;

const CBC_LEVELS = [
    { id: "EE", name: "Exceeds Expectations", value: 4 },
    { id: "ME", name: "Meets Expectations", value: 3 },
    { id: "AE", name: "Approaching Expectations", value: 2 },
    { id: "BE", name: "Below Expectations", value: 1 }
] as const;

// School-wide CBC analytics for admin dashboard
export const getSchoolWideCBCAnalytics = query({
    args: {
        term: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user || !("role" in user) || user.role !== "admin") {
            return null;
        }

        // Get all assessments
        let assessments = await ctx.db
            .query("core_competency_assessments")
            .collect();

        if (args.term) {
            assessments = assessments.filter(a => a.term === args.term);
        }

        // Get unique students and teachers
        const uniqueStudentIds = [...new Set(assessments.map(a => a.studentId))];
        const uniqueTeacherIds = [...new Set(assessments.map(a => a.teacherId))];

        // Get unique grades
        const uniqueGrades = [...new Set(assessments.map(a => a.grade).filter(Boolean))];

        // Calculate competency distribution
        const competencyDistribution = CORE_COMPETENCIES.map(competency => {
            const competencyAssessments = assessments.filter(a => a.competency === competency.id);

            const levelCounts = {
                EE: competencyAssessments.filter(a => a.level === "EE").length,
                ME: competencyAssessments.filter(a => a.level === "ME").length,
                AE: competencyAssessments.filter(a => a.level === "AE").length,
                BE: competencyAssessments.filter(a => a.level === "BE").length
            };

            const total = competencyAssessments.length;
            const meetingStandards = levelCounts.EE + levelCounts.ME;
            const percentMeeting = total > 0 ? (meetingStandards / total) * 100 : 0;

            return {
                competency: competency.id,
                name: competency.name,
                totalAssessments: total,
                levelDistribution: levelCounts,
                percentMeetingStandards: Math.round(percentMeeting)
            };
        });

        // Overall school metrics
        const totalAssessments = assessments.length;
        const allMeeting = assessments.filter(a => a.level === "ME" || a.level === "EE").length;
        const overallPercentMeeting = totalAssessments > 0 ? (allMeeting / totalAssessments) * 100 : 0;

        return {
            generatedAt: Date.now(),
            term: args.term || "All Terms",
            totalStudents: uniqueStudentIds.length,
            totalTeachers: uniqueTeacherIds.length,
            totalAssessments,
            overallPercentMeetingStandards: Math.round(overallPercentMeeting),
            grades: uniqueGrades.sort(),
            competencyDistribution
        };
    }
});

// Grade/cohort comparison analytics
export const getGradeCohortComparison = query({
    args: {
        term: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user || !("role" in user) || user.role !== "admin") {
            return null;
        }

        let assessments = await ctx.db
            .query("core_competency_assessments")
            .collect();

        if (args.term) {
            assessments = assessments.filter(a => a.term === args.term);
        }

        // Group by grade
        const grades = [...new Set(assessments.map(a => a.grade).filter(Boolean))];

        const gradeComparison = grades.map(grade => {
            const gradeAssessments = assessments.filter(a => a.grade === grade);
            const uniqueStudents = [...new Set(gradeAssessments.map(a => a.studentId))];

            // Calculate average performance
            const totalValue = gradeAssessments.reduce((sum, a) => {
                const level = CBC_LEVELS.find(l => l.id === a.level);
                return sum + (level?.value || 0);
            }, 0);
            const averagePerformance = gradeAssessments.length > 0
                ? totalValue / gradeAssessments.length
                : 0;

            // Meeting standards percentage
            const meetingCount = gradeAssessments.filter(a => a.level === "ME" || a.level === "EE").length;
            const percentMeeting = gradeAssessments.length > 0
                ? (meetingCount / gradeAssessments.length) * 100
                : 0;

            // Competency breakdown for this grade
            const competencyBreakdown = CORE_COMPETENCIES.map(comp => {
                const compAssessments = gradeAssessments.filter(a => a.competency === comp.id);
                const compMeeting = compAssessments.filter(a => a.level === "ME" || a.level === "EE").length;
                return {
                    competency: comp.id,
                    name: comp.name,
                    totalAssessments: compAssessments.length,
                    percentMeeting: compAssessments.length > 0
                        ? Math.round((compMeeting / compAssessments.length) * 100)
                        : 0
                };
            });

            return {
                grade,
                studentCount: uniqueStudents.length,
                totalAssessments: gradeAssessments.length,
                averagePerformance: Math.round(averagePerformance * 25), // Convert to 0-100 scale
                percentMeetingStandards: Math.round(percentMeeting),
                competencyBreakdown
            };
        });

        // Sort grades naturally (Grade 1, Grade 2, etc.)
        gradeComparison.sort((a, b) => {
            const numA = parseInt(a.grade.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.grade.replace(/\D/g, '')) || 0;
            return numA - numB;
        });

        return {
            generatedAt: Date.now(),
            term: args.term || "All Terms",
            gradeComparison
        };
    }
});

// Competency distribution across the school
export const getCompetencyDistribution = query({
    args: {
        term: v.optional(v.string()),
        grade: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user || !("role" in user) || (user.role !== "admin" && user.role !== "teacher")) {
            return null;
        }

        let assessments = await ctx.db
            .query("core_competency_assessments")
            .collect();

        if (args.term) {
            assessments = assessments.filter(a => a.term === args.term);
        }
        if (args.grade) {
            assessments = assessments.filter(a => a.grade === args.grade);
        }

        // Distribution of levels
        const levelDistribution = {
            EE: assessments.filter(a => a.level === "EE").length,
            ME: assessments.filter(a => a.level === "ME").length,
            AE: assessments.filter(a => a.level === "AE").length,
            BE: assessments.filter(a => a.level === "BE").length
        };

        const total = assessments.length;

        return {
            generatedAt: Date.now(),
            term: args.term || "All Terms",
            grade: args.grade || "All Grades",
            totalAssessments: total,
            levelDistribution,
            levelPercentages: {
                EE: total > 0 ? Math.round((levelDistribution.EE / total) * 100) : 0,
                ME: total > 0 ? Math.round((levelDistribution.ME / total) * 100) : 0,
                AE: total > 0 ? Math.round((levelDistribution.AE / total) * 100) : 0,
                BE: total > 0 ? Math.round((levelDistribution.BE / total) * 100) : 0
            }
        };
    }
});

// Term-over-term progress analytics
export const getTermProgressAnalytics = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user || !("role" in user) || user.role !== "admin") {
            return null;
        }

        const assessments = await ctx.db
            .query("core_competency_assessments")
            .collect();

        // Group by term
        const terms = [...new Set(assessments.map(a => a.term).filter(Boolean))];

        const termProgress = terms.map(term => {
            const termAssessments = assessments.filter(a => a.term === term);
            const uniqueStudents = [...new Set(termAssessments.map(a => a.studentId))];

            const meetingCount = termAssessments.filter(a => a.level === "ME" || a.level === "EE").length;
            const percentMeeting = termAssessments.length > 0
                ? (meetingCount / termAssessments.length) * 100
                : 0;

            // Average performance by competency
            const competencyAverages = CORE_COMPETENCIES.map(comp => {
                const compAssessments = termAssessments.filter(a => a.competency === comp.id);
                const totalValue = compAssessments.reduce((sum, a) => {
                    const level = CBC_LEVELS.find(l => l.id === a.level);
                    return sum + (level?.value || 0);
                }, 0);
                const average = compAssessments.length > 0 ? totalValue / compAssessments.length : 0;
                return {
                    competency: comp.id,
                    name: comp.name,
                    averageScore: Math.round(average * 25) // 0-100 scale
                };
            });

            return {
                term,
                studentCount: uniqueStudents.length,
                totalAssessments: termAssessments.length,
                percentMeetingStandards: Math.round(percentMeeting),
                competencyAverages
            };
        });

        // Sort terms chronologically (Term 1 2025, Term 2 2025, etc.)
        termProgress.sort((a, b) => {
            // Extract year and term number for sorting
            const matchA = a.term.match(/Term (\d+) (\d+)/);
            const matchB = b.term.match(/Term (\d+) (\d+)/);
            if (matchA && matchB) {
                const yearA = parseInt(matchA[2]);
                const yearB = parseInt(matchB[2]);
                if (yearA !== yearB) return yearA - yearB;
                return parseInt(matchA[1]) - parseInt(matchB[1]);
            }
            return a.term.localeCompare(b.term);
        });

        return {
            generatedAt: Date.now(),
            termProgress
        };
    }
});
