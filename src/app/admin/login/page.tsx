"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";
import { api } from "../../../../convex/_generated/api";

export default function AdminLoginPage() {
    const { signIn } = useAuthActions();
    const router = useRouter();
    const user = useQuery(api.users.currentUser);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ username: "admin", password: "" });

    useEffect(() => {
        if (user && user.role === "admin") {
            router.push("/admin");
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signIn("admin", { ...formData, redirectTo: "/admin" });
        } catch (error) {
            console.error("Admin Login Error:", error);
            toast.error("Invalid credentials or access denied");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    <p className="text-zinc-400">Restricted Area</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-zinc-300">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="username"
                            className="bg-zinc-950 border-zinc-800 text-white focus:ring-blue-600"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-300">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="bg-zinc-950 border-zinc-800 text-white focus:ring-blue-600"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingDots color="bg-white" /> : "Authenticate"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
