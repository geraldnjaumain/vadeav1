import Link from "next/link";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/lib/blog-data";
import { BlogCard } from "@/components/blog/BlogCard";

export function BlogPreview() {
    // Show only the first 3 posts
    const featuredPosts = blogPosts.slice(0, 3);

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-2 block">
                            Latest Updates
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-4">
                            Insights & Resources
                        </h2>
                        <p className="text-lg text-zinc-500 leading-relaxed max-w-xl">
                            Expert advice on CBC education, digital learning, and student success.
                        </p>
                    </div>
                    <Button variant="outline" className="hidden md:inline-flex border-zinc-200 hover:bg-zinc-50 hover:text-blue-600 transition-all rounded-lg px-6" asChild>
                        <Link href="/blog">
                            View All Articles
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredPosts.map((post) => (
                        <BlogCard key={post.id} article={post} />
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Button variant="outline" className="w-full border-zinc-200" asChild>
                        <Link href="/blog">
                            View All Articles
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
