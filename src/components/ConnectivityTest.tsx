"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ConnectivityTest() {
    const pong = useQuery(api.test.ping);
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    return (
        <div className="fixed bottom-4 right-4 bg-zinc-900 text-white p-4 rounded-lg shadow-lg z-50 text-xs font-mono">
            <h3 className="font-bold underline mb-2">Connectivity Debugger</h3>
            <div className="space-y-1">
                <p>
                    <span className="text-zinc-400">URL:</span>{" "}
                    {convexUrl ? (
                        <span className="text-green-400">Set ({convexUrl.slice(0, 20)}...)</span>
                    ) : (
                        <span className="text-red-500">MISSING (undefined)</span>
                    )}
                </p>
                <p>
                    <span className="text-zinc-400">Backend Status:</span>{" "}
                    {pong === "pong" ? (
                        <span className="text-green-400 font-bold">CONNECTED ✅</span>
                    ) : (
                        <span className="text-yellow-400 animate-pulse">CONNECTING...</span>
                    )}
                </p>
            </div>
        </div>
    );
}
