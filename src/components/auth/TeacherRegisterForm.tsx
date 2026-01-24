"use client";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

export function TeacherRegisterForm({ onSuccess }: { onSuccess?: () => void }) {
    const generateUploadUrl = useMutation(api.teachers.generateUploadUrl);
    const submitApplication = useMutation(api.teachers.submitApplication);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subjects: "",
        experience: ""
    });

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
            toast.error("Missing Fields", { description: "Please fill in all required fields." });
            return;
        }

        setIsLoading(true);
        try {
            let storageId = undefined;

            if (resumeFile) {
                // Step 1: Get a short-lived upload URL
                const postUrl = await generateUploadUrl();

                // Step 2: POST the file to the URL
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": resumeFile.type },
                    body: resumeFile,
                });

                if (!result.ok) throw new Error("Upload failed");
                const { storageId: id } = await result.json();
                storageId = id;
            }

            await submitApplication({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                subjects: formData.subjects,
                experience: formData.experience,
                resumeStorageId: storageId,
            });
            toast.success("Application Submitted", { description: "We will review your application and get back to you shortly." });

            setIsSuccessAnimating(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 3000);
        } catch (error) {
            console.error("Teacher application error:", error);
            toast.error("Submission Failed", { description: "Please try again later." });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccessAnimating) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <LoadingAnimation message="Submitting your application..." />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full justify-center py-6 px-6 md:px-12 w-full max-w-lg mx-auto">
            <div className="text-center mb-8 shrink-0">
                <h1 className="text-xl font-bold text-zinc-900">Become a Vadea Teacher</h1>
                <p className="text-zinc-500 text-sm mt-1">Join our mission to revolutionize education.</p>
            </div>

            <div className="flex-1 flex flex-col justify-center w-full space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <FloatingInput
                            id="firstName"
                            label="First Name"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <FloatingInput
                            id="lastName"
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <FloatingInput
                        id="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <FloatingInput
                        id="phone"
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <FloatingInput
                        id="subjects"
                        label="Subjects"
                        value={formData.subjects}
                        onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="experience" className="text-sm">Experience</Label>
                    <Textarea
                        id="experience"
                        placeholder="Describe your background..."
                        className="min-h-[80px] py-3"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm">Resume (PDF)</Label>
                    <label className="border border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-900 transition-colors bg-zinc-50/50 group">
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setResumeFile(file);
                            }}
                        />
                        <Upload className={cn("h-6 w-6 text-zinc-400 mb-2 group-hover:text-zinc-600", resumeFile && "text-blue-600")} />
                        <p className={cn("text-xs", resumeFile ? "text-blue-600 font-semibold" : "text-zinc-500")}>
                            {resumeFile ? resumeFile.name : "Click to Upload Resume (PDF/DOC)"}
                        </p>
                    </label>
                </div>

                <Button
                    className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-14 text-base mt-2"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Submit Application
                </Button>
            </div>
        </div>
    );
}
