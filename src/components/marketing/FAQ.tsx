"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus } from "lucide-react";

const faqs = [
    {
        question: "Do students get early access to the beta?",
        answer: "Yes! Sign up with your academic email for early access. We identify students according to the WHED.",
    },
    {
        question: "Are there any discounts for students?",
        answer: "We offer significant discounts for students with valid identification. Please contact our support team for more details.",
    },
    {
        question: "What devices are currently supported?",
        answer: "Vadea is currently supported on all modern web browsers (Chrome, Firefox, Safari, Edge) on desktop, tablet, and mobile devices.",
    },
    {
        question: "Is Vadea hiring interns?",
        answer: "We are always looking for talented individuals to join our team. Check our careers page for current openings.",
    },
    {
        question: "I'm a student who loves Vadea. How can I get more involved?",
        answer: "Join our community forums, participate in our ambassador program, and share your feedback to help us shape the future of education.",
    },
];

export interface FAQItem {
    question: string;
    answer: string;
}

export function FAQSection({ items = faqs, title = "Frequently Asked Questions" }: { items?: FAQItem[], title?: string }) {
    return (
        <section className="py-24 bg-zinc-50/50" id="faq">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">{title}</h2>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {items.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="bg-white border border-zinc-200 rounded-lg px-6"
                        >
                            <AccordionTrigger className="text-zinc-900 hover:text-blue-600 hover:no-underline text-left py-6 text-lg font-medium">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-600 pb-6 text-base leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
