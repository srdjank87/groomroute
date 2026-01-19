"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const GroomRouteLogo = () => (
  <span>Groom<span style={{ color: '#A5744A' }}>Route</span></span>
);

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Image
            src="/images/icon.svg"
            alt="GroomRoute"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-bold text-xl">
            <GroomRouteLogo />
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 border">
          <div className="text-6xl mb-4">🐕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We hit an unexpected bump in the road. Don&apos;t worry, your data is safe.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
            >
              Try again
            </button>
            <Link href="/dashboard" className="btn btn-ghost">
              Go to Dashboard
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          If this keeps happening, please{" "}
          <a href="mailto:hello@groomroute.com" className="text-[#A5744A] hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
