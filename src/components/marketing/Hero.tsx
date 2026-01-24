"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface HeroProps {
    title: React.ReactNode;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    secondaryCta?: React.ReactNode;
    animationData: any;
}

export function Hero({
    title,
    subtitle,
    ctaText,
    ctaLink,
    secondaryCta,
    animationData
}: HeroProps) {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-blue-600">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 text-center lg:text-left">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-serif"
                        >
                            {title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mt-6 text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light"
                        >
                            {subtitle}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 border-0 font-bold h-12 px-8 shadow-xl" asChild>
                                <Link href={ctaLink} scroll={false}>
                                    {ctaText}
                                    <ArrowRight className="ml-2 h-4 w-4 fill-current" />
                                </Link>
                            </Button>
                            {secondaryCta}
                        </motion.div>
                    </div>

                    <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative">
                        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square max-h-[500px] flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative z-10 w-full h-full"
                            >
                                <Lottie animationData={animationData} loop={true} className="w-full h-full" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acute Angled Line (Diagonal Divider) */}
            <div
                className="absolute bottom-[-1px] left-0 right-0 h-8 bg-white z-0"
                style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
            />
        </section>
    );
}
