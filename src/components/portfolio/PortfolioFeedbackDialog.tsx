"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";

interface PortfolioFeedbackDialogProps {
    portfolioItemId: Id<"portfolio_items">;
    currentFeedback?: string;
    studentName?: string;
    itemTitle?: string;
    onSuccess?: () => void;
}

export function PortfolioFeedbackDialog({
    portfolioItemId,
    currentFeedback = "",
    studentName,
    itemTitle,
    onSuccess
}: PortfolioFeedbackDialogProps) {
    const [open, setOpen] = useState(false);
    const [feedback, setFeedback] = useState(currentFeedback);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateFeedback = useMutation(api.cbc.updatePortfolioFeedback);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!feedback.trim()) {
            toast.error("Please enter feedback");
            return;
        }

        setIsSubmitting(true);

        try {
            await updateFeedback({
                portfolioItemId,
                feedback: feedback.trim()
            });

            toast.success("Feedback added successfully");
            setOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error("Failed to add feedback:", error);
            toast.error("Failed to add feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    {currentFeedback ? "Edit Feedback" : "Add Feedback"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Teacher Feedback</DialogTitle>
                    <DialogDescription>
                        {studentName && itemTitle && (
                            <>Provide feedback for <strong>{studentName}</strong>'s work: "{itemTitle}"</>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="feedback">
                            Your Feedback <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Provide constructive feedback on the student's work. Highlight strengths and areas for improvement..."
                            rows={8}
                            className="resize-none"
                        />
                        <p className="text-xs text-zinc-500">
                            This feedback will be visible to the student and their parents.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Feedback"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
