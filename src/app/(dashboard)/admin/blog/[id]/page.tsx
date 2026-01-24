"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function BlogEditorPage() {
    const params = useParams();
    const router = useRouter();
    const isNew = !params.id; // Correct check if params.id is undefined for new?
    // Actually, for /new, params.id won't exist if route is /admin/blog/new/page.tsx.
    // But I'm creating [id]/page.tsx. /new needs a separate file or handle logic.
    // I created both folders. I'll put this logic in a shared form or specific pages.
    // This file content is for `[id]/page.tsx`.

    // For /new, I'll copy this but remove the Query.
    // Let's assume this is the Edit page.
    const blogId = params.id as Id<"blogs">;

    const blog = useQuery(api.blogs.get, { id: blogId });
    const updateBlog = useMutation(api.blogs.update);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        isPublished: false,
        coverImage: ""
    });

    useEffect(() => {
        if (blog) {
            setFormData({
                title: blog.title,
                slug: blog.slug,
                excerpt: blog.excerpt || "",
                content: blog.content,
                isPublished: blog.isPublished,
                coverImage: blog.coverImage || ""
            });
        }
    }, [blog]);

    const handleSubmit = async () => {
        try {
            await updateBlog({
                id: blogId,
                ...formData
            });
            toast.success("Blog updated successfully");
            router.push("/admin/blog");
        } catch (error) {
            toast.error("Failed to update blog");
        }
    };

    if (blog === undefined) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h1 className="text-2xl font-bold">Edit Post</h1>
                <Button onClick={handleSubmit}>
                    <Save className="mr-2 h-4 w-4" /> Save
                </Button>
            </div>

            <Card>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.isPublished}
                                onCheckedChange={(c) => setFormData({ ...formData, isPublished: c })}
                            />
                            <span>{formData.isPublished ? "Published" : "Draft"}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Excerpt</Label>
                        <Textarea
                            rows={3}
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Content (Markdown)</Label>
                        <Textarea
                            rows={15}
                            className="font-mono text-sm"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
