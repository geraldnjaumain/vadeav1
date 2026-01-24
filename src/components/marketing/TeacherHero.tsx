"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLottie } from "lottie-react";
import animationData from "../../../public/animations/hero-animation.json";

export function TeacherHero() {
    const options = {
        animationData,
        loop: true,
        autoplay: true,
    };

    const { View } = useLottie(options);

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                            Hiring Qualified CBC Teachers
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:text-7xl font-serif"
                        >
                            Focus on Teaching, <br className="hidden lg:block" />
                            <span className="text-blue-600">We Handle the Rest</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mt-6 text-xl text-zinc-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light"
                        >
                            Vadea gives you the tools of a top-tier digital school, right in your pocket. No admin headaches, just pure teaching.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <Button size="lg" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 font-bold h-12 px-8 shadow-lg shadow-blue-200" asChild>
                                <Link href="/become-a-teacher">
                                    Start Teaching
                                    <ArrowRight className="ml-2 h-4 w-4 fill-current" />
                                </Link>
                            </Button>

                            <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-semibold h-12 px-8 transition-all" asChild>
                                <Link href="#features">
                                    Learn More
                                </Link>
                            </Button>
                        </motion.div>
                    </div>

                    <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7 }}
                            className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square max-h-[500px] flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-blue-100/50 blur-[80px] rounded-full scale-90" />
                            <div className="relative z-10 w-full h-full">
                                {View}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
