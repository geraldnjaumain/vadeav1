"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioFeedbackDialog } from "@/components/portfolio/PortfolioFeedbackDialog";
import {
    FolderOpenIcon,
    ChatBubbleLeftIcon,
    CheckCircleIcon
} from "@heroicons/react/24/solid";

export default function TeacherPortfolioReviewPage() {
    const portfolioItems = useQuery(api.portfolio_management.getPortfolioItemsForReview, {});
    const user = useQuery(api.users.currentUser);

    if (user === undefined || portfolioItems === undefined) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    const needingFeedback = portfolioItems.filter(item => !item.feedback);
    const withFeedback = portfolioItems.filter(item => item.feedback);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Portfolio Review</h1>
                <p className="text-zinc-500 mt-1">
                    Review student portfolio items and provide feedback
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FolderOpenIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">
                                    {portfolioItems.length}
                                </p>
                                <p className="text-sm text-zinc-500">Total Items</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <ChatBubbleLeftIcon className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">
                                    {needingFeedback.length}
                                </p>
                                <p className="text-sm text-zinc-500">Needs Feedback</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900">
                                    {withFeedback.length}
                                </p>
                                <p className="text-sm text-zinc-500">Reviewed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Needs Feedback Section */}
            {needingFeedback.length > 0 && (
                <Card className="border-orange-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ChatBubbleLeftIcon className="h-5 w-5 text-orange-600" />
                            Needs Feedback ({needingFeedback.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {needingFeedback.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-start justify-between p-4 border border-zinc-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-medium text-zinc-900">
                                                {item.title}
                                            </h3>
                                            <Badge variant="outline" className="text-xs">
                                                {item.type}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-zinc-600 mb-2">
                                            {item.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <img
                                                    src={item.studentImage || "/default-avatar.png"}
                                                    alt={item.studentName}
                                                    className="h-5 w-5 rounded-full"
                                                />
                                                {item.studentName}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {new Date(item.submittedAt).toLocaleDateString()}
                                            </span>
                                            {item.attachments && item.attachments.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span>{item.attachments.length} attachment(s)</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <PortfolioFeedbackDialog
                                        portfolioItemId={item._id}
                                        studentName={item.studentName}
                                        itemTitle={item.title}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reviewed Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        Reviewed ({withFeedback.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {withFeedback.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            <CheckCircleIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No reviewed items yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {withFeedback.map((item) => (
                                <div
                                    key={item._id}
                                    className="p-4 border border-zinc-200 rounded-lg"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-zinc-900">
                                                    {item.title}
                                                </h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {item.type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                <span className="flex items-center gap-1">
                                                    <img
                                                        src={item.studentImage || "/default-avatar.png"}
                                                        alt={item.studentName}
                                                        className="h-5 w-5 rounded-full"
                                                    />
                                                    {item.studentName}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {new Date(item.submittedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <PortfolioFeedbackDialog
                                            portfolioItemId={item._id}
                                            currentFeedback={item.feedback}
                                            studentName={item.studentName}
                                            itemTitle={item.title}
                                        />
                                    </div>
                                    {item.feedback && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                                            <p className="text-sm text-green-800 italic">
                                                "{item.feedback}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
