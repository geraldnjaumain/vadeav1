"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { toast } from "sonner";
import { BookOpen, Clock, Check, X, Trophy, Play, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentQuizzesPage() {
    const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [attemptResult, setAttemptResult] = useState<any>(null);

    const quizzes = useQuery(api.quizzes.getAvailableQuizzes);
    const quizData = useQuery(
        api.quizzes.getQuizForTaking,
        selectedQuiz ? { quizId: selectedQuiz._id } : "skip"
    );
    const submitQuiz = useMutation(api.quizzes.submitQuiz);
    const seedQuiz = useMutation(api.quizzes.seedDemoQuiz);

    const handleSelectAnswer = (questionId: string, answer: string) => {
        setAnswers({ ...answers, [questionId]: answer });
    };

    const handleSubmit = async () => {
        if (!quizData || !selectedQuiz) return;

        const answerArray = quizData.questions.map((q: any) => ({
            questionId: q._id,
            answer: answers[q._id] || "",
        }));

        try {
            const attemptId = await submitQuiz({ quizId: selectedQuiz._id, answers: answerArray });
            const score = Object.keys(answers).length; // Simplified for demo
            setShowResults(true);
            toast.success("Quiz submitted!");
        } catch (e: any) {
            toast.error(e.message || "Failed to submit quiz");
        }
    };

    const handleClose = () => {
        setSelectedQuiz(null);
        setCurrentQuestion(0);
        setAnswers({});
        setShowResults(false);
        setAttemptResult(null);
    };

    if (quizzes === undefined) {
        return <LoadingAnimation message="Loading quizzes..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Quizzes</h1>
                    <p className="text-zinc-500">Test your knowledge and earn points</p>
                </div>
                {quizzes.length === 0 && (
                    <Button variant="outline" onClick={() => seedQuiz()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Load Demo Quiz
                    </Button>
                )}
            </div>

            {quizzes.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-12 text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
                        <h3 className="font-semibold text-zinc-900">No quizzes available</h3>
                        <p className="text-zinc-500">Check back later for new quizzes</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz: any) => (
                        <Card key={quiz._id} className="hover:border-blue-300 transition-all">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                    {quiz.attempt?.passed && (
                                        <Badge className="bg-green-100 text-green-700">Passed</Badge>
                                    )}
                                    {quiz.attempt && !quiz.attempt.passed && (
                                        <Badge variant="destructive">Failed</Badge>
                                    )}
                                </div>
                                <CardDescription>{quiz.subject}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-zinc-500">
                                    {quiz.timeLimit && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {quiz.timeLimit} min
                                        </div>
                                    )}
                                    <div>Pass: {quiz.passingScore}%</div>
                                </div>
                                {quiz.attempt ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Your Score</span>
                                            <span className="font-bold">
                                                {Math.round((quiz.attempt.score / quiz.attempt.totalPoints) * 100)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={(quiz.attempt.score / quiz.attempt.totalPoints) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={() => setSelectedQuiz(quiz)}
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Start Quiz
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Quiz Taking Dialog */}
            <Dialog open={!!selectedQuiz && !showResults} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {quizData === undefined ? (
                        <LoadingAnimation message="Loading quiz..." />
                    ) : quizData?.questions?.length > 0 ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>{quizData.quiz.title}</DialogTitle>
                                <div className="flex items-center gap-4 text-sm text-zinc-500">
                                    <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
                                    <Progress
                                        value={((currentQuestion + 1) / quizData.questions.length) * 100}
                                        className="w-32 h-2"
                                    />
                                </div>
                            </DialogHeader>

                            <div className="py-6">
                                <p className="text-lg font-medium mb-6">
                                    {quizData.questions[currentQuestion].questionText}
                                </p>

                                <div className="space-y-3">
                                    {quizData.questions[currentQuestion].options?.map((option: string, i: number) => {
                                        const questionId = quizData.questions[currentQuestion]._id;
                                        const isSelected = answers[questionId] === option;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleSelectAnswer(questionId, option)}
                                                className={cn(
                                                    "w-full p-4 rounded-lg border text-left transition-all",
                                                    isSelected
                                                        ? "border-blue-500 bg-blue-50 text-blue-900"
                                                        : "border-zinc-200 hover:border-blue-300"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                                                        isSelected ? "border-blue-500 bg-blue-500" : "border-zinc-300"
                                                    )}>
                                                        {isSelected && <Check className="h-4 w-4 text-white" />}
                                                    </div>
                                                    {option}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <DialogFooter className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                    disabled={currentQuestion === 0}
                                >
                                    Previous
                                </Button>
                                {currentQuestion < quizData.questions.length - 1 ? (
                                    <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                                        Next
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit}>
                                        Submit Quiz
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    ) : (
                        <div className="py-8 text-center text-zinc-500">
                            This quiz has no questions yet.
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Results Dialog */}
            <Dialog open={showResults} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent>
                    <div className="py-8 text-center">
                        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <Trophy className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Quiz Completed!</h2>
                        <p className="text-zinc-500 mb-6">Great job completing the quiz</p>
                        <Button onClick={handleClose}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
