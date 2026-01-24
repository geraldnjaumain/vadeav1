"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap } from "lucide-react";

export function CTASection() {
    return (
        <section className="section-padding bg-primary relative overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <GraduationCap className="w-16 h-16 text-white/80 fill-current mx-auto mb-8" />

                    <h2 className="text-headline text-white mb-6">
                        Ready to Transform Your Child's Education?
                    </h2>

                    <p className="text-body-lg text-white/80 mb-10 max-w-2xl mx-auto">
                        Join thousands of families who have chosen Vadea for a
                        world-class, competence-based education experience. Start
                        your journey today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-white text-primary hover:bg-zinc-100 font-semibold h-14 px-8"
                            asChild
                        >
                            <Link href="?auth=register" scroll={false}>
                                Get Started as a Parent
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-white/30 text-white bg-white/10 hover:bg-white hover:text-primary font-semibold h-14 px-8"
                            asChild
                        >
                            <Link href="/become-a-teacher">
                                Become a Teacher
                            </Link>
                        </Button>
                    </div>

                    <p className="text-sm text-white/60 mt-8">
                        No credit card required. Start with a free trial.
                    </p>
                </div>
            </div>
        </section>
    );
}
