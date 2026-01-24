"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import { useRouter } from "next/navigation";

export default function BecomeTeacherPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
            <AuthCard
                initialView="register-teacher"
                onSwitchToLogin={() => router.push("/sign-in")}
                onSwitchToRegister={() => router.push("/register")} // Back buttons
                onSuccess={() => router.push("/")}
            />
        </div>
    );
}
