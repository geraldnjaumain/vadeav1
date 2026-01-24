"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function QuizRunnerPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id as Id<"quizzes">;

    // Queries (Mocking api structure if assumed)
    // If api.quizzes.getWithQuestions doesn't exist, we might need separate calls.
    // Assuming standard 'get' + 'questions' pattern or a composite.
    const quiz = useQuery(api.quizzes.get as any, { id: quizId });
    const questions = useQuery(api.quizzes.getQuestions as any, { quizId });

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < (questions?.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Mock submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Actual: await submitQuiz({ quizId, answers });
            setIsComplete(true);
            toast.success("Quiz submitted successfully!");
        } catch (error) {
            toast.error("Failed to submit quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (quiz === undefined || questions === undefined) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!quiz) {
        return <div className="flex h-screen items-center justify-center">Quiz not found</div>;
    }

    if (isComplete) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl mb-2">Quiz Completed!</CardTitle>
                    <p className="text-zinc-500 mb-8">Great job completing {quiz.title}. Your results will be available shortly.</p>
                    <Button asChild className="w-full">
                        <Link href="/student/dashboard">Return to Dashboard</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <Logo className="h-8" />
                    <div className="h-6 w-px bg-zinc-200" />
                    <h1 className="font-semibold text-zinc-900 truncate max-w-[200px] md:max-w-md">{quiz.title}</h1>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/student/dashboard" className="text-zinc-500">Exit Quiz</Link>
                </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
                <div className="mb-8 space-y-2">
                    <div className="flex justify-between text-sm font-medium text-zinc-500">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <span>{Math.round(progress)}% completed</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-zinc-200" />
                </div>

                <Card className="shadow-lg border-zinc-200">
                    <CardContent className="p-6 md:p-10 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-xl md:text-2xl font-medium text-zinc-900 leading-relaxed">
                                {currentQuestion.questionText}
                            </h2>
                        </div>

                        {currentQuestion.questionType === "mcq" && (
                            <RadioGroup
                                value={answers[currentQuestion._id] || ""}
                                onValueChange={(val) => handleAnswer(currentQuestion._id, val)}
                                className="space-y-3"
                            >
                                {currentQuestion.options?.map((option: string, idx: number) => (
                                    <div key={idx} className={`flex items-center space-x-3 border rounded-lg p-4 transition-colors ${answers[currentQuestion._id] === option ? 'border-primary bg-primary/5' : 'hover:bg-zinc-50'}`}>
                                        <RadioGroupItem value={option} id={`opt-${idx}`} />
                                        <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-normal text-base">{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}

                        {/* Fallback for other types */}
                        {currentQuestion.questionType !== "mcq" && (
                            <p className="text-zinc-500 italic">Not supported in this preview.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Footer Navigation */}
                <div className="flex justify-between mt-8">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className="w-32"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || Object.keys(answers).length < questions.length}
                            className="w-32 bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            className="w-32"
                        // disabled={!answers[currentQuestion._id]} // Optional: force answer
                        >
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}
