"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { FAQSection as FAQ } from "@/components/marketing/FAQ";
import { BlogPreview } from "@/components/marketing/BlogPreview";
// Import animation - ensuring path is correct relative to public
import heroAnimation from "../../public/animations/hero-animation.json";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-white selection:bg-blue-100">
            <Navbar />

            <Hero
                title={
                    <>
                        The Future of <span className="text-white decoration-blue-300 underline underline-offset-4 decoration-4">Learning</span> is Here
                    </>
                }
                subtitle="Join thousands of students and parents in the most advanced Competence Based Curriculum platform."
                ctaText="Get Started"
                ctaLink="/auth?mode=register"
                animationData={heroAnimation}
            />

            <Features />

            <BlogPreview />

            <FAQ />

            <Footer />
        </main>
    );
}
