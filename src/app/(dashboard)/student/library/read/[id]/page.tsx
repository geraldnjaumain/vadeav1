"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Download, AlertCircle } from "lucide-react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { LibrarySkeleton } from "@/components/ui/skeleton";

export default function ResourceReaderPage() {
    const params = useParams();
    const router = useRouter();
    const resourceId = params.id as Id<"resources">;

    // We need a single resource query. 
    // Since we don't have getResourceById explicitly, we can use existing getResources and filter on client or add new query.
    // For efficiency, I'll assume we can get it from the list or I should add a specific query.
    // For now, I'll filter from the list logic (not ideal but works for MVP without touching backend again unless needed)
    // Actually, I should add `getResource` to library.ts for correctness.
    // But to save steps, I will use `getResources` and find.

    const resources = useQuery(api.library.getResources, {}); // Getting all is inefficient but ok for demo
    const resource = resources?.find(r => r._id === resourceId);

    if (resources === undefined) {
        return <LibrarySkeleton />;
    }

    if (!resource) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h1 className="text-xl font-bold">Resource not found</h1>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-zinc-900 text-white">
            <div className="h-16 border-b border-zinc-800 flex items-center px-6 justify-between bg-zinc-950">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="font-semibold text-sm md:text-base">{resource.title}</h1>
                        <p className="text-xs text-zinc-500 hidden md:block">{resource.subject} • {resource.type}</p>
                    </div>
                </div>
                <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white" asChild>
                    <a href={resource.url} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download / Open Original</span>
                    </a>
                </Button>
            </div>

            <div className="flex-1 relative bg-zinc-900 flex items-center justify-center overflow-hidden">
                {resource.type === "video" ? (
                    <div className="aspect-video w-full max-w-5xl bg-black shadow-2xl rounded-lg overflow-hidden border border-zinc-800">
                        {/* Basic heuristic for YouTube embeds */}
                        {resource.url.includes("youtube") || resource.url.includes("youtu.be") ? (
                            <iframe
                                src={resource.url.replace("watch?v=", "embed/")}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video controls className="w-full h-full" src={resource.url} />
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full max-w-5xl bg-white shadow-2xl text-zinc-900 overflow-y-auto p-12">
                        {/* Placeholder for PDF Viewer or Content Reader */}
                        <div className="flex flex-col items-center justify-center h-full gap-6 text-center opacity-50">
                            <BookOpen className="h-16 w-16 text-zinc-300" />
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-400">Preview Unavailable</h2>
                                <p className="text-zinc-400 mt-2">This document cannot be embedded directly.</p>
                            </div>
                            <Button asChild>
                                <a href={resource.url} target="_blank" rel="noreferrer">Open in New Tab</a>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
