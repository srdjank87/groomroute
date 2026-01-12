"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Users,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Phone,
  Mail,
  Crown,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useFeature } from "@/hooks/useFeatures";

interface Groomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  baseAddress: string;
  workingHoursStart: string | null;
  workingHoursEnd: string | null;
  isActive: boolean;
  defaultHasAssistant: boolean;
  largeDogDailyLimit: number | null;
}

export default function TeamSettingsPage() {
  const router = useRouter();
  const { hasAccess: hasMultiGroomer, isLoading: isCheckingAccess, plan } = useFeature("multi_groomer");

  const [groomers, setGroomers] = useState<Groomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroomer, setEditingGroomer] = useState<Groomer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    baseAddress: "",
    workingHoursStart: "08:00",
    workingHoursEnd: "17:00",
    defaultHasAssistant: false,
    largeDogDailyLimit: "",
  });

  useEffect(() => {
    fetchGroomers();
  }, []);

  const fetchGroomers = async () => {
    try {
      const response = await fetch("/api/groomers?active=false");
      if (response.ok) {
        const data = await response.json();
        setGroomers(data.groomers || []);
      }
    } catch (error) {
      console.error("Failed to fetch groomers:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      baseAddress: "",
      workingHoursStart: "08:00",
      workingHoursEnd: "17:00",
      defaultHasAssistant: false,
      largeDogDailyLimit: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingGroomer(null);
    setShowAddModal(true);
  };

  const openEditModal = (groomer: Groomer) => {
    setFormData({
      name: groomer.name,
      email: groomer.email || "",
      phone: groomer.phone || "",
      baseAddress: groomer.baseAddress,
      workingHoursStart: groomer.workingHoursStart || "08:00",
      workingHoursEnd: groomer.workingHoursEnd || "17:00",
      defaultHasAssistant: groomer.defaultHasAssistant,
      largeDogDailyLimit: groomer.largeDogDailyLimit?.toString() || "",
    });
    setEditingGroomer(groomer);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.baseAddress.trim()) {
      toast.error("Base address is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        baseAddress: formData.baseAddress.trim(),
        workingHoursStart: formData.workingHoursStart,
        workingHoursEnd: formData.workingHoursEnd,
        defaultHasAssistant: formData.defaultHasAssistant,
        largeDogDailyLimit: formData.largeDogDailyLimit
          ? parseInt(formData.largeDogDailyLimit)
          : null,
      };

      const url = editingGroomer
        ? `/api/groomers/${editingGroomer.id}`
        : "/api/groomers";
      const method = editingGroomer ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          editingGroomer ? "Team member updated" : "Team member added"
        );
        setShowAddModal(false);
        fetchGroomers();
      } else {
        if (data.upgradeRequired) {
          toast.error(data.error);
        } else {
          toast.error(data.error || "Failed to save");
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save team member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (groomer: Groomer) => {
    if (
      !confirm(
        `Deactivate ${groomer.name}? They will no longer appear in scheduling.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/groomers/${groomer.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Team member deactivated");
        fetchGroomers();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to deactivate");
      }
    } catch (error) {
      console.error("Deactivate error:", error);
      toast.error("Failed to deactivate team member");
    }
  };

  const handleReactivate = async (groomer: Groomer) => {
    try {
      const response = await fetch(`/api/groomers/${groomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      if (response.ok) {
        toast.success("Team member reactivated");
        fetchGroomers();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to reactivate");
      }
    } catch (error) {
      console.error("Reactivate error:", error);
      toast.error("Failed to reactivate team member");
    }
  };

  // Show loading state
  if (isCheckingAccess || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Show upgrade prompt for non-Pro users
  if (!hasMultiGroomer) {
    const activeGroomers = groomers.filter((g) => g.isActive);

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Manage groomers and vans in your business
          </p>
        </div>

        {/* Current Groomer Info */}
        {activeGroomers.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Groomer Profile
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">
                {activeGroomers[0].name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {activeGroomers[0].baseAddress}
              </p>
              {activeGroomers[0].workingHoursStart && (
                <p className="text-sm text-gray-500 mt-1">
                  Working hours: {activeGroomers[0].workingHoursStart} -{" "}
                  {activeGroomers[0].workingHoursEnd}
                </p>
              )}
            </div>
            <Link
              href="/dashboard/settings/profile"
              className="mt-4 inline-block text-sm text-[#A5744A] hover:underline font-medium"
            >
              Edit in Workload Protection settings →
            </Link>
          </div>
        )}

        {/* Upgrade Prompt */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Multi-Groomer Support
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add multiple groomers, manage team schedules, and view per-groomer
            analytics with the Pro plan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Multiple vans</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-purple-500" />
              <span>Team calendar</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span>Per-groomer routes</span>
            </div>
          </div>

          <Link
            href="/dashboard/settings/billing"
            className="btn bg-purple-600 hover:bg-purple-700 text-white border-0 gap-2 px-6"
          >
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </Link>
          <p className="text-xs text-gray-500 mt-3">
            Current plan: {plan || "Trial"}
          </p>
        </div>
      </div>
    );
  }

  // Pro users - show full team management
  const activeGroomers = groomers.filter((g) => g.isActive);
  const inactiveGroomers = groomers.filter((g) => !g.isActive);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Manage groomers and vans in your business
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 px-4"
        >
          <Plus className="h-5 w-5" />
          Add Groomer
        </button>
      </div>

      {/* Active Groomers */}
      <div className="bg-white rounded-xl shadow mb-6">
        <div className="p-4 border-b flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Active Team Members ({activeGroomers.length})
          </h2>
        </div>
        <div className="divide-y">
          {activeGroomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No active team members. Add your first groomer to get started.
            </div>
          ) : (
            activeGroomers.map((groomer) => (
              <div
                key={groomer.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{groomer.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {groomer.baseAddress}
                    </span>
                    {groomer.workingHoursStart && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {groomer.workingHoursStart} - {groomer.workingHoursEnd}
                      </span>
                    )}
                    {groomer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {groomer.email}
                      </span>
                    )}
                    {groomer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {groomer.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openEditModal(groomer)}
                    className="btn btn-ghost btn-sm gap-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeactivate(groomer)}
                    className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50 gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Deactivate
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inactive Groomers */}
      {inactiveGroomers.length > 0 && (
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-500">
              Inactive Team Members ({inactiveGroomers.length})
            </h2>
          </div>
          <div className="divide-y opacity-60">
            {inactiveGroomers.map((groomer) => (
              <div
                key={groomer.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-700">{groomer.name}</p>
                  <p className="text-sm text-gray-500">{groomer.baseAddress}</p>
                </div>
                <button
                  onClick={() => handleReactivate(groomer)}
                  className="btn btn-ghost btn-sm text-emerald-600 hover:bg-emerald-50"
                >
                  Reactivate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingGroomer ? "Edit Team Member" : "Add Team Member"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Smith"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Base Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Address (Start/End Location) *
                </label>
                <input
                  type="text"
                  value={formData.baseAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, baseAddress: e.target.value })
                  }
                  placeholder="123 Main St, City, State ZIP"
                  className="input input-bordered w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Where this groomer starts and ends their day
                </p>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.workingHoursStart}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workingHoursStart: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.workingHoursEnd}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workingHoursEnd: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Large Dog Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Large Dog Limit
                </label>
                <input
                  type="number"
                  value={formData.largeDogDailyLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      largeDogDailyLimit: e.target.value,
                    })
                  }
                  placeholder="No limit"
                  min="0"
                  className="input input-bordered w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for no limit
                </p>
              </div>

              {/* Has Assistant */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasAssistant"
                  checked={formData.defaultHasAssistant}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultHasAssistant: e.target.checked,
                    })
                  }
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <label htmlFor="hasAssistant" className="text-sm text-gray-700">
                  Usually works with a bather/assistant
                </label>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 px-4"
              >
                {isSaving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : null}
                {editingGroomer ? "Save Changes" : "Add Groomer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
