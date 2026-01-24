import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";


export const getResources = query({
    args: {
        type: v.optional(v.string()),
        subject: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // In a real app we might filter by user's grade level here

        let resources: Doc<"resources">[];

        if (args.type) {
            resources = await ctx.db
                .query("resources")
                .withIndex("by_type", (q) => q.eq("type", args.type!))
                .collect();
        } else {
            resources = await ctx.db.query("resources").collect();
        }

        if (args.subject) {
            return resources.filter(r => r.subject === args.subject);
        }

        return resources;
    },
});

export const seedResources = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("resources").take(1);
        if (existing.length > 0) return;

        const resources = [
            {
                title: "Introduction to Algebra",
                type: "book",
                url: "#",
                subject: "Mathematics",
                isPublic: true,
                thumbnail: "https://placehold.co/400x600/e2e8f0/1e293b?text=Algebra"
            },
            {
                title: "The Solar System",
                type: "video",
                url: "#",
                subject: "Science",
                isPublic: true,
                thumbnail: "https://placehold.co/600x400/e2e8f0/1e293b?text=Solar+System"
            },
            {
                title: "World History: Ancient Civilizations",
                type: "book",
                url: "#",
                subject: "History",
                isPublic: true,
                thumbnail: "https://placehold.co/400x600/e2e8f0/1e293b?text=History"
            },
            {
                title: "Physics Lab Manual",
                type: "paper",
                url: "#",
                subject: "Science",
                isPublic: true,
                thumbnail: "https://placehold.co/400x600/e2e8f0/1e293b?text=Physics"
            },
        ];

        for (const r of resources) {
            await ctx.db.insert("resources", r);
        }
    }
});
