"use client";

import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function UtilityBar() {
    return (
        <div className="w-full bg-zinc-900 text-zinc-300 text-[11px] font-medium py-2 hidden md:block border-b border-zinc-800">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <a href="mailto:hello@vadea.co.ke" className="flex items-center gap-2 hover:text-white transition-colors">
                        <Mail className="h-3 w-3 fill-current" />
                        <span>hello@vadea.co.ke</span>
                    </a>
                    <a href="tel:+254700000000" className="flex items-center gap-2 hover:text-white transition-colors">
                        <Phone className="h-3 w-3 fill-current" />
                        <span>+254 700 000 000</span>
                    </a>
                    <Link href="/become-teacher" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors ml-4">
                        <span>Become a Teacher</span>
                        <ExternalLink className="h-3 w-3 fill-current" />
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-zinc-500">Follow us:</span>
                    <div className="flex items-center gap-3">
                        <SocialLink href="#" icon={<Facebook className="h-3 w-3 fill-current" />} label="Facebook" />
                        <SocialLink href="#" icon={<Twitter className="h-3 w-3 fill-current" />} label="Twitter" />
                        <SocialLink href="#" icon={<Instagram className="h-3 w-3 fill-current" />} label="Instagram" />
                        <SocialLink href="#" icon={<Linkedin className="h-3 w-3 fill-current" />} label="LinkedIn" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a
            href={href}
            className="text-zinc-400 hover:text-white transition-all hover:scale-110"
            aria-label={label}
        >
            {icon}
        </a>
    );
}
