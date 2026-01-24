import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-zinc-950 border-t border-zinc-800 pt-16 pb-8 relative overflow-hidden">
            {/* Background Pattern - Modern Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#71717a 1px, transparent 1px), linear-gradient(to right, #71717a 1px, transparent 1px)`,
                    backgroundSize: '4rem 4rem',
                    maskImage: 'radial-gradient(circle at 60% 0%, black 40%, transparent 100%)'
                }}
            />
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <span className="text-3xl font-bold tracking-tighter text-white">vadea</span>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Empowering the next generation through interactive, competence-based online learning.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                                <Facebook className="h-4 w-4 fill-current" />
                            </Link>
                            <Link href="#" className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                                <Twitter className="h-4 w-4 fill-current" />
                            </Link>
                            <Link href="#" className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                                <Instagram className="h-4 w-4 fill-current" />
                            </Link>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-white">Platform</h3>
                        <div className="flex flex-col gap-2">
                            <Link href="/courses" className="text-sm text-zinc-400 hover:text-white hover:underline">Browse Courses</Link>
                            <Link href="/become-a-teacher" className="text-sm text-zinc-400 hover:text-white hover:underline">Become a Teacher</Link>
                            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-white hover:underline">Pricing</Link>
                            <Link href="/live-lessons" className="text-sm text-zinc-400 hover:text-white hover:underline">Live Lessons</Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-white">Company</h3>
                        <div className="flex flex-col gap-2">
                            <Link href="/about" className="text-sm text-zinc-400 hover:text-white hover:underline">About Us</Link>
                            <Link href="/blog" className="text-sm text-zinc-400 hover:text-white hover:underline">Blog</Link>
                            <Link href="/careers" className="text-sm text-zinc-400 hover:text-white hover:underline">Careers</Link>
                            <Link href="/contact" className="text-sm text-zinc-400 hover:text-white hover:underline">Contact</Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-white">Legal</h3>
                        <div className="flex flex-col gap-2">
                            <Link href="/terms" className="text-sm text-zinc-400 hover:text-white hover:underline">Terms of Service</Link>
                            <Link href="/privacy" className="text-sm text-zinc-400 hover:text-white hover:underline">Privacy Policy</Link>
                            <Link href="/cookies" className="text-sm text-zinc-400 hover:text-white hover:underline">Cookie Policy</Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <p>&copy; {new Date().getFullYear()} Vadea Inc. All rights reserved.</p>
                    <div className="flex items-center gap-1"></div>
                </div>
            </div>
        </footer>
    );
}
