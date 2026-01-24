import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// --- QUERIES ---

export const get = query({
    args: { id: v.id("quizzes") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getQuestions = query({
    args: { quizId: v.id("quizzes") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("quiz_questions")
            .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
            .order("asc") // Assuming order field exists and needed
            .collect();
    },
});

export const listByTeacher = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        return await ctx.db
            .query("quizzes")
            .withIndex("by_teacher", (q) => q.eq("teacherId", userId))
            .order("desc")
            .collect();
    }
});

// For student lists
export const getAvailableQuizzes = query({
    handler: async (ctx) => {
        // This might filter by grade or subject in a real app
        return await ctx.db
            .query("quizzes")
            .withIndex("by_published", (q) => q.eq("isPublished", true)) // Requires index? Or filter.
            // Schema had: index("by_teacher"), index("by_subject"), ...
            // Maybe filtering in code for now if 'by_published' index missing in schema view.
            .filter(q => q.eq(q.field("isPublished"), true))
            .take(50);
    }
});

export const getAttempt = query({
    args: { quizId: v.id("quizzes") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        return await ctx.db
            .query("quiz_attempts")
            .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
            .filter(q => q.eq(q.field("studentId"), userId))
            .first();
    }
});

// --- MUTATIONS ---

export const create = mutation({
    args: {
        title: v.string(),
        subject: v.string(),
        description: v.optional(v.string()),
        passingScore: v.number(),
        questions: v.array(v.object({
            questionText: v.string(),
            questionType: v.union(v.literal("mcq"), v.literal("true_false"), v.literal("short_answer")),
            options: v.optional(v.array(v.string())),
            correctAnswer: v.string(),
            points: v.number(),
            order: v.number(),
        }))
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const quizId = await ctx.db.insert("quizzes", {
            title: args.title,
            subject: args.subject,
            description: args.description,
            passingScore: args.passingScore,
            teacherId: userId,
            isPublished: false,
            createdAt: Date.now(),
        });

        for (const q of args.questions) {
            await ctx.db.insert("quiz_questions", {
                quizId,
                ...q
            });
        }

        return quizId;
    }
});

export const update = mutation({
    args: {
        id: v.id("quizzes"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        isPublished: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const quiz = await ctx.db.get(args.id);
        if (!quiz || quiz.teacherId !== userId) throw new Error("Unauthorized");

        await ctx.db.patch(args.id, {
            title: args.title,
            description: args.description,
            isPublished: args.isPublished,
        });
    }
});

export const deleteQuiz = mutation({
    args: { id: v.id("quizzes") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const quiz = await ctx.db.get(args.id);
        if (!quiz || quiz.teacherId !== userId) throw new Error("Unauthorized");

        // Delete questions first
        const questions = await ctx.db.query("quiz_questions").withIndex("by_quiz", q => q.eq("quizId", args.id)).collect();
        for (const q of questions) {
            await ctx.db.delete(q._id);
        }

        await ctx.db.delete(args.id);
    }
});

export const submit = mutation({
    args: {
        quizId: v.id("quizzes"),
        answers: v.array(v.object({
            questionId: v.id("quiz_questions"),
            answer: v.string()
        }))
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const questions = await ctx.db
            .query("quiz_questions")
            .withIndex("by_quiz", q => q.eq("quizId", args.quizId))
            .collect();

        let score = 0;
        let totalPoints = 0;
        const gradedAnswers = [];

        for (const q of questions) {
            totalPoints += q.points;
            const studentAns = args.answers.find(a => a.questionId === q._id);
            const isCorrect = studentAns?.answer === q.correctAnswer;
            if (isCorrect) score += q.points;

            gradedAnswers.push({
                questionId: q._id,
                answer: studentAns?.answer || "",
                isCorrect
            });
        }

        const quiz = await ctx.db.get(args.quizId);
        const passed = (score / totalPoints) * 100 >= (quiz?.passingScore || 50);

        await ctx.db.insert("quiz_attempts", {
            quizId: args.quizId,
            studentId: userId,
            score,
            totalPoints,
            passed,
            answers: gradedAnswers,
            startedAt: Date.now(), // approximation
            completedAt: Date.now(),
        });

        return { score, totalPoints, passed };
    }
});
