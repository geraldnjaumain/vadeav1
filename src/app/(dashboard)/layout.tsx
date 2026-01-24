"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { FirstLoginDialog } from "@/components/onboarding/FirstLoginDialog";
import { AppTour } from "@/components/onboarding/AppTour";
import { cn } from "@/lib/utils";
import { SubscriptionBanner } from "@/components/dashboard/SubscriptionBanner";

import { useConvexAuth } from "convex/react";


function DebugAuthInfo() {
    const debugInfo = useQuery(api.users.debugCurrentUser);
    if (!debugInfo) return <p>Loading server debug info...</p>;
    return (
        <div className="space-y-1">
            <p>Auth ID: <span className="font-mono">{debugInfo.userId ?? "None"}</span></p>
            <p>User Record: <span className={debugInfo.user ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {debugInfo.message}
            </span></p>
            {debugInfo.user && (
                <p>Role: {debugInfo.user.role} | ID: {debugInfo.user._id}</p>
            )}
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
    const user = useQuery(api.users.currentUser);
    const onboardingStatus = useQuery(api.onboarding.getOnboardingStatus);
    const router = useRouter();
    const pathname = usePathname();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showTourDialog, setShowTourDialog] = useState(false);

    // Handle onboarding dialogs
    useEffect(() => {
        if (!onboardingStatus || !user) return;

        // For students: Show password change on first login
        if (user.role === "student" && onboardingStatus.isFirstLogin) {
            setShowPasswordDialog(true);
        } else if (!onboardingStatus.hasCompletedTour) {
            // Show tour for users who haven't completed it
            setShowTourDialog(true);
        }
    }, [onboardingStatus, user]);

    useEffect(() => {
        // Give auth state time to stabilize on initial load
        const timer = setTimeout(() => {
            setIsInitialLoad(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Don't redirect during initial load - wait for auth state to stabilize
        if (isInitialLoad) return;

        const authState = {
            isAuthenticated,
            isAuthLoading,
            user: user === undefined ? "undefined" : user === null ? "null" : { _id: user._id, role: user.role },
            pathname,
            isInitialLoad
        };
        // console.log("[DashboardLayout] Auth Check:", JSON.stringify(authState));

        if (!isAuthLoading && !isAuthenticated) {
            // console.log("[DashboardLayout] Not authenticated");
            // Redirect admin routes to specific admin login
            if (pathname.startsWith("/admin")) {
                router.push("/admin/login");
                return;
            }
            // Do not auto-redirect users to avoid loops. Show a blocked screen instead.
            return;
        }

        // If authenticated but user query is null (and done loading), something is wrong.
        // However, we should be careful. 'user === null' means the query completed and found nothing.
        if (isAuthenticated && user === null) {
            // console.log("[DashboardLayout] Authenticated but User is null. Waiting/Retrying or Invalid State.");
            // If we are authenticated but the backend says we don't exist... it's a problem.
            // But let's not redirect immediately to avoid loops if it's just a sync issue.
            // Maybe we just show loading?
            // For now, let's log and NOT redirect immediately, or redirect to a specific error page/logout?
            // Or maybe force sign out?
            // router.push("/?auth=login");
            return;
        }

        // Role-based access control
        if (user) {
            const role = user.role;
            // console.log("[DashboardLayout] Role Check:", JSON.stringify({ role, pathname }));

            const isParentRoute = pathname.startsWith("/parent");
            const isTeacherRoute = pathname.startsWith("/teacher");
            const isStudentRoute = pathname.startsWith("/student");
            const isAdminRoute = pathname.startsWith("/admin");
            const isForumRoute = pathname.startsWith("/forums");
            const isCourseRoute = pathname.startsWith("/courses");

            // Forums and courses are accessible to all authenticated users
            if (isForumRoute || isCourseRoute) return;

            // Check role access
            if (isParentRoute && role !== "parent" && role !== "admin") {
                // console.log("[DashboardLayout] Role Mismatch (Parent), redirecting to", role);
                router.push(`/${role}`);
            } else if (isTeacherRoute && role !== "teacher" && role !== "admin") {
                // console.log("[DashboardLayout] Role Mismatch (Teacher), redirecting to", role);
                router.push(`/${role}`);
            } else if (isStudentRoute && role !== "student" && role !== "admin") {
                // console.log("[DashboardLayout] Role Mismatch (Student), redirecting to", role);
                router.push(`/${role}`);
            } else if (isAdminRoute && role !== "admin") {
                // console.log("[DashboardLayout] Role Mismatch (Admin), redirecting to", role);
                router.push(`/${role}`);
            }
        }
    }, [user, pathname, router, isInitialLoad]);

    // Show loading state while checking auth
    if (user === undefined || isInitialLoad) {
        return <LoadingScreen message="Getting things ready..." />;
    }

    if (!isAuthLoading && !isAuthenticated) {
        if (pathname.startsWith("/admin")) return null;
        return (
            <div className="flex min-h-screen items-center justify-center bg-white flex-col gap-4">
                <div className="bg-zinc-50 p-8 rounded-lg border border-zinc-200 max-w-sm text-center shadow-sm">
                    <h2 className="text-lg font-bold text-zinc-900 mb-2">You have been logged out</h2>
                    <p className="text-sm text-zinc-500 mb-6">Please log in again to continue accessing your dashboard.</p>
                    <button
                        onClick={() => window.location.href = "/?auth=login"}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors w-full font-medium"
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }

    // Not authenticated or User missing
    if (user === null) {
        // If we are here, it means isAuthenticated is true (otherwise caught above), but user is missing.
        return (
            <div className="flex min-h-screen items-center justify-center bg-white flex-col gap-4">
                <LoadingAnimation message="Verifying account..." />

                {/* Debug Info */}
                <div className="bg-zinc-100 p-4 rounded text-xs text-left max-w-md border border-zinc-200">
                    <p className="font-bold mb-2">Debug Info:</p>
                    <DebugAuthInfo />
                </div>
                <div className="flex gap-4 text-sm">
                    <button onClick={() => window.location.href = "/"} className="text-zinc-500 hover:text-zinc-900 underline">Return Home</button>
                    <span className="text-zinc-300">|</span>
                    <button onClick={() => {
                        // Hard signOut via reloading with a specific hash or clearing cookies manually?
                        // Since we can't easily call signOut from here without the hook in a pure way (we have useConvexAuth but check if it provides signOut)
                        // simpler: redirect to logout route if exists, or use client side signout.
                        // For now, let's just use the convex auth signOut if we can.
                        // But we need useAuthActions.
                        window.location.href = "/?auth=signout";
                    }} className="text-red-500 hover:text-red-700 underline">
                        Sign Out / Reset
                    </button>
                </div>
            </div>
        );
    }

    // Authenticated - render dashboard
    return (
        <div className="min-h-screen bg-white">
            <TopBar
                onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isCollapsed={!isInitialLoad && window.innerWidth >= 768 ? isSidebarCollapsed : false}
            />


            <div className="flex pt-16 h-screen overflow-hidden">
                <Sidebar
                    isCollapsed={!isInitialLoad && window.innerWidth >= 768 ? isSidebarCollapsed : false}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <div
                    className={cn(
                        "flex-1 h-full overflow-y-auto bg-zinc-50 transition-all duration-200 ease-in-out",
                        isSidebarCollapsed ? "md:ml-16 delay-75" : "md:ml-64"
                    )}
                >
                    <SubscriptionBanner />
                    <main className="p-4 md:p-8 max-w-7xl mx-auto">
                        {children}
                    </main>
                </div>
            </div>

            {/* Onboarding: First Login Password Change (Students) */}
            {user && (
                <FirstLoginDialog
                    open={showPasswordDialog}
                    onComplete={() => {
                        setShowPasswordDialog(false);
                        // After password change, show tour if not completed
                        if (onboardingStatus && !onboardingStatus.hasCompletedTour) {
                            setShowTourDialog(true);
                        }
                    }}
                />
            )}

            {/* Onboarding: App Tour */}
            {user && (
                <AppTour
                    open={showTourDialog && !showPasswordDialog}
                    onComplete={() => setShowTourDialog(false)}
                    role={user.role as "parent" | "student" | "teacher" | "admin"}
                />
            )}
        </div>
    );
}
