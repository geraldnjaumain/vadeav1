"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

export default function CommunicationsPage() {
    // Note: We need to expose the internal action via a wrapper mutation or allow calling internal action if configured?
    // Client cannot call internalAction directly.
    // I need a mutation that calls the internal action.
    // I'll create `convex/admin_actions.ts` or similar helper if needed.
    // For now, I'll assume `api.admin.sendEmail` exists or I'll add it.
    // I will add the mutation in `convex/admin.ts` (implied existence or new).
    // I'll leave a TODO here and create the backend part next.

    // Placeholder implementation
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // This needs to be a mutation that schedules the internal action
    const sendEmail = useAction(api.admin.sendEmailToUser as any);

    const handleSend = async () => {
        try {
            setIsSending(true);
            await sendEmail({ email: to, subject, message });
            toast.success("Email sent!");
            setTo("");
            setSubject("");
            setMessage("");
        } catch (error) {
            toast.error("Failed to send email. Ensure you have permissions.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Communications</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Send Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Recipient Email</Label>
                        <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="student@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Important Update" />
                    </div>
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows={6}
                        />
                        <p className="text-xs text-muted-foreground">Supports basic HTML.</p>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSend} disabled={isSending || !to || !subject}>
                            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Email
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
