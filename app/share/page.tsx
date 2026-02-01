"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Check, Mail, MessageCircle, Share2 } from "lucide-react";

function ShareContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const [copied, setCopied] = useState(false);

  const shareUrl = ref
    ? `https://groomroute.com?ref=${ref}`
    : "https://groomroute.com";

  const shareText =
    "Hey! I've been using GroomRoute to manage my mobile grooming schedule and it's been a game-changer. Optimized routes, easy scheduling, and way less driving. Check it out - you get a 14-day free trial:";

  const shareMessage = `${shareText} ${shareUrl}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "GroomRoute - Scheduling for Mobile Groomers",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent("Check out GroomRoute!")}&body=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Share Groom<span className="text-[#A5744A]">Route</span>
          </h1>
          <p className="text-gray-600 text-sm">
            Know a mobile groomer who could use less stress and more free time?
          </p>
        </div>

        {/* Share link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your referral link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="input input-bordered w-full border-2 border-gray-300 text-sm pl-4"
            />
            <button
              onClick={handleCopy}
              className="btn btn-square border-2 border-gray-300 bg-white hover:bg-gray-50"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-green-600 text-xs mt-1">Copied to clipboard!</p>
          )}
        </div>

        {/* Share options */}
        <div className="space-y-3">
          {typeof navigator !== "undefined" && navigator.share && (
            <button
              onClick={handleNativeShare}
              className="btn w-full bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
            >
              <Share2 className="h-5 w-5" />
              Share
            </button>
          )}

          <a
            href={smsUrl}
            className="btn w-full bg-green-600 hover:bg-green-700 text-white border-0 gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Text Message
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn w-full bg-[#25D366] hover:bg-[#1da851] text-white border-0 gap-2"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>

          <a
            href={emailUrl}
            className="btn w-full bg-gray-700 hover:bg-gray-800 text-white border-0 gap-2"
          >
            <Mail className="h-5 w-5" />
            Email
          </a>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          They&apos;ll get a free 14-day trial to try it out.
        </p>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
