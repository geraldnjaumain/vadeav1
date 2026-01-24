"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const features = [
    {
        name: "Competence Based Curriculum",
        description: "Fully aligned with the CBC to ensure your child gains practical skills.",
        imageSrc: "/icons/icon_curriculum_3d_1768843440466.png",
    },
    {
        name: "Offline-First Learning",
        description: "Access course materials without a constant internet connection.",
        imageSrc: "/icons/icon_offline_3d_1768843458311.png",
    },
    {
        name: "Interactive Live Lessons",
        description: "Real-time sessions with qualified teachers using our virtual classroom.",
        imageSrc: "/icons/icon_video_3d_1768843475124.png",
    },
    {
        name: "Parent Dashboard",
        description: "Track progress, manage subscriptions, and communicate with teachers.",
        imageSrc: "/icons/icon_dashboard_3d_1768843512382.png",
    },
    {
        name: "Vibrant Community",
        description: "Join forums for students and parents to discuss and share.",
        imageSrc: "/icons/icon_community_3d_1768843528163.png",
    },
    {
        name: "Certified Teachers",
        description: "Learn from the best. Vetted and experienced in digital pedagogy.",
        imageSrc: "/icons/icon_certified_3d_1768843543668.png",
    },
];

export function Features() {
    return (
        <section className="py-24 bg-white overflow-visible" id="features">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Reimagining Education</h2>
                    <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
                        A complete ecosystem designed to make learning intuitive and connected.
                    </p>
                </div>

                {/* Puzzle Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 max-w-6xl mx-auto isolate p-4">
                    {features.map((feature, i) => {
                        return (
                            <div
                                key={feature.name}
                                className={cn(
                                    // Card Body: Blue background
                                    "relative group bg-blue-600 h-[340px] p-8 flex flex-col items-center text-center justify-center transition-all duration-300",
                                    "border-blue-500/30", // Subtle border
                                    "border-[0.5px]",
                                    // Hover: Lighter blue, white border glow
                                    "hover:z-20 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] hover:border-white/50 hover:bg-blue-500"
                                )}
                            >
                                {/* RIGHT TAB (Outie) */}
                                <div className={cn(
                                    "hidden md:block absolute -right-[1.5rem] top-1/2 -translate-y-1/2 w-[3rem] h-[3rem] bg-blue-600 rounded-full border border-blue-500/30 z-10",
                                    "group-hover:border-white/50 group-hover:bg-blue-500 transition-all",
                                    "md:block lg:block",
                                    "md:max-lg:[&:nth-child(2n)]:hidden", // Hide on MD right edge
                                    "lg:[&:nth-child(3n)]:hidden"          // Hide on LG right edge
                                )} />

                                {/* BOTTOM TAB (Outie) */}
                                <div className={cn(
                                    "absolute -bottom-[1.5rem] left-1/2 -translate-x-1/2 w-[3rem] h-[3rem] bg-blue-600 rounded-full border border-blue-500/30 z-10",
                                    "group-hover:border-white/50 group-hover:bg-blue-500 transition-all",
                                    "md:max-lg:[&:nth-last-child(-n+2)]:hidden", // Hide bottom 2 on MD
                                    "lg:[&:nth-last-child(-n+3)]:hidden",        // Hide bottom 3 on LG
                                    "[&:last-child]:hidden"                       // Hide on last item
                                )} />

                                {/* Content */}
                                <div className="relative z-20 pointer-events-none flex flex-col items-center">
                                    {/* 3D Icon Container */}
                                    <div className="relative h-28 w-28 mb-6 transition-transform duration-300 group-hover:scale-110">
                                        <Image
                                            src={feature.imageSrc}
                                            alt={feature.name}
                                            fill
                                            // Adjusted for blue background - assume icons work well or keep invert if they were black
                                            className="object-contain opacity-90"
                                            // Actually brightness-0 invert makes it pure white. Good for blue bg.
                                            sizes="(max-width: 768px) 100px, 100px"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{feature.name}</h3>
                                    <p className="text-blue-100 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
