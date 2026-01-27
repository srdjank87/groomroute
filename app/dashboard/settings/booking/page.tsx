"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Globe, Copy, ExternalLink, Check, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface GroomerSettings {
  name: string;
  bookingSlug: string | null;
  bookingEnabled: boolean;
}

export default function BookingSettingsPage() {
  const [settings, setSettings] = useState<GroomerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [bookingSlug, setBookingSlug] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/groomer/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.groomer);
        setBookingEnabled(data.groomer.bookingEnabled);
        setBookingSlug(data.groomer.bookingSlug || "");

        // Generate default slug from name if not set
        if (!data.groomer.bookingSlug && data.groomer.name) {
          const defaultSlug = data.groomer.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          setBookingSlug(defaultSlug);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }

  function validateSlug(slug: string): string | null {
    if (!slug) return null;
    if (slug.length < 3) return "URL must be at least 3 characters";
    if (slug.length > 50) return "URL must be 50 characters or less";
    if (!/^[a-z0-9-]+$/.test(slug)) return "Only lowercase letters, numbers, and hyphens allowed";
    if (slug.startsWith("-") || slug.endsWith("-")) return "URL cannot start or end with a hyphen";
    return null;
  }

  function handleSlugChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setBookingSlug(cleaned);
    setSlugError(validateSlug(cleaned));
  }

  async function handleSave() {
    const error = validateSlug(bookingSlug);
    if (error && bookingEnabled) {
      setSlugError(error);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/groomer/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingEnabled,
          bookingSlug: bookingSlug || null,
        }),
      });

      if (response.ok) {
        toast.success("Settings saved");
        fetchSettings();
      } else {
        const data = await response.json();
        if (data.error?.includes("already taken")) {
          setSlugError("This URL is already taken. Try another one.");
        } else {
          toast.error(data.error || "Failed to save settings");
        }
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  function copyBookingUrl() {
    const url = `${window.location.origin}/book/${bookingSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Booking URL copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${bookingSlug}`;
  const hasValidSlug = bookingSlug && !slugError;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Globe className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Online Booking</h1>
            <p className="text-gray-600">
              Let clients book appointments 24/7 with your personal booking link
            </p>
          </div>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bookingEnabled ? "bg-teal-100" : "bg-gray-100"}`}>
              <Sparkles className={`h-5 w-5 ${bookingEnabled ? "text-teal-600" : "text-gray-400"}`} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Accept Online Bookings</h2>
              <p className="text-sm text-gray-500">
                {bookingEnabled
                  ? "Clients can book appointments through your booking page"
                  : "Online booking is currently disabled"}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={bookingEnabled}
            onChange={(e) => setBookingEnabled(e.target.checked)}
            className="toggle toggle-lg toggle-success"
          />
        </div>
      </div>

      {/* Booking URL Configuration */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Your Booking URL</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom URL Slug
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-gray-50 border rounded-lg overflow-hidden">
                <span className="px-3 py-2.5 text-gray-500 text-sm bg-gray-100 border-r">
                  {typeof window !== "undefined" ? window.location.origin : ""}/book/
                </span>
                <input
                  type="text"
                  value={bookingSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="your-name-grooming"
                  className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm"
                />
              </div>
            </div>
            {slugError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {slugError}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              This is the unique link you share with clients. Use letters, numbers, and hyphens only.
            </p>
          </div>

          {/* Preview & Copy */}
          {hasValidSlug && (
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
              <p className="text-sm text-teal-800 font-medium mb-2">
                Your booking link:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border text-teal-700 truncate">
                  {bookingUrl}
                </code>
                <button
                  onClick={copyBookingUrl}
                  disabled={!bookingEnabled}
                  className="btn btn-sm gap-1"
                  title={bookingEnabled ? "Copy URL" : "Enable booking first"}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
                <Link
                  href={bookingEnabled ? `/book/${bookingSlug}` : "#"}
                  target="_blank"
                  className={`btn btn-sm gap-1 ${!bookingEnabled ? "btn-disabled" : ""}`}
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">How It Works</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
              1
            </div>
            <p className="text-sm text-gray-600">
              Share your booking link with clients via text, email, or social media
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
              2
            </div>
            <p className="text-sm text-gray-600">
              Clients enter their address to see recommended days based on your service areas
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
              3
            </div>
            <p className="text-sm text-gray-600">
              They pick a date and time, enter their details, and the booking appears on your calendar
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving || (bookingEnabled && slugError !== null)}
          className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white gap-2 px-4"
        >
          {isSaving ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}
