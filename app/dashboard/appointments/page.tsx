"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Plus, Calendar, MapPin, Clock, X, Filter, ChevronLeft, ChevronRight, Sparkles, Check, Phone, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { AppointmentCalendar } from "@/components/ui/appointment-calendar";

// Day assignment type for calendar
interface DayAssignment {
  areaId: string;
  areaName: string;
  areaColor: string;
}

interface Appointment {
  id: string;
  startAt: string;
  serviceMinutes: number;
  appointmentType: string;
  price: number;
  status: string;
  customer: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    serviceArea?: {
      id: string;
      name: string;
      color: string;
    } | null;
  };
  pet?: {
    id: string;
    name: string;
    species?: string;
    breed?: string;
    weight?: number;
  };
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "CONFIRMED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

// Inline time editor component
function TimeEditor({
  appointment,
  onUpdate,
}: {
  appointment: Appointment;
  onUpdate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const startInputRef = useRef<HTMLInputElement>(null);

  const date = new Date(appointment.startAt);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const endDate = new Date(date.getTime() + appointment.serviceMinutes * 60000);
  const endHours = endDate.getUTCHours();
  const endMinutes = endDate.getUTCMinutes();

  const formatTime12 = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const formatTime24 = (h: number, m: number) => {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const handleStartEdit = () => {
    setStartTime(formatTime24(hours, minutes));
    setEndTime(formatTime24(endHours, endMinutes));
    setIsEditing(true);
    setTimeout(() => startInputRef.current?.focus(), 0);
  };

  const handleSave = async () => {
    if (!startTime || !endTime) return;

    // Calculate new duration from times
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMinutesTotal = startH * 60 + startM;
    const endMinutesTotal = endH * 60 + endM;
    const newDuration = endMinutesTotal - startMinutesTotal;

    if (newDuration <= 0) {
      toast.error("End time must be after start time");
      return;
    }

    // Build new startAt date
    const originalDate = new Date(appointment.startAt);
    const dateStr = `${originalDate.getUTCFullYear()}-${String(originalDate.getUTCMonth() + 1).padStart(2, "0")}-${String(originalDate.getUTCDate()).padStart(2, "0")}`;
    const newStartAt = `${dateStr}T${startTime}:00.000Z`;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: newStartAt,
          serviceMinutes: newDuration,
        }),
      });

      if (response.ok) {
        toast.success("Time updated");
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error("Failed to update time");
      }
    } catch (error) {
      toast.error("Failed to update time");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const isEditable = appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && appointment.status !== "NO_SHOW";

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-400" />
        <input
          ref={startInputRef}
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="input input-bordered input-sm w-24 text-sm"
        />
        <span className="text-gray-400">-</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="input input-bordered input-sm w-24 text-sm"
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-ghost btn-xs text-green-600 hover:bg-green-50"
        >
          {isSaving ? <span className="loading loading-spinner loading-xs"></span> : <Check className="h-4 w-4" />}
        </button>
        <button
          onClick={handleCancel}
          className="btn btn-ghost btn-xs text-gray-500 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={isEditable ? handleStartEdit : undefined}
      className={`flex items-center gap-1 ${isEditable ? "hover:bg-gray-100 rounded px-1 -mx-1 cursor-pointer group" : ""}`}
      disabled={!isEditable}
    >
      <Clock className="h-4 w-4" />
      <span>
        {formatTime12(hours, minutes)} - {formatTime12(endHours, endMinutes)}
      </span>
      {isEditable && (
        <span className="text-xs text-[#A5744A] opacity-0 group-hover:opacity-100 ml-1">
          edit
        </span>
      )}
    </button>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [otherStatusFilter, setOtherStatusFilter] = useState("ALL");
  const [otherPage, setOtherPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Preferences state
  const [preferredMessaging, setPreferredMessaging] = useState<"SMS" | "WHATSAPP">("SMS");

  // Day assignments for calendar (to compute areas client-side)
  const [dayAssignments, setDayAssignments] = useState<Record<number, DayAssignment | null>>({});

  // Check if selected date is today
  const isToday = (() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return selectedDate === todayStr;
  })();

  // Format the section header based on selected date
  const getSectionHeader = () => {
    if (isToday) {
      return "Today's Appointments";
    }
    const date = new Date(selectedDate + 'T00:00:00');
    return format(date, "MMMM d") + " Appointments";
  };

  // Filter appointments by status for the selected date section
  const filterByStatus = (appts: Appointment[]) => {
    if (statusFilter === "ALL") return appts;
    return appts.filter(apt => apt.status === statusFilter);
  };

  // Filter "Other Appointments" to exclude the selected date
  const otherAppointmentsBase = allAppointments.filter(apt => {
    const aptDateObj = new Date(apt.startAt);
    const aptDate = `${aptDateObj.getFullYear()}-${String(aptDateObj.getMonth() + 1).padStart(2, '0')}-${String(aptDateObj.getDate()).padStart(2, '0')}`;
    return aptDate !== selectedDate;
  });

  // Apply status filter for other appointments
  const otherAppointmentsFiltered = otherStatusFilter === "ALL"
    ? otherAppointmentsBase
    : otherAppointmentsBase.filter(apt => apt.status === otherStatusFilter);

  // Calculate pagination for other appointments
  const totalOtherPages = Math.ceil(otherAppointmentsFiltered.length / ITEMS_PER_PAGE);
  const otherAppointmentsPaginated = otherAppointmentsFiltered.slice(
    (otherPage - 1) * ITEMS_PER_PAGE,
    otherPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  const handleOtherStatusFilterChange = (value: string) => {
    setOtherStatusFilter(value);
    setOtherPage(1);
  };

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  const fetchAllAppointments = useCallback(async () => {
    setIsLoadingAll(true);
    try {
      const response = await fetch("/api/appointments?all=true");
      if (response.ok) {
        const data = await response.json();
        // Sort by date descending (most recent first)
        const sorted = data.appointments.sort(
          (a: Appointment, b: Appointment) =>
            new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
        );
        setAllAppointments(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch all appointments:", error);
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  // Fetch day assignments for calendar area display
  const fetchDayAssignments = useCallback(async () => {
    try {
      const response = await fetch("/api/area-assignments", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Get the first groomer's assignments (single groomer mode)
        const groomerAssignment = data.assignments?.[0];
        if (groomerAssignment?.days) {
          setDayAssignments(groomerAssignment.days);
        }
      }
    } catch (error) {
      console.error("Failed to fetch day assignments:", error);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchAppointments();
    fetchAllAppointments();
  }, [fetchAppointments, fetchAllAppointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  // Fetch day assignments for calendar
  useEffect(() => {
    fetchDayAssignments();
  }, [fetchDayAssignments]);

  // Fetch preferences
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch("/api/dashboard/today");
        if (response.ok) {
          const data = await response.json();
          if (data.preferredMessaging) {
            setPreferredMessaging(data.preferredMessaging);
          }
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    }
    fetchPreferences();
  }, []);

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL_GROOM: "Full Groom 🐕",
      BATH_ONLY: "Bath Only 🛁",
      BATH_BRUSH: "Bath & Brush 🛁",
      NAIL_TRIM: "Nail Trim ✂️",
      FACE_FEET_FANNY: "Tidy Up 🐾",
      DESHED: "De-shed 🪮",
      PUPPY_INTRO: "Puppy Intro 🐶",
      HAND_STRIP: "Hand Stripping 🧤",
      CUSTOM: "Custom ⭐",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      BOOKED: "bg-blue-100 text-blue-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      CONFIRMED: "Scheduled",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      NO_SHOW: "No Show",
      BOOKED: "Booked",
    };
    return labels[status] || status.replace("_", " ");
  };

  const openCancelModal = (appointment: Appointment) => {
    setCancellingAppointment(appointment);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancellingAppointment(null);
  };

  const handleCancelAppointment = async () => {
    if (!cancellingAppointment) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/appointments/${cancellingAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        toast.success("Appointment cancelled successfully");
        closeCancelModal();
        refreshAll();
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("Failed to cancel appointment");
    } finally {
      setIsCancelling(false);
    }
  };

  // Contact handlers
  const handleCall = (phone?: string) => {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleSMS = (phone?: string) => {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    window.location.href = `sms:${phone}`;
  };

  const handleWhatsApp = (phone?: string) => {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/1${cleanPhone}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <Link
          href="/dashboard/appointments/new"
          className="btn h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
        >
          <Plus className="h-5 w-5" />
          New Appointment
        </Link>
      </div>

      {/* Calendar and Status Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <AppointmentCalendar
            selectedDate={new Date(selectedDate + 'T00:00:00')}
            onDateSelect={(date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              setSelectedDate(dateStr);
            }}
            dayAssignments={dayAssignments}
          />
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm h-fit">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-bordered w-full h-12 pl-10"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selected date display */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Selected Date</p>
            <p className="font-semibold text-gray-900">
              {format(new Date(selectedDate + 'T00:00:00'), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Section Header for Selected Date */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        {getSectionHeader()}
        {statusFilter !== "ALL" && (
          <span className="text-sm font-normal text-gray-500">
            ({STATUS_OPTIONS.find(s => s.value === statusFilter)?.label})
          </span>
        )}
      </h2>

      {/* Appointments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filterByStatus(appointments).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isToday ? "Your day is wide open" : "Schedule is clear"}
          </h3>
          <p className="text-gray-600 mb-4">
            {statusFilter !== "ALL"
              ? `No ${STATUS_OPTIONS.find(s => s.value === statusFilter)?.label.toLowerCase()} appointments for ${format(new Date(selectedDate + 'T00:00:00'), "MMMM d, yyyy")}`
              : isToday
                ? "A fresh slate awaits — book some appointments or enjoy a well-deserved break"
                : `Nothing scheduled for ${format(new Date(selectedDate + 'T00:00:00'), "MMMM d, yyyy")} yet`
            }
          </p>
          <Link
            href="/dashboard/appointments/new"
            className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
          >
            <Plus className="h-5 w-5" />
            Schedule Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filterByStatus(appointments).map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {appointment.customer.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                  {appointment.pet && (
                    <p className="text-sm text-gray-600 mb-1">
                      {appointment.pet.species === "cat" ? "🐈" : "🐕"}{" "}
                      {appointment.pet.name}
                      {appointment.pet.breed && (
                        <span className="text-gray-500"> • {appointment.pet.breed}</span>
                      )}
                      {appointment.pet.weight && (
                        <span className="text-gray-500"> • {appointment.pet.weight} lbs</span>
                      )}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {getServiceTypeLabel(appointment.appointmentType)}
                    {appointment.customer.serviceArea && (
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: appointment.customer.serviceArea.color }}
                      >
                        {appointment.customer.serviceArea.name}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    appointment.status === "COMPLETED"
                      ? "text-green-600"
                      : appointment.status === "CANCELLED" || appointment.status === "NO_SHOW"
                        ? "text-red-500"
                        : "text-[#A5744A]"
                  }`}>
                    ${appointment.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <TimeEditor appointment={appointment} onUpdate={refreshAll} />
                {/* Address hidden on mobile to save space */}
                <div className="hidden sm:flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {appointment.customer.address}
                </div>
              </div>

              {/* Action Buttons */}
              {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && appointment.status !== "NO_SHOW" && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                  {/* Contact buttons - Call + Preferred Messaging */}
                  {appointment.customer.phone && (
                    <>
                      <button
                        onClick={() => handleCall(appointment.customer.phone)}
                        className="btn btn-sm h-8 px-3 bg-emerald-600 hover:bg-emerald-700 border-0 text-white gap-1.5"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call
                      </button>
                      {preferredMessaging === "WHATSAPP" ? (
                        <button
                          onClick={() => handleWhatsApp(appointment.customer.phone)}
                          className="btn btn-sm h-8 px-3 bg-[#25D366] hover:bg-[#1da851] border-0 text-white gap-1.5"
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSMS(appointment.customer.phone)}
                          className="btn btn-sm h-8 px-3 bg-emerald-600 hover:bg-emerald-700 border-0 text-white gap-1.5"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          SMS
                        </button>
                      )}
                    </>
                  )}
                  {/* Cancel button */}
                  <button
                    onClick={() => openCancelModal(appointment)}
                    className="btn btn-ghost btn-sm gap-1.5 text-red-600 hover:bg-red-50 ml-auto"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Other Appointments Section */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        {/* Header with Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Other Appointments
            {otherStatusFilter !== "ALL" && (
              <span className="text-sm font-normal text-gray-500">
                ({STATUS_OPTIONS.find(s => s.value === otherStatusFilter)?.label})
              </span>
            )}
          </h2>
          {/* Other Appointments Filter */}
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={otherStatusFilter}
              onChange={(e) => handleOtherStatusFilterChange(e.target.value)}
              className="select select-bordered select-sm w-full pl-9"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoadingAll ? (
          <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : otherAppointmentsFiltered.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {otherStatusFilter !== "ALL" ? "No matches" : "All caught up"}
            </h3>
            <p className="text-gray-600 mb-4">
              {otherStatusFilter !== "ALL"
                ? `No ${STATUS_OPTIONS.find(s => s.value === otherStatusFilter)?.label.toLowerCase()} appointments on other dates`
                : "No upcoming appointments on your calendar — time to fill some slots!"
              }
            </p>
            <Link
              href="/dashboard/appointments/new"
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
            >
              <Plus className="h-5 w-5" />
              Schedule Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {otherAppointmentsPaginated.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {appointment.customer.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    {appointment.pet && (
                      <p className="text-sm text-gray-600 mb-1">
                        {appointment.pet.species === "cat" ? "🐈" : "🐕"}{" "}
                        {appointment.pet.name}
                        {appointment.pet.breed && (
                          <span className="text-gray-500"> • {appointment.pet.breed}</span>
                        )}
                        {appointment.pet.weight && (
                          <span className="text-gray-500"> • {appointment.pet.weight} lbs</span>
                        )}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {getServiceTypeLabel(appointment.appointmentType)}
                      {appointment.customer.serviceArea && (
                        <span
                          className="ml-2 text-xs px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: appointment.customer.serviceArea.color }}
                        >
                          {appointment.customer.serviceArea.name}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">
                      {format(new Date(appointment.startAt), "MMM d, yyyy")}
                    </p>
                    <p className={`font-semibold ${
                      appointment.status === "COMPLETED"
                        ? "text-green-600"
                        : appointment.status === "CANCELLED" || appointment.status === "NO_SHOW"
                          ? "text-red-500"
                          : "text-[#A5744A]"
                    }`}>
                      ${appointment.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <TimeEditor appointment={appointment} onUpdate={refreshAll} />
                  {/* Address hidden on mobile to save space */}
                  <div className="hidden sm:flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {appointment.customer.address}
                  </div>
                </div>

                {/* Action Buttons */}
                {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && appointment.status !== "NO_SHOW" && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                    {/* Contact buttons - Call + Preferred Messaging */}
                    {appointment.customer.phone && (
                      <>
                        <button
                          onClick={() => handleCall(appointment.customer.phone)}
                          className="btn btn-sm h-8 px-3 bg-emerald-600 hover:bg-emerald-700 border-0 text-white gap-1.5"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call
                        </button>
                        {preferredMessaging === "WHATSAPP" ? (
                          <button
                            onClick={() => handleWhatsApp(appointment.customer.phone)}
                            className="btn btn-sm h-8 px-3 bg-[#25D366] hover:bg-[#1da851] border-0 text-white gap-1.5"
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSMS(appointment.customer.phone)}
                            className="btn btn-sm h-8 px-3 bg-emerald-600 hover:bg-emerald-700 border-0 text-white gap-1.5"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            SMS
                          </button>
                        )}
                      </>
                    )}
                    {/* Cancel button */}
                    <button
                      onClick={() => openCancelModal(appointment)}
                      className="btn btn-ghost btn-sm gap-1.5 text-red-600 hover:bg-red-50 ml-auto"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination Controls */}
            {totalOtherPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {((otherPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(otherPage * ITEMS_PER_PAGE, otherAppointmentsFiltered.length)} of {otherAppointmentsFiltered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOtherPage(p => Math.max(1, p - 1))}
                    disabled={otherPage === 1}
                    className="btn btn-sm btn-ghost gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    Page {otherPage} of {totalOtherPages}
                  </span>
                  <button
                    onClick={() => setOtherPage(p => Math.min(totalOtherPages, p + 1))}
                    disabled={otherPage === totalOtherPages}
                    className="btn btn-sm btn-ghost gap-1 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && cancellingAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600 text-sm text-center mb-2">
                Are you sure you want to cancel this appointment with{" "}
                <span className="font-medium">{cancellingAppointment.customer.name}</span>?
              </p>
              {cancellingAppointment.pet && (
                <p className="text-gray-500 text-xs text-center mb-4">
                  {cancellingAppointment.pet.name} • {getServiceTypeLabel(cancellingAppointment.appointmentType)}
                </p>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeCancelModal}
                  className="btn btn-ghost flex-1"
                  disabled={isCancelling}
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancelAppointment}
                  className="btn bg-red-500 hover:bg-red-600 text-white flex-1"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Yes, Cancel"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
