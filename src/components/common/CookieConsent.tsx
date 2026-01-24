"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consented = localStorage.getItem("vadea_cookie_consent");
        if (!consented) {
            setIsVisible(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem("vadea_cookie_consent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900 text-white z-[100] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border-t border-zinc-800 animate-in slide-in-from-bottom duration-500">
            <p className="text-sm text-zinc-300 text-center sm:text-left max-w-4xl">
                We use cookies to enhance your learning experience and analyze our traffic. By continuing to use our platform, you agree to our <a href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</a> and use of cookies.
            </p>
            <Button onClick={accept} size="sm" className="bg-white text-zinc-900 hover:bg-zinc-200 whitespace-nowrap font-medium px-6">
                Accept Cookies
            </Button>
        </div>
    );
}
