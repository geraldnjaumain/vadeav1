"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Target, Gift, Zap, MessageCircle, BookOpen, Loader2, Check, Sparkles, Award } from "lucide-react";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { WidgetSkeleton } from "@/components/ui/skeleton";

const challengeIcons: Record<string, React.ElementType> = {
    quiz: Zap,
    forum: MessageCircle,
    lesson: BookOpen,
    cbc_competency: Target,
    portfolio: Target,
};

export function DailyChallengesWidget() {
    const data = useQuery(api.challenges.getDailyChallenges);
    const claimReward = useMutation(api.challenges.claimReward);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [justClaimed, setJustClaimed] = useState<string | null>(null);

    if (!data) {
        return <WidgetSkeleton />;
    }

    const { challenges, user } = data;

    if (!user || challenges.length === 0) {
        return (
            <Card className="border-zinc-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        Daily Challenges
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8 text-zinc-500">
                    <Target className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No challenges available today.</p>
                </CardContent>
            </Card>
        );
    }

    const handleClaim = async (challengeId: Id<"daily_challenges">) => {
        setClaimingId(challengeId);
        try {
            const result = await claimReward({ challengeId });
            setJustClaimed(challengeId);
            setTimeout(() => setJustClaimed(null), 2000);
        } catch (err) {
            console.error("Failed to claim reward:", err);
        } finally {
            setClaimingId(null);
        }
    };

    const xpProgress = user.xpForNextLevel > 0
        ? Math.round((user.xp / user.xpForNextLevel) * 100)
        : 0;

    return (
        <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-zinc-100">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-500 fill-orange-500" />
                        Daily Challenges
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                            <Sparkles className="h-3.5 w-3.5" />
                            Level {user.level}
                        </div>
                    </div>
                </div>
                {/* XP Progress Bar */}
                <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-500">
                        <span>{user.xp} XP</span>
                        <span>{user.xpForNextLevel} XP to Level {user.level + 1}</span>
                    </div>
                    <Progress value={xpProgress} className="h-2" />
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
                {challenges.map((challenge) => {
                    const Icon = challengeIcons[challenge.type] || Target;
                    const progressPercent = Math.min(
                        (challenge.currentProgress / challenge.requiredCount) * 100,
                        100
                    );
                    const isComplete = challenge.isCompleted;
                    const isClaimed = challenge.isClaimed;
                    const isClaiming = claimingId === challenge._id;
                    const wasJustClaimed = justClaimed === challenge._id;

                    return (
                        <div
                            key={challenge._id}
                            className={cn(
                                "p-3 rounded-lg border transition-all",
                                isClaimed
                                    ? "bg-zinc-50 border-zinc-200 opacity-60"
                                    : isComplete
                                        ? "bg-green-50 border-green-200"
                                        : "bg-white border-zinc-200 hover:border-zinc-300"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                                        isClaimed
                                            ? "bg-zinc-200 text-zinc-500"
                                            : isComplete
                                                ? "bg-green-100 text-green-600"
                                                : "bg-orange-100 text-orange-600"
                                    )}
                                >
                                    {isClaimed ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Icon className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="font-medium text-sm text-zinc-900 truncate">
                                            {challenge.title}
                                        </h4>
                                        <span
                                            className={cn(
                                                "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
                                                isClaimed
                                                    ? "bg-zinc-200 text-zinc-500"
                                                    : "bg-amber-100 text-amber-700"
                                            )}
                                        >
                                            +{challenge.rewardXP} XP
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {challenge.description}
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between text-xs text-zinc-500">
                                            <span>
                                                {challenge.currentProgress}/{challenge.requiredCount}
                                            </span>
                                            <span>{Math.round(progressPercent)}%</span>
                                        </div>
                                        <Progress
                                            value={progressPercent}
                                            className={cn(
                                                "h-1.5",
                                                isComplete && !isClaimed && "[&>div]:bg-green-500"
                                            )}
                                        />
                                    </div>
                                    {isComplete && !isClaimed && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleClaim(challenge._id)}
                                            disabled={isClaiming}
                                            className={cn(
                                                "mt-2 h-7 text-xs gap-1.5",
                                                wasJustClaimed
                                                    ? "bg-green-600 hover:bg-green-600"
                                                    : "bg-amber-500 hover:bg-amber-600"
                                            )}
                                        >
                                            {isClaiming ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : wasJustClaimed ? (
                                                <>
                                                    <Check className="h-3 w-3" />
                                                    Claimed!
                                                </>
                                            ) : (
                                                <>
                                                    <Gift className="h-3 w-3" />
                                                    Claim Reward
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
