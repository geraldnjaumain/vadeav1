import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl">404</h1>
            <h2 className="mt-4 text-xl font-semibold text-zinc-700">Page not found</h2>
            <p className="mt-2 text-zinc-500 max-w-md">
                Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed or doesn&apos;t exist.
            </p>
            <Button asChild className="mt-8 bg-zinc-900 text-white hover:bg-zinc-800">
                <Link href="/">
                    Go back home
                </Link>
            </Button>
        </div>
    );
}
