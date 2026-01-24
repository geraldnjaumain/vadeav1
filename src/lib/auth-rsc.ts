import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { redirect } from "next/navigation";

export async function requireRole(allowedRole: "student" | "parent" | "teacher" | "admin") {
    const token = await convexAuthNextjsToken();

    // fetchQuery usage: query, args, options
    const user = await fetchQuery(api.users.currentUser, {}, { token });

    if (!user) {
        redirect("/");
    }

    const userRole = (user.role as string) || "student";

    if (userRole !== allowedRole) {
        // Redirect to their actual dashboard to avoid 403 dead ends
        redirect(`/${userRole}`);
    }

    return user;
}
