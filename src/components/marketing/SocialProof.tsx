"use client";

import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";

const testimonials = [
    {
        quote: "Vadea has transformed how my children learn. The offline mode means they can study even when we don't have internet.",
        name: "Sarah Mwangi",
        role: "Parent of 2",
        location: "Nairobi",
    },
    {
        quote: "As a teacher, I love how easy it is to create courses and connect with students through live lessons.",
        name: "James Ochieng",
        role: "CBC Teacher",
        location: "Kisumu",
    },
    {
        quote: "The platform helped me understand topics I was struggling with. The community forums are super helpful!",
        name: "Grace Wanjiku",
        role: "Grade 6 Student",
        location: "Mombasa",
    },
];

const stats = [
    { value: "10K+", label: "Active Students" },
    { value: "500+", label: "Certified Teachers" },
    { value: "100+", label: "Courses" },
    { value: "47", label: "Counties Reached" },
];

export function SocialProof() {
    return (
        <section className="section-padding bg-zinc-50" id="testimonials">
            <div className="container mx-auto px-4">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                                {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wide">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-headline text-zinc-900">
                        Trusted by Families Across Kenya
                    </h2>
                    <p className="mt-4 text-body-lg text-muted-foreground max-w-2xl mx-auto">
                        See what parents, teachers, and students are saying about their experience with Vadea.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.name}
                            className={cn(
                                "relative bg-white rounded-2xl p-8 border border-zinc-200",
                                "transition-all duration-300",
                                // Vary heights for visual interest
                                index === 1 && "md:-translate-y-4"
                            )}
                        >
                            {/* Quote Icon */}
                            <div className="absolute -top-4 left-8 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <Quote className="w-4 h-4 text-white" />
                            </div>

                            {/* Quote Text */}
                            <blockquote className="text-zinc-700 text-body-lg leading-relaxed mb-6 pt-4">
                                "{testimonial.quote}"
                            </blockquote>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                {/* DiceBear Avatar */}
                                <div className="w-12 h-12 rounded-full bg-zinc-100 overflow-hidden">
                                    <img
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}&backgroundColor=3b82f6&radius=50`}
                                        alt={testimonial.name}
                                        className="w-full h-full"
                                    />
                                </div>
                                <div>
                                    <div className="font-medium text-zinc-900">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {testimonial.role} · {testimonial.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
