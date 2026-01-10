"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  MapPin,
  Edit2,
  Trash2,
  Users,
  Loader2,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface ServiceArea {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  customerCount: number;
  assignedDays: {
    dayOfWeek: number;
    groomerId: string;
    groomerName: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface Groomer {
  id: string;
  name: string;
}

interface AreaAssignment {
  groomerId: string;
  groomerName: string;
  days: Record<number, { areaId: string; areaName: string; areaColor: string } | null>;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PRESET_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#14B8A6", // Teal
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

export default function SettingsAreasPage() {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [assignments, setAssignments] = useState<AreaAssignment[]>([]);
  const [availableAreas, setAvailableAreas] = useState<{ id: string; name: string; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Assignment dropdown state
  const [activeAssignmentCell, setActiveAssignmentCell] = useState<{
    groomerId: string;
    dayOfWeek: number;
  } | null>(null);

  const fetchAreas = useCallback(async () => {
    try {
      const response = await fetch("/api/areas");
      if (response.ok) {
        const data = await response.json();
        setAreas(data.areas);
      }
    } catch (error) {
      console.error("Failed to fetch areas:", error);
      toast.error("Failed to load areas");
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch("/api/area-assignments");
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
        setAvailableAreas(data.areas);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAreas(), fetchAssignments()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchAreas, fetchAssignments]);

  const openCreateModal = () => {
    setEditingArea(null);
    setFormData({ name: "", color: PRESET_COLORS[areas.length % PRESET_COLORS.length] });
    setShowModal(true);
  };

  const openEditModal = (area: ServiceArea) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      color: area.color,
    });
    setShowModal(true);
  };

  const handleSaveArea = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingArea ? `/api/areas/${editingArea.id}` : "/api/areas";
      const method = editingArea ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          color: formData.color,
        }),
      });

      if (response.ok) {
        toast.success(editingArea ? "Area updated" : "Area created");
        setShowModal(false);
        fetchAreas();
        fetchAssignments();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save area");
      }
    } catch (error) {
      console.error("Error saving area:", error);
      toast.error("Failed to save area");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArea = async (area: ServiceArea) => {
    if (!confirm(`Delete "${area.name}"? ${area.customerCount} customers will be unassigned.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/areas/${area.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Area deleted");
        fetchAreas();
        fetchAssignments();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete area");
      }
    } catch (error) {
      console.error("Error deleting area:", error);
      toast.error("Failed to delete area");
    }
  };

  const handleSetAssignment = async (
    groomerId: string,
    dayOfWeek: number,
    areaId: string | null
  ) => {
    setActiveAssignmentCell(null);

    try {
      const response = await fetch("/api/area-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groomerId, dayOfWeek, areaId }),
      });

      if (response.ok) {
        toast.success(areaId ? "Assignment updated" : "Assignment removed");
        fetchAssignments();
        fetchAreas();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update assignment");
      }
    } catch (error) {
      console.error("Error setting assignment:", error);
      toast.error("Failed to update assignment");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#A5744A]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Areas</h1>
          <p className="text-gray-600 mt-1">
            Create areas for different parts of your service territory and assign
            them to days of the week to reduce drive time.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn bg-[#A5744A] hover:bg-[#8B5A2B] text-white border-none gap-2"
        >
          <Plus className="h-5 w-5" />
          New Area
        </button>
      </div>

      {/* Areas List */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Areas</h2>
        </div>

        {areas.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No areas defined yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create service areas to organize your customers by location and
              optimize your routes.
            </p>
            <button
              onClick={openCreateModal}
              className="btn bg-[#A5744A] hover:bg-[#8B5A2B] text-white border-none"
            >
              Create Your First Area
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <div
                key={area.id}
                className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: area.color }}
                    />
                    <h3 className="font-semibold text-gray-900">{area.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(area)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArea(area)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {area.customerCount} customer{area.customerCount !== 1 ? "s" : ""}
                  </div>
                  {area.assignedDays.length > 0 && (
                    <div className="text-gray-400">
                      {area.assignedDays
                        .map((d) => DAY_NAMES[d.dayOfWeek])
                        .join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Schedule */}
      {areas.length > 0 && assignments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Weekly Area Schedule
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Tap a day to assign which area you&apos;ll be working in. This helps optimize your routes.
          </p>

          {/* Simple 7-day grid for the single groomer */}
          {assignments.slice(0, 1).map((assignment) => (
            <div key={assignment.groomerId} className="bg-white rounded-xl border p-4">
              <div className="grid grid-cols-7 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const dayData = assignment.days[dayOfWeek];
                  return (
                    <button
                      key={dayOfWeek}
                      onClick={() =>
                        setActiveAssignmentCell({
                          groomerId: assignment.groomerId,
                          dayOfWeek,
                        })
                      }
                      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                        dayData
                          ? "text-white hover:opacity-90"
                          : "bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                      }`}
                      style={dayData ? { backgroundColor: dayData.areaColor } : undefined}
                    >
                      <span className={`text-xs font-medium ${dayData ? "text-white/80" : "text-gray-500"}`}>
                        {DAY_NAMES[dayOfWeek]}
                      </span>
                      <span className={`text-sm font-semibold mt-1 truncate max-w-full ${dayData ? "" : ""}`}>
                        {dayData ? dayData.areaName : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Area Selection Modal */}
      {activeAssignmentCell && assignments.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {DAY_NAMES[activeAssignmentCell.dayOfWeek]} Area
              </h3>
              <p className="text-sm text-gray-600">
                Which area will you work in on {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][activeAssignmentCell.dayOfWeek]}?
              </p>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto">
              {/* No area option */}
              <button
                onClick={() =>
                  handleSetAssignment(
                    activeAssignmentCell.groomerId,
                    activeAssignmentCell.dayOfWeek,
                    null
                  )
                }
                className="w-full p-3 rounded-lg text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <X className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">No area assigned</p>
                  <p className="text-xs text-gray-500">Day off or flexible routing</p>
                </div>
              </button>

              {/* Area options */}
              {availableAreas.map((area) => {
                const currentArea = assignments[0]?.days[activeAssignmentCell.dayOfWeek];
                const isSelected = currentArea?.areaId === area.id;
                return (
                  <button
                    key={area.id}
                    onClick={() =>
                      handleSetAssignment(
                        activeAssignmentCell.groomerId,
                        activeAssignmentCell.dayOfWeek,
                        area.id
                      )
                    }
                    className={`w-full p-3 rounded-lg text-left flex items-center gap-3 transition-colors ${
                      isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: area.color }}
                    >
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{area.name}</p>
                      <p className="text-xs text-gray-500">
                        {areas.find(a => a.id === area.id)?.customerCount || 0} clients in this area
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-medium text-[#A5744A]">Current</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t bg-gray-50">
              <button
                onClick={() => setActiveAssignmentCell(null)}
                className="w-full btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingArea ? "Edit Area" : "Create Area"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., North Side, Downtown, Westwood"
                  className="input input-bordered w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Name your area based on neighborhoods or landmarks your customers know.
                </p>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === color
                          ? "ring-2 ring-offset-2 ring-gray-400"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArea}
                disabled={isSaving}
                className="btn bg-[#A5744A] hover:bg-[#8B5A2B] text-white border-none"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
                {editingArea ? "Save Changes" : "Create Area"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
