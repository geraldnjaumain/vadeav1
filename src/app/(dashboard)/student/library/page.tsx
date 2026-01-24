"use client";

import { useQuery, useMutation } from "convex/react";
import { PageSkeleton } from "@/components/ui/skeleton";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Video, FileText, Search, ExternalLink, Loader2, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LibraryPage() {


    const resources = useQuery(api.library.getResources, {});
    const seedResources = useMutation(api.library.seedResources);
    const [searchQuery, setSearchQuery] = useState("");

    if (resources === undefined) {
        return <PageSkeleton />;
    }

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const books = filteredResources.filter(r => r.type === "book");
    const videos = filteredResources.filter(r => r.type === "video");
    const papers = filteredResources.filter(r => r.type === "paper");

    const handleSeed = async () => {
        try {
            await seedResources();
            toast.success("Library seeded with demo content");
        } catch (e) {
            toast.error("Failed to seed library");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Library</h1>
                    <p className="text-zinc-500">Access supplementary learning materials</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search resources..."
                            className="pl-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Dev only seed button */}
                    {resources.length === 0 && (
                        <Button variant="outline" onClick={handleSeed}>
                            Seed Data
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="books">Books</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="papers">Papers</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <ResourceGrid resources={filteredResources} />
                </TabsContent>
                <TabsContent value="books" className="mt-6">
                    <ResourceGrid resources={books} />
                </TabsContent>
                <TabsContent value="videos" className="mt-6">
                    <ResourceGrid resources={videos} />
                </TabsContent>
                <TabsContent value="papers" className="mt-6">
                    <ResourceGrid resources={papers} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ResourceGrid({ resources }: { resources: any[] }) {
    if (resources.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                <p className="text-zinc-500">No resources found.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {resources.map((resource) => (
                <Card key={resource._id} className="overflow-hidden group hover:shadow-md transition-all border-zinc-200">
                    <div className="aspect-[4/3] bg-zinc-100 relative">
                        {resource.thumbnail ? (
                            <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                <BookOpen className="h-12 w-12" />
                            </div>
                        )}
                        <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 backdrop-blur text-zinc-800 shadow-sm">
                                {resource.type}
                            </Badge>
                        </div>
                    </div>
                    <CardHeader className="p-4">
                        <div className="text-xs font-medium text-blue-600 mb-1">{resource.subject}</div>
                        <CardTitle className="text-base line-clamp-1 group-hover:text-blue-700 transition-colors">
                            {resource.title}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0">
                        <Button variant="default" size="sm" className="w-full bg-zinc-900 hover:bg-blue-600 gap-2" asChild>
                            <a href={resource.url} target="_blank" rel="noreferrer">
                                {resource.type === "video" ? <Video className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                                {resource.type === "video" ? "Watch Now" : "Download"}
                            </a>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
