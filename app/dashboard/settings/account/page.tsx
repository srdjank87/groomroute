"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Building2, User, Clock } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface AccountInfo {
  account: {
    id: string;
    name: string;
    timezone: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  groomer: {
    workingHoursStart: string;
    workingHoursEnd: string;
  } | null;
}

// Common US timezones
const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Phoenix", label: "Arizona (no DST)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
];

// Time options for working hours dropdowns
const timeOptions = [
  { value: "06:00", label: "6:00 AM" },
  { value: "06:30", label: "6:30 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "07:30", label: "7:30 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "08:30", label: "8:30 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "09:30", label: "9:30 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "10:30", label: "10:30 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "11:30", label: "11:30 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "12:30", label: "12:30 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "13:30", label: "1:30 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "14:30", label: "2:30 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "15:30", label: "3:30 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "16:30", label: "4:30 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "17:30", label: "5:30 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "18:30", label: "6:30 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "19:30", label: "7:30 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "20:30", label: "8:30 PM" },
  { value: "21:00", label: "9:00 PM" },
];

export default function AccountSettingsPage() {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [userName, setUserName] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [workingHoursStart, setWorkingHoursStart] = useState("08:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("17:00");

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  async function fetchAccountInfo() {
    try {
      const response = await fetch("/api/account");
      if (response.ok) {
        const data = await response.json();
        setAccountInfo(data);
        setBusinessName(data.account.name || "");
        setUserName(data.user.name || "");
        setTimezone(data.account.timezone || "America/New_York");
        if (data.groomer) {
          setWorkingHoursStart(data.groomer.workingHoursStart || "08:00");
          setWorkingHoursEnd(data.groomer.workingHoursEnd || "17:00");
        }
      }
    } catch (error) {
      console.error("Failed to fetch account info:", error);
      toast.error("Failed to load account info");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          userName: userName.trim() || null,
          timezone,
          workingHoursStart,
          workingHoursEnd,
        }),
      });

      if (response.ok) {
        toast.success("Settings saved");
        fetchAccountInfo();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save settings");
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
          <div className="p-2 bg-orange-100 rounded-lg">
            <Building2 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600">
              Manage your business and profile information
            </p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Business Information</h2>
            <p className="text-sm text-gray-500">
              This name appears in customer emails and messages
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your grooming business name"
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="select select-bordered w-full"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Used for appointment scheduling and notifications
            </p>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      {accountInfo?.groomer && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Working Hours</h2>
              <p className="text-sm text-gray-500">
                Set your daily availability for appointments
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <select
                value={workingHoursStart}
                onChange={(e) => setWorkingHoursStart(e.target.value)}
                className="select select-bordered w-full pl-4"
              >
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <select
                value={workingHoursEnd}
                onChange={(e) => setWorkingHoursEnd(e.target.value)}
                className="select select-bordered w-full pl-4"
              >
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Appointments will be scheduled within these hours
          </p>
        </div>
      )}

      {/* Your Profile */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <User className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Your Profile</h2>
            <p className="text-sm text-gray-500">
              Your personal account information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={accountInfo?.user.email || ""}
              disabled
              className="input input-bordered w-full bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email address cannot be changed
            </p>
          </div>

          {accountInfo?.user.role && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${
                  accountInfo.user.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {accountInfo.user.role === "ADMIN" ? "Admin" : accountInfo.user.role}
                </span>
              </div>
            </div>
          )}
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
