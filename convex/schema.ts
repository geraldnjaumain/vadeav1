import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
    // forcing rebuild
    ...authTables,
    users: defineTable({
        name: v.string(),
        email: v.string(),
        role: v.union(
            v.literal("student"),
            v.literal("parent"),
            v.literal("teacher"),
            v.literal("admin")
        ),
        image: v.optional(v.string()),
        phone: v.optional(v.string()), // Contact number
        clerkId: v.optional(v.string()),
        childrenCount: v.optional(v.string()),
        educationGoal: v.optional(v.string()),
        grade: v.optional(v.string()), // e.g. "Grade 4", "PP1"
        lan: v.optional(v.string()), // Learner Assessment Number (10 digits)
        emailVerified: v.optional(v.boolean()),
        verificationToken: v.optional(v.string()),
        resetToken: v.optional(v.string()),
        resetTokenExpires: v.optional(v.number()),
        parentId: v.optional(v.id("users")), // Link to parent for students
        username: v.optional(v.string()), // Custom username for child login
        password: v.optional(v.string()), // Custom password for child login (stored plainly for this MVP as requested)
        permissions: v.optional(v.array(v.string())), // Special granular permissions [NEW]
        impersonationToken: v.optional(v.string()), // For admin "login as" flow [NEW]
        isFirstLogin: v.optional(v.boolean()), // Prompt password change for students
        hasCompletedTour: v.optional(v.boolean()), // App tour tracking
        passwordChangedAt: v.optional(v.number()), // When password was last changed
        // Gamification
        xp: v.optional(v.number()), // Current XP towards next level
        level: v.optional(v.number()), // Current level (starts at 1)
        totalXp: v.optional(v.number()), // All-time XP earned
        // CBC Extensions
        pathway: v.optional(v.union(
            v.literal("STEM"),
            v.literal("social_sciences"),
            v.literal("arts_sports")
        )),
        pathwaySubjects: v.optional(v.array(v.string())),
        currentGrade: v.optional(v.string()), // e.g., "Grade 4", "PP1"
        currentTerm: v.optional(v.string()), // e.g., "Term 1 2025"
        // Child Questionnaire
        learningStyle: v.optional(v.union(
            v.literal("visual"),
            v.literal("auditory"),
            v.literal("kinesthetic")
        )),
        interests: v.optional(v.array(v.string())),
        specialNeeds: v.optional(v.string()), // Added for accommodations
        // Admission System
        admissionNumber: v.optional(v.string()), // Format: 10057/2026
        trialEndsAt: v.optional(v.number()), // Unix timestamp for trial expiry
        isSuspended: v.optional(v.boolean()), // Admin suspension status
    })
        .index("by_email", ["email"])
        .index("by_clerkId", ["clerkId"])
        .index("by_parent", ["parentId"])
        .index("by_username", ["username"])
        .index("by_impersonation_token", ["impersonationToken"])
        .index("by_admission_number", ["admissionNumber"]), // New index for quick lookup

    // Global counters for sequential IDs (e.g. Admission Numbers)
    counters: defineTable({
        name: v.string(), // e.g., "admission_number"
        count: v.number(),
        year: v.optional(v.number()), // To reset yearly if needed
    }).index("by_name", ["name"]),

    teacher_applications: defineTable({
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        phone: v.string(),
        subjects: v.string(),
        experience: v.string(),
        resumeUrl: v.optional(v.string()), // For file upload later
        resumeStorageId: v.optional(v.id("_storage")), // Stored file ID
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
        createdAt: v.number(),
        userId: v.optional(v.id("users")), // Link to user account if created
    }).index("by_email", ["email"])
        .index("by_user", ["userId"]),

    courses: defineTable({
        title: v.string(),
        description: v.string(),
        price: v.number(),
        teacherId: v.id("users"),
        isPublished: v.boolean(),
        imageUrl: v.optional(v.string()),
    })
        .index("by_teacher", ["teacherId"])
        .index("by_published", ["isPublished"]),

    lessons: defineTable({
        courseId: v.id("courses"),
        teacherId: v.id("users"), // Optimization for "My Schedule" queries
        title: v.string(),
        description: v.optional(v.string()),
        scheduledAt: v.number(), // timestamp
        durationMins: v.number(),
        status: v.string(), // scheduled, live, completed, cancelled
        meetingUrl: v.optional(v.string()), // For Lessonspace/Zoom link
        recordingUrl: v.optional(v.string()), // For replay
        notes: v.optional(v.string()), // Teacher notes
        attachments: v.optional(v.array(v.object({
            name: v.string(),
            url: v.string(),
            type: v.string(),
        }))),
    })
        .index("by_course", ["courseId"])
        .index("by_teacher", ["teacherId"])
        .index("by_schedule", ["scheduledAt"]),

    enrollments: defineTable({
        userId: v.id("users"),
        courseId: v.id("courses"),
        status: v.string(), // active, completed
    }).index("by_user", ["userId"]),
    channels: defineTable({
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        role: v.optional(v.string()),
        createdAt: v.optional(v.number()),
    }).index("by_slug", ["slug"]),

    topics: defineTable({
        channelId: v.id("channels"),
        authorId: v.id("users"),
        title: v.string(),
        content: v.string(),
        isPinned: v.optional(v.boolean()),
        views: v.optional(v.number()),
        lastReplyAt: v.optional(v.number()),
        createdAt: v.optional(v.number()),
    })
        .index("by_channel", ["channelId"])
        .index("by_pinned", ["isPinned"]), // optimization for sorting pinned first

    posts: defineTable({
        topicId: v.id("topics"),
        authorId: v.id("users"),
        content: v.string(),
        likes: v.optional(v.array(v.id("users"))),
        createdAt: v.number(),
    }).index("by_topic", ["topicId"]),

    invoices: defineTable({
        parentId: v.id("users"),
        studentId: v.optional(v.id("users")), // Linked to specific child
        title: v.string(), // e.g., "Term 1 Tuition"
        amount: v.number(),
        dueDate: v.number(),
        status: v.union(v.literal("paid"), v.literal("pending"), v.literal("overdue"), v.literal("void")),
        paymentId: v.optional(v.id("transactions")), // Link to transaction if paid
        description: v.optional(v.string())
    })
        .index("by_parent", ["parentId"])
        .index("by_status", ["status"]),

    transactions: defineTable({
        userId: v.id("users"),
        courseId: v.optional(v.id("courses")),
        invoiceId: v.optional(v.id("invoices")), // Link back to invoice
        amount: v.number(),
        currency: v.string(), // "KES"
        status: v.union(v.literal("pending"), v.literal("success"), v.literal("failed")),
        channel: v.optional(v.string()), // e.g., "mpesa"
        reference: v.optional(v.string()), // External payment ref
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_course", ["courseId"]),

    events: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        startDate: v.number(), // Unix timestamp (midnight)
        endDate: v.number(), // Unix timestamp (midnight)
        type: v.union(v.literal("holiday"), v.literal("exam"), v.literal("event"), v.literal("deadline")),
        targetAudience: v.optional(v.union(v.literal("all"), v.literal("student"), v.literal("teacher"), v.literal("parent"))),
        createdBy: v.id("users"),
    })
        .index("by_date", ["startDate"])
        .index("by_type", ["type"]),

    blogs: defineTable({
        title: v.string(),
        slug: v.string(),
        content: v.string(), // HTML or Markdown
        excerpt: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        authorId: v.id("users"),
        isPublished: v.boolean(),
        publishedAt: v.optional(v.number()),
    }).index("by_slug", ["slug"]),

    analytics: defineTable({
        userId: v.optional(v.id("users")), // Optional for guest tracking
        ip: v.optional(v.string()),
        location: v.optional(v.string()),
        userAgent: v.string(),
        path: v.string(),
        timestamp: v.number(),
    }).index("by_user", ["userId"]),

    notifications: defineTable({
        userId: v.id("users"),
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error")),
        isRead: v.boolean(),
        link: v.optional(v.string()), // URL to redirect to
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_read", ["userId", "isRead"]),

    // School-wide and class announcements
    announcements: defineTable({
        title: v.string(),
        content: v.string(),
        authorId: v.id("users"),
        type: v.union(v.literal("school"), v.literal("class"), v.literal("grade")),
        targetGrade: v.optional(v.string()), // for grade-specific
        targetRole: v.optional(v.string()), // for role-specific (parent, student, teacher)
        isPinned: v.boolean(),
        expiresAt: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_type", ["type"])
        .index("by_author", ["authorId"]),

    system_settings: defineTable({
        key: v.string(),
        value: v.any(),
        description: v.optional(v.string()),
        updatedAt: v.number(),
    }).index("by_key", ["key"]),

    attendance: defineTable({
        studentId: v.id("users"),
        date: v.number(), // Unix timestamp (midnight)
        status: v.union(v.literal("present"), v.literal("absent"), v.literal("late"), v.literal("excused")),
        remarks: v.optional(v.string()),
    })
        .index("by_student", ["studentId"])
        .index("by_student_date", ["studentId", "date"]),

    assignments: defineTable({
        subject: v.string(), // e.g. "Mathematics"
        title: v.string(), // e.g. "Algebra Quiz 1"
        description: v.optional(v.string()),
        maxScore: v.number(),
        dueDate: v.number(),
        competency: v.optional(v.string()), // [NEW] Link to CBC Competency
    }).index("by_subject", ["subject"]),

    results: defineTable({
        assignmentId: v.id("assignments"),
        studentId: v.id("users"),
        score: v.number(),
        feedback: v.optional(v.string()),
        gradedAt: v.number(),
    })
        .index("by_student", ["studentId"])
        .index("by_assignment", ["assignmentId"]),
    resources: defineTable({
        title: v.string(),
        type: v.string(), // book, video, paper
        url: v.string(),
        thumbnail: v.optional(v.string()),
        subject: v.optional(v.string()),
        isPublic: v.boolean(),
        grade: v.optional(v.string()),
    }).index("by_type", ["type"]),

    achievements: defineTable({
        slug: v.string(),
        title: v.string(),
        description: v.string(),
        icon: v.string(),
        points: v.number(),
        criteria: v.optional(v.object({
            type: v.union(v.literal("competency"), v.literal("streak")),
            target: v.string(), // competency ID or count
            level: v.optional(v.string()) // e.g. "EE"
        }))
    }).index("by_slug", ["slug"]),

    user_achievements: defineTable({
        userId: v.id("users"),
        achievementId: v.id("achievements"),
        awardedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_achievement", ["userId", "achievementId"]),

    conversations: defineTable({
        participant1Id: v.id("users"),
        participant2Id: v.id("users"),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_participant1", ["participant1Id"])
        .index("by_participant2", ["participant2Id"]),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        createdAt: v.number(),
        isRead: v.boolean(),
    })
        .index("by_conversation", ["conversationId"]),

    // Cohorts - Admin-managed learning programs with pricing
    cohorts: defineTable({
        name: v.string(),
        description: v.string(),
        grade: v.string(), // e.g., "Grade 4", "PP1"
        price: v.number(), // One-time fee in KES
        trialDays: v.number(), // Free trial period (0 = no trial)
        isActive: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_grade", ["grade"])
        .index("by_active", ["isActive"]),

    // Student-Cohort enrollment linking students to paid cohorts
    cohort_enrollments: defineTable({
        studentId: v.id("users"),
        cohortId: v.id("cohorts"),
        parentId: v.id("users"),
        status: v.union(v.literal("trial"), v.literal("active"), v.literal("expired")),
        trialEndsAt: v.optional(v.number()),
        enrolledAt: v.number(),
        paidAt: v.optional(v.number()),
        transactionId: v.optional(v.id("transactions")),
    })
        .index("by_student", ["studentId"])
        .index("by_parent", ["parentId"])
        .index("by_cohort", ["cohortId"]),

    // User session tracking for device/location/IP data
    user_sessions: defineTable({
        userId: v.id("users"),
        ipAddress: v.optional(v.string()),
        location: v.optional(v.string()),
        device: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        loginAt: v.number(),
    })
        .index("by_user", ["userId"]),

    // Quizzes created by teachers
    quizzes: defineTable({
        title: v.string(),
        subject: v.string(),
        grade: v.optional(v.string()),
        description: v.optional(v.string()),
        teacherId: v.id("users"),
        isPublished: v.boolean(),
        timeLimit: v.optional(v.number()), // minutes
        passingScore: v.number(), // percentage
        competency: v.optional(v.string()), // Linked CBC competency [NEW]
        createdAt: v.number(),
    })
        .index("by_teacher", ["teacherId"])
        .index("by_subject", ["subject"])
        .index("by_competency", ["competency"]),

    // Quiz questions
    quiz_questions: defineTable({
        quizId: v.id("quizzes"),
        questionText: v.string(),
        questionType: v.union(v.literal("mcq"), v.literal("true_false"), v.literal("short_answer")),
        options: v.optional(v.array(v.string())), // for MCQ
        correctAnswer: v.string(),
        points: v.number(),
        order: v.number(),
    })
        .index("by_quiz", ["quizId"]),

    // Student quiz attempts
    quiz_attempts: defineTable({
        quizId: v.id("quizzes"),
        studentId: v.id("users"),
        answers: v.array(v.object({
            questionId: v.id("quiz_questions"),
            answer: v.string(),
            isCorrect: v.boolean(),
        })),
        score: v.number(),
        totalPoints: v.number(),
        passed: v.boolean(),
        startedAt: v.number(),
        completedAt: v.number(),
    })
        .index("by_student", ["studentId"])
        .index("by_quiz", ["quizId"]),

    // Daily Challenges - predefined challenges that cycle
    daily_challenges: defineTable({
        title: v.string(),
        description: v.string(),
        type: v.union(v.literal("quiz"), v.literal("forum"), v.literal("lesson")),
        requiredCount: v.number(), // e.g., complete 1 quiz
        rewardXP: v.number(), // XP reward for completion
        isActive: v.boolean(),
    }),

    // User progress on daily challenges (resets daily)
    user_daily_challenges: defineTable({
        userId: v.id("users"),
        challengeId: v.id("daily_challenges"),
        currentProgress: v.number(), // Current count towards requiredCount
        isCompleted: v.boolean(), // Challenge completed (progress >= requiredCount)
        isClaimed: v.boolean(), // XP reward claimed
        date: v.string(), // YYYY-MM-DD format for daily reset
    })
        .index("by_user", ["userId"])
        .index("by_user_date", ["userId", "date"])
        .index("by_challenge", ["challengeId"]),

    // CBC Core Competency Assessments
    core_competency_assessments: defineTable({
        studentId: v.id("users"),
        competency: v.union(
            v.literal("communication_collaboration"),
            v.literal("self_efficacy"),
            v.literal("critical_thinking"),
            v.literal("creativity_imagination"),
            v.literal("citizenship"),
            v.literal("digital_literacy"),
            v.literal("learning_to_learn")
        ),
        level: v.union(v.literal("EE"), v.literal("ME"), v.literal("AE"), v.literal("BE")),
        evidence: v.array(v.string()),
        teacherId: v.id("users"),
        assessmentDate: v.number(),
        term: v.string(), // e.g., "Term 1 2025"
        grade: v.string(),
        comments: v.optional(v.string())
    })
        .index("by_student", ["studentId"])
        .index("by_competency", ["competency"])
        .index("by_student_competency", ["studentId", "competency"])
        .index("by_teacher", ["teacherId"]),

    // Student Competency Goals
    competency_goals: defineTable({
        studentId: v.id("users"),
        competency: v.string(), // e.g. "communication_collaboration"
        targetLevel: v.union(v.literal("EE"), v.literal("ME"), v.literal("AE")),
        currentLevel: v.optional(v.string()),
        deadline: v.number(), // Date
        status: v.union(v.literal("in_progress"), v.literal("achieved"), v.literal("expired")),
        createdAt: v.number(),
        achievedAt: v.optional(v.number())
    })
        .index("by_student", ["studentId"])
        .index("by_student_competency", ["studentId", "competency"]),

    // CBC Assessment Rubrics
    cbc_rubrics: defineTable({
        subject: v.string(),
        grade: v.string(),
        competency: v.string(),
        criteria: v.array(v.object({
            description: v.string(),
            EE: v.string(), // Exceeds Expectations
            ME: v.string(), // Meets Expectations  
            AE: v.string(), // Approaching Expectations
            BE: v.string()  // Below Expectations
        })),
        createdBy: v.id("users"),
        isActive: v.boolean(),
        createdAt: v.number()
    })
        .index("by_subject_grade", ["subject", "grade"])
        .index("by_competency", ["competency"])
        .index("by_active", ["isActive"]),

    // Senior Secondary Pathways (Phase 2 preparation)
    pathway_enrollments: defineTable({
        studentId: v.id("users"),
        pathway: v.union(v.literal("STEM"), v.literal("social_sciences"), v.literal("arts_sports")),
        subjects: v.array(v.string()),
        enrolledAt: v.number(),
        grade: v.string(), // e.g., "Grade 10"
        isActive: v.boolean()
    })
        .index("by_student", ["studentId"])
        .index("by_pathway", ["pathway"])
        .index("by_grade", ["grade"]),

    // Learner Portfolio Items
    portfolio_items: defineTable({
        studentId: v.id("users"),
        title: v.string(),
        description: v.string(),
        type: v.union(v.literal("project"), v.literal("assignment"), v.literal("assessment"), v.literal("reflection")),
        competency: v.optional(v.string()), // Linked competency
        attachments: v.optional(v.array(v.object({
            name: v.string(),
            url: v.string(),
            type: v.string(),
        }))),
        submittedAt: v.number(),
        teacherId: v.id("users"),
        feedback: v.optional(v.string()),
        isPublic: v.boolean(), // For sharing with parents
        status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")))
    })
        .index("by_student", ["studentId"])
        .index("by_type", ["type"])
        .index("by_competency", ["competency"])
        .index("by_teacher", ["teacherId"]),

    // KNEC Assessments (Phase 3 preparation)
    knec_assessments: defineTable({
        studentId: v.id("users"),
        assessmentType: v.union(v.literal("KEYA"), v.literal("KPSEA"), v.literal("KMYA"), v.literal("KILEA"), v.literal("KCBE")),
        year: v.number(),
        grade: v.string(),
        scores: v.object({
            totalScore: v.number(),
            maxScore: v.number(),
            subjects: v.array(v.object({
                name: v.string(),
                score: v.number(),
                maxScore: v.number()
            })),
            competencies: v.optional(v.array(v.object({
                name: v.string(),
                level: v.string()
            })))
        }),
        completedAt: v.number(),
        certificateUrl: v.optional(v.string())
    })
        .index("by_student", ["studentId"])
        .index("by_type_year", ["assessmentType", "year"])
        .index("by_grade", ["grade"]),

    // Core Project Implementations (CPI)
    cpi_projects: defineTable({
        title: v.string(),
        description: v.string(),
        competencies: v.array(v.string()), // Linked competencies
        grade: v.string(), // Target grade
        term: v.string(),
        startDate: v.number(),
        endDate: v.number(),
        isActive: v.boolean(),
        createdBy: v.id("users")
    })
        .index("by_grade", ["grade"])
        .index("by_active", ["isActive"]),

    // Student CPI Submissions
    cpi_submissions: defineTable({
        projectId: v.id("cpi_projects"),
        studentId: v.id("users"),
        status: v.union(v.literal("in_progress"), v.literal("submitted"), v.literal("graded")),
        submissionDate: v.optional(v.number()),
        attachments: v.optional(v.array(v.string())), // URLs
        score: v.optional(v.number()),
        feedback: v.optional(v.string()),
        gradedBy: v.optional(v.id("users"))
    })
        .index("by_project", ["projectId"])
        .index("by_student", ["studentId"])
        .index("by_student_project", ["studentId", "projectId"]),

    // Educational Pathways Metadata
    pathways: defineTable({
        code: v.union(v.literal("STEM"), v.literal("social_sciences"), v.literal("arts_sports")),
        name: v.string(), // Display name
        description: v.string(),
        requiredSubjects: v.array(v.string()),
        recommendedCareers: v.array(v.string()),
        imageUrl: v.optional(v.string())
    }).index("by_code", ["code"]),


    // Track lesson completion for progress
    lesson_completions: defineTable({
        studentId: v.id("users"),
        lessonId: v.id("lessons"),
        courseId: v.id("courses"),
        completedAt: v.number(),
    })
        .index("by_student", ["studentId"])
        .index("by_student_course", ["studentId", "courseId"])
        .index("by_lesson", ["lessonId"]),

    tickets: defineTable({
        userId: v.id("users"),
        subject: v.string(),
        message: v.string(),
        category: v.string(), // technical, billing, academic, feature_request, other
        status: v.string(), // open, in_progress, resolved, closed
        priority: v.optional(v.string()), // low, medium, high
        attachments: v.optional(v.array(v.string())),
        adminNotes: v.optional(v.string()),
        resolvedAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"])
        .index("by_category", ["category"]),
    // Certificates issued to students
    certificates: defineTable({
        studentId: v.id("users"),
        type: v.union(v.literal("completion"), v.literal("competency"), v.literal("academic"), v.literal("leaving")),
        title: v.string(), // e.g. "Grade 6 Completion"
        description: v.optional(v.string()),
        issuedAt: v.number(),
        issuedBy: v.id("users"),
        fileUrl: v.string(), // URL to PDF
        metadata: v.optional(v.object({
            grade: v.optional(v.string()),
            year: v.optional(v.number()),
            competency: v.optional(v.string())
        }))
    })
        .index("by_student", ["studentId"])
        .index("by_type", ["type"]),
});
