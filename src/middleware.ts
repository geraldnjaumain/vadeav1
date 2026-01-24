import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// Cookie configuration for persistent sessions
// maxAge is in seconds: 30 days = 30 * 24 * 60 * 60 = 2592000
const cookieConfig = {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: false, // Force false for local dev to prevent cookie rejection
    sameSite: "lax" as const,
};

// Simplified middleware - just handle cookies with proper persistence
// Route protection is done client-side in dashboard layout
export default convexAuthNextjsMiddleware(
    (request) => {
        // No redirects here - handled by dashboard layout
    },
    { cookieConfig }
);

export const config = {
    // The following matcher runs middleware on all routes
    // except static assets.
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
