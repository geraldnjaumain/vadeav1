"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Compass, ChevronRight, ChevronLeft, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TourStep {
    title: string;
    description: string;
    target?: string; // CSS selector
    position?: "top" | "bottom" | "left" | "right" | "center";
}

const parentTourSteps: TourStep[] = [
    {
        title: "Welcome to Vadea!",
        description: "Let's take a quick tour to help you get started with managing your children's education.",
        position: "center"
    },
    {
        title: "Your Dashboard",
        description: "Here you can see all your children's progress, upcoming lessons, and important updates at a glance.",
        target: "#dashboard-overview",
        position: "bottom"
    },
    {
        title: "Add Children",
        description: "Go to the Children section to add your kids. You'll get login credentials to share with them.",
        target: "#nav-children",
        position: "right"
    },
    {
        title: "Notifications",
        description: "Stay updated with important announcements and alerts from school.",
        target: "#nav-notifications",
        position: "left"
    },
    {
        title: "You're All Set!",
        description: "Start by adding your first child. If you need help, check out the Help Center in the sidebar.",
        position: "center"
    }
];

// ... (Keep other roles empty/placeholder for now but logically structure them same way)
const studentTourSteps: TourStep[] = [
    { title: "Welcome", description: "Your learning journey begins!", position: "center" },
    { title: "Courses", description: "Find your classes here.", target: "#nav-courses", position: "right" }
];
const teacherTourSteps: TourStep[] = [
    { title: "Welcome Teacher", description: "Manage your classroom effectively.", position: "center" }
];

interface AppTourProps {
    open: boolean;
    onComplete: () => void;
    role: "parent" | "student" | "teacher" | "admin";
}

export function AppTour({ open, onComplete, role }: AppTourProps) {
    const markComplete = useMutation(api.onboarding.markTourComplete);
    const [currentStep, setCurrentStep] = useState(0);
    const [rect, setRect] = useState<DOMRect | null>(null);

    const steps = role === "parent" ? parentTourSteps
        : role === "student" ? studentTourSteps
            : role === "teacher" ? teacherTourSteps
                : parentTourSteps;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    // Effect to find target and update rect
    useEffect(() => {
        if (!open) return;

        const updatePosition = () => {
            if (step.target) {
                const el = document.querySelector(step.target);
                if (el) {
                    const r = el.getBoundingClientRect();
                    // Ensure valid rect
                    if (r.width > 0 && r.height > 0) {
                        setRect(r);
                        return;
                    }
                }
            }
            setRect(null); // Fallback to center if not found
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [currentStep, step.target, open]);

    const handleNext = () => {
        if (isLastStep) handleComplete();
        else setCurrentStep(c => c + 1);
    };

    const handlePrev = () => setCurrentStep(c => Math.max(0, c - 1));

    const handleComplete = async () => {
        try {
            await markComplete();
            onComplete();
        } catch (e) { console.error(e); onComplete(); }
    };

    if (!open) return null;

    // Calculate Popover Position
    let popoverStyle: any = {};
    if (rect && step.position !== 'center') {
        const padding = 16;
        if (step.position === 'top') {
            popoverStyle = { top: rect.top - padding, left: rect.left + rect.width / 2, transform: "translate(-50%, -100%)" };
        } else if (step.position === 'bottom') {
            popoverStyle = { top: rect.bottom + padding, left: rect.left + rect.width / 2, transform: "translate(-50%, 0)" };
        } else if (step.position === 'left') {
            popoverStyle = { top: rect.top + rect.height / 2, left: rect.left - padding, transform: "translate(-100%, -50%)" };
        } else if (step.position === 'right') {
            popoverStyle = { top: rect.top + rect.height / 2, left: rect.right + padding, transform: "translate(0, -50%)" };
        }
    } else {
        // Center
        popoverStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60"
                    />

                    {/* Ring Highlight */}
                    {rect && (
                        <motion.div
                            layoutId="tour-ring"
                            initial={false}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            style={{
                                position: "absolute",
                                top: rect.top - 4,
                                left: rect.left - 4,
                                width: rect.width + 8,
                                height: rect.height + 8,
                            }}
                            className="rounded-lg ring-4 ring-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none"
                        />
                    )}

                    {/* Popover Card */}
                    <motion.div
                        className="absolute w-[360px] bg-white rounded-xl shadow-2xl p-5 border border-zinc-100"
                        style={popoverStyle}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Content */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <Compass className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-zinc-900">{step.title}</h3>
                                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{step.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex gap-1">
                                    {steps.map((_, i) => (
                                        <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === currentStep ? "w-6 bg-blue-600" : "w-1.5 bg-zinc-200")} />
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={handleComplete} className="text-zinc-400 hover:text-zinc-600">Skip</Button>
                                    {currentStep > 0 && <Button size="sm" variant="outline" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>}
                                    <Button size="sm" onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                                        {isLastStep ? "Finish" : <><span className="mr-1">Next</span><ChevronRight className="h-4 w-4" /></>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
