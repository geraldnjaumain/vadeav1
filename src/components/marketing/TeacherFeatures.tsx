"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const features = [
    {
        name: "Course Creation Tools",
        description: "Intuitive builder to upload videos, quizzes, and assignments easily.",
        imageSrc: "/icons/icon_curriculum_3d_1768843440466.png", // Reuse for now
    },
    {
        name: "Live Classroom",
        description: "Built-in video conferencing to host interactive live sessions.",
        imageSrc: "/icons/icon_video_3d_1768843475124.png", // Reuse
    },
    {
        name: "Student Analytics",
        description: "Track performance and attendance with detailed reports.",
        imageSrc: "/icons/icon_dashboard_3d_1768843512382.png", // Reuse
    },
    {
        name: "Guaranteed Payments",
        description: "Secure and timely payouts for your sold courses and sessions.",
        imageSrc: "/icons/icon_offline_3d_1768843458311.png", // Reuse (Wallet icon metaphor)
    },
    {
        name: "Professional Network",
        description: "Connect with other top educators and share resources.",
        imageSrc: "/icons/icon_community_3d_1768843528163.png", // Reuse
    },
    {
        name: "Vadea Certification",
        description: "Get certified as a digital educator and boost your profile.",
        imageSrc: "/icons/icon_certified_3d_1768843543668.png", // Reuse
    },
];

export function TeacherFeatures() {
    return (
        <section className="py-24 bg-zinc-50" id="benefits">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Everything You Need to Teach</h2>
                    <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
                        Focus on teaching. We handle the technology, payments, and marketing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {features.map((feature) => (
                        <div key={feature.name} className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
                            <div className="relative h-16 w-16 mb-6">
                                <Image
                                    src={feature.imageSrc}
                                    alt={feature.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">{feature.name}</h3>
                            <p className="text-zinc-500 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
