"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useState } from "react";
import authAnimationData from "../../../public/animations/auth-illustration.json";
import welcomeAnimationData from "../../../public/animations/taxi-welcome-door.json";
import { LoginForm } from "./LoginForm";
import { ParentRegisterForm } from "./ParentRegisterForm";
import { RegisterOverview } from "./RegisterOverview";
import { TeacherRegisterForm } from "./TeacherRegisterForm";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import { StudentLoginForm } from "./StudentLoginForm";

import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

export type AuthView = "login" | "register-overview" | "register-parent" | "register-teacher" | "student-login" | "forgot-password" | "reset-password" | "parent-onboarding";

interface AuthCardProps {
    initialView?: AuthView;
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
    onSwitchToRegister?: () => void;
    onSwitchToParent?: () => void;
    onSwitchToTeacher?: () => void;
    onSwitchToStudent?: () => void;
    onSwitchToForgotPassword?: () => void;
    className?: string;
}

export function AuthCard({
    initialView = "login",
    onSuccess,
    onSwitchToLogin,
    onSwitchToRegister,
    onSwitchToParent,
    onSwitchToTeacher,
    onSwitchToStudent,
    onSwitchToForgotPassword,
    className
}: AuthCardProps) {
    const [view, setView] = useState<AuthView>(initialView);
    const [resetEmail, setResetEmail] = useState("");
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const handleSwitchToLogin = onSwitchToLogin || (() => setView("login"));
    // Default "Register" to "Parent Register" to skip selection screen as requested
    const handleSwitchToRegister = onSwitchToRegister || (() => setView("register-parent"));
    const handleSwitchToParent = onSwitchToParent || (() => setView("register-parent"));
    const handleSwitchToTeacher = onSwitchToTeacher || (() => setView("register-teacher"));
    const handleSwitchToStudent = onSwitchToStudent || (() => setView("student-login"));
    const handleSwitchToForgotPassword = onSwitchToForgotPassword || (() => setView("forgot-password"));

    const handleBack = () => {
        if (view === 'student-login' || view === 'forgot-password' || view === 'reset-password' || view === 'register-teacher') {
            handleSwitchToLogin();
        } else if (view === 'register-parent') {
            handleSwitchToLogin();
        } else {
            handleSwitchToRegister();
        }
    };

    // Content mapping for the side panel
    const sideContent = {
        "login": {
            quote: "Letting children craft their path.",
            color: "bg-blue-50",
            textColor: "text-blue-900",
            blurColor: "bg-blue-100",
            animation: authAnimationData
        },
        "student-login": {
            quote: "Unlock your potential.",
            color: "bg-indigo-50",
            textColor: "text-indigo-900",
            blurColor: "bg-indigo-100",
            animation: authAnimationData
        },
        "register-overview": {
            quote: "Join the Vadea community.",
            color: "bg-zinc-50",
            textColor: "text-zinc-900",
            blurColor: "bg-zinc-200",
            animation: authAnimationData
        },
        "register-parent": {
            quote: "Empower your child's future.",
            color: "bg-blue-50",
            textColor: "text-blue-900",
            blurColor: "bg-blue-100",
            animation: authAnimationData
        },
        "register-teacher": {
            quote: "Inspire the next generation.",
            color: "bg-slate-900",
            textColor: "text-white", // Dark theme for teachers
            blurColor: "bg-slate-700",
            animation: authAnimationData
        },
        "forgot-password": {
            quote: "We've got you covered.",
            color: "bg-zinc-50",
            textColor: "text-zinc-600",
            blurColor: "bg-zinc-200",
            animation: authAnimationData
        },
        "reset-password": {
            quote: "Secure your account.",
            color: "bg-zinc-50",
            textColor: "text-zinc-600",
            blurColor: "bg-zinc-200",
            animation: authAnimationData
        },
        "parent-onboarding": {
            quote: "Let's get to know you better.",
            color: "bg-zinc-50",
            textColor: "text-zinc-900",
            blurColor: "bg-blue-100",
            animation: welcomeAnimationData
        }
    };

    const currentContent = sideContent[view] || sideContent["login"];

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 min-h-[700px] w-full max-w-[1200px] transition-colors duration-500", isDesktop ? "rounded-xl overflow-hidden bg-white shadow-xl" : "bg-white", className)}>
            {/* Illustration Side - Desktop Only */}
            <div className={cn("hidden md:flex flex-col items-center justify-center p-12 text-center relative overflow-hidden transition-colors duration-500", currentContent.color)}>
                <div className={cn("absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full blur-3xl opacity-50 transition-colors duration-500", currentContent.blurColor)} />
                <div className={cn("absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full blur-3xl opacity-50 transition-colors duration-500", currentContent.blurColor)} />

                <div className="relative z-10 w-full max-w-[350px] aspect-square mb-8">
                    <Lottie
                        animationData={currentContent.animation}
                        loop={true}
                        className="w-full h-full"
                    />
                </div>
                <blockquote className="relative z-10 max-w-xs">
                    <p className={cn("text-2xl font-serif italic leading-relaxed transition-colors duration-500", currentContent.textColor)}>
                        "{currentContent.quote}"
                    </p>
                </blockquote>
            </div>

            {/* Content Side */}
            <div className="flex flex-col justify-center p-8 bg-white relative">
                {/* Back button */}
                {(view !== 'login' && view !== 'register-overview') && (
                    <button
                        onClick={handleBack}
                        className="absolute top-4 left-4 text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                    >
                        &larr; Back
                    </button>
                )}

                {view === "login" && (
                    <LoginForm
                        onSuccess={onSuccess}
                        onRegisterClick={handleSwitchToRegister}
                        onStudentLoginClick={handleSwitchToStudent}
                        onForgotPasswordClick={handleSwitchToForgotPassword}
                    />
                )}

                {view === "register-overview" && (
                    <RegisterOverview
                        onSuccess={() => { }}
                        onSelectParent={handleSwitchToParent}
                        onSelectTeacher={handleSwitchToTeacher}
                        onStudentLoginClick={handleSwitchToStudent}
                        onLoginClick={handleSwitchToLogin}
                    />
                )}

                {view === "register-parent" && (
                    <ParentRegisterForm
                        onSuccess={onSuccess}
                        onSwitchToTeacher={handleSwitchToTeacher}
                        onLoginClick={handleSwitchToLogin}
                        onStepChange={(step) => {
                            if (step === 2) setView("parent-onboarding");
                        }}
                    />
                )}

                {view === "parent-onboarding" && (
                    <ParentRegisterForm
                        key="parent-onboarding-form"
                        onSuccess={onSuccess}
                        onSwitchToTeacher={handleSwitchToTeacher}
                        onLoginClick={handleSwitchToLogin}
                        initialStep={2}
                        onStepChange={(step) => {
                            if (step === 1) setView("register-parent");
                        }}
                    />
                )}

                {view === "register-teacher" && (
                    <TeacherRegisterForm onSuccess={onSuccess} />
                )}

                {view === "student-login" && (
                    <StudentLoginForm onSuccess={onSuccess} />
                )}

                {view === "forgot-password" && (
                    <ForgotPasswordForm
                        onBack={handleSwitchToLogin}
                        onSuccess={(email) => {
                            setResetEmail(email);
                            setView("reset-password");
                        }}
                    />
                )}

                {view === "reset-password" && (
                    <ResetPasswordForm
                        email={resetEmail}
                        onBack={() => setView("forgot-password")}
                        onSuccess={() => {
                            handleSwitchToLogin();
                        }}
                    />
                )}
            </div>
        </div>
    );
}
