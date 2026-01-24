"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, Sparkles, Eye, EyeOff } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { CreatingAccountLoader } from "@/components/ui/creating-account-loader";
import { LoadingDots } from "@/components/ui/loading-dots";

interface ParentRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToTeacher?: () => void;
    onLoginClick?: () => void;
    onStepChange?: (step: number) => void;
    initialStep?: number;
}

export function ParentRegisterForm({ onSuccess, onSwitchToTeacher, onLoginClick, onStepChange, initialStep = 1 }: ParentRegisterFormProps) {
    const [step, setStep] = useState(initialStep);
    const { signIn } = useAuthActions();
    const updateProfile = useMutation(api.users.updateProfile);
    const router = useRouter();
    const convex = useConvex();

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);

    // Registration State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [profileData, setProfileData] = useState({
        childrenCount: "",
        grade: "",
        lan: "", // Optional LAN
        goal: ""
    });

    // Custom Loading Component
    const LoadingSpinner = () => (
        <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
        </div>
    );

    const handleRegister = async () => {
        // Validation
        if (password.length < 8) {
            toast.error("Password too short", { description: "Password must be at least 8 characters long." });
            return;
        }

        setIsLoading(true);
        try {
            await signIn("password", { email, password, name, flow: "signUp" });
            setStep(2);
            if (onStepChange) onStepChange(2);
        } catch (error: any) {
            console.error("Registration error:", error);
            const message = error.message || "";
            // Broaden the check for existing accounts
            if (
                message.includes("already registered") ||
                message.includes("Unique constraint") ||
                message.includes("User already exists") ||
                message.includes("Email taken") ||
                message.includes("already exists")
            ) {
                toast.error("Account already exists", {
                    description: "This email is already registered. Please sign in instead.",
                    duration: 5000,
                });
            } else {
                toast.error("Registration Failed", {
                    description: message || "Could not create account. Please check your connection and try again."
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteProfile = async () => {
        if (!profileData.grade || !profileData.childrenCount) {
            toast.error("Missing Details", { description: "Please select a grade and number of children." });
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                childrenCount: profileData.childrenCount,
                grade: profileData.grade,
                lan: profileData.lan,
                educationGoal: profileData.goal,
            });

            toast.success("Welcome to Vadea!", { description: "Your dashboard is ready." });

            // Trigger animation
            setIsSuccessAnimating(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                // Redirect to the new "What would you like to do first?" onboarding flow
                router.push("/onboarding/choice");
            }, 3000); // Show animation for 3 seconds
        } catch (error: any) {
            toast.error("Profile Update Failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };



    // ... (in component)

    if (isSuccessAnimating) {
        return <CreatingAccountLoader />;
    }

    return (
        <div className="flex flex-col h-full justify-center py-6 px-6 md:px-12 w-full max-w-lg mx-auto">
            <div className="text-center mb-8 shrink-0">
                <h1 className="text-2xl font-bold text-zinc-900">
                    {step === 1 ? "Create Parent Account" : "Customize Experience"}
                </h1>
                <p className="text-zinc-500 text-sm mt-1">
                    {step === 1 ? "" : "Tailoring Vadea to the CBC Curriculum."}
                </p>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mt-4">
                    <div className={cn("h-1.5 w-12 rounded-full transition-colors", step >= 1 ? "bg-zinc-900" : "bg-zinc-200")} />
                    <div className={cn("h-1.5 w-12 rounded-full transition-colors", step >= 2 ? "bg-zinc-900" : "bg-zinc-200")} />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center w-full">
                {step === 1 && (
                    <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 w-full">


                        <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="w-full space-y-6">
                            <div className="space-y-5">
                                <FloatingInput
                                    id="name"
                                    label="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <FloatingInput
                                    id="email"
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <div className="space-y-2">
                                    <div className="relative">
                                        <FloatingInput
                                            id="password"
                                            label="Password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            // HTML5 validation as first line of defense
                                            minLength={8}
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
                                    </div>
                                    <p className={cn("text-xs transition-colors px-1",
                                        password.length > 0 && password.length < 8 ? "text-red-500 font-medium" : "text-zinc-500"
                                    )}>
                                        Must be at least 8 characters
                                    </p>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-zinc-900 text-white hover:bg-zinc-800 transition-all font-medium shadow-sm hover:shadow-md text-base mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? <div className="py-2"><LoadingDots color="bg-white" /></div> : "Sign Up"}
                            </Button>

                            <div className="space-y-4 text-center">
                                <p className="text-[10px] text-zinc-400 max-w-[200px] mx-auto leading-tight">
                                    By continuing, you agree to our <Link href="/terms" className="underline hover:text-zinc-600">Terms</Link> and <Link href="/privacy" className="underline hover:text-zinc-600">Privacy Policy</Link>.
                                </p>

                                <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
                                    <p className="text-xs text-zinc-500">
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={onLoginClick}
                                            className="font-semibold text-zinc-900 hover:underline"
                                        >
                                            Sign in
                                        </button>
                                    </p>

                                    {onSwitchToTeacher && (
                                        <div className="text-xs text-zinc-500">
                                            Looking to teach?{" "}
                                            <button
                                                type="button"
                                                onClick={onSwitchToTeacher}
                                                className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
                                            >
                                                Apply as a Teacher
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 w-full">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-zinc-900">What are your main goals?</h2>
                            <p className="text-sm text-zinc-500">Select goals based on your priority, with the first choice being top priority.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {["Holistic Development", "Remedial & Catch-up", "STEM & Digital Skills", "Creative Arts", "Homeschooling Support", "Exam Preparation"].map((goal) => (
                                <button
                                    key={goal}
                                    type="button"
                                    onClick={() => setProfileData({ ...profileData, goal })}
                                    className={cn(
                                        "p-4 rounded-xl border text-sm font-medium transition-all hover:bg-zinc-50 hover:border-zinc-300 text-center flex items-center justify-center h-20 shadow-sm",
                                        profileData.goal === goal
                                            ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 shadow-md"
                                            : "border-zinc-200 text-zinc-700 bg-white"
                                    )}
                                >
                                    {goal}
                                </button>
                            ))}
                        </div>

                        {/* Additional Inputs Compactly */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                            <div className="space-y-2">
                                <Label>Learner Grade</Label>
                                <Select
                                    value={profileData.grade}
                                    onValueChange={(val) => setProfileData({ ...profileData, grade: val })}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="h-11 bg-white">
                                        <SelectValue placeholder="Select Grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PP1">PP1 (Pre-Primary)</SelectItem>
                                        <SelectItem value="PP2">PP2 (Pre-Primary)</SelectItem>
                                        <SelectItem value="Grade 1">Grade 1</SelectItem>
                                        <SelectItem value="Grade 2">Grade 2</SelectItem>
                                        <SelectItem value="Grade 3">Grade 3</SelectItem>
                                        <SelectItem value="Grade 4">Grade 4</SelectItem>
                                        <SelectItem value="Grade 5">Grade 5</SelectItem>
                                        <SelectItem value="Grade 6">Grade 6</SelectItem>
                                        <SelectItem value="Grade 7">Grade 7</SelectItem>
                                        <SelectItem value="Grade 8">Grade 8</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Number of Learners</Label>
                                <Select
                                    value={profileData.childrenCount}
                                    onValueChange={(val) => setProfileData({ ...profileData, childrenCount: val })}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="h-11 bg-white">
                                        <SelectValue placeholder="Count" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Learner</SelectItem>
                                        <SelectItem value="2">2 Learners</SelectItem>
                                        <SelectItem value="3+">3+ Learners</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Assessment Number (LAN) <span className="text-zinc-400 font-normal">(Optional)</span></Label>
                            <Input
                                className="h-11 bg-white"
                                placeholder="e.g. KNEC Assessment Number"
                                value={profileData.lan}
                                onChange={(e) => setProfileData({ ...profileData, lan: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                className="bg-zinc-900 text-white hover:bg-zinc-800 h-12 px-8 font-medium shadow-lg hover:shadow-xl transition-all"
                                onClick={handleCompleteProfile}
                                disabled={isLoading}
                            >
                                {isLoading ? <div className="py-2"><LoadingDots color="bg-white" /></div> : "Next"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
