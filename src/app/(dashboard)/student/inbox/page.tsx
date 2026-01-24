"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, PenSquare, Send, Paperclip, MoreVertical, Phone, Video, Info } from "lucide-react";
import { format } from "date-fns";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { toast } from "sonner";

export default function StudentInboxPage() {
    const conversations = useQuery(api.communications.getConversations);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Start with first conversation if available and none selected
    if (conversations && conversations.length > 0 && !selectedConversationId) {
        setSelectedConversationId(conversations[0]._id);
    }

    const filteredConversations = conversations?.filter(c =>
        c.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (conversations === undefined) {
        return <LoadingAnimation message="Loading messages..." />;
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            {/* Sidebar: Conversation List */}
            <div className="w-80 border-r border-zinc-200 flex flex-col bg-zinc-50/50">
                <div className="p-4 border-b border-zinc-200 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="font-bold text-xl text-zinc-900">Messages</h1>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
                            <PenSquare className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-9 bg-white border-zinc-200 focus-visible:ring-zinc-900"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {filteredConversations?.map((conv) => (
                            <button
                                key={conv._id}
                                onClick={() => setSelectedConversationId(conv._id)}
                                className={cn(
                                    "flex items-start gap-3 p-4 text-left hover:bg-zinc-100 transition-colors border-b border-zinc-100 last:border-0",
                                    selectedConversationId === conv._id && "bg-blue-50/80 hover:bg-blue-50 border-blue-100"
                                )}
                            >
                                <Avatar className="h-10 w-10 border border-zinc-200">
                                    <AvatarImage src={conv.otherUser?.image} />
                                    <AvatarFallback className="bg-zinc-100 text-zinc-500">
                                        {conv.otherUser?.name?.[0] || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={cn("font-medium truncate", selectedConversationId === conv._id ? "text-blue-900" : "text-zinc-900")}>
                                            {conv.otherUser?.name}
                                        </span>
                                        <span className="text-xs text-zinc-400 whitespace-nowrap ml-2">
                                            {conv.lastMessage?.createdAt && format(conv.lastMessage.createdAt, 'MMM d')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 truncate">
                                        {conv.lastMessage?.content || "No messages yet"}
                                    </p>
                                </div>
                            </button>
                        ))}
                        {filteredConversations?.length === 0 && (
                            <div className="p-8 text-center text-zinc-500 text-sm">
                                No messages found.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Area: Chat Window */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {selectedConversationId ? (
                    <ChatWindow conversationId={selectedConversationId} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-4">
                        <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center">
                            <Send className="h-8 w-8 text-zinc-300" />
                        </div>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ChatWindow({ conversationId }: { conversationId: string }) {
    const messages = useQuery(api.communications.getMessages, { conversationId: conversationId as any });
    const sendMessage = useMutation(api.communications.sendMessage);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Scroll to bottom on new message
    // (Implementation skipped for brevity in this step, but standard useRef logic would go here)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            await sendMessage({ conversationId: conversationId as any, content: newMessage });
            setNewMessage("");
            toast.success("Message sent");
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    if (messages === undefined) {
        return <div className="flex-1 flex items-center justify-center"><LoadingAnimation /></div>;
    }

    return (
        <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    {/* We might want to query conversation details here for the header name if not passed down */}
                    <span className="font-semibold text-zinc-900">Chat</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                    <Button variant="ghost" size="icon" className="hover:text-zinc-900"><Phone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="hover:text-zinc-900"><Video className="h-4 w-4" /></Button>
                    <div className="w-px h-6 bg-zinc-200 mx-1" />
                    <Button variant="ghost" size="icon" className="hover:text-zinc-900"><Info className="h-4 w-4" /></Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center text-zinc-400 text-sm py-12">
                            This is the start of your conversation.
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={cn(
                                "flex gap-3 max-w-[80%]",
                                msg.isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <Avatar className="h-8 w-8 border border-zinc-100 shrink-0">
                                <AvatarImage src={msg.sender?.image} />
                                <AvatarFallback>{msg.sender?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                msg.isOwn
                                    ? "bg-zinc-900 text-white rounded-tr-none"
                                    : "bg-zinc-100 text-zinc-900 rounded-tl-none"
                            )}>
                                {msg.content}
                                <div className={cn("text-[10px] mt-1 opacity-70", msg.isOwn ? "text-zinc-300" : "text-zinc-500")}>
                                    {format(msg.createdAt, 'h:mm a')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 bg-white border-t border-zinc-100">
                <form onSubmit={handleSend} className="flex gap-2 items-end bg-zinc-50 p-2 rounded-xl border border-zinc-200 focus-within:ring-2 focus-within:ring-zinc-900/10 transition-all">
                    <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600 h-10 w-10">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                        className="flex-1 bg-transparent border-0 focus-visible:ring-0 px-2 py-3 h-auto max-h-32 min-h-[44px] resize-none"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-10 w-10 bg-zinc-900 hover:bg-zinc-800 text-white shadow-md rounded-lg"
                        disabled={!newMessage.trim() || isSending}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </>
    );
}
