"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const features = [
    {
        title: "Your Digital Classroom, Ready to Go",
        description: "Forget complex setups. Upload videos, create quizzes, and manage assignments with our intuitive Course Builder. Everything is optimized for mobile data.",
        imageSrc: "/images/teacher_dashboard.png",
        imageAlt: "Teacher Dashboard on Laptop",
        points: ["Drag-and-drop lesson builder", "Automated grading for quizzes", "Offline-ready content storage"],
    },
    {
        title: "Live Classes with Zero Lag",
        description: "Connect with your students in real-time. Our video platform adjusts to bandwidth automatically, ensuring every student can hear you clear as day.",
        imageSrc: "/images/live_class.png",
        imageAlt: "Teacher hosting a live class",
        points: ["Built-in whiteboard", "Screen sharing", "Student hand-raising & chat"],
    },
    {
        title: "Get Paid Instantly & Securely",
        description: "No more chasing payments. When a student buys your course or attends a class, the money goes straight to your wallet. Withdraw to M-Pesa anytime.",
        imageSrc: "/images/mobile_payment.png",
        imageAlt: "M-Pesa payment notification on phone",
        points: ["Instant M-Pesa withdrawals", "Track every shilling earned", "Automated invoicing"],
    },
];

export function TeacherRichFeatures() {
    return (
        <section className="py-24 bg-white overflow-hidden" id="features">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl"
                    >
                        Focus on Teaching, <br className="hidden sm:block" />
                        <span className="text-blue-600">We Handle the Rest</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-6 text-xl text-zinc-500 max-w-2xl mx-auto"
                    >
                        Vadea gives you the tools of a top-tier digital school, right in your pocket.
                    </motion.p>
                </div>

                <div className="space-y-24 md:space-y-32">
                    {features.map((feature, index) => (
                        <div key={index} className={`flex flex-col gap-12 lg:gap-24 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
                            {/* Text Side */}
                            <motion.div
                                initial={{ opacity: 0, x: index % 2 === 1 ? 50 : -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="flex-1"
                            >
                                <h3 className="text-3xl font-bold text-zinc-900 mb-6">{feature.title}</h3>
                                <p className="text-lg text-zinc-600 leading-relaxed mb-8">
                                    {feature.description}
                                </p>
                                <ul className="space-y-4">
                                    {feature.points.map((point) => (
                                        <li key={point} className="flex items-center gap-3">
                                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="text-zinc-700 font-medium">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Image Side */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="flex-1 w-full"
                            >
                                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-100 bg-zinc-100 group">
                                    <Image
                                        src={feature.imageSrc}
                                        alt={feature.imageAlt}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Glass Overlay Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent pointer-events-none" />
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
