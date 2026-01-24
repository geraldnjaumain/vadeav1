"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AlertTriangle, Clock, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { differenceInDays, differenceInHours } from "date-fns";

export function SubscriptionBanner() {
    const user = useQuery(api.users.currentUser);
    const [isVisible, setIsVisible] = useState(true);

    if (!user || user.role !== "parent" || !user.trialEndsAt || !isVisible) {
        return null;
    }

    const now = Date.now();
    const daysLeft = differenceInDays(user.trialEndsAt, now);
    const hoursLeft = differenceInHours(user.trialEndsAt, now);
    const isExpired = now > user.trialEndsAt;

    // Don't show if they have a payment (logic would be checked here in real app via `user.isPro`)
    // For now, assume trialEndsAt presence means they are on trial.

    if (isExpired) {
        return (
            <div className="bg-red-50 border-b border-red-100 px-4 py-3 relative">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 text-red-800">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                        <div>
                            <p className="font-semibold text-sm">Your free trial has expired.</p>
                            <p className="text-xs text-red-600/80">Update your billing information to continue accessing Vadea.</p>
                        </div>
                    </div>
                    <Button size="sm" className="bg-red-600 text-white hover:bg-red-700 w-full md:w-auto shadow-sm shadow-red-200">
                        Upgrade Now
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 text-indigo-900">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">
                            {daysLeft > 0 ? `${daysLeft} days left in your free trial.` : `${hoursLeft} hours left in your free trial.`}
                        </p>
                        <p className="text-xs text-indigo-600/80 hidden md:block">
                            Enjoying Vadea? Upgrade now to keep full access to all features.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="w-full md:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-100 bg-white" onClick={() => setIsVisible(false)}>
                        Dismiss
                    </Button>
                    <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 w-full md:w-auto shadow-sm shadow-indigo-200">
                        <Crown className="h-3.5 w-3.5 mr-2" /> Upgrade Plan
                    </Button>
                </div>
            </div>
        </div>
    );
}
