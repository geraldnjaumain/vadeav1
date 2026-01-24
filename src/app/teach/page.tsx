"use client";

import { TeacherNavbar } from "@/components/layout/TeacherNavbar";
import { Footer } from "@/components/layout/Footer";
import { TeacherHero } from "@/components/marketing/TeacherHero";
import { TeacherFeatures } from "@/components/marketing/TeacherFeatures";
import { FAQSection as FAQ } from "@/components/marketing/FAQ";

export default function TeachPage() {
    return (
        <main className="min-h-screen bg-white selection:bg-blue-100">
            <TeacherNavbar />
            <TeacherHero />
            <TeacherFeatures />
            <FAQ title="Common Questions from Teachers" items={[
                { question: "How do I get paid?", answer: "Payments are processed instantly to your M-Pesa or bank account once you reach the minimum withdrawal threshold." },
                { question: "Do I need a degree?", answer: "We require proof of qualification (TSC number or relevant certification) for core curriculum subjects. Skills teachers are vetted based on portfolio." },
                { question: "Is it free to join?", answer: "Yes! Creating a profile is free. We take a small commission (10-20%) on paid courses and sessions to cover platform costs." }
            ]} />
            <Footer />
        </main>
    );
}
