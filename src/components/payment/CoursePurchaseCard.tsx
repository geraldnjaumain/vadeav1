"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

interface CoursePurchaseCardProps {
    courseId: Id<"courses">;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    isEnrolled?: boolean;
}

export function CoursePurchaseCard({ courseId, title, description, price, imageUrl, isEnrolled }: CoursePurchaseCardProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Mutations
    const initiate = useMutation(api.payments.initiatePurchase);
    const simulateProcess = useMutation(api.payments.processSimulation);

    const handlePurchase = async () => {
        setIsLoading(true);
        try {
            // 1. Initiate
            const transactionId = await initiate({ courseId, amount: price, channel: "simulation" });

            // 2. Simulate external payment delay
            toast.info("Processing Payment...", { description: "Redirecting to secure gateway (Simulation)" });
            await new Promise(r => setTimeout(r, 2000));

            // 3. Confirm (Webhook simulation)
            await simulateProcess({ transactionId });

            toast.success("Payment Successful!", { description: `You have been enrolled in ${title}` });

            // Optional: Refresh page or redirect
            // window.location.reload(); 
        } catch (error: any) {
            console.error(error);
            toast.error("Payment Failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-full border-zinc-200 overflow-hidden">
            {imageUrl && (
                <div className="h-48 w-full bg-zinc-100 relative">
                    {/* Img would go here */}
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300">
                        Image Placeholder
                    </div>
                </div>
            )}
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
                    <Badge variant="secondary" className="whitespace-nowrap">
                        KES {price.toLocaleString()}
                    </Badge>
                </div>
                <CardDescription className="line-clamp-3">{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <ul className="text-sm text-zinc-500 space-y-1">
                    <li>• Full access to course materials</li>
                    <li>• Live lessons included</li>
                    <li>• Certificate of completion</li>
                </ul>
            </CardContent>
            <CardFooter>
                {isEnrolled ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Enrolled
                    </Button>
                ) : (
                    <Button
                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
                        onClick={handlePurchase}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Buy Now
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
