"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useEffect, Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

function AuthListenerContent() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const authParam = searchParams?.get("auth"); // 'login' | 'register' etc.
    const { signOut } = useAuthActions();

    useEffect(() => {
        if (authParam === "signout") {
            void signOut();
            router.replace("/");
        }
    }, [authParam, signOut, router]);

    // Fetch user to determine role for redirect
    const user = useQuery(api.users.currentUser);

    // Redirect authenticated users from landing page to dashboard
    useEffect(() => {
        if (pathname === "/" && user && authParam !== "signout") {
            const role = user.role;
            const target = role === 'parent' ? '/parent' :
                role === 'teacher' ? '/teacher' :
                    role === 'admin' ? '/admin' : '/student';
            router.push(target);
        }
    }, [pathname, user, router, authParam]);

    // Handler to clear param on close
    const handleAuthClose = () => {
        const params = new URLSearchParams(searchParams?.toString());
        params.delete("auth");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSuccess = () => {
        handleAuthClose();
        // Redirect based on role if applicable
        if (user) {
            const role = user.role;
            if (role === 'parent') router.push('/parent');
            else if (role === 'teacher') router.push('/teacher');
            else if (role === 'admin') router.push('/admin');
            else router.push('/student');
        } else {
            // Fallback if user query hasn't loaded yet?
            // Usually auth success implies user exists.
            // We can optimistically redirect to /parent or just reload
            // Ideally we wait for user. or we assume parent/student.
            router.push('/parent');
        }
    };

    return (
        <AuthDialog
            open={!!authParam}
            onOpenChange={(open) => {
                if (!open) handleAuthClose();
            }}
            onSuccess={handleSuccess}
            initialView={
                authParam === "register" ? "register-parent" :
                    authParam === "teacher" ? "register-teacher" :
                        authParam === "parent" ? "register-parent" :
                            authParam === "student" ? "student-login" :
                                "login"
            }
            trigger={null} // No trigger, controlled externally
        />
    );
}

export function NavbarAuthListener() {
    return (
        <Suspense fallback={null}>
            <AuthListenerContent />
        </Suspense>
    );
}
