"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Dog, AlertTriangle, Clock, Shield, Zap, Info } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface GroomerSettings {
  name: string;
  largeDogDailyLimit: number | null;
  dailyIntensityLimit: number | null;
  defaultHasAssistant: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
}

export default function ProfileSettingsPage() {
  const [settings, setSettings] = useState<GroomerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [largeDogLimit, setLargeDogLimit] = useState<string>("");
  const [dailyIntensityLimit, setDailyIntensityLimit] = useState<number>(12);
  const [hasAssistant, setHasAssistant] = useState(false);
  const [workingHoursStart, setWorkingHoursStart] = useState("08:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("17:00");

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
        setDailyIntensityLimit(data.groomer.dailyIntensityLimit ?? 12);
        setHasAssistant(data.groomer.defaultHasAssistant);
        setWorkingHoursStart(data.groomer.workingHoursStart || "08:00");
        setWorkingHoursEnd(data.groomer.workingHoursEnd || "17:00");
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
          dailyIntensityLimit,
          defaultHasAssistant: hasAssistant,
          workingHoursStart,
          workingHoursEnd,
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

      {/* Daily Intensity Limit - Primary Workload Protection */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Zap className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Daily Intensity Limit</h2>
            <p className="text-sm text-gray-500">
              Your daily capacity for grooming based on difficulty, not just dog count
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Explanation */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">How it works:</p>
                <p>Each pet you groom has an intensity level you assign:</p>
                <ul className="mt-1 space-y-0.5">
                  <li><span className="inline-block w-20 font-medium text-emerald-600">Light (1)</span> — Short coats, small cooperative dogs, bath-only</li>
                  <li><span className="inline-block w-20 font-medium text-blue-600">Moderate (2)</span> — Average coat maintenance, typical behavior</li>
                  <li><span className="inline-block w-20 font-medium text-amber-600">Demanding (3)</span> — Doodles, double coats, large dogs</li>
                  <li><span className="inline-block w-20 font-medium text-red-600">Intensive (4)</span> — Matted coats, reactive dogs, very large + heavy coat</li>
                </ul>
                <p className="mt-2">
                  Your daily limit is the total intensity you can handle. Default of 12 = roughly 6 moderate grooms, or 4 demanding grooms, or 3 intensive grooms.
                </p>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Daily Intensity Limit
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="4"
                max="24"
                step="1"
                value={dailyIntensityLimit}
                onChange={(e) => setDailyIntensityLimit(parseInt(e.target.value))}
                className="range range-sm flex-1"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #10B981 ${((dailyIntensityLimit - 4) / (24 - 4)) * 100}%, #e5e7eb ${((dailyIntensityLimit - 4) / (24 - 4)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="input input-bordered w-24 h-10 text-base text-center flex items-center justify-center font-semibold">
                {dailyIntensityLimit}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
              <span>Light days (4)</span>
              <span>Default (12)</span>
              <span>Heavy days (24)</span>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-800">
              <span className="font-medium">With a limit of {dailyIntensityLimit}:</span>{" "}
              {dailyIntensityLimit >= 12 ? (
                <>You can handle roughly {Math.floor(dailyIntensityLimit / 2)} moderate grooms, or {Math.floor(dailyIntensityLimit / 3)} demanding grooms per day.</>
              ) : dailyIntensityLimit >= 8 ? (
                <>A lighter workload — roughly {Math.floor(dailyIntensityLimit / 2)} moderate grooms, or {Math.floor(dailyIntensityLimit / 3)} demanding grooms.</>
              ) : (
                <>A very light day — roughly {Math.floor(dailyIntensityLimit / 2)} moderate grooms.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Legacy Workload Preferences */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Dog className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Additional Limits</h2>
            <p className="text-sm text-gray-500">
              Extra limits based on dog size (optional)
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
                <span className="font-medium text-gray-900">Default to working with a assistant</span>
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
