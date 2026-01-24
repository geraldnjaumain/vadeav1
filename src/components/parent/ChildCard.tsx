"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

interface ChildCardProps {
    child: {
        _id: Id<"users">;
        name: string;
        image?: string;
        grade?: string;
        email?: string;
        password?: string;
        admissionNumber?: string;
    };
    onEdit: (child: any) => void;
}

export function ChildCard({ child, onEdit }: ChildCardProps) {
    const [isVisible, setIsVisible] = useState(false);



    return (
        <Card className="relative group hover:shadow-lg transition-all border-zinc-200 hover:border-blue-500/30 overflow-hidden">
            <Link href={`/parent/children/${child._id}`} className="absolute inset-0 z-10" />

            {/* Top Decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="flex flex-row items-center gap-4 pb-4 relative z-0">
                <img
                    src={child.image || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${child.name}`}
                    alt={child.name}
                    className="h-16 w-16 rounded-full border-2 border-white shadow-md bg-zinc-50"
                />
                <div className="space-y-1 min-w-0">
                    <CardTitle className="text-lg font-bold truncate pr-2">{child.name}</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                            {child.grade || "No Grade"}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">
                            {child.admissionNumber || "ID: --"}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0 relative z-20 space-y-4">
                {/* Credentials Box */}
                <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-3 transition-colors group-hover:bg-blue-50/30 group-hover:border-blue-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Login Details</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-zinc-400 hover:text-zinc-600 hover:bg-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsVisible(!isVisible);
                            }}
                        >
                            {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {/* ID */}
                        <div className="flex justify-between items-center text-xs group/item">
                            <span className="text-zinc-500 w-12 shrink-0">ID:</span>
                            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                                <span className="font-mono font-medium text-zinc-900 truncate">
                                    {child.admissionNumber || "N/A"}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(child.admissionNumber || "");
                                        toast.success("ID copied!");
                                    }}
                                >
                                    <Copy className="h-2.5 w-2.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex justify-between items-center text-xs group/item">
                            <span className="text-zinc-500 w-12 shrink-0">Email:</span>
                            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                                <span className="font-mono font-medium text-zinc-900 truncate max-w-[120px]" title={child.email}>
                                    {child.email}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(child.email || "");
                                        toast.success("Email copied!");
                                    }}
                                >
                                    <Copy className="h-2.5 w-2.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex justify-between items-center text-xs group/item">
                            <span className="text-zinc-500 w-12 shrink-0">Pass:</span>
                            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                                <span className={isVisible ? "font-mono font-bold text-zinc-900" : "font-mono text-zinc-300 transform translate-y-0.5"}>
                                    {isVisible ? child.password : "••••••••"}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(child.password || "");
                                        toast.success("Password copied!");
                                    }}
                                >
                                    <Copy className="h-2.5 w-2.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 relative z-30 pointer-events-auto h-9 border-zinc-200 hover:border-zinc-300 hover:bg-white font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(child);
                        }}
                    >
                        <Pencil className="h-3.5 w-3.5 mr-2 text-zinc-500" /> Edit Profile
                    </Button>
                    {/* Delete logic needed later */}
                </div>
            </CardContent>
        </Card>
    );
}
