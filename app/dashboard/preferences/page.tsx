"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, MessageSquare, Map, Smartphone, User } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function MyPreferencesPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferredMessaging, setPreferredMessaging] = useState<"SMS" | "WHATSAPP">("SMS");
  const [preferredMaps, setPreferredMaps] = useState<"GOOGLE" | "APPLE">("GOOGLE");
  const [groomerName, setGroomerName] = useState<string | null>(null);

  const isGroomer = session?.user?.role === "GROOMER";

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/groomer/settings");
      if (response.ok) {
        const data = await response.json();
        setPreferredMessaging(data.groomer.preferredMessaging || "SMS");
        setPreferredMaps(data.groomer.preferredMaps || "GOOGLE");
        setGroomerName(data.groomer.name || null);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/groomer/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredMessaging,
          preferredMaps,
        }),
      });

      if (response.ok) {
        toast.success("Preferences saved");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Smartphone className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Preferences</h1>
            <p className="text-gray-600">
              Customize your app experience
            </p>
          </div>
        </div>
      </div>

      {/* Profile Info (for groomers) */}
      {isGroomer && groomerName && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-emerald-600 font-medium">Groomer Profile</p>
              <p className="font-semibold text-emerald-900">{groomerName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messaging Preference */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Messaging App</h2>
            <p className="text-sm text-gray-500">
              Choose which messaging button to show on appointment cards
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setPreferredMessaging("SMS")}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
              preferredMessaging === "SMS"
                ? "border-[#A5744A] bg-orange-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900">SMS / Text</span>
              <p className="text-sm text-gray-500">Standard text messaging</p>
            </div>
            {preferredMessaging === "SMS" && (
              <span className="text-[#A5744A] text-lg flex-shrink-0">✓</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setPreferredMessaging("WHATSAPP")}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
              preferredMessaging === "WHATSAPP"
                ? "border-[#A5744A] bg-orange-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#25D366] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900">WhatsApp</span>
              <p className="text-sm text-gray-500">WhatsApp messaging</p>
            </div>
            {preferredMessaging === "WHATSAPP" && (
              <span className="text-[#A5744A] text-lg flex-shrink-0">✓</span>
            )}
          </button>
        </div>
      </div>

      {/* Maps Preference */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Map className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Navigation App</h2>
            <p className="text-sm text-gray-500">
              Choose which maps app to use for directions
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setPreferredMaps("GOOGLE")}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
              preferredMaps === "GOOGLE"
                ? "border-[#A5744A] bg-orange-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center bg-white border">
              <svg viewBox="0 0 92.3 132.3" className="w-6 h-8">
                <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
                <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z"/>
                <path fill="#4285f4" d="M46.1 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.5-6.3"/>
                <path fill="#fbbc04" d="M46.1 63.5c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3"/>
                <path fill="#34a853" d="M59.2 109.2c15.4-24.1 33.3-35 33.3-63.1 0-9.1-2.6-17.8-7.4-25.1l-61.6 73.3c3.5 4.6 6.7 9.6 9.1 15.1 4.6 10.6 5.1 19.4 5.1 19.4h17.3s-.3-8.8 4.2-19.6"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900">Google Maps</span>
              <p className="text-sm text-gray-500">Works on all devices</p>
            </div>
            {preferredMaps === "GOOGLE" && (
              <span className="text-[#A5744A] text-lg flex-shrink-0">✓</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setPreferredMaps("APPLE")}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
              preferredMaps === "APPLE"
                ? "border-[#A5744A] bg-orange-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center flex-shrink-0 overflow-hidden">
              <svg viewBox="0 0 50 50" className="w-7 h-7">
                <path fill="#48c74a" d="M25 2C12.3 2 2 12.3 2 25s10.3 23 23 23 23-10.3 23-23S37.7 2 25 2z"/>
                <path fill="#359846" d="M25 4c11.6 0 21 9.4 21 21s-9.4 21-21 21S4 36.6 4 25 13.4 4 25 4m0-2C12.3 2 2 12.3 2 25s10.3 23 23 23 23-10.3 23-23S37.7 2 25 2z"/>
                <path fill="#fff" d="M25 8c-9.4 0-17 7.6-17 17s7.6 17 17 17 17-7.6 17-17S34.4 8 25 8zm0 31c-7.7 0-14-6.3-14-14s6.3-14 14-14 14 6.3 14 14-6.3 14-14 14z"/>
                <path fill="#ff3b2f" d="M25 13l-2 6h-6l5 4-2 6 5-4 5 4-2-6 5-4h-6z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900">Apple Maps</span>
              <p className="text-sm text-gray-500">Best for iOS devices</p>
            </div>
            {preferredMaps === "APPLE" && (
              <span className="text-[#A5744A] text-lg flex-shrink-0">✓</span>
            )}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white gap-2 px-4"
        >
          {isSaving ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Preferences
        </button>
      </div>
    </div>
  );
}
