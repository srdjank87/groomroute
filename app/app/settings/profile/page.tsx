"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Dog, AlertTriangle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface GroomerSettings {
  name: string;
  largeDogDailyLimit: number | null;
  defaultHasAssistant: boolean;
}

export default function ProfileSettingsPage() {
  const [settings, setSettings] = useState<GroomerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [largeDogLimit, setLargeDogLimit] = useState<string>("");
  const [hasAssistant, setHasAssistant] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/groomer/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.groomer);
        setLargeDogLimit(data.groomer.largeDogDailyLimit?.toString() || "");
        setHasAssistant(data.groomer.defaultHasAssistant);
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
          largeDogDailyLimit: largeDogLimit === "" ? null : parseInt(largeDogLimit),
          defaultHasAssistant: hasAssistant,
        }),
      });

      if (response.ok) {
        toast.success("Settings saved");
        fetchSettings();
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
          href="/app/settings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your workload preferences and defaults
        </p>
      </div>

      {/* Workload Preferences */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Dog className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Workload Preferences</h2>
            <p className="text-sm text-gray-500">
              Set limits to protect your energy and prevent overexertion
            </p>
          </div>
        </div>

        {/* Large Dog Daily Limit */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Large Dog Daily Limit
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Dogs over 50 lbs are counted as large dogs. Set a limit to get warnings when booking.
            </p>
            <div className="flex items-center gap-4">
              <select
                value={largeDogLimit}
                onChange={(e) => setLargeDogLimit(e.target.value)}
                className="select select-bordered w-full max-w-xs"
              >
                <option value="">No limit</option>
                <option value="1">1 large dog per day</option>
                <option value="2">2 large dogs per day</option>
                <option value="3">3 large dogs per day</option>
                <option value="4">4 large dogs per day</option>
                <option value="5">5 large dogs per day</option>
              </select>
            </div>
            {largeDogLimit && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  You&apos;ll see a warning when booking appointments that would exceed {largeDogLimit} large dog{parseInt(largeDogLimit) !== 1 ? "s" : ""} on a day.
                </p>
              </div>
            )}
          </div>

          {/* Default Assistant Setting */}
          <div className="pt-4 border-t">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAssistant}
                onChange={(e) => setHasAssistant(e.target.checked)}
                className="checkbox checkbox-primary"
              />
              <div>
                <span className="font-medium text-gray-900">Default to working with a bather</span>
                <p className="text-xs text-gray-500">
                  When enabled, new routes will assume you have an assistant
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white gap-2"
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
