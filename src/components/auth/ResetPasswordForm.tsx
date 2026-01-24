"use client";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

export function ResetPasswordForm({ email, onBack, onSuccess }: { email: string, onBack: () => void, onSuccess: () => void }) {
    const resetPassword = useMutation(api.auth_actions.resetPassword);

    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await resetPassword({ email, token, newPassword });

            toast.success("Password Reset", { description: "You can now login with your new password." });
            onSuccess();
        } catch (error) {
            toast.error("Reset Failed", { description: "Invalid code or expired." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full justify-center py-6 px-6 md:px-12 w-full max-w-lg mx-auto">
            <button
                onClick={onBack}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-2 mb-6 self-start"
            >
                <ArrowLeft className="h-4 w-4 fill-current" />
                Back
            </button>

            <div className="flex flex-col items-center space-y-3 text-center mb-8 shrink-0">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Reset Password</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                    Enter the code sent to {email} and choose a new password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center w-full space-y-6">
                <div className="space-y-5">
                    <FloatingInput
                        id="code"
                        label="Reset Code"
                        value={token}
                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                        required
                        disabled={isLoading}
                        className="tracking-widest text-center font-mono"
                    />

                    <div className="relative">
                        <FloatingInput
                            id="new-password"
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors z-10"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5 fill-current" /> : <Eye className="h-5 w-5 fill-current" />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-sm font-medium text-base"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Resetting...</span>
                        </div>
                    ) : (
                        "Set New Password"
                    )}
                </Button>
            </form>
        </div>
    );
}
