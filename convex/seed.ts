import { mutation } from "./_generated/server";

export const seedChannels = mutation({
    args: {},
    handler: async (ctx) => {
        const channels = [
            { name: "General Discussion", slug: "general", description: "Talk about anything related to Vadea.", role: "student" },
            { name: "Homework Help", slug: "homework", description: "Get help with your assignments.", role: "student" },
            { name: "Study Groups", slug: "study-groups", description: "Find peers to study with.", role: "student" },
            { name: "Announcements", slug: "announcements", description: "Official updates from Vadea.", role: "student" },
        ];

        for (const channel of channels) {
            const existing = await ctx.db
                .query("channels")
                .withIndex("by_slug", (q) => q.eq("slug", channel.slug))
                .first();

            if (!existing) {
                await ctx.db.insert("channels", channel);
            }
        }

        return "Seeding successful";
    },
});

export const seedCourses = mutation({
    args: {},
    handler: async (ctx) => {
        const teacher = await ctx.db.query("users").first();
        // Ideally we filter by role="teacher" but for seeding any user acts as owner
        if (!teacher) {
            console.log("No users found. Cannot seed courses.");
            return;
        }

        const courses = [
            {
                title: "Grade 4 Mathematics: Foundations",
                description: "A comprehensive introduction to arithmetic, geometry, and basic algebra concepts tailored for Grade 4 students.",
                price: 4500,
                isPublished: true,
                teacherId: teacher._id,
                imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
            },
            {
                title: "Grade 5 Science: Living World",
                description: "Explore the wonders of biology, ecosystems, and the environment in this interactive science course.",
                price: 5000,
                isPublished: true,
                teacherId: teacher._id,
                imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
            },
            {
                title: "Intro to Coding (Python)",
                description: "Start your programming journey with Python. Build games, solve puzzles, and learn logic.",
                price: 7500,
                isPublished: true,
                teacherId: teacher._id,
                imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
            }
        ];

        for (const course of courses) {
            // Check duplication by title to be safe, or just insert. 
            // For simple seeding, we just insert. Cleaning DB is recommended before re-seeding.
            await ctx.db.insert("courses", course);
        }

        return "Courses Seeded!";
    }
});

export const seedAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if admin exists
        const existingAdmin = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", "admin"))
            .first();

        if (!existingAdmin) {
            await ctx.db.insert("users", {
                name: "Administrator",
                email: "admin@vadea.com",
                username: "admin",
                password: "12345678", // Default
                role: "admin",
                image: "https://github.com/shadcn.png"
            });
            return "✅ Admin user created: admin / 12345678";
        } else {
            return "ℹ️ Admin user already exists";
        }
    }
});
