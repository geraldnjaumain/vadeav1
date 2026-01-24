"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

const valueProps = [
    {
        title: "Learn Anytime, Anywhere",
        subtitle: "Offline-First Architecture",
        description:
            "Download lessons and study materials to access them without internet. Perfect for students in areas with unreliable connectivity.",
        benefits: [
            "Download entire courses for offline access",
            "Sync progress when back online",
            "Works on low-bandwidth connections",
        ],
        imageSrc: "/icons/icon_offline_3d_1768843458311.png",
        bgColor: "bg-secondary/30",
    },
    {
        title: "Real Teachers, Real Connections",
        subtitle: "Live Interactive Lessons",
        description:
            "Join live sessions with certified teachers. Ask questions, participate in discussions, and get personalized feedback.",
        benefits: [
            "HD video sessions with screen sharing",
            "Recorded lessons for later review",
            "Small class sizes for attention",
        ],
        imageSrc: "/icons/icon_video_3d_1768843475124.png",
        bgColor: "bg-primary/10",
    },
    {
        title: "Track Every Milestone",
        subtitle: "Parent Dashboard",
        description:
            "Stay informed about your child's progress. View competency reports, upcoming lessons, and communicate directly with teachers.",
        benefits: [
            "Real-time progress tracking",
            "Competency-based reports",
            "Direct teacher messaging",
        ],
        imageSrc: "/icons/icon_dashboard_3d_1768843512382.png",
        bgColor: "bg-zinc-100",
    },
];

export function ValuePropositions() {
    return (
        <section className="section-padding-lg bg-white" id="benefits">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">
                        Why Choose Vadea
                    </span>
                    <h2 className="text-headline text-zinc-900 mt-4">
                        Education Designed for the Modern Learner
                    </h2>
                </div>

                {/* Value Props with Alternating Layouts */}
                <div className="space-y-24">
                    {valueProps.map((prop, index) => (
                        <div
                            key={prop.title}
                            className={cn(
                                "flex flex-col gap-8 items-center",
                                index % 2 === 0
                                    ? "lg:flex-row"
                                    : "lg:flex-row-reverse"
                            )}
                        >
                            {/* Image/Illustration Side */}
                            <div
                                className={cn(
                                    "flex-1 w-full rounded-3xl p-12 flex items-center justify-center min-h-[320px]",
                                    prop.bgColor
                                )}
                            >
                                <div className="relative w-48 h-48 md:w-64 md:h-64">
                                    <Image
                                        src={prop.imageSrc}
                                        alt={prop.title}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 w-full lg:px-8">
                                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                                    {prop.subtitle}
                                </span>
                                <h3 className="text-title text-zinc-900 mt-2 mb-4">
                                    {prop.title}
                                </h3>
                                <p className="text-body-lg text-muted-foreground mb-8">
                                    {prop.description}
                                </p>

                                {/* Benefits List */}
                                <ul className="space-y-4">
                                    {prop.benefits.map((benefit) => (
                                        <li
                                            key={benefit}
                                            className="flex items-start gap-3"
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                            <span className="text-body text-zinc-700">
                                                {benefit}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
