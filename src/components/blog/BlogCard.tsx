import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/blog-data";
import { ArrowRight } from "lucide-react";

interface BlogCardProps {
    article: BlogPost;
}

export function BlogCard({ article }: BlogCardProps) {
    return (
        <Link href={`/blog/${article.slug}`} className="group block h-full">
            <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-zinc-200 transition-all duration-300 hover:shadow-lg">
                {/* Image Top */}
                <div className="relative w-full aspect-video overflow-hidden">
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                </div>

                {/* Content Body */}
                <div className="flex-1 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
                            {article.category}
                        </span>
                        <span className="text-xs text-zinc-400">• {article.readTime}</span>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                    </h3>

                    <p className="text-zinc-500 text-sm leading-relaxed mb-4 line-clamp-3">
                        {article.excerpt}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-100">
                        <div className="flex items-center gap-2">
                            <img
                                src={article.authorImage}
                                alt={article.author}
                                className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs font-medium text-zinc-600">{article.author}</span>
                        </div>
                        <span className="text-blue-600">
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
