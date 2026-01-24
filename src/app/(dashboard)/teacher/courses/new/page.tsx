"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, BookOpen, Users, DollarSign, Loader2 } from "lucide-react";

const STEPS = [
    { id: 1, name: "Basic Info", icon: BookOpen },
    { id: 2, name: "Target Audience", icon: Users },
    { id: 3, name: "Pricing", icon: DollarSign },
];

const GRADE_LEVELS = [
    "PP1", "PP2", 
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
    "Grade 7", "Grade 8", "Grade 9"
];

const SUBJECTS = [
    "Mathematics", "English", "Kiswahili", "Science", "Social Studies",
    "Creative Arts", "Religious Education", "Physical Education", "Music"
];

export default function NewCoursePage() {
    const router = useRouter();
    const createCourse = useMutation(api.courses.createCourse);
    
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        gradeLevel: "",
        subject: "",
        price: 0,
    });

    const updateField = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.title.trim().length > 0 && formData.description.trim().length > 0;
            case 2:
                return formData.gradeLevel !== "" && formData.subject !== "";
            case 3:
                return formData.price >= 0;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Combine grade level and subject into description if desired
            const fullDescription = `[${formData.gradeLevel} - ${formData.subject}] ${formData.description}`;
            
            const courseId = await createCourse({
                title: formData.title,
                description: fullDescription,
                price: formData.price,
            });

            toast.success("Course created successfully!");
            router.push(`/teacher/courses/${courseId}`);
        } catch (error) {
            console.error("Failed to create course:", error);
            toast.error("Failed to create course. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Create New Course</h1>
                <p className="text-muted-foreground">Set up your course in a few simple steps.</p>
            </div>

            {/* Step Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div 
                                        className={`
                                            w-10 h-10 rounded-full flex items-center justify-center border-2
                                            ${isActive ? 'border-primary bg-primary text-primary-foreground' : ''}
                                            ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                                            ${!isActive && !isCompleted ? 'border-muted-foreground/30 text-muted-foreground' : ''}
                                        `}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <StepIcon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span className={`text-xs mt-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                        {step.name}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={`h-0.5 w-16 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {currentStep === 1 && "Course Basics"}
                        {currentStep === 2 && "Target Audience"}
                        {currentStep === 3 && "Set Pricing"}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 1 && "Give your course a compelling title and description."}
                        {currentStep === 2 && "Define who this course is for."}
                        {currentStep === 3 && "Set the price for your course."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input 
                                    id="title"
                                    placeholder="e.g., Grade 6 Mathematics Mastery"
                                    value={formData.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description"
                                    placeholder="Describe what students will learn in this course..."
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Target Audience */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gradeLevel">Grade Level</Label>
                                <Select 
                                    value={formData.gradeLevel} 
                                    onValueChange={(value) => updateField("gradeLevel", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GRADE_LEVELS.map(grade => (
                                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Select 
                                    value={formData.subject} 
                                    onValueChange={(value) => updateField("subject", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SUBJECTS.map(subject => (
                                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Pricing */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (KES)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">KES</span>
                                    <Input 
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="100"
                                        placeholder="0"
                                        className="pl-12"
                                        value={formData.price || ""}
                                        onChange={(e) => updateField("price", parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Set to 0 for a free course. You can change this later.
                                </p>
                            </div>
                            
                            {/* Summary */}
                            <Card className="bg-muted/50 mt-6">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Course Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p><span className="text-muted-foreground">Title:</span> {formData.title}</p>
                                    <p><span className="text-muted-foreground">Grade:</span> {formData.gradeLevel}</p>
                                    <p><span className="text-muted-foreground">Subject:</span> {formData.subject}</p>
                                    <p><span className="text-muted-foreground">Price:</span> KES {formData.price.toLocaleString()}</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
                <Button 
                    variant="outline" 
                    onClick={handleBack}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                
                {currentStep < STEPS.length ? (
                    <Button 
                        onClick={handleNext}
                        disabled={!canProceed()}
                    >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button 
                        onClick={handleSubmit}
                        disabled={!canProceed() || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Create Course
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
