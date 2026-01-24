"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, MessageSquare, Mail, Phone, Ticket } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpContactForm } from "@/components/help/HelpContactForm";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [contactOpen, setContactOpen] = useState(false);
    const myTickets = useQuery(api.tickets.getMyTickets);

    const faqs = [
        {
            question: "How do I add a child to my account?",
            answer: "Go to your dashboard or the 'My Children' page and click on 'Add Child'. You'll need to provide their name, grade, and create a username/password for them."
        },
        {
            question: "How can I pay tuition fees?",
            answer: "Navigate to 'Fees & Payments' in the sidebar. You can view outstanding balances and make payments via credit card or MPESA."
        },
        {
            question: "Can I view my child's class schedule?",
            answer: "Yes! Click on 'Schedule' in the sidebar to see an aggregated calendar of all your children's upcoming lessons."
        },
        {
            question: "How do updates/notifications work?",
            answer: "You will receive notifications for invoices, homework assignments, and important school announcements. Check the bell icon in the top bar."
        },
        {
            question: "I forgot my password, how do I reset it?",
            answer: "On the login page, click 'Forgot Password'. You will receive an email with instructions to reset your password."
        },
        {
            question: "How do I contact a teacher?",
            answer: "You can use the 'Messages' tab to send direct messages to your child's teachers. Please allow up to 24 hours for a response."
        }
    ];

    const filteredFaqs = faqs.filter(f =>
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700 hover:bg-blue-100/80';
            case 'in_progress': return 'bg-amber-100 text-amber-700 hover:bg-amber-100/80';
            case 'resolved': return 'bg-green-100 text-green-700 hover:bg-green-100/80';
            case 'closed': return 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100/80';
            default: return 'bg-zinc-100 text-zinc-700';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-4 pb-12">
            <div className="text-center space-y-4 py-8">
                <h1 className="text-4xl font-bold text-zinc-900">How can we help you?</h1>
                <p className="text-zinc-500 text-lg">Search for answers or contact our support team.</p>
                <div className="max-w-xl mx-auto relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <Input
                        placeholder="Search for answers (e.g. 'payments', 'schedule')..."
                        className="pl-10 h-12 text-lg bg-white border-zinc-200 shadow-sm rounded-xl focus-visible:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="faq" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 max-w-[400px] mx-auto">
                    <TabsTrigger value="faq">FAQ & Guides</TabsTrigger>
                    <TabsTrigger value="tickets">My Support Tickets</TabsTrigger>
                </TabsList>

                <TabsContent value="faq" className="space-y-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="hover:shadow-md transition-all cursor-pointer border-zinc-200 group">
                            <CardHeader>
                                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
                                    <FileText className="h-5 w-5 text-blue-600 fill-current" />
                                </div>
                                <CardTitle className="text-lg">Guides</CardTitle>
                                <CardDescription>Step-by-step tutorials</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="hover:shadow-md transition-all cursor-pointer border-zinc-200 group" onClick={() => setContactOpen(true)}>
                            <CardHeader>
                                <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center mb-2 group-hover:bg-green-100 transition-colors">
                                    <MessageSquare className="h-5 w-5 text-green-600 fill-current" />
                                </div>
                                <CardTitle className="text-lg">New Ticket</CardTitle>
                                <CardDescription>Submit a request</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="hover:shadow-md transition-all cursor-pointer border-zinc-200 group">
                            <CardHeader>
                                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center mb-2 group-hover:bg-purple-100 transition-colors">
                                    <Mail className="h-5 w-5 text-purple-600 fill-current" />
                                </div>
                                <CardTitle className="text-lg">Email Us</CardTitle>
                                <CardDescription>support@vadea.app</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card className="border-zinc-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                            <CardDescription>
                                {searchQuery ? `Searching for "${searchQuery}"` : "Common questions from other parents"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger className="text-left font-medium text-zinc-900 hover:text-blue-600">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-zinc-600 leading-relaxed">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-zinc-500">
                                        No results found for "{searchQuery}". <br />
                                        <Button variant="link" onClick={() => setContactOpen(true)} className="text-blue-600">
                                            Contact Support
                                        </Button>
                                    </div>
                                )}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tickets">
                    <Card className="border-zinc-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>My Support Tickets</CardTitle>
                                <CardDescription>Track the status of your requests</CardDescription>
                            </div>
                            <Button onClick={() => setContactOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                <Ticket className="mr-2 h-4 w-4" /> New Ticket
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {!myTickets ? (
                                <div className="text-center py-8 text-zinc-500">Loading tickets...</div>
                            ) : myTickets.length === 0 ? (
                                <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                                    <Ticket className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                                    <h3 className="font-semibold text-zinc-900">No tickets yet</h3>
                                    <p className="text-zinc-500 text-sm mb-4">You haven't submitted any support requests.</p>
                                    <Button variant="outline" onClick={() => setContactOpen(true)}>Create your first ticket</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myTickets.map((ticket) => (
                                        <div key={ticket._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-zinc-200 rounded-lg hover:border-blue-300 transition-colors">
                                            <div className="space-y-1 mb-2 md:mb-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-zinc-900">{ticket.subject}</span>
                                                    <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-zinc-500 line-clamp-1">{ticket.message}</p>
                                                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                                                    <span className="capitalize">{ticket.category}</span>
                                                    <span>•</span>
                                                    <span>{format(ticket.createdAt, 'MMM d, yyyy h:mm a')}</span>
                                                </div>
                                            </div>
                                            {ticket.adminNotes && (
                                                <div className="md:max-w-xs bg-blue-50 p-3 rounded text-xs text-blue-800 border border-blue-100">
                                                    <span className="font-bold block mb-0.5">Response:</span>
                                                    {ticket.adminNotes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Contact Support</DialogTitle>
                        <DialogDescription>
                            Submit a ticket and our team will get back to you shortly.
                        </DialogDescription>
                    </DialogHeader>
                    <HelpContactForm onSuccess={() => setContactOpen(false)} />
                </DialogContent>
            </Dialog>

            <div className="text-center pt-4 pb-8">
                <p className="text-zinc-500 mb-4">Still need immediate help?</p>
                <div className="flex justify-center gap-4">
                    <Button variant="outline" className="gap-2">
                        <Phone className="h-4 w-4" /> +254 700 000 000
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Mail className="h-4 w-4" /> support@vadea.app
                    </Button>
                </div>
            </div>
        </div>
    );
}
