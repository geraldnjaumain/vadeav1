import { blogPosts } from "@/lib/blog-data";
import { BlogCard } from "@/components/blog/BlogCard";

export default function BlogPage() {
    return (
        <div className="py-24 bg-zinc-50 min-h-screen">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-20 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl mb-6">
                        Stories & Insights
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto font-light">
                        Explore the latest thinking on EdTech, CBC, and the future of education in Kenya.
                    </p>
                </div>

                <div className="flex flex-col gap-12">
                    {blogPosts.map((article) => (
                        <BlogCard key={article.id} article={article} />
                    ))}
                </div>
            </div>
        </div>
    );
}
