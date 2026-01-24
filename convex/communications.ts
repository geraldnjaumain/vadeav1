import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get conversations for current user
export const getConversations = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const conversations = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.or(
                    q.eq(q.field("participant1Id"), userId),
                    q.eq(q.field("participant2Id"), userId)
                )
            )
            .order("desc")
            .collect();

        // Enrich with other participant info and last message
        const enriched = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
                const otherUser = await ctx.db.get(otherUserId);
                const lastMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
                    .order("desc")
                    .first();

                return {
                    ...conv,
                    otherUser: otherUser ? { name: otherUser.name, image: otherUser.image, role: otherUser.role } : null,
                    lastMessage: lastMessage ? { content: lastMessage.content, createdAt: lastMessage.createdAt } : null,
                };
            })
        );

        return enriched;
    },
});

// Get messages in a conversation
export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // Verify user is part of conversation
        const conv = await ctx.db.get(args.conversationId);
        if (!conv || (conv.participant1Id !== userId && conv.participant2Id !== userId)) {
            return [];
        }

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .order("asc")
            .collect();

        // Enrich with sender info
        const enriched = await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);
                return {
                    ...msg,
                    sender: sender ? { name: sender.name, image: sender.image } : null,
                    isOwn: msg.senderId === userId,
                };
            })
        );

        return enriched;
    },
});

// Send a message
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Verify user is part of conversation
        const conv = await ctx.db.get(args.conversationId);
        if (!conv || (conv.participant1Id !== userId && conv.participant2Id !== userId)) {
            throw new Error("Not authorized for this conversation");
        }

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: userId,
            content: args.content,
            createdAt: Date.now(),
            isRead: false,
        });

        // Update conversation's updatedAt
        await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });

        return messageId;
    },
});

// Start a new conversation (or get existing)
export const startConversation = mutation({
    args: { otherUserId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Check if conversation already exists
        const existing = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.or(
                    q.and(q.eq(q.field("participant1Id"), userId), q.eq(q.field("participant2Id"), args.otherUserId)),
                    q.and(q.eq(q.field("participant1Id"), args.otherUserId), q.eq(q.field("participant2Id"), userId))
                )
            )
            .first();

        if (existing) return existing._id;

        // Create new conversation
        return await ctx.db.insert("conversations", {
            participant1Id: userId,
            participant2Id: args.otherUserId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

// Get teachers for parent to contact
export const getTeachersForParent = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "parent") return [];

        // Get all teachers
        const teachers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("role"), "teacher"))
            .collect();

        return teachers.map((t) => ({
            _id: t._id,
            name: t.name,
            email: t.email,
            image: t.image,
        }));
    },
});

// Get contacts for teacher (parents and students)
export const getContactsForTeacher = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "teacher") return [];

        // Get teacher's courses
        const courses = await ctx.db
            .query("courses")
            .withIndex("by_teacher", (q) => q.eq("teacherId", userId))
            .collect();

        if (courses.length === 0) {
            // Return all parents and students as fallback for new teachers
            const allUsers = await ctx.db
                .query("users")
                .filter((q) => q.or(
                    q.eq(q.field("role"), "parent"),
                    q.eq(q.field("role"), "student")
                ))
                .collect();

            return allUsers.map((u) => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                image: u.image,
                role: u.role,
                grade: u.grade,
            }));
        }

        const courseIds = courses.map((c) => c._id);
        const contactsMap = new Map<string, any>();

        // Get enrolled students
        for (const courseId of courseIds) {
            const enrollments = await ctx.db
                .query("enrollments")
                .filter((q) => q.eq(q.field("courseId"), courseId))
                .collect();

            for (const enrollment of enrollments) {
                const student = await ctx.db.get(enrollment.userId);
                if (student && student.role === "student") {
                    if (!contactsMap.has(student._id)) {
                        contactsMap.set(student._id, {
                            _id: student._id,
                            name: student.name,
                            email: student.email,
                            image: student.image,
                            role: student.role,
                            grade: student.grade,
                        });
                    }

                    // Also add their parent
                    if (student.parentId) {
                        const parent = await ctx.db.get(student.parentId);
                        if (parent && !contactsMap.has(parent._id)) {
                            // Get all children names for this parent
                            const children = await ctx.db
                                .query("users")
                                .withIndex("by_parent", (q) => q.eq("parentId", parent._id))
                                .collect();

                            contactsMap.set(parent._id, {
                                _id: parent._id,
                                name: parent.name,
                                email: parent.email,
                                image: parent.image,
                                role: parent.role,
                                childrenNames: children.map((c) => c.name),
                            });
                        }
                    }
                }
            }
        }

        return Array.from(contactsMap.values());
    },
});
