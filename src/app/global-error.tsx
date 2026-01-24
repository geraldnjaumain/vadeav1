"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-zinc-900">
                Critical System Error
            </h2>
            <p className="mb-8 max-w-md text-zinc-600">
                A critical error occurred in the application layout.
            </p>
            <button
                className="rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800"
                onClick={() => reset()}
            >
                Reload Application
            </button>
        </div>
      </body>
    </html>
  );
}
