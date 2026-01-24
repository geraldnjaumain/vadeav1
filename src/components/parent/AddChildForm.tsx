"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Copy, Check, User, GraduationCap, Brain, Heart, Accessibility, Settings2 } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";
import { cn } from "@/lib/utils";

export function AddChildForm({ onSuccess }: { onSuccess?: () => void }) {
    const createChild = useMutation(api.parent_actions.createChildAccount);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState({ username: "", password: "" });
    const [formData, setFormData] = useState<{
        name: string;
        grade: string;
        learningStyle?: string;
        interests?: string[];
        specialNeeds?: string;
    }>({
        name: "",
        grade: "",
    });
    const [hasCopied, setHasCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Server generates username and password automatically
            const result = await createChild({
                name: formData.name,
                grade: formData.grade,
                learningStyle: formData.learningStyle,
                interests: formData.interests,
                specialNeeds: formData.specialNeeds,
            });
            // Use server-generated credentials from response
            setCreatedCredentials({ username: result.username, password: result.generatedPassword });
            setIsSuccess(true);
        } catch (error) {
            toast.error("Could not add child", { description: "Username might be taken." });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        const creds = createdCredentials as any;
        const text = `Vadea Student Login\n-------------------\nAdmission No: ${creds.admissionNumber}\nEmail: ${creds.username}\nPassword: ${creds.password}`;
        navigator.clipboard.writeText(text);
        setHasCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setHasCopied(false), 2000);
    };

    if (isSuccess) {
        return (
            <div className="space-y-8 max-w-lg mx-auto bg-white p-8 rounded-2xl border border-zinc-100 shadow-xl shadow-zinc-100/50 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50 scale-150" />
                    <div className="relative h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                        <Check className="h-10 w-10 text-white" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-2xl text-zinc-900 tracking-tight">Student Account Ready</h3>
                    <p className="text-zinc-500">The account has been created successfully.<br />Please save these details safely.</p>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 text-left space-y-4 shadow-inner">
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-200/60">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 p-1 rounded">ID</span> Admission No
                        </span>
                        <p className="font-mono text-lg font-bold text-zinc-900">{(createdCredentials as any).admissionNumber}</p>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-200/60">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-3 h-3" /> Student Email
                        </span>
                        <p className="font-mono text-sm font-bold text-zinc-900 break-all text-right pl-4">{createdCredentials.username}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> Password
                        </span>
                        <p className="font-mono text-lg font-bold text-zinc-900 tracking-wide">{createdCredentials.password}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={copyToClipboard}
                        className="w-full gap-2 border-zinc-200 h-12 text-zinc-700 font-medium hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                    >
                        {hasCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        {hasCopied ? "Copied to clipboard" : "Copy Login Details"}
                    </Button>
                    <Button
                        onClick={() => onSuccess?.()}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-12 font-semibold shadow-lg shadow-zinc-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Done & Continue
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-2xl border border-zinc-100 shadow-2xl shadow-zinc-200/40 relative">

            <div className="space-y-2 mb-8">
                <h3 className="font-bold text-2xl flex items-center gap-3 text-zinc-900">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Add New Student
                </h3>
                <p className="text-zinc-500 ml-14">
                    Create a profile to track their progress and assignments.
                </p>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                        <Label className="text-zinc-700 text-sm font-semibold">Student Name</Label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                            <Input
                                required
                                className="h-11 pl-10 bg-zinc-50/50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <Label className="text-zinc-700 text-sm font-semibold">Grade Level</Label>
                        <div className="relative">
                            <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 z-10" />
                            <Select required onValueChange={(val) => setFormData({ ...formData, grade: val })} disabled={isLoading}>
                                <SelectTrigger className="h-11 pl-10 bg-white border-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all">
                                    <SelectValue placeholder="Select Grade" />
                                </SelectTrigger>
                                <SelectContent>
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
                    </div>
                </div>

                {/* Child Questionnaire Section */}
                <div className="space-y-6 pt-6 border-t border-zinc-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings2 className="h-4 w-4 text-zinc-500" />
                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Personalize Experience</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-zinc-700 text-sm font-semibold">Learning Style <span className="text-zinc-400 font-normal text-xs ml-1">(Optional)</span></Label>
                            <div className="relative">
                                <Brain className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 z-10" />
                                <Select onValueChange={(val) => setFormData({ ...formData, learningStyle: val })} disabled={isLoading}>
                                    <SelectTrigger className="h-11 pl-10 bg-white border-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all">
                                        <SelectValue placeholder="Select Style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="visual">Visual (Seeing)</SelectItem>
                                        <SelectItem value="auditory">Auditory (Listening)</SelectItem>
                                        <SelectItem value="kinesthetic">Kinesthetic (Doing)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-zinc-700 text-sm font-semibold">Special Needs <span className="text-zinc-400 font-normal text-xs ml-1">(Optional)</span></Label>
                            <div className="relative">
                                <Accessibility className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                <Input
                                    className="h-11 pl-10 bg-white border-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="Any accommodations?"
                                    onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <Label className="text-zinc-700 text-sm font-semibold">Interests & Hobbies <span className="text-zinc-400 font-normal text-xs ml-1">(Optional)</span></Label>
                        <div className="relative">
                            <Heart className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                            <Input
                                className="h-11 pl-10 bg-white border-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="e.g. Dinosaurs, Space, Drawing"
                                onChange={(e) => setFormData({
                                    ...formData,
                                    interests: e.target.value.split(',').map(i => i.trim()).filter(i => i)
                                })}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
                <Button
                    type="submit"
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-14 rounded-xl font-bold shadow-xl shadow-zinc-900/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 text-base"
                    disabled={isLoading}
                >
                    {isLoading ? <LoadingDots color="bg-white" className="mr-2" /> : "Create Student Account"}
                </Button>
            </div>
        </form>
    );
}

