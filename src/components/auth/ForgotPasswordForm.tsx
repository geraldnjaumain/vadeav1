"use client";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm({ onBack, onSuccess }: { onBack: () => void, onSuccess: (email: string) => void }) {
    const sendResetToken = useMutation(api.auth_actions.sendPasswordResetToken);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await sendResetToken({ email });
            toast.success("Code Sent", { description: "Check your email for the reset code." });
            onSuccess(email);
        } catch (error: any) {
            const msg = error.data?.message || error.message || "Failed to send code";
            toast.error(msg.includes("Account not found") ? "Account not found" : "Failed", {
                description: msg.includes("Account not found") ? "Please register first." : "Please try again."
            });
            console.error(error);
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
                Back to Login
            </button>

            <div className="flex flex-col items-center space-y-3 text-center mb-8 shrink-0">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Reset Password</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                    Enter your email to receive a reset code.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center w-full space-y-6">
                <div className="space-y-5">
                    <FloatingInput
                        id="reset-email"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-sm font-medium text-base"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sending...</span>
                        </div>
                    ) : (
                        "Send Reset Code"
                    )}
                </Button>
            </form>
        </div>
    );
}
