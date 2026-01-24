"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, GraduationCap, Eye, EyeOff } from "lucide-react";

export function StudentLoginForm({ onSuccess }: { onSuccess?: () => void }) {
    const { signIn } = useAuthActions();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        try {
            // Use the standard 'student' provider with our specific flow
            await signIn("student", { username, password, flow: "signIn" });
            toast.success("Welcome back!");
            onSuccess?.();
            router.push("/student");
        } catch (err) {
            console.error(err);
            setError("Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full justify-center py-6 px-6 md:px-12 w-full max-w-lg mx-auto">
            <div className="flex flex-col items-center space-y-3 text-center mb-8 shrink-0">
                <h3 className="text-2xl font-bold tracking-tight text-blue-950">Student Portal</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                    Log in with the credentials set by your parent.
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-center w-full space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm text-center font-medium animate-in fade-in slide-in-from-top-1">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        <FloatingInput
                            id="username"
                            label="Username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-0 h-full px-3 py-2 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors z-10"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 fill-current" />
                                ) : (
                                    <Eye className="h-5 w-5 fill-current" />
                                )}
                            </button>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-14 bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm font-medium text-base mt-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            "Enter Class"
                        )}
                    </Button>
                </form>

                <div className="mt-auto pt-6 text-center">
                    <p className="text-[10px] text-zinc-400">
                        Protected by Vadea Secure Login
                    </p>
                </div>
            </div>
        </div>
    );
}
