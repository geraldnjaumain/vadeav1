import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createTicket = mutation({
    args: {
        subject: v.string(),
        message: v.string(),
        category: v.string(),
        priority: v.optional(v.string()),
        attachments: v.optional(v.array(v.string()))
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const ticketId = await ctx.db.insert("tickets", {
            userId,
            subject: args.subject,
            message: args.message,
            category: args.category,
            status: "open",
            priority: args.priority || "medium",
            attachments: args.attachments,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return ticketId;
    },
});

export const getMyTickets = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const tickets = await ctx.db
            .query("tickets")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        return tickets;
    },
});

export const getTicketById = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const ticket = await ctx.db.get(args.ticketId);
        if (!ticket) return null;

        // Ensure user owns the ticket
        if (ticket.userId !== userId) {
            // Check if admin (optional future scoped permission check)
            const user = await ctx.db.get(userId);
            if (user?.role !== "admin") return null;
        }

        return ticket;
    },
});

export const updateTicketStatus = mutation({
    args: {
        ticketId: v.id("tickets"),
        status: v.string(),
        adminNotes: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Only admins can update status typically, but for now we'll allow users to "close" their own ticket maybe?
        // Let's enforce Admin only for non-closure for MVP simplicity, or just check role.
        const user = await ctx.db.get(userId);
        if (user?.role !== "admin") throw new Error("Unauthorized");

        await ctx.db.patch(args.ticketId, {
            status: args.status,
            adminNotes: args.adminNotes,
            updatedAt: Date.now(),
            ...(args.status === 'resolved' ? { resolvedAt: Date.now() } : {})
        });
    },
});

// Query for Admins to fetch all tickets with optional filtering 
// Query for Admins to fetch all tickets with optional filtering
export const listAllTickets = query({
    args: { status: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        if (user?.role !== "admin") return [];

        let tickets;
        if (args.status !== undefined) {
            tickets = await ctx.db
                .query("tickets")
                .withIndex("by_status", (q) => q.eq("status", args.status as string))
                .collect();
        } else {
            tickets = await ctx.db.query("tickets").collect();
        }

        // Populate user details
        const ticketsWithUsers = await Promise.all(tickets.map(async (t) => {
            const author = await ctx.db.get(t.userId);
            return {
                ...t,
                author: author ? { name: author.name, email: author.email, image: author.image } : null
            };
        }));

        return ticketsWithUsers.sort((a, b) => b.createdAt - a.createdAt);
    },
});
