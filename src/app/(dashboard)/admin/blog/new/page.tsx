"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function NewBlogPage() {
    const router = useRouter();
    // Assuming api.blogs.create exists
    const createBlog = useMutation(api.blogs.create as any);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        isPublished: false,
        coverImage: ""
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        if (formData.slug === "" || formData.slug === generateSlug(formData.title)) {
            setFormData(prev => ({ ...prev, title, slug: generateSlug(title) }));
        } else {
            setFormData(prev => ({ ...prev, title }));
        }
    };

    const handleSubmit = async () => {
        try {
            await createBlog(formData);
            toast.success("Blog post created successfully");
            router.push("/admin/blog");
        } catch (error) {
            toast.error("Failed to create post");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h1 className="text-2xl font-bold">New Post</h1>
                <Button onClick={handleSubmit}>
                    <Save className="mr-2 h-4 w-4" /> Create
                </Button>
            </div>

            <Card>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="Post Title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="post-url-slug"
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
                            placeholder="Short summary..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Content (Markdown)</Label>
                        <Textarea
                            rows={15}
                            className="font-mono text-sm"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="# Blog Content"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
