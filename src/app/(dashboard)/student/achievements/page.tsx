"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Medal, Crown, Zap, BookOpen, Hand, Lock, Sparkles } from "lucide-react";
import { getInitialsAvatar } from "@/lib/avatar";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { AchievementsSkeleton } from "@/components/ui/skeleton";

// Map icon strings to Lucide components
const IconMap: any = {
    Hand,
    Zap,
    BookOpen,
    Star,
    Trophy,
    Medal
};

export default function AchievementsPage() {
    const achievements = useQuery(api.achievements.getAllAchievements);
    const myAchievements = useQuery(api.achievements.getMyAchievements);
    const leaderboard = useQuery(api.achievements.getLeaderboard);
    const xpStats = useQuery(api.challenges.getXpStats);
    const seedAchievements = useMutation(api.achievements.seedAchievements);

    if (achievements === undefined || myAchievements === undefined || leaderboard === undefined || xpStats === undefined) {
        return <AchievementsSkeleton />;
    }

    // Use real XP stats from the gamification system
    const level = xpStats?.level ?? 1;
    const currentXp = xpStats?.currentXp ?? 0;
    const totalXp = xpStats?.totalXp ?? 0;
    const xpNeeded = xpStats?.xpNeeded ?? 1000;
    const progress = xpStats?.progressPercent ?? 0;

    const earnedIds = new Set(myAchievements.map(a => a._id));

    const handleSeed = async () => {
        try {
            await seedAchievements();
            toast.success("Achievements generated");
        } catch (e) {
            toast.error("Failed to seed achievements");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Achievements</h1>
                    <p className="text-zinc-500">Track your progress and earn rewards</p>
                </div>
                {achievements.length === 0 && (
                    <Button variant="outline" onClick={handleSeed}>
                        Generate Badges
                    </Button>
                )}
            </div>

            {/* Hero Stats */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                            <Trophy className="h-12 w-12 text-yellow-300 fill-current" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Level {level}
                        </div>
                    </div>
                    <div className="flex-1 space-y-2 text-center md:text-left w-full">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold">Total XP: {totalXp}</h2>
                                <p className="text-blue-100">You need {xpNeeded - currentXp} more XP to reach Level {level + 1}</p>
                            </div>
                            <div className="text-3xl font-black text-white/20">#{4}</div>
                        </div>
                        <Progress value={progress} className="h-3 bg-blue-900/30" indicatorClassName="bg-yellow-400" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Badges Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <Medal className="h-5 w-5 text-blue-600" />
                        Badges ({myAchievements.length}/{achievements.length})
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {achievements.map((achievement) => {
                            const isEarned = earnedIds.has(achievement._id);
                            const Icon = IconMap[achievement.icon] || Star;

                            return (
                                <Card key={achievement._id} className={`transition-all ${isEarned ? 'border-blue-200 bg-blue-50/30' : 'border-zinc-200 bg-zinc-50/50 opacity-70'}`}>
                                    <div className="p-4 flex gap-4 items-start">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${isEarned ? 'bg-blue-100 text-blue-600 shadow-sm' : 'bg-zinc-200 text-zinc-400'}`}>
                                            {isEarned ? <Icon className="h-6 w-6 fill-current" /> : <Lock className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${isEarned ? 'text-zinc-900' : 'text-zinc-500'}`}>{achievement.title}</h3>
                                            <p className="text-sm text-zinc-500 line-clamp-2 mt-0.5">{achievement.description}</p>
                                            <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-100/50 inline-block px-2 py-0.5 rounded">
                                                +{achievement.points} pts
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Leaderboard */}
                <div>
                    <Card className="border-zinc-200 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-yellow-500 fill-current" />
                                Leaderboard
                            </CardTitle>
                            <CardDescription>Top students this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {leaderboard.map((student: any, i: number) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${student.rank === 4 ? 'bg-blue-50 border border-blue-100' : ''}`}>
                                        <div className={`w-6 text-center font-bold ${i < 3 ? 'text-yellow-600' : 'text-zinc-400'}`}>
                                            {student.rank}
                                        </div>
                                        <img
                                            src={student.avatar || getInitialsAvatar(student.name, 32)}
                                            className="h-8 w-8 rounded-full bg-zinc-100"
                                            alt={student.name}
                                        />
                                        <div className="flex-1 font-medium text-sm text-zinc-900">
                                            {student.name} {student.rank === 4 && "(You)"}
                                        </div>
                                        <div className="font-bold text-sm text-zinc-700">
                                            {student.points}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
