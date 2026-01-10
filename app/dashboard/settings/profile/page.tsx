"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Dog, AlertTriangle, Clock, Shield, MessageSquare, Map } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface GroomerSettings {
  name: string;
  largeDogDailyLimit: number | null;
  defaultHasAssistant: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  preferredMessaging: "SMS" | "WHATSAPP";
  preferredMaps: "GOOGLE" | "APPLE";
}

export default function ProfileSettingsPage() {
  const [settings, setSettings] = useState<GroomerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [largeDogLimit, setLargeDogLimit] = useState<string>("");
  const [hasAssistant, setHasAssistant] = useState(false);
  const [workingHoursStart, setWorkingHoursStart] = useState("08:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("17:00");
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
        setSettings(data.groomer);
        setLargeDogLimit(data.groomer.largeDogDailyLimit?.toString() || "");
        setHasAssistant(data.groomer.defaultHasAssistant);
        setWorkingHoursStart(data.groomer.workingHoursStart || "08:00");
        setWorkingHoursEnd(data.groomer.workingHoursEnd || "17:00");
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
          largeDogDailyLimit: largeDogLimit === "" ? null : parseInt(largeDogLimit),
          defaultHasAssistant: hasAssistant,
          workingHoursStart,
          workingHoursEnd,
          preferredMessaging,
          preferredMaps,
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
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Shield className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workload Protection</h1>
            <p className="text-gray-600">
              Set limits to protect your energy and prevent burnout
            </p>
          </div>
        </div>
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

      {/* Working Hours */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Working Hours</h2>
            <p className="text-sm text-gray-500">
              Set your typical working hours. You&apos;ll see warnings when booking outside these times.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={workingHoursStart}
              onChange={(e) => setWorkingHoursStart(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={workingHoursEnd}
              onChange={(e) => setWorkingHoursEnd(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            When booking appointments outside {workingHoursStart && workingHoursEnd ? (
              <>
                {(() => {
                  const [h1, m1] = workingHoursStart.split(':');
                  const hour1 = parseInt(h1);
                  const period1 = hour1 >= 12 ? 'PM' : 'AM';
                  const h12_1 = hour1 % 12 || 12;
                  return `${h12_1}:${m1} ${period1}`;
                })()} - {(() => {
                  const [h2, m2] = workingHoursEnd.split(':');
                  const hour2 = parseInt(h2);
                  const period2 = hour2 >= 12 ? 'PM' : 'AM';
                  const h12_2 = hour2 % 12 || 12;
                  return `${h12_2}:${m2} ${period2}`;
                })()}
              </>
            ) : "your working hours"}, you&apos;ll see a warning to help you stay balanced.
          </p>
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">App Preferences</h2>
            <p className="text-sm text-gray-500">
              Choose your preferred messaging and maps apps
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Messaging Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Messaging App
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Choose which messaging button to show on appointment cards
            </p>
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
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Maps App
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Choose which maps app to use for navigation and directions
            </p>
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
                  <Map className="h-6 w-6 text-blue-500" />
                  <div>
                    <span className="font-medium text-gray-900">Google Maps</span>
                    <p className="text-xs text-gray-500">Default option</p>
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
                  <Map className="h-6 w-6 text-gray-700" />
                  <div>
                    <span className="font-medium text-gray-900">Apple Maps</span>
                    <p className="text-xs text-gray-500">For iOS users</p>
                  </div>
                  {preferredMaps === "APPLE" && (
                    <span className="ml-auto text-[#A5744A]">✓</span>
                  )}
                </div>
              </button>
            </div>
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
