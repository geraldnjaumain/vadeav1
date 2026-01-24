"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff, Check, AlertTriangle } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

interface FirstLoginDialogProps {
    open: boolean;
    onComplete: () => void;
}

export function FirstLoginDialog({ open, onComplete }: FirstLoginDialogProps) {
    const changePassword = useMutation(api.onboarding.changePasswordFirstLogin);
    const skipChange = useMutation(api.onboarding.skipPasswordChange);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const passwordValid = password.length >= 8;
    const passwordsMatch = password === confirmPassword && password !== "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!passwordValid) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            await changePassword({ newPassword: password });
            toast.success("Password updated successfully!");
            onComplete();
        } catch (err: any) {
            setError(err.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = async () => {
        setIsLoading(true);
        try {
            await skipChange();
            onComplete();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                        <KeyRound className="h-6 w-6 text-amber-600" />
                    </div>
                    <DialogTitle className="text-xl">Welcome to Vadea!</DialogTitle>
                    <DialogDescription>
                        For your security, please create a new password that only you know.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                className="h-11 pr-10"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {password && (
                            <div className="flex items-center gap-1.5 text-xs">
                                {passwordValid ? (
                                    <><Check className="h-3 w-3 text-green-600" /><span className="text-green-600">Strong password</span></>
                                ) : (
                                    <><AlertTriangle className="h-3 w-3 text-amber-500" /><span className="text-amber-600">Too short</span></>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                className="h-11 pr-10"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {confirmPassword && (
                            <div className="flex items-center gap-1.5 text-xs">
                                {passwordsMatch ? (
                                    <><Check className="h-3 w-3 text-green-600" /><span className="text-green-600">Passwords match</span></>
                                ) : (
                                    <><AlertTriangle className="h-3 w-3 text-red-500" /><span className="text-red-600">Passwords don't match</span></>
                                )}
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                    )}

                    <div className="flex flex-col gap-2 pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading || !passwordValid || !passwordsMatch}
                            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800"
                        >
                            {isLoading ? <LoadingDots color="bg-white" /> : "Set New Password"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleSkip}
                            disabled={isLoading}
                            className="text-zinc-500 hover:text-zinc-700"
                        >
                            Skip for now
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
