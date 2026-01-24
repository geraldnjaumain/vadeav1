"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MessageSquare, Send, Plus, User, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function TeacherMessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState<Id<"conversations"> | null>(null);
    const [messageInput, setMessageInput] = useState("");
    const [newChatOpen, setNewChatOpen] = useState(false);

    const conversations = useQuery(api.communications.getConversations);
    const messages = useQuery(
        api.communications.getMessages,
        selectedConversation ? { conversationId: selectedConversation } : "skip"
    );
    const contacts = useQuery(api.communications.getContactsForTeacher);

    const sendMessage = useMutation(api.communications.sendMessage);
    const startConversation = useMutation(api.communications.startConversation);

    const handleSend = async () => {
        if (!messageInput.trim() || !selectedConversation) return;
        try {
            await sendMessage({ conversationId: selectedConversation, content: messageInput });
            setMessageInput("");
        } catch {
            toast.error("Failed to send message");
        }
    };

    const handleStartChat = async (userId: Id<"users">) => {
        try {
            const convId = await startConversation({ otherUserId: userId });
            setSelectedConversation(convId);
            setNewChatOpen(false);
            toast.success("Conversation started");
        } catch {
            toast.error("Failed to start conversation");
        }
    };

    const selectedConv = conversations?.find((c) => c._id === selectedConversation);

    if (conversations === undefined) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                    <Skeleton className="h-full" />
                    <Skeleton className="lg:col-span-2 h-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Messages</h1>
                    <p className="text-zinc-500">Communicate with parents and students</p>
                </div>
                <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            New Message
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Start a Conversation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
                            {contacts === undefined ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 p-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-32 mb-2" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : contacts.length === 0 ? (
                                <p className="text-zinc-500 text-center py-4">No contacts available.</p>
                            ) : (
                                <>
                                    {/* Parents Section */}
                                    {contacts.filter(c => c.role === "parent").length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-zinc-400 uppercase mb-2 px-3">Parents</p>
                                            {contacts.filter(c => c.role === "parent").map((contact) => (
                                                <button
                                                    key={contact._id}
                                                    onClick={() => handleStartChat(contact._id)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left mb-2"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-900">{contact.name}</p>
                                                        <p className="text-sm text-zinc-500">{contact.childrenNames?.join(", ") || "Parent"}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Students Section */}
                                    {contacts.filter(c => c.role === "student").length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs font-semibold text-zinc-400 uppercase mb-2 px-3">Students</p>
                                            {contacts.filter(c => c.role === "student").map((contact) => (
                                                <button
                                                    key={contact._id}
                                                    onClick={() => handleStartChat(contact._id)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left mb-2"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-900">{contact.name}</p>
                                                        <p className="text-sm text-zinc-500">{contact.grade || "Student"}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Conversation List */}
                <Card className="lg:col-span-1 overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Conversations</CardTitle>
                        <CardDescription>{conversations.length} chats</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="p-6 text-center text-zinc-500">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                                    <p>No conversations yet</p>
                                    <p className="text-sm">Start a chat with a parent or student</p>
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <button
                                        key={conv._id}
                                        onClick={() => setSelectedConversation(conv._id)}
                                        className={cn(
                                            "w-full p-4 text-left hover:bg-zinc-50 transition-colors",
                                            selectedConversation === conv._id && "bg-blue-50 border-l-2 border-blue-500"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                                conv.otherUser?.role === "parent" ? "bg-green-100" : "bg-blue-100"
                                            )}>
                                                {conv.otherUser?.role === "parent" ? (
                                                    <Users className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <User className="h-5 w-5 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-zinc-900 truncate">{conv.otherUser?.name || "Unknown"}</p>
                                                <p className="text-sm text-zinc-500 truncate">
                                                    {conv.lastMessage?.content || "No messages yet"}
                                                </p>
                                            </div>
                                            {conv.lastMessage && (
                                                <span className="text-xs text-zinc-400">
                                                    {formatDistanceToNow(conv.lastMessage.createdAt, { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Chat Panel */}
                <Card className="lg:col-span-2 flex flex-col overflow-hidden">
                    {!selectedConversation ? (
                        <div className="flex-1 flex items-center justify-center text-zinc-500">
                            <div className="text-center">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
                                <p className="font-medium">Select a conversation</p>
                                <p className="text-sm">Or start a new one with a parent or student</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <CardHeader className="border-b border-zinc-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                        selectedConv?.otherUser?.role === "parent" ? "bg-green-100" : "bg-blue-100"
                                    )}>
                                        {selectedConv?.otherUser?.role === "parent" ? (
                                            <Users className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <User className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{selectedConv?.otherUser?.name}</CardTitle>
                                        <Badge variant="outline" className="text-xs capitalize">{selectedConv?.otherUser?.role}</Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Messages */}
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages === undefined ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                                                <Skeleton className="h-16 w-48 rounded-2xl" />
                                            </div>
                                        ))}
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-zinc-500 py-8">
                                        <p>No messages yet. Say hello!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg._id}
                                            className={cn(
                                                "flex",
                                                msg.isOwn ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[70%] px-4 py-2 rounded-2xl",
                                                    msg.isOwn
                                                        ? "bg-blue-600 text-white rounded-br-md"
                                                        : "bg-zinc-100 text-zinc-900 rounded-bl-md"
                                                )}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={cn(
                                                    "text-xs mt-1",
                                                    msg.isOwn ? "text-blue-200" : "text-zinc-400"
                                                )}>
                                                    {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>

                            {/* Input */}
                            <div className="border-t border-zinc-100 p-4">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        placeholder="Type a message..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={!messageInput.trim()} className="bg-blue-600 hover:bg-blue-700">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
