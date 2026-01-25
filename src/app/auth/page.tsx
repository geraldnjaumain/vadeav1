"use client";

import { AuthButtons } from "@/components/layout/AuthButtons";
import { Logo } from "@/components/brand/Logo";
import Link from "next/link";
import { Suspense } from "react";

export default function AuthPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4">
            <Link href="/" className="flex items-center gap-2 mb-8">
                <Logo className="text-blue-900 h-10 w-auto" />
                <span className="text-3xl font-bold tracking-tighter text-blue-900 leading-none">
                    vadea
                </span>
            </Link>

            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center space-y-6">
                <h1 className="text-2xl font-bold text-zinc-900">Welcome to Vadea</h1>
                <p className="text-zinc-500">
                    Sign in or create an account to get started with the best CBC learning platform.
                </p>

                <Suspense fallback={<div>Loading options...</div>}>
                    <div className="flex flex-col gap-4">
                        <AuthButtons />
                    </div>
                </Suspense>
            </div>
        </div>
    );
}
