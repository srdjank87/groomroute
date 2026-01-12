"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, MessageSquare, Map, Smartphone } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AppPreferencesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferredMessaging, setPreferredMessaging] = useState<"SMS" | "WHATSAPP">("SMS");
  const [preferredMaps, setPreferredMaps] = useState<"GOOGLE" | "APPLE">("GOOGLE");

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
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
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
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Smartphone className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">App Preferences</h1>
            <p className="text-gray-600">
              Choose your preferred messaging and navigation apps
            </p>
          </div>
        </div>
      </div>

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

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPreferredMessaging("SMS")}
            className={`p-4 rounded-lg border-2 transition-colors text-left ${
              preferredMessaging === "SMS"
                ? "border-[#A5744A] bg-orange-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <span className="font-medium text-gray-900">SMS / Text</span>
                <p className="text-xs text-gray-500">Standard text messaging</p>
              </div>
              {preferredMessaging === "SMS" && (
                <span className="ml-auto text-[#A5744A]">✓</span>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPreferredMessaging("WHATSAPP")}
            className={`p-4 rounded-lg border-2 transition-colors text-left ${
              preferredMessaging === "WHATSAPP"
                ? "border-[#A5744A] bg-orange-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💚</span>
              <div>
                <span className="font-medium text-gray-900">WhatsApp</span>
                <p className="text-xs text-gray-500">WhatsApp messaging</p>
              </div>
              {preferredMessaging === "WHATSAPP" && (
                <span className="ml-auto text-[#A5744A]">✓</span>
              )}
            </div>
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

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPreferredMaps("GOOGLE")}
            className={`p-4 rounded-lg border-2 transition-colors text-left ${
              preferredMaps === "GOOGLE"
                ? "border-[#A5744A] bg-orange-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <span className="font-medium text-gray-900">Google Maps</span>
                <p className="text-xs text-gray-500">Works on all devices</p>
              </div>
              {preferredMaps === "GOOGLE" && (
                <span className="ml-auto text-[#A5744A]">✓</span>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPreferredMaps("APPLE")}
            className={`p-4 rounded-lg border-2 transition-colors text-left ${
              preferredMaps === "APPLE"
                ? "border-[#A5744A] bg-orange-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍎</span>
              <div>
                <span className="font-medium text-gray-900">Apple Maps</span>
                <p className="text-xs text-gray-500">Best for iOS devices</p>
              </div>
              {preferredMaps === "APPLE" && (
                <span className="ml-auto text-[#A5744A]">✓</span>
              )}
            </div>
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
          Save Changes
        </button>
      </div>
    </div>
  );
}
