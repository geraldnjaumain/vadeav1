"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm({ onSuccess, onRegisterClick, onStudentLoginClick, onForgotPasswordClick }: { onSuccess?: () => void, onRegisterClick?: () => void, onStudentLoginClick?: () => void, onForgotPasswordClick?: () => void }) {
    const { signIn } = useAuthActions();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await signIn("password", { email, password, flow: "signIn" });

            setIsSuccessAnimating(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 3000);
        } catch (err: any) {
            console.error("[LoginForm] Sign in error:", err);
            setError(err.message || "Invalid email or password");
            setLoading(false);
        }
    };

    // We can also keep the student login click if it's a separate flow, 
    // but simplified for now to focus on WorkOS replacement.

    if (isSuccessAnimating) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <LoadingAnimation message="Signing you in..." />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full justify-center py-6 px-6 md:px-12 w-full max-w-lg mx-auto">
            <div className="flex flex-col items-center space-y-3 text-center mb-8 shrink-0">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome Back</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                    Sign in to access your Vadea dashboard.
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-center w-full space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}



                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
                    <div className="space-y-5">
                        <FloatingInput
                            id="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <div className="relative">
                            <FloatingInput
                                id="password"
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors z-10"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5 fill-current" /> : <Eye className="h-5 w-5 fill-current" />}
                            </button>
                            <button
                                type="button"
                                onClick={onForgotPasswordClick}
                                className="absolute right-0 top-full mt-2 text-xs text-zinc-500 hover:text-zinc-900 z-10 font-medium transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-sm font-medium text-base mt-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <div className="pt-4 space-y-4 text-center">
                    <p className="text-sm text-zinc-500">
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            onClick={onRegisterClick}
                            className="text-zinc-900 font-medium hover:underline focus:outline-none"
                        >
                            Sign up
                        </button>
                    </p>

                    <button
                        type="button"
                        onClick={onStudentLoginClick}
                        className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                        Are you a student? Log in here
                    </button>
                </div>

                <div className="mt-auto pt-6 text-center">
                    <p className="text-[10px] text-zinc-300">
                        Secure authentication
                    </p>
                </div>
            </div>
        </div>
    );
}
