import Link from "next/link";
import Image from "next/image";

const GroomRouteLogo = () => (
  <span>Groom<span style={{ color: '#A5744A' }}>Route</span></span>
);

export default function NotFound() {
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
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page not found
          </h1>
          <p className="text-gray-600 mb-6">
            Looks like this page wandered off. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
            >
              Go to Dashboard
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back to Home
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Need help?{" "}
          <Link href="/help" className="text-[#A5744A] hover:underline">
            Visit our Help Center
          </Link>
        </p>
      </div>
    </div>
  );
}
