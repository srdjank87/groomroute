"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  MapPin,
  Edit2,
  Trash2,
  Users,
  Loader2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, addMonths, subMonths } from "date-fns";
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

interface DateOverride {
  id: string;
  date: string;
  areaId: string | null;
  areaName: string | null;
  areaColor: string | null;
}

interface MonthAreaData {
  [date: string]: {
    areaId: string;
    areaName: string;
    areaColor: string;
    isOverride: boolean;
  } | null;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MAX_SERVICE_AREAS = 6;
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

  // Monthly schedule state
  const [monthlyViewMonth, setMonthlyViewMonth] = useState(new Date());
  const [monthAreaData, setMonthAreaData] = useState<MonthAreaData>({});
  const [isLoadingMonthData, setIsLoadingMonthData] = useState(false);
  const [activeDateCell, setActiveDateCell] = useState<string | null>(null); // YYYY-MM-DD
  const [isSavingOverride, setIsSavingOverride] = useState(false);
  const [assignmentsVersion, setAssignmentsVersion] = useState(0); // Track when assignments change

  // Compute monthly area data from assignments (client-side, always fresh)
  // This replaces the API-based monthAreaData for the default weekly pattern
  const computedMonthAreaData = useMemo(() => {
    if (assignments.length === 0) return {};

    const groomerAssignment = assignments[0]; // Single groomer mode
    if (!groomerAssignment) return {};

    const result: MonthAreaData = {};
    const monthStart = startOfMonth(monthlyViewMonth);
    const monthEnd = endOfMonth(monthStart);

    let day = monthStart;
    while (day <= monthEnd) {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayOfWeek = day.getDay();

      // Check if there's an override in monthAreaData from API
      const override = monthAreaData[dateStr];
      if (override?.isOverride) {
        // Keep the override from API
        result[dateStr] = override;
      } else {
        // Use the current assignment from state (always fresh)
        const dayData = groomerAssignment.days[dayOfWeek];
        if (dayData) {
          result[dateStr] = {
            areaId: dayData.areaId,
            areaName: dayData.areaName,
            areaColor: dayData.areaColor,
            isOverride: false,
          };
        } else {
          result[dateStr] = null;
        }
      }

      day = addDays(day, 1);
    }

    return result;
  }, [assignments, monthlyViewMonth, monthAreaData]);

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

  const fetchMonthData = useCallback(async (month: Date) => {
    setIsLoadingMonthData(true);
    try {
      const monthStr = format(month, "yyyy-MM");
      const response = await fetch(`/api/appointments/calendar?month=${monthStr}&_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMonthAreaData(data.areasByDate || {});
      }
    } catch (error) {
      console.error("Failed to fetch month data:", error);
    } finally {
      setIsLoadingMonthData(false);
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

  // Load month data when month changes or assignments are updated
  useEffect(() => {
    if (areas.length > 0) {
      fetchMonthData(monthlyViewMonth);
    }
  }, [monthlyViewMonth, areas.length, fetchMonthData, assignmentsVersion]);

  const openCreateModal = () => {
    if (areas.length >= MAX_SERVICE_AREAS) {
      toast.error(`Maximum of ${MAX_SERVICE_AREAS} service areas allowed`);
      return;
    }
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
    if (!confirm(`Delete "${area.name}"? ${area.customerCount} clients will be unassigned.`)) {
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
        // Wait for assignment data refresh to complete
        await fetchAssignments();
        // Increment version to trigger useEffect to re-fetch month data
        setAssignmentsVersion(v => v + 1);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update assignment");
      }
    } catch (error) {
      console.error("Error setting assignment:", error);
      toast.error("Failed to update assignment");
    }
  };

  const handleSetDateOverride = async (date: string, areaId: string | null) => {
    setIsSavingOverride(true);
    try {
      const response = await fetch("/api/area-date-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, areaId }),
      });

      if (response.ok) {
        toast.success("Schedule updated");
        setActiveDateCell(null);
        fetchMonthData(monthlyViewMonth);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update schedule");
      }
    } catch (error) {
      console.error("Error setting date override:", error);
      toast.error("Failed to update schedule");
    } finally {
      setIsSavingOverride(false);
    }
  };

  const handleRemoveOverride = async (date: string) => {
    setIsSavingOverride(true);
    try {
      const response = await fetch("/api/area-date-overrides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });

      if (response.ok) {
        toast.success("Reverted to default");
        setActiveDateCell(null);
        fetchMonthData(monthlyViewMonth);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to revert");
      }
    } catch (error) {
      console.error("Error removing override:", error);
      toast.error("Failed to revert");
    } finally {
      setIsSavingOverride(false);
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
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={openCreateModal}
            disabled={areas.length >= MAX_SERVICE_AREAS}
            className="btn bg-[#A5744A] hover:bg-[#8B5A2B] text-white border-none gap-2 px-4 disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Plus className="h-5 w-5" />
            New Area
          </button>
          {areas.length >= MAX_SERVICE_AREAS && (
            <span className="text-xs text-gray-500">Maximum {MAX_SERVICE_AREAS} areas</span>
          )}
        </div>
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
              className="btn bg-[#A5744A] hover:bg-[#8B5A2B] text-white border-none px-6"
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
                    <span>{area.customerCount} customer{area.customerCount !== 1 ? "s" : ""}</span>
                  </div>
                  {/* Hide assigned days on mobile to prevent cutoff */}
                  {area.assignedDays.length > 0 && (
                    <div className="text-gray-400 hidden sm:block">
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

      {/* Weekly Default Schedule */}
      {areas.length > 0 && assignments.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Default Weekly Pattern
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Set your typical weekly pattern. You can override specific dates in the monthly view below.
          </p>

          {/* Simple 7-day grid for the single groomer */}
          {assignments.slice(0, 1).map((assignment) => (
            <div key={assignment.groomerId} className="bg-white rounded-xl border p-4">
              {/* Mobile: Vertical list layout */}
              <div className="flex flex-col gap-2 sm:hidden">
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
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                        dayData
                          ? "text-white hover:opacity-90"
                          : "bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                      }`}
                      style={dayData ? { backgroundColor: dayData.areaColor } : undefined}
                    >
                      <span className={`text-sm font-medium ${dayData ? "text-white/80" : "text-gray-500"}`}>
                        {FULL_DAY_NAMES[dayOfWeek]}
                      </span>
                      <span className={`text-sm font-semibold ${dayData ? "" : ""}`}>
                        {dayData ? dayData.areaName : "Not assigned"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Desktop: 7-column grid */}
              <div className="hidden sm:grid grid-cols-7 gap-2">
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

      {/* Monthly Schedule View */}
      {areas.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Monthly Schedule
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Tap any date to change the area for that specific day. Changes here override the default weekly pattern.
          </p>

          <div className="bg-white rounded-xl border p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setMonthlyViewMonth(subMonths(monthlyViewMonth, 1))}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                type="button"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {format(monthlyViewMonth, "MMMM yyyy")}
              </h3>
              <button
                onClick={() => setMonthlyViewMonth(addMonths(monthlyViewMonth, 1))}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                type="button"
              >
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((day, index) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{DAY_NAMES_SHORT[index]}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {isLoadingMonthData ? (
              <div className="h-[280px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#A5744A]" />
              </div>
            ) : (
              <div className="space-y-1">
                {(() => {
                  const monthStart = startOfMonth(monthlyViewMonth);
                  const monthEnd = endOfMonth(monthStart);
                  const calendarStart = startOfWeek(monthStart);
                  const calendarEnd = endOfWeek(monthEnd);

                  const rows: React.ReactElement[] = [];
                  let days: React.ReactElement[] = [];
                  let day = calendarStart;

                  while (day <= calendarEnd) {
                    for (let i = 0; i < 7; i++) {
                      const currentDay = day;
                      const dateStr = format(currentDay, "yyyy-MM-dd");
                      const isCurrentMonth = isSameMonth(currentDay, monthStart);
                      // Use computed data which combines fresh assignments with API overrides
                      const areaData = computedMonthAreaData[dateStr];

                      days.push(
                        <button
                          key={dateStr}
                          type="button"
                          disabled={!isCurrentMonth}
                          onClick={() => isCurrentMonth && setActiveDateCell(dateStr)}
                          className={`
                            relative p-1 sm:p-2 min-h-[40px] sm:min-h-[48px] rounded-lg transition-all text-left
                            ${!isCurrentMonth ? "text-gray-300 cursor-default" : "hover:ring-2 hover:ring-gray-300"}
                            ${areaData ? "" : isCurrentMonth ? "bg-gray-50 border border-dashed border-gray-200" : ""}
                          `}
                          style={isCurrentMonth && areaData ? { backgroundColor: areaData.areaColor + "20" } : undefined}
                        >
                          <span className={`text-xs sm:text-sm font-medium ${isCurrentMonth ? "text-gray-900" : ""}`}>
                            {format(currentDay, "d")}
                          </span>

                          {/* Area indicator - Mobile: just dot, Desktop: dot + name */}
                          {isCurrentMonth && areaData && (
                            <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                              <div
                                className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${areaData.isOverride ? "ring-1 ring-offset-1 ring-gray-400" : ""}`}
                                style={{ backgroundColor: areaData.areaColor }}
                              />
                              <span className="hidden sm:inline text-[10px] text-gray-600 truncate max-w-[60px]">
                                {areaData.areaName}
                              </span>
                            </div>
                          )}

                          {/* Day off indicator */}
                          {isCurrentMonth && !areaData && (
                            <span className="text-[10px] text-gray-400 block mt-0.5 sm:mt-1">—</span>
                          )}
                        </button>
                      );

                      day = addDays(day, 1);
                    }

                    rows.push(
                      <div key={day.toString()} className="grid grid-cols-7 gap-1">
                        {days}
                      </div>
                    );
                    days = [];
                  }

                  return rows;
                })()}
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-2 text-xs text-gray-500">
              {availableAreas.map(area => (
                <div key={area.id} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: area.color }}
                  />
                  <span>{area.name}</span>
                </div>
              ))}
              <div className="w-px h-4 bg-gray-300 mx-1 hidden sm:block" />
              <div className="w-full sm:w-auto flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-0 border-gray-200 mt-1 sm:mt-0">
                <div className="w-3 h-3 sm:w-2 sm:h-2 rounded-full bg-gray-400 ring-1 ring-offset-1 ring-gray-400 flex-shrink-0" />
                <span className="hidden sm:inline">Override (differs from default)</span>
                <span className="sm:hidden">Override</span>
              </div>
            </div>
          </div>
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
                  className="input w-full h-12 pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
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

      {/* Date Override Modal */}
      {activeDateCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {format(new Date(activeDateCell + "T12:00:00"), "EEEE, MMMM d")}
              </h3>
              <p className="text-sm text-gray-600">
                {computedMonthAreaData[activeDateCell]?.isOverride
                  ? "This date has a custom schedule"
                  : "Using default weekly pattern"}
              </p>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto">
              {/* Revert to default option (only show if there's an override) */}
              {computedMonthAreaData[activeDateCell]?.isOverride && (
                <button
                  onClick={() => handleRemoveOverride(activeDateCell)}
                  disabled={isSavingOverride}
                  className="w-full p-3 rounded-lg text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b mb-2"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">Revert to default</p>
                    <p className="text-xs text-gray-500">Use the weekly pattern for this date</p>
                  </div>
                </button>
              )}

              {/* Day off option */}
              <button
                onClick={() => handleSetDateOverride(activeDateCell, null)}
                disabled={isSavingOverride}
                className="w-full p-3 rounded-lg text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <X className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">Day off</p>
                  <p className="text-xs text-gray-500">No area scheduled for this day</p>
                </div>
              </button>

              {/* Area options */}
              {availableAreas.map((area) => {
                const currentArea = computedMonthAreaData[activeDateCell];
                const isSelected = currentArea?.areaId === area.id;
                return (
                  <button
                    key={area.id}
                    onClick={() => handleSetDateOverride(activeDateCell, area.id)}
                    disabled={isSavingOverride}
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
                onClick={() => setActiveDateCell(null)}
                disabled={isSavingOverride}
                className="w-full btn btn-ghost"
              >
                {isSavingOverride ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
