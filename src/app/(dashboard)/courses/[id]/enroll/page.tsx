"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, Clock, User, Phone, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CourseEnrollPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as Id<"courses">;

    const course = useQuery(api.courses.get, { id: courseId });
    const initiatePurchase = useMutation(api.payments.initiatePurchase);
    const initiateSTK = useAction(api.payments.initiateSTKPush);
    const processSimulation = useMutation(api.payments.processSimulation);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [phone, setPhone] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");

    const handlePayment = async () => {
        if (!course || !phone) return;

        // Validate Kenyan phone number
        const phoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/;
        if (!phoneRegex.test(phone)) {
            toast.error("Please enter a valid Kenyan phone number");
            return;
        }

        // Format phone to 254 format
        let formattedPhone = phone.replace(/^\+/, "");
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "254" + formattedPhone.slice(1);
        }
        if (!formattedPhone.startsWith("254")) {
            formattedPhone = "254" + formattedPhone;
        }

        setIsProcessing(true);
        setPaymentStatus("processing");

        try {
            // Create pending transaction
            const txId = await initiatePurchase({
                courseId,
                amount: course.price,
                channel: "mpesa",
                phone: formattedPhone,
            });

            // For demo: use simulation instead of real STK push
            // In production, you'd call: await initiateSTK({ transactionId: txId, phone: formattedPhone, amount: course.price });

            // Simulate STK push (in dev environment)
            toast.info("Check your phone for M-Pesa prompt...");

            // Wait for 3 seconds then simulate success
            await new Promise(resolve => setTimeout(resolve, 3000));
            await processSimulation({ transactionId: txId });

            setPaymentStatus("success");
            toast.success("Payment successful! You are now enrolled.");

            // Redirect after success
            setTimeout(() => {
                router.push("/student/courses");
            }, 2000);
        } catch (error: unknown) {
            console.error("Payment failed:", error);
            setPaymentStatus("failed");
            const errorMessage = error instanceof Error ? error.message : "Payment failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    if (course === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (course === null) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">Course not found</h2>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Header */}
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {course.title}
                    </CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Course Details */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-bold text-lg">KES {course.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span>{course.isPublished ? "Available" : "Coming Soon"}</span>
                        </div>
                    </div>

                    {/* Enroll Button */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="w-full" disabled={!course.isPublished}>
                                {course.price === 0 ? "Enroll for Free" : `Pay KES ${course.price.toLocaleString()}`}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Complete Your Enrollment</DialogTitle>
                                <DialogDescription>
                                    Pay via M-Pesa to access this course
                                </DialogDescription>
                            </DialogHeader>

                            {paymentStatus === "success" ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                                    <h3 className="text-lg font-semibold text-green-700">Payment Successful!</h3>
                                    <p className="text-muted-foreground mt-2">
                                        You have been enrolled in {course.title}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-4">
                                    <div className="bg-muted/50 rounded-lg p-4">
                                        <div className="flex justify-between text-sm">
                                            <span>Course:</span>
                                            <span className="font-medium">{course.title}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mt-2">
                                            <span>Amount:</span>
                                            <span className="font-bold">KES {course.price.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            M-Pesa Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            placeholder="e.g., 0712345678"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            disabled={isProcessing}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            You will receive an M-Pesa prompt on this number
                                        </p>
                                    </div>

                                    <Button
                                        onClick={handlePayment}
                                        disabled={!phone || isProcessing}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Pay KES {course.price.toLocaleString()}
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground">
                                        By proceeding, you agree to our Terms of Service
                                    </p>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}
