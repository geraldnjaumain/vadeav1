"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">
      <h2 className="mb-4 text-2xl font-bold text-zinc-900">
        Something went wrong!
      </h2>
      <p className="mb-8 max-w-md text-zinc-600">
        We apologize for the inconvenience. The application encountered an unexpected error.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          variant="default"
        >
          Try again
        </Button>
        <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
        >
            Go Home
        </Button>
      </div>
    </div>
  );
}
